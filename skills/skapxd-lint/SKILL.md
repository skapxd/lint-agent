---
name: skapxd-lint
description: Audita o adopta Lint Agent en un proyecto sin configurar ESLint; devuelve hallazgos con mensajes que ensenan el fix, sin modificar el proyecto.
---

# skapxd-lint

Usa esta skill cuando necesites auditar o adoptar Lint Agent en un proyecto sin instalar ni configurar ESLint en ese proyecto.

La skill no reimplementa reglas, presets ni deteccion. Invoca siempre el CLI publicado de Lint Agent en npm y trata sus mensajes como el contrato operativo.

## Comando base

Ejecuta el paquete publicado de Lint Agent, anclado al major `@1`:

```bash
npx @skapxd/lint-agent@1 <path> --yes --format toon
```

Anclado a major `@1` (no `@latest` mutable): recibes parches y minors sin saltar a un major que pueda romper o estar comprometido. El paquete se publica en npm con provenance (procedencia verificable). Para adopcion permanente, instala el paquete como devDependency (version fija + lockfile con integridad) y corre el bin `skapxd-lint`; reserva `npx` para auditorias puntuales.

No uses builds locales, no asumas que el paquete esta instalado en el proyecto medido y no dependas del formato `compact` por defecto.

## Tipos autocontenidos (default desde `@7`)

Por defecto el CLI **clona el `tsconfig` del proyecto** a uno temporal y activa `strict`, `noImplicitReturns` y `noUncheckedIndexedAccess`, para que las reglas type-aware (`no-unsafe-*`, `no-impossible-branch`, etc.) opinen con la verdad de runtime aunque el proyecto no tenga esos flags. Esto **reduce falsos positivos** (p. ej. `no-impossible-branch` deja de acusar guards de acceso por indice que son necesarios). La salida lo declara con transparencia: el campo `typeConfig` en `toon`/`json` (`source: cloned|generated|project`, `addedFlags: [...]`) y una linea `tipos:` en `compact`. Usa `--use-project-tsconfig` para evaluar con el `tsconfig` del proyecto tal cual, sin endurecer.

Preferencia de formato:

- Usa `--format toon` por defecto: es estructurado y eficiente para agentes.
- Usa `--format json` solo como fallback cuando TOON sea insuficiente o confuso para la tarea.
- Nunca parses ni tomes decisiones automatizadas desde `compact`.

## Escenario: proyecto nuevo o limpio

1. Corre el preset completo sobre el proyecto:

   ```bash npx @skapxd/lint-agent@1 <path> --yes --format toon ```

2. Lee los hallazgos por archivo y regla.
3. Arregla el codigo antes de que la deuda exista, si el usuario pidio aplicar fixes.
4. Repite el comando hasta que no queden hallazgos.

El objetivo en un proyecto nuevo es que el codigo nazca cumpliendo el preset completo, no crear una lista de pendientes.

## Escenario: legacy con adopcion incremental

Usa el bucle `--adopt` y `--verify` para limpiar reglas completas por lotes reproducibles:

```bash
npx @skapxd/lint-agent@1 <path> --yes --format toon --adopt 10
```

Para repos con mucha deuda el reporte puede ser enorme y saturar el contexto del agente o la terminal. Vuelca la salida a un archivo con `--output <archivo>` y leelo por partes (grep, por regla, por archivo) en vez de stdout:

```bash
npx @skapxd/lint-agent@1 <path> --yes --format toon --output skapxd-report.toon
```

Luego lee `skapxd-report.toon` selectivamente; no lo vuelques entero al contexto. El stdout muestra solo el resumen.

La salida de `--adopt <percent>` incluye una seed con forma `skapxd1...`. Esa seed es el contrato reproducible del lote: fija el conjunto de reglas objetivo para que la ronda no cambie mientras editas.

`--adopt` ordena las reglas objetivo por capa de dependencia primero: las premisas van antes que sus dependientes, y dentro de la misma capa conserva el desempate por archivos afectados, violaciones y nombre. En `toon`/`json`, cada regla objetivo expone `dependencyLayer` y, cuando aplica, `blockedBy` con las premisas que todavia tienen hallazgos en esa corrida.

## Prioridad estable de reglas

