---
name: skapxd-lint
description: Audita o adopta las reglas de arquitectura skapxd en un proyecto sin configurar ESLint; devuelve hallazgos con mensajes que ensenan el fix, sin modificar el proyecto.
---

# skapxd-lint

Usa esta skill cuando necesites auditar o adoptar las reglas de arquitectura skapxd en un proyecto sin instalar ni configurar ESLint en ese proyecto.

La skill no reimplementa reglas, presets ni deteccion. Invoca siempre el CLI publicado en npm y trata sus mensajes como el contrato operativo.

## Comando base

Ejecuta el paquete publicado, anclado al major `@5`:

```bash
npx @skapxd/eslint-opinionated@5 <path> --yes --format toon
```

Anclado a major `@5` (no `@latest` mutable): recibes parches y minors sin saltar a un major que pueda romper o estar comprometido. El paquete se publica en npm con provenance (procedencia verificable). Para adopcion permanente, instala el paquete como devDependency (version fija + lockfile con integridad) y corre el bin `skapxd-lint`; reserva `npx` para auditorias puntuales.

No uses builds locales, no asumas que el paquete esta instalado en el proyecto medido y no dependas del formato `compact` por defecto.

Preferencia de formato:

- Usa `--format toon` por defecto: es estructurado y eficiente para agentes.
- Usa `--format json` solo como fallback cuando TOON sea insuficiente o confuso para la tarea.
- Nunca parses ni tomes decisiones automatizadas desde `compact`.

## Escenario: proyecto nuevo o limpio

1. Corre el preset completo sobre el proyecto:

   ```bash npx @skapxd/eslint-opinionated@5 <path> --yes --format toon ```

2. Lee los hallazgos por archivo y regla.
3. Arregla el codigo antes de que la deuda exista, si el usuario pidio aplicar fixes.
4. Repite el comando hasta que no queden hallazgos.

El objetivo en un proyecto nuevo es que el codigo nazca cumpliendo el preset completo, no crear una lista de pendientes.

## Escenario: legacy con adopcion incremental

Usa el bucle `--adopt` y `--verify` para limpiar reglas completas por lotes reproducibles:

```bash
npx @skapxd/eslint-opinionated@5 <path> --yes --format toon --adopt 10
```

La salida de `--adopt <percent>` incluye una seed con forma `skapxd1...`. Esa seed es el contrato reproducible del lote: fija el conjunto de reglas objetivo para que la ronda no cambie mientras editas.

Flujo:

1. Corre `--adopt <percent>`.
2. Extrae la seed `skapxd1...` y las reglas objetivo.
3. Aplica solo los fixes necesarios para esas reglas objetivo, si el usuario pidio modificar el codigo.
4. Verifica el mismo lote:

   ```bash npx @skapxd/eslint-opinionated@5 <path> --yes --format toon --verify <seed> ```

5. Si `--verify <seed>` todavia reporta hallazgos del objetivo, sigue corrigiendo ese lote.
6. Cuando el lote queda limpio, sube el porcentaje o repite `--adopt <percent>` para abrir la siguiente ronda.

No cierres una ronda por conteo global. Cierra la ronda solo cuando `--verify <seed>` confirme que las reglas objetivo de esa seed ya no tienen hallazgos.

## Lectura de la salida

El valor de la salida no es el conteo bruto. El valor son los mensajes-playbook: cada mensaje ensena que contrato se rompio y que forma de fix espera la regla.

Agrupa el trabajo por:

1. Archivo.
2. Regla.
3. Mensaje-playbook.

Evita mezclar reglas no objetivo en una ronda legacy. Si aparecen hallazgos fuera de la seed actual, tratalos como informacion para una ronda futura salvo que el usuario pida ampliar el alcance.

## Modo solo lectura

Por defecto esta skill audita. El CLI crea evaluacion efimera, no instala configuracion persistente en el proyecto medido y no debe dejar `.tmp-skapxd-lint-*.config.*`.

No modifiques el proyecto medido salvo que el usuario pida aplicar los fixes. Si solo pidio auditar, reporta hallazgos y comandos reproducibles.

## Modo cambiados

Para revisar solo lo tocado por git:

```bash
npx @skapxd/eslint-opinionated@5 <path> --yes --format toon --changed --base origin/main
```

Usa este modo para evitar que deuda legacy fuera del diff bloquee una tarea acotada. No lo confundas con adopcion completa del repo.
