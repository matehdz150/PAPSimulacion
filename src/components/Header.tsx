'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Inicio' },
  { href: '/simple', label: 'Proceso simple' },
  { href: '/multietapa', label: 'Multietapa' },
  { href: '/decision', label: 'Con decisión' },
  { href: '/libre', label: 'Modelado libre' },
];

export function Header({ maxWidth = 1320 }: { maxWidth?: number }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#ebebef] bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-full items-center gap-4 px-7" style={{ maxWidth }}>
        {/* Izquierda: marca */}
        <Link href="/" className="group flex flex-1 items-center gap-2.5 no-underline">
          <Image
            src="/iteso-logo.svg"
            alt="ITESO"
            width={32}
            height={32}
            priority
            className="h-8 w-8 flex-none rounded-full shadow-[0_1px_2px_rgba(24,24,27,.18)] transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-[-.01em] text-[#18181b]">ITESO</span>
            <span className="mt-[3px] text-[10.5px] font-medium tracking-[.01em] text-[#9a9aa4]">Simulación PAP</span>
          </div>
        </Link>

        {/* Centro: navegación */}
        <nav className="inline-flex rounded-[11px] border border-[#ececef] bg-[#fafafa]/80 p-[3px] shadow-[inset_0_1px_2px_rgba(24,24,27,.03)]">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={
                  'relative whitespace-nowrap rounded-[8px] px-[14px] py-[6px] text-[12.5px] font-medium no-underline transition-all duration-200 ' +
                  (active
                    ? 'bg-white text-[#18181b] shadow-[0_1px_2px_rgba(24,24,27,.06),0_0_0_1px_rgba(24,24,27,.04)]'
                    : 'text-[#9a9aa4] hover:bg-white/60 hover:text-[#4b4b55]')
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Derecha: enlace a documentación */}
        <div className="flex flex-1 justify-end">
          <Link
            href="/documentacion"
            aria-current={pathname === '/documentacion' ? 'page' : undefined}
            className={
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium no-underline transition-colors ' +
              (pathname === '/documentacion' ? 'text-[#5a5ad6]' : 'text-[#9a9aa4] hover:text-[#62626c]')
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H14l4 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5zM14 4v4h4M8 13h6M8 16.5h6" />
            </svg>
            Documentación
          </Link>
        </div>
      </div>
    </header>
  );
}
