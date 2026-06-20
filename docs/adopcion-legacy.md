# Adopcion incremental y legacy

[README principal](../README.md)

## Adopción incremental: lintear solo lo que cambió

En una base de código existente, activar todas las reglas de golpe genera mucho ruido. El paquete incluye el modo **`skapxd-lint --changed`**, que ejecuta **todas** las reglas **solo sobre los archivos que tocaste** (detectados con git), no sobre todo el repo. Así el código nuevo nace limpio y el legacy se arregla cuando lo editas — la "regla del boy scout".

No necesita husky ni hooks: basta con un script en tu `package.json`.

```json
{
  "scripts": {
    "lint:changed": "skapxd-lint --changed",
    "lint:ci": "skapxd-lint --changed --base origin/main"
  }
}
```

- `pnpm lint:changed` → lintea lo que cambiaste en tu árbol de trabajo (modificado, en staging y sin trackear) respecto al último commit.
- `pnpm lint:ci` (con `--base <rama>`) → lintea lo que tu branch cambió desde que divergió de esa rama. Ideal para CI / pull requests.

Usa tu `eslint.config.*` y tus reglas tal cual; lo único que hace es **acotar el conjunto de archivos**. Si no hay cambios, no hace nada y sale con código `0`; si hay errores, sale con código `1` (apto para CI). Como acota por **archivo completo**, también dispara las reglas estructurales (p. ej. `one-root-function-per-file`), que un filtrado por línea se perdería.

## Adopción en proyectos legacy: de `off` a `error`, por olas

El CLI de arriba acota **qué archivos** se juzgan. Este apartado acota **qué reglas** — el camino para meter el preset completo en un proyecto legacy escrito por humanos, sin que el primer `pnpm lint` escupa 2.000 errores y el equipo apague el linter para siempre.

### Las reglas del juego

1. **`off` o `error`, nunca `warn`.** Un warn se ignora desde el día dos y solo entrena al equipo a ignorar amarillo. Una regla está adoptada (`error`) o todavía no (`off`) — no hay estado intermedio.
2. **Una regla a la vez, y a cero.** Se activa una regla, se arreglan TODOS sus hallazgos, se mergea en verde. Nunca actives una regla con pendientes: el CI rojo permanente es la ventana rota que normaliza ignorar el linter.
3. **Ratchet: lo que se enciende no se apaga.** El bloque de `off` solo puede encoger. El diff de ese bloque ES la métrica de progreso del equipo.
4. **Mide antes de activar.** En una rama, borra el `off` de una regla y corre el lint: el número de hallazgos es el precio. **Activa siempre la más barata pendiente** — el momentum importa más que el orden perfecto.
5. **Deja que el mensaje enseñe.** Los mensajes de error de estas reglas explican el porqué y el cómo (qué patrón usar, cómo se llama, dónde va). Para un equipo sin seniors, el linter es el code review que nadie tiene tiempo de hacer: no resumas las reglas en un documento aparte — el documento es el error en pantalla.

### El mecanismo: la lista de pendientes

El preset completo es la meta; un bloque posterior apaga lo que el equipo aún no cumple. **Adoptar una regla = borrar su línea y arreglar lo que aflore:**

```js
// eslint.config.js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  ...skapxd.configs.nest, // la meta: el preset completo, desde el día uno

  // ─── Lista de pendientes ───────────────────────────────────────────
  // Todo lo que el proyecto aún no cumple, apagado y a la vista.
  // Este bloque SOLO ENCOGE: se borra una línea, se arregla, se mergea.
  {
    rules: {
      "skapxd/await-requires-result": "off",
      "skapxd/no-try-catch": "off",
      // ...
    },
  },
];
```

### El orden de las olas

El orden no es arbitrario: va de "cada hallazgo es un bug que ya tienes" hacia "esto exige rediseñar tipos", y cada ola deja el suelo que la siguiente pisa.

**Ola 1 — bugs gratis y fixes únicos.** Señal pura, arreglo puntual, cero rediseño. Aquí el equipo aprende que el linter encuentra cosas reales:

