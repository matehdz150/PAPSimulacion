import type { FreeEdge, FreeNodeData } from '@/lib/simulate-freeform';

// Valida que el grafo esté bien formado antes de simular.
// Devuelve una lista de problemas (vacía si el modelo es válido).
export function validateGraph(nodes: FreeNodeData[], edges: FreeEdge[]): string[] {
  const errors: string[] = [];

  const arrivals = nodes.filter((n) => n.type === 'arrival');
  const ends = nodes.filter((n) => n.type === 'end');

  if (nodes.length === 0) return ['El lienzo está vacío: agrega bloques para construir el modelo.'];
  if (arrivals.length === 0) errors.push('El modelo necesita al menos un bloque de Llegada.');
  if (ends.length === 0) errors.push('El modelo necesita al menos un bloque de Fin.');

  // Conteo de conexiones entrantes y salientes por nodo
  const outCount = new Map<string, number>();
  const inCount = new Map<string, number>();
  nodes.forEach((n) => {
    outCount.set(n.id, 0);
    inCount.set(n.id, 0);
  });
  edges.forEach((e) => {
    outCount.set(e.from, (outCount.get(e.from) ?? 0) + 1);
    inCount.set(e.to, (inCount.get(e.to) ?? 0) + 1);
  });

  for (const n of nodes) {
    const out = outCount.get(n.id) ?? 0;
    const inp = inCount.get(n.id) ?? 0;
    const nm = `"${n.name}"`;
    if (n.type === 'arrival' && out === 0) errors.push(`La Llegada ${nm} no tiene conexión de salida.`);
    if (n.type === 'end' && inp === 0) errors.push(`El Fin ${nm} no tiene conexión de entrada.`);
    if (n.type === 'activity') {
      if (inp === 0) errors.push(`La actividad ${nm} no tiene conexión de entrada.`);
      if (out === 0) errors.push(`La actividad ${nm} no tiene conexión de salida.`);
    }
    if (n.type === 'gateway') {
      if (inp === 0) errors.push(`La compuerta ${nm} no tiene conexión de entrada.`);
      if (out === 0) errors.push(`La compuerta ${nm} no tiene conexión de salida.`);
    }
  }

  // Alcanzabilidad: alguna Llegada debe poder llegar hasta un Fin
  if (arrivals.length && ends.length) {
    const adj = new Map<string, string[]>();
    edges.forEach((e) => {
      if (!adj.has(e.from)) adj.set(e.from, []);
      adj.get(e.from)!.push(e.to);
    });
    const endIds = new Set(ends.map((e) => e.id));
    const reachesEnd = (start: string) => {
      const seen = new Set<string>([start]);
      const stack = [start];
      while (stack.length) {
        const cur = stack.pop()!;
        if (endIds.has(cur)) return true;
        for (const nx of adj.get(cur) ?? []) {
          if (!seen.has(nx)) {
            seen.add(nx);
            stack.push(nx);
          }
        }
      }
      return false;
    };
    if (!arrivals.some((a) => reachesEnd(a.id))) {
      errors.push('Ninguna Llegada está conectada hasta un bloque de Fin.');
    }
  }

  return errors;
}
