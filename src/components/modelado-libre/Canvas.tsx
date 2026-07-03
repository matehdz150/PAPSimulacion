'use client';

import React, { useMemo, useRef } from 'react';
import type { FreeEdge, FreeNodeData, NodeStat, ThroughputInfo } from '@/lib/simulate-freeform';
import { FreeNode } from './FreeNode';
import { dims, portPos } from './layout';

interface Connecting {
  from: string;
  fromPort?: 'A' | 'B';
  x: number;
  y: number;
}

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

  const getLocal = (e: React.PointerEvent) => {
    const el = canvasRef.current!;
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left + el.scrollLeft, y: e.clientY - rect.top + el.scrollTop };
  };

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

  const onCanvasMove = (e: React.PointerEvent) => {
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

  return (
    <div
      ref={canvasRef}
      className="relative h-[560px] overflow-auto"
      style={{ background: 'radial-gradient(circle at 1px 1px, #ededf0 1px, transparent 0) 0 0 / 22px 22px, #fafafa' }}
      onPointerMove={onCanvasMove}
      onPointerUp={onCanvasUp}
      onPointerLeave={() => {
        if (dragging) setDragging(null);
      }}
    >
      <div className="relative h-[980px] w-[1700px]">
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
  );
}
