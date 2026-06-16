# Auditoria pedagogica de mensajes de reglas

## Alcance y metodo

Este spike audita `origin/main` en el worktree `codex/issue-107-audit-rule-messages`. El contrato de #107 hablaba de ~60+ `messageId`, pero el inventario real del arbol actual es mayor: 55 reglas con bloque `messages` y 122 `messageId` resueltos. La diferencia viene de wrappers de `typescript-eslint` con muchos ids upstream (`no-unsafe-*`, `no-floating-promises`, `no-impossible-branch`, `no-unverified-cast`) y de mensajes compartidos por constantes.

Extraje los `messages` de `src/rules/*.ts`, resolviendo strings directos, constantes locales, concatenaciones simples y el helper compartido `unsafeAnyMessage` de `src/rules/no-unsafe-common.ts`. `no-unsafe-common.ts` no se cuenta como regla propia: es helper, pero su texto se audita en cada `messageId` wrapper que lo expone.

La clasificacion es conservadora: un mensaje corto de prohibicion sintactica queda `ya-optimo` si el fix es obvio y no hay alternativas reales. Una mejora entra solo cuando falta una salida concreta, falta la pista para elegir entre salidas, no conecta con una regla hermana que forma parte del fix, no usa una accion disponible, o el mensaje se vuelve demasiado largo para actuar con precision.

## Tabla por messageId

