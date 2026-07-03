'use client';

import React from 'react';
import type { DecisionConfig, SimResult } from '@/lib/simulate-decision';
import { exportToExcel, fmt } from '@/lib/simulate-decision';

function Kpi({
  label,
  value,
  unit,
  sub,
  util,
  bn,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  unit?: string;
  sub?: string;
  util?: number;
  bn?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={
        'rounded-xl border p-[14px_15px] shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)] ' +
        (bn ? 'border-[#ecd3b3] bg-[#fbf1e5]' : 'border-[#ececef] bg-white')
      }
    >
      <div className="flex min-h-[30px] items-start gap-1.5 text-[11px] font-medium leading-[1.3] text-[#62626c]">
        <span
          className={
            'mt-[3px] h-2 w-2 flex-none rounded-[3px] border-[1.5px] ' +
            (bn ? 'border-[#c0782d] bg-white' : 'border-[#5a5ad6] bg-[#eeeefb]')
          }
        ></span>
        {label}
      </div>
      {children ? (
        children
      ) : (
        <div
          className={
            '[font-variant-numeric:tabular-nums] ' +
            (bn
              ? 'mt-[9px] font-sans text-[16px] font-bold leading-[1.25] text-[#c0782d]'
              : 'mt-2 font-mono text-[25px] font-semibold tracking-[-.025em]')
          }
        >
          {value}
          {unit && <small className="ml-0.5 text-xs font-medium text-[#9a9aa4]">{unit}</small>}
        </div>
      )}
      {util != null ? (
        <div className="mt-[9px] h-[5px] overflow-hidden rounded-full bg-[#ececef]">
          <i
            className={'block h-full rounded-full transition-[width] duration-500 ' + (util > 80 ? 'bg-[#c0782d]' : 'bg-[#1f9d57]')}
            style={{ width: Math.min(100, util) + '%' }}
          ></i>
        </div>
      ) : (
        sub && <div className="mt-2 text-[11px] text-[#9a9aa4]">{sub}</div>
      )}
    </div>
  );
}

