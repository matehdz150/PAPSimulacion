// Motor de simulación de eventos discretos — modelado libre (grafo arbitrario)

export type NodeType = 'arrival' | 'activity' | 'gateway' | 'end';

export interface FreeNodeData {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  interarrival?: number; // arrival
  service?: number; // activity
  resources?: number; // activity
  splitA?: number; // gateway, % hacia el puerto A
}

export interface FreeEdge {
  id: string;
  from: string;
  fromPort?: 'A' | 'B'; // solo relevante si el origen es un gateway
  to: string;
}

interface Visit {
  node: string;
  start: number;
  end: number;
  wait: number;
}

export interface Entity {
  id: number;
  arrivalTime: number;
  originNodeId: string;
  originName: string;
  endNodeId: string | null;
  endTime: number | null;
  completed: boolean;
  visits: Visit[];
  totalWait?: number;
}

export interface NodeStat {
  id: string;
  name: string;
  util: number;
  processed: number;
  avgSvc: number;
  avgWait: number;
}

export interface ThroughputInfo {
  arrived: number;
  exited: number;
}

export interface SimResult {
  entities: Entity[];
  nodeStats: NodeStat[];
  throughput: Record<string, ThroughputInfo>;
  bottleneckId: string | null;
  bottleneckName: string;
  bottleneckUtil: number;
  arrivalsCount: number;
  completed: number;
  avgWait: number;
  avgSystem: number;
  avgUtil: number;
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

interface HeapEvent {
  time: number;
  kind: 'enter' | 'depart';
  nodeId: string;
  entityId: number;
  start?: number;
  end?: number;
}

function heapPush(h: HeapEvent[], item: HeapEvent) {
  h.push(item);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p].time <= h[i].time) break;
    [h[p], h[i]] = [h[i], h[p]];
    i = p;
  }
}

function heapPop(h: HeapEvent[]): HeapEvent {
  const top = h[0];
  const last = h.pop()!;
  if (h.length) {
    h[0] = last;
    let i = 0;
    while (true) {
      const l = 2 * i + 1,
        r = 2 * i + 2;
      let s = i;
      if (l < h.length && h[l].time < h[s].time) s = l;
      if (r < h.length && h[r].time < h[s].time) s = r;
      if (s === i) break;
      [h[s], h[i]] = [h[i], h[s]];
      i = s;
    }
  }
  return top;
}

