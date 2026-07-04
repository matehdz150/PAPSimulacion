// Motor de simulación de eventos discretos — proceso con compuerta de decisión (XOR gateway)

export interface ActivityConfig {
  service: number;
  resources: number;
}

export interface DecisionLabels {
  rec: string; // "Recepción"
  repA: string; // actividad de la ruta A
  repB: string; // actividad de la ruta B
  pay: string; // "Pago"
}

export interface DecisionConfig {
  interarrival: number;
  horizon: number;
  rec: ActivityConfig;
  repA: ActivityConfig;
  repB: ActivityConfig;
  pay: ActivityConfig;
  pA: number; // % hacia ruta A
  labels?: DecisionLabels; // nombres editables (solo presentación)
}

export const DEFAULT_DECISION_LABELS: DecisionLabels = {
  rec: 'Recepción',
  repA: 'Actividad A',
  repB: 'Actividad B',
  pay: 'Pago',
};

// Rellena cualquier nombre vacío con su valor por defecto
export function resolveDecisionLabels(labels?: DecisionLabels): DecisionLabels {
  const d = DEFAULT_DECISION_LABELS;
  return {
    rec: labels?.rec?.trim() || d.rec,
    repA: labels?.repA?.trim() || d.repA,
    repB: labels?.repB?.trim() || d.repB,
    pay: labels?.pay?.trim() || d.pay,
  };
}

export interface EntityStageEvent {
  start: number;
  end: number;
  wait: number;
}

export interface Entity {
  id: number;
  arrival: number;
  route: 'A' | 'B';
  rec: Partial<EntityStageEvent>;
  rep: Partial<EntityStageEvent>;
  pay: Partial<EntityStageEvent>;
}

export interface StageResult {
  name: string;
  util: number;
  avgWait: number;
  avgSvc: number;
  processed: number;
}

export interface RouteResult {
  name: string;
  entities: number;
  assigned: number;
  avgSys: number;
  avgWait: number;
}

