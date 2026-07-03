'use client';

import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  z: number;
  c: string;
  tw: number;
}

const MAXZ = 1.7;
const MINZ = 0.05;
const SPEED = 0.0016;
const FOCAL = 0.62;
const N = 90;
const COLORS = ['90,90,214', '47,155,142', '154,154,164'];

function makePoint(fresh: boolean): Point {
  return {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: fresh ? Math.random() * MAXZ : MAXZ,
    c: COLORS[(Math.random() * COLORS.length) | 0],
    tw: Math.random() * Math.PI * 2,
  };
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0,
      H = 0,
      DPR = 1;
    const points: Point[] = [];
    const mouse = { x: 0, y: 0 };
    let tiltX = 0,
      tiltY = 0;
    let raf = 0;

    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * DPR;
      canvas!.height = H * DPR;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function init() {
      resize();
      points.length = 0;
      for (let i = 0; i < N; i++) points.push(makePoint(true));
    }

    function onPointerMove(e: PointerEvent) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function step(t: number) {
      ctx!.clearRect(0, 0, W, H);
      const cx = W / 2,
        cy = H / 2;
      const K = Math.min(W, H) * FOCAL;

      tiltX += (mouse.x * 26 - tiltX) * 0.04;
      tiltY += (mouse.y * 16 - tiltY) * 0.04;

      const proj: { sx: number; sy: number; depth: number; c: string; tw: number }[] = [];
      for (const p of points) {
        p.z -= SPEED;
        if (p.z <= MINZ) Object.assign(p, makePoint(false));
        const scale = K / (p.z * 300 + 40);
        const sx = cx + tiltX + p.x * scale * 60;
        const sy = cy + tiltY + p.y * scale * 60;
        const depth = 1 - p.z / MAXZ;
        proj.push({ sx, sy, depth, c: p.c, tw: p.tw });
      }

      for (let i = 0; i < proj.length; i++) {
        if (proj[i].depth < 0.35) continue;
        for (let j = i + 1; j < proj.length; j++) {
          if (proj[j].depth < 0.35) continue;
          const a = proj[i],
            b = proj[j];
          const dx = a.sx - b.sx,
            dy = a.sy - b.sy;
          const dist = Math.hypot(dx, dy);
          const maxDist = 130;
          if (dist < maxDist) {
            const depth = (a.depth + b.depth) / 2;
            const alpha = (1 - dist / maxDist) * 0.16 * depth;
            ctx!.strokeStyle = `rgba(90,90,214,${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.sx, a.sy);
            ctx!.lineTo(b.sx, b.sy);
            ctx!.stroke();
          }
        }
      }

      for (const p of proj) {
        if (p.sx < -30 || p.sx > W + 30 || p.sy < -30 || p.sy > H + 30) continue;
        const twinkle = 0.75 + Math.sin(t * 0.0011 + p.tw) * 0.25;
        const r = (0.6 + p.depth * 2.6) * twinkle;
        const alpha = (0.1 + p.depth * 0.42) * twinkle;
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${p.c},${alpha})`;
        ctx!.arc(p.sx, p.sy, Math.max(0.4, r), 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(step);
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.addEventListener('resize', init);
    window.addEventListener('pointermove', onPointerMove);
    init();
    if (!reduceMotion) raf = requestAnimationFrame(step);
    else step(0);

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />;
}
