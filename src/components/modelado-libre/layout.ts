import type { FreeNodeData } from '@/lib/simulate-freeform';

export const CIRC = 64;
export const ACT_W = 190;
export const ACT_H = 100;
export const GW = 92;

export function dims(node: FreeNodeData): { w: number; h: number } {
  if (node.type === 'activity') return { w: ACT_W, h: ACT_H };
  if (node.type === 'gateway') return { w: GW, h: GW };
  return { w: CIRC, h: CIRC };
}

export function portPos(node: FreeNodeData, which: 'in' | 'out' | 'A' | 'B'): { x: number; y: number } {
  const { w, h } = dims(node);
  if (node.type === 'gateway') {
    if (which === 'A') return { x: node.x + w, y: node.y + h * 0.22 };
    if (which === 'B') return { x: node.x + w, y: node.y + h * 0.78 };
    return { x: node.x, y: node.y + h / 2 };
  }
  if (which === 'out') return { x: node.x + w, y: node.y + h / 2 };
  return { x: node.x, y: node.y + h / 2 };
}
