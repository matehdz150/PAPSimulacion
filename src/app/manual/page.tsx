import type { Metadata } from 'next';
import Manual from '@/components/manual/Manual';

export const metadata: Metadata = {
  title: 'Manual de usuario · Simulación',
  description: 'Guía paso a paso para usar la aplicación de simulación de eventos discretos.',
};

export default function ManualPage() {
  return <Manual />;
}
