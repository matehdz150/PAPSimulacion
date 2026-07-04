'use client';

import React, { useRef, useState } from 'react';
import { DEFAULT_CONFIG, simulate, type DecisionConfig, type SimResult } from '@/lib/simulate-decision';
import { Flow } from './Flow';
import { ConfigPanel } from './ConfigPanel';
import { Results } from './Results';
import { Header } from '@/components/Header';

export default function ProcesoConDecision() {
  const [cfg, setCfg] = useState<DecisionConfig>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [result, setResult] = useState<SimResult | null>(null);
  const runIdx = useRef(0);

  const run = () => {
    setPhase('running');
    runIdx.current += 1;
    const seed =
      (cfg.interarrival * 131 +
        cfg.horizon +
        cfg.pA * 733 +
        cfg.rec.service * 7 +
        cfg.repA.service * 13 +
        cfg.repB.service * 17 +
        cfg.pay.service * 23 +
        (cfg.rec.resources + cfg.repA.resources + cfg.repB.resources + cfg.pay.resources) * 97) |
      0;
    setTimeout(() => {
      setResult(simulate(cfg, seed + runIdx.current * 104729));
      setPhase('done');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfc] font-sans text-[#18181b] antialiased [text-rendering:optimizeLegibility]">
      <Header maxWidth={1320} />

      <main className="mx-auto max-w-[1320px] px-7 pb-[90px] pt-[30px]">
        <div className="mb-6">
          <h1 className="text-[23px] font-bold tracking-[-.02em]">Proceso con decisión — Rutas alternativas</h1>
          <p className="mt-1 max-w-[780px] text-sm text-[#62626c]">
            Una compuerta de decisión divide el flujo en dos rutas con recursos independientes que convergen en una
            etapa final. Analiza cómo el reparto de la decisión afecta las esperas, la utilización y el desempeño global
            del sistema.
          </p>
        </div>

        <Flow phase={phase} result={result} cfg={cfg} />

        <ConfigPanel cfg={cfg} setCfg={setCfg} onRun={run} running={phase === 'running'} hasResult={!!result} />

        {!result ? (
          <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-[#e1e1e6] bg-white text-center">
            <div>
              <div className="mx-auto mb-4 grid h-[46px] w-[46px] place-items-center rounded-xl border border-[#ececef] bg-[#fafafa]">
                <i className="h-4 w-4 rotate-45 rounded-[3px] border-2 border-[#9a9aa4]"></i>
              </div>
              <h3 className="text-[15px] font-semibold">Sin resultados todavía</h3>
              <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] text-[#9a9aa4]">
                Ajusta las actividades y el reparto del gateway, luego pulsa <b className="font-semibold">Ejecutar Simulación</b> para
                analizar el impacto de la decisión.
              </p>
            </div>
          </div>
        ) : (
          <Results result={result} cfg={cfg} runCount={runIdx.current} />
        )}
      </main>
    </div>
  );
}
