### `skapxd/requires-strict-tsconfig`

Todo el sistema descansa en que el compilador pueda hacer irrepresentables
los estados inválidos — y eso exige un `tsconfig` implacable. Esta regla lee
el `tsconfig.json` **real** del proyecto (con la API de TypeScript: soporta
JSONC y resuelve la cadena de `extends`) y exige los flags, reportando una
vez por proyecto: si existe un archivo ancla (`anchorFilePatterns`, default
`src/main.ts(x)`/`src/index.ts(x)`), el reporte le pertenece a ese archivo;
si el proyecto no tiene entrypoint clásico (Astro, librerías), reporta sobre
el primer archivo del run y los demás callan — un proyecto sin ancla no se
queda sin guardián:

- `strict` — sin él, el sistema de tipos está apagado a medias.
- `noImplicitReturns` — una rama que sale sin valor deja de ser silenciosa
  (la pareja en compilación de `no-else`).
- `noUncheckedIndexedAccess` — `array[i]` y los accesos dinámicos confiesan
  su `undefined` en vez de fingir.

`strict: true` **no implica** los otros dos: hay que pedirlos explícitos.
Fuera del default, a propósito: `exactOptionalPropertyTypes` y
`strictPropertyInitialization` chocan con los DTOs de class-transformer y
con muchas librerías — se agregan vía `requiredCompilerOptions` si el
proyecto los soporta.

Además, los **presets tipados activan reglas curadas de typescript-eslint**,
todas **re-registradas bajo el namespace skapxd** (mismo motor, cero
reimplementación — typescript-eslint ya es peer dependency): nombres que
dicen lo que defienden, mensajes en español que enseñan el fix, y un solo
namespace en toda tu lista de pendientes. Cada una tiene su sección propia:

- `skapxd/no-explicit-any` — `any` apaga el sistema de tipos: todo el
  esfuerzo muere donde aparece uno.
- `skapxd/prefer-type-over-interface` (era `consistent-type-definitions`) —
  las uniones discriminadas son types.
- `skapxd/no-floating-promises` — cierra el hueco que `await-requires-result`
  no ve: una llamada async **sin** `await` no produce `AwaitExpression`, así
  que el rechazo muere sin pasar por `trySafe` (medido: 12 promesas
  flotantes vivas en un backend Nest real).
- `skapxd/no-non-null-assertion` — `!` es "cállate, yo sé más que tú" dicho
  al compilador. (En `nest/tests` queda apagada: el `!` sobre un fixture es
  el arrange, no una mentira.)
- `skapxd/no-impossible-branch` (era `no-unnecessary-condition`) — la
  generalización type-aware de `no-runtime-state-guard`. Va de la mano de
  `requires-strict-tsconfig`: sin `noUncheckedIndexedAccess`, `array[i]`
  miente y la regla acusaría guards necesarios.
- `skapxd/no-silenced-compiler` (era `ban-ts-comment`) — un error de tipos
  se arregla modelando mejor, no silenciando la alarma.

Ausencias deliberadas, no olvidos:

| Regla ausente | Por qué |
| --- | --- |
| `switch-exhaustiveness-check` | `prefer-ts-pattern` prohíbe el `switch` entero; `match().exhaustive()` da la misma garantía sin él. |
| `prefer-readonly` | Superada por `class-properties-require-readonly`: exige `readonly` en la declaración, no solo en privados nunca reasignados. |
| `strict-boolean-expressions` | Castiga narrowing legítimo por cientos (560 hallazgos en un backend real) sin hacer irrepresentable ningún estado nuevo. Ruido, no señal. |
| `explicit-module-boundary-types` | Los contratos que importan ya están gobernados (`await-requires-result`, `nest-no-result-response`); anotar el resto es ceremonia (198 hallazgos) que la inferencia resuelve sin perder garantías. |
| `prefer-readonly-parameter-types` | Impracticable con cualquier parámetro que venga de una librería externa. |

Complemento recomendado (fuera del alcance de un linter): **tests a nivel de
tipos**. Si el dominio vive en los tipos, los tipos también se testean — con
[`expectTypeOf` de vitest](https://vitest.dev/guide/testing-types) (ya está en
tu stack, sin instalar `tsd`) o con `@ts-expect-error` descrito, que es
exactamente el caso que `ban-ts-comment` deja abierto:

```ts
import { expectTypeOf } from "vitest";

test("un pedido cancelado no puede tener trackingId", () => {
  expectTypeOf<Extract<Order, { status: "cancelled" }>>()
    .not.toHaveProperty("trackingId");
});
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
