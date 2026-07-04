'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fmt, plural, type SimLabels, type SimResult } from '@/lib/simulate-simple';

type Pt = [number, number];

// Genera puntos de una función escalón a partir de eventos (t, delta)
function stepSeries(events: { t: number; d: number }[], horizon: number, scale = 1): Pt[] {
  const evs = [...events].sort((a, b) => a.t - b.t);
  let v = 0;
  const pts: Pt[] = [[0, 0]];
  for (const e of evs) {
    pts.push([e.t, v * scale]);
    v += e.d;
    pts.push([e.t, v * scale]);
  }
  pts.push([horizon, v * scale]);
  return pts;
}

// Valor de la función escalón en el tiempo t
function valueAt(pts: Pt[], t: number): number {
  let v = pts.length ? pts[0][1] : 0;
  for (const [pt, pv] of pts) {
    if (pt <= t) v = pv;
    else break;
  }
  return v;
}

function ChartFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#ececef] bg-white">
      <div className="flex items-center gap-2.5 border-b border-[#ececef] px-4 py-3">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9a9aa4]">Gráfica</span>
        <span className="text-[13.5px] font-semibold tracking-[-.01em]">{title}</span>
        {subtitle && <span className="ml-auto text-[11.5px] text-[#9a9aa4]">{subtitle}</span>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

/* -------------------- Histograma interactivo -------------------- */
function HistogramChart({
  counts,
  binW,
  maxW,
  maxCount,
  meanWait,
  entityPlural,
}: {
  counts: number[];
  binW: number;
  maxW: number;
  maxCount: number;
  meanWait: number;
  entityPlural: string;
}) {
  const W = 640, H = 260, pl = 44, pb = 36, pt = 16, pr = 16;
  const pw = W - pl - pr, ph = H - pt - pb;
  const baseY = pt + ph;
  const meanX = pl + (maxW > 0 ? meanWait / maxW : 0) * pw;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ i: number; xPx: number } | null>(null);

  const onMove = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = rect.width / W;
    const vbX = (e.clientX - rect.left) / scale;
    if (vbX < pl || vbX > pl + pw) return setHover(null);
    let i = Math.floor(((vbX - pl) / pw) * counts.length);
    i = Math.max(0, Math.min(counts.length - 1, i));
    setHover({ i, xPx: e.clientX - rect.left });
  };

  const bw = pw / counts.length;

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = baseY - f * ph;
          return (
            <g key={f}>
              <line x1={pl} y1={y} x2={pl + pw} y2={y} stroke="#f0f0f3" strokeWidth={1} />
              <text x={pl - 7} y={y + 3.5} textAnchor="end" fontSize={10} fill="#9a9aa4">{Math.round(f * maxCount)}</text>
            </g>
          );
        })}
        {counts.map((c, i) => {
          const x = pl + i * bw;
          const bh = (c / maxCount) * ph;
          const active = hover?.i === i;
          return (
            <rect key={i} x={x + 1.5} y={baseY - bh} width={Math.max(0, bw - 3)} height={bh} rx={2.5} fill={active ? '#4b4bc4' : '#5a5ad6'} opacity={active ? 1 : 0.85} />
          );
        })}
        {meanWait > 0 && (
          <g>
            <line x1={meanX} y1={pt} x2={meanX} y2={baseY} stroke="#c0782d" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={Math.min(meanX + 5, pl + pw - 2)} y={pt + 11} fontSize={10} fill="#c0782d" fontWeight={600}>media {fmt(meanWait)}m</text>
          </g>
        )}
        <line x1={pl} y1={baseY} x2={pl + pw} y2={baseY} stroke="#d4d4da" strokeWidth={1} />
        <text x={pl} y={baseY + 16} fontSize={10} fill="#9a9aa4">0</text>
        <text x={pl + pw} y={baseY + 16} textAnchor="end" fontSize={10} fill="#9a9aa4">{fmt(maxW)} min</text>
        <text x={pl + pw / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#9a9aa4">tiempo de espera (min)</text>
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-[#e1e1e6] bg-white px-2.5 py-1.5 text-[11.5px] shadow-[0_4px_12px_-2px_rgba(24,24,27,.18)]"
          style={{ left: hover.xPx, top: 8 }}
        >
          <div className="font-semibold text-[#18181b]">{fmt(hover.i * binW)}–{fmt((hover.i + 1) * binW)} min</div>
          <div className="font-mono text-[#5a5ad6]">{counts[hover.i]} {entityPlural.toLowerCase()}</div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Serie de tiempo interactiva -------------------- */
function TimeChart({
  points,
  horizon,
  yMax,
  color,
  fill,
  unit,
  percent,
}: {
  points: Pt[];
  horizon: number;
  yMax: number;
  color: string;
  fill: string;
  unit: string;
  percent?: boolean;
}) {
  const W = 640, H = 240, pl = 44, pb = 34, pt = 16, pr = 16;
  const pw = W - pl - pr, ph = H - pt - pb;
  const baseY = pt + ph;
  const X = (t: number) => pl + (horizon ? (t / horizon) * pw : 0);
  const Y = (v: number) => pt + ph - (v / yMax) * ph;
  const line = points.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
  const area = `${pl},${baseY} ${line} ${X(horizon).toFixed(1)},${baseY}`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * horizon);
  const yLabels = percent ? [0, 50, 100] : [0, 0.5, 1].map((f) => f * yMax);

  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ t: number; v: number; xVb: number; xPx: number } | null>(null);

  const onMove = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = rect.width / W;
    const xVb = (e.clientX - rect.left) / scale;
    if (xVb < pl || xVb > pl + pw) return setHover(null);
    const t = ((xVb - pl) / pw) * horizon;
    const v = valueAt(points, t);
    setHover({ t, v, xVb, xPx: e.clientX - rect.left });
  };

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {yLabels.map((v, i) => {
          const y = Y(percent ? v : yLabels[i]);
          return (
            <g key={i}>
              <line x1={pl} y1={y} x2={pl + pw} y2={y} stroke="#f0f0f3" strokeWidth={1} />
              <text x={pl - 7} y={y + 3.5} textAnchor="end" fontSize={10} fill="#9a9aa4">{percent ? `${v}%` : Math.round(v)}</text>
            </g>
          );
        })}
        <polygon points={area} fill={fill} />
        <polyline points={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        {hover && (
          <g>
            <line x1={hover.xVb} y1={pt} x2={hover.xVb} y2={baseY} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
            <circle cx={hover.xVb} cy={Y(hover.v)} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
          </g>
        )}
        <line x1={pl} y1={baseY} x2={pl + pw} y2={baseY} stroke="#d4d4da" strokeWidth={1} />
        {ticks.map((t, i) => (
          <text key={i} x={X(t)} y={baseY + 15} textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'} fontSize={10} fill="#9a9aa4">{Math.round(t)}</text>
        ))}
        <text x={pl + pw / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#9a9aa4">tiempo (min)</text>
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-[#e1e1e6] bg-white px-2.5 py-1.5 text-[11.5px] shadow-[0_4px_12px_-2px_rgba(24,24,27,.18)]"
          style={{ left: hover.xPx, top: 8 }}
        >
          <div className="font-mono text-[10.5px] text-[#9a9aa4]">t = {fmt(hover.t)} min</div>
          <div className="font-semibold" style={{ color }}>{percent ? `${fmt(hover.v)}%` : `${Math.round(hover.v)} ${unit}`}</div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Modal -------------------- */
export function ChartsModal({ open, onClose, result, labels }: { open: boolean; onClose: () => void; result: SimResult; labels: SimLabels }) {
  const data = useMemo(() => {
    const rows = result.rows;
    const horizon = result.horizon;
    const waits = rows.map((r) => r.wait);
    const maxW = Math.max(0, ...waits);
    const BINS = 12;
    const binW = (maxW > 0 ? maxW : 1) / BINS;
    const counts = new Array(BINS).fill(0);
    for (const w of waits) {
      let b = Math.floor(w / binW);
      if (b >= BINS) b = BINS - 1;
      if (b < 0) b = 0;
      counts[b]++;
    }
    const maxCount = Math.max(1, ...counts);
    const sys = stepSeries(rows.flatMap((r) => [{ t: r.arrival, d: +1 }, { t: r.end, d: -1 }]), horizon);
    const maxSys = Math.max(1, ...sys.map((p) => p[1]));
    const util = stepSeries(rows.flatMap((r) => [{ t: r.start, d: +1 }, { t: r.end, d: -1 }]), horizon, 100 / Math.max(1, result.mechanics));
    return { counts, binW, maxW, maxCount, sys, maxSys, util, horizon };
  }, [result]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#18181b]/45 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Gráficas de salida"
    >
      <div
        className="my-auto w-full max-w-[860px] animate-[fadeUp_.28s_cubic-bezier(.4,0,.2,1)_both] overflow-hidden rounded-2xl border border-[#ececef] bg-[#fbfbfc] shadow-[0_24px_60px_-12px_rgba(24,24,27,.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <style jsx global>{`
          @keyframes fadeUp { from { transform: translateY(10px); opacity: .6; } to { transform: none; opacity: 1; } }
        `}</style>
        <div className="flex items-center gap-3 border-b border-[#ececef] bg-white px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-.01em]">Gráficas de salida</h2>
            <p className="mt-0.5 text-[12px] text-[#9a9aa4]">Pasa el cursor sobre cada gráfica para ver el valor</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-[#e1e1e6] bg-white text-[#62626c] transition-colors hover:border-[#9a9aa4] hover:bg-[#fafafa] hover:text-[#18181b]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="flex flex-col gap-3.5 p-5">
          <ChartFrame title="Histograma de tiempos de espera" subtitle={`${result.rows.length} eventos`}>
            <HistogramChart counts={data.counts} binW={data.binW} maxW={data.maxW} maxCount={data.maxCount} meanWait={result.avgWait} entityPlural={plural(labels.entity)} />
          </ChartFrame>
          <ChartFrame title="Utilización de servidores" subtitle={`${result.mechanics} ${plural(labels.resource).toLowerCase()}`}>
            <TimeChart points={data.util} horizon={data.horizon} yMax={100} color="#1f9d57" fill="rgba(31,157,87,.10)" unit="%" percent />
          </ChartFrame>
          <ChartFrame title={`${plural(labels.entity)} en el sistema`} subtitle="cola + en servicio">
            <TimeChart points={data.sys} horizon={data.horizon} yMax={data.maxSys} color="#5a5ad6" fill="rgba(90,90,214,.10)" unit={plural(labels.entity).toLowerCase()} />
          </ChartFrame>
        </div>
      </div>
    </div>
  );
}
