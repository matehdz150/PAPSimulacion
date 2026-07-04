// Motor de simulación de eventos discretos — proceso multietapa (cola en tándem)

export interface Stage {
  name: string;
  service: number; // tiempo medio de servicio (min)
  resources: number; // recursos disponibles
}

export interface StageResult {
  name: string;
  resources: number;
  avgWait: number;
  avgSvc: number;
  util: number;
  processed: number;
}

export interface EntityStageEvent {
  start: number;
  end: number;
  wait: number;
}

export interface Entity {
  id: number;
  arrival: number;
  st: EntityStageEvent[];
}

export interface SimResult {
  ents: Entity[];
  perStage: StageResult[];
  arrivalsCount: number;
  completed: number;
  avgWait: number;
  avgSystem: number;
  avgUtil: number;
  bottleneck: number;
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

export function simulate(
  stages: Stage[],
  interarrival: number,
  horizon: number,
  seed: number
): SimResult {
  const rng = mulberry32(seed);
  const exp = (mean: number) => -mean * Math.log(1 - rng());

  // llegadas
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
    st: stages.map(() => ({ start: 0, end: 0, wait: 0 })),
  }));
  let ready = arrivals.slice();

  const stageStats = stages.map(() => ({ busy: 0, totWait: 0, totSvc: 0, done: 0 }));

  stages.forEach((stg, s) => {
    const order = ents.map((_, i) => i).sort((a, b) => ready[a] - ready[b]);
    const free = new Array(stg.resources).fill(0);
    for (const i of order) {
      let k = 0;
      for (let j = 1; j < free.length; j++) if (free[j] < free[k]) k = j;
      const start = Math.max(ready[i], free[k]);
      const dur = exp(stg.service);
      const end = start + dur;
      free[k] = end;
      const wait = start - ready[i];
      ents[i].st[s] = { start, end, wait };
      ready[i] = end;
      stageStats[s].busy += Math.max(0, Math.min(end, horizon) - Math.min(start, horizon));
      if (end <= horizon) {
        stageStats[s].done++;
        stageStats[s].totWait += wait;
        stageStats[s].totSvc += dur;
      }
    }
  });

  const perStage: StageResult[] = stages.map((stg, s) => {
    const ss = stageStats[s];
    const util = Math.min(100, (ss.busy / (stg.resources * horizon)) * 100);
    return {
      name: stg.name,
      resources: stg.resources,
      avgWait: ss.done ? ss.totWait / ss.done : 0,
      avgSvc: ss.done ? ss.totSvc / ss.done : 0,
      util,
      processed: ss.done,
    };
  });

  const last = stages.length - 1;
  let totSys = 0,
    totWaitAll = 0,
    completed = 0;
  ents.forEach((e) => {
    if (e.st[last].end <= horizon) {
      completed++;
      totSys += e.st[last].end - e.arrival;
      totWaitAll += e.st.reduce((acc, x) => acc + x.wait, 0);
    }
  });

  let bn = 0;
  perStage.forEach((p, i) => {
    if (p.util > perStage[bn].util) bn = i;
  });

  return {
    ents,
    perStage,
    arrivalsCount: N,
    completed,
    avgWait: completed ? totWaitAll / completed : 0,
    avgSystem: completed ? totSys / completed : 0,
    avgUtil: perStage.reduce((a, p) => a + p.util, 0) / perStage.length,
    bottleneck: bn,
    horizon,
  };
}

export const fmt = (x: number, d = 1) =>
  Number(x).toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------------- Exportar a Excel (.xls, HTML table) ---------------- */
export function exportToExcel(result: SimResult, stages: Stage[], interarrival: number) {
  const n2 = (x: number) => Number(x || 0).toFixed(2);
  const esc = (s: unknown) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Variables de entrada
  const input: [string, string | number][] = [
    ['Variables de entrada', ''],
    ['Tiempo entre llegadas (media, min)', interarrival],
    ['Horizonte (min)', result.horizon],
    ['Número de etapas', stages.length],
  ];
  const inputRows = input.map((r) => `<tr><td style="font-weight:bold">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('');
  const inCfgHead = ['Actividad (entrada)', 'Tiempo de servicio (media, min)', 'Recursos disponibles'];
  const inCfgHeadRow = `<tr>${inCfgHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const inCfgRows = stages.map((s) => `<tr><td>${esc(s.name)}</td><td>${s.service}</td><td>${s.resources}</td></tr>`).join('');

  const summary: [string, string | number][] = [
    ['Variables de salida', ''],
    ['Horizonte (min)', result.horizon],
    ['Entidades llegadas', result.arrivalsCount],
    ['Entidades procesadas', result.completed],
    ['Tiempo de espera promedio (min)', n2(result.avgWait)],
    ['Tiempo en sistema promedio (min)', n2(result.avgSystem)],
    ['Utilización promedio (%)', n2(result.avgUtil)],
    ['Cuello de botella', `${result.perStage[result.bottleneck].name} (${n2(result.perStage[result.bottleneck].util)}%)`],
  ];
  const summaryRows = summary.map((r) => `<tr><td style="font-weight:bold">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('');

  const stageHead = ['Actividad', 'Recursos', 'Utilización (%)', 'Procesadas', 'Espera prom. (min)', 'Servicio prom. (min)'];
  const stageHeadRow = `<tr>${stageHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const stageRows = result.perStage
    .map((p) => `<tr><td>${esc(p.name)}</td><td>${p.resources}</td><td>${n2(p.util)}</td><td>${p.processed}</td><td>${n2(p.avgWait)}</td><td>${n2(p.avgSvc)}</td></tr>`)
    .join('');

  const stageNames = result.perStage.map((p) => p.name);
  const entHead = ['Entidad', 'Llegada (min)', ...stageNames.flatMap((n) => [`${n} · Inicio`, `${n} · Fin`, `${n} · Espera`])];
  const entHeadRow = `<tr>${entHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const entRows = result.ents
    .map((e) => {
      const cells = e.st.map((x) => `<td>${n2(x.start)}</td><td>${n2(x.end)}</td><td>${n2(x.wait)}</td>`).join('');
      return `<tr><td>${e.id}</td><td>${n2(e.arrival)}</td>${cells}</tr>`;
    })
    .join('');

  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Multietapa</x:Name>` +
    `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>` +
    `<body><table border="1">${inputRows}</table><br/><table border="1">${inCfgHeadRow}${inCfgRows}</table><br/>` +
    `<table border="1">${summaryRows}</table><br/><table border="1">${stageHeadRow}${stageRows}</table><br/>` +
    `<table border="1">${entHeadRow}${entRows}</table></body></html>`;

  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulacion-multietapa-${result.perStage.length}etapas-${result.horizon}min.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const DEFAULT_STAGES: Stage[] = [
  { name: 'Etapa 1', service: 5, resources: 1 },
  { name: 'Etapa 2', service: 15, resources: 2 },
  { name: 'Etapa 3', service: 30, resources: 3 },
  { name: 'Etapa 4', service: 6, resources: 1 },
];
