'use client';

import React from 'react';
import type { SimResult, Stage } from '@/lib/simulate-multietapa';

interface FlowProps {
  phase: 'idle' | 'running' | 'done';
  result: SimResult | null;
  stages: Stage[];
  interarrival: number;
  onRemoveStage: (i: number) => void;
}

export function Flow({ phase, result, stages, interarrival, onRemoveStage }: FlowProps) {
  const active = phase !== 'idle';

  return (
    <section className="mb-[22px] rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
      <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Modelo</span>
        <span className="text-[14.5px] font-semibold tracking-[-.01em]">Flujo del proceso · Cola en tándem</span>
        <span className="ml-auto text-[12.5px] text-[#9a9aa4]">Cola en tándem · {stages.length} actividades</span>
      </div>

      <div
        className="relative overflow-x-auto px-7 pb-[30px] pt-[38px]"
        style={{
          background:
            'radial-gradient(circle at 1px 1px, #ededf0 1px, transparent 0) 0 0 / 22px 22px, #fafafa',
        }}
      >
        <div className="flex min-w-[1080px] items-start justify-center">
          {/* Start node */}
          <div className="flex flex-col items-center gap-[11px]">
            <div className="grid h-[58px] w-[58px] place-items-center rounded-full border-[1.5px] border-[#e1e1e6] bg-white transition-shadow duration-200">
              <span className="h-4 w-4 rounded-full bg-[#9a9aa4]"></span>
            </div>
            <span className="text-xs font-semibold text-[#62626c]">Llegada</span>
            <span className="font-mono text-[10.5px] text-[#9a9aa4]">cada {interarrival} min</span>
          </div>

          {stages.map((s, i) => {
            const isBn = result && result.bottleneck === i;
            return (
              <React.Fragment key={i}>
                {/* connector */}
                <div className="relative mt-7 h-0.5 w-[46px] flex-none">
                  <span
                    className="absolute left-0 right-[9px] h-0.5"
                    style={{
                      background:
                        'repeating-linear-gradient(90deg, #d4d4da 0 6px, transparent 6px 11px)',
                    }}
                  ></span>
                  <span
                    className="absolute right-0 top-[-4px] h-0 w-0"
                    style={{
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderLeft: '8px solid #c4c4cc',
                    }}
                  ></span>
                </div>

                <div className="group flex flex-col items-center gap-[11px]">
                  <div
                    className={
                      'relative min-h-[86px] w-[158px] rounded-[13px] border-[1.5px] p-[13px_14px] shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)] transition-shadow duration-200 ' +
                      (isBn
                        ? 'border-[#ecd3b3] bg-[#fbf1e5] shadow-[0_0_0_3px_#fbf1e5,0_1px_2px_rgba(24,24,27,.04)]'
                        : active
                        ? 'border-[#5a5ad6] bg-white shadow-[0_0_0_3px_#eeeefb,0_1px_2px_rgba(24,24,27,.04)]'
                        : 'border-[#e1e1e6] bg-white')
                    }
                  >
                    {stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveStage(i)}
                        aria-label={`Eliminar ${s.name}`}
                        title="Eliminar etapa"
                        className="absolute -right-2 -top-2 z-[3] grid h-[22px] w-[22px] place-items-center rounded-full border border-[#e1e1e6] bg-white text-[#9a9aa4] opacity-0 shadow-[0_1px_2px_rgba(24,24,27,.08)] transition-all hover:border-[#e6b3b3] hover:bg-[#fbeaea] hover:text-[#c04747] group-hover:opacity-100"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    )}
                    {isBn && (
                      <span className="absolute -top-2.5 left-3 inline-flex items-center gap-1 rounded-full bg-[#c0782d] py-0.5 pl-[7px] pr-[9px] text-[10px] font-semibold text-white shadow-[0_1px_2px_rgba(24,24,27,.04)] before:h-[5px] before:w-[5px] before:rounded-full before:bg-white">
                        Cuello de botella
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="grid h-[19px] w-[19px] flex-none place-items-center rounded-md border border-[#ececef] bg-[#fafafa] font-mono text-[10px] font-bold text-[#9a9aa4]">
                        {i + 1}
                      </span>
                      <span className="text-[13.5px] font-semibold tracking-[-.01em]">{s.name}</span>
                    </div>
                    <div className="mt-[9px] flex gap-[9px] font-mono text-[11px] text-[#9a9aa4]">
                      <span>
                        <b className="font-semibold text-[#62626c]">{s.service}</b>m
                      </span>
                      <span>
                        <b className="font-semibold text-[#62626c]">{s.resources}</b> rec.
                      </span>
                    </div>
                    {result && (
                      <div className="mt-[11px]">
                        <div className="h-1 overflow-hidden rounded-full bg-[#ececef]">
                          <i
                            className={'block h-full rounded-full transition-[width] duration-500 ' + (isBn ? 'bg-[#c0782d]' : 'bg-[#5a5ad6]')}
                            style={{ width: Math.min(100, result.perStage[i].util) + '%' }}
                          ></i>
                        </div>
                        <div className="mt-[5px] flex justify-between font-mono text-[10.5px] text-[#9a9aa4]">
                          <span>uso</span>
                          <span>{result.perStage[i].util.toFixed(0)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* connector to end */}
          <div className="relative mt-7 h-0.5 w-[46px] flex-none">
            <span
              className="absolute left-0 right-[9px] h-0.5"
              style={{ background: 'repeating-linear-gradient(90deg, #d4d4da 0 6px, transparent 6px 11px)' }}
            ></span>
            <span
              className="absolute right-0 top-[-4px] h-0 w-0"
              style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #c4c4cc' }}
            ></span>
          </div>

          {/* End node */}
          <div className="flex flex-col items-center gap-[11px]">
            <div className="grid h-[58px] w-[58px] place-items-center rounded-full border-[3px] border-[#cfcfd6] bg-white">
              <span className="h-3.5 w-3.5 rounded-[4px] bg-[#62626c]"></span>
            </div>
            <span className="text-xs font-semibold text-[#62626c]">Fin</span>
            {result && <span className="font-mono text-[10.5px] text-[#9a9aa4]">{result.completed} salidas</span>}
          </div>
        </div>
      </div>

      {phase === 'running' && (
        <div className="relative h-[3px] overflow-hidden bg-[#ececef]">
          <i className="absolute inset-y-0 w-2/5 animate-[indet_1.1s_ease-in-out_infinite] rounded-full bg-[#5a5ad6]"></i>
          <style jsx>{`
            @keyframes indet {
              0% { left: -40%; }
              100% { left: 100%; }
            }
          `}</style>
        </div>
      )}
    </section>
  );
}