- `skapxd/no-floating-promises` — cada hallazgo es un error que hoy muere sin que nadie lo vea (en un backend real en producción: 12).
- `skapxd/nest-requires-swagger-plugin` y `skapxd/nest-validation-pipe-config` — un hallazgo por proyecto, un fix de configuración, y quedan vigiladas las premisas de las olas siguientes.
- `skapxd/requires-strict-tsconfig` con la exigencia mínima: `{ requiredCompilerOptions: ["strict"] }`. Es el trinquete del tsconfig — cada ola le sube un flag (ver abajo).
- `skapxd/no-emoji`, `skapxd/no-deep-relative-imports` — fixes mecánicos.
- `skapxd/prefer-abort-signal` (front) — cada hallazgo es un leak.

**Ola 2 — la forma del código.** Refactors locales, archivo por archivo, sin tocar contratos. Es la ola que más enseña por repetición:

- `skapxd/no-nested-if` y `skapxd/no-else` — guard clauses. El refactor más formativo que existe para un junior: aplana la lógica o confiesa que la función hace demasiado.
- `skapxd/no-anonymous-condition` — la pareja de las anteriores y **la más cara de todo el catálogo** (cientos de hallazgos en un backend típico): cada condición-cómputo recibe un nombre con criterio. Vale la pena ir por carpetas y SIN prisa — es la que más enseña por hallazgo, y la última de esta ola.
- `skapxd/one-root-function-per-file` y `skapxd/no-default-export` — el árbol de archivos empieza a contar la historia.
- `skapxd/no-accessors`, `skapxd/max-public-methods` — clases con una intención (partir un god-object es la cirugía mayor de esta ola: déjala de última).
- Front: `skapxd/jsx-return-name-pascal-case`, `skapxd/max-hook-size`, `skapxd/no-functions-inside-components`, `skapxd/no-jsx-ternary-null`, `skapxd/no-tunnel-props`, `skapxd/repeated-jsx-requires-component`.
- Nest: `skapxd/nest-no-swagger-in-controllers`, `skapxd/nest-dto-requires-api-property`, `skapxd/nest-dto-requires-validation`, `skapxd/nest-no-inline-query-params`, `skapxd/nest-no-direct-instantiation` — mover decoradores y dependencias a donde pertenecen.

**Ola 3 — el contrato de errores.** La migración de paradigma (`@skapxd/result` + `ts-pattern`; ver "Cómo encaja todo" abajo). Aquí NO se va regla por regla sino **módulo por módulo**: las seis reglas entran juntas (son un solo sistema) pero acotadas por carpeta, y el primer módulo migrado se vuelve el ejemplo canónico que el resto copia:

```js
  // Ola 3: el pipeline de Result entra carpeta por carpeta.
  {
    files: ["src/modules/payments/**"],
    rules: {
      "skapxd/await-requires-result": "error",
      "skapxd/no-try-catch": "error",
      "skapxd/no-promise-chain": "error",
      "skapxd/no-ad-hoc-ok-result": "error",
      "skapxd/prefer-ts-pattern": "error",
      "skapxd/result-error-requires-cause": "error",
      "skapxd/result-error-requires-handling": "error",
    },
  },
```

(En Nest, suma `skapxd/nest-no-result-response` al grupo: el controller del módulo migrado traduce el Result, no lo serializa.) Cuando todos los módulos migraron, las líneas salen del bloque por-carpeta y entran globales: se borran de la lista de pendientes.

**Ola 4 — el modelado de estados.** Lo más profundo: exige criterio de diseño, no solo disciplina. Para cuando el equipo ya vio el patrón en la ola 3:

- `requires-strict-tsconfig` al máximo: `["strict", "noImplicitReturns", "noUncheckedIndexedAccess"]`. Sube un flag a la vez — cada uno aflora errores de compilación que son bugs latentes, no burocracia.
- `skapxd/no-explicit-any`, `skapxd/no-non-null-assertion` y `skapxd/no-silenced-compiler` — se cierran las tres puertas de escape del compilador.
- `skapxd/class-properties-require-readonly` — el cambio se modela con instancias nuevas.
- `skapxd/prefer-tagged-union-state` y `skapxd/no-runtime-state-guard` — los booleanos co-dependientes se vuelven uniones discriminadas.
- `skapxd/no-impossible-branch` — **la última de todas**: solo es sólida cuando el tsconfig ya está al máximo (sin `noUncheckedIndexedAccess`, acusaría guards necesarios).

### Los dos ejes se combinan

