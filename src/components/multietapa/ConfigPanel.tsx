'use client';

import React from 'react';
import type { Stage } from '@/lib/simulate-multietapa';

function CellNum({
  value,
  onChange,
  unit,
  step = 1,
  min = 1,
  max = 9999,
  integer,
}: {
  value: number;
  onChange: (v: number) => void;
  unit: string;
  step?: number;
  min?: number;
  max?: number;
  integer?: boolean;
}) {
  const set = (v: number) => {
    let n = integer ? Math.round(v) : v;
    n = Math.max(min, Math.min(max, n));
    onChange(n);
  };
  return (
    <div className="ml-auto flex w-[120px] items-center justify-end overflow-hidden rounded-lg border border-[#e1e1e6] transition-colors focus-within:border-[#5a5ad6] focus-within:shadow-[0_0_0_3px_#eeeefb]">
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => set(parseFloat(e.target.value || '0'))}
        className="w-full appearance-none border-0 bg-transparent px-2.5 py-2 text-right font-mono text-sm font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="grid place-items-center self-stretch border-l border-[#ececef] bg-[#fafafa] px-2.5 text-[11px] font-semibold text-[#9a9aa4]">
        {unit}
      </span>
    </div>
  );
}

interface ConfigPanelProps {
  stages: Stage[];
  setStage: (i: number, key: 'service' | 'resources', v: number) => void;
  setStageName: (i: number, name: string) => void;
  onAddStage: () => void;
  onRemoveStage: (i: number) => void;
  interarrival: number;
  setInterarrival: (v: number) => void;
  horizon: number;
  setHorizon: (v: number) => void;
  onRun: () => void;
  running: boolean;
  hasResult: boolean;
  bottleneck?: number;
}

