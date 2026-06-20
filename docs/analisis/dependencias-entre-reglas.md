# Spike: dependencias entre reglas y capas topologicas

## Alcance y metodo

Este spike analiza el arbol actual de `origin/main` en el worktree `codex/issue-102-rule-deps-spike`. El contrato del adjunto habla de 57 reglas, pero el repo actual tiene 57 archivos `src/rules/*.ts` solo si se cuenta `src/rules/no-unsafe-common.ts`, que es helper compartido y no esta registrado ni documentado como regla; el universo operativo son 56 ids en `src/shared/rules.ts`, con 56 fichas en `docs/reglas/*.md`.

La clasificacion es conservadora: una arista entra al grafo duro solo si la ficha o la implementacion dice que una regla/configuracion es premisa de otra y arreglar fuera de orden puede producir falso positivo, trabajo que luego se revierte, o una regla semanticamente incompleta sin la premisa. Las relaciones de cobertura, afinidad tematica o “estas reglas forman familia” quedan fuera de las capas.

Shorthands de presets usados en la tabla:

| Alias | Presets concretos |
| --- | --- |
| `base-family` | `shared/base`, `shared/backend`, `shared/frontend`, `shared/package`, `nest/base`, `next/base`, `next/server`, `astro/base`, `astro/astro-files` |
| `typed-family` | `shared/backend`, `shared/frontend`, `shared/package`, `nest/base` |
| `react-family` | `shared/frontend`, `next/react`, `astro/react` |

## Tabla por regla

