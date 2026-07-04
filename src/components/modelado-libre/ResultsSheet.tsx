'use client';

import React from 'react';
import { exportToExcel, fmt, type FreeEdge, type FreeNodeData, type SimResult } from '@/lib/simulate-freeform';

function Kpi({ label, value, unit, sub, util, bn }: { label: string; value: React.ReactNode; unit?: string; sub?: string; util?: number; bn?: boolean }) {
  return (
    <div className={'rounded-xl border p-3.5 ' + (bn ? 'border-[#ecd3b3] bg-[#fbf1e5]' : 'border-[#ececef] bg-white')}>
      <div className="flex min-h-8 items-start gap-1.5 text-[11.5px] font-medium text-[#62626c]">
        <span className={'mt-1 h-2 w-2 flex-none rounded-[3px] border-[1.5px] ' + (bn ? 'border-[#c0782d] bg-white' : 'border-[#5a5ad6] bg-[#eeeefb]')}></span>
        {label}
      </div>
      <div className={'[font-variant-numeric:tabular-nums] ' + (bn ? 'mt-[10px] font-sans text-[17px] font-bold text-[#c0782d]' : 'mt-2 font-mono text-[24px] font-semibold tracking-[-.025em]')}>
        {value}
        {unit && <small className="ml-[3px] text-[13px] font-medium text-[#9a9aa4]">{unit}</small>}
      </div>
      {util != null ? (
        <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-[#ececef]">
          <i className={'block h-full rounded-full ' + (util > 80 ? 'bg-[#c0782d]' : 'bg-[#1f9d57]')} style={{ width: Math.min(100, util) + '%' }}></i>
        </div>
      ) : (
        sub && <div className="mt-2 text-[11px] text-[#9a9aa4]">{sub}</div>
      )}
    </div>
  );
}

export function ResultsSheet({
  result,
  nodes,
  edges,
  runCount,
  expanded,
  onToggleExpand,
  onClose,
}: {
  result: SimResult;
  nodes: FreeNodeData[];
  edges: FreeEdge[];
  runCount: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}) {
  const shell = expanded
    ? 'fixed inset-0 z-50 flex flex-col bg-[#fbfbfc]'
    : 'flex w-[460px] flex-none flex-col border-l border-[#ececef] bg-[#fbfbfc]';

  return (
    <aside className={shell + ' animate-[sheetIn_.28s_cubic-bezier(.4,0,.2,1)_both]'}>
      <style jsx global>{`
        @keyframes sheetIn { from { opacity: .5; transform: translateX(12px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* Header del sheet */}
      <div className="flex items-center gap-2.5 border-b border-[#ececef] bg-white px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold tracking-[-.01em]">Resultados de la simulación</h2>
          <p className="text-[11.5px] text-[#9a9aa4]">Réplica #{runCount} · horizonte {result.horizon} min</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => exportToExcel(result, nodes, edges)}
            title="Exportar a Excel"
            className="inline-flex h-8 items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3 text-xs font-semibold text-[#62626c] transition-colors hover:border-[#1f9d57] hover:bg-[#e8f6ee] hover:text-[#1f9d57]"
          >
            <span className="relative h-[13px] w-[13px] flex-none rounded-[3px] border-[1.5px] border-current after:absolute after:left-0.5 after:right-0.5 after:top-[5px] after:h-[1.5px] after:bg-current after:shadow-[0_3px_0_currentColor] after:content-['']"></span>
            Excel
          </button>
          <button
            onClick={onToggleExpand}
            aria-label={expanded ? 'Contraer' : 'Pantalla completa'}
            title={expanded ? 'Contraer' : 'Pantalla completa'}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#e1e1e6] bg-white text-[#62626c] transition-colors hover:border-[#5a5ad6] hover:bg-[#eeeefb] hover:text-[#5a5ad6]"
          >
            {expanded ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 9L4 4M9 9V4M9 9H4M15 15l5 5M15 15v5M15 15h5" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
            )}
          </button>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#e1e1e6] bg-white text-[#62626c] transition-colors hover:border-[#9a9aa4] hover:bg-[#fafafa] hover:text-[#18181b]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>

      {/* Cuerpo scrolleable */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className={'grid gap-3 ' + (expanded ? 'grid-cols-5' : 'grid-cols-2')}>
          <Kpi label="Tiempo promedio de espera" value={fmt(result.avgWait)} unit="min" sub="En colas del proceso" />
          <Kpi label="Tiempo promedio en sistema" value={fmt(result.avgSystem)} unit="min" sub="Llegada → salida" />
          <Kpi label="Entidades completadas" value={result.completed} sub={`de ${result.arrivalsCount} generadas`} />
          <Kpi label="Utilización promedio" value={fmt(result.avgUtil, 1)} unit="%" util={result.avgUtil} />
          <Kpi label="Cuello de botella" value={result.bottleneckName} sub={`${fmt(result.bottleneckUtil, 0)}% de utilización`} bn />
        </div>

        {/* Desempeño por bloque */}
        <section className="mt-4 overflow-hidden rounded-xl border border-[#ececef] bg-white">
          <div className="flex items-center gap-2.5 border-b border-[#ececef] px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Por bloque</span>
            <span className="text-[13.5px] font-semibold tracking-[-.01em]">Desempeño de las actividades</span>
            <span className="ml-auto text-[12px] text-[#9a9aa4]">{result.nodeStats.length} actividades</span>
          </div>
          {result.nodeStats.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-[#9a9aa4]">
              El modelo no tiene bloques de actividad con recursos, así que no hay utilización que reportar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Bloque', 'T. prom. espera', 'T. prom. servicio', 'Utilización', 'Procesadas'].map((h, i) => (
                      <th key={h} className={'whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-3.5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[.04em] text-[#9a9aa4] ' + (i === 0 ? 'text-left' : 'text-right')}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.nodeStats.map((p) => (
                    <tr key={p.id} className={result.bottleneckId === p.id ? 'bg-[#fbf1e5]' : 'hover:[&>td]:bg-[#fafafb]'}>
                      <td className="border-b border-[#ececef] px-3.5 py-2.5 text-left font-sans text-[12.5px] font-medium">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-[9px] w-[9px] flex-none rounded-[3px] bg-[#5a5ad6]"></span>
                          {p.name}
                        </span>
                      </td>
                      <td className="border-b border-[#ececef] px-3.5 py-2.5 text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">{fmt(p.avgWait)} min</td>
                      <td className="border-b border-[#ececef] px-3.5 py-2.5 text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">{fmt(p.avgSvc)} min</td>
                      <td className="border-b border-[#ececef] px-3.5 py-2.5 text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">
                        <span className="inline-flex items-center justify-end gap-2">
                          <span className="h-[5px] w-[48px] overflow-hidden rounded-full bg-[#ececef]">
                            <i className={'block h-full ' + (p.util > 80 ? 'bg-[#c0782d]' : 'bg-[#1f9d57]')} style={{ width: Math.min(100, p.util) + '%' }}></i>
                          </span>
                          {fmt(p.util, 1)}%
                        </span>
                      </td>
                      <td className="border-b border-[#ececef] px-3.5 py-2.5 text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">{p.processed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Traza de entidades */}
        <section className="mt-4 overflow-hidden rounded-xl border border-[#ececef] bg-white">
          <div className="flex items-center gap-2.5 border-b border-[#ececef] px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Traza</span>
            <span className="text-[13.5px] font-semibold tracking-[-.01em]">Recorrido por entidad</span>
            <span className="ml-auto text-[12px] text-[#9a9aa4]">{result.entities.length} entidades</span>
          </div>
          <div className={'overflow-auto ' + (expanded ? 'max-h-[60vh]' : 'max-h-[340px]')}>
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {['Entidad', 'Origen', 'Llegada', 'Fin', 'En sistema', 'Espera total', 'Recorrido'].map((h, i) => (
                    <th key={h} className={'sticky top-0 z-[3] whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4] ' + (i === 0 || i === 6 ? 'text-left' : 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.entities.map((e) => {
                  const path = e.visits.map((v) => `${v.node} (${fmt(v.start)}→${fmt(v.end)})`).join('  →  ') || '—';
                  return (
                    <tr key={e.id} className="group hover:[&>td]:bg-[#fafafb]">
                      <td className="whitespace-nowrap border-b border-[#ececef] px-3 py-2 text-left font-sans text-[12px] font-medium">
                        <span className="inline-flex items-center gap-2">
                          <span className={'h-[7px] w-[7px] rounded-full ' + (e.completed ? 'bg-[#1f9d57]' : 'bg-[#c0782d]')}></span>
                          Entidad {e.id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap border-b border-[#ececef] px-3 py-2 text-right font-sans text-[12px] text-[#62626c]">{e.originName}</td>
                      <td className="whitespace-nowrap border-b border-[#ececef] px-3 py-2 text-right font-mono text-[12px] [font-variant-numeric:tabular-nums]">{fmt(e.arrivalTime)}</td>
                      <td className="whitespace-nowrap border-b border-[#ececef] px-3 py-2 text-right font-mono text-[12px] [font-variant-numeric:tabular-nums]">{e.endTime != null ? fmt(e.endTime) : '—'}</td>
                      <td className="whitespace-nowrap border-b border-[#ececef] px-3 py-2 text-right font-mono text-[12px] [font-variant-numeric:tabular-nums]">{e.completed ? fmt(e.endTime! - e.arrivalTime) : '—'}</td>
                      <td className="whitespace-nowrap border-b border-[#ececef] px-3 py-2 text-right font-mono text-[12px] [font-variant-numeric:tabular-nums]">{e.completed ? fmt(e.totalWait ?? 0) : '—'}</td>
                      <td className="border-b border-[#ececef] px-3 py-2 text-left font-sans text-[11.5px] text-[#62626c]">{path}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#ececef] bg-[#fafafa] px-4 py-2.5 text-[11.5px] text-[#9a9aa4]">
            {result.completed} completadas · {result.entities.length} generadas
          </div>
        </section>
      </div>
    </aside>
  );
}