export function simulateGraph(nodesArr: FreeNodeData[], edgesArr: FreeEdge[], horizon: number, seed: number): SimResult {
  const rng = mulberry32(seed);
  const exp = (m: number) => -Math.max(0.0001, m) * Math.log(1 - rng());
  const byId: Record<string, FreeNodeData> = Object.fromEntries(nodesArr.map((n) => [n.id, n]));
  const outgoing: Record<string, FreeEdge[]> = {};
  edgesArr.forEach((e) => {
    (outgoing[e.from] ||= []).push(e);
  });

  interface Runtime {
    busy: number;
    queue: { entityId: number; enq: number }[];
    busyTime: number;
    totalWait: number;
    totalSvc: number;
    processed: number;
  }
  const runtime: Record<string, Runtime> = {};
  nodesArr.forEach((n) => {
    runtime[n.id] = { busy: 0, queue: [], busyTime: 0, totalWait: 0, totalSvc: 0, processed: 0 };
  });

  const entities: Entity[] = [];
  let seq = 0;
  const events: HeapEvent[] = [];

  nodesArr
    .filter((n) => n.type === 'arrival')
    .forEach((an) => {
      let t = 0;
      while (true) {
        t += exp(an.interarrival || 1);
        if (t > horizon) break;
        const id = seq++;
        entities[id] = {
          id: id + 1,
          arrivalTime: t,
          originNodeId: an.id,
          originName: an.name,
          endNodeId: null,
          endTime: null,
          completed: false,
          visits: [],
        };
        heapPush(events, { time: t, kind: 'enter', nodeId: an.id, entityId: id });
      }
    });

  function enter(entityId: number, nodeId: string, time: number, hops = 0) {
    if (hops > 80) return;
    const node = byId[nodeId];
    if (!node) return;

    if (node.type === 'end') {
      const e = entities[entityId];
      e.endNodeId = nodeId;
      e.endTime = time;
      e.completed = time <= horizon;
      return;
    }

    if (node.type === 'gateway') {
      const outs = outgoing[nodeId] || [];
      const aEdge = outs.find((o) => o.fromPort === 'A');
      const bEdge = outs.find((o) => o.fromPort === 'B');
      let chosen: FreeEdge | undefined;
      if (aEdge && bEdge) chosen = rng() * 100 < (node.splitA == null ? 50 : node.splitA) ? aEdge : bEdge;
      else chosen = aEdge || bEdge || outs[0];
      if (chosen) enter(entityId, chosen.to, time, hops + 1);
      return;
    }

    if (node.type === 'activity') {
      const rt = runtime[nodeId];
      const cap = Math.max(1, node.resources || 1);
      if (rt.busy < cap) {
        rt.busy++;
        const dur = exp(node.service || 1);
        const start = time,
          end = start + dur;
        entities[entityId].visits.push({ node: node.name, start, end, wait: 0 });
        rt.busyTime += Math.max(0, Math.min(end, horizon) - Math.min(start, horizon));
        heapPush(events, { time: end, kind: 'depart', nodeId, entityId, start, end });
      } else {
        rt.queue.push({ entityId, enq: time });
      }
      return;
    }

    if (node.type === 'arrival') {
      const outs = outgoing[nodeId] || [];
      const target = outs[0];
      if (target) enter(entityId, target.to, time, hops + 1);
      return;
    }
  }

  function depart(ev: HeapEvent) {
    const { nodeId, entityId, start, end } = ev as Required<HeapEvent>;
    const node = byId[nodeId];
    const rt = runtime[nodeId];
    rt.busy--;
    if (end <= horizon) {
      rt.processed++;
      rt.totalSvc += end - start;
    }
    if (rt.queue.length) {
      const nxt = rt.queue.shift()!;
      const wait = ev.time - nxt.enq;
      rt.busy++;
      const dur = exp(node.service || 1);
      const s = ev.time,
        e = s + dur;
      entities[nxt.entityId].visits.push({ node: node.name, start: s, end: e, wait });
      rt.busyTime += Math.max(0, Math.min(e, horizon) - Math.min(s, horizon));
      if (e <= horizon) rt.totalWait += wait;
      heapPush(events, { time: e, kind: 'depart', nodeId, entityId: nxt.entityId, start: s, end: e });
    }
    const outs = outgoing[nodeId] || [];
    let target = outs[0];
    if (outs.length > 1) target = outs[Math.floor(rng() * outs.length)];
    if (target) enter(entityId, target.to, ev.time);
  }

  while (events.length) {
    const ev = heapPop(events);
    if (ev.kind === 'enter') enter(ev.entityId, ev.nodeId, ev.time);
    else depart(ev);
  }

  const nodeStats: NodeStat[] = nodesArr
    .filter((n) => n.type === 'activity')
    .map((n) => {
      const rt = runtime[n.id];
      const cap = Math.max(1, n.resources || 1);
      const util = Math.min(100, (rt.busyTime / (cap * horizon)) * 100);
      return {
        id: n.id,
        name: n.name,
        util,
        processed: rt.processed,
        avgSvc: rt.processed ? rt.totalSvc / rt.processed : 0,
        avgWait: rt.processed ? rt.totalWait / rt.processed : 0,
      };
    });
  let bnIdx = -1;
  nodeStats.forEach((p, i) => {
    if (bnIdx === -1 || p.util > nodeStats[bnIdx].util) bnIdx = i;
  });

  const arrivalsCount = entities.length;
  let completed = 0,
    totalSys = 0,
    totalWaitAll = 0;
  entities.forEach((e) => {
    if (e.completed) {
      completed++;
      totalSys += e.endTime! - e.arrivalTime;
      const w = e.visits.reduce((a, v) => a + v.wait, 0);
      e.totalWait = w;
      totalWaitAll += w;
    }
  });
  const avgUtil = nodeStats.length ? nodeStats.reduce((a, p) => a + p.util, 0) / nodeStats.length : 0;

  const throughput: Record<string, ThroughputInfo> = {};
  nodesArr.forEach((n) => {
    throughput[n.id] = { arrived: 0, exited: 0 };
  });
  entities.forEach((e) => {
    if (throughput[e.originNodeId]) throughput[e.originNodeId].arrived++;
    if (e.endNodeId && e.completed && throughput[e.endNodeId]) throughput[e.endNodeId].exited++;
  });

  return {
    entities,
    nodeStats,
    throughput,
    bottleneckId: bnIdx >= 0 ? nodeStats[bnIdx].id : null,
    bottleneckName: bnIdx >= 0 ? nodeStats[bnIdx].name : '—',
    bottleneckUtil: bnIdx >= 0 ? nodeStats[bnIdx].util : 0,
    arrivalsCount,
    completed,
    avgWait: completed ? totalWaitAll / completed : 0,
    avgSystem: completed ? totalSys / completed : 0,
    avgUtil,
    horizon,
  };
}

export const fmt = (x: number, d = 1) =>
  Number(x || 0).toLocaleString('es', { minimumFractionDigits: d, maximumFractionDigits: d });