| Regla | Preset(s) donde se activa | Premisas duras | Tipo | Evidencia | Capa |
| --- | --- | --- | --- | --- | --- |
| `class-properties-require-readonly` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `dense-function-requires-comment` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `filename-matches-root-function` | `base-family` | `one-root-function-per-file`, `no-default-export` | regla | `docs/reglas/filename-matches-root-function.md:7`: “La regla se apoya en dos premisas ya activas en las bases: `one-root-function-per-file` deja un unico candidato semantico y `no-default-export` hace que el nombre publico sea el named export.” | 1 |
| `no-accessors` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `one-root-function-per-file` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `jsx-return-name-pascal-case` | `react-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `async-functions-return-result` | opt-in; ningun preset | - | - | `docs/reglas/async-functions-return-result.md:3-4` la declara apagada por defecto y subordina el contrato obligatorio a `await-requires-result`, pero no prueba una arista dura hacia otra regla. | 0 |
| `no-ad-hoc-ok-result` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `await-requires-result` | `shared/backend`, `shared/frontend`, `shared/package`, `nest/base`, `next/server`, `astro/typescript` | `no-ad-hoc-ok-result` | regla | `docs/reglas/no-ad-hoc-ok-result.md:3`: “la exencion type-aware de `await-requires-result` no lo reconoce”; la regla exime `Result/Promise<Result>` real y `@UseCase` real de `@skapxd/nest`, pero no contratos `{ ok: ... }` caseros. | 1 |
| `result-error-requires-cause` | `base-family` | - | - | Sin premisa dura citada; la mencion a `no-nested-if` en `docs/reglas/result-error-requires-cause.md:17` es cobertura de un punto ciego, no orden de adopcion duro. | 0 |
| `result-error-requires-handling` | `base-family` | - | - | Sin premisa dura citada; `docs/reglas/result-error-requires-handling.md:13` dice que `result-error-requires-cause` vigila transformaciones, pero ambas pueden operar en la misma capa. | 0 |
| `max-hook-size` | `react-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `max-public-methods` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `nest-dto-requires-api-property` | `nest/base` | `nest-requires-swagger-plugin` | config verificada por regla | `docs/reglas/nest-requires-swagger-plugin.md:3`: “Las reglas de swagger del preset (`nest-no-swagger-in-controllers`, `nest-dto-requires-api-property`) descansan sobre una premisa: el plugin `@nestjs/swagger` activo en `nest-cli.json`”. | 1 |
| `nest-dto-requires-validation` | `nest/base` | `nest-validation-pipe-config` | config verificada por regla | `src/nest/create-nest-configs.ts:59-62`: “un ValidationPipe con transform + whitelist (la premisa de las reglas de DTOs)”; `src/rules/nest-validation-pipe-config.ts:14` dice que sin esas opciones el contrato de DTOs no se cumple en runtime. | 1 |
| `nest-no-direct-instantiation` | `nest/services` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `nest-no-inline-query-params` | `nest/controllers` | - | - | Sin premisa dura separada: su mensaje prescribe crear DTO con validadores y swagger, pero no exige ordenar otra regla antes. | 0 |
| `nest-no-result-response` | `nest/base` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `nest-no-swagger-in-controllers` | `nest/base` | `nest-requires-swagger-plugin` | config verificada por regla | `docs/reglas/nest-requires-swagger-plugin.md:14`: “Sin el plugin, el swagger queda vacio - y como el preset prohibe documentarlo a mano en los controllers...”; `src/rules/nest-no-swagger-in-controllers.ts:18-19` asume el plugin activo. | 1 |
| `nest-requires-swagger-plugin` | `nest/base` | - | - | Es premisa verificada, no dependiente. | 0 |
| `nest-validation-pipe-config` | `nest/base` | - | - | Es premisa verificada, no dependiente. | 0 |
| `nested-function-requires-capture` | `base-family` | - | - | Sin premisa dura; `docs/reglas/nested-function-requires-capture.md:46` delega la frontera React a `no-functions-inside-components`, pero eso es frontera tematica. | 0 |
| `no-anonymous-condition` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-deep-relative-imports` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-default-export` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-else` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-emoji` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-explicit-any` | `typed-family` | - | - | Sin premisa dura; `src/shared/configs/type-driven-rules.ts:33-35` separa el `any` explicito del `any` invisible, pero no impone orden. | 0 |
| `no-floating-promises` | `typed-family` | - | - | Sin premisa dura; `src/shared/configs/type-driven-rules.ts:27-31` dice que cierra el hueco que `await-requires-result` no ve, pero eso revela cobertura nueva, no revierte fixes previos. | 0 |
| `no-magic-numbers` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-unsafe-argument` | `typed-family` | - | - | Sin premisa dura; `docs/reglas/no-unsafe-argument.md:21` cita `nest-dto-requires-validation` como frontera Nest, pero la implementacion es wrapper type-driven y no ordena adopcion. | 0 |
| `no-unsafe-assignment` | `typed-family` | - | - | Sin premisa dura; `docs/reglas/no-unsafe-assignment.md:21` cita `nest-dto-requires-validation` como frontera Nest, pero la implementacion es wrapper type-driven y no ordena adopcion. | 0 |
| `no-unsafe-call` | `typed-family` | - | - | Sin premisa dura; `docs/reglas/no-unsafe-call.md:21` cita `nest-dto-requires-validation` como frontera Nest, pero la implementacion es wrapper type-driven y no ordena adopcion. | 0 |
| `no-unsafe-member-access` | `typed-family` | - | - | Sin premisa dura; la familia `no-unsafe-*` cierra el `any` invisible, no depende de `requires-strict-tsconfig`. | 0 |
| `no-unsafe-return` | `typed-family` | - | - | Sin premisa dura; la familia `no-unsafe-*` cierra el `any` invisible, no depende de `requires-strict-tsconfig`. | 0 |
| `no-unverified-cast` | `typed-family` | - | - | Sin premisa dura; es premisa para `prefer-schema-validation`. | 0 |
| `no-impossible-branch` | `typed-family` | `requires-strict-tsconfig` | config verificada por regla | `docs/reglas/no-impossible-branch.md:10`: “primero el tsconfig dice la verdad, despues esta regla opina”; `src/rules/no-impossible-branch.ts:38-39` requiere `strictNullChecks` y dice que `requires-strict-tsconfig` vigila esa premisa. | 1 |
| `no-non-null-assertion` | `typed-family` | - | - | Sin premisa dura citada; comparte axioma con `requires-strict-tsconfig`, pero no depende de sus flags para evitar falsos positivos. | 0 |
| `no-silenced-compiler` | `typed-family` | - | - | Sin premisa dura citada; `untrusted-module-requires-adapter` lo menciona como puerta controlada dentro del adaptador, no como orden topologico. | 0 |
| `prefer-type-over-interface` | `typed-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-tunnel-props` | `react-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-functions-inside-components` | `react-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-try-catch` | `base-family` | - | - | Sin premisa dura; recomienda `trySafe`, pero no exige que otra regla este resuelta primero. | 0 |
| `prefer-abort-signal` | `react-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `prefer-node-protocol-for-builtins` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `prefer-schema-validation` | `typed-family` | `no-unverified-cast` | regla | `docs/reglas/prefer-schema-validation.md:31`: “Esta regla viene despues: una vez que el valor externo sigue siendo `unknown` hasta validarse...”; `src/rules/prefer-schema-validation.ts:91-93` solo cuenta roots `unknown` o `any`. | 1 |
| `prefer-tagged-union-state` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `prefer-ts-pattern` | `base-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `requires-strict-tsconfig` | `base-family` | - | - | Es premisa de configuracion para otras reglas, no dependiente. | 0 |
| `no-jsx-ternary-null` | `react-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `no-nested-if` | `base-family` | - | - | Sin premisa dura; ayuda a cerrar puntos ciegos, pero no bloquea semantica de otras reglas. | 0 |
| `no-promise-chain` | `base-family` | - | - | Sin premisa dura; igual que `no-floating-promises`, puede revelar awaits futuros pero no invalida arreglos existentes. | 0 |
| `no-runtime-state-guard` | `base-family` | - | - | Sin premisa dura; `docs/reglas/no-runtime-state-guard.md:3` lo llama compañero de `prefer-tagged-union-state`, no premisa. | 0 |
| `package-requires-typed-exports` | `shared/package` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `repeated-jsx-requires-component` | `react-family` | - | - | Sin premisa dura citada en ficha/implementacion. | 0 |
| `untrusted-module-requires-adapter` | `shared/package` | `requires-strict-tsconfig` | config verificada por regla | `docs/reglas/untrusted-module-requires-adapter.md:7`: “Armadura de tsconfig primero: `noUncheckedIndexedAccess` corrige de raiz la clase mas comun de mentira ... `requires-strict-tsconfig` ya lo exige.” | 1 |

## Aristas duras del grafo

El grafo dirigido usa `premisa -> dependiente`.

| Premisa | Dependiente | Tipo | Evidencia |
| --- | --- | --- | --- |
| `one-root-function-per-file` | `filename-matches-root-function` | regla | `docs/reglas/filename-matches-root-function.md:7`: “`one-root-function-per-file` deja un unico candidato semantico”. |
| `no-default-export` | `filename-matches-root-function` | regla | `docs/reglas/filename-matches-root-function.md:7`: “`no-default-export` hace que el nombre publico sea el named export”. |
| `requires-strict-tsconfig` | `no-impossible-branch` | config verificada por regla | `docs/reglas/no-impossible-branch.md:10`: “primero el tsconfig dice la verdad, despues esta regla opina”. |
| `requires-strict-tsconfig` | `untrusted-module-requires-adapter` | config verificada por regla | `docs/reglas/untrusted-module-requires-adapter.md:7`: “Armadura de tsconfig primero”. |
| `no-ad-hoc-ok-result` | `await-requires-result` | regla | `docs/reglas/no-ad-hoc-ok-result.md:3`: “la exencion type-aware de `await-requires-result` no lo reconoce”. |
| `no-unverified-cast` | `prefer-schema-validation` | regla | `docs/reglas/prefer-schema-validation.md:31`: “Esta regla viene despues”. |
| `nest-requires-swagger-plugin` | `nest-no-swagger-in-controllers` | config verificada por regla | `docs/reglas/nest-requires-swagger-plugin.md:14`: sin plugin el swagger queda vacio mientras el preset prohibe documentar a mano en controllers. |
| `nest-requires-swagger-plugin` | `nest-dto-requires-api-property` | config verificada por regla | `docs/reglas/nest-requires-swagger-plugin.md:3`: las reglas de swagger del preset descansan en el plugin. |
| `nest-validation-pipe-config` | `nest-dto-requires-validation` | config verificada por regla | `src/nest/create-nest-configs.ts:59-62`: `ValidationPipe` con `transform` + `whitelist` es la premisa de las reglas de DTOs. |

## Relaciones blandas descartadas del grafo

| Relacion | Evidencia | Por que no es dura |
| --- | --- | --- |
| `no-nested-if` con `result-error-requires-cause` | `docs/reglas/result-error-requires-cause.md:17` dice que elimina el punto ciego del `Result.err` escondido en un `if` anidado. | Es cobertura adicional: no causa falsos positivos ni trabajo revertido si `result-error-requires-cause` se arregla antes. |
| `result-error-requires-cause` con `result-error-requires-handling` | `docs/reglas/result-error-requires-handling.md:13` dice que `result-error-requires-cause` vigila la transformacion. | Las reglas vigilan salidas distintas del mismo guard; pueden correr en la misma capa. |
| `await-requires-result` con `result-error-requires-cause` y `result-error-requires-handling` | Las tres forman el pipeline Result, pero las fichas no declaran “primero await, despues cause/handling”. | Convertir awaits a `Result` puede revelar mas guards, pero no hay evidencia de falso positivo ni de fix revertido. |
| `async-functions-return-result` con el pipeline Result | `docs/reglas/async-functions-return-result.md:3-4` dice que esta apagada por defecto y que la obligatoria es `await-requires-result`. | Es una variante opt-in mas estricta, no una premisa para el grafo de adopcion por defecto. |
| `no-floating-promises` con `await-requires-result` | `src/shared/configs/type-driven-rules.ts:27-31` dice que una llamada async sin await no produce `AwaitExpression`. | Puede revelar nuevos awaits despues de arreglarse, pero no hace incorrecto arreglar los awaits ya existentes. |
| `no-promise-chain` con `await-requires-result` | `src/rules/no-promise-chain.ts:18` empuja de `.then/.catch/.finally` a `await` o `trySafe`. | Mismo caso de cobertura: reemplazar chains puede crear nuevos awaits, pero no hay orden duro regla-regla. |
| `no-explicit-any` con `no-unsafe-*` | `src/shared/configs/type-driven-rules.ts:33-35` dice que la familia `no-unsafe-*` cierra el `any` invisible que `no-explicit-any` no ve. | Son complementarias: una no corrige ni invalida la otra. |
| `no-unsafe-*` con `nest-dto-requires-validation` | Las fichas `no-unsafe-*` dicen que en Nest un `req.body` validado por DTO pertenece a otra frontera. | Es frontera de runtime, no orden topologico: los wrappers `no-unsafe-*` no leen decoradores DTO ni `ValidationPipe`. |
| `no-unverified-cast` con `nest-dto-requires-validation` | `docs/reglas/no-unverified-cast.md:21` acepta validacion en frontera y cita Nest. | Es una salida valida para casts, no una premisa general para la regla. |
| `nested-function-requires-capture` con `no-functions-inside-components` | `docs/reglas/nested-function-requires-capture.md:46` dice que el terreno React pertenece a la regla React. | Es separacion de dominio por preset, no orden de adopcion. |
| `no-runtime-state-guard` con `prefer-tagged-union-state` | `docs/reglas/no-runtime-state-guard.md:3` lo llama “compañero”. | Comparten axioma de estado irrepresentable; no hay premisa declarada. |
| `nest-no-inline-query-params` con reglas DTO/Swagger/ValidationPipe | `src/rules/nest-no-inline-query-params.ts:20` prescribe crear DTO con validadores, `@ApiPropertyOptional` y `ValidationPipe`. | El fix de esta regla ya describe el paquete completo; no prueba que otra regla deba estar verde antes de reportarla. |
| `untrusted-module-requires-adapter` con `no-silenced-compiler` | `docs/reglas/untrusted-module-requires-adapter.md:9` permite `@ts-expect-error` con descripcion dentro del adaptador. | Es excepcion auditada, no dependencia de adopcion. |

## Sospechas sin arista dura

| Sospecha | Estado |
| --- | --- |
| “Todas las type-aware dependen de `requires-strict-tsconfig`.” | Falso con la evidencia actual. `src/shared/configs/type-driven-rules.ts:44-48` declara esa premisa solo para `no-impossible-branch`; las demas necesitan parser services en presets tipados, pero no los flags de `requires-strict-tsconfig` para evitar falsos positivos documentados. |
| “La cadena Result es `await-requires-result -> result-error-requires-cause -> result-error-requires-handling`.” | No entra como arista dura. Las fichas describen una disciplina comun, pero no prueban que arreglar `cause` o `handling` antes de `await` genere trabajo en vano. La unica arista dura del sistema Result encontrada fue `no-ad-hoc-ok-result -> await-requires-result`. |
| “La familia `no-unsafe-*` depende de `requires-strict-tsconfig`.” | No hay cita que lo sostenga. Es familia type-driven de wrappers sobre `@typescript-eslint/no-unsafe-*`; la dependencia documentada con `requires-strict-tsconfig` pertenece a `no-impossible-branch`. |

## Capas topologicas

No se detectaron ciclos. Las 9 aristas duras forman un DAG con profundidad maxima 1 (dos capas: 0 y 1).

| Capa | Cantidad | Porcentaje | Reglas |
| --- | ---: | ---: | --- |
| 0 | 48 | 85.7% | `class-properties-require-readonly`, `dense-function-requires-comment`, `no-accessors`, `one-root-function-per-file`, `jsx-return-name-pascal-case`, `async-functions-return-result`, `no-ad-hoc-ok-result`, `result-error-requires-cause`, `result-error-requires-handling`, `max-hook-size`, `max-public-methods`, `nest-no-direct-instantiation`, `nest-no-inline-query-params`, `nest-no-result-response`, `nest-requires-swagger-plugin`, `nest-validation-pipe-config`, `nested-function-requires-capture`, `no-anonymous-condition`, `no-deep-relative-imports`, `no-default-export`, `no-else`, `no-emoji`, `no-explicit-any`, `no-floating-promises`, `no-magic-numbers`, `no-unsafe-argument`, `no-unsafe-assignment`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-return`, `no-unverified-cast`, `no-non-null-assertion`, `no-silenced-compiler`, `prefer-type-over-interface`, `no-tunnel-props`, `no-functions-inside-components`, `no-try-catch`, `prefer-abort-signal`, `prefer-node-protocol-for-builtins`, `prefer-tagged-union-state`, `prefer-ts-pattern`, `requires-strict-tsconfig`, `no-jsx-ternary-null`, `no-nested-if`, `no-promise-chain`, `no-runtime-state-guard`, `package-requires-typed-exports`, `repeated-jsx-requires-component` |
| 1 | 8 | 14.3% | `filename-matches-root-function`, `await-requires-result`, `nest-dto-requires-api-property`, `nest-dto-requires-validation`, `nest-no-swagger-in-controllers`, `no-impossible-branch`, `prefer-schema-validation`, `untrusted-module-requires-adapter` |

