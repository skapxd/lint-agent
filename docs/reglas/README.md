# Indice de reglas

[README principal](../../README.md)

Cada ficha vive en un archivo propio. El indice conserva la descripcion corta de cada regla y enlaza al detalle movido desde el README original.

| Regla | Que protege |
| --- | --- |
| [`skapxd/one-root-function-per-file`](./one-root-function-per-file.md) | Un archivo, una función top-level semántica. |
| [`skapxd/filename-matches-root-function`](./filename-matches-root-function.md) | El nombre del archivo es la versión kebab de su función raíz exportada. |
| [`skapxd/dense-function-requires-comment`](./dense-function-requires-comment.md) | Funciones exportadas densas en líneas, literales y ramas declaran su motivación en un comentario de bloque. |
| [`skapxd/async-functions-return-result`](./async-functions-return-result.md) | Funciones async de dominio deben retornar `Promise<Result<...>>`. **Apagada por defecto; opt-in** (ver motivos en su sección). |
| [`skapxd/requires-strict-tsconfig`](./requires-strict-tsconfig.md) | El `tsconfig` debe ser implacable (`strict`, `noImplicitReturns`, `noUncheckedIndexedAccess`): sin ellos, el compilador no puede hacer irrepresentable lo inválido. |
| [`skapxd/result-error-requires-cause`](./result-error-requires-cause.md) | Un `Result.err` derivado debe preservar `cause: result.error`. |
| [`skapxd/result-error-requires-handling`](./result-error-requires-handling.md) | Prohíbe descartar en silencio un Result fallido: el error se transforma o se entrega, nunca se ignora. |
| [`skapxd/result-error-requires-modeling`](./result-error-requires-modeling.md) | Una frontera no puede devolver `Result<_, unknown>`: el canal de error debe modelarse como un error de dominio (tagged union), no quedar opaco. |
| [`skapxd/await-requires-result`](./await-requires-result.md) | Todo `await` debe resolver en un `Result`: o la función llamada retorna `Promise<Result<...>>` (preferido) o se envuelve en `trySafe`. **Obligatoria en todos los presets tipados.** |
| [`skapxd/no-rethrow-result-error`](./no-rethrow-result-error.md) | Prohíbe re-lanzar el error crudo de un `Result`: el flujo no vuelve de `trySafe` a excepción cruda. |
| [`skapxd/trysafe-only-at-boundary`](./trysafe-only-at-boundary.md) | Exige que `trySafe` capture en la frontera runtime/paquete, no una capa arriba sobre código del proyecto. **En las bases** (agnóstica de framework); detección conservadora para acotar falsos positivos. |
| [`skapxd/no-ad-hoc-ok-result`](./no-ad-hoc-ok-result.md) | Evita contratos `{ ok: ... }` hechos a mano en async exports. |
| [`skapxd/max-hook-size`](./max-hook-size.md) | Marca hooks grandes o con demasiados `useState`. |
| [`skapxd/class-properties-require-readonly`](./class-properties-require-readonly.md) | Toda propiedad de clase es `readonly`: el cambio se modela con instancias nuevas, no con mutación. |
| [`skapxd/max-public-methods`](./max-public-methods.md) | Una clase, una responsabilidad: máximo N métodos públicos (default 1). Agnóstica al framework, en las reglas base; el preset `nest` le inyecta sus hooks. |
| [`skapxd/no-accessors`](./no-accessors.md) | Prohíbe `get`/`set`: un método explícito dice la verdad; el accessor esconde computación (y métodos disfrazados). |
| [`skapxd/jsx-return-name-pascal-case`](./jsx-return-name-pascal-case.md) | Funciones que retornan JSX deben nombrarse como componentes. |
| [`skapxd/nest-dto-no-inline-object`](./nest-dto-no-inline-object.md) | Los objetos anidados de un DTO se modelan como clases DTO, no como tipos inline ni `type: Object`. Preset `nest`. |
| [`skapxd/nest-dto-requires-api-property`](./nest-dto-requires-api-property.md) | Toda propiedad pública de un `*.dto.ts` lleva `@ApiProperty`: el contrato HTTP se documenta en el DTO. Preset `nest`. |
| [`skapxd/nest-dto-requires-validation`](./nest-dto-requires-validation.md) | Los DTOs de input validan en runtime: class-validator en cada propiedad, `@IsOptional` si hay `?`, `@Type` junto a `@ValidateNested`. Preset `nest`. |
| [`skapxd/nest-no-direct-instantiation`](./nest-no-direct-instantiation.md) | Prohíbe `new` sobre imports internos en services: las dependencias entran por el constructor (DI). Preset `nest`. |
| [`skapxd/nest-no-inline-query-params`](./nest-no-inline-query-params.md) | Dos o más `@Query('x')`/`@ApiQuery` individuales son un DTO disfrazado: consolida en `@Query() filters: Dto`. Preset `nest`. |
| [`skapxd/nest-no-result-response`](./nest-no-result-response.md) | Los métodos de un `@Controller` no retornan `Result`: el envelope se serializaría al cliente. La activa el preset `nest`. |
| [`skapxd/nest-no-swagger-in-controllers`](./nest-no-swagger-in-controllers.md) | Los controllers no se llenan de decoradores de swagger; el plugin introspecciona los DTOs. Preset `nest`. |
| [`skapxd/nest-requires-swagger-plugin`](./nest-requires-swagger-plugin.md) | `nest-cli.json` debe tener el plugin `@nestjs/swagger`: la premisa de las reglas de swagger, verificada. Preset `nest`. |
| [`skapxd/nest-validation-pipe-config`](./nest-validation-pipe-config.md) | Todo `new ValidationPipe` configura `transform` y `whitelist`: la premisa de las reglas de DTOs. Preset `nest`. |
| [`skapxd/nested-function-requires-capture`](./nested-function-requires-capture.md) | Una funcion anidada nombrada debe capturar scope local; si no, es un helper extraible. Preset `shared`, en `error`. |
| [`skapxd/no-anonymous-condition`](./no-anonymous-condition.md) | El `if` solo acepta condiciones ya nombradas; todo cómputo (llamada, comparación, `&&`/`||`) se extrae a una `const` con nombre semántico. |
| [`skapxd/no-deep-relative-imports`](./no-deep-relative-imports.md) | Limita la profundidad de los imports relativos (`../`). |
| [`skapxd/no-default-export`](./no-default-export.md) | Prohíbe `export default`; el nombre del símbolo es el contrato. Exime configs/stories y, en el preset `next`, los entrypoints del App Router. |
| [`skapxd/no-else`](./no-else.md) | Prohíbe `else`/`else if`: el else es el estado sin nombre. Retorno anticipado, ternario simple o `match()`. |
| [`skapxd/no-emoji`](./no-emoji.md) | Prohíbe emojis en strings y JSX; cada sistema los renderiza distinto. Usa un icono SVG. |
| [`skapxd/no-explicit-any`](./no-explicit-any.md) | Prohíbe `any`: apaga el sistema de tipos donde más se necesita. `unknown` para lo desconocido, el tipo real para lo demás. Wrapper de typescript-eslint. |
| [`skapxd/no-floating-promises`](./no-floating-promises.md) | Promesas sin `await` ni `void`: el rechazo muere sin pasar por trySafe. El mensaje corrige el consejo upstream (`.then/.catch` aquí están prohibidos). Wrapper de typescript-eslint. |
| [`skapxd/no-magic-numbers`](./no-magic-numbers.md) | Prohíbe números mágicos: un literal numérico significativo debe extraerse a una `const` con nombre de dominio. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-argument`](./no-unsafe-argument.md) | Impide pasar un `any` invisible como argumento: la frontera debe declararse `unknown` y estrecharse con schema o predicate. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-assignment`](./no-unsafe-assignment.md) | Impide asignar un `any` invisible a variables o propiedades: la frontera debe declararse `unknown` y validarse. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-call`](./no-unsafe-call.md) | Impide invocar valores `any`: antes de llamar hay que probar el tipo real con evidencia runtime. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-member-access`](./no-unsafe-member-access.md) | Impide leer propiedades sobre `any`: `JSON.parse()`/`response.json()` pasan por `unknown` + schema/predicate antes de tocar campos. Wrapper de typescript-eslint. |
| [`skapxd/no-unsafe-return`](./no-unsafe-return.md) | Impide retornar `any` desde una funcion tipada: el dato externo se estrecha antes de salir de la frontera. Wrapper de typescript-eslint. |
| [`skapxd/no-unverified-cast`](./no-unverified-cast.md) | Prohíbe casts `as` que estrechan sin evidencia: schema, type predicate honesto o tipo de origen mejor modelado. Wrapper de typescript-eslint. |
| [`skapxd/prefer-schema-validation`](./prefer-schema-validation.md) | Detecta validadores artesanales con muchos checks estructurales sobre el mismo `unknown`/`any`: eso ya es un schema, decláralo. |
| [`skapxd/no-impossible-branch`](./no-impossible-branch.md) | Condiciones que el type-checker demuestra constantes: la pregunta ya tiene respuesta. Es `@typescript-eslint/no-unnecessary-condition` con nombre semántico y mensajes que enseñan el fix. |
| [`skapxd/no-nested-if`](./no-nested-if.md) | Prohíbe `if` anidados: retorno anticipado o `match()`. Menos carga cognitiva y sin puntos ciegos para las demás reglas. |
| [`skapxd/no-non-null-assertion`](./no-non-null-assertion.md) | Prohíbe el `!`: es "cállate, yo sé más que tú" dicho al compilador. Modela el tipo o maneja la duda. Wrapper de typescript-eslint. |
| [`skapxd/no-runtime-state-guard`](./no-runtime-state-guard.md) | Prohíbe `if (this.x) throw` en métodos: el estado inválido se hace irrepresentable en el tipo, no se vigila en runtime. |
| [`skapxd/no-silenced-compiler`](./no-silenced-compiler.md) | Prohíbe `@ts-ignore`/`@ts-nocheck`: silenciar la alarma no arregla el incendio. `@ts-expect-error` con descripción queda para tests de tipos. Wrapper de `ban-ts-comment`. |
| [`skapxd/no-tunnel-props`](./no-tunnel-props.md) | Ninguna prop viaja más de un nivel: quien la recibe no puede reenviarla a otro componente. Mata el prop drilling. |
| [`skapxd/prefer-abort-signal`](./prefer-abort-signal.md) | Listeners en efectos se limpian con `AbortController` (`{ signal }` + `abort()`), no con `removeEventListener`. |
| [`skapxd/prefer-node-protocol-for-builtins`](./prefer-node-protocol-for-builtins.md) | Builtins de Node siempre con protocolo `node:`: separa runtime de npm y evita ambigüedad cross-runtime. |
| [`skapxd/prefer-tagged-union-state`](./prefer-tagged-union-state.md) | Prohíbe estados inconsistentes representables: flag de loading + campo de error independientes → unión discriminada. |
| [`skapxd/prefer-type-over-interface`](./prefer-type-over-interface.md) | Las uniones discriminadas son types; un `type` no crece en silencio por declaration merging. Wrapper de `consistent-type-definitions`. |
| [`skapxd/no-functions-inside-components`](./no-functions-inside-components.md) | Prohíbe definir funciones dentro de componentes React. |
| [`skapxd/no-try-catch`](./no-try-catch.md) | Prohíbe `try/catch`; usa `trySafe` de `@skapxd/result`. |
| [`skapxd/no-promise-chain`](./no-promise-chain.md) | Prohíbe `.then/.catch/.finally`; usa `await` (+ `trySafe`). |
| [`skapxd/prefer-ts-pattern`](./prefer-ts-pattern.md) | Prohíbe `switch` y ternarios anidados; usa `match()` de ts-pattern. |
| [`skapxd/package-requires-typed-exports`](./package-requires-typed-exports.md) | Los `exports` del package.json declaran `types` por condición (`import` → `.d.mts`, `require` → `.d.ts`): mata el bug FalseCJS. Preset `package`. |
| [`skapxd/untrusted-module-requires-adapter`](./untrusted-module-requires-adapter.md) | Los paquetes con tipos mentirosos (@types desfasados) solo se importan desde su adaptador: la mentira vive en UN archivo. Preset `package`. |
| [`skapxd/no-jsx-ternary-null`](./no-jsx-ternary-null.md) | Prefiere `cond && <El />` sobre `cond ? <El /> : null` en JSX. |
| [`skapxd/repeated-jsx-requires-component`](./repeated-jsx-requires-component.md) | Detecta patrones JSX repetidos tres veces que ya son un componente sin nombre. Activa como `error` en `frontend`, `next/react` y `astro/react`. |
