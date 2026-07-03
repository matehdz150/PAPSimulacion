'use client';

import React from 'react';
import type { DecisionConfig, SimResult } from '@/lib/simulate-decision';
import { fmt } from '@/lib/simulate-decision';

export function Flow({
  phase,
  result,
  cfg,
}: {
  phase: 'idle' | 'running' | 'done';
  result: SimResult | null;
  cfg: DecisionConfig;
}) {
  const r = result;
  const utilA = r ? r.perStage[1].util : 0;
  const utilB = r ? r.perStage[2].util : 0;

  return (
    <section className="mb-[22px] rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
      <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Modelo</span>
        <span className="text-[14.5px] font-semibold tracking-[-.01em]">Flujo del proceso · Taller con compuerta de decisión</span>
        <span className="ml-auto text-[12.5px] text-[#9a9aa4]">Gateway exclusivo (XOR) · 2 rutas</span>
      </div>

      <div
        className="relative overflow-x-auto p-6"
        style={{ background: 'radial-gradient(circle at 1px 1px, #ededf0 1px, transparent 0) 0 0 / 22px 22px, #fafafa' }}
      >
        <div className="relative mx-auto h-[312px] w-[1100px]">
          <svg viewBox="0 0 1100 312" className="pointer-events-none absolute inset-0 z-[1] h-full w-full">
            <defs>
              <marker id="arw" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L8,4.5 L0,9 z" fill="#b9bac1" />
              </marker>
              <marker id="arwA" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L8,4.5 L0,9 z" fill="#5a5ad6" />
              </marker>
              <marker id="arwB" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L8,4.5 L0,9 z" fill="#2f9b8e" />
              </marker>
            </defs>
            <line x1="70" y1="156" x2="103" y2="156" stroke="#cdced4" strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#arw)" />
            <line x1="252" y1="156" x2="338" y2="156" stroke="#cdced4" strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#arw)" />
            <line x1="448" y1="140" x2="520" y2="74" stroke="#5a5ad6" strokeWidth="2.2" markerEnd="url(#arwA)" />
            <line x1="448" y1="172" x2="520" y2="238" stroke="#2f9b8e" strokeWidth="2.2" markerEnd="url(#arwB)" />
            <line x1="716" y1="74" x2="792" y2="142" stroke="#cdced4" strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#arw)" />
            <line x1="716" y1="238" x2="792" y2="170" stroke="#cdced4" strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#arw)" />
            <line x1="948" y1="156" x2="1006" y2="156" stroke="#cdced4" strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#arw)" />
          </svg>

          {/* Llegada */}
          <div className="absolute z-[2]" style={{ left: 14, top: 128, width: 56, height: 56 }}>
            <div className="grid h-14 w-14 place-items-center rounded-full border-[1.5px] border-[#e1e1e6] bg-white">
              <span className="h-[15px] w-[15px] rounded-full bg-[#9a9aa4]"></span>
            </div>
            <span className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-[#62626c]">
              Llegada
              <span className="mt-0.5 block text-center font-mono text-[10.5px] font-medium text-[#9a9aa4]">cada {cfg.interarrival}m</span>
            </span>
          </div>

          {/* Recepción */}
          <div className="absolute z-[2]" style={{ left: 103, top: 122, width: 149, height: 70 }}>
            <div className="h-full rounded-[13px] border-[1.5px] border-[#e1e1e6] bg-white p-3 px-3.5 shadow-[0_1px_2px_rgba(24,24,27,.04)]">
              <div className="flex items-center gap-2">
                <span className="grid h-[19px] w-[19px] flex-none place-items-center rounded-md border border-[#ececef] bg-[#fafafa] font-mono text-[10px] font-bold text-[#9a9aa4]">
                  1
                </span>
                <span className="text-[13px] font-semibold tracking-[-.01em]">Recepción</span>
              </div>
              <div className="mt-[7px] flex gap-2 font-mono text-[10.5px] text-[#9a9aa4]">
                <span>
                  <b className="font-semibold text-[#62626c]">{cfg.rec.service}</b>m
                </span>
                <span>
                  <b className="font-semibold text-[#62626c]">{cfg.rec.resources}</b>r
                </span>
              </div>
            </div>
            <span className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-[#62626c]">
              {r && `${fmt(r.perStage[0].util, 0)}% uso`}
            </span>
          </div>

          {/* Gateway */}
          <div className="absolute z-[2]" style={{ left: 344, top: 104, width: 104, height: 104 }}>
            <div className="grid h-[104px] w-[104px] rotate-45 place-items-center rounded-2xl border-[2.5px] border-[#5a5ad6] bg-gradient-to-br from-[#f3f3fe] to-[#eaeafb] shadow-[0_0_0_6px_#eeeefb,0_10px_26px_-8px_rgba(90,90,214,.5)]">
              <div className="relative h-[30px] w-[30px] -rotate-45">
                <span className="absolute left-0 top-1/2 h-[3.5px] w-full -translate-y-1/2 rotate-45 rounded bg-[#5a5ad6]"></span>
                <span className="absolute left-0 top-1/2 h-[3.5px] w-full -translate-y-1/2 -rotate-45 rounded bg-[#5a5ad6]"></span>
              </div>
            </div>
            <span className="absolute left-1/2 top-[calc(100%+14px)] -translate-x-1/2 whitespace-nowrap">
              <span className="inline-flex items-center gap-[7px] rounded-full border-[1.5px] border-[#5a5ad6] bg-white px-[13px] py-[5px] text-xs font-semibold text-[#5a5ad6] shadow-[0_1px_2px_rgba(24,24,27,.04)]">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#5a5ad6] text-[11px] font-extrabold text-white">?</span>
                Tipo de reparación
              </span>
            </span>
          </div>

          {/* Reparación Simple (Ruta A) */}
          <div className="absolute z-[2]" style={{ left: 520, top: 40, width: 196, height: 70 }}>
            <div
              className={
                'relative h-full rounded-[13px] border-[1.5px] bg-white p-3 px-3.5 shadow-[0_1px_2px_rgba(24,24,27,.04)] ' +
                (r && r.bottleneck === 1
                  ? 'border-[#ecd3b3] bg-[#fbf1e5] shadow-[0_0_0_3px_#fbf1e5,0_1px_2px_rgba(24,24,27,.04)]'
                  : 'border-[#d3d3f5]')
              }
            >
              <span className="absolute -top-[9px] left-3 rounded-full bg-[#5a5ad6] px-2 py-0.5 text-[9.5px] font-bold tracking-[.04em] text-white">
                RUTA A
              </span>
              {r && r.bottleneck === 1 && (
                <span className="absolute -top-[9px] right-2.5 rounded-full bg-[#c0782d] px-2 py-0.5 text-[9.5px] font-bold tracking-[.03em] text-white shadow-[0_1px_2px_rgba(24,24,27,.04)]">
                  Cuello
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="grid h-[19px] w-[19px] flex-none place-items-center rounded-md border border-[#ececef] bg-[#fafafa] font-mono text-[10px] font-bold text-[#9a9aa4]">
                  2A
                </span>
                <span className="text-[13px] font-semibold tracking-[-.01em]">Reparación Simple</span>
              </div>
              <div className="mt-[7px] flex gap-2 font-mono text-[10.5px] text-[#9a9aa4]">
                <span>
                  <b className="font-semibold text-[#62626c]">{cfg.repA.service}</b>m
                </span>
                <span>
                  <b className="font-semibold text-[#62626c]">{cfg.repA.resources}</b>r
                </span>
              </div>
              {r && (
                <div className="mt-[9px] h-1 overflow-hidden rounded-full bg-[#ececef]">
                  <i
                    className={'block h-full rounded-full transition-[width] duration-500 ' + (r.bottleneck === 1 ? 'bg-[#c0782d]' : 'bg-[#5a5ad6]')}
                    style={{ width: Math.min(100, utilA) + '%' }}
                  ></i>
                </div>
              )}
            </div>
          </div>

          {/* Reparación Compleja (Ruta B) */}
          <div className="absolute z-[2]" style={{ left: 520, top: 204, width: 196, height: 70 }}>
            <div
              className={
                'relative h-full rounded-[13px] border-[1.5px] bg-white p-3 px-3.5 shadow-[0_1px_2px_rgba(24,24,27,.04)] ' +
                (r && r.bottleneck === 2
                  ? 'border-[#ecd3b3] bg-[#fbf1e5] shadow-[0_0_0_3px_#fbf1e5,0_1px_2px_rgba(24,24,27,.04)]'
                  : 'border-[#c2e4dd]')
              }
            >
              <span className="absolute -top-[9px] left-3 rounded-full bg-[#2f9b8e] px-2 py-0.5 text-[9.5px] font-bold tracking-[.04em] text-white">
                RUTA B
              </span>
              {r && r.bottleneck === 2 && (
                <span className="absolute -top-[9px] right-2.5 rounded-full bg-[#c0782d] px-2 py-0.5 text-[9.5px] font-bold tracking-[.03em] text-white shadow-[0_1px_2px_rgba(24,24,27,.04)]">
                  Cuello
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="grid h-[19px] w-[19px] flex-none place-items-center rounded-md border border-[#ececef] bg-[#fafafa] font-mono text-[10px] font-bold text-[#9a9aa4]">
                  2B
                </span>
                <span className="text-[13px] font-semibold tracking-[-.01em]">Reparación Compleja</span>
              </div>
              <div className="mt-[7px] flex gap-2 font-mono text-[10.5px] text-[#9a9aa4]">
                <span>
                  <b className="font-semibold text-[#62626c]">{cfg.repB.service}</b>m
                </span>
                <span>
                  <b className="font-semibold text-[#62626c]">{cfg.repB.resources}</b>r
                </span>
              </div>
              {r && (
                <div className="mt-[9px] h-1 overflow-hidden rounded-full bg-[#ececef]">
                  <i
                    className={'block h-full rounded-full transition-[width] duration-500 ' + (r.bottleneck === 2 ? 'bg-[#c0782d]' : 'bg-[#2f9b8e]')}
                    style={{ width: Math.min(100, utilB) + '%' }}
                  ></i>
                </div>
              )}
            </div>
          </div>

          {/* Pago */}
          <div className="absolute z-[2]" style={{ left: 800, top: 122, width: 148, height: 70 }}>
            <div
              className={
                'relative h-full rounded-[13px] border-[1.5px] bg-white p-3 px-3.5 shadow-[0_1px_2px_rgba(24,24,27,.04)] ' +
                (r && r.bottleneck === 3
                  ? 'border-[#ecd3b3] bg-[#fbf1e5] shadow-[0_0_0_3px_#fbf1e5,0_1px_2px_rgba(24,24,27,.04)]'
                  : 'border-[#e1e1e6]')
              }
            >
              {r && r.bottleneck === 3 && (
                <span className="absolute -top-[9px] right-2.5 rounded-full bg-[#c0782d] px-2 py-0.5 text-[9.5px] font-bold tracking-[.03em] text-white shadow-[0_1px_2px_rgba(24,24,27,.04)]">
                  Cuello
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="grid h-[19px] w-[19px] flex-none place-items-center rounded-md border border-[#ececef] bg-[#fafafa] font-mono text-[10px] font-bold text-[#9a9aa4]">
                  3
                </span>
                <span className="text-[13px] font-semibold tracking-[-.01em]">Pago</span>
              </div>
              <div className="mt-[7px] flex gap-2 font-mono text-[10.5px] text-[#9a9aa4]">
                <span>
                  <b className="font-semibold text-[#62626c]">{cfg.pay.service}</b>m
                </span>
                <span>
                  <b className="font-semibold text-[#62626c]">{cfg.pay.resources}</b>r
                </span>
              </div>
            </div>
            <span className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-[#62626c]">
              {r && `${fmt(r.perStage[3].util, 0)}% uso`}
            </span>
          </div>

          {/* Fin */}
          <div className="absolute z-[2]" style={{ left: 1006, top: 128, width: 56, height: 56 }}>
            <div className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#cfcfd6] bg-white">
              <span className="h-[13px] w-[13px] rounded-[4px] bg-[#62626c]"></span>
            </div>
            <span className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-[#62626c]">
              Fin
              <span className="mt-0.5 block text-center font-mono text-[10.5px] font-medium text-[#9a9aa4]">
                {r ? `${r.completed} salidas` : ''}
              </span>
            </span>
          </div>

          {/* Edge pills */}
          <div
            className="absolute z-[3] inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#cfcff4] bg-white px-2.5 py-[3px] text-[11px] font-semibold text-[#62626c] shadow-[0_1px_2px_rgba(24,24,27,.04)]"
            style={{ left: 484, top: 96 }}
          >
            <span className="h-[7px] w-[7px] rounded-full bg-[#5a5ad6]"></span>
            Simple{' '}
            <b className="font-mono text-[#18181b]">{r ? `${fmt(r.obsA, 0)}%` : `${cfg.pA}%`}</b>
            {r && ` · ${r.countA}`}
          </div>
          <div
            className="absolute z-[3] inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#bfe3db] bg-white px-2.5 py-[3px] text-[11px] font-semibold text-[#62626c] shadow-[0_1px_2px_rgba(24,24,27,.04)]"
            style={{ left: 484, top: 216 }}
          >
            <span className="h-[7px] w-[7px] rounded-full bg-[#2f9b8e]"></span>
            Compleja <b className="font-mono text-[#18181b]">{r ? `${fmt(r.obsB, 0)}%` : `${100 - cfg.pA}%`}</b>
            {r && ` · ${r.countB}`}
          </div>
        </div>
      </div>

      {phase === 'running' && (
        <div className="relative h-[3px] overflow-hidden bg-[#ececef]">
          <i className="absolute inset-y-0 w-2/5 animate-[indet_1.1s_ease-in-out_infinite] rounded-full bg-[#5a5ad6]"></i>
          <style jsx global>{`
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