## Ciclos detectados

No hay ciclos con las aristas duras admitidas. Tampoco hay una cadena profunda: ninguna regla queda en capa 2 o superior.

## Recomendacion para el flag de #102

La version con `--layer N`, `--tier N` o `--up-to-depth N` seria sobre-ingenieria hoy: el grafo duro tiene 56 reglas, 9 aristas, 48 reglas independientes en capa 0, 8 reglas en capa 1 y profundidad maxima 1. No hay evidencia para una feature de profundidad arbitraria.

La alternativa superior es que `--adopt` incorpore siempre la fundamentalidad como primer criterio de orden: capa topologica ascendente, luego esfuerzo actual (`affectedFileCount`, `violationCount`, nombre). Eso mejora el orden sin multiplicar flags y mantiene determinismo con la seed actual.

Para el filtro de frontera, si el volumen de reportes legacy lo justifica, basta un booleano combinable como `--frontier` o una estrategia equivalente de `--adopt` que muestre solo reglas desbloqueadas en la corrida actual. No recomendaria exponer `--layer N`: con profundidad real 1, el unico valor util es “frontera actual”. En JSON/TOON conviene exponer `dependencyLayer`, `blockedBy` y `unblocks` aunque compact solo imprima la lista sugerida.

Comportamiento propuesto:

