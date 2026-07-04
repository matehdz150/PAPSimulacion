'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FreeEdge, FreeNodeData, NodeStat, ThroughputInfo } from '@/lib/simulate-freeform';
import { FreeNode } from './FreeNode';
import { dims, portPos } from './layout';

interface Connecting {
  from: string;
  fromPort?: 'A' | 'B';
  x: number;
  y: number;
}

interface View {
  x: number;
  y: number;
  k: number;
}

const MIN_K = 0.35;
const MAX_K = 2.5;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function Canvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  dragging,
  setDragging,
  connecting,
  setConnecting,
  nodeInfo,
  throughputInfo,
  bottleneckId,
}: {
  nodes: FreeNodeData[];
  edges: FreeEdge[];
  setNodes: React.Dispatch<React.SetStateAction<FreeNodeData[]>>;
  setEdges: React.Dispatch<React.SetStateAction<FreeEdge[]>>;
  dragging: { id: string; offX: number; offY: number } | null;
  setDragging: (d: { id: string; offX: number; offY: number } | null) => void;
  connecting: Connecting | null;
  setConnecting: React.Dispatch<React.SetStateAction<Connecting | null>>;
  nodeInfo: Record<string, NodeStat>;
  throughputInfo: Record<string, ThroughputInfo>;
  bottleneckId: string | null;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nodesById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const [panning, setPanning] = useState(false);
  const panRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  // Pantalla -> coordenadas del mundo (considera pan + zoom)
  const getLocal = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - view.x) / view.k,
      y: (e.clientY - rect.top - view.y) / view.k,
    };
  };

  // Zoom hacia un punto de pantalla (cx, cy)
  const zoomAt = (factor: number, cx: number, cy: number) =>
    setView((v) => {
      const k = clamp(v.k * factor, MIN_K, MAX_K);
      const wx = (cx - v.x) / v.k;
      const wy = (cy - v.y) / v.k;
      return { k, x: cx - wx * k, y: cy - wy * k };
    });

  const zoomButton = (factor: number) => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    zoomAt(factor, r.width / 2, r.height / 2);
  };

  const resetView = () => setView({ x: 0, y: 0, k: 1 });

  // Ajustar la vista para encuadrar todos los bloques
  const fitView = () => {
    const el = canvasRef.current;
    if (!el) return;
    if (nodes.length === 0) return resetView();
    const r = el.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const { w, h } = dims(n);
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + w);
      maxY = Math.max(maxY, n.y + h + 70); // margen por etiquetas debajo del bloque
    }
    const pad = 90;
    const cw = Math.max(1, maxX - minX), ch = Math.max(1, maxY - minY);
    const k = clamp(Math.min((r.width - pad * 2) / cw, (r.height - pad * 2) / ch), MIN_K, MAX_K);
    const x = (r.width - cw * k) / 2 - minX * k;
    const y = (r.height - ch * k) / 2 - minY * k;
    setView({ x, y, k });
  };

  // Rueda / pinch del trackpad -> zoom (listener nativo no-pasivo para poder preventDefault)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.0015);
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      setView((v) => {
        const k = clamp(v.k * factor, MIN_K, MAX_K);
        const wx = (cx - v.x) / v.k;
        const wy = (cy - v.y) / v.k;
        return { k, x: cx - wx * k, y: cy - wy * k };
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const onDragStart = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const local = getLocal(e);
    const n = nodes.find((x) => x.id === id)!;
    setDragging({ id, offX: local.x - n.x, offY: local.y - n.y });
  };

  const onPortDown = (nodeId: string, port: 'out' | 'A' | 'B') => {
    setConnecting({ from: nodeId, fromPort: port === 'out' ? undefined : port, x: 0, y: 0 });
  };

  const nodeAt = (x: number, y: number): FreeNodeData | null => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const { w, h } = dims(n);
      if (x >= n.x && x <= n.x + w && y >= n.y && y <= n.y + h) return n;
    }
    return null;
  };

  const onCanvasDown = (e: React.PointerEvent) => {
    if (dragging || connecting) return;
    if ((e.target as HTMLElement).closest('[data-fnode]')) return; // clic sobre un nodo -> no paneamos
    panRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    setPanning(true);
  };

  const onCanvasMove = (e: React.PointerEvent) => {
    if (panning && panRef.current) {
      const p = panRef.current;
      setView((v) => ({ ...v, x: p.vx + (e.clientX - p.x), y: p.vy + (e.clientY - p.y) }));
      return;
    }
    const local = getLocal(e);
    if (dragging) {
      setNodes((prev) =>
        prev.map((n) => (n.id === dragging.id ? { ...n, x: Math.max(0, local.x - dragging.offX), y: Math.max(0, local.y - dragging.offY) } : n))
      );
    } else if (connecting) {
      setConnecting((c) => (c ? { ...c, x: local.x, y: local.y } : c));
    }
  };

  const onCanvasUp = (e: React.PointerEvent) => {
    if (panning) {
      setPanning(false);
      panRef.current = null;
    }
    if (connecting) {
      const local = getLocal(e);
      const target = nodeAt(local.x, local.y);
      if (target && target.id !== connecting.from && target.type !== 'arrival') {
        setEdges((prev) => {
          const filtered = prev.filter((ed) => !(ed.from === connecting.from && ed.fromPort === connecting.fromPort));
          return [...filtered, { id: 'e' + Date.now() + Math.round(Math.random() * 999), from: connecting.from, fromPort: connecting.fromPort, to: target.id }];
        });
      }
      setConnecting(null);
    }
    if (dragging) setDragging(null);
  };

  const removeEdge = (id: string) => setEdges((prev) => prev.filter((e) => e.id !== id));
  const updateNode = (id: string, patch: Partial<FreeNodeData>) => setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
  };
  const duplicateNode = (id: string) => {
    const src = nodes.find((n) => n.id === id);
    if (!src) return;
    setNodes((prev) => [...prev, { ...src, id: 'n' + Date.now() + Math.round(Math.random() * 999), name: src.name + ' copia', x: src.x + 36, y: src.y + 36 }]);
  };

  const gridSize = 22 * view.k;

  return (
    <div
      ref={canvasRef}
      className={'relative h-full w-full touch-none overflow-hidden ' + (panning ? 'cursor-grabbing' : 'cursor-grab')}
      style={{
        background: `radial-gradient(circle at 1px 1px, #ededf0 1px, transparent 0) ${view.x}px ${view.y}px / ${gridSize}px ${gridSize}px, #fafafa`,
      }}
      onPointerDown={onCanvasDown}
      onPointerMove={onCanvasMove}
      onPointerUp={onCanvasUp}
      onPointerLeave={() => {
        if (dragging) setDragging(null);
        if (panning) {
          setPanning(false);
          panRef.current = null;
        }
      }}
    >
      {/* Mundo transformado (pan + zoom) */}
      <div
        className="absolute left-0 top-0 h-[1px] w-[1px] origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
      >
        <div className="relative h-[1600px] w-[2600px]">
          <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible">
            <defs>
              <marker id="fmArw" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L8,4.5 L0,9 z" fill="#b9bac1" />
              </marker>
              <marker id="fmArwA" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L8,4.5 L0,9 z" fill="#5a5ad6" />
              </marker>
              <marker id="fmArwB" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L8,4.5 L0,9 z" fill="#2f9b8e" />
              </marker>
            </defs>
            {edges.map((ed) => {
              const fromNode = nodesById[ed.from],
                toNode = nodesById[ed.to];
              if (!fromNode || !toNode) return null;
              const sp = portPos(fromNode, fromNode.type === 'gateway' ? ed.fromPort || 'A' : 'out');
              const tp = portPos(toNode, 'in');
              const color = ed.fromPort === 'A' ? '#5a5ad6' : ed.fromPort === 'B' ? '#2f9b8e' : '#b9bac1';
              const marker = ed.fromPort === 'A' ? 'url(#fmArwA)' : ed.fromPort === 'B' ? 'url(#fmArwB)' : 'url(#fmArw)';
              const d = `M ${sp.x},${sp.y} C ${sp.x + 70},${sp.y} ${tp.x - 70},${tp.y} ${tp.x},${tp.y}`;
              return (
                <g key={ed.id} style={{ pointerEvents: 'auto' }}>
                  <path d={d} stroke="transparent" strokeWidth={14} fill="none" className="cursor-pointer" onClick={() => removeEdge(ed.id)} />
                  <path d={d} stroke={color} strokeWidth={2} fill="none" markerEnd={marker} style={{ pointerEvents: 'none' }} />
                </g>
              );
            })}
            {connecting &&
              (() => {
                const fromNode = nodesById[connecting.from];
                if (!fromNode) return null;
                const sp = portPos(fromNode, connecting.fromPort || 'out');
                const d = `M ${sp.x},${sp.y} C ${sp.x + 70},${sp.y} ${connecting.x - 70},${connecting.y} ${connecting.x},${connecting.y}`;
                return <path d={d} stroke="#9a9aa4" strokeDasharray="5 4" strokeWidth={2} fill="none" />;
              })()}
          </svg>

          {nodes.map((n) => (
            <FreeNode
              key={n.id}
              node={n}
              onDragStart={onDragStart}
              onPortDown={onPortDown}
              onUpdate={updateNode}
              onDelete={deleteNode}
              onDuplicate={duplicateNode}
              info={n.type === 'activity' ? nodeInfo[n.id] : throughputInfo[n.id]}
              isBottleneck={bottleneckId === n.id}
            />
          ))}
        </div>
      </div>

      {/* Controles de zoom */}
      <div
        className="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-xl border border-[#e1e1e6] bg-white/90 p-1 shadow-[0_2px_8px_-2px_rgba(24,24,27,.16)] backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => zoomButton(1 / 1.2)}
          aria-label="Alejar"
          title="Alejar"
          className="grid h-8 w-8 place-items-center rounded-lg text-[#62626c] transition-colors hover:bg-[#f0f0f3] hover:text-[#18181b]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14" /></svg>
        </button>
        <button
          onClick={resetView}
          title="Restablecer vista (100%)"
          className="min-w-[52px] rounded-lg px-2 py-1 text-center font-mono text-[12px] font-semibold text-[#62626c] transition-colors hover:bg-[#f0f0f3] hover:text-[#18181b]"
        >
          {Math.round(view.k * 100)}%
        </button>
        <button
          onClick={() => zoomButton(1.2)}
          aria-label="Acercar"
          title="Acercar"
          className="grid h-8 w-8 place-items-center rounded-lg text-[#62626c] transition-colors hover:bg-[#f0f0f3] hover:text-[#18181b]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        <div className="mx-0.5 h-5 w-px bg-[#ececef]"></div>
        <button
          onClick={fitView}
          aria-label="Ajustar al contenido"
          title="Ajustar al contenido"
          className="grid h-8 w-8 place-items-center rounded-lg text-[#62626c] transition-colors hover:bg-[#f0f0f3] hover:text-[#18181b]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
