'use client';

import React from 'react';
import type { SimResult, Stage } from '@/lib/simulate-multietapa';
import { exportToExcel, fmt } from '@/lib/simulate-multietapa';

function Kpi({
  label,
  value,
  unit,
  sub,
  util,
  bn,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: string;
  util?: number;
  bn?: boolean;
}) {
  return (
    <div
      className={
        'rounded-xl border p-4 shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)] ' +
        (bn ? 'border-[#ecd3b3] bg-[#fbf1e5]' : 'border-[#ececef] bg-white')
      }
    >
      <div className="flex min-h-8 items-start gap-1.5 text-[11.5px] font-medium text-[#62626c]">
        <span
          className={
            'mt-1 h-2 w-2 flex-none rounded-[3px] border-[1.5px] ' +
            (bn ? 'border-[#c0782d] bg-white' : 'border-[#5a5ad6] bg-[#eeeefb]')
          }
        ></span>
        {label}
      </div>
      <div
        className={
          'mt-2 [font-variant-numeric:tabular-nums] ' +
          (bn ? 'mt-[10px] font-sans text-[21px] font-bold text-[#c0782d]' : 'font-mono text-[27px] font-semibold tracking-[-.025em]')
        }
      >
        {value}
        {unit && <small className="ml-[3px] text-[13px] font-medium text-[#9a9aa4]">{unit}</small>}
      </div>
      {util != null ? (
        <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-[#ececef]">
          <i
            className={'block h-full rounded-full transition-[width] duration-500 ' + (util > 80 ? 'bg-[#c0782d]' : 'bg-[#1f9d57]')}
            style={{ width: Math.min(100, util) + '%' }}
          ></i>
        </div>
      ) : (
        <div className="mt-2 text-[11px] text-[#9a9aa4]">{sub}</div>
      )}
    </div>
  );
}

export function Results({
  result,
  stages,
  interarrival,
  runCount,
}: {
  result: SimResult;
  stages: Stage[];
  interarrival: number;
  runCount: number;
}) {
  const ents = result.ents;

  return (
    <div className="animate-[fadeUp_.45s_cubic-bezier(.4,0,.2,1)_both]">
      <style jsx>{`
        @keyframes fadeUp {
          from { transform: translateY(9px); }
          to { transform: none; }
        }
      `}</style>

      <div className="mb-3.5 mt-7 flex items-center text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">
        03 · Resultados de la simulación
        <button
          onClick={() => exportToExcel(result, stages, interarrival)}
          className="ml-auto inline-flex h-8 items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3 text-xs font-semibold normal-case tracking-normal text-[#62626c] transition-colors hover:border-[#1f9d57] hover:bg-[#e8f6ee] hover:text-[#1f9d57]"
        >
          <span className="relative h-[13px] w-[13px] flex-none rounded-[3px] border-[1.5px] border-current after:absolute after:left-0.5 after:right-0.5 after:top-[5px] after:h-[1.5px] after:bg-current after:shadow-[0_3px_0_currentColor] after:content-['']"></span>
          Exportar a Excel
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3.5">
        <Kpi label="Tiempo promedio de espera" value={fmt(result.avgWait)} unit="min" sub="En colas del proceso" />
        <Kpi label="Tiempo promedio en sistema" value={fmt(result.avgSystem)} unit="min" sub="Llegada → salida" />
        <Kpi label="Entidades procesadas" value={result.completed} sub={`de ${result.arrivalsCount} llegadas`} />
        <Kpi label="Utilización promedio" value={fmt(result.avgUtil, 1)} unit="%" util={result.avgUtil} />
        <Kpi
          label="Cuello de botella"
          value={result.perStage[result.bottleneck].name}
          sub={`${result.perStage[result.bottleneck].util.toFixed(0)}% de utilización`}
          bn
        />
      </div>

      {/* per-activity */}
      <section className="mt-[22px] overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
        <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
          <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Por actividad</span>
          <span className="text-[14.5px] font-semibold tracking-[-.01em]">Desempeño por etapa</span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Actividad', 'T. prom. espera', 'T. prom. servicio', 'Utilización', 'Entidades procesadas'].map((h, i) => (
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
            {result.perStage.map((p, i) => (
              <tr key={i} className={'group ' + (result.bottleneck === i ? 'bg-[#fbf1e5] hover:bg-[#f8edde]' : 'hover:bg-[#fafafb]')}>
                <td className="border-b border-[#ececef] px-[18px] py-3 text-left font-sans text-[13px] font-medium">
                  <span className="inline-flex items-center gap-2.5">
                    <span className="grid h-6 w-6 place-items-center rounded-[7px] border border-[#ececef] bg-[#fafafa] font-mono text-[10px] font-bold text-[#9a9aa4]">
                      {i + 1}
                    </span>
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
      </section>

      {/* events trace */}
      <section className="mt-[22px] overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
        <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
          <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Traza</span>
          <span className="text-[14.5px] font-semibold tracking-[-.01em]">Eventos por entidad</span>
          <span className="ml-auto text-[12.5px] text-[#9a9aa4]">{ents.length} entidades</span>
        </div>
        <div className="max-h-[440px] overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th
                  rowSpan={2}
                  className="sticky left-0 top-0 z-[5] whitespace-nowrap border-b border-r border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]"
                >
                  Entidad
                </th>
                <th
                  rowSpan={2}
                  className="sticky top-0 whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]"
                >
                  Hora llegada
                </th>
                {stages.map((s, i) => (
                  <th
                    key={i}
                    colSpan={2}
                    className={
                      'sticky top-0 z-[3] whitespace-nowrap border-b border-l border-[#ececef] px-3.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[.03em] ' +
                      (result.bottleneck === i ? 'bg-[#fbf1e5] text-[#c0782d]' : 'bg-[#fafafa] text-[#9a9aa4]')
                    }
                  >
                    {s.name}
                  </th>
                ))}
              </tr>
              <tr>
                {stages.map((s, i) => (
                  <React.Fragment key={i}>
                    <th
                      className={
                        'sticky top-[34px] z-[3] whitespace-nowrap border-b border-l border-[#ececef] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] ' +
                        (result.bottleneck === i ? 'bg-[#fbf1e5] text-[#c0782d]' : 'bg-[#fafafa] text-[#9a9aa4]')
                      }
                    >
                      Inicio
                    </th>
                    <th
                      className={
                        'sticky top-[34px] z-[3] whitespace-nowrap border-b border-[#ececef] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] ' +
                        (result.bottleneck === i ? 'bg-[#fbf1e5] text-[#c0782d]' : 'bg-[#fafafa] text-[#9a9aa4]')
                      }
                    >
                      Fin
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {ents.map((e) => (
                <tr key={e.id} className="group hover:[&>td]:bg-[#fafafb]">
                  <td className="sticky left-0 z-[4] whitespace-nowrap border-b border-r border-[#ececef] bg-white px-3.5 py-[9px] text-left font-mono text-[12.5px] [font-variant-numeric:tabular-nums] group-hover:bg-[#fafafb]">
                    <span className="inline-flex items-center gap-2 font-sans font-medium">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#5a5ad6]"></span>
                      Entidad {e.id}
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums]">
                    {fmt(e.arrival)}
                  </td>
                  {e.st.map((x, i) => (
                    <React.Fragment key={i}>
                      <td
                        className={
                          'whitespace-nowrap border-b border-l border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] ' +
                          (result.bottleneck === i ? 'bg-[#fbf1e5]' : '')
                        }
                      >
                        {fmt(x.start)}
                      </td>
                      <td
                        className={
                          'whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] ' +
                          (result.bottleneck === i ? 'bg-[#fbf1e5]' : '')
                        }
                      >
                        {fmt(x.end)}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between border-t border-[#ececef] bg-[#fafafa] px-[18px] py-3 text-xs text-[#9a9aa4]">
          <span>
            {ents.length} entidades · {stages.length} etapas
          </span>
          <span>
            Réplica #{runCount} · horizonte {result.horizon} min
          </span>
        </div>
      </section>
    </div>
  );
}
