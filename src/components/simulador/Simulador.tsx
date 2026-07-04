'use client';

import React, { useRef, useState } from 'react';
import { DEFAULT_LABELS, plural, simulate, type SimConfig, type SimLabels, type SimResult } from '@/lib/simulate-simple';
import { Header } from '@/components/Header';
import { Flow } from './Flow';
import { NumField } from './NumField';
import { Results } from './Results';

function LabelRow({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="w-[72px] flex-none text-[12.5px] font-medium text-[#62626c]">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-[#e1e1e6] bg-white px-3 py-2 text-[13.5px] font-medium text-[#18181b] outline-none transition-colors placeholder:text-[#c4c4cc] focus:border-[#5a5ad6] focus:shadow-[0_0_0_3px_#eeeefb]"
      />
    </label>
  );
}

export default function Simulador() {
  const [cfg, setCfg] = useState<SimConfig>({
    interarrival: 8,
    service: 12,
    mechanics: 2,
    horizon: 480,
    labels: DEFAULT_LABELS,
  });
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [result, setResult] = useState<SimResult | null>(null);
  const runIdx = useRef(0);

  const upd = (k: keyof SimConfig) => (v: number) => setCfg((c) => ({ ...c, [k]: v }));

  // Valores tal cual los escribe el usuario (para los inputs de texto)
  const rawLabels = cfg.labels ?? DEFAULT_LABELS;
  const setLabel = (k: keyof SimLabels) => (v: string) =>
    setCfg((c) => ({ ...c, labels: { ...(c.labels ?? DEFAULT_LABELS), [k]: v } }));

  // Nombres resueltos: si un campo queda vacío, usa el valor por defecto
  const labels: SimLabels = {
    entity: rawLabels.entity.trim() || DEFAULT_LABELS.entity,
    activity: rawLabels.activity.trim() || DEFAULT_LABELS.activity,
    resource: rawLabels.resource.trim() || DEFAULT_LABELS.resource,
  };

  const run = () => {
    setPhase('running');
    runIdx.current += 1;
    const seed = (cfg.interarrival * 131 + cfg.service * 17 + cfg.mechanics * 7919 + cfg.horizon) | 0;
    setTimeout(() => {
      setResult(simulate({ ...cfg, labels }, seed + runIdx.current * 104729));
      setPhase('done');
    }, 950);
  };

  const reset = () => {
    setResult(null);
    setPhase('idle');
  };

  return (
    <div className="min-h-screen bg-[#fbfbfc] font-sans text-[#18181b] antialiased [text-rendering:optimizeLegibility]">
      <Header maxWidth={1280} />

      <main className="mx-auto max-w-[1280px] px-7 pb-20 pt-[30px]">
        <div className="mb-6">
          <h1 className="text-[23px] font-bold tracking-[-.02em]">Simulación de proceso</h1>
          <p className="mt-1 text-sm text-[#62626c]">
            Configura los parámetros de la cola y ejecuta una réplica de eventos discretos para el flujo Llegada →{' '}
            {labels.activity} → Fin.
          </p>
        </div>

        <Flow phase={phase} result={result} labels={labels} />

        <div className="grid grid-cols-[384px_1fr] items-start gap-[22px]">
          {/* Configuración */}
          <section className="rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)]">
            <div className="flex items-center gap-2.5 border-b border-[#ececef] px-5 py-4">
              <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">02</span>
              <span className="text-[14.5px] font-semibold tracking-[-.01em]">Configuración</span>
            </div>
            <div className="px-5 pb-5 pt-2">
              <div className="border-b border-[#ececef] py-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[.06em] text-[#9a9aa4]">Nombres</span>
                  <span className="text-[11.5px] text-[#9a9aa4]">personaliza el proceso</span>
                </div>
                <div className="flex flex-col gap-3">
                  <LabelRow label="Entidad" value={rawLabels.entity} placeholder="Auto" onChange={setLabel('entity')} />
                  <LabelRow label="Actividad" value={rawLabels.activity} placeholder="Reparación" onChange={setLabel('activity')} />
                  <LabelRow label="Recurso" value={rawLabels.resource} placeholder="Mecánico" onChange={setLabel('resource')} />
                </div>
              </div>

              <NumField
                label="Tiempo entre llegadas"
                unit="media · minutos"
                value={cfg.interarrival}
                onChange={upd('interarrival')}
                step={1}
                min={1}
                max={240}
                hint={`Intervalo promedio entre la llegada de dos ${plural(labels.entity).toLowerCase()} consecutivos.`}
              />
              <NumField
                label={`Tiempo de ${labels.activity.toLowerCase()}`}
                unit="media · minutos"
                value={cfg.service}
                onChange={upd('service')}
                step={1}
                min={1}
                max={480}
                hint={`Duración promedio del servicio de un ${labels.resource.toLowerCase()} por ${labels.entity.toLowerCase()}.`}
              />
              <NumField
                label={`${plural(labels.resource)} disponibles`}
                unit="servidores"
                value={cfg.mechanics}
                onChange={upd('mechanics')}
                step={1}
                min={1}
                max={12}
                integer
                hint="Número de servidores que atienden la cola en paralelo."
              />
              <NumField
                label="Horizonte de simulación"
                unit="minutos"
                value={cfg.horizon}
                onChange={upd('horizon')}
                step={30}
                min={30}
                max={4320}
                hint="Duración total de la jornada simulada (480 min = 8 horas)."
              />

              <button
                onClick={run}
                disabled={phase === 'running'}
                className="mt-[18px] inline-flex h-11 w-full items-center justify-center gap-[9px] rounded-[9px] bg-[#5a5ad6] text-sm font-semibold text-white shadow-[0_1px_2px_rgba(74,75,196,.4),inset_0_1px_0_rgba(255,255,255,.16)] transition-colors hover:bg-[#4b4bc4] active:translate-y-px disabled:cursor-default disabled:opacity-70"
              >
                {phase === 'running' ? (
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
                    {result ? 'Ejecutar de nuevo' : 'Ejecutar Simulación'}
                  </>
                )}
              </button>
              {result && (
                <button
                  onClick={reset}
                  className="mt-[9px] h-[38px] w-full rounded-[9px] border border-[#e1e1e6] bg-white text-[13px] font-medium text-[#62626c] transition-colors hover:bg-[#fafafa] hover:text-[#18181b]"
                >
                  Reiniciar resultados
                </button>
              )}

              <div className="mt-4 border-t border-dashed border-[#e1e1e6] pt-3.5 text-[11px] leading-[1.5] text-[#9a9aa4]">
                Las llegadas y los tiempos de servicio se modelan con <b className="font-semibold text-[#62626c]">distribución exponencial</b>.
                Cada ejecución genera una réplica independiente del sistema.
              </div>
            </div>
          </section>

          {/* Resultados */}
          <div>
            {!result ? (
              <div className="grid min-h-[360px] place-items-center rounded-xl border border-dashed border-[#e1e1e6] bg-white text-center">
                <div>
                  <div className="mx-auto mb-4 grid h-[46px] w-[46px] place-items-center rounded-xl border border-[#ececef] bg-[#fafafa]">
                    <i className="h-3.5 w-3.5 rounded-[4px] border-2 border-[#9a9aa4]"></i>
                  </div>
                  <h3 className="text-[15px] font-semibold">Sin resultados todavía</h3>
                  <p className="mx-auto mt-1.5 max-w-[320px] text-[13px] text-[#9a9aa4]">
                    Ajusta los parámetros y pulsa <b className="font-semibold">Ejecutar Simulación</b> para generar los
                    indicadores y la traza de eventos.
                  </p>
                </div>
              </div>
            ) : (
              <Results result={result} runCount={runIdx.current} labels={labels} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
