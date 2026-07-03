'use client';

import React from 'react';
import type { SimResult } from '@/lib/simulate-simple';

export function Flow({ phase, result }: { phase: 'idle' | 'running' | 'done'; result: SimResult | null }) {
  const active = phase !== 'idle';
  const running = phase === 'running';

  return (
    <section className="mb-[22px] overflow-hidden rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
      <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Modelo</span>
        <span className="text-[14.5px] font-semibold tracking-[-.01em]">Flujo del proceso · Taller mecánico</span>
        <span className="ml-auto text-[12.5px] text-[#9a9aa4]">Cola M/M/c · 1 actividad</span>
      </div>

      <div
        className="relative px-9 pb-[34px] pt-10"
        style={{
          background: 'radial-gradient(circle at 1px 1px, #ededf0 1px, transparent 0) 0 0 / 22px 22px, #fafafa',
        }}
      >
        {running && (
          <span
            className="absolute top-1/2 z-[3] h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[#5a5ad6] opacity-0 shadow-[0_0_0_4px_#eeeefb] [animation:travel_1.15s_cubic-bezier(.5,0,.5,1)_infinite]"
            style={{ left: 0 }}
          ></span>
        )}
        <style jsx global>{`
          @keyframes travel {
            0% { left: 14%; opacity: 0; }
            12% { opacity: 1; }
            88% { opacity: 1; }
            100% { left: 86%; opacity: 0; }
          }
          @keyframes indet {
            0% { left: -40%; }
            100% { left: 100%; }
          }
        `}</style>

        <div className="relative z-[2] flex items-center justify-center">
          {/* Llegada */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={
                'grid h-[66px] w-[66px] place-items-center rounded-full bg-white transition-shadow duration-200 ' +
                (active ? 'border-[1.5px] border-[#5a5ad6] shadow-[0_0_0_4px_#eeeefb]' : 'border-[1.5px] border-[#e1e1e6]')
              }
            >
              <span className={'h-[18px] w-[18px] rounded-full ' + (active ? 'bg-[#5a5ad6]' : 'bg-[#9a9aa4]')}></span>
            </div>
            <span className="text-[12.5px] font-medium text-[#62626c]">Llegada de Auto</span>
            {result && (
              <span className="font-mono text-[11px] text-[#9a9aa4]">{result.arrivalsCount} autos</span>
            )}
          </div>

          {/* connector */}
          <div className="relative mt-8 h-0.5 w-[86px] flex-none self-start">
            <span
              className="absolute left-0 right-2.5 h-0.5"
              style={{ background: 'repeating-linear-gradient(90deg, #d4d4da 0 7px, transparent 7px 13px)' }}
            ></span>
            <span
              className="absolute right-0 top-[-4px] h-0 w-0"
              style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #c4c4cc' }}
            ></span>
          </div>

          {/* Task */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={
                'relative h-[92px] w-[226px] rounded-[14px] border-[1.5px] bg-white p-4 px-[18px] shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)] transition-shadow duration-200 ' +
                (active ? 'border-[#5a5ad6] shadow-[0_0_0_4px_#eeeefb,0_1px_2px_rgba(24,24,27,.04)]' : 'border-[#e1e1e6]')
              }
            >
              {result && (
                <span className="absolute -top-[11px] right-3.5 inline-flex items-center gap-[5px] rounded-full border border-[#e1e1e6] bg-white px-[9px] py-[3px] text-[11px] font-semibold text-[#62626c] shadow-[0_1px_2px_rgba(24,24,27,.04)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5a5ad6]"></span>
                  {result.util.toFixed(0)}% uso
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 flex-none place-items-center rounded-[7px] bg-[#eeeefb]">
                  <i className="block h-[9px] w-[9px] rounded-[2px] border-2 border-[#5a5ad6]"></i>
                </span>
                <span className="text-[15px] font-semibold tracking-[-.01em]">Reparación</span>
              </div>
              <div className="mt-[9px] text-[11.5px] font-semibold uppercase tracking-[.03em] text-[#9a9aa4]">
                Actividad · {result ? result.mechanics : '—'} mecánico(s)
              </div>
            </div>
            <span className="text-[12.5px] font-medium text-[#62626c]">Servicio</span>
          </div>

          {/* connector */}
          <div className="relative mt-8 h-0.5 w-[86px] flex-none self-start">
            <span
              className="absolute left-0 right-2.5 h-0.5"
              style={{ background: 'repeating-linear-gradient(90deg, #d4d4da 0 7px, transparent 7px 13px)' }}
            ></span>
            <span
              className="absolute right-0 top-[-4px] h-0 w-0"
              style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #c4c4cc' }}
            ></span>
          </div>

          {/* Fin */}
          <div className="flex flex-col items-center gap-3">
            <div className="grid h-[66px] w-[66px] place-items-center rounded-full border-[3px] border-[#cfcfd6] bg-white">
              <span className="h-4 w-4 rounded-[4px] bg-[#62626c]"></span>
            </div>
            <span className="text-[12.5px] font-medium text-[#62626c]">Fin</span>
            {result && <span className="font-mono text-[11px] text-[#9a9aa4]">{result.served} salidas</span>}
          </div>
        </div>
      </div>

      {running && (
        <div className="relative h-[3px] overflow-hidden bg-[#ececef]">
          <i className="absolute inset-y-0 w-2/5 animate-[indet_1.1s_ease-in-out_infinite] rounded-full bg-[#5a5ad6]"></i>
        </div>
      )}
    </section>
  );
}
