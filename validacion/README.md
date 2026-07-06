# Validación del simulador

Evidencia de la validación de resultados (sección 5.2 del documento). Se compara el
motor de simulación propio contra un motor independiente (**SimPy**) reconstruyendo
los mismos modelos con idénticas distribuciones (exponenciales), medias, número de
servidores y estructura del proceso.

Cada modelo se ejecuta con **25 réplicas** y un **horizonte de 100 000 min**, y se
reporta el promedio ± intervalo de confianza al 95 % de: Wq (espera en cola),
W (tiempo en el sistema) y la utilización promedio.

## Archivos

- `app_val.ts` — corre el motor propio (`src/lib/simulate-*.ts`).
- `simpy_val.py` — corre el mismo modelo en SimPy (motor independiente).

## Cómo ejecutar

```bash
# Motor propio (desde la raíz del proyecto)
npx tsx validacion/app_val.ts

# SimPy
pip install simpy
python3 validacion/simpy_val.py
```

## Configuraciones comparadas

| Modelo | Parámetros |
|---|---|
| Simple M/M/1 | llegadas ~Exp(10), servicio ~Exp(7), c=1 |
| Simple M/M/2 | llegadas ~Exp(5), servicio ~Exp(8), c=2 |
| Multietapa | llegadas ~Exp(10); etapas: (5,1) (7,2) (6,1) |
| Con decisión | llegadas ~Exp(10); rec(5,1), A(8,1), B(15,2), pago(4,1); 60/40 |

En los cuatro modelos la diferencia entre ambos motores fue menor al 3 %, con
intervalos de confianza solapados, lo que valida la precisión del algoritmo.