export function Results({ result, cfg, runCount }: { result: SimResult; cfg: DecisionConfig; runCount: number }) {
  const ents = result.ents;

  return (
    <div className="animate-[fadeUp_.45s_cubic-bezier(.4,0,.2,1)_both]">
      <style jsx global>{`
        @keyframes fadeUp {
          from { transform: translateY(9px); }
          to { transform: none; }
        }
      `}</style>

      <div className="mb-3.5 mt-7 flex items-center text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">
        03 · Resultados de la simulación
        <button
          onClick={() => exportToExcel(result, cfg)}
          className="ml-auto inline-flex h-8 items-center gap-[7px] rounded-lg border border-[#e1e1e6] bg-white px-3 text-xs font-semibold normal-case tracking-normal text-[#62626c] transition-colors hover:border-[#1f9d57] hover:bg-[#e8f6ee] hover:text-[#1f9d57]"
        >
          <span className="relative h-[13px] w-[13px] flex-none rounded-[3px] border-[1.5px] border-current after:absolute after:left-0.5 after:right-0.5 after:top-[5px] after:h-[1.5px] after:bg-current after:shadow-[0_3px_0_currentColor] after:content-['']"></span>
          Exportar a Excel
        </button>
      </div>

      <div className="grid grid-cols-6 gap-[13px]">
        <Kpi label="Tiempo promedio de espera" value={fmt(result.avgWait)} unit="min" sub="En colas del proceso" />
        <Kpi label="Tiempo promedio en sistema" value={fmt(result.avgSystem)} unit="min" sub="Llegada → salida" />
        <Kpi label="Entidades procesadas" value={result.completed} sub={`de ${result.arrivalsCount} llegadas`} />
        <Kpi label="Utilización promedio" value={fmt(result.avgUtil, 1)} unit="%" util={result.avgUtil} />
        <Kpi label="Entidades por ruta">
          <div className="mt-2 flex items-baseline gap-1 font-mono text-[25px] font-semibold tracking-[-.025em] [font-variant-numeric:tabular-nums]">
            <span className="text-[#5a5ad6]">{result.countA}</span>
            <span className="text-lg text-[#9a9aa4]">/</span>
            <span className="text-[#2f9b8e]">{result.countB}</span>
          </div>
          <div className="mt-[9px] flex h-[5px] overflow-hidden rounded-full bg-[#ececef]">
            <div className="bg-[#5a5ad6]" style={{ width: result.obsA + '%' }}></div>
            <div className="bg-[#2f9b8e]" style={{ width: result.obsB + '%' }}></div>
          </div>
        </Kpi>
        <Kpi
          label="Cuello de botella"
          value={result.perStage[result.bottleneck].name}
          sub={`${fmt(result.perStage[result.bottleneck].util, 0)}% de utilización`}
          bn
        />
      </div>

      {/* Gateway metrics */}
      <div className="mb-3.5 mt-7 text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">
        Métricas de la compuerta de decisión
      </div>
      <section className="mb-[22px] overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
        <div className="grid grid-cols-2">
          <div className="border-r border-[#ececef] p-[22px_24px]">
            <div className="flex items-center gap-2.5 text-[13px] font-semibold">
              <span className="rounded-full bg-[#5a5ad6] px-2 py-0.5 text-[10px] font-bold text-white">RUTA A</span>
              Reparación Simple
            </div>
            <div className="mt-3.5 font-mono text-[38px] font-semibold leading-none tracking-[-.03em] [font-variant-numeric:tabular-nums]">
              {result.countA}
              <small className="text-[15px] font-medium text-[#9a9aa4]"> ent.</small>
            </div>
            <div className="mt-4 flex gap-[22px]">
              <div className="text-[11.5px] text-[#9a9aa4]">
                Observado
                <b className="mt-[3px] block font-mono text-[17px] font-semibold tracking-[-.01em] text-[#5a5ad6]">{fmt(result.obsA, 1)}%</b>
              </div>
              <div className="text-[11.5px] text-[#9a9aa4]">
                Configurado
                <b className="mt-[3px] block font-mono text-[17px] font-semibold tracking-[-.01em] text-[#18181b]">{cfg.pA}%</b>
              </div>
              <div className="text-[11.5px] text-[#9a9aa4]">
                Completadas
                <b className="mt-[3px] block font-mono text-[17px] font-semibold tracking-[-.01em] text-[#18181b]">{result.routes.A.entities}</b>
              </div>
            </div>
          </div>
          <div className="p-[22px_24px]">
            <div className="flex items-center gap-2.5 text-[13px] font-semibold">
              <span className="rounded-full bg-[#2f9b8e] px-2 py-0.5 text-[10px] font-bold text-white">RUTA B</span>
              Reparación Compleja
            </div>
            <div className="mt-3.5 font-mono text-[38px] font-semibold leading-none tracking-[-.03em] [font-variant-numeric:tabular-nums]">
              {result.countB}
              <small className="text-[15px] font-medium text-[#9a9aa4]"> ent.</small>
            </div>
            <div className="mt-4 flex gap-[22px]">
              <div className="text-[11.5px] text-[#9a9aa4]">
                Observado
                <b className="mt-[3px] block font-mono text-[17px] font-semibold tracking-[-.01em] text-[#2f9b8e]">{fmt(result.obsB, 1)}%</b>
              </div>
              <div className="text-[11.5px] text-[#9a9aa4]">
                Configurado
                <b className="mt-[3px] block font-mono text-[17px] font-semibold tracking-[-.01em] text-[#18181b]">{100 - cfg.pA}%</b>
              </div>
              <div className="text-[11.5px] text-[#9a9aa4]">
                Completadas
                <b className="mt-[3px] block font-mono text-[17px] font-semibold tracking-[-.01em] text-[#18181b]">{result.routes.B.entities}</b>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#ececef] bg-[#fafafa] p-4 px-6">
          <div className="mb-2 flex justify-between text-[11px] text-[#9a9aa4]">
            <span>Reparto observado de la decisión</span>
            <span>{result.arrivalsCount} entidades en total</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-[#ececef]">
            <div className="grid place-items-center bg-[#5a5ad6]" style={{ width: result.obsA + '%' }}>
              <span className="text-[10px] font-bold text-white">{fmt(result.obsA, 0)}%</span>
            </div>
            <div className="grid place-items-center bg-[#2f9b8e]" style={{ width: result.obsB + '%' }}>
              <span className="text-[10px] font-bold text-white">{fmt(result.obsB, 0)}%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 items-start gap-[22px]">
        {/* Comparativa por ruta */}
        <section className="overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
          <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
            <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Comparativa</span>
            <span className="text-[14.5px] font-semibold tracking-[-.01em]">Desempeño por ruta</span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Ruta', 'Entidades', 'T. promedio', 'Espera prom.'].map((h, i) => (
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
              {(['A', 'B'] as const).map((k) => {
                const ro = result.routes[k];
                return (
                  <tr key={k} className="hover:[&>td]:bg-[#fafafb]">
                    <td className="border-b border-[#ececef] px-[18px] py-3 text-left font-sans text-[13px] font-medium">
                      <span className="inline-flex items-center gap-2.5">
                        <span
                          className={
                            'grid h-6 w-6 place-items-center rounded-[7px] border font-mono text-[10px] font-bold ' +
                            (k === 'A' ? 'border-[#d3d3f5] bg-[#eeeefb] text-[#5a5ad6]' : 'border-[#c2e4dd] bg-[#e6f4f1] text-[#2f9b8e]')
                          }
                        >
                          {k}
                        </span>
                        {ro.name}
                      </span>
                    </td>
                    <td className="border-b border-[#ececef] px-[18px] py-3 text-right font-mono text-[13px] [font-variant-numeric:tabular-nums]">
                      {ro.entities}
                    </td>
                    <td className="border-b border-[#ececef] px-[18px] py-3 text-right font-mono text-[13px] [font-variant-numeric:tabular-nums]">
                      {fmt(ro.avgSys)} min
                    </td>
                    <td className="border-b border-[#ececef] px-[18px] py-3 text-right font-mono text-[13px] [font-variant-numeric:tabular-nums]">
                      {fmt(ro.avgWait)} min
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Por actividad */}
        <section className="overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
          <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
            <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Por actividad</span>
            <span className="text-[14.5px] font-semibold tracking-[-.01em]">Utilización por etapa</span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Actividad', 'Utilización', 'Procesadas'].map((h, i) => (
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
              {result.perStage.map((p, i) => {
                const tagDot = i === 1 ? 'A' : i === 2 ? 'B' : '';
                return (
                  <tr key={i} className={result.bottleneck === i ? 'bg-[#fbf1e5] hover:bg-[#f8edde]' : 'hover:[&>td]:bg-[#fafafb]'}>
                    <td className="border-b border-[#ececef] px-[18px] py-3 text-left font-sans text-[13px] font-medium">
                      <span className="inline-flex items-center gap-2.5">
                        <span
                          className={
                            'grid h-6 w-6 place-items-center rounded-[7px] border font-mono text-[10px] font-bold ' +
                            (tagDot === 'A'
                              ? 'border-[#d3d3f5] bg-[#eeeefb] text-[#5a5ad6]'
                              : tagDot === 'B'
                              ? 'border-[#c2e4dd] bg-[#e6f4f1] text-[#2f9b8e]'
                              : 'border-[#ececef] bg-[#fafafa] text-[#9a9aa4]')
                          }
                        >
                          {tagDot || i + 1}
                        </span>
                        {p.name}
                      </span>
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
                );
              })}
            </tbody>
          </table>
        </section>
      </div>

      {/* Traza de eventos */}
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
                <th rowSpan={2} className="sticky left-0 top-0 z-[5] whitespace-nowrap border-b border-r border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">
                  Entidad
                </th>
                <th rowSpan={2} className="sticky top-0 z-[3] whitespace-nowrap border-b border-l border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">
                  Ruta
                </th>
                <th rowSpan={2} className="sticky top-0 z-[3] whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">
                  Llegada
                </th>
                <th colSpan={2} className="sticky top-0 z-[3] whitespace-nowrap border-b border-l border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">
                  Recepción
                </th>
                <th colSpan={2} className="sticky top-0 z-[3] whitespace-nowrap border-b border-l border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">
                  Reparación
                </th>
                <th colSpan={2} className="sticky top-0 z-[3] whitespace-nowrap border-b border-l border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">
                  Pago
                </th>
              </tr>
              <tr>
                <th className="sticky top-[34px] z-[3] whitespace-nowrap border-b border-l border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">Inicio</th>
                <th className="sticky top-[34px] z-[3] whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">Fin</th>
                <th className="sticky top-[34px] z-[3] whitespace-nowrap border-b border-l border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">Inicio</th>
                <th className="sticky top-[34px] z-[3] whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">Fin</th>
                <th className="sticky top-[34px] z-[3] whitespace-nowrap border-b border-l border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">Inicio</th>
                <th className="sticky top-[34px] z-[3] whitespace-nowrap border-b border-[#ececef] bg-[#fafafa] px-3.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">Fin</th>
              </tr>
            </thead>
            <tbody>
              {ents.map((e) => (
                <tr key={e.id} className="group">
                  <td className="sticky left-0 z-[4] whitespace-nowrap border-b border-r border-[#ececef] bg-white px-3.5 py-[9px] text-left font-sans text-[12.5px] font-medium group-hover:bg-[#fafafb]">
                    Entidad {e.id}
                  </td>
                  <td className="whitespace-nowrap border-b border-l border-[#ececef] px-3.5 py-[9px] text-center group-hover:bg-[#fafafb]">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 font-sans text-[10.5px] font-bold text-white ' +
                        (e.route === 'A' ? 'bg-[#5a5ad6]' : 'bg-[#2f9b8e]')
                      }
                    >
                      {e.route}
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] group-hover:bg-[#fafafb]">
                    {fmt(e.arrival)}
                  </td>
                  <td className="whitespace-nowrap border-b border-l border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] group-hover:bg-[#fafafb]">
                    {fmt(e.rec.start ?? 0)}
                  </td>
                  <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] group-hover:bg-[#fafafb]">
                    {fmt(e.rec.end ?? 0)}
                  </td>
                  <td className="whitespace-nowrap border-b border-l border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] group-hover:bg-[#fafafb]">
                    {fmt(e.rep.start ?? 0)}
                  </td>
                  <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] group-hover:bg-[#fafafb]">
                    {fmt(e.rep.end ?? 0)}
                  </td>
                  <td className="whitespace-nowrap border-b border-l border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] group-hover:bg-[#fafafb]">
                    {fmt(e.pay.start ?? 0)}
                  </td>
                  <td className="whitespace-nowrap border-b border-[#ececef] px-3.5 py-[9px] text-right font-mono text-[12.5px] [font-variant-numeric:tabular-nums] group-hover:bg-[#fafafb]">
                    {fmt(e.pay.end ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between border-t border-[#ececef] bg-[#fafafa] px-[18px] py-3 text-xs text-[#9a9aa4]">
          <span>
            {ents.length} entidades · ruta A {result.countA} · ruta B {result.countB}
          </span>
          <span>
            Réplica #{runCount} · horizonte {result.horizon} min
          </span>
        </div>
      </section>
    </div>
  );
}
