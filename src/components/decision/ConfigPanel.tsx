'use client';

import React from 'react';
import type { ActivityConfig, DecisionConfig } from '@/lib/simulate-decision';

function CellNum({
  value,
  onChange,
  unit,
  min = 1,
  max = 9999,
  integer,
}: {
  value: number;
  onChange: (v: number) => void;
  unit: string;
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
    <div className="ml-auto flex w-[118px] items-center overflow-hidden rounded-lg border border-[#e1e1e6] transition-colors focus-within:border-[#5a5ad6] focus-within:shadow-[0_0_0_3px_#eeeefb]">
      <input
        type="number"
        value={value}
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

interface Activity {
  key: 'rec' | 'repA' | 'repB' | 'pay';
  n: string;
  sub: string;
  dot: '' | 'A' | 'B';
}

const ACTS: Activity[] = [
  { key: 'rec', n: 'Recepción', sub: 'Todas las entidades', dot: '' },
  { key: 'repA', n: 'Reparación Simple', sub: 'Ruta A', dot: 'A' },
  { key: 'repB', n: 'Reparación Compleja', sub: 'Ruta B', dot: 'B' },
  { key: 'pay', n: 'Pago', sub: 'Convergencia', dot: '' },
];

export function ConfigPanel({
  cfg,
  setCfg,
  onRun,
  running,
  hasResult,
}: {
  cfg: DecisionConfig;
  setCfg: React.Dispatch<React.SetStateAction<DecisionConfig>>;
  onRun: () => void;
  running: boolean;
  hasResult: boolean;
}) {
  const setAct = (act: Activity['key'], key: keyof ActivityConfig, v: number) =>
    setCfg((c) => ({ ...c, [act]: { ...c[act], [key]: v } }));
  const setPA = (v: number) => setCfg((c) => ({ ...c, pA: Math.max(0, Math.min(100, Math.round(v))) }));

  return (
    <section className="mb-[22px] rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
      <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">02</span>
        <span className="text-[14.5px] font-semibold tracking-[-.01em]">Configuración de la simulación</span>
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
            </tr>
          </thead>
          <tbody>
            {ACTS.map((a, i) => (
              <tr key={a.key}>
                <td className="border-b border-[#ececef] px-3 py-[9px] last:border-b-0">
                  <div className="flex items-center gap-[11px]">
                    <span
                      className={
                        'grid h-[26px] w-[26px] flex-none place-items-center rounded-lg border font-mono text-[11px] font-bold ' +
                        (a.dot === 'A'
                          ? 'border-[#d3d3f5] bg-[#eeeefb] text-[#5a5ad6]'
                          : a.dot === 'B'
                          ? 'border-[#c2e4dd] bg-[#e6f4f1] text-[#2f9b8e]'
                          : 'border-[#ececef] bg-[#fafafa] text-[#9a9aa4]')
                      }
                    >
                      {a.dot || i + 1}
                    </span>
                    <span className="text-[13.5px] font-medium">
                      {a.n}
                      <small className="block text-[11px] font-normal text-[#9a9aa4]">{a.sub}</small>
                    </span>
                  </div>
                </td>
                <td className="border-b border-[#ececef] px-3 py-[9px]">
                  <CellNum value={cfg[a.key].service} unit="min" min={1} max={480} onChange={(v) => setAct(a.key, 'service', v)} />
                </td>
                <td className="border-b border-[#ececef] px-3 py-[9px]">
                  <CellNum value={cfg[a.key].resources} unit="#" integer min={1} max={20} onChange={(v) => setAct(a.key, 'resources', v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 grid grid-cols-[360px_1fr] gap-[26px] border-t border-dashed border-[#e1e1e6] pt-5">
          <div>
            <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[.06em] text-[#9a9aa4]">Parámetros generales</div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <div className="mb-2 flex justify-between text-[12.5px] font-medium text-[#62626c]">
                  <span>Entre llegadas</span>
                  <span className="text-[#9a9aa4]">media</span>
                </div>
                <div className="flex items-stretch overflow-hidden rounded-[9px] border border-[#e1e1e6] bg-white transition-colors focus-within:border-[#5a5ad6] focus-within:shadow-[0_0_0_3px_#eeeefb]">
                  <input
                    type="number"
                    value={cfg.interarrival}
                    min={1}
                    max={240}
                    onChange={(e) => setCfg((c) => ({ ...c, interarrival: Math.max(1, Math.min(240, parseFloat(e.target.value || '1'))) }))}
                    className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 py-2.5 font-mono text-[15px] font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="grid place-items-center border-l border-[#ececef] bg-[#fafafa] px-[11px] text-[11.5px] font-semibold text-[#9a9aa4]">min</span>
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-[12.5px] font-medium text-[#62626c]">
                  <span>Horizonte</span>
                  <span className="text-[#9a9aa4]">total</span>
                </div>
                <div className="flex items-stretch overflow-hidden rounded-[9px] border border-[#e1e1e6] bg-white transition-colors focus-within:border-[#5a5ad6] focus-within:shadow-[0_0_0_3px_#eeeefb]">
                  <input
                    type="number"
                    value={cfg.horizon}
                    step={30}
                    min={60}
                    max={4320}
                    onChange={(e) => setCfg((c) => ({ ...c, horizon: Math.max(60, Math.min(4320, parseFloat(e.target.value || '60'))) }))}
                    className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 py-2.5 font-mono text-[15px] font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="grid place-items-center border-l border-[#ececef] bg-[#fafafa] px-[11px] text-[11.5px] font-semibold text-[#9a9aa4]">min</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[.06em] text-[#9a9aa4]">
              Compuerta de decisión · ¿Tipo de reparación?
            </div>
            <div className="rounded-[11px] border border-[#ececef] bg-[#fafafa] px-[18px] py-4">
              <div className="mb-3.5 flex items-end justify-between">
                <div className="flex flex-col gap-[3px]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-[3px] bg-[#5a5ad6]"></span>Ruta A · Simple
                  </span>
                  <span className="font-mono text-2xl font-semibold tracking-[-.02em] text-[#5a5ad6]">{cfg.pA}%</span>
                </div>
                <div className="flex flex-col items-end gap-[3px] text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    Ruta B · Compleja<span className="h-2 w-2 rounded-[3px] bg-[#2f9b8e]"></span>
                  </span>
                  <span className="font-mono text-2xl font-semibold tracking-[-.02em] text-[#2f9b8e]">{100 - cfg.pA}%</span>
                </div>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-[#ececef]">
                <div className="bg-[#5a5ad6]" style={{ width: cfg.pA + '%' }}></div>
                <div className="bg-[#2f9b8e]" style={{ width: 100 - cfg.pA + '%' }}></div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={cfg.pA}
                onChange={(e) => setPA(parseFloat(e.target.value))}
                className="mt-4 h-1 w-full appearance-none rounded-full bg-[#e1e1e6] outline-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5a5ad6] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_2px_rgba(24,24,27,.04)]"
              />
              <div className="mt-[11px] text-center text-[11px] text-[#9a9aa4]">
                Las probabilidades siempre suman 100%. Arrastra para ajustar el reparto.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onRun}
            disabled={running}
            className="inline-flex h-[46px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[9px] bg-[#5a5ad6] px-7 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(74,75,196,.4),inset_0_1px_0_rgba(255,255,255,.16)] transition-colors hover:bg-[#4b4bc4] active:translate-y-px disabled:cursor-default disabled:opacity-70"
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