La prioridad estatica se calcula por posicion en este listado: numero menor = se resuelve antes. El orden deriva de `RULE_LAYERS` y usa `ruleId` alfabetico como desempate estable dentro de la misma capa. El reporte del CLI sigue siendo la fuente final para una corrida concreta porque refina esta guia con archivos afectados, violaciones y bloqueos reales del proyecto.

1. [`skapxd/async-functions-return-result`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/async-functions-return-result.md)
2. [`skapxd/class-properties-require-readonly`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/class-properties-require-readonly.md)
3. [`skapxd/complex-inline-callback-requires-name`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/complex-inline-callback-requires-name.md)
4. [`skapxd/dense-function-requires-comment`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/dense-function-requires-comment.md)
5. [`skapxd/jsx-return-name-pascal-case`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/jsx-return-name-pascal-case.md)
6. [`skapxd/max-class-size`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/max-class-size.md)
7. [`skapxd/max-hook-size`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/max-hook-size.md)
8. [`skapxd/max-public-methods`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/max-public-methods.md)
9. [`skapxd/nest-controller-delegates-to-use-case`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-controller-delegates-to-use-case.md)
10. [`skapxd/nest-controller-injects-use-case`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-controller-injects-use-case.md)
11. [`skapxd/nest-controller-input-dtos`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-controller-input-dtos.md)
12. [`skapxd/nest-controller-returns-dto`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-controller-returns-dto.md)
13. [`skapxd/nest-dto-no-class-decorator`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-dto-no-class-decorator.md)
14. [`skapxd/nest-dto-no-inline-object`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-dto-no-inline-object.md)
15. [`skapxd/nest-module-layer-folders`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-module-layer-folders.md)
16. [`skapxd/nest-no-direct-instantiation`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-no-direct-instantiation.md)
17. [`skapxd/nest-no-inline-query-params`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-no-inline-query-params.md)
18. [`skapxd/nest-no-result-response`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-no-result-response.md)
19. [`skapxd/nest-requires-swagger-plugin`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-requires-swagger-plugin.md)
20. [`skapxd/nest-use-case-no-result-response`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-use-case-no-result-response.md)
21. [`skapxd/nest-validation-pipe-config`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-validation-pipe-config.md)
22. [`skapxd/nested-function-requires-capture`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nested-function-requires-capture.md)
23. [`skapxd/no-accessors`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-accessors.md)
24. [`skapxd/no-ad-hoc-ok-result`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-ad-hoc-ok-result.md)
25. [`skapxd/no-anonymous-condition`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-anonymous-condition.md)
26. [`skapxd/no-deep-relative-imports`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-deep-relative-imports.md)
27. [`skapxd/no-default-export`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-default-export.md)
28. [`skapxd/no-else`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-else.md)
29. [`skapxd/no-emoji`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-emoji.md)
30. [`skapxd/no-explicit-any`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-explicit-any.md)
31. [`skapxd/no-exported-function-bag`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-exported-function-bag.md)
32. [`skapxd/no-floating-promises`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-floating-promises.md)
33. [`skapxd/no-functions-inside-components`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-functions-inside-components.md)
34. [`skapxd/no-internal-module-imports`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-internal-module-imports.md)
35. [`skapxd/no-jsx-ternary-null`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-jsx-ternary-null.md)
36. [`skapxd/no-local-function-bag`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-local-function-bag.md)
37. [`skapxd/no-magic-numbers`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-magic-numbers.md)
38. [`skapxd/no-nested-if`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-nested-if.md)
39. [`skapxd/no-non-null-assertion`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-non-null-assertion.md)
40. [`skapxd/no-promise-chain`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-promise-chain.md)
41. [`skapxd/no-rethrow-result-error`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-rethrow-result-error.md)
42. [`skapxd/no-runtime-state-guard`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-runtime-state-guard.md)
43. [`skapxd/no-silenced-compiler`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-silenced-compiler.md)
44. [`skapxd/no-try-catch`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-try-catch.md)
45. [`skapxd/no-tunnel-props`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-tunnel-props.md)
46. [`skapxd/no-unsafe-argument`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-unsafe-argument.md)
47. [`skapxd/no-unsafe-assignment`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-unsafe-assignment.md)
48. [`skapxd/no-unsafe-call`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-unsafe-call.md)
49. [`skapxd/no-unsafe-member-access`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-unsafe-member-access.md)
50. [`skapxd/no-unsafe-return`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-unsafe-return.md)
51. [`skapxd/no-unverified-cast`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-unverified-cast.md)
52. [`skapxd/one-root-function-per-file`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/one-root-function-per-file.md)
53. [`skapxd/one-root-unit-per-file`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/one-root-unit-per-file.md)
54. [`skapxd/package-requires-typed-exports`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/package-requires-typed-exports.md)
55. [`skapxd/prefer-abort-signal`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/prefer-abort-signal.md)
56. [`skapxd/prefer-node-protocol-for-builtins`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/prefer-node-protocol-for-builtins.md)
57. [`skapxd/prefer-tagged-union-state`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/prefer-tagged-union-state.md)
58. [`skapxd/prefer-ts-pattern`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/prefer-ts-pattern.md)
59. [`skapxd/prefer-type-over-interface`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/prefer-type-over-interface.md)
60. [`skapxd/repeated-jsx-requires-component`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/repeated-jsx-requires-component.md)
61. [`skapxd/requires-strict-tsconfig`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/requires-strict-tsconfig.md)
62. [`skapxd/result-error-requires-cause`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/result-error-requires-cause.md)
63. [`skapxd/result-error-requires-handling`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/result-error-requires-handling.md)
64. [`skapxd/result-error-requires-modeling`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/result-error-requires-modeling.md)
65. [`skapxd/trysafe-only-at-boundary`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/trysafe-only-at-boundary.md)
66. [`skapxd/await-requires-result`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/await-requires-result.md)
67. [`skapxd/filename-matches-root-function`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/filename-matches-root-function.md)
68. [`skapxd/nest-dto-requires-api-property`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-dto-requires-api-property.md)
69. [`skapxd/nest-dto-requires-validation`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-dto-requires-validation.md)
70. [`skapxd/nest-layer-import-direction`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-layer-import-direction.md)
71. [`skapxd/nest-no-swagger-in-controllers`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/nest-no-swagger-in-controllers.md)
72. [`skapxd/no-impossible-branch`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/no-impossible-branch.md)
73. [`skapxd/prefer-schema-validation`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/prefer-schema-validation.md)
74. [`skapxd/untrusted-module-requires-adapter`](https://github.com/skapxd/lint-agent/blob/main/docs/reglas/untrusted-module-requires-adapter.md)

Flujo:

1. Corre `--adopt <percent>`.
2. Extrae la seed `skapxd1...` y las reglas objetivo.
3. Aplica solo los fixes necesarios para esas reglas objetivo, si el usuario pidio modificar el codigo.
4. Verifica el mismo lote:

   ```bash npx @skapxd/lint-agent@1 <path> --yes --format toon --verify <seed> ```

5. Si `--verify <seed>` todavia reporta hallazgos del objetivo, sigue corrigiendo ese lote.
6. Cuando el lote queda limpio, sube el porcentaje o repite `--adopt <percent>` para abrir la siguiente ronda.

No cierres una ronda por conteo global. Cierra la ronda solo cuando `--verify <seed>` confirme que las reglas objetivo de esa seed ya no tienen hallazgos.

## Lectura de la salida

El valor de la salida no es el conteo bruto. El valor son los mensajes-playbook: cada mensaje ensena que contrato se rompio y que forma de fix espera la regla.

Desde `@7`, el reporte **por defecto** (con o sin `--adopt`) abre con una seccion `rules (orden de resolucion, premisas primero)`: lista numerada de las reglas con hallazgos, ordenada por capa de dependencia y luego esfuerzo, marcando `[premisa]` y `[bloqueada por: ...]`. Empieza por arriba: las premisas primero desbloquean a sus dependientes y evitan trabajo en vano. En `toon`/`json` cada regla expone `dependencyLayer` y `blockedBy`.

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
npx @skapxd/lint-agent@1 <path> --yes --format toon --changed --base origin/main
```

Usa este modo para evitar que deuda legacy fuera del diff bloquee una tarea acotada. No lo confundas con adopcion completa del repo.