Mientras la lista de pendientes encoge, `skapxd-lint --changed` aplica lo ya activado solo a los archivos tocados: el código nuevo nace cumpliendo y el legacy se corrige cuando alguien lo visita (regla del boy scout), no en un big-bang. Un proyecto mediano recorre las cuatro olas en semanas, no en trimestres — y cada semana el lint encuentra menos, porque el equipo ya escribe distinto.

## Configurar y sobrescribir reglas

Los presets son flat configs normales de ESLint: **el último config que matchea un archivo gana**. Para ajustar una regla encima de un preset, esparce sus `rules` y sobrescribe la entrada:

```js
export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.frontend,
    rules: {
      ...skapxd.configs.shared.frontend.rules,
      // mismo id, nuevas opciones: esta entrada reemplaza a la del preset
      "skapxd/no-deep-relative-imports": ["error", { maxDepth: 1 }],
    },
  },
];
```

> Las opciones de una regla **se reemplazan completas**, no se mergean: si el
> preset pasaba opciones y tú la redeclaras, incluye también las que quieras
> conservar. (Excepción: los patrones *integrados* de `no-default-export` —
> configs y stories — viven dentro de la regla y nunca se pierden; tus
> `allowFilePatterns` se suman a ellos.)

Referencia rápida de qué se puede configurar (detalle y defaults en la sección de cada regla):

| Regla | Opciones |
| --- | --- |
| `async-functions-return-result` | `allowFilePatterns` (globs), `allowNamePatterns` (regex), `checkMissingReturnType`, `checkMissingReturnTypeWhenCallNames`, `requireCallNames`, `promiseTypeNames`, `resultTypeNames` |
| `await-requires-result` | `allowFilePatterns` (globs), `trySafeCallNames` |
| `filename-matches-root-function` | `allowFilePatterns` (globs) |
| `max-hook-size` | `maxLines`, `maxUseState` |
| `class-properties-require-readonly` | `allowFilePatterns` (globs), `allowPropertyPatterns` (regex), `ormModuleSources` (default `["@nestjs/mongoose", "typeorm"]`) |
| `max-public-methods` | `allowFilePatterns` (globs), `max` (default `1`), `ignore` (aditivo a los hooks de Nest) |
| `no-accessors` | `allowFilePatterns` (globs) |
| `nest-controller-returns-dto` | `allowFilePatterns` (globs), `controllerDecoratorNames`, `dtoDecoratorNames`, `dtoDecoratorSource`, `gatewayDecoratorNames`, `responseHandlerParamDecorators`, `streamReturnTypes`, `allowPrimitiveReturns` |
| `nest-dto-requires-api-property` | `allowFilePatterns` (globs), `dtoFilePatterns` (default `["*.dto.ts"]`), `apiPropertyDecoratorNames` |
| `nest-dto-requires-validation` | `allowFilePatterns` (globs), `dtoFilePatterns`, `outputDtoFilePatterns`, `outputDtoClassPatterns` (regex), `optionalDecoratorNames` |
| `nest-no-direct-instantiation` | `allowFilePatterns` (globs), `internalPatterns` (regex), `allowedPatterns` (regex), `allowedClassPatterns` (regex, default `(Error|Exception|Event)$`) |
| `nest-no-inline-query-params` | `allowFilePatterns` (globs), `max` (default `1`) |
| `nest-no-result-response` | `allowFilePatterns` (globs), `controllerDecoratorNames` (default `["Controller"]`) |
| `nest-no-swagger-in-controllers` | `allowFilePatterns` (globs), `allowedDecoratorNames`, `controllerDecoratorNames` |
| `nest-requires-swagger-plugin` | `allowFilePatterns` (globs), `mainFilePatterns` (default `["src/main.ts"]`) |
| `nest-validation-pipe-config` | `allowFilePatterns` (globs), `requiredPipeOptions` (default `["transform", "whitelist"]`) |
| `no-deep-relative-imports` | `maxDepth` |
| `no-default-export` | `allowFilePatterns` (globs, aditivos a los integrados) |
| `no-anonymous-condition` | `allowFilePatterns` (globs), `maxMemberDepth` (default `2`), `allowTypePredicates` (default `true`, type-aware) |
| `no-else` | `allowFilePatterns` (globs) |
| `no-emoji` | `allowFilePatterns` (globs) |
| `no-explicit-any` | las de la regla original de typescript-eslint (`fixToUnknown`, ...) |
| `no-floating-promises` | las de la regla original de typescript-eslint (`ignoreVoid`, `allowList`, ...) |
| `no-magic-numbers` | las de la regla original de typescript-eslint (`ignore`, `ignoreArrayIndexes`, `ignoreEnums`, `ignoreReadonlyClassProperties`, `ignoreDefaultValues`, `enforceConst`) |
| `no-unsafe-assignment` | las de la regla original de typescript-eslint |
| `no-unsafe-member-access` | las de la regla original de typescript-eslint |
| `no-unsafe-call` | las de la regla original de typescript-eslint |
| `no-unsafe-return` | las de la regla original de typescript-eslint |
| `no-unsafe-argument` | las de la regla original de typescript-eslint |
| `no-impossible-branch` | las de la regla original de typescript-eslint (`allowConstantLoopConditions`, ...) |
| `no-silenced-compiler` | las de `ban-ts-comment` (`ts-expect-error`, `ts-ignore`, `ts-nocheck`, `minimumDescriptionLength`) |
| `prefer-type-over-interface` | la de `consistent-type-definitions` (`"type"` o `"interface"`; los presets pasan `"type"`) |
| `no-functions-inside-components` | `allowJsxCallbacks`, `allowArrayMapCallbacks` (ambas `true` por defecto) |
| `no-nested-if` | `allowFilePatterns` (globs) |
| `no-promise-chain` | `methods` |
| `no-runtime-state-guard` | `allowFilePatterns` (globs) |
| `no-tunnel-props` | `allowFilePatterns` (globs), `allowPropPatterns` (regex) |
| `prefer-abort-signal` | `allowFilePatterns` (globs), `effectNames` (default `["useEffect", "useLayoutEffect"]`) |
| `package-requires-typed-exports` | `allowFilePatterns` (globs), `anchorFilePatterns` (default `src/index.ts(x)`, `src/main.ts`) |
| `prefer-tagged-union-state` | `allowFilePatterns` (globs), `loadingPatterns` (regex, en minúsculas), `errorPatterns` (regex, en minúsculas) |
| `untrusted-module-requires-adapter` | `modules` (default `[]` — inerte), `adapterFilePatterns` (globs), `allowFilePatterns` (globs) |
| `requires-strict-tsconfig` | `allowFilePatterns` (globs), `anchorFilePatterns` (globs), `requiredCompilerOptions` |
| `result-error-requires-handling` | `allowFilePatterns` (globs) |

