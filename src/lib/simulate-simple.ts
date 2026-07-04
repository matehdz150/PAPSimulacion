// Motor de simulación de eventos discretos — proceso simple (cola M/M/c)

export interface SimLabels {
  entity: string; // entidad que llega (p.ej. "Auto")
  activity: string; // actividad/servicio (p.ej. "Reparación")
  resource: string; // recurso/servidor (p.ej. "Mecánico")
}

export interface SimConfig {
  interarrival: number; // media entre llegadas (min)
  service: number; // media de servicio (min)
  mechanics: number; // servidores en paralelo
  horizon: number; // horizonte de simulación (min)
  labels?: SimLabels; // nombres editables (solo presentación)
}

export interface SimRow {
  car: number;
  arrival: number;
  start: number;
  end: number;
  wait: number;
  mech: number;
}

export interface SimResult extends SimConfig {
  rows: SimRow[];
  arrivalsCount: number;
  served: number;
  avgWait: number;
  avgSystem: number;
  util: number;
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

export function simulate({ interarrival, service, mechanics, horizon }: SimConfig, seed: number): SimResult {
  const rng = mulberry32(seed);
  const exp = (mean: number) => -mean * Math.log(1 - rng());

  const arrivals: number[] = [];
  let t = 0;
  while (true) {
    t += exp(interarrival);
    if (t > horizon) break;
    arrivals.push(t);
  }

  const serverFree = new Array(mechanics).fill(0);
  const rows: SimRow[] = [];
  let totalWait = 0,
    totalSystem = 0,
    busyInHorizon = 0,
    served = 0,
    completedWait = 0;

  for (let i = 0; i < arrivals.length; i++) {
    const a = arrivals[i];
    let s = 0;
    for (let k = 1; k < mechanics; k++) if (serverFree[k] < serverFree[s]) s = k;
    const start = Math.max(a, serverFree[s]);
    const dur = exp(service);
    const end = start + dur;
    serverFree[s] = end;
    const wait = start - a;
    rows.push({ car: i + 1, arrival: a, start, end, wait, mech: s + 1 });
    busyInHorizon += Math.max(0, Math.min(end, horizon) - Math.min(start, horizon));
    if (end <= horizon) {
      served++;
      totalSystem += end - a;
      completedWait += wait;
      totalWait += wait;
    }
  }

  const util = Math.min(100, (busyInHorizon / (mechanics * horizon)) * 100);
  return {
    rows,
    arrivalsCount: arrivals.length,
    served,
    avgWait: served ? completedWait / served : 0,
    avgSystem: served ? totalSystem / served : 0,
    util,
    interarrival,
    service,
    mechanics,
    horizon,
  };
}

export const fmt = (x: number, d = 1) =>
  Number(x).toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d });

export const DEFAULT_LABELS: SimLabels = { entity: 'Auto', activity: 'Reparación', resource: 'Mecánico' };
// Plural sencillo en español (suficiente para las etiquetas)
export const plural = (s: string) => {
  const t = s.trim();
  return /s$/i.test(t) ? t : t + 's';
};
// Inicial para la etiqueta corta del recurso (p.ej. "Mecánico" -> "M")
export const initial = (s: string) => s.trim().charAt(0).toUpperCase() || 'R';

/* ---------------- Exportar a Excel (.xls, HTML table) ---------------- */
export function exportToExcel(result: SimResult) {
  const L = result.labels ?? DEFAULT_LABELS;
  const n2 = (x: number) => Number(x).toFixed(2);
  const esc = (s: unknown) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const head = [L.entity, L.resource, 'Llegada (min)', 'Inicio servicio (min)', 'Fin servicio (min)', 'Espera (min)'];

  const summary: [string, string | number][] = [
    ['Resumen de la simulación', ''],
    ['Tiempo entre llegadas (media, min)', result.interarrival],
    [`Tiempo de ${L.activity.toLowerCase()} (media, min)`, result.service],
    [`${plural(L.resource)} disponibles`, result.mechanics],
    ['Horizonte (min)', result.horizon],
    [`${plural(L.entity)} llegados`, result.arrivalsCount],
    [`${plural(L.entity)} atendidos`, result.served],
    ['Tiempo de espera promedio (min)', n2(result.avgWait)],
    ['Tiempo en sistema promedio (min)', n2(result.avgSystem)],
    [`Utilización del ${L.resource.toLowerCase()} (%)`, n2(result.util)],
  ];

  const summaryRows = summary
    .map((r) => `<tr><td style="font-weight:bold">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`)
    .join('');
  const headRow = `<tr>${head.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const bodyRows = result.rows
    .map(
      (r) =>
        `<tr><td>${r.car}</td><td>${initial(L.resource)}${r.mech}</td><td>${n2(r.arrival)}</td><td>${n2(r.start)}</td><td>${n2(r.end)}</td><td>${n2(r.wait)}</td></tr>`
    )
    .join('');

  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Simulación</x:Name>` +
    `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>` +
    `<body><table border="1">${summaryRows}<tr><td></td></tr>${headRow}${bodyRows}</table></body></html>`;

  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulacion-taller-${result.mechanics}mec-${result.horizon}min.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
