'use client';

import React from 'react';
import type { FreeNodeData, NodeStat, ThroughputInfo } from '@/lib/simulate-freeform';
import { ACT_H, ACT_W, CIRC, GW } from './layout';

interface FreeNodeProps {
  node: FreeNodeData;
  onDragStart: (e: React.PointerEvent, id: string) => void;
  onPortDown: (nodeId: string, port: 'out' | 'A' | 'B') => void;
  onUpdate: (id: string, patch: Partial<FreeNodeData>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  info?: NodeStat | ThroughputInfo;
  isBottleneck?: boolean;
}

const ToolIcons = ({ id, onDuplicate, onDelete }: { id: string; onDuplicate: (id: string) => void; onDelete: (id: string) => void }) => {
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  return (
    <div className="absolute -top-3 right-1.5 z-[5] flex gap-1">
      <div
        className="grid h-5 w-5 place-items-center rounded-md border border-[#e1e1e6] bg-white text-[11px] text-[#9a9aa4] shadow-[0_1px_2px_rgba(24,24,27,.04)] hover:bg-[#fafafa] hover:text-[#18181b]"
        onPointerDown={stop}
        onClick={() => onDuplicate(id)}
        title="Duplicar"
      >
        ⧉
      </div>
      <div
        className="grid h-5 w-5 place-items-center rounded-md border border-[#e1e1e6] bg-white text-[11px] text-[#9a9aa4] shadow-[0_1px_2px_rgba(24,24,27,.04)] hover:border-[#f0c4c0] hover:bg-[#fbebe9] hover:text-[#c0362d]"
        onPointerDown={stop}
        onClick={() => onDelete(id)}
        title="Eliminar"
      >
        ×
      </div>
    </div>
  );
};

const Port = ({
  className,
  style,
  onPointerDown,
}: {
  className?: string;
  style: React.CSSProperties;
  onPointerDown?: (e: React.PointerEvent) => void;
}) => (
  <div
    className={
      'absolute z-[6] h-[13px] w-[13px] cursor-crosshair rounded-full border-2 border-[#9a9aa4] bg-white transition-transform hover:scale-125 hover:border-[#5a5ad6] ' +
      (className || '')
    }
    style={style}
    onPointerDown={onPointerDown}
  ></div>
);

export function FreeNode({ node, onDragStart, onPortDown, onUpdate, onDelete, onDuplicate, info, isBottleneck }: FreeNodeProps) {
  const stop = (e: React.PointerEvent) => e.stopPropagation();

  if (node.type === 'arrival') {
    const tp = info as ThroughputInfo | undefined;
    return (
      <div className="absolute z-[2] select-none" style={{ left: node.x, top: node.y, width: CIRC }}>
        <ToolIcons id={node.id} onDuplicate={onDuplicate} onDelete={onDelete} />
        <div
          className="grid h-16 w-16 cursor-grab place-items-center rounded-full border-[1.5px] border-[#e1e1e6] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04)] active:cursor-grabbing"
          onPointerDown={(e) => onDragStart(e, node.id)}
        >
          <span className="h-[15px] w-[15px] rounded-full bg-[#9a9aa4]"></span>
        </div>
        <div className="mt-2 w-32 text-center">
          <input
            className="mb-1.5 w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-center text-[13px] font-semibold text-[#18181b] outline-none hover:border-[#ececef] focus:border-[#5a5ad6] focus:bg-white focus:shadow-[0_0_0_3px_#eeeefb]"
            value={node.name}
            onPointerDown={stop}
            onChange={(e) => onUpdate(node.id, { name: e.target.value })}
          />
          <div className="flex items-center overflow-hidden rounded-md border border-[#e1e1e6]">
            <input
              type="number"
              min={1}
              value={node.interarrival}
              onPointerDown={stop}
              onChange={(e) => onUpdate(node.id, { interarrival: Math.max(1, parseFloat(e.target.value || '1')) })}
              className="w-full appearance-none border-0 bg-transparent px-1.5 py-1 text-right font-mono text-xs font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="self-stretch border-l border-[#ececef] bg-[#fafafa] px-1.5 text-[9.5px] font-semibold text-[#9a9aa4] grid place-items-center">min</span>
          </div>
          {tp && <div className="mt-1.5 font-mono text-[10.5px] text-[#9a9aa4]">{tp.arrived} generadas</div>}
        </div>
        <Port style={{ left: CIRC - 6, top: CIRC / 2 - 6 }} className="border-[#5a5ad6]" onPointerDown={(e) => { stop(e); onPortDown(node.id, 'out'); }} />
      </div>
    );
  }

  if (node.type === 'end') {
    const tp = info as ThroughputInfo | undefined;
    return (
      <div className="absolute z-[2] select-none" style={{ left: node.x, top: node.y, width: CIRC }}>
        <ToolIcons id={node.id} onDuplicate={onDuplicate} onDelete={onDelete} />
        <div
          className="grid h-16 w-16 cursor-grab place-items-center rounded-full border-[3px] border-[#cfcfd6] bg-white active:cursor-grabbing"
          onPointerDown={(e) => onDragStart(e, node.id)}
        >
          <span className="h-[13px] w-[13px] rounded-[4px] bg-[#62626c]"></span>
        </div>
        <div className="mt-2 w-32 text-center">
          <input
            className="mb-1.5 w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-center text-[13px] font-semibold text-[#18181b] outline-none hover:border-[#ececef] focus:border-[#5a5ad6] focus:bg-white focus:shadow-[0_0_0_3px_#eeeefb]"
            value={node.name}
            onPointerDown={stop}
            onChange={(e) => onUpdate(node.id, { name: e.target.value })}
          />
          {tp && <div className="font-mono text-[10.5px] text-[#9a9aa4]">{tp.exited} salidas</div>}
        </div>
        <Port style={{ left: -6, top: CIRC / 2 - 6 }} />
      </div>
    );
  }

  if (node.type === 'gateway') {
    const a = node.splitA ?? 50;
    return (
      <div className="absolute z-[2] select-none" style={{ left: node.x, top: node.y, width: GW }}>
        <ToolIcons id={node.id} onDuplicate={onDuplicate} onDelete={onDelete} />
        <div className="relative grid h-[92px] w-[92px] place-items-center">
          <div
            className="grid h-[92px] w-[92px] rotate-45 cursor-grab place-items-center rounded-2xl border-[2.5px] border-[#5a5ad6] bg-gradient-to-br from-[#f3f3fe] to-[#eaeafb] shadow-[0_0_0_5px_#eeeefb] active:cursor-grabbing"
            onPointerDown={(e) => onDragStart(e, node.id)}
          >
            <div className="relative h-[26px] w-[26px] -rotate-45">
              <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rotate-45 rounded bg-[#5a5ad6]"></span>
              <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 -rotate-45 rounded bg-[#5a5ad6]"></span>
            </div>
          </div>
          <div
            className="absolute left-1/2 top-full mt-2.5 w-[170px] -translate-x-1/2 rounded-[10px] border border-[#e1e1e6] bg-white p-2.5 px-3 shadow-[0_1px_2px_rgba(24,24,27,.04)]"
            onPointerDown={stop}
          >
            <input
              className="mb-2 w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-center text-[13px] font-semibold text-[#18181b] outline-none hover:border-[#ececef] focus:border-[#5a5ad6] focus:bg-white"
              value={node.name}
              onChange={(e) => onUpdate(node.id, { name: e.target.value })}
            />
            <div className="mb-[7px] flex justify-between text-[11px] font-semibold">
              <span className="text-[#5a5ad6]">A {a}%</span>
              <span className="text-[#2f9b8e]">B {100 - a}%</span>
            </div>
            <div className="mb-2 flex h-[7px] overflow-hidden rounded-full bg-[#ececef]">
              <div className="bg-[#5a5ad6]" style={{ width: a + '%' }}></div>
              <div className="bg-[#2f9b8e]" style={{ width: 100 - a + '%' }}></div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={a}
              onChange={(e) => onUpdate(node.id, { splitA: parseFloat(e.target.value) })}
              className="h-1 w-full appearance-none rounded-full bg-[#e1e1e6] outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5a5ad6] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_2px_rgba(24,24,27,.04)]"
            />
          </div>
        </div>
        <Port style={{ left: -6, top: GW / 2 - 6 }} />
        <Port className="border-[#5a5ad6]" style={{ left: GW - 6, top: GW * 0.22 - 6 }} onPointerDown={(e) => { stop(e); onPortDown(node.id, 'A'); }} />
        <Port className="border-[#2f9b8e]" style={{ left: GW - 6, top: GW * 0.78 - 6 }} onPointerDown={(e) => { stop(e); onPortDown(node.id, 'B'); }} />
      </div>
    );
  }

  // activity
  const stat = info as NodeStat | undefined;
  const util = stat ? stat.util : 0;
  return (
    <div className="absolute z-[2] select-none" style={{ left: node.x, top: node.y, width: ACT_W }}>
      <ToolIcons id={node.id} onDuplicate={onDuplicate} onDelete={onDelete} />
      <div
        className={
          'overflow-hidden rounded-[13px] border-[1.5px] bg-white shadow-[0_1px_2px_rgba(24,24,27,.04)] ' +
          (isBottleneck ? 'border-[#ecd3b3] bg-[#fbf1e5] shadow-[0_0_0_3px_#fbf1e5]' : 'border-[#e1e1e6]')
        }
      >
        <div className="flex cursor-grab items-center gap-[7px] px-3 pb-2 pt-2.5 active:cursor-grabbing" onPointerDown={(e) => onDragStart(e, node.id)}>
          <span className={'grid h-5 w-5 flex-none place-items-center rounded-md ' + (isBottleneck ? 'bg-white' : 'bg-[#eeeefb]')}>
            <i className={'block h-2 w-2 rounded-[2px] border-2 ' + (isBottleneck ? 'border-[#c0782d]' : 'border-[#5a5ad6]')}></i>
          </span>
          <input
            className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[13px] font-semibold text-[#18181b] outline-none hover:border-[#ececef] focus:border-[#5a5ad6] focus:bg-white focus:shadow-[0_0_0_3px_#eeeefb]"
            value={node.name}
            onPointerDown={stop}
            onChange={(e) => onUpdate(node.id, { name: e.target.value })}
          />
        </div>
        <div className="flex gap-[7px] px-3 pb-[11px]">
          <div className="flex flex-1 items-center overflow-hidden rounded-md border border-[#e1e1e6]">
            <input
              type="number"
              min={1}
              value={node.service}
              onPointerDown={stop}
              onChange={(e) => onUpdate(node.id, { service: Math.max(1, parseFloat(e.target.value || '1')) })}
              className="w-full appearance-none border-0 bg-transparent px-1.5 py-1.5 text-right font-mono text-xs font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="self-stretch border-l border-[#ececef] bg-[#fafafa] px-1.5 text-[9.5px] font-semibold text-[#9a9aa4] grid place-items-center">min</span>
          </div>
          <div className="flex flex-1 items-center overflow-hidden rounded-md border border-[#e1e1e6]">
            <input
              type="number"
              min={1}
              value={node.resources}
              onPointerDown={stop}
              onChange={(e) => onUpdate(node.id, { resources: Math.max(1, Math.round(parseFloat(e.target.value || '1'))) })}
              className="w-full appearance-none border-0 bg-transparent px-1.5 py-1.5 text-right font-mono text-xs font-medium text-[#18181b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="self-stretch border-l border-[#ececef] bg-[#fafafa] px-1.5 text-[9.5px] font-semibold text-[#9a9aa4] grid place-items-center">#</span>
          </div>
        </div>
        {stat && (
          <div className="px-3 pb-[11px]">
            <div className="h-1 overflow-hidden rounded-full bg-[#ececef]">
              <i
                className={'block h-full rounded-full ' + (isBottleneck ? 'bg-[#c0782d]' : 'bg-[#5a5ad6]')}
                style={{ width: Math.min(100, util) + '%' }}
              ></i>
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9.5px] text-[#9a9aa4]">
              <span>uso</span>
              <span>
                {util.toFixed(0)}% · {stat.processed} proc.
              </span>
            </div>
          </div>
        )}
      </div>
      <Port style={{ left: -6, top: ACT_H / 2 - 6 }} />
      <Port className="border-[#5a5ad6]" style={{ left: ACT_W - 6, top: ACT_H / 2 - 6 }} onPointerDown={(e) => { stop(e); onPortDown(node.id, 'out'); }} />
    </div>
  );
}
