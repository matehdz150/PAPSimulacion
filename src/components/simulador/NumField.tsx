'use client';

import React from 'react';

export function NumField({
  label,
  unit,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 100000,
  hint,
  integer,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  integer?: boolean;
}) {
  const set = (v: number) => {
    let n = integer ? Math.round(v) : v;
    n = Math.max(min, Math.min(max, n));
    onChange(n);
  };
  return (
    <div className="border-b border-[#ececef] py-4 last-of-type:border-b-0">
      <div className="mb-[9px] flex items-baseline justify-between">
        <span className="text-[13.5px] font-medium text-[#18181b]">{label}</span>
        <span className="text-[11.5px] font-semibold text-[#9a9aa4]">{unit}</span>
      </div>
      <div className="flex items-stretch overflow-hidden rounded-[9px] border border-[#e1e1e6] bg-white transition-colors focus-within:border-[#5a5ad6] focus-within:shadow-[0_0_0_3px_#eeeefb]">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => set(parseFloat(e.target.value || '0'))}
          className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-[13px] py-[11px] font-mono text-base font-medium tracking-[-.01em] text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="grid place-items-center border-l border-[#ececef] bg-[#fafafa] px-3 text-xs font-semibold text-[#9a9aa4]">
          {integer ? '#' : 'min'}
        </span>
        <div className="flex flex-col border-l border-[#ececef]">
          <button
            type="button"
            onClick={() => set(value + step)}
            aria-label="incrementar"
            className="flex-1 w-[34px] border-b border-[#ececef] bg-[#fafafa] text-[11px] text-[#62626c] transition-colors hover:bg-[#f0f0f3] hover:text-[#18181b] active:bg-[#e8e8ec]"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => set(value - step)}
            aria-label="decrementar"
            className="flex-1 w-[34px] bg-[#fafafa] text-[11px] text-[#62626c] transition-colors hover:bg-[#f0f0f3] hover:text-[#18181b] active:bg-[#e8e8ec]"
          >
            ▼
          </button>
        </div>
      </div>
      {hint && <div className="mt-2 text-[11.5px] leading-[1.45] text-[#9a9aa4]">{hint}</div>}
    </div>
  );
}
