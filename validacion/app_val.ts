// Ejecuta el motor de simulacion propio (src/lib/simulate-*.ts) con las mismas
// configuraciones usadas en la validacion con SimPy, para comparar resultados.
// Reporta Wq (espera en cola), W (tiempo en sistema) y la utilizacion promedio,
// con 25 replicas e intervalo de confianza al 95%.
//
// Ejecutar desde la raiz del proyecto:  npx tsx validacion/app_val.ts

import { simulate as simSimple, DEFAULT_LABELS } from '../src/lib/simulate-simple';
import { simulate as simMulti, type Stage } from '../src/lib/simulate-multietapa';
import { simulate as simDec, DEFAULT_DECISION_LABELS } from '../src/lib/simulate-decision';

// media y semi-ancho del intervalo de confianza al 95%
function stats(xs: number[]): [number, number] {
  const n = xs.length;
  const m = xs.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
  return [m, (1.96 * sd) / Math.sqrt(n)];
}

const H = 100000;
const R = 25;
const fmt = (t: [number, number]) => `${t[0].toFixed(2)} ± ${t[1].toFixed(2)}`;

// Proceso simple (M/M/c)
function runSimple(ia: number, s: number, c: number) {
  const W: number[] = [], Y: number[] = [], U: number[] = [];
  for (let r = 0; r < R; r++) {
    const x = simSimple({ interarrival: ia, service: s, mechanics: c, horizon: H, labels: DEFAULT_LABELS }, 5000 + r * 97);
    W.push(x.avgWait); Y.push(x.avgSystem); U.push(x.util);
  }
  return `Wq ${fmt(stats(W))} | W ${fmt(stats(Y))} | Util ${fmt(stats(U))}`;
}

// Multietapa (colas en tandem)
function runMulti() {
  const stages: Stage[] = [
    { name: 'E1', service: 5, resources: 1 },
    { name: 'E2', service: 7, resources: 2 },
    { name: 'E3', service: 6, resources: 1 },
  ];
  const W: number[] = [], Y: number[] = [], U: number[] = [];
  for (let r = 0; r < R; r++) {
    const x = simMulti(stages, 10, H, 5000 + r * 97);
    W.push(x.avgWait); Y.push(x.avgSystem); U.push(x.avgUtil);
  }
  return `Wq ${fmt(stats(W))} | W ${fmt(stats(Y))} | Util ${fmt(stats(U))}`;
}

// Con decision (compuerta 60/40)
function runDecision() {
  const cfg = {
    interarrival: 10, horizon: H,
    rec: { service: 5, resources: 1 },
    repA: { service: 8, resources: 1 },
    repB: { service: 15, resources: 2 },
    pay: { service: 4, resources: 1 },
    pA: 60, labels: DEFAULT_DECISION_LABELS,
  };
  const W: number[] = [], Y: number[] = [], U: number[] = [];
  for (let r = 0; r < R; r++) {
    const x = simDec(cfg, 5000 + r * 97);
    W.push(x.avgWait); Y.push(x.avgSystem); U.push(x.avgUtil);
  }
  return `Wq ${fmt(stats(W))} | W ${fmt(stats(Y))} | Util ${fmt(stats(U))}`;
}

console.log('SIMPLE M/M/1  |', runSimple(10, 7, 1));
console.log('SIMPLE M/M/2  |', runSimple(5, 8, 2));
console.log('MULTIETAPA    |', runMulti());
console.log('CON DECISION  |', runDecision());
