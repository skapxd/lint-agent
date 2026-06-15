# @skapxd/eslint-opinionated

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Reglas de ESLint para que los agentes no negocien la arquitectura de tu proyecto.

Este paquete convierte opiniones de arquitectura en guardrails ejecutables: archivos pequenos, nombres semanticos, errores modelados con `Result`, causas preservadas y fronteras explicitas. El README queda como puerta de entrada; el detalle vive en `docs/` para que npm no entierre lo importante en 2.400 lineas.

## Skill para agentes

Instala la skill `skapxd-lint` en tu agente con un comando compatible con skills.sh y 20+ agentes como Claude Code, Cursor y Copilot:

```bash
npx skills add skapxd/eslint-opinionated
```

Luego pide al agente que la use:

- "Audita este proyecto con skapxd-lint y muestrame los hallazgos."
- "Adopta las reglas skapxd de forma incremental (10%) en este repo legacy."
- "Verifica el lote de adopcion skapxd con la seed que acaba de generar el CLI."

La skill esta indexada en skills.sh, invoca el CLI publicado `@skapxd/eslint-opinionated@5` con npm provenance y no modifica el proyecto medido: la evaluacion es efimera y solo lectura salvo que pidas aplicar fixes.

Si no usas la skill, puedes invocar el CLI directo:

```bash
npx @skapxd/eslint-opinionated@5 <path> --yes --format toon
```

## Uso rapido

