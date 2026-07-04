'use client';

import React, { useRef, useState } from 'react';
import { DEFAULT_STAGES, simulate, type SimResult, type Stage } from '@/lib/simulate-multietapa';
import { Flow } from './Flow';
import { ConfigPanel } from './ConfigPanel';
import { Results } from './Results';
import { Header } from '@/components/Header';

export default function ProcesoMultietapa() {
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [interarrival, setInterarrival] = useState(11);
  const [horizon, setHorizon] = useState(480);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [result, setResult] = useState<SimResult | null>(null);
  const runIdx = useRef(0);

  const setStage = (i: number, key: 'service' | 'resources', v: number) =>
    setStages((arr) => arr.map((s, j) => (j === i ? { ...s, [key]: v } : s)));

  const setStageName = (i: number, name: string) =>
    setStages((arr) => arr.map((s, j) => (j === i ? { ...s, name } : s)));

  // Al cambiar la estructura (agregar/quitar etapa) el resultado previo deja de ser válido
  const resetResult = () => {
    setResult(null);
    setPhase('idle');
  };

  const addStage = () => {
    setStages((arr) => [...arr, { name: `Etapa ${arr.length + 1}`, service: 10, resources: 1 }]);
    resetResult();
  };

  const removeStage = (i: number) => {
    if (stages.length <= 1) return; // siempre al menos una etapa
    setStages((arr) => arr.filter((_, j) => j !== i));
    resetResult();
  };

  const run = () => {
    setPhase('running');
    runIdx.current += 1;
    const seed =
      (interarrival * 131 + horizon + stages.reduce((a, s, i) => a + s.service * (i + 3) + s.resources * 97, 0)) | 0;
    setTimeout(() => {
      setResult(simulate(stages, interarrival, horizon, seed + runIdx.current * 104729));
      setPhase('done');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfc] font-sans text-[#18181b] antialiased [text-rendering:optimizeLegibility]">
      <Header maxWidth={1320} />

      <main className="mx-auto max-w-[1320px] px-7 pb-[90px] pt-[30px]">
        <div className="mb-6">
          <h1 className="text-[23px] font-bold tracking-[-.02em]">Multietapa</h1>
          <p className="mt-1 max-w-[760px] text-sm text-[#62626c]">
            Modela un proceso con varias actividades secuenciales, cada una con sus propios recursos. Ejecuta la
            simulación para identificar en qué etapa se acumulan las esperas y dónde está el cuello de botella.
          </p>
        </div>

        <Flow phase={phase} result={result} stages={stages} interarrival={interarrival} onRemoveStage={removeStage} />

        <ConfigPanel
          stages={stages}
          setStage={setStage}
          setStageName={setStageName}
          onAddStage={addStage}
          onRemoveStage={removeStage}
          interarrival={interarrival}
          setInterarrival={setInterarrival}
          horizon={horizon}
          setHorizon={setHorizon}
          onRun={run}
          running={phase === 'running'}
          hasResult={!!result}
          bottleneck={result?.bottleneck}
        />

        {!result ? (
          <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-[#e1e1e6] bg-white text-center">
            <div>
              <div className="mx-auto mb-4 grid h-[46px] w-[46px] place-items-center rounded-xl border border-[#ececef] bg-[#fafafa]">
                <i className="h-3.5 w-3.5 rounded-[4px] border-2 border-[#9a9aa4]"></i>
              </div>
              <h3 className="text-[15px] font-semibold">Sin resultados todavía</h3>
              <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] text-[#9a9aa4]">
                Configura cada actividad y pulsa <b className="font-semibold">Ejecutar Simulación</b> para ver los KPIs,
                la utilización por etapa y la traza completa de eventos.
              </p>
            </div>
          </div>
        ) : (
          <Results result={result} stages={stages} interarrival={interarrival} runCount={runIdx.current} />
        )}
      </main>
    </div>
  );
}