export const DEFAULT_NODES: FreeNodeData[] = [
  { id: 'n1', type: 'arrival', name: 'Llegada', x: 40, y: 220, interarrival: 10 },
  { id: 'n2', type: 'activity', name: 'Recepción', x: 280, y: 190, service: 12, resources: 2 },
  { id: 'n3', type: 'end', name: 'Fin', x: 610, y: 220 },
];
export const DEFAULT_EDGES: FreeEdge[] = [
  { id: 'e1', from: 'n1', to: 'n2' },
  { id: 'e2', from: 'n2', to: 'n3' },
];

/* ---------------- Exportar a Excel (.xls, HTML table) ---------------- */
export function exportToExcel(result: SimResult, nodes: FreeNodeData[], edges: FreeEdge[]) {
  const n2 = (x: number) => Number(x || 0).toFixed(2);
  const esc = (s: unknown) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const typeLabel: Record<NodeType, string> = { arrival: 'Llegada', activity: 'Actividad', gateway: 'Compuerta', end: 'Fin' };
  const byId: Record<string, FreeNodeData> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const dash = (v: number | undefined) => (v == null ? '—' : v);

  // Variables de entrada
  const input: [string, string | number][] = [
    ['Variables de entrada', ''],
    ['Horizonte (min)', result.horizon],
    ['Bloques en el modelo', nodes.length],
    ['Conexiones', edges.length],
  ];
  const inputRows = input.map((r) => `<tr><td style="font-weight:bold">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('');

  const inNodeHead = ['Bloque', 'Tipo', 'Tiempo entre llegadas (min)', 'Tiempo de servicio (min)', 'Recursos', 'Reparto puerto A (%)'];
  const inNodeHeadRow = `<tr>${inNodeHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const inNodeRows = nodes
    .map(
      (n) =>
        `<tr><td>${esc(n.name)}</td><td>${esc(typeLabel[n.type])}</td><td>${dash(n.interarrival)}</td><td>${dash(n.service)}</td><td>${dash(
          n.resources
        )}</td><td>${dash(n.splitA)}</td></tr>`
    )
    .join('');

  const edgeHead = ['Origen', 'Puerto', 'Destino'];
  const edgeHeadRow = `<tr>${edgeHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const edgeRows = edges
    .map((e) => `<tr><td>${esc(byId[e.from]?.name ?? e.from)}</td><td>${esc(e.fromPort ?? '—')}</td><td>${esc(byId[e.to]?.name ?? e.to)}</td></tr>`)
    .join('');

  const summary: [string, string | number][] = [
    ['Variables de salida', ''],
    ['Horizonte (min)', result.horizon],
    ['Entidades generadas', result.arrivalsCount],
    ['Entidades completadas', result.completed],
    ['Tiempo de espera promedio (min)', n2(result.avgWait)],
    ['Tiempo en sistema promedio (min)', n2(result.avgSystem)],
    ['Utilización promedio (%)', n2(result.avgUtil)],
    ['Cuello de botella', `${result.bottleneckName} (${n2(result.bottleneckUtil)}%)`],
  ];
  const summaryRows = summary.map((r) => `<tr><td style="font-weight:bold">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('');

  const nodeHead = ['Bloque', 'Utilización (%)', 'Procesados', 'Espera prom. (min)', 'Servicio prom. (min)'];
  const nodeHeadRow = `<tr>${nodeHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const nodeRows = result.nodeStats
    .map((p) => `<tr><td>${esc(p.name)}</td><td>${n2(p.util)}</td><td>${p.processed}</td><td>${n2(p.avgWait)}</td><td>${n2(p.avgSvc)}</td></tr>`)
    .join('');

  const entHead = ['Entidad', 'Origen', 'Llegada (min)', 'Fin (min)', 'En sistema (min)', 'Espera total (min)', 'Recorrido'];
  const entHeadRow = `<tr>${entHead.map((h) => `<th style="background:#eeeefb;font-weight:bold">${esc(h)}</th>`).join('')}</tr>`;
  const entRows = result.entities
    .map((e) => {
      const path = e.visits.map((v) => `${v.node}(${n2(v.start)}→${n2(v.end)})`).join(' → ');
      return `<tr><td>${e.id}</td><td>${esc(e.originName)}</td><td>${n2(e.arrivalTime)}</td><td>${
        e.endTime != null ? n2(e.endTime) : '—'
      }</td><td>${e.completed ? n2(e.endTime! - e.arrivalTime) : '—'}</td><td>${e.completed ? n2(e.totalWait!) : '—'}</td><td>${esc(
        path
      )}</td></tr>`;
    })
    .join('');

  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Modelado Libre</x:Name>` +
    `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>` +
    `<body><table border="1">${inputRows}</table><br/><table border="1">${inNodeHeadRow}${inNodeRows}</table><br/>` +
    `<table border="1">${edgeHeadRow}${edgeRows}</table><br/><table border="1">${summaryRows}</table><br/>` +
    `<table border="1">${nodeHeadRow}${nodeRows}</table><br/><table border="1">${entHeadRow}${entRows}</table></body></html>`;

  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `modelado-libre-${result.horizon}min.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
