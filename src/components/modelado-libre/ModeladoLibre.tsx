'use client';

import React, { useRef, useState } from 'react';
import {
  DEFAULT_EDGES,
  DEFAULT_NODES,
  exportToExcel,
  fmt,
  simulateGraph,
  type FreeEdge,
  type FreeNodeData,
  type NodeType,
  type SimResult,
} from '@/lib/simulate-freeform';
import { Canvas } from './Canvas';
import { Header } from '@/components/Header';

function Kpi({ label, value, unit, sub, util, bn }: { label: string; value: React.ReactNode; unit?: string; sub?: string; util?: number; bn?: boolean }) {
  return (
    <div
      className={
        'rounded-xl border p-4 shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)] ' +
        (bn ? 'border-[#ecd3b3] bg-[#fbf1e5]' : 'border-[#ececef] bg-white')
      }
    >
      <div className="flex min-h-8 items-start gap-1.5 text-[11.5px] font-medium text-[#62626c]">
        <span className={'mt-1 h-2 w-2 flex-none rounded-[3px] border-[1.5px] ' + (bn ? 'border-[#c0782d] bg-white' : 'border-[#5a5ad6] bg-[#eeeefb]')}></span>
        {label}
      </div>
      <div className={'[font-variant-numeric:tabular-nums] ' + (bn ? 'mt-[10px] font-sans text-[19px] font-bold text-[#c0782d]' : 'mt-2 font-mono text-[27px] font-semibold tracking-[-.025em]')}>
        {value}
        {unit && <small className="ml-[3px] text-[13px] font-medium text-[#9a9aa4]">{unit}</small>}
      </div>
      {util != null ? (
        <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-[#ececef]">
          <i className={'block h-full rounded-full transition-[width] duration-500 ' + (util > 80 ? 'bg-[#c0782d]' : 'bg-[#1f9d57]')} style={{ width: Math.min(100, util) + '%' }}></i>
        </div>
      ) : (
        sub && <div className="mt-2 text-[11px] text-[#9a9aa4]">{sub}</div>
      )}
    </div>
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
  const idSeq = useRef(4);
  const runIdx = useRef(0);

  const newId = () => 'n' + idSeq.current++;

  const addNode = (type: NodeType) => {
    const count = nodes.length;
    const x = 60 + (count % 6) * 70;
    const y = 60 + Math.floor(count / 6) * 140;
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
  };

  const run = () => {
    setPhase('running');
    runIdx.current += 1;
    const seedBase = nodes.reduce((a, n, i) => a + (n.service || n.interarrival || n.splitA || 1) * (i + 7), 0) | 0;
    setTimeout(() => {
      setResult(simulateGraph(nodes, edges, horizon, seedBase + runIdx.current * 104729));
      setPhase('done');
    }, 900);
  };

  const nodeInfo: Record<string, any> = {};
  if (result) result.nodeStats.forEach((s) => (nodeInfo[s.id] = s));
  const throughputInfo = result ? result.throughput : {};

  return (
    <div className="min-h-screen bg-[#fbfbfc] font-sans text-[#18181b] antialiased [text-rendering:optimizeLegibility]">
      <Header maxWidth={1360} />

      <main className="mx-auto max-w-[1360px] px-7 pb-[90px] pt-[30px]">
        <div className="mb-6">
          <h1 className="text-[23px] font-bold tracking-[-.02em]">Modelado libre — Construye tu propio proceso</h1>
          <p className="mt-1 max-w-[780px] text-sm text-[#62626c]">
            Arrastra bloques al lienzo, conéctalos desde sus puertos y ejecuta una simulación de eventos discretos sobre el grafo que definas:
            cualquier combinación de llegadas, actividades con recursos y compuertas de decisión.
          </p>
        </div>

        <section className="mb-[22px] rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#ececef] px-5 py-3.5">
            <button
              onClick={() => addNode('arrival')}
              className="inline-flex h-8 items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3.5 text-[12.5px] font-medium text-[#62626c] transition-colors hover:border-[#5a5ad6] hover:bg-[#eeeefb] hover:text-[#5a5ad6]"
            >
              <span className="h-[9px] w-[9px] flex-none rounded-[3px] bg-[#9a9aa4]"></span>Llegada
            </button>
            <button
              onClick={() => addNode('activity')}
              className="inline-flex h-8 items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3.5 text-[12.5px] font-medium text-[#62626c] transition-colors hover:border-[#5a5ad6] hover:bg-[#eeeefb] hover:text-[#5a5ad6]"
            >
              <span className="h-[9px] w-[9px] flex-none rounded-[3px] bg-[#5a5ad6]"></span>Actividad
            </button>
            <button
              onClick={() => addNode('gateway')}
              className="inline-flex h-8 items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3.5 text-[12.5px] font-medium text-[#62626c] transition-colors hover:border-[#5a5ad6] hover:bg-[#eeeefb] hover:text-[#5a5ad6]"
            >
              <span className="h-[9px] w-[9px] flex-none rounded-[3px] bg-[#5a5ad6]"></span>Compuerta
            </button>
            <button
              onClick={() => addNode('end')}
              className="inline-flex h-8 items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3.5 text-[12.5px] font-medium text-[#62626c] transition-colors hover:border-[#5a5ad6] hover:bg-[#eeeefb] hover:text-[#5a5ad6]"
            >
              <span className="h-[9px] w-[9px] flex-none rounded-[3px] bg-[#62626c]"></span>Fin
            </button>
            <span className="ml-auto text-[11.5px] text-[#9a9aa4]">
              Arrastra desde el punto de salida de un bloque hasta otro para conectarlos · clic en una conexión para eliminarla
            </span>
          </div>

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

          <div className="flex flex-wrap items-center gap-4 border-t border-[#ececef] bg-[#fafafa] px-5 py-4">
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[.04em] text-[#9a9aa4]">Horizonte</div>
              <div className="flex w-[130px] items-stretch overflow-hidden rounded-lg border border-[#e1e1e6] bg-white">
                <input
                  type="number"
                  step={30}
                  min={30}
                  max={4320}
                  value={horizon}
                  onChange={(e) => setHorizon(Math.max(30, Math.min(4320, parseFloat(e.target.value || '60'))))}
                  className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-2.5 py-2 font-mono text-sm font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="grid place-items-center border-l border-[#ececef] bg-[#fafafa] px-2.5 text-[11px] font-semibold text-[#9a9aa4]">min</span>
              </div>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={clearCanvas}
              className="h-[42px] rounded-[9px] border border-[#e1e1e6] bg-white px-[18px] text-[13px] font-medium text-[#62626c] transition-colors hover:border-[#9a9aa4] hover:bg-white hover:text-[#18181b]"
            >
              Restaurar plantilla
            </button>
            <button
              onClick={run}
              disabled={phase === 'running'}
              className="inline-flex h-[42px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[9px] bg-[#5a5ad6] px-6 text-[13.5px] font-semibold text-white shadow-[0_1px_2px_rgba(74,75,196,.4),inset_0_1px_0_rgba(255,255,255,.16)] transition-colors hover:bg-[#4b4bc4] active:translate-y-px disabled:cursor-default disabled:opacity-70"
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
        </section>

        {!result ? (
          <div className="grid min-h-[220px] place-items-center rounded-xl border border-dashed border-[#e1e1e6] bg-white text-center">
            <div>
              <div className="mx-auto mb-4 grid h-[46px] w-[46px] place-items-center rounded-xl border border-[#ececef] bg-[#fafafa]">
                <i className="h-3.5 w-3.5 rounded-[4px] border-2 border-[#9a9aa4]"></i>
              </div>
              <h3 className="text-[15px] font-semibold">Sin resultados todavía</h3>
              <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] text-[#9a9aa4]">
                Arma tu modelo con bloques y conexiones, luego pulsa <b className="font-semibold">Ejecutar Simulación</b> para ver los indicadores.
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-[fadeUp_.45s_cubic-bezier(.4,0,.2,1)_both]">
            <style jsx global>{`
              @keyframes fadeUp {
                from { transform: translateY(9px); }
                to { transform: none; }
              }
            `}</style>
            <div className="mb-3.5 mt-7 flex items-center text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">
              Resultados de la simulación
              <button
                onClick={() => exportToExcel(result)}
                className="ml-auto inline-flex h-8 items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3 text-xs font-semibold normal-case tracking-normal text-[#62626c] transition-colors hover:border-[#1f9d57] hover:bg-[#e8f6ee] hover:text-[#1f9d57]"
              >
                <span className="relative h-[13px] w-[13px] flex-none rounded-[3px] border-[1.5px] border-current after:absolute after:left-0.5 after:right-0.5 after:top-[5px] after:h-[1.5px] after:bg-current after:shadow-[0_3px_0_currentColor] after:content-['']"></span>
                Exportar a Excel
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3.5">
              <Kpi label="Tiempo promedio de espera" value={fmt(result.avgWait)} unit="min" sub="En colas del proceso" />
              <Kpi label="Tiempo promedio en sistema" value={fmt(result.avgSystem)} unit="min" sub="Llegada → salida" />
              <Kpi label="Entidades completadas" value={result.completed} sub={`de ${result.arrivalsCount} generadas`} />
              <Kpi label="Utilización promedio" value={fmt(result.avgUtil, 1)} unit="%" util={result.avgUtil} />
              <Kpi label="Cuello de botella" value={result.bottleneckName} sub={`${fmt(result.bottleneckUtil, 0)}% de utilización`} bn />
            </div>

            {/* Desempeño por bloque */}
            <section className="mt-[22px] overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
              <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
                <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Por bloque</span>
                <span className="text-[14.5px] font-semibold tracking-[-.01em]">Desempeño de las actividades</span>
                <span className="ml-auto text-[12.5px] text-[#9a9aa4]">{result.nodeStats.length} actividades</span>
              </div>
              {result.nodeStats.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] text-[#9a9aa4]">
                  El modelo no tiene bloques de actividad con recursos, así que no hay utilización que reportar.
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {['Bloque', 'T. prom. espera', 'T. prom. servicio', 'Utilización', 'Procesadas'].map((h, i) => (
                        <th
                          key={h}
                          className={
                            'whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-[18px] py-[11px] text-[11px] font-semibold uppercase tracking-[.04em] text-[#9a9aa4] ' +
                            (i === 0 ? 'text-left' : 'text-right')
                          }
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.nodeStats.map((p) => (
                      <tr
                        key={p.id}
                        className={result.bottleneckId === p.id ? 'bg-[#fbf1e5] hover:bg-[#f8edde]' : 'hover:[&>td]:bg-[#fafafb]'}
                      >
                        <td className="border-b border-[#ececef] px-[18px] py-3 text-left font-sans text-[13px] font-medium">
                          <span className="inline-flex items-center gap-2.5">
                            <span className="h-[9px] w-[9px] flex-none rounded-[3px] bg-[#5a5ad6]"></span>
                            {p.name}
                          </span>
                        </td>
                        <td className="border-b border-[#ececef] px-[18px] py-3 text-right font-mono text-[13px] [font-variant-numeric:tabular-nums]">
                          {fmt(p.avgWait)} min
                        </td>
                        <td className="border-b border-[#ececef] px-[18px] py-3 text-right font-mono text-[13px] [font-variant-numeric:tabular-nums]">
                          {fmt(p.avgSvc)} min
                        </td>
                        <td className="border-b border-[#ececef] px-[18px] py-3 text-right font-mono text-[13px] [font-variant-numeric:tabular-nums]">
                          <span className="inline-flex items-center justify-end gap-2">
                            <span className="h-[5px] w-[54px] overflow-hidden rounded-full bg-[#ececef]">
                              <i
                                className={'block h-full ' + (p.util > 80 ? 'bg-[#c0782d]' : 'bg-[#1f9d57]')}
                                style={{ width: Math.min(100, p.util) + '%' }}
                              ></i>
                            </span>
                            {fmt(p.util, 1)}%
                          </span>
                        </td>
                        <td className="border-b border-[#ececef] px-[18px] py-3 text-right font-mono text-[13px] [font-variant-numeric:tabular-nums]">
                          {p.processed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Traza de entidades */}
            <section className="mt-[22px] overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
              <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
                <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Traza</span>
                <span className="text-[14.5px] font-semibold tracking-[-.01em]">Recorrido por entidad</span>
                <span className="ml-auto text-[12.5px] text-[#9a9aa4]">{result.entities.length} entidades</span>
              </div>
              <div className="max-h-[440px] overflow-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      {['Entidad', 'Origen', 'Llegada', 'Fin', 'En sistema', 'Espera total', 'Recorrido'].map((h, i) => (
                        <th
                          key={h}
                          className={
                            'sticky top-0 z-[3] whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4] ' +
                            (i === 0 ? 'text-left' : i === 6 ? 'text-left' : 'text-right')
                          }
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.entities.map((e) => {
                      const path = e.visits.map((v) => v.node).join(' → ') || '—';
                      return (
                        <tr key={e.id} className="group hover:[&>td]:bg-[#fafafb]">
                          <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-left font-sans text-[12.5px] font-medium">
                            <span className="inline-flex items-center gap-2">
                              <span className={'h-[7px] w-[7px] rounded-full ' + (e.completed ? 'bg-[#1f9d57]' : 'bg-[#c0782d]')}></span>
                              Entidad {e.id}
                            </span>
                          </td>
                          <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-sans text-[12.5px] text-[#62626c]">
                            {e.originName}
                          </td>
                          <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">
                            {fmt(e.arrivalTime)}
                          </td>
                          <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">
                            {e.endTime != null ? fmt(e.endTime) : '—'}
                          </td>
                          <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">
                            {e.completed ? fmt(e.endTime! - e.arrivalTime) : '—'}
                          </td>
                          <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">
                            {e.completed ? fmt(e.totalWait ?? 0) : '—'}
                          </td>
                          <td className="border-b border-[#ececef] px-3.5 py-[9px] text-left font-sans text-[12px] text-[#62626c]">
                            {path}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between border-t border-[#ececef] bg-[#fafafa] px-[18px] py-3 text-xs text-[#9a9aa4]">
                <span>
                  {result.completed} completadas · {result.entities.length} generadas
                </span>
                <span>
                  Réplica #{runIdx.current} · horizonte {result.horizon} min
                </span>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