Los `allowFilePatterns` de todas las reglas son **globs** (`*` un segmento, `**` cualquier profundidad, `{a,b}` alternativas; un patrón sin prefijo matchea en cualquier carpeta). Las 7 reglas restantes no tienen opciones: su única configuración es activarlas, apagarlas o cambiar la severidad.

## Crear propuestas de reglas

Las reglas nuevas no empiezan como código: empiezan como una propuesta que deja claro qué contrato arquitectónico se quiere volver ejecutable y qué costo trae. Usa el template [`.github/ISSUE_TEMPLATE/rule-proposal.md`](.github/ISSUE_TEMPLATE/rule-proposal.md) para abrir cualquier idea de regla nueva o cambio de política del catálogo.

La issue debe contestar, como mínimo:

- **Por qué existe:** qué desviación real quiere impedir y qué axioma del README la sostiene.
- **Ejemplos:** código que debería fallar y código esperado.
- **Diseño:** patrones reportados, exenciones, opciones y si hay autofix seguro.
- **Estrategia de implementación:** si la regla decide por AST, por tipos, por nombres/convenciones, leyendo archivos del proyecto o apoyándose en un paquete de terceros.
- **Complicaciones:** falsos positivos, fricción con frameworks/runtimes, límites de TypeScript y choques con reglas existentes.
- **Encaje en presets:** si nace en `shared`, `backend`, `frontend`, `nest`, `next`, `astro`, `package` u opt-in.
- **Validación:** medición de solo lectura antes de activar la regla por defecto.

Desde GitHub, elige **New issue → Propuesta de regla**. Desde la CLI:

```bash
gh issue create --template rule-proposal.md
```

Si la propuesta todavía necesita decisión de diseño, usa los labels `regla-nueva` y `decision-pendiente`. Cuando el problema sea deuda del propio repo o documentación, usa labels más específicos en vez de forzar este template.