| Regla | messageId | Mensaje actual (resumido) | Criterios que fallan | Severidad | Propuesta breve |
| --- | --- | --- | --- | --- | --- |
| `async-functions-return-result` | `missingReturnType` | Declara `Promise<Result<...>>`, usa `trySafe`, preserva `cause` y consume con `match()`. | - | ya-optimo | Sin cambio. |
| `async-functions-return-result` | `invalidReturnType` | Retorna `Promise<Result<...>>`, modela errores explicitamente, usa `trySafe`, `cause` y `match()`. | - | ya-optimo | Sin cambio. |
| `await-requires-result` | `awaitWithoutResult` | Recomienda extraer a funcion `Promise<Result<...>>`; alternativa `trySafe` local; consumir con `match()`. | - | ya-optimo | Sin cambio. |
| `class-properties-require-readonly` | `propertyRequiresReadonly` | Agrega `readonly`, modela cambio con instancia nueva, o declara mutacion en `allowPropertyPatterns`. | - | ya-optimo | Sin cambio. |
| `dense-function-requires-comment` | `markdownStructureMissing` | Exige header markdown y ejemplo en code fence para hover util. | - | ya-optimo | Sin cambio. |
| `dense-function-requires-comment` | `missingMotivationComment` | Pide comentario de bloque antes de la funcion, motivacion alto nivel y ejemplo, no narracion de implementacion. | - | ya-optimo | Sin cambio. |
| `filename-matches-root-function` | `filenameMismatch` | Usa `filename`, `exportName` y `expected`; renombra archivo o export para que coincidan. | - | ya-optimo | Sin cambio. |
| `jsx-return-name-pascal-case` | `invalidName` | Funcion que devuelve JSX debe nombrarse como componente con `{{suggestedName}}`. | - | ya-optimo | Sin cambio. |
| `max-hook-size` | `tooLargeHook` | Hook supera lineas; extrae efectos, handlers o flujos a hooks/archivos semanticos. | - | ya-optimo | Sin cambio: para tamano por lineas el fix natural ya esta nombrado. |
| `max-hook-size` | `tooManyUseState` | Hook declara demasiados `useState`; sugiere `useReducer` o extraer estado a hooks especializados. | 2, 3, 4 | alto | Issue hijo #106: nombrar union discriminada, `useReducer` y dividir componente/hook; distinguir estados relacionados vs independientes; conectar con `prefer-tagged-union-state` y `no-runtime-state-guard`. |
| `max-public-methods` | `tooManyPublicMethods` | Playbook completo para partir clase en una clase por metodo publico, mover privados/dependencias y actualizar modulo/imports. | - | ya-optimo | Sin cambio: es largo, pero el refactor es de alto riesgo y el playbook evita ambiguedad. |
| `nest-dto-requires-api-property` | `missingApiProperty` | Propiedad DTO sin `@ApiProperty`; el contrato HTTP se documenta en DTO y el controller queda limpio. | - | ya-optimo | Sin cambio. |
| `nest-dto-requires-validation` | `missingValidator` | Propiedad de input sin validador runtime; decora con `@IsString`, `@IsNumber`, `@IsEnum`, etc. | - | ya-optimo | Sin cambio. |
| `nest-dto-requires-validation` | `optionalRequiresIsOptional` | `?` sin `@IsOptional`; agrega `@IsOptional()` o quita el `?`. | - | ya-optimo | Sin cambio. |
| `nest-dto-requires-validation` | `validateNestedRequiresType` | `@ValidateNested` sin `@Type`; agrega `@Type(() => SuDtoClase)`. | - | ya-optimo | Sin cambio. |
| `nest-no-direct-instantiation` | `noDirectInstantiation` | No instanciar import interno con `new`; inyectar por constructor, usar `this`, registrar provider o eximir value object. | - | ya-optimo | Sin cambio. |
| `nest-no-inline-query-params` | `tooManyInlineQueryParams` | Query params sueltos son DTO disfrazado; crea DTO con validadores, swagger, transforms y reemplaza por `@Query() filters`. | - | ya-optimo | Sin cambio. |
| `nest-no-result-response` | `nestNoResultResponse` | Controller no retorna `Result` crudo; traduce con `match()`, ok a DTO y err a excepcion HTTP/dominio. | - | ya-optimo | Sin cambio. |
| `nest-no-swagger-in-controllers` | `swaggerInController` | Mueve documentacion swagger al DTO; controller solo permite decoradores listados. | - | ya-optimo | Sin cambio. |
| `nest-requires-swagger-plugin` | `missingNestCli` | No encuentra `nest-cli.json`; no puede verificar la premisa del plugin swagger. | 1 | bajo | Anadir accion: crea/corrige `nest-cli.json` en la raiz Nest o ejecuta lint desde el paquete correcto; luego configura el plugin. |
| `nest-requires-swagger-plugin` | `missingSwaggerPlugin` | `nest-cli.json` no declara `@nestjs/swagger`; agrega `compilerOptions.plugins`. | - | ya-optimo | Sin cambio. |
| `nest-validation-pipe-config` | `missingPipeOptions` | `ValidationPipe` sin opciones requeridas; explica `transform` y `whitelist`. | - | ya-optimo | Sin cambio. |
| `nested-function-requires-capture` | `missingCapture` | Funcion anidada no captura scope; mover a archivo propio y pasar argumentos, o dejar callback inline anonimo si es de un uso. | - | ya-optimo | Sin cambio. |
| `no-accessors` | `noAccessor` | Accessor es computacion disfrazada; usa metodo explicito y propiedades `readonly` para datos. | - | ya-optimo | Sin cambio. |
| `no-ad-hoc-ok-result` | `adHocOkResult` | No retornar `{ ok }` casero; usa `Result.ok/err` con error discriminado y consume con `match().exhaustive()`. | - | ya-optimo | Sin cambio. |
| `no-anonymous-condition` | `anonymousCondition` | Extrae condicion a `const` semantica; incluye catalogo largo de nombres buenos, malos, excepciones y narrowing. | 6 | medio | Compactar el mensaje a accion + criterios minimos de nombre; mover el catalogo anti-nombres y excepciones extensas a la ficha. |
| `no-deep-relative-imports` | `deepRelativeImport` | Import sube demasiados niveles; usa alias de ruta o acerca el modulo. | - | ya-optimo | Sin cambio. |
| `no-default-export` | `noDefaultExport` | Usa export nombrado; si un framework exige default, agrega glob en `allowFilePatterns`. | - | ya-optimo | Sin cambio. |
| `no-else` | `noElse` | El `else` es camino sin nombre; usa retorno anticipado, ternario simple o `match().exhaustive()`. | - | ya-optimo | Sin cambio. |
| `no-emoji` | `noEmoji` | Reemplaza emoji por icono SVG o asset SVG propio. | - | ya-optimo | Sin cambio. |
| `no-explicit-any` | `suggestNever` | Sugerencia: usa `never` para genericos cuyo tipo no necesitas conocer. | - | ya-optimo | Sin cambio. |
| `no-explicit-any` | `suggestPropertyKey` | Sugerencia: usa `PropertyKey` para claves de objeto. | - | ya-optimo | Sin cambio. |
| `no-explicit-any` | `suggestUnknown` | Sugerencia: usa `unknown` para obligar estrechamiento. | - | ya-optimo | Sin cambio. |
| `no-explicit-any` | `unexpectedAny` | `any` apaga tipos; usa `unknown` si es desconocido o modela el tipo real. | - | ya-optimo | Sin cambio. |
| `no-floating-promises` | `floating` | Promesa flotante; salidas `await` o `void`; prohibe `.then/.catch` por `no-promise-chain`. | - | ya-optimo | Sin cambio. |
| `no-floating-promises` | `floatingFixAwait` | Sugerencia puntual: agrega `await`. | - | ya-optimo | Sin cambio. |
| `no-floating-promises` | `floatingFixVoid` | Sugerencia puntual: agrega `void` para descarte consciente. | - | ya-optimo | Sin cambio. |
| `no-floating-promises` | `floatingPromiseArray` | Array de promesas sin manejar; probablemente falta `await Promise.all(...)` o `allSettled`. | - | ya-optimo | Sin cambio. |
| `no-floating-promises` | `floatingPromiseArrayVoid` | Array de promesas sin manejar; falta `await Promise.all(...)` o `void` si el descarte es deliberado. | - | ya-optimo | Sin cambio. |
| `no-floating-promises` | `floatingUselessRejectionHandler` | Mensaje base de promesa flotante y handler de rechazo no-funcion ignorado. | - | ya-optimo | Sin cambio. |
| `no-floating-promises` | `floatingUselessRejectionHandlerVoid` | Mensaje base de promesa flotante y handler de rechazo no-funcion ignorado. | - | ya-optimo | Sin cambio. |
| `no-floating-promises` | `floatingVoid` | Mensaje base de promesa flotante; `await` o `void`, no `.then/.catch`. | - | ya-optimo | Sin cambio. |
| `no-functions-inside-components` | `functionInsideComponent` | Funcion dentro de componente; mover a hook o helper fuera; callbacks JSX/map permitidos solo como flecha de expresion. | 3 | medio | Anadir pista: hook si necesita estado, efectos o APIs React; helper fuera si es logica pura. |
| `no-impossible-branch` | `alwaysFalsy` | Rama siempre falsy; si el guard hace falta, arregla el tipo o `noUncheckedIndexedAccess`. | - | ya-optimo | Sin cambio. |
| `no-impossible-branch` | `alwaysNullish` | Lado izquierdo de `??` siempre nullish; si hace falta, el tipo miente. | - | ya-optimo | Sin cambio. |
| `no-impossible-branch` | `alwaysTruthy` | Condicion siempre truthy; si hace falta, el tipo miente. | - | ya-optimo | Sin cambio. |
| `no-impossible-branch` | `comparisonBetweenLiteralTypes` | Comparacion constante con `left`, `operator`, `right` y resultado; si hace falta, el tipo miente. | - | ya-optimo | Sin cambio. |
| `no-impossible-branch` | `never` | Valor `never`; punto inalcanzable; si hace falta, el tipo miente. | - | ya-optimo | Sin cambio. |
| `no-impossible-branch` | `neverNullish` | `??` sin aporte porque el lado izquierdo nunca es nullish; si hace falta, el tipo miente. | - | ya-optimo | Sin cambio. |
| `no-impossible-branch` | `neverOptionalChain` | `?.` sobra porque el valor nunca es nullish; si hace falta, el tipo miente. | - | ya-optimo | Sin cambio. |
| `no-impossible-branch` | `noOverlapBooleanExpression` | Comparacion imposible sin solape de tipos; si hace falta, el tipo miente. | - | ya-optimo | Sin cambio. |
| `no-impossible-branch` | `noStrictNullCheck` | Requiere `strictNullChecks`; conecta con `requires-strict-tsconfig`. | - | ya-optimo | Sin cambio. |
| `no-jsx-ternary-null` | `preferLogicalAnd` | Usa `condicion && elemento` en vez de ternario con `null`. | - | ya-optimo | Sin cambio. |
| `no-magic-numbers` | `noMagic` | Numero crudo debe extraerse a `const` con nombre de dominio; idiomaticos exentos. | - | ya-optimo | Sin cambio. |
| `no-magic-numbers` | `useConst` | Numero significativo nombrado debe ser `const`, no `let`/`var`. | - | ya-optimo | Sin cambio. |
| `no-nested-if` | `noNestedIf` | Aplana con retorno anticipado o decide variantes con `match()`. | - | ya-optimo | Sin cambio. |
| `no-non-null-assertion` | `noNonNull` | El `!` niega la duda; modela el tipo, estrecha con guard legitimo o maneja null. | - | ya-optimo | Sin cambio. |
| `no-non-null-assertion` | `suggestOptionalChain` | Sugerencia: considera `?.` para manejar la duda en runtime. | - | ya-optimo | Sin cambio. |
| `no-promise-chain` | `noPromiseChain` | No `.then/.catch/.finally`; usa `await`, con funcion `Promise<Result>` o `trySafe`. | - | ya-optimo | Sin cambio. |
| `no-runtime-state-guard` | `runtimeStateGuard` | Guard runtime sobre `this` + `throw`; haz estado irrepresentable con clase por estado o union discriminada. | - | ya-optimo | Sin cambio. |
| `no-silenced-compiler` | `replaceTsIgnoreWithTsExpectError` | Sugerencia: reemplaza `@ts-ignore` por `@ts-expect-error`. | - | ya-optimo | Sin cambio. |
| `no-silenced-compiler` | `tsDirectiveComment` | No silenciar compilador; modela mejor o usa `@ts-expect-error` con descripcion para tests de tipos. | - | ya-optimo | Sin cambio. |
| `no-silenced-compiler` | `tsDirectiveCommentDescriptionNotMatchPattern` | La descripcion debe cumplir `{{format}}`. | 1 | bajo | Anadir que hay que reescribir la descripcion para cumplir el formato conservando la razon, no solo copiar un patron vacio. |
| `no-silenced-compiler` | `tsDirectiveCommentRequiresDescription` | Exige descripcion minima que justifique la supresion. | - | ya-optimo | Sin cambio. |
| `no-silenced-compiler` | `tsIgnoreInsteadOfExpectError` | Usa `@ts-expect-error`; avisa si la supresion deja de hacer falta. | - | ya-optimo | Sin cambio. |
| `no-try-catch` | `noTryCatch` | Usa `trySafe`, mapea a error de dominio con `cause` y consume con `match()`. | - | ya-optimo | Sin cambio. |
| `no-tunnel-props` | `forwardedProp` | Prop recibida se reenvia; usar store/hook o composicion con `children`. | 3 | medio | Anadir criterio: store/hook para estado o accion compartida; `children` cuando el padre solo compone UI. |
| `no-tunnel-props` | `spreadTunnel` | Spread de todas las props a otro componente; usar store/hook o composicion con `children`. | 3 | medio | Mismo criterio de eleccion que `forwardedProp`; el mensaje actual lista salidas pero no cuando elegirlas. |
| `no-unsafe-argument` | `unsafeArgument` | Mensaje compartido: `any` invisible; declarar `unknown` y estrechar con schema o predicate; Nest DTO validado como frontera. | - | ya-optimo | Sin cambio. |
| `no-unsafe-argument` | `unsafeArraySpread` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-argument` | `unsafeSpread` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-argument` | `unsafeTupleSpread` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-assignment` | `anyAssignment` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-assignment` | `anyAssignmentThis` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-assignment` | `unsafeArrayPattern` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-assignment` | `unsafeArrayPatternFromTuple` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-assignment` | `unsafeArraySpread` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-assignment` | `unsafeAssignment` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-assignment` | `unsafeObjectPattern` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-call` | `errorCall` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-call` | `errorCallThis` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-call` | `errorNew` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-call` | `errorTemplateTag` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-call` | `unsafeCall` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-call` | `unsafeCallThis` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-call` | `unsafeNew` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-call` | `unsafeTemplateTag` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-member-access` | `errorComputedMemberAccess` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-member-access` | `errorMemberExpression` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-member-access` | `errorThisMemberExpression` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-member-access` | `unsafeComputedMemberAccess` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-member-access` | `unsafeMemberExpression` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-member-access` | `unsafeThisMemberExpression` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-return` | `unsafeReturn` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-return` | `unsafeReturnAssignment` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unsafe-return` | `unsafeReturnThis` | Mensaje compartido de `any` invisible; `unknown` + schema/predicate. | - | ya-optimo | Sin cambio. |
| `no-unverified-cast` | `unsafeOfAnyTypeAssertion` | Mensaje compartido: cast que estrecha sin evidencia; usa predicate real, validacion de frontera o corrige tipo de origen. | - | ya-optimo | Sin cambio. |
| `no-unverified-cast` | `unsafeToAnyTypeAssertion` | Mensaje compartido de cast sin evidencia; predicate, validacion o tipo de origen. | - | ya-optimo | Sin cambio. |
| `no-unverified-cast` | `unsafeToUnconstrainedTypeAssertion` | Mensaje compartido de cast sin evidencia; predicate, validacion o tipo de origen. | - | ya-optimo | Sin cambio. |
| `no-unverified-cast` | `unsafeTypeAssertion` | Mensaje compartido de cast sin evidencia; predicate, validacion o tipo de origen. | - | ya-optimo | Sin cambio. |
| `no-unverified-cast` | `unsafeTypeAssertionAssignableToConstraint` | Mensaje compartido de cast sin evidencia; predicate, validacion o tipo de origen. | - | ya-optimo | Sin cambio. |
| `one-root-function-per-file` | `tooManyRootFunctions` | Deja una funcion top-level; incluye `moveSuggestion`, estructura sugerida y modulo compartido si se reutiliza. | - | ya-optimo | Sin cambio. |
| `package-requires-typed-exports` | `missingExports` | `package.json` sin `exports`; declara mapa de exports con `types` por condicion. | - | ya-optimo | Sin cambio. |
| `package-requires-typed-exports` | `missingTypesFile` | Archivo de `types` declarado no existe; falta build dts o ruta mal escrita. | - | ya-optimo | Sin cambio. |
| `package-requires-typed-exports` | `unreadablePackageJson` | No encuentra `package.json` legible; la regla necesita leer contrato de tipos. | 1 | bajo | Anadir accion: ejecuta desde el paquete correcto, crea `package.json`, o corrige JSON ilegible antes de validar exports. |
| `package-requires-typed-exports` | `untypedCondition` | Condicion `import`/`require` sin `types` propio; explica FalseCJS y da forma ESM/CJS esperada. | - | ya-optimo | Sin cambio. |
| `package-requires-typed-exports` | `wrongTypesFlavor` | `import` exige `.d.mts`; `require` exige `.d.ts`/`.d.cts`; tsup genera ambos. | - | ya-optimo | Sin cambio. |
| `prefer-abort-signal` | `addWithoutSignal` | Crea `AbortController`, pasa `{ signal }` y limpia con `abort()`. | - | ya-optimo | Sin cambio. |
| `prefer-abort-signal` | `removeInsteadOfAbort` | No remover listeners a mano; registra con `{ signal }` y reemplaza cleanup por `abort()`. | - | ya-optimo | Sin cambio. |
| `prefer-schema-validation` | `preferSchema` | Checks estructurales manuales son schema; usa zod/valibot o class-validator en Nest; predicate corto sigue legal. | - | ya-optimo | Sin cambio. |
| `prefer-tagged-union-state` | `inconsistentStateShape` | Flags/error independientes permiten combinaciones imposibles; modela union etiquetada y consume con `match().exhaustive()`. | - | ya-optimo | Sin cambio. |
| `prefer-tagged-union-state` | `splitStateMachine` | Varios `useState` forman una maquina; usa un `useState` con union etiquetada o `useReducer`. | 3 | medio | Anadir criterio: union etiquetada directa si el estado es simple; `useReducer` si hay acciones/transiciones repetidas o reglas de transicion concentrables. |
| `prefer-tagged-union-state` | `splitTransition` | Varios setters en una transicion prueban maquina repartida; consolida en union etiquetada o `useReducer`. | 3 | medio | Mismo criterio de eleccion union vs reducer que `splitStateMachine`. |
| `prefer-ts-pattern` | `noSwitch` | Usa `match()` para flujo exhaustivo; cierra sistema de errores `Result` con `.with()` y `.exhaustive()`. | - | ya-optimo | Sin cambio. |
| `prefer-ts-pattern` | `noNestedTernary` | Usa `match()` en vez de ternarios anidados; mejora legibilidad y exhaustividad. | - | ya-optimo | Sin cambio. |
| `prefer-type-over-interface` | `typeOverInterface` | Usa `type`; las uniones discriminadas son types y no crecen por declaration merging. | - | ya-optimo | Sin cambio. |
| `repeated-jsx-requires-component` | `repeatedJsx` | JSX repetido tres veces es componente sin nombre; extrae forma comun y props variables; `.map` no cuenta. | - | ya-optimo | Sin cambio. |
| `requires-strict-tsconfig` | `missingTsconfig` | No encuentra `tsconfig.json`; sin tsconfig resoluble no puede comprobar la premisa de tipos. | 1 | bajo | Anadir accion: crea/ubica `tsconfig.json` en la raiz del proyecto o corrige la ejecucion para que la regla lo resuelva. |
| `requires-strict-tsconfig` | `missingStrictFlags` | Lista flags faltantes y explica `strict`, `noImplicitReturns`, `noUncheckedIndexedAccess`; agregalos en `compilerOptions`. | - | ya-optimo | Sin cambio. |
| `result-error-requires-cause` | `missingCause` | Preserva `{{name}}.error` en `Result.err({ cause })`; sin causa se pierde contexto. | - | ya-optimo | Sin cambio. |
| `result-error-requires-handling` | `unhandledResultError` | Error de Result no fluye completo; transformalo, entregalo entero o propaga el Result; proyeccion no basta. | - | ya-optimo | Sin cambio. |
| `untrusted-module-requires-adapter` | `untrustedImport` | Modulo no confiable solo desde adaptador; redefine tipos honestos y concentra la mentira en un archivo auditable. | - | ya-optimo | Sin cambio. |