export function ConfigPanel({
  stages,
  setStage,
  setStageName,
  onAddStage,
  onRemoveStage,
  interarrival,
  setInterarrival,
  horizon,
  setHorizon,
  onRun,
  running,
  hasResult,
  bottleneck,
}: ConfigPanelProps) {
  return (
    <section className="mb-[22px] rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
      <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">02</span>
        <span className="text-[14.5px] font-semibold tracking-[-.01em]">Configuración de actividades</span>
        <span className="ml-auto text-[12.5px] text-[#9a9aa4]">Editable</span>
      </div>

      <div className="px-5 pb-5 pt-1.5">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-[#ececef] px-3 pb-2.5 pt-3 text-left text-[11px] font-semibold uppercase tracking-[.04em] text-[#9a9aa4]">
                Actividad
              </th>
              <th className="border-b border-[#ececef] px-3 pb-2.5 pt-3 text-right text-[11px] font-semibold uppercase tracking-[.04em] text-[#9a9aa4]">
                Tiempo de servicio
              </th>
              <th className="border-b border-[#ececef] px-3 pb-2.5 pt-3 text-right text-[11px] font-semibold uppercase tracking-[.04em] text-[#9a9aa4]">
                Recursos disponibles
              </th>
              <th className="w-[38px] border-b border-[#ececef] pb-2.5 pt-3"></th>
            </tr>
          </thead>
          <tbody>
            {stages.map((s, i) => (
              <tr key={i} className={bottleneck === i ? 'bg-[#fbf1e5]' : ''}>
                <td className="border-b border-[#ececef] px-3 py-[9px] last:border-b-0">
                  <div className="flex items-center gap-[11px]">
                    <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg border border-[#ececef] bg-[#fafafa] font-mono text-[11px] font-bold text-[#9a9aa4]">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => setStageName(i, e.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13.5px] font-medium text-[#18181b] outline-none transition-colors hover:border-[#e1e1e6] focus:border-[#5a5ad6] focus:bg-white focus:shadow-[0_0_0_3px_#eeeefb]"
                    />
                  </div>
                </td>
                <td className="border-b border-[#ececef] px-3 py-[9px]">
                  <CellNum value={s.service} unit="min" onChange={(v) => setStage(i, 'service', v)} min={1} max={480} />
                </td>
                <td className="border-b border-[#ececef] px-3 py-[9px]">
                  <CellNum value={s.resources} unit="#" integer onChange={(v) => setStage(i, 'resources', v)} min={1} max={20} />
                </td>
                <td className="border-b border-[#ececef] py-[9px] pl-1 pr-2 text-right">
                  <button
                    type="button"
                    onClick={() => onRemoveStage(i)}
                    disabled={stages.length <= 1}
                    aria-label={`Eliminar ${s.name}`}
                    title={stages.length <= 1 ? 'Debe quedar al menos una etapa' : 'Eliminar etapa'}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-[#ececef] bg-white text-[#9a9aa4] transition-colors hover:border-[#e6b3b3] hover:bg-[#fbeaea] hover:text-[#c04747] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#ececef] disabled:hover:bg-white disabled:hover:text-[#9a9aa4]"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={onAddStage}
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-[#d3d3f5] bg-[#fafafe] px-3.5 text-[12.5px] font-semibold text-[#5a5ad6] transition-colors hover:border-[#5a5ad6] hover:bg-[#eeeefb]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar etapa
        </button>

        <div className="mt-5 grid grid-cols-[1fr_1fr_auto] items-end gap-4 border-t border-dashed border-[#e1e1e6] pt-[18px]">
          <div>
            <div className="mb-2 flex justify-between text-[12.5px] font-medium text-[#62626c]">
              <span>Tiempo entre llegadas</span>
              <span className="text-[#9a9aa4]">media · minutos</span>
            </div>
            <div className="flex items-stretch overflow-hidden rounded-[9px] border border-[#e1e1e6] bg-white transition-colors focus-within:border-[#5a5ad6] focus-within:shadow-[0_0_0_3px_#eeeefb]">
              <input
                type="number"
                value={interarrival}
                min={1}
                max={240}
                onChange={(e) => setInterarrival(Math.max(1, Math.min(240, parseFloat(e.target.value || '1'))))}
                className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 py-2.5 font-mono text-[15px] font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="grid place-items-center border-l border-[#ececef] bg-[#fafafa] px-[11px] text-[11.5px] font-semibold text-[#9a9aa4]">
                min
              </span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-[12.5px] font-medium text-[#62626c]">
              <span>Horizonte de simulación</span>
              <span className="text-[#9a9aa4]">minutos</span>
            </div>
            <div className="flex items-stretch overflow-hidden rounded-[9px] border border-[#e1e1e6] bg-white transition-colors focus-within:border-[#5a5ad6] focus-within:shadow-[0_0_0_3px_#eeeefb]">
              <input
                type="number"
                value={horizon}
                step={30}
                min={60}
                max={4320}
                onChange={(e) => setHorizon(Math.max(60, Math.min(4320, parseFloat(e.target.value || '60'))))}
                className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 py-2.5 font-mono text-[15px] font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="grid place-items-center border-l border-[#ececef] bg-[#fafafa] px-[11px] text-[11.5px] font-semibold text-[#9a9aa4]">
                min
              </span>
            </div>
          </div>

          <button
            onClick={onRun}
            disabled={running}
            className="inline-flex h-[46px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[9px] bg-[#5a5ad6] px-[26px] text-sm font-semibold text-white shadow-[0_1px_2px_rgba(74,75,196,.4),inset_0_1px_0_rgba(255,255,255,.16)] transition-colors hover:bg-[#4b4bc4] active:translate-y-px disabled:cursor-default disabled:opacity-70"
          >
            {running ? (
              <>
                <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                Simulando…
              </>
            ) : (
              <>
                <span
                  className="h-0 w-0"
                  style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #fff' }}
                ></span>
                {hasResult ? 'Ejecutar de nuevo' : 'Ejecutar Simulación'}
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
