import type { Metadata } from 'next';
import Simulador from '@/components/simulador/Simulador';

export const metadata: Metadata = {
  title: 'Proceso simple · Simulación',
  description: 'Simulación de eventos discretos para un proceso simple (cola M/M/c).',
};

export default function SimplePage() {
  return <Simulador />;
}