## Shortlist priorizada

| Prioridad | Regla | messageId | Falta | Por que importa |
| --- | --- | --- | --- | --- |
| 1 | `max-hook-size` | `tooManyUseState` | Nombrar union discriminada, `useReducer` y dividir componente/hook; explicar estados relacionados vs independientes; conectar con `prefer-tagged-union-state` y `no-runtime-state-guard`. | Es el unico caso alto porque el mensaje actual puede empujar al fix equivocado: meter un reducer donde habia que dividir responsabilidades, o extraer hooks cuando habia una maquina de estados que debia volverse irrepresentable. #106 ya es el issue hijo correcto. |

## Patrones transversales

| Patron | Evidencia | Lectura |
| --- | --- | --- |
| El volumen real esta dominado por wrappers upstream | 122 `messageId`, pero muchas filas son variantes de `no-unsafe-*`, `no-impossible-branch`, `no-floating-promises` y `no-unverified-cast`. | No hay que crear issues por cada id repetido. Cuando el texto compartido es bueno, el grupo entero queda `ya-optimo`. |
| Las mejoras reales son de criterio de eleccion, no de prohibicion | `max-hook-size.tooManyUseState`, `no-functions-inside-components.functionInsideComponent`, `no-tunnel-props.*` y `prefer-tagged-union-state.split*`. | El mensaje ya suele nombrar salidas; lo que falta es la pista para elegir sin que el agente invente arquitectura. |
| Los diagnosticos de premisa/configuracion son correctos pero a veces incompletos como accion | `missingNestCli`, `missingTsconfig`, `unreadablePackageJson`. | Bajo impacto: no bloquean la filosofia de la regla, pero un usuario nuevo agradece "crea/corrige/ejecuta desde la raiz". |
| Un mensaje puede ensenar demasiado | `no-anonymous-condition.anonymousCondition`. | El catalogo de anti-nombres es valioso, pero en el mensaje de lint compite con la accion inmediata; mejor dejar el mensaje como playbook compacto y la ficha como manual. |
| La mayoria ya cumple el contrato pedagogico | Result, Nest, package exports, estado irrepresentable, `AbortController`, schema validation y archivos pequenos ya nombran el fix y el por que. | La deuda no es sistemica. Un barrido masivo de redacciones seria churn y bajaria revisabilidad. |

## Resumen de numeros

| Metrica | Conteo |
| --- | ---: |
| Reglas con `messages` auditadas | 55 |
| `messageId` revisados | 122 |
| Omitidos | 0 |
| `ya-optimo` | 111 |
| Severidad `bajo` | 4 |
| Severidad `medio` | 6 |
| Severidad `alto` | 1 |

## Definicion de hecho del spike

| Item | Estado |
| --- | --- |
| `messageId` revisados uno por uno | 122/122; ninguno omitido. |
| Tabla completa con diagnostico contra rubrica | Hecho; criterios citados por numero solo donde fallan. |
| Shortlist priorizada alta | Hecho; un candidato alto, ya cubierto por #106. |
| Patrones transversales documentados | Hecho; cinco patrones agregados. |
| Resumen de numeros | Hecho; 55 reglas, 122 ids, 111 ya-optimo, 4 bajo, 6 medio, 1 alto. |
| Conservador | Hecho; 91.0% queda `ya-optimo` y las mejoras altas no se inflan. |
| Docs-only | Hecho; este spike no requiere cambiar `src/rules/*.ts` ni tests. |