export interface SimResult {
  ents: Entity[];
  perStage: StageResult[];
  bottleneck: number;
  arrivalsCount: number;
  completed: number;
  avgWait: number;
  avgSystem: number;
  avgUtil: number;
  countA: number;
  countB: number;
  obsA: number;
  obsB: number;
  routes: { A: RouteResult; B: RouteResult };
  horizon: number;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runStage(
  indices: number[],
  ready: number[],
  servers: number,
  mean: number,
  exp: (m: number) => number,
  horizon: number,
  rec: (i: number, v: EntityStageEvent) => void
) {
  const order = [...indices].sort((a, b) => ready[a] - ready[b]);
  const free = new Array(Math.max(1, servers)).fill(0);
  let busy = 0,
    totWait = 0,
    totSvc = 0,
    done = 0;
  for (const i of order) {
    let k = 0;
    for (let j = 1; j < free.length; j++) if (free[j] < free[k]) k = j;
    const start = Math.max(ready[i], free[k]);
    const dur = exp(mean);
    const end = start + dur;
    free[k] = end;
    const wait = start - ready[i];
    rec(i, { start, end, wait });
    ready[i] = end;
    busy += Math.max(0, Math.min(end, horizon) - Math.min(start, horizon));
    if (end <= horizon) {
      done++;
      totWait += wait;
      totSvc += dur;
    }
  }
  return { busy, totWait, totSvc, done };
}

export function simulate(cfg: DecisionConfig, seed: number): SimResult {
  const rng = mulberry32(seed);
  const exp = (m: number) => -m * Math.log(1 - rng());
  const { interarrival, horizon, rec, repA, repB, pay, pA } = cfg;

  const arrivals: number[] = [];
  let t = 0;
  while (true) {
    t += exp(interarrival);
    if (t > horizon) break;
    arrivals.push(t);
  }
  const N = arrivals.length;
  const ents: Entity[] = arrivals.map((a, i) => ({
    id: i + 1,
    arrival: a,
    route: rng() * 100 < pA ? 'A' : 'B',
    rec: {},
    rep: {},
    pay: {},
  }));

  const ready = arrivals.slice();
  const all = ents.map((_, i) => i);
  const idxA = all.filter((i) => ents[i].route === 'A');
  const idxB = all.filter((i) => ents[i].route === 'B');

  const sRec = runStage(all, ready, rec.resources, rec.service, exp, horizon, (i, v) => (ents[i].rec = v));
  const sA = runStage(idxA, ready, repA.resources, repA.service, exp, horizon, (i, v) => (ents[i].rep = v));
  const sB = runStage(idxB, ready, repB.resources, repB.service, exp, horizon, (i, v) => (ents[i].rep = v));
  const sPay = runStage(all, ready, pay.resources, pay.service, exp, horizon, (i, v) => (ents[i].pay = v));

  const mk = (name: string, s: ReturnType<typeof runStage>, c: number): StageResult => ({
    name,
    util: Math.min(100, (s.busy / (Math.max(1, c) * horizon)) * 100),
    avgWait: s.done ? s.totWait / s.done : 0,
    avgSvc: s.done ? s.totSvc / s.done : 0,
    processed: s.done,
  });
  const L = resolveDecisionLabels(cfg.labels);
  const perStage: StageResult[] = [
    mk(L.rec, sRec, rec.resources),
    mk(L.repA, sA, repA.resources),
    mk(L.repB, sB, repB.resources),
    mk(L.pay, sPay, pay.resources),
  ];
  let bn = 0;
  perStage.forEach((p, i) => {
    if (p.util > perStage[bn].util) bn = i;
  });

  const routeStat = {
    A: { assigned: idxA.length, done: 0, sys: 0, wait: 0 },
    B: { assigned: idxB.length, done: 0, sys: 0, wait: 0 },
  };
  let totSys = 0,
    totWait = 0,
    completed = 0;
  ents.forEach((e) => {
    if (e.pay.end != null && e.pay.end <= horizon) {
      completed++;
      const sys = e.pay.end - e.arrival;
      const w = (e.rec.wait || 0) + (e.rep.wait || 0) + (e.pay.wait || 0);
      totSys += sys;
      totWait += w;
      const r = routeStat[e.route];
      r.done++;
      r.sys += sys;
      r.wait += w;
    }
  });

  return {
    ents,
    perStage,
    bottleneck: bn,
    arrivalsCount: N,
    completed,
    avgWait: completed ? totWait / completed : 0,
    avgSystem: completed ? totSys / completed : 0,
    avgUtil: perStage.reduce((a, p) => a + p.util, 0) / perStage.length,
    countA: idxA.length,
    countB: idxB.length,
    obsA: N ? (idxA.length / N) * 100 : 0,
    obsB: N ? (idxB.length / N) * 100 : 0,
    routes: {
      A: {
        name: L.repA,
        entities: routeStat.A.done,
        assigned: idxA.length,
        avgSys: routeStat.A.done ? routeStat.A.sys / routeStat.A.done : 0,
        avgWait: routeStat.A.done ? routeStat.A.wait / routeStat.A.done : 0,
      },
      B: {
        name: L.repB,
        entities: routeStat.B.done,
        assigned: idxB.length,
        avgSys: routeStat.B.done ? routeStat.B.sys / routeStat.B.done : 0,
        avgWait: routeStat.B.done ? routeStat.B.wait / routeStat.B.done : 0,
      },
    },
    horizon,
  };
}

export const fmt = (x: number, d = 1) =>
  Number(x || 0).toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------------- Exportar a Excel (.xls, HTML table) ---------------- */
export function exportToExcel(result: SimResult, cfg: DecisionConfig) {
  const L = resolveDecisionLabels(cfg.labels);
  const n2 = (x: number) => Number(x || 0).toFixed(2);
  const esc = (s: unknown) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Variables de entrada
  const input: [string, string | number][] = [
    ['Variables de entrada', ''],
    ['Tiempo entre llegadas (media, min)', cfg.interarrival],
    ['Horizonte (min)', cfg.horizon],
    ['Reparto configurado A / B (%)', `${cfg.pA} / ${100 - cfg.pA}`],
  ];
  const inputRows = input.map((r) => `<tr><td style="font-weight:bold">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('');
  const inCfgHead = ['Actividad (entrada)', 'Ruta', 'Tiempo de servicio (media, min)', 'Recursos disponibles'];
  const inCfgHeadRow = `<tr>${inCfgHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const inCfg: [string, string, number, number][] = [
    [L.rec, '—', cfg.rec.service, cfg.rec.resources],
    [L.repA, 'A', cfg.repA.service, cfg.repA.resources],
    [L.repB, 'B', cfg.repB.service, cfg.repB.resources],
    [L.pay, '—', cfg.pay.service, cfg.pay.resources],
  ];
  const inCfgRows = inCfg.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');

  const summary: [string, string | number][] = [
    ['Variables de salida', ''],
    ['Reparto observado A / B (%)', `${n2(result.obsA)} / ${n2(result.obsB)}`],
    ['Entidades llegadas', result.arrivalsCount],
    ['Entidades procesadas', result.completed],
    ['Entidades ruta A / B', `${result.countA} / ${result.countB}`],
    ['Tiempo de espera promedio (min)', n2(result.avgWait)],
    ['Tiempo en sistema promedio (min)', n2(result.avgSystem)],
    ['Utilización promedio (%)', n2(result.avgUtil)],
    ['Cuello de botella', `${result.perStage[result.bottleneck].name} (${n2(result.perStage[result.bottleneck].util)}%)`],
  ];
  const summaryRows = summary.map((r) => `<tr><td style="font-weight:bold">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('');

  const routeHead = ['Ruta', 'Actividad', 'Asignadas', 'Completadas', 'T. sistema prom. (min)', 'Espera prom. (min)'];
  const routeHeadRow = `<tr>${routeHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const routeRows = (['A', 'B'] as const)
    .map((k) => {
      const r = result.routes[k];
      return `<tr><td>${k}</td><td>${esc(r.name)}</td><td>${r.assigned}</td><td>${r.entities}</td><td>${n2(r.avgSys)}</td><td>${n2(r.avgWait)}</td></tr>`;
    })
    .join('');

  const stageHead = ['Actividad', 'Utilización (%)', 'Procesadas', 'Espera prom. (min)', 'Servicio prom. (min)'];
  const stageHeadRow = `<tr>${stageHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const stageRows = result.perStage
    .map((p) => `<tr><td>${esc(p.name)}</td><td>${n2(p.util)}</td><td>${p.processed}</td><td>${n2(p.avgWait)}</td><td>${n2(p.avgSvc)}</td></tr>`)
    .join('');

  const entHead = [
    'Entidad', 'Ruta', 'Llegada (min)',
    `${L.rec} · Inicio`, `${L.rec} · Fin`,
    'Actividad · Inicio', 'Actividad · Fin',
    `${L.pay} · Inicio`, `${L.pay} · Fin`,
  ];
  const entHeadRow = `<tr>${entHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const entRows = result.ents
    .map(
      (e) =>
        `<tr><td>${e.id}</td><td>${e.route}</td><td>${n2(e.arrival)}</td><td>${n2(e.rec.start ?? 0)}</td><td>${n2(e.rec.end ?? 0)}</td><td>${n2(
          e.rep.start ?? 0
        )}</td><td>${n2(e.rep.end ?? 0)}</td><td>${n2(e.pay.start ?? 0)}</td><td>${n2(e.pay.end ?? 0)}</td></tr>`
    )
    .join('');

  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Con decisión</x:Name>` +
    `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>` +
    `<body><table border="1">${inputRows}</table><br/><table border="1">${inCfgHeadRow}${inCfgRows}</table><br/>` +
    `<table border="1">${summaryRows}</table><br/><table border="1">${routeHeadRow}${routeRows}</table><br/>` +
    `<table border="1">${stageHeadRow}${stageRows}</table><br/><table border="1">${entHeadRow}${entRows}</table></body></html>`;

  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulacion-con-decision-${result.horizon}min.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const DEFAULT_CONFIG: DecisionConfig = {
  interarrival: 10,
  horizon: 480,
  rec: { service: 6, resources: 2 },
  repA: { service: 12, resources: 2 },
  repB: { service: 40, resources: 2 },
  pay: { service: 6, resources: 2 },
  pA: 60,
  labels: DEFAULT_DECISION_LABELS,
};
