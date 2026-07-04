'use client';

import React, { useRef, useState } from 'react';
import {
  DEFAULT_EDGES,
  DEFAULT_NODES,
  simulateGraph,
  type FreeEdge,
  type FreeNodeData,
  type NodeStat,
  type NodeType,
  type SimResult,
} from '@/lib/simulate-freeform';
import { Canvas } from './Canvas';
import { ResultsSheet } from './ResultsSheet';
import { Header } from '@/components/Header';

function BlockBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-2.5 rounded-lg border border-[#ececef] bg-white px-3 py-2.5 text-left text-[13px] font-medium text-[#62626c] transition-colors hover:border-[#5a5ad6] hover:bg-[#eeeefb] hover:text-[#5a5ad6]"
    >
      <span className="grid h-5 w-5 flex-none place-items-center">{icon}</span>
      {label}
      <svg className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
    </button>
  );
}

export default function ModeladoLibre() {
  const [nodes, setNodes] = useState<FreeNodeData[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<FreeEdge[]>(DEFAULT_EDGES);
  const [horizon, setHorizon] = useState(480);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [result, setResult] = useState<SimResult | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offX: number; offY: number } | null>(null);
  const [connecting, setConnecting] = useState<{ from: string; fromPort?: 'A' | 'B'; x: number; y: number } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const idSeq = useRef(4);
  const runIdx = useRef(0);

  const newId = () => 'n' + idSeq.current++;

  const addNode = (type: NodeType) => {
    const count = nodes.length;
    const x = 80 + (count % 6) * 70;
    const y = 80 + Math.floor(count / 6) * 150;
    let n: FreeNodeData;
    if (type === 'arrival') n = { id: newId(), type, name: 'Llegada', x, y, interarrival: 10 };
    else if (type === 'activity') n = { id: newId(), type, name: 'Actividad', x, y, service: 15, resources: 1 };
    else if (type === 'gateway') n = { id: newId(), type, name: 'Decisión', x, y, splitA: 50 };
    else n = { id: newId(), type: 'end', name: 'Fin', x, y };
    setNodes((prev) => [...prev, n]);
  };

  const clearCanvas = () => {
    setNodes(DEFAULT_NODES);
    setEdges(DEFAULT_EDGES);
    setResult(null);
    setPhase('idle');
    setSheetOpen(false);
    setSheetExpanded(false);
  };

  const run = () => {
    setPhase('running');
    runIdx.current += 1;
    const seedBase = nodes.reduce((a, n, i) => a + (n.service || n.interarrival || n.splitA || 1) * (i + 7), 0) | 0;
    setTimeout(() => {
      setResult(simulateGraph(nodes, edges, horizon, seedBase + runIdx.current * 104729));
      setPhase('done');
      setSheetOpen(true); // el sheet de resultados se abre automáticamente
    }, 900);
  };

  const nodeInfo: Record<string, NodeStat> = {};
  if (result) result.nodeStats.forEach((s) => (nodeInfo[s.id] = s));
  const throughputInfo = result ? result.throughput : {};

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#fbfbfc] font-sans text-[#18181b] antialiased [text-rendering:optimizeLegibility]">
      <Header maxWidth={2600} />

      <div className="relative flex min-h-0 flex-1">
        {/* Sidebar de bloques */}
        <aside className="z-10 flex w-[210px] flex-none flex-col border-r border-[#ececef] bg-white">
          <div className="border-b border-[#ececef] px-4 py-3.5">
            <div className="text-[13px] font-semibold tracking-[-.01em]">Modelado libre</div>
            <div className="mt-0.5 text-[11.5px] text-[#9a9aa4]">Agrega bloques al lienzo</div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <div className="mb-0.5 px-1 text-[11px] font-bold uppercase tracking-[.06em] text-[#9a9aa4]">Bloques</div>
            <BlockBtn onClick={() => addNode('arrival')} label="Llegada" icon={<span className="h-3.5 w-3.5 rounded-full border-[1.5px] border-[#9a9aa4]"></span>} />
            <BlockBtn onClick={() => addNode('activity')} label="Actividad" icon={<span className="h-3.5 w-[18px] rounded-[4px] border-[1.5px] border-[#5a5ad6] bg-[#eeeefb]"></span>} />
            <BlockBtn onClick={() => addNode('gateway')} label="Compuerta" icon={<span className="h-3 w-3 rotate-45 rounded-[2px] border-[1.5px] border-[#5a5ad6]"></span>} />
            <BlockBtn onClick={() => addNode('end')} label="Fin" icon={<span className="grid h-3.5 w-3.5 place-items-center rounded-full border-[1.5px] border-[#62626c]"><span className="h-1.5 w-1.5 rounded-[1px] bg-[#62626c]"></span></span>} />
          </div>
          <div className="mt-auto border-t border-[#ececef] p-3">
            <button
              onClick={clearCanvas}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e1e1e6] bg-white px-3 py-2.5 text-[12.5px] font-medium text-[#62626c] transition-colors hover:border-[#9a9aa4] hover:text-[#18181b]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" /></svg>
              Restaurar plantilla
            </button>
          </div>
        </aside>

        {/* Lienzo a pantalla completa */}
        <div className="relative min-w-0 flex-1">
          <Canvas
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            dragging={dragging}
            setDragging={setDragging}
            connecting={connecting}
            setConnecting={setConnecting}
            nodeInfo={nodeInfo}
            throughputInfo={throughputInfo}
            bottleneckId={result ? result.bottleneckId : null}
          />

          {/* Controles superiores derechos: horizonte + simular */}
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
            {result && !sheetOpen && (
              <button
                onClick={() => setSheetOpen(true)}
                className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-[#e1e1e6] bg-white/90 px-4 text-[13px] font-semibold text-[#62626c] shadow-[0_2px_8px_-2px_rgba(24,24,27,.16)] backdrop-blur transition-colors hover:border-[#5a5ad6] hover:text-[#5a5ad6]"
              >
                Ver resultados
              </button>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-[#e1e1e6] bg-white/90 p-1.5 pl-3 shadow-[0_2px_8px_-2px_rgba(24,24,27,.16)] backdrop-blur">
              <span className="text-[11px] font-semibold uppercase tracking-[.04em] text-[#9a9aa4]">Horizonte</span>
              <div className="flex w-[96px] items-stretch overflow-hidden rounded-lg border border-[#e1e1e6] bg-white">
                <input
                  type="number"
                  step={30}
                  min={30}
                  max={4320}
                  value={horizon}
                  onChange={(e) => setHorizon(Math.max(30, Math.min(4320, parseFloat(e.target.value || '60'))))}
                  className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-2.5 py-1.5 font-mono text-sm font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="grid place-items-center border-l border-[#ececef] bg-[#fafafa] px-2 text-[11px] font-semibold text-[#9a9aa4]">min</span>
              </div>
              <button
                onClick={run}
                disabled={phase === 'running'}
                className="inline-flex h-[38px] items-center justify-center gap-[9px] whitespace-nowrap rounded-lg bg-[#5a5ad6] px-5 text-[13.5px] font-semibold text-white shadow-[0_1px_2px_rgba(74,75,196,.4),inset_0_1px_0_rgba(255,255,255,.16)] transition-colors hover:bg-[#4b4bc4] active:translate-y-px disabled:cursor-default disabled:opacity-70"
              >
                {phase === 'running' ? (
                  <>
                    <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                    Simulando…
                  </>
                ) : (
                  <>
                    <span className="h-0 w-0" style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #fff' }}></span>
                    {result ? 'Ejecutar de nuevo' : 'Ejecutar Simulación'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sheet de resultados (drawer derecho / pantalla completa) */}
        {result && sheetOpen && (
          <ResultsSheet
            result={result}
            nodes={nodes}
            edges={edges}
            runCount={runIdx.current}
            expanded={sheetExpanded}
            onToggleExpand={() => setSheetExpanded((v) => !v)}
            onClose={() => {
              setSheetOpen(false);
              setSheetExpanded(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
