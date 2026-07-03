import type { Metadata } from 'next';
import ProcesoMultietapa from '@/components/multietapa/ProcesoMultietapa';

export const metadata: Metadata = {
  title: 'Multietapa · Simulación',
  description: 'Simulación de eventos discretos para un proceso multietapa (cola en tándem).',
};

export default function MultietapaPage() {
  return <ProcesoMultietapa />;
}
