import type { Metadata } from 'next';
import ProcesoConDecision from '@/components/decision/ProcesoConDecision';

export const metadata: Metadata = {
  title: 'Con decisión · Simulación',
  description: 'Simulación de eventos discretos para un proceso con compuerta de decisión (XOR gateway).',
};

export default function DecisionPage() {
  return <ProcesoConDecision />;
}
