'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';

const SECTIONS = [
  { id: 'introduccion', label: '1. Introducción' },
  { id: 'requisitos', label: '2. Requisitos y acceso' },
  { id: 'navegacion', label: '3. Navegación general' },
  { id: 'simple', label: '4. Proceso simple' },
  { id: 'multietapa', label: '5. Proceso multietapa' },
  { id: 'decision', label: '6. Proceso con decisión' },
  { id: 'libre', label: '7. Modelado libre' },
  { id: 'exportacion', label: '8. Exportación a Excel' },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="mb-3 mt-12 scroll-mt-24 text-[22px] font-bold tracking-[-.02em] text-[#18181b] first:mt-0">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3.5 max-w-[720px] text-[14.5px] leading-[1.72] text-[#3f3f46]">{children}</p>;
}
function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="mb-4 max-w-[720px] list-decimal space-y-2.5 pl-5 text-[14.5px] leading-[1.6] text-[#3f3f46] marker:font-semibold marker:text-[#9a9aa4]">{children}</ol>;
}
function Figura({ src, children }: { src: string; children: string }) {
  const [ok, setOk] = useState(true);
  const path = 'public' + src; // ubicación del archivo en el proyecto
  if (ok) {
    return (
      <figure className="my-4 max-w-[720px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={children} onError={() => setOk(false)} className="w-full rounded-xl border border-[#ececef]" />
        <figcaption className="mt-1.5 px-1 text-[12px] text-[#9a9aa4]">{children}</figcaption>
      </figure>
    );
  }
  return (
    <div className="my-4 flex max-w-[720px] items-center gap-3 rounded-xl border border-dashed border-[#d3d3f5] bg-[#fafafe] px-4 py-6 text-[13px] text-[#8a8a99]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5a5c9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 16l-5-5L4 20" />
      </svg>
      <span>
        <b className="font-semibold text-[#6d6d8a]">Imagen:</b> {children}
        <span className="mt-1 block font-mono text-[11.5px] text-[#a5a5c9]">{path}</span>
      </span>
    </div>
  );
}

export default function Manual() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -68% 0px', threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
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
            <div className="mb-3 text-[15px] font-semibold tracking-[-.01em]">Manual de usuario</div>
            <ul className="space-y-0.5">
              {SECTIONS.map((s) => {
                const on = active === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={on ? 'true' : undefined}
                      className={
                        'block rounded-lg px-2 py-1.5 text-[13px] leading-snug no-underline transition-colors ' +
                        (on ? 'bg-[#eeeefb] font-semibold text-[#5a5ad6]' : 'text-[#62626c] hover:bg-[#f4f4f6] hover:text-[#18181b]')
                      }
                    >
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Contenido */}
        <main className="min-w-0">
          <div className="mb-10">
            <span className="mb-3 inline-flex items-center gap-[7px] rounded-full bg-[#eeeefb] px-[13px] py-[5px] text-[11.5px] font-semibold uppercase tracking-[.06em] text-[#5a5ad6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5a5ad6]"></span>
              Guía de uso
            </span>
            <h1 className="text-[34px] font-bold leading-[1.1] tracking-[-.03em]">Manual de usuario</h1>
            <p className="mt-3 max-w-[720px] text-[15px] leading-[1.7] text-[#62626c]">
              Guía paso a paso para configurar, ejecutar y analizar simulaciones en la aplicación, así como para exportar los resultados.
            </p>
          </div>

          <H2 id="introduccion">1. Introducción</H2>
          <P>
            Esta aplicación web permite construir y ejecutar simulaciones de eventos discretos de procesos de colas,
            visualizar sus indicadores de desempeño y exportar los resultados a Excel. Ofrece cuatro tipos de simulación:
            proceso simple, multietapa, con decisión y modelado libre. No requiere instalación: funciona por completo en el
            navegador.
          </P>
          <Figura src="/images/manual/img1.png">Pantalla de inicio de la aplicación con las cuatro tarjetas de modelos.</Figura>

          <H2 id="requisitos">2. Requisitos y acceso</H2>
          <P>Para utilizar la aplicación solo se necesita:</P>
          <Steps>
            <li>Un navegador web moderno (Google Chrome, Microsoft Edge, Firefox o Safari).</li>
            <li>No se requiere instalar programas ni crear una cuenta.</li>
            <li>Ingresar a la dirección web de la aplicación (o ejecutarla localmente y abrir <span className="font-mono text-[13px]">http://localhost:3000</span>).</li>
          </Steps>

          <H2 id="navegacion">3. Navegación general</H2>
          <P>
            En la parte superior se encuentra la barra de navegación, presente en todas las pantallas. Desde ella puede
            cambiar entre los modelos (Inicio, Proceso simple, Multietapa, Con decisión, Modelado libre) y acceder a la
            Documentación y a este Manual. La pestaña del modelo activo aparece resaltada.
          </P>
          <Figura src="/images/manual/img2.png">Barra de navegación superior señalando las pestañas de los modelos.</Figura>
          <P>
            Desde la pantalla de Inicio también puede abrir cualquier modelo haciendo clic en su tarjeta. Todos los modelos
            (excepto el modelado libre) comparten la misma estructura: un diagrama del proceso en la parte superior, un
            panel de configuración para introducir los datos y una sección de resultados que aparece al ejecutar la
            simulación.
          </P>

          <H2 id="simple">4. Proceso simple</H2>
          <Steps>
            <li>En la barra superior, haga clic en <b className="font-semibold text-[#18181b]">Proceso simple</b>.</li>
            <li>En el panel de Configuración, introduzca el tiempo entre llegadas, el tiempo de servicio, los servidores disponibles y el horizonte de simulación.</li>
            <li>(Opcional) En la sección Nombres puede personalizar cómo se llaman la entidad, la actividad y el recurso (por ejemplo, "Paciente", "Consulta", "Doctor").</li>
          </Steps>
          <Figura src="/images/manual/img3.png">Panel de configuración del proceso simple con los campos de entrada.</Figura>
          <Steps>
            <li>Haga clic en el botón <b className="font-semibold text-[#18181b]">Ejecutar Simulación</b>.</li>
            <li>Revise los indicadores (tiempo de espera, entidades atendidas, utilización y tiempo en el sistema) y la tabla de tiempos, con una fila por entidad. Puede alternar entre ver Todos los eventos o solo los que tuvieron espera.</li>
          </Steps>
          <Figura src="/images/manual/img4.png">Sección de resultados del proceso simple con los indicadores y la tabla de tiempos.</Figura>
          <Steps>
            <li>Para ver las gráficas, haga clic en <b className="font-semibold text-[#18181b]">Ver gráficas</b>: se abrirá una ventana con el histograma de tiempos de espera y la evolución de la cola y la utilización en el tiempo. Al pasar el cursor sobre las gráficas se muestra el valor exacto.</li>
            <li>Para descargar los resultados, haga clic en <b className="font-semibold text-[#18181b]">Exportar a Excel</b>.</li>
          </Steps>
          <Figura src="/images/manual/img5.png">Ventana de gráficas mostrando el histograma y las series de tiempo.</Figura>

          <H2 id="multietapa">5. Proceso multietapa</H2>
          <Steps>
            <li>Haga clic en <b className="font-semibold text-[#18181b]">Multietapa</b> en la barra superior.</li>
            <li>En la tabla de Configuración de actividades, escriba el nombre de cada etapa y ajuste su tiempo de servicio y sus recursos disponibles.</li>
            <li>Para agregar una etapa use el botón <b className="font-semibold text-[#18181b]">Agregar etapa</b>; para eliminar una, use el botón × de su fila (o el que aparece sobre cada bloque del diagrama al pasar el cursor).</li>
            <li>Defina el tiempo entre llegadas y el horizonte de la simulación.</li>
          </Steps>
          <Figura src="/images/manual/img6.png">Tabla de configuración de actividades del proceso multietapa, con los botones de agregar y eliminar etapa.</Figura>
          <Steps>
            <li>Haga clic en <b className="font-semibold text-[#18181b]">Ejecutar Simulación</b>.</li>
            <li>Revise los indicadores generales, la tabla de desempeño por etapa (que resalta el cuello de botella) y la traza de eventos por entidad.</li>
            <li>Use <b className="font-semibold text-[#18181b]">Exportar a Excel</b> para descargar los resultados.</li>
          </Steps>
          <Figura src="/images/manual/img7.png">Resultados del proceso multietapa con la tabla de desempeño por etapa.</Figura>

          <H2 id="decision">6. Proceso con decisión</H2>
          <Steps>
            <li>Haga clic en <b className="font-semibold text-[#18181b]">Con decisión</b> en la barra superior.</li>
            <li>En la tabla de configuración, defina las cuatro actividades (recepción, las dos rutas y el cierre): su nombre, tiempo de servicio y recursos.</li>
            <li>Con el control deslizante de la compuerta, ajuste el porcentaje de reparto entre la Ruta A y la Ruta B (siempre suman 100 %).</li>
            <li>Defina el tiempo entre llegadas y el horizonte.</li>
          </Steps>
          <Figura src="/images/manual/img8.png">Configuración del proceso con decisión, señalando el control de reparto de rutas.</Figura>
          <Steps>
            <li>Haga clic en <b className="font-semibold text-[#18181b]">Ejecutar Simulación</b>.</li>
            <li>Revise los indicadores, las métricas de la compuerta (reparto observado vs. configurado), la comparativa por ruta y la traza de eventos.</li>
            <li>Use <b className="font-semibold text-[#18181b]">Exportar a Excel</b> para descargar los resultados.</li>
          </Steps>
          <Figura src="/images/manual/img9.png">Resultados del proceso con decisión con las métricas por ruta.</Figura>

          <H2 id="libre">7. Modelado libre</H2>
          <P>Esta pantalla es un editor donde usted construye su propio proceso.</P>
          <Steps>
            <li>Haga clic en <b className="font-semibold text-[#18181b]">Modelado libre</b> en la barra superior.</li>
            <li>Desde el panel izquierdo, agregue bloques al lienzo haciendo clic en Llegada, Actividad, Compuerta o Fin.</li>
          </Steps>
          <Figura src="/images/manual/img10.png">Pantalla de modelado libre con el panel de bloques a la izquierda y el lienzo.</Figura>
          <Steps>
            <li>Mueva un bloque arrastrándolo. Edite sus valores (nombre, tiempos, recursos) directamente en el bloque.</li>
            <li>Conecte dos bloques arrastrando desde el punto de salida de uno hasta otro. Para eliminar una conexión, haga clic sobre ella; para eliminar un bloque, use su botón ×.</li>
            <li>Navegue por el lienzo: arrastre el fondo para desplazarse y use la rueda del ratón (o los botones + / −) para acercar y alejar. El botón de ajustar al contenido encuadra todo el modelo.</li>
            <li>Ajuste el Horizonte (arriba a la derecha) y haga clic en <b className="font-semibold text-[#18181b]">Ejecutar Simulación</b>.</li>
            <li>Los resultados se abren automáticamente en un panel lateral derecho. Con el botón de pantalla completa puede ampliarlo, con Exportar a Excel descargar los datos y con la × cerrarlo.</li>
          </Steps>
          <Figura src="/images/manual/img11.png">Lienzo del modelado libre con varios bloques conectados y los controles de zoom, y el panel de resultados a la derecha.</Figura>

          <H2 id="exportacion">8. Exportación a Excel</H2>
          <P>
            En todos los modelos, el botón Exportar a Excel descarga un archivo con la configuración de entrada, los
            indicadores de salida y la tabla de tiempos. El archivo puede abrirse en Microsoft Excel, Google Sheets,
            LibreOffice Calc y Apache OpenOffice Calc.
          </P>
          <Figura src="/images/manual/img12.png">Archivo de Excel exportado, abierto en una hoja de cálculo.</Figura>
        </main>
      </div>
    </div>
  );
}
