'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';

const SECTIONS = [
  {
    title: '1 · Introducción',
    items: [
      { id: 'objetivo-general', label: 'Objetivo general' },
      { id: 'objetivos-especificos', label: 'Objetivos específicos' },
      { id: 'alcance', label: 'Alcance y limitaciones' },
    ],
  },
  {
    title: '2 · Marco técnico',
    items: [
      { id: 'sed', label: '2.1 Simulación de eventos discretos' },
      { id: 'avance-tiempo', label: '2.2 Avance del tiempo' },
      { id: 'variables-aleatorias', label: '2.3 Variables aleatorias' },
      { id: 'teoria-colas', label: '2.4 Teoría de colas' },
    ],
  },
  {
    title: '3 · Requerimientos',
    items: [
      { id: 'req-funcionales', label: 'Funcionales' },
      { id: 'req-no-funcionales', label: 'No funcionales' },
    ],
  },
  {
    title: '4 · Implementación',
    items: [
      { id: 'entorno', label: '4.1 Entorno y tecnologías' },
      { id: 'servicio-web', label: '4.2 Servicio web' },
    ],
  },
  {
    title: '5 · Motor de simulación',
    items: [
      { id: 'motor-arquitectura', label: '5.1 Arquitectura del motor' },
      { id: 'motor-prng', label: '5.2 PRNG y transformada inversa' },
      { id: 'motor-llegadas', label: '5.3 Generación de llegadas' },
      { id: 'motor-servidores', label: '5.4 Asignación de servidores' },
      { id: 'motor-tandem', label: '5.5 Colas en tándem' },
      { id: 'motor-decision', label: '5.6 Enrutamiento por decisión' },
      { id: 'motor-eventos', label: '5.7 Motor por eventos (heap)' },
      { id: 'motor-metricas', label: '5.8 Cálculo de métricas' },
    ],
  },
];

