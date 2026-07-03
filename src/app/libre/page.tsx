import type { Metadata } from 'next';
import ModeladoLibre from '@/components/modelado-libre/ModeladoLibre';

export const metadata: Metadata = {
  title: 'Modelado libre · Simulación',
  description: 'Simulación de eventos discretos sobre un grafo arbitrario (modelado libre).',
};

export default function LibrePage() {
  return <ModeladoLibre />;
}