| Decision | Recomendacion |
| --- | --- |
| Orden base de `--adopt` | Topologia primero, esfuerzo despues, nombre como desempate final. |
| Filtro de frontera | Booleano o estrategia de seleccion, no profundidad numerica. |
| Ocultar vs agrupar | Compact puede ocultar con `--frontier`; JSON/TOON debe conservar `blockedBy` para trazabilidad. |
| Regla resuelta | Cero hallazgos de la premisa en la corrida actual; no hace falta estado persistido para el primer corte. |
| Reglas independientes | Siempre capa 0 y siempre frontera inicial. |

## Mantenibilidad del grafo

Con 9 aristas duras y 8 dependientes reales, `dependsOn` dentro de cada modulo de regla mete metadata de CLI en 56 modulos para muy poco beneficio. Peor: varias premisas son configuraciones verificadas por reglas (`requires-strict-tsconfig`, `nest-requires-swagger-plugin`, `nest-validation-pipe-config`), no simples dependencias semanticas locales del modulo dependiente.

Recomendacion: empezar con un mapa central tipado, por ejemplo `rule-dependencies.ts`, con comentarios de evidencia o tests que obliguen a que cada edge apunte a ids registrados y tenga ficha/cita. El mapa central evita dispersar 9 aristas, facilita calcular `blockedBy`/`unblocks` en el CLI y deja abierta la migracion a metadata por regla si el grafo crece de verdad. La ficha de cada regla debe seguir explicando la razon humana, pero la fuente ejecutable del CLI deberia ser el mapa central.

## Definicion de hecho del spike

| Item | Estado |
| --- | --- |
| Reglas examinadas | 56/56 registradas; `no-unsafe-common` queda fuera por ser helper no registrado. |
| Aristas duras con cita | 9/9 con `archivo:linea`. |
| Ciclos | Ninguno. |
| Histograma | Capa 0: 48; capa 1: 8; profundidad maxima: 1; capa 0: 85.7%. |
| Recomendacion de flag | Integrar orden topologico en `--adopt`; frontera binaria si hace falta; no `--layer N` por ahora. |
| Cambios de codigo | Ningun `.ts` requerido por el spike. |