const ALL_IDS = SECTIONS.flatMap((s) => s.items.map((i) => i.id));

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 mt-14 border-b border-[#ececef] pb-2.5 text-[13px] font-bold uppercase tracking-[.09em] text-[#9a9aa4] first:mt-0">{children}</h2>;
}
function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return <h3 id={id} className="mb-2.5 mt-9 scroll-mt-24 text-[19px] font-bold tracking-[-.02em] text-[#18181b] first:mt-0">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3.5 max-w-[720px] text-[14.5px] leading-[1.72] text-[#3f3f46]">{children}</p>;
}
function Term({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <li className="mb-2 flex gap-2.5 text-[14px] leading-[1.6] text-[#3f3f46]">
      <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-[#5a5ad6]"></span>
      <span>
        <b className="font-semibold text-[#18181b]">{term}.</b> {children}
      </span>
    </li>
  );
}
function Formula({ children }: { children: React.ReactNode }) {
  return <div className="my-3.5 max-w-[720px] overflow-x-auto rounded-lg border border-[#ececef] bg-[#fafafe] px-4 py-3 font-mono text-[14px] text-[#18181b]">{children}</div>;
}
function Bullets({ children }: { children: React.ReactNode }) {
  return <ul className="mb-4 max-w-[720px] space-y-2">{children}</ul>;
}
function Code({ caption, children }: { caption?: string; children: string }) {
  return (
    <figure className="my-4 max-w-[760px]">
      <pre className="overflow-x-auto rounded-xl border border-[#26263a] bg-[#1c1c28] p-4 text-[12.5px] leading-[1.65]">
        <code className="font-mono text-[#e4e4ea]">{children}</code>
      </pre>
      {caption && <figcaption className="mt-1.5 px-1 text-[11.5px] text-[#9a9aa4]">{caption}</figcaption>}
    </figure>
  );
}

export default function Documentacion() {
  const [active, setActive] = useState(ALL_IDS[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -68% 0px', threshold: 0 }
    );
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfbfc] font-sans text-[#18181b] antialiased [text-rendering:optimizeLegibility]">
      <Header maxWidth={1180} />

      <div className="mx-auto grid max-w-[1180px] grid-cols-[248px_1fr] gap-10 px-7 pb-[120px] pt-10 max-lg:grid-cols-1">
        {/* Sidebar */}
        <aside className="max-lg:hidden">
          <nav className="sticky top-24">
            <div className="mb-3 text-[15px] font-semibold tracking-[-.01em]">Documentación</div>
            {SECTIONS.map((s) => (
              <div key={s.title} className="mb-4">
                <div className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-[.06em] text-[#9a9aa4]">{s.title}</div>
                <ul className="space-y-0.5">
                  {s.items.map((it) => {
                    const on = active === it.id;
                    return (
                      <li key={it.id}>
                        <a
                          href={`#${it.id}`}
                          aria-current={on ? 'true' : undefined}
                          className={
                            'block rounded-lg px-2 py-1.5 text-[13px] leading-snug no-underline transition-colors ' +
                            (on ? 'bg-[#eeeefb] font-semibold text-[#5a5ad6]' : 'text-[#62626c] hover:bg-[#f4f4f6] hover:text-[#18181b]')
                          }
                        >
                          {it.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <main className="min-w-0">
          <div className="mb-10">
            <span className="mb-3 inline-flex items-center gap-[7px] rounded-full bg-[#eeeefb] px-[13px] py-[5px] text-[11.5px] font-semibold uppercase tracking-[.06em] text-[#5a5ad6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5a5ad6]"></span>
              Documentación técnica
            </span>
            <h1 className="text-[34px] font-bold leading-[1.1] tracking-[-.03em]">Simulador de eventos discretos</h1>
            <p className="mt-3 max-w-[720px] text-[15px] leading-[1.7] text-[#62626c]">
              Aplicación web para modelar, simular y analizar procesos de colas: proceso simple (M/M/c), multietapa,
              con compuerta de decisión y modelado libre sobre un grafo arbitrario.
            </p>
          </div>

          {/* 1. Introducción */}
          <H2>1 · Introducción</H2>

          <H3 id="objetivo-general">Objetivo general</H3>
          <P>
            Desarrollar una aplicación web de simulación de eventos discretos que permita a un usuario definir los
            parámetros de un proceso de colas, ejecutar la simulación en el navegador y analizar su desempeño —tiempos
            de espera, tiempo en sistema, utilización de recursos y cuello de botella— visualizando la traza de eventos
            y exportando los resultados a una hoja de cálculo.
          </P>

          <H3 id="objetivos-especificos">Objetivos específicos</H3>
          <Bullets>
            <Term term="Investigar el algoritmo de SED">estudiar el enfoque de avance al próximo evento y la generación de variables aleatorias por transformada inversa.</Term>
            <Term term="Implementar el motor de simulación">codificar en TypeScript motores puros y deterministas (sembrados) para los cuatro modelos.</Term>
            <Term term="Diseñar una interfaz responsiva">construir la captura de parámetros, el diagrama del proceso y la edición en línea.</Term>
            <Term term="Validar el algoritmo">contrastar la utilización y las esperas simuladas contra el comportamiento teórico esperado.</Term>
            <Term term="Implementar la exportación a Excel">generar un archivo descargable con variables de entrada, de salida y la tabla de tiempos.</Term>
            <Term term="Agregar visualización gráfica">histograma de esperas y evolución de la cola y la utilización en el tiempo.</Term>
            <Term term="Construir un editor de grafos">lienzo con pan, zoom y bloques conectables para el modelado libre.</Term>
          </Bullets>

          <H3 id="alcance">Alcance y limitaciones</H3>
          <P>El sistema procesa entradas estáticas y las simula en tiempo real, íntegramente del lado del cliente. Concretamente:</P>
          <div className="grid max-w-[720px] grid-cols-2 gap-3.5 max-sm:grid-cols-1">
            <div className="rounded-xl border border-[#d7ecdf] bg-[#f1faf4] p-4">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-[.05em] text-[#1f9d57]">Qué hace</div>
              <ul className="space-y-1.5 text-[13px] leading-[1.55] text-[#3f3f46]">
                <li>· Captura parámetros y corre la simulación en el navegador.</li>
                <li>· Simula colas M/M/c, procesos multietapa, con decisión y grafos libres.</li>
                <li>· Calcula KPIs y renderiza la tabla de tiempos por entidad.</li>
                <li>· Exporta a Excel y grafica los resultados.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[#f0d9d6] bg-[#fbf3f2] p-4">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-[.05em] text-[#c0362d]">Qué no hace</div>
              <ul className="space-y-1.5 text-[13px] leading-[1.55] text-[#3f3f46]">
                <li>· No almacena historial ni persiste datos.</li>
                <li>· No gestiona usuarios ni autenticación.</li>
                <li>· No hay colaboración en tiempo real.</li>
                <li>· No requiere backend ni base de datos.</li>
              </ul>
            </div>
          </div>

          {/* 2. Marco técnico */}
          <H2>2 · Marco técnico</H2>

          <H3 id="sed">2.1 Teoría de Simulación de Eventos Discretos (SED)</H3>
          <P>
            La SED modela un sistema cuyo estado cambia únicamente en instantes discretos, cuando ocurre un evento. Sus
            componentes clave son:
          </P>
          <Bullets>
            <Term term="Reloj de simulación">variable que guarda el tiempo simulado actual; avanza a saltos, no de forma continua.</Term>
            <Term term="Estado del sistema">conjunto de variables que describen el sistema en un instante (entidades en cola, servidores ocupados, etc.).</Term>
            <Term term="Entidades">objetos dinámicos que fluyen por el sistema (en la app, las entidades que llegan y se procesan).</Term>
            <Term term="Atributos">propiedades asociadas a una entidad (tiempo de llegada, ruta asignada, tiempos de inicio y fin).</Term>
            <Term term="Eventos">ocurrencias instantáneas que modifican el estado (una llegada, el fin de un servicio).</Term>
            <Term term="Actividades">operaciones de duración conocida entre dos eventos (el servicio de una etapa).</Term>
            <Term term="Retardos (delays)">esperas de duración indefinida que dependen del estado del sistema (el tiempo en cola).</Term>
          </Bullets>

          <H3 id="avance-tiempo">2.2 Mecanismos de avance del tiempo</H3>
          <P>Existen dos formas de hacer avanzar el reloj de simulación:</P>
          <Bullets>
            <Term term="Incremento de tiempo fijo (Δt)">el reloj avanza en pasos iguales y en cada paso se revisa si ocurrió algún evento. Es simple, pero desperdicia cómputo en intervalos sin actividad e introduce error de discretización.</Term>
            <Term term="Avance al próximo evento (next-event)">el reloj salta directamente al instante del siguiente evento programado, sin recorrer el tiempo intermedio. Es exacto y eficiente, y es el enfoque estándar en SED.</Term>
          </Bullets>
          <P>
            En esta aplicación, el motor de <b className="font-semibold text-[#18181b]">modelado libre</b> implementa el avance
            al próximo evento con una cola de eventos priorizada (min-heap binario). Los modelos simple, multietapa y con
            decisión resuelven cada entidad procesándolas por orden de llegada según la disponibilidad de los servidores.
          </P>

          <H3 id="variables-aleatorias">2.3 Variables aleatorias y distribuciones</H3>
          <P>
            Para generar tiempos aleatorios se usa el <b className="font-semibold text-[#18181b]">método de la transformada
            inversa</b>: si <span className="font-mono">U ~ Uniforme(0,1)</span> y <span className="font-mono">F</span> es la
            función de distribución acumulada (CDF), entonces <span className="font-mono">X = F⁻¹(U)</span> sigue la
            distribución deseada.
          </P>
          <Formula>Uniforme(a, b): &nbsp; X = a + (b − a)·U</Formula>
          <Formula>Exponencial(λ): &nbsp; X = −(1/λ)·ln(1 − U) &nbsp; = &nbsp; −media·ln(1 − U)</Formula>
          <P>
            La distribución <b className="font-semibold text-[#18181b]">Normal</b> no tiene inversa cerrada; se genera con el
            método de Box–Muller:
          </P>
          <Formula>Normal(μ, σ): &nbsp; Z = √(−2·ln U₁)·cos(2π·U₂) , &nbsp; X = μ + σ·Z</Formula>
          <P>
            La distribución <b className="font-semibold text-[#18181b]">Poisson(λ)</b> (número de eventos en un intervalo) se
            obtiene contando llegadas exponenciales hasta superar el intervalo, o con el algoritmo de Knuth. El generador
            base de números pseudoaleatorios es <span className="font-mono">mulberry32</span>, sembrado de forma
            determinista para que cada réplica sea reproducible. Los modelos de la app usan la distribución exponencial
            para llegadas y servicios (caso markoviano).
          </P>

          <H3 id="teoria-colas">2.4 Teoría de colas / Notación de Kendall</H3>
          <P>
            Un sistema de colas se describe con la notación de Kendall <span className="font-mono">A/B/c</span>, donde
            <span className="font-mono"> A</span> es la distribución de las llegadas, <span className="font-mono">B</span> la
            del servicio y <span className="font-mono">c</span> el número de servidores en paralelo. Los símbolos comunes
            son <span className="font-mono">M</span> (markoviano/exponencial), <span className="font-mono">D</span>
            (determinista) y <span className="font-mono">G</span> (general).
          </P>
          <Formula>Modelo simple de la app: &nbsp; M / M / c &nbsp; (llegadas Poisson, servicio exponencial, c servidores)</Formula>
          <Formula>Utilización: &nbsp; ρ = λ / (c·μ) &nbsp; con λ = tasa de llegada, μ = tasa de servicio</Formula>
          <P>
            Estas fórmulas analíticas (junto con Erlang C para la espera en cola) permiten contrastar los indicadores
            teóricos con los que arroja la simulación y así validar el modelo.
          </P>

          {/* 3. Requerimientos */}
          <H2>3 · Requerimientos del sistema</H2>

          <H3 id="req-funcionales">Requerimientos funcionales</H3>
          <Bullets>
            <Term term="Captura de parámetros">tiempo entre llegadas, tiempo de servicio, recursos, horizonte, reparto de la decisión y definición del grafo.</Term>
            <Term term="Ejecución del algoritmo">correr la simulación bajo demanda con un botón, generando una réplica reproducible.</Term>
            <Term term="Renderizado de la tabla de tiempos">mostrar la traza de eventos por entidad (llegada, inicio y fin de cada actividad, espera).</Term>
            <Term term="Estadísticas de salida">espera promedio, tiempo en sistema, utilización, entidades procesadas y cuello de botella.</Term>
            <Term term="Exportación a archivos de hoja de cálculo">descargar un .xls con variables de entrada, de salida y la tabla de tiempos.</Term>
            <Term term="Edición del modelo">renombrar etapas/entidades y, en modelado libre, agregar, eliminar y conectar bloques.</Term>
          </Bullets>

          <H3 id="req-no-funcionales">Requerimientos no funcionales</H3>
          <Bullets>
            <Term term="Rendimiento">la simulación corre por completo en el navegador, sin round-trips al servidor; la respuesta es inmediata.</Term>
            <Term term="Usabilidad">edición en línea, resaltado del cuello de botella, gráficas interactivas y lienzo con pan/zoom.</Term>
            <Term term="Compatibilidad">navegadores modernos (Chrome, Edge, Firefox, Safari) con soporte de ES2020, SVG y Canvas.</Term>
            <Term term="Portabilidad">aplicación web sin instalación; diseño adaptable a distintos tamaños de pantalla.</Term>
          </Bullets>

          {/* 4. Implementación */}
          <H2>4 · Implementación y desarrollo técnico</H2>

          <H3 id="entorno">4.1 Entorno de desarrollo y tecnologías</H3>
          <Bullets>
            <Term term="Framework">Next.js 16 (App Router) sobre React 19, con renderizado estático de las páginas.</Term>
            <Term term="Lenguaje y estilos">TypeScript (que compila a JavaScript/ES), marcado HTML5 semántico y estilos CSS3 mediante Tailwind CSS 4.</Term>
            <Term term="Motor de simulación">módulos TypeScript puros (simulate-*.ts) con el generador pseudoaleatorio mulberry32 para réplicas deterministas.</Term>
            <Term term="Integración de Excel">no se usa una librería externa: se construye una tabla HTML y se descarga como archivo .xls con el tipo MIME application/vnd.ms-excel a través de un Blob, compatible con Excel y LibreOffice.</Term>
            <Term term="Visualización">gráficas SVG propias (histograma y series de tiempo) y un editor de grafo con pan/zoom basado en transformaciones CSS.</Term>
          </Bullets>

          <H3 id="servicio-web">4.2 Servicio web</H3>
          <P>
            La aplicación es un frontend Next.js que no requiere backend ni base de datos: toda la lógica de simulación se
            ejecuta en el cliente. Esto simplifica el alojamiento, ya que basta con servir archivos estáticos.
          </P>
          <Bullets>
            <Term term="Despliegue recomendado">Vercel, la plataforma nativa de Next.js, que publica la aplicación en una URL con HTTPS.</Term>
            <Term term="Alternativa self-host">build de producción (npm run build) servido con Node.js (npm run start), opcionalmente detrás de un proxy inverso como Nginx o IIS sobre Windows Server.</Term>
            <Term term="Estado actual">desarrollo local con npm run dev; build de producción verificado y funcional.</Term>
          </Bullets>

          {/* 5. Motor de simulación */}
          <H2>5 · Motor de simulación (código)</H2>

          <H3 id="motor-arquitectura">5.1 Arquitectura del motor</H3>
          <P>
            El motor vive en cuatro módulos de TypeScript puros, sin dependencias externas:{' '}
            <span className="font-mono text-[13px]">simulate-simple.ts</span>,{' '}
            <span className="font-mono text-[13px]">simulate-multietapa.ts</span>,{' '}
            <span className="font-mono text-[13px]">simulate-decision.ts</span> y{' '}
            <span className="font-mono text-[13px]">simulate-freeform.ts</span>. Cada uno exporta una función que recibe la
            configuración y una <b className="font-semibold text-[#18181b]">semilla</b>, y devuelve un objeto con la traza de
            eventos y las métricas de salida. Al ser funciones puras y deterministas —misma semilla, mismo resultado— cada
            corrida es reproducible, lo que facilita depurar y comparar escenarios.
          </P>
          <P>
            Los tres primeros modelos usan un enfoque analítico por entidad (procesan las llegadas en orden y calculan
            tiempos con la disponibilidad de servidores); el de modelado libre implementa una simulación por eventos
            discretos con una cola de eventos priorizada.
          </P>

          <H3 id="motor-prng">5.2 PRNG y transformada inversa</H3>
          <P>
            El generador base es <span className="font-mono text-[13px]">mulberry32</span>: un PRNG de 32 bits, rápido y
            sembrable, que produce un número uniforme en <span className="font-mono">[0, 1)</span>. A partir de él, la
            función <span className="font-mono">exp()</span> aplica la transformada inversa de la exponencial.
          </P>
          <Code caption="Generador pseudoaleatorio determinista y muestreo exponencial por transformada inversa.">{`function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // U en [0, 1)
  };
}

const rng = mulberry32(seed);
const exp = (mean: number) => -mean * Math.log(1 - rng()); // X = -media·ln(1-U)`}</Code>

          <H3 id="motor-llegadas">5.3 Generación de llegadas (proceso de Poisson)</H3>
          <P>
            Las llegadas se generan acumulando tiempos entre llegadas exponenciales hasta rebasar el horizonte. Esto
            produce un proceso de Poisson: instantes de llegada con interllegadas exponenciales.
          </P>
          <Code>{`const arrivals: number[] = [];
let t = 0;
while (true) {
  t += exp(interarrival);  // siguiente interllegada
  if (t > horizon) break;  // se detiene al llegar al horizonte
  arrivals.push(t);
}`}</Code>

          <H3 id="motor-servidores">5.4 Asignación de servidores (M/M/c)</H3>
          <P>
            Con <span className="font-mono">c</span> servidores en paralelo se mantiene un arreglo{' '}
            <span className="font-mono">serverFree</span> con el instante en que cada servidor queda libre. Para cada
            entidad se elige el servidor que se libera primero; el inicio del servicio es el máximo entre la llegada y esa
            liberación, y la espera es la diferencia con la llegada.
          </P>
          <Code caption="Núcleo de la cola M/M/c: selección del servidor más pronto disponible.">{`const serverFree = new Array(mechanics).fill(0);
for (let i = 0; i < arrivals.length; i++) {
  const a = arrivals[i];
  let s = 0;                                    // servidor que se libera antes
  for (let k = 1; k < mechanics; k++)
    if (serverFree[k] < serverFree[s]) s = k;
  const start = Math.max(a, serverFree[s]);     // espera si aún está ocupado
  const dur = exp(service);
  const end = start + dur;
  serverFree[s] = end;                          // el servidor queda ocupado hasta 'end'
  const wait = start - a;                       // tiempo en cola
}`}</Code>

          <H3 id="motor-tandem">5.5 Colas en tándem (multietapa)</H3>
          <P>
            El modelo multietapa encadena varias colas: la salida de una etapa es la llegada a la siguiente. Se lleva un
            arreglo <span className="font-mono">ready</span> con el instante en que cada entidad está lista para la etapa
            actual; tras servir la etapa, ese valor se actualiza al fin de servicio.
          </P>
          <Code>{`let ready = arrivals.slice();          // llegada a la etapa actual
stages.forEach((stg, s) => {
  const free = new Array(stg.resources).fill(0);
  // ...misma lógica de asignación de servidores que en M/M/c...
  ready[i] = end;                      // salida de la etapa = llegada a la siguiente
});`}</Code>

          <H3 id="motor-decision">5.6 Enrutamiento por decisión (compuerta XOR)</H3>
          <P>
            En el modelo con decisión, cada entidad se asigna a la ruta A o B en la llegada según la probabilidad{' '}
            <span className="font-mono">pA</span>. Luego se reutiliza el mismo motor de servidores por etapa
            (<span className="font-mono">runStage</span>): recepción y pago procesan a todas las entidades, mientras que
            cada ruta procesa solo las suyas.
          </P>
          <Code caption="Asignación de ruta y ejecución de las cuatro etapas; A y B convergen en el pago.">{`route: rng() * 100 < pA ? 'A' : 'B'   // decisión al llegar

runStage(all,  ready, rec.resources,  rec.service,  ...); // Recepción (todas)
runStage(idxA, ready, repA.resources, repA.service, ...); // Ruta A
runStage(idxB, ready, repB.resources, repB.service, ...); // Ruta B
runStage(all,  ready, pay.resources,  pay.service,  ...); // Pago (convergen)`}</Code>

          <H3 id="motor-eventos">5.7 Motor por eventos con min-heap (modelado libre)</H3>
          <P>
            El modelado libre sí es una simulación por eventos discretos "de verdad": mantiene una cola de eventos como
            un <b className="font-semibold text-[#18181b]">min-heap binario</b> ordenado por tiempo y avanza siempre al
            próximo evento. Hay dos tipos de evento: <span className="font-mono">enter</span> (una entidad entra a un
            bloque) y <span className="font-mono">depart</span> (termina el servicio). Los gateways enrutan al instante;
            las actividades ocupan un servidor si hay capacidad o, si no, encolan.
          </P>
          <Code caption="Bucle principal dirigido por eventos y lógica de entrada a una actividad.">{`while (events.length) {
  const ev = heapPop(events);   // evento con el menor tiempo
  if (ev.kind === 'enter') enter(ev.entityId, ev.nodeId, ev.time);
  else depart(ev);
}

function enter(id, nodeId, time) {
  const node = byId[nodeId];
  if (node.type === 'gateway') { /* elige puerto A o B por probabilidad */ }
  if (node.type === 'activity') {
    if (rt.busy < cap) {                 // hay servidor libre -> se atiende
      rt.busy++;
      const end = time + exp(node.service);
      heapPush(events, { time: end, kind: 'depart', nodeId, entityId: id });
    } else {
      rt.queue.push({ entityId: id, enq: time }); // si no, a la cola
    }
  }
}`}</Code>
          <P>
            Al ocurrir un <span className="font-mono">depart</span>, se libera el servidor, se toma el siguiente de la cola
            (calculando su espera) y la entidad se reenvía por las aristas de salida del bloque hacia el siguiente nodo.
          </P>

          <H3 id="motor-metricas">5.8 Cálculo de métricas de salida</H3>
          <P>
            La utilización de cada recurso es el tiempo que estuvo ocupado dentro del horizonte dividido entre su
            capacidad total (servidores × horizonte). Se acota el tiempo ocupado al horizonte para no sesgar por servicios
            que terminan después. El cuello de botella es la etapa con mayor utilización.
          </P>
          <Code>{`// tiempo ocupado dentro del horizonte
busy += Math.max(0, Math.min(end, horizon) - Math.min(start, horizon));
const util = Math.min(100, (busy / (resources * horizon)) * 100);

// cuello de botella = mayor utilización
perStage.forEach((p, i) => { if (p.util > perStage[bn].util) bn = i; });`}</Code>
          <P>
            El resto de los indicadores (espera promedio, tiempo en sistema y entidades procesadas) se obtienen recorriendo
            la traza y promediando sobre las entidades completadas dentro del horizonte.
          </P>
        </main>
      </div>
    </div>
  );
}
