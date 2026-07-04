import type { Metadata } from 'next';
import Documentacion from '@/components/documentacion/Documentacion';

export const metadata: Metadata = {
  title: 'Documentación · Simulación',
  description: 'Documentación técnica del simulador de eventos discretos: objetivos, marco teórico, requerimientos e implementación.',
};

export default function DocumentacionPage() {
  return <Documentacion />;
}
