'use client';

import React, { useMemo, useState } from 'react';
import { exportToExcel, fmt, type SimResult } from '@/lib/simulate-simple';

function Kpi({ label, value, unit, sub, util }: { label: string; value: React.ReactNode; unit?: string; sub?: string; util?: number }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#ececef] bg-white p-4 px-[17px] shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#62626c]">
        <span className="h-2 w-2 flex-none rounded-[3px] border-[1.5px] border-[#5a5ad6] bg-[#eeeefb]"></span>
        {label}
      </div>
      <div className="mt-3 font-mono text-[30px] font-semibold leading-none tracking-[-.025em] [font-variant-numeric:tabular-nums]">
        {value}
        {unit && <small className="ml-[3px] text-sm font-medium tracking-normal text-[#9a9aa4]">{unit}</small>}
      </div>
      {util != null ? (
        <div className="mt-[11px] h-[5px] overflow-hidden rounded-full bg-[#ececef]">
          <i
            className={'block h-full rounded-full transition-[width] duration-500 ' + (util > 85 ? 'bg-[#c08a2d]' : 'bg-[#1f9d57]')}
            style={{ width: Math.min(100, util) + '%' }}
          ></i>
        </div>
      ) : (
        <div className="mt-2 text-[11.5px] text-[#9a9aa4]">{sub}</div>
      )}
    </div>
  );
}

export function Results({ result, runCount }: { result: SimResult; runCount: number }) {
  const [view, setView] = useState<'all' | 'wait'>('all');

  const rows = useMemo(() => {
    if (view === 'wait') return result.rows.filter((r) => r.wait > 0.05);
    return result.rows;
  }, [result, view]);

  const waitClass = (w: number) => (w < 0.05 ? 'text-[#1f9d57]' : w < result.service ? 'text-[#18181b]' : 'text-[#c08a2d]');
  const waitDot = (w: number) => (w < 0.05 ? 'bg-[#1f9d57]' : w < result.service ? 'bg-[#d4d4da]' : 'bg-[#c08a2d]');

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="grid animate-[fadeUp_.45s_cubic-bezier(.4,0,.2,1)_both] grid-cols-4 gap-3.5">
        <style jsx global>{`
          @keyframes fadeUp {
            from { transform: translateY(9px); }
            to { transform: none; }
          }
        `}</style>
        <Kpi label="Tiempo de espera" value={fmt(result.avgWait)} unit="min" sub="Promedio en cola" />
        <Kpi label="Autos atendidos" value={result.served} sub={`de ${result.arrivalsCount} llegadas`} />
        <Kpi label="Utilización mecánico" value={fmt(result.util, 1)} unit="%" util={result.util} />
        <Kpi label="Tiempo en sistema" value={fmt(result.avgSystem)} unit="min" sub="Espera + servicio" />
      </div>

      <section
        className="animate-[fadeUp_.45s_cubic-bezier(.4,0,.2,1)_both] overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]"
        style={{ animationDelay: '.06s' }}
      >
        <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
          <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">03</span>
          <span className="text-[14.5px] font-semibold tracking-[-.01em]">Traza de eventos</span>
          <div className="ml-auto flex items-center text-[12.5px] text-[#9a9aa4]">
            <div className="inline-flex rounded-lg border border-[#ececef] bg-[#fafafa] p-0.5">
              <button
                onClick={() => setView('all')}
                className={
                  'rounded-md px-[11px] py-1 text-xs font-semibold ' +
                  (view === 'all' ? 'bg-white text-[#18181b] shadow-[0_1px_2px_rgba(24,24,27,.04)]' : 'text-[#9a9aa4]')
                }
              >
                Todos
              </button>
              <button
                onClick={() => setView('wait')}
                className={
                  'rounded-md px-[11px] py-1 text-xs font-semibold ' +
                  (view === 'wait' ? 'bg-white text-[#18181b] shadow-[0_1px_2px_rgba(24,24,27,.04)]' : 'text-[#9a9aa4]')
                }
              >
                Con espera
              </button>
            </div>
            <button
              onClick={() => exportToExcel(result)}
              className="ml-2.5 inline-flex h-[30px] items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3 text-xs font-semibold text-[#62626c] transition-colors hover:border-[#1f9d57] hover:bg-[#e8f6ee] hover:text-[#1f9d57]"
            >
              <span className="relative h-[13px] w-[13px] flex-none rounded-[3px] border-[1.5px] border-current after:absolute after:left-0.5 after:right-0.5 after:top-[5px] after:h-[1.5px] after:bg-current after:shadow-[0_3px_0_currentColor] after:content-['']"></span>
              Exportar a Excel
            </button>
          </div>
        </div>

        <div className="max-h-[408px] overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Auto', 'Llegada', 'Inicio servicio', 'Fin servicio', 'Espera'].map((h, i) => (
                  <th
                    key={h}
                    className={
                      'sticky top-0 z-[2] whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-[18px] py-[11px] text-[11px] font-semibold uppercase tracking-[.04em] text-[#9a9aa4] ' +
                      (i === 0 ? 'text-left' : 'text-right')
                    }
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.car} className="hover:[&>td]:bg-[#fafafb]">
                  <td className="border-b border-[#ececef] px-[18px] py-[11px] text-left font-sans text-[13px] font-medium tracking-[-.01em] text-[#18181b]">
                    <span className="inline-flex items-center gap-[9px]">
                      Auto {r.car}
                      <span className="rounded-md border border-[#ececef] bg-[#fafafa] px-[7px] py-0.5 font-mono text-[11px] text-[#62626c]">
                        M{r.mech}
                      </span>
                    </span>
                  </td>
                  <td className="border-b border-[#ececef] px-[18px] py-[11px] text-right font-mono text-[13px] tracking-[-.01em] [font-variant-numeric:tabular-nums]">
                    {fmt(r.arrival)}
                  </td>
                  <td className="border-b border-[#ececef] px-[18px] py-[11px] text-right font-mono text-[13px] tracking-[-.01em] [font-variant-numeric:tabular-nums]">
                    {fmt(r.start)}
                  </td>
                  <td className="border-b border-[#ececef] px-[18px] py-[11px] text-right font-mono text-[13px] tracking-[-.01em] [font-variant-numeric:tabular-nums]">
                    {fmt(r.end)}
                  </td>
                  <td
                    className={
                      'border-b border-[#ececef] px-[18px] py-[11px] text-right font-mono text-[13px] tracking-[-.01em] [font-variant-numeric:tabular-nums] ' +
                      waitClass(r.wait)
                    }
                  >
                    <span className="inline-flex items-center justify-end gap-1.5">
                      <span className={'h-1.5 w-1.5 rounded-full ' + waitDot(r.wait)}></span>
                      {fmt(r.wait)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between border-t border-[#ececef] bg-[#fafafa] px-[18px] py-3 text-xs text-[#9a9aa4]">
          <span>
            Mostrando {rows.length} de {result.rows.length} eventos
          </span>
          <span>
            Réplica #{runCount} · horizonte {result.horizon} min
          </span>
        </div>
      </section>
    </div>
  );
}