```bash
pnpm add -D @skapxd/eslint-opinionated eslint typescript typescript-eslint
```

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  skapxd.configs.shared.base,
];
```

Luego ejecutalo como cualquier regla de ESLint:

```bash
pnpm eslint
pnpm eslint src
pnpm eslint --max-warnings=0
```

## Documentacion

Los enlaces apuntan a GitHub de forma absoluta para que funcionen tambien desde npmjs.com.

| Tema | Contenido |
| --- | --- |
| [Axiomas y motivacion](https://github.com/skapxd/eslint-opinionated/blob/main/docs/axiomas.md) | Por que existe el paquete, que protege y por que las alternativas no bastan. |
| [Presets y estructura](https://github.com/skapxd/eslint-opinionated/blob/main/docs/presets.md) | Shared, backend, frontend, Next.js, NestJS, Astro, package y strict. |
| [Adopcion incremental y legacy](https://github.com/skapxd/eslint-opinionated/blob/main/docs/adopcion-legacy.md) | Lint sobre cambios, olas de adopcion, overrides y propuestas de reglas. |
| [Pipeline Result](https://github.com/skapxd/eslint-opinionated/blob/main/docs/pipeline-result.md) | Como encajan @skapxd/result, ts-pattern y el trace global. |
| [Notas type-aware](https://github.com/skapxd/eslint-opinionated/blob/main/docs/notas-type-aware.md) | Supuestos, limites conocidos y notas de reglas que dependen del checker. |
| [Indice de reglas](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/README.md) | Las 54 fichas individuales en docs/reglas/. |

## Reglas

| Regla | Que protege |
| --- | --- |
| [`skapxd/one-root-function-per-file`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/one-root-function-per-file.md) | Un archivo, una función top-level semántica. |
| [`skapxd/filename-matches-root-function`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/filename-matches-root-function.md) | El nombre del archivo es la versión kebab de su función raíz exportada. |
| [`skapxd/async-functions-return-result`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/async-functions-return-result.md) | Funciones async de dominio deben retornar `Promise<Result<...>>`. **Apagada por defecto; opt-in** (ver motivos en su sección). |
| [`skapxd/requires-strict-tsconfig`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/requires-strict-tsconfig.md) | El `tsconfig` debe ser implacable (`strict`, `noImplicitReturns`, `noUncheckedIndexedAccess`): sin ellos, el compilador no puede hacer irrepresentable lo inválido. |
| [`skapxd/result-error-requires-cause`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/result-error-requires-cause.md) | Un `Result.err` derivado debe preservar `cause: result.error`. |
| [`skapxd/result-error-requires-handling`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/result-error-requires-handling.md) | Prohíbe descartar en silencio un Result fallido: el error se transforma o se entrega, nunca se ignora. |
| [`skapxd/await-requires-result`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/await-requires-result.md) | Todo `await` debe resolver en un `Result`: o la función llamada retorna `Promise<Result<...>>` (preferido) o se envuelve en `trySafe`. **Obligatoria en todos los presets tipados.** |
| [`skapxd/no-ad-hoc-ok-result`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-ad-hoc-ok-result.md) | Evita contratos `{ ok: ... }` hechos a mano en async exports. |
| [`skapxd/max-hook-size`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/max-hook-size.md) | Marca hooks grandes o con demasiados `useState`. |
| [`skapxd/class-properties-require-readonly`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/class-properties-require-readonly.md) | Toda propiedad de clase es `readonly`: el cambio se modela con instancias nuevas, no con mutación. |
| [`skapxd/max-public-methods`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/max-public-methods.md) | Una clase, una responsabilidad: máximo N métodos públicos (default 1). Agnóstica al framework, en las reglas base; el preset `nest` le inyecta sus hooks. |
| [`skapxd/no-accessors`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-accessors.md) | Prohíbe `get`/`set`: un método explícito dice la verdad; el accessor esconde computación (y métodos disfrazados). |
| [`skapxd/jsx-return-name-pascal-case`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/jsx-return-name-pascal-case.md) | Funciones que retornan JSX deben nombrarse como componentes. |
| [`skapxd/nest-dto-requires-api-property`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nest-dto-requires-api-property.md) | Toda propiedad pública de un `*.dto.ts` lleva `@ApiProperty`: el contrato HTTP se documenta en el DTO. Preset `nest`. |
| [`skapxd/nest-dto-requires-validation`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nest-dto-requires-validation.md) | Los DTOs de input validan en runtime: class-validator en cada propiedad, `@IsOptional` si hay `?`, `@Type` junto a `@ValidateNested`. Preset `nest`. |
| [`skapxd/nest-no-direct-instantiation`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nest-no-direct-instantiation.md) | Prohíbe `new` sobre imports internos en services: las dependencias entran por el constructor (DI). Preset `nest`. |
| [`skapxd/nest-no-inline-query-params`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nest-no-inline-query-params.md) | Dos o más `@Query('x')`/`@ApiQuery` individuales son un DTO disfrazado: consolida en `@Query() filters: Dto`. Preset `nest`. |
| [`skapxd/nest-no-result-response`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nest-no-result-response.md) | Los métodos de un `@Controller` no retornan `Result`: el envelope se serializaría al cliente. La activa el preset `nest`. |
| [`skapxd/nest-no-swagger-in-controllers`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nest-no-swagger-in-controllers.md) | Los controllers no se llenan de decoradores de swagger; el plugin introspecciona los DTOs. Preset `nest`. |
| [`skapxd/nest-requires-swagger-plugin`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nest-requires-swagger-plugin.md) | `nest-cli.json` debe tener el plugin `@nestjs/swagger`: la premisa de las reglas de swagger, verificada. Preset `nest`. |
| [`skapxd/nest-validation-pipe-config`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nest-validation-pipe-config.md) | Todo `new ValidationPipe` configura `transform` y `whitelist`: la premisa de las reglas de DTOs. Preset `nest`. |
| [`skapxd/nested-function-requires-capture`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/nested-function-requires-capture.md) | Una funcion anidada nombrada debe capturar scope local; si no, es un helper extraible. Preset `shared`, en `error`. |
| [`skapxd/no-anonymous-condition`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-anonymous-condition.md) | El `if` solo acepta condiciones ya nombradas; todo cómputo (llamada, comparación, `&&`/`||`) se extrae a una `const` con nombre semántico. |
| [`skapxd/no-deep-relative-imports`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-deep-relative-imports.md) | Limita la profundidad de los imports relativos (`../`). |
| [`skapxd/no-default-export`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-default-export.md) | Prohíbe `export default`; el nombre del símbolo es el contrato. Exime configs/stories y, en el preset `next`, los entrypoints del App Router. |
| [`skapxd/no-else`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-else.md) | Prohíbe `else`/`else if`: el else es el estado sin nombre. Retorno anticipado, ternario simple o `match()`. |
| [`skapxd/no-emoji`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-emoji.md) | Prohíbe emojis en strings y JSX; cada sistema los renderiza distinto. Usa un icono SVG. |
| [`skapxd/no-explicit-any`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-explicit-any.md) | Prohíbe `any`: apaga el sistema de tipos donde más se necesita. `unknown` para lo desconocido, el tipo real para lo demás. Wrapper de typescript-eslint. |
| [`skapxd/no-floating-promises`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-floating-promises.md) | Promesas sin `await` ni `void`: el rechazo muere sin pasar por trySafe. El mensaje corrige el consejo upstream (`.then/.catch` aquí están prohibidos). Wrapper de typescript-eslint. |
| [`skapxd/no-magic-numbers`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-magic-numbers.md) | Prohíbe números mágicos: un literal numérico significativo debe extraerse a una `const` con nombre de dominio. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-argument`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-unsafe-argument.md) | Impide pasar un `any` invisible como argumento: la frontera debe declararse `unknown` y estrecharse con schema o predicate. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-assignment`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-unsafe-assignment.md) | Impide asignar un `any` invisible a variables o propiedades: la frontera debe declararse `unknown` y validarse. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-call`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-unsafe-call.md) | Impide invocar valores `any`: antes de llamar hay que probar el tipo real con evidencia runtime. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-member-access`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-unsafe-member-access.md) | Impide leer propiedades sobre `any`: `JSON.parse()`/`response.json()` pasan por `unknown` + schema/predicate antes de tocar campos. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-return`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-unsafe-return.md) | Impide retornar `any` desde una funcion tipada: el dato externo se estrecha antes de salir de la frontera. Wrapper de typescript-eslint. |
| [`skapxd/no-unverified-cast`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-unverified-cast.md) | Prohíbe casts `as` que estrechan sin evidencia: schema, type predicate honesto o tipo de origen mejor modelado. Wrapper de typescript-eslint. |
| [`skapxd/prefer-schema-validation`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/prefer-schema-validation.md) | Detecta validadores artesanales con muchos checks estructurales sobre el mismo `unknown`/`any`: eso ya es un schema, decláralo. |
| [`skapxd/no-impossible-branch`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-impossible-branch.md) | Condiciones que el type-checker demuestra constantes: la pregunta ya tiene respuesta. Es `@typescript-eslint/no-unnecessary-condition` con nombre semántico y mensajes que enseñan el fix. |
| [`skapxd/no-nested-if`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-nested-if.md) | Prohíbe `if` anidados: retorno anticipado o `match()`. Menos carga cognitiva y sin puntos ciegos para las demás reglas. |
| [`skapxd/no-non-null-assertion`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-non-null-assertion.md) | Prohíbe el `!`: es "cállate, yo sé más que tú" dicho al compilador. Modela el tipo o maneja la duda. Wrapper de typescript-eslint. |
| [`skapxd/no-runtime-state-guard`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-runtime-state-guard.md) | Prohíbe `if (this.x) throw` en métodos: el estado inválido se hace irrepresentable en el tipo, no se vigila en runtime. |
| [`skapxd/no-silenced-compiler`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-silenced-compiler.md) | Prohíbe `@ts-ignore`/`@ts-nocheck`: silenciar la alarma no arregla el incendio. `@ts-expect-error` con descripción queda para tests de tipos. Wrapper de `ban-ts-comment`. |
| [`skapxd/no-tunnel-props`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-tunnel-props.md) | Ninguna prop viaja más de un nivel: quien la recibe no puede reenviarla a otro componente. Mata el prop drilling. |
| [`skapxd/prefer-abort-signal`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/prefer-abort-signal.md) | Listeners en efectos se limpian con `AbortController` (`{ signal }` + `abort()`), no con `removeEventListener`. |
| [`skapxd/prefer-node-protocol-for-builtins`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/prefer-node-protocol-for-builtins.md) | Builtins de Node siempre con protocolo `node:`: separa runtime de npm y evita ambigüedad cross-runtime. |
| [`skapxd/prefer-tagged-union-state`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/prefer-tagged-union-state.md) | Prohíbe estados inconsistentes representables: flag de loading + campo de error independientes → unión etiquetada. |
| [`skapxd/prefer-type-over-interface`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/prefer-type-over-interface.md) | Las uniones discriminadas son types; un `type` no crece en silencio por declaration merging. Wrapper de `consistent-type-definitions`. |
| [`skapxd/no-functions-inside-components`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-functions-inside-components.md) | Prohíbe definir funciones dentro de componentes React. |
| [`skapxd/no-try-catch`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-try-catch.md) | Prohíbe `try/catch`; usa `trySafe` de `@skapxd/result`. |
| [`skapxd/no-promise-chain`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-promise-chain.md) | Prohíbe `.then/.catch/.finally`; usa `await` (+ `trySafe`). |
| [`skapxd/prefer-ts-pattern`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/prefer-ts-pattern.md) | Prohíbe `switch` y ternarios anidados; usa `match()` de ts-pattern. |
| [`skapxd/package-requires-typed-exports`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/package-requires-typed-exports.md) | Los `exports` del package.json declaran `types` por condición (`import` → `.d.mts`, `require` → `.d.ts`): mata el bug FalseCJS. Preset `package`. |
| [`skapxd/untrusted-module-requires-adapter`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/untrusted-module-requires-adapter.md) | Los paquetes con tipos mentirosos (@types desfasados) solo se importan desde su adaptador: la mentira vive en UN archivo. Preset `package`. |
| [`skapxd/no-jsx-ternary-null`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/no-jsx-ternary-null.md) | Prefiere `cond && <El />` sobre `cond ? <El /> : null` en JSX. |
| [`skapxd/repeated-jsx-requires-component`](https://github.com/skapxd/eslint-opinionated/blob/main/docs/reglas/repeated-jsx-requires-component.md) | Detecta patrones JSX repetidos tres veces que ya son un componente sin nombre. Activa como `error` en `frontend`, `next/react` y `astro/react`. |

## Licencia

MIT
