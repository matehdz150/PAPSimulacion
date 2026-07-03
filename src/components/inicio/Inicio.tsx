'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ParticleField } from './ParticleField';

function ModelCard({
  href,
  name,
  desc,
  visual,
}: {
  href: string;
  name: string;
  desc: string;
  visual: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[14px] border border-[#ececef] bg-white p-[24px_22px_22px] no-underline shadow-[0_1px_2px_rgba(24,24,27,.04),0_1px_1px_rgba(24,24,27,.03)] transition-all duration-200 hover:-translate-y-[3px] hover:border-[#e1e1e6] hover:shadow-[0_12px_28px_-10px_rgba(24,24,27,.14)]"
    >
      <div className="mb-5 flex h-[76px] items-center">{visual}</div>
      <div className="text-[16px] font-semibold tracking-[-.01em] text-[#18181b]">{name}</div>
      <p className="mt-[7px] text-[13px] leading-[1.5] text-[#62626c]">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-[5px] text-[12.5px] font-semibold text-[#5a5ad6]">
        Abrir modelo
        <span className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
      </span>
    </Link>
  );
}

const Dot = ({ className = '' }: { className?: string }) => (
  <span className={'h-[11px] w-[11px] flex-none rounded-full bg-[#9a9aa4] ' + className}></span>
);
const DashLine = ({ className = '' }: { className?: string }) => (
  <span
    className={'h-0.5 flex-1 ' + className}
    style={{ background: 'repeating-linear-gradient(90deg, #d8d8de 0 6px, transparent 6px 11px)' }}
  ></span>
);
const Box = ({ small = false }: { small?: boolean }) => (
  <span
    className={
      'grid flex-none place-items-center rounded-[9px] border-[1.5px] border-[#5a5ad6] bg-[#eeeefb] ' +
      (small ? 'h-[34px] w-[30px]' : 'h-[34px] w-11')
    }
  >
    <i className={'rounded-[3px] border-2 border-[#5a5ad6] ' + (small ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5')}></i>
  </span>
);

export default function Inicio() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbfbfc] font-sans text-[#18181b] antialiased [text-rendering:optimizeLegibility]">
      <ParticleField />
      <Header maxWidth={1180} />

      <main className="mx-auto max-w-[1180px] px-7 pb-[90px] pt-16">
        <div className="relative z-[1] mb-14 text-center">
          <Image
            src="/iteso-logo.svg"
            alt="ITESO"
            width={84}
            height={84}
            priority
            className="mx-auto mb-6 h-[84px] w-[84px] rounded-full shadow-[0_8px_24px_-8px_rgba(12,35,64,.45)] ring-1 ring-[#0c2340]/10"
          />
          <h1 className="text-[42px] font-bold leading-[1.08] tracking-[-.03em]">Modela, simula, entiende.</h1>
          <p className="mx-auto mt-4 max-w-[560px] text-base text-[#62626c]">
            Cuatro formas de explorar colas y procesos — desde un servidor simple hasta un lienzo donde arrastras tu propio modelo.
          </p>
        </div>

        <div className="relative z-[1] grid grid-cols-4 gap-[18px]">
          <ModelCard
            href="/simple"
            name="Proceso simple"
            desc="Una cola M/M/c clásica: llegadas, un servidor con recursos y salida. El punto de partida para entender la simulación."
            visual={
              <div className="flex w-full items-center gap-2">
                <Dot />
                <DashLine />
                <Box />
                <DashLine />
                <span className="h-[11px] w-[11px] flex-none rounded-[3px] bg-[#62626c]"></span>
              </div>
            }
          />

          <ModelCard
            href="/multietapa"
            name="Multietapa"
            desc="Encadena varias actividades con recursos propios y descubre en cuál se acumulan las esperas."
            visual={
              <div className="flex w-full items-center gap-1.5">
                <Dot />
                <DashLine className="w-3 flex-none" />
                <Box small />
                <DashLine className="w-3 flex-none" />
                <Box small />
                <DashLine className="w-3 flex-none" />
                <Box small />
                <DashLine className="w-3 flex-none" />
                <span className="h-[11px] w-[11px] flex-none rounded-[3px] bg-[#62626c]"></span>
              </div>
            }
          />

          <ModelCard
            href="/decision"
            name="Con decisión"
            desc="Una compuerta reparte el flujo en dos rutas independientes que luego convergen. Ajusta el % y mide el impacto."
            visual={
              <div className="flex w-full items-center gap-2">
                <span
                  className="h-[26px] w-[26px] flex-none rotate-45 rounded-[7px] border-2 border-[#5a5ad6]"
                  style={{ background: 'linear-gradient(135deg,#f3f3fe,#eaeafb)' }}
                ></span>
                <div className="relative h-full flex-1">
                  <span
                    className="absolute left-0 top-[30%] h-0.5 w-3/5"
                    style={{ background: 'repeating-linear-gradient(90deg, #5a5ad6 0 6px, transparent 6px 10px)' }}
                  ></span>
                  <span className="absolute right-0 top-[30%] grid h-[18px] w-[18px] -translate-y-1/2 place-items-center rounded-[5px] bg-[#5a5ad6]">
                    <i className="h-[7px] w-[7px] rounded-[2px] bg-white"></i>
                  </span>
                  <span
                    className="absolute left-0 top-[70%] h-0.5 w-3/5"
                    style={{ background: 'repeating-linear-gradient(90deg, #2f9b8e 0 6px, transparent 6px 10px)' }}
                  ></span>
                  <span className="absolute right-0 top-[70%] grid h-[18px] w-[18px] -translate-y-1/2 place-items-center rounded-[5px] bg-[#2f9b8e]">
                    <i className="h-[7px] w-[7px] rounded-[2px] bg-white"></i>
                  </span>
                </div>
              </div>
            }
          />

          <ModelCard
            href="/libre"
            name="Modelado libre"
            desc="Arrastra bloques, conéctalos como quieras y simula el grafo que armaste — tu propio proceso, sin plantilla."
            visual={
              <div className="relative h-full w-full">
                <span className="absolute rounded-full border-[1.5px] border-dashed border-[#e1e1e6] bg-[#fafafa]" style={{ width: 22, height: 22, left: 2, top: 8 }}></span>
                <span className="absolute rounded-[8px] border-[1.5px] border-dashed border-[#e1e1e6] bg-[#fafafa]" style={{ width: 38, height: 26, left: 38, top: 2 }}></span>
                <span className="absolute rounded-[8px] border-[1.5px] border-dashed border-[#e1e1e6] bg-[#fafafa]" style={{ width: 38, height: 26, left: 34, top: 44 }}></span>
                <span className="absolute rounded-full border-[1.5px] border-dashed border-[#e1e1e6] bg-[#fafafa]" style={{ width: 20, height: 20, left: 96, top: 26 }}></span>
                <span
                  className="absolute h-0.5"
                  style={{ width: 30, left: 24, top: 19, transform: 'rotate(-18deg)', background: 'repeating-linear-gradient(90deg, #d8d8de 0 5px, transparent 5px 9px)' }}
                ></span>
                <span
                  className="absolute h-0.5"
                  style={{ width: 26, left: 22, top: 19, transform: 'rotate(22deg)', background: 'repeating-linear-gradient(90deg, #d8d8de 0 5px, transparent 5px 9px)' }}
                ></span>
                <span
                  className="absolute h-0.5"
                  style={{ width: 28, left: 76, top: 19, transform: 'rotate(14deg)', background: 'repeating-linear-gradient(90deg, #d8d8de 0 5px, transparent 5px 9px)' }}
                ></span>
                <span
                  className="absolute h-0.5"
                  style={{ width: 28, left: 72, top: 37, transform: 'rotate(-16deg)', background: 'repeating-linear-gradient(90deg, #d8d8de 0 5px, transparent 5px 9px)' }}
                ></span>
              </div>
            }
          />
        </div>

        <div className="relative z-[1] mt-[46px] text-center text-[12.5px] text-[#9a9aa4]">
          Todas las simulaciones corren en el navegador con distribuciones exponenciales.
        </div>
      </main>
    </div>
  );
}
