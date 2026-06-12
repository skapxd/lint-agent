# @skapxd/eslint-opinionated

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Reglas de ESLint para que los agentes no negocien la arquitectura de tu
proyecto.**

A diferencia de un prompt o una nota en el README (que el agente puede priorizar,
reinterpretar o ignorar), `@skapxd/eslint-opinionated` convierte tus opiniones de
arquitectura en guardrails que se **ejecutan** y **fallan** cuando el código no
respeta la forma del proyecto — lo haya escrito una persona, Claude, Codex,
Cursor o Copilot.

- **Una función por archivo:** un archivo con cinco helpers escondidos no pasa;
  la regla hasta te dibuja la carpeta sugerida con formato `tree`.
- **Errores con `Result`:** ningún `await` queda fuera del sistema de errores:
  o llamas una función que retorna `Promise<Result<...>>` o envuelves la
  operación en `trySafe`. Nada lanza sin que el tipo lo diga.
- **Causa preservada:** al transformar un error de dominio, el `cause` original
  no puede desaparecer — type-aware, vía el checker de TypeScript.
- **Hooks acotados:** un hook con demasiado estado deja de pasar como "solo un
  hook largo" y empuja hacia `useReducer` o módulos más pequeños.

```bash
pnpm eslint
pnpm eslint src/server/payment-gateway.ts
pnpm eslint --max-warnings=0
```

La regla no depende de la intención del autor. Se ejecuta y decide.

## 🤔 ¿Por qué existe este paquete?

Necesitaba una forma **verificable** de decirle a un agente cómo quiero que
escriba código en mis proyectos.

Un proyecto *es* su arquitectura. No solo lo que hace, sino su forma: archivos
pequeños, nombres que revelan intención, errores modelados, una causa que
sobrevive cuando algo falla. Si esa forma se erosiona, lo que queda es código que
compila, pasa los tests y aun así ya nadie puede navegar, depurar ni seguir
modificando — ni una persona, ni el siguiente agente.

Y la experiencia se repetía siempre igual: la regla quedaba clarísima en la
conversación, pero no en el resultado final. El agente entendía la intención
general y en el detalle dejaba pequeñas desviaciones:

- un helper que se quedaba en el mismo archivo "porque era pequeño";
- una función `async` que retornaba `Promise<number>` aunque podía fallar;
- un hook que seguía creciendo porque "todavía funcionaba";
- un error técnico capturado por `trySafe` que se perdía al mapearlo a un error
  de negocio.

Nada de eso rompe la app hoy. **Ese es exactamente el problema.** Son daños
pequeños de arquitectura: pasan desapercibidos, se acumulan y después hacen que
el proyecto sea más difícil de navegar, depurar y seguir modificando con
agentes — justo cuando ya no recuerdas por qué cada cosa estaba donde estaba.

Un prompt ayuda, pero un prompt no es una barrera. El mismo prompt lo interpreta
distinto cada agente, cada modelo, e incluso el mismo modelo en momentos
distintos. Puede darle más peso a una instrucción que a otra, priorizar que el
test pase y dejar lo arquitectónico "suficientemente bien".

Por eso este paquete mueve esa presión fuera del prompt: si la arquitectura
importa, tiene que ser ejecutable. La idea no es pedirle mejor al agente que
recuerde tus reglas. La idea es que el proyecto tenga una opinión que se pueda
verificar después de cada cambio.

## Qué intenta proteger

El objetivo no es "código bonito". El objetivo es que un proyecto siga siendo
navegable, depurable y corregible por agentes.

Quiero abrir un proyecto y que `tree` cuente una historia útil: archivos
pequeños, nombres semánticos y carpetas que revelan intención.

Quiero que una función de dominio que puede fallar lo diga en su tipo de
retorno, no en una convención oral.

Quiero que si un error se transforma, la causa original siga ahí, porque
debuggear un mensaje genérico sin `cause` es perder el contexto justo cuando más
se necesita.

Quiero que un hook con demasiados estados deje de pasar silenciosamente como
"solo un hook largo" y empiece a empujar hacia `useReducer`, hooks más pequeños
o módulos de transición explícitos.

Quiero que un agente pueda generar código, pero que el proyecto le conteste:

> "Esto compila, pero no se escribe así aquí."

Eso es lo que estas reglas intentan proteger.

## Los axiomas

Las reglas no son una colección de gustos: se derivan de ocho axiomas. Si una
regla nueva no es consecuencia de alguno, no entra. Si dos reglas chocan, gana
la que defiende el axioma más fundamental (el orden es jerárquico).

| # | Axioma | Reglas que lo ejecutan |
| --- | --- | --- |
| A1 | **Los estados imposibles son irrepresentables.** El tipo modela exactamente los estados válidos; lo inválido no compila. | `prefer-tagged-union-state`, `no-runtime-state-guard`, `requires-strict-tsconfig`, `no-impossible-branch`, `no-explicit-any`, `prefer-type-over-interface` |
| A2 | **Ningún efecto es invisible al tipo.** Si una operación puede fallar, su firma lo confiesa — no una convención oral ni un `throw` sorpresa. | `await-requires-result`, `no-try-catch`, `no-promise-chain`, `no-ad-hoc-ok-result`, `no-floating-promises` |
| A3 | **La información no se destruye.** Un error que se transforma conserva su `cause`; uno que se detecta llega a alguien. Nadie decide "esto no importa" en silencio. | `result-error-requires-cause`, `result-error-requires-handling` |
| A4 | **Una unidad, una responsabilidad, un nombre semántico.** El árbol de archivos cuenta una historia; una clase expone una intención. | `one-root-function-per-file`, `max-public-methods`, `no-default-export`, `jsx-return-name-pascal-case`, `max-hook-size` |
| A5 | **Las decisiones se declaran, no se interpretan.** Cada rama es explícita y exhaustiva; un caso ignorado es una decisión visible, no un hueco. | `no-else`, `no-nested-if`, `prefer-ts-pattern`, `no-silenced-compiler`, el `void promesa()` de `no-floating-promises` |
| A6 | **Evidencia sobre convención.** Una regla decide por lo que el type-checker o los imports demuestran, no por cómo se llama un archivo o un campo. | la implementación type-aware de las reglas de Result, `nest-no-direct-instantiation` (@Injectable resuelto por símbolo), la exención ORM por decorador de `class-properties-require-readonly` |
| A7 | **Las fronteras son explícitas y únicas.** Lo que cruza una capa lo hace por un contrato, una sola vez, sin túneles. | `no-deep-relative-imports`, `no-tunnel-props`, `nest-no-result-response`, `nest-no-swagger-in-controllers`, `nest-no-inline-query-params` |
| A8 | **Inmutable por defecto.** La mutación es la excepción que se pide con evidencia, no el estado natural de las cosas. | `class-properties-require-readonly`, `no-accessors` |

A6 es distinto a los demás: no produce reglas, produce **cómo se implementan**
todas. Por eso las reglas de este paquete prefieren parser services y
provenance de imports antes que globs de nombres — el nombre es la evidencia
más débil que aceptamos, y solo como último recurso.

## Por qué las alternativas no bastan

### ESLint core

ESLint core puede limitar líneas, complejidad o cantidad de statements. Eso es
útil, pero demasiado genérico.

No entiende una regla como:

> "Este archivo tiene 15 funciones en la raíz. Convierte el archivo en una
> carpeta, deja `index.ts`, mueve cada helper a un archivo semántico y muestra la
> estructura sugerida con caracteres tipo `tree`."

Tampoco sabe que `src/app/api/foo/route.ts` en Next.js no puede convertirse en
`src/app/api/foo/route/index.ts`.

### `typescript-eslint`

`typescript-eslint` es excelente para reglas de TypeScript, y este paquete lo
usa como base. Pero sus reglas no imponen contratos de dominio como:

```ts
export async function reserveAiMinutes(...): Promise<Result<Success, DomainError>>
```

ni verifican que al transformar un error no se pierda la causa original:

```ts
if (!result.ok) {
  return Result.err({
    cause: result.error,
    message: "No pude completar la operación.",
    type: "OPERATION_FAILED",
  });
}
```

`@skapxd/eslint-opinionated` usa parser services y el TypeScript checker para aplicar
esas reglas sobre tipos reales, no solo sobre nombres de imports.

### Plugins de React, Next.js y Astro

Los plugins de framework protegen invariantes del framework: hooks, rendering,
rutas, convenciones del compilador, etc.

Eso es necesario, pero no responde preguntas de arquitectura del proyecto:

- ¿este hook ya es demasiado grande?
- ¿este archivo debería ser una carpeta?
- ¿este helper debe quedarse junto al entrypoint de Next?
- ¿este error de negocio preserva el error técnico que lo causó?

Este plugin los complementa. No los reemplaza.

### Reglas genéricas de complejidad

`max-lines-per-function`, `complexity` y `max-statements` son reglas útiles, pero
son reglas ciegas al dominio.

Un hook con 14 `useState` no solo es "largo": probablemente está modelando
transiciones de estado que deberían vivir en un reducer o en módulos separados.
Por eso `skapxd/max-hook-size` mira específicamente hooks y cantidad de estado
propio.

### Codemods, grep y herramientas de búsqueda

Un codemod puede mover archivos. `rg` puede encontrar patrones. Pero esas
herramientas no mantienen la restricción viva en el editor, CI y `lint`.

Son útiles para arreglar. No son suficientes para gobernar.

### Prompts e instrucciones para agentes

Los prompts son necesarios. Sin contexto, un agente no tiene cómo saber qué
quieres. Pero el prompt es una instrucción, no una garantía.

El mismo prompt puede ser interpretado distinto por cada agente, por cada modelo
o incluso por el mismo modelo en momentos distintos. Además, cuando una tarea
tiene muchas restricciones, el agente puede resolver lo funcional y fallar en lo
arquitectónico.

Este paquete mueve esa presión fuera del prompt: la regla se ejecuta después y
puede fallar con un mensaje concreto.

### Comparación rápida

| Herramienta | Estilo/sintaxis | Type-aware | Framework-aware | Arquitectura de archivos | Result/cause | Guardrail CLI/CI |
| --- | --- | --- | --- | --- | --- | --- |
| ESLint core | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `typescript-eslint` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| React/Next/Astro plugins | ✅ | Parcial | ✅ | Parcial | ❌ | ✅ |
| `max-lines` / `complexity` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Codemods / search | ❌ | Parcial | Parcial | ✅ | Parcial | ❌ |
| Prompt/instrucciones para agentes | ❌ | ❌ | Parcial | Parcial | Parcial | ❌ |
| **`@skapxd/eslint-opinionated`** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

### En resumen

`@skapxd/eslint-opinionated` existe para cubrir un hueco que ninguna de las anteriores
cubre por sí sola: que un proyecto pueda **opinar de forma verificable** sobre
cómo un agente escribe código — su forma de archivos, sus contratos de error, su
manera de no perder la causa — y no solo sobre su estilo o su sintaxis.

No busca ser un style guide universal. Es una capa de guardrails ejecutables para
proyectos que prefieren muchos archivos pequeños, nombres semánticos, errores
modelados con `Result` y estructuras que se entienden desde el árbol del proyecto.

Las reglas no viven en el prompt, donde el agente puede ignorarlas. Viven en un
comando que puede fallar y decir exactamente qué se rompió.

## 🚀 Uso rápido

```bash
pnpm add -D @skapxd/eslint-opinionated eslint typescript typescript-eslint
```

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  skapxd.configs.shared.base,
];
```

Luego ejecútalo como cualquier regla de ESLint:

```bash
pnpm eslint
pnpm eslint src
pnpm eslint --max-warnings=0
```

## Adopción incremental: lintear solo lo que cambió

En una base de código existente, activar todas las reglas de golpe genera mucho
ruido. El paquete incluye el comando **`skapxd-lint-changed`**, que ejecuta
**todas** las reglas **solo sobre los archivos que tocaste** (detectados con
git), no sobre todo el repo. Así el código nuevo nace limpio y el legacy se
arregla cuando lo editas — la "regla del boy scout".

No necesita husky ni hooks: basta con un script en tu `package.json`.

```json
{
  "scripts": {
    "lint:changed": "skapxd-lint-changed",
    "lint:ci": "skapxd-lint-changed --base origin/main"
  }
}
```

- `pnpm lint:changed` → lintea lo que cambiaste en tu árbol de trabajo
  (modificado, en staging y sin trackear) respecto al último commit.
- `pnpm lint:ci` (con `--base <rama>`) → lintea lo que tu branch cambió desde que
  divergió de esa rama. Ideal para CI / pull requests.

Usa tu `eslint.config.*` y tus reglas tal cual; lo único que hace es **acotar el
conjunto de archivos**. Si no hay cambios, no hace nada y sale con código `0`; si
hay errores, sale con código `1` (apto para CI). Como acota por **archivo
completo**, también dispara las reglas estructurales (p. ej.
`one-root-function-per-file`), que un filtrado por línea se perdería.

## Adopción en proyectos legacy: de `off` a `error`, por olas

El CLI de arriba acota **qué archivos** se juzgan. Este apartado acota **qué
reglas** — el camino para meter el preset completo en un proyecto legacy
escrito por humanos, sin que el primer `pnpm lint` escupa 2.000 errores y el
equipo apague el linter para siempre.

### Las reglas del juego

1. **`off` o `error`, nunca `warn`.** Un warn se ignora desde el día dos y
   solo entrena al equipo a ignorar amarillo. Una regla está adoptada
   (`error`) o todavía no (`off`) — no hay estado intermedio.
2. **Una regla a la vez, y a cero.** Se activa una regla, se arreglan TODOS
   sus hallazgos, se mergea en verde. Nunca actives una regla con pendientes:
   el CI rojo permanente es la ventana rota que normaliza ignorar el linter.
3. **Ratchet: lo que se enciende no se apaga.** El bloque de `off` solo puede
   encoger. El diff de ese bloque ES la métrica de progreso del equipo.
4. **Mide antes de activar.** En una rama, borra el `off` de una regla y corre
   el lint: el número de hallazgos es el precio. **Activa siempre la más
   barata pendiente** — el momentum importa más que el orden perfecto.
5. **Deja que el mensaje enseñe.** Los mensajes de error de estas reglas
   explican el porqué y el cómo (qué patrón usar, cómo se llama, dónde va).
   Para un equipo sin seniors, el linter es el code review que nadie tiene
   tiempo de hacer: no resumas las reglas en un documento aparte — el
   documento es el error en pantalla.

### El mecanismo: la lista de pendientes

El preset completo es la meta; un bloque posterior apaga lo que el equipo aún
no cumple. **Adoptar una regla = borrar su línea y arreglar lo que aflore:**

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

El orden no es arbitrario: va de "cada hallazgo es un bug que ya tienes" hacia
"esto exige rediseñar tipos", y cada ola deja el suelo que la siguiente pisa.

**Ola 1 — bugs gratis y fixes únicos.** Señal pura, arreglo puntual, cero
rediseño. Aquí el equipo aprende que el linter encuentra cosas reales:

- `skapxd/no-floating-promises` — cada hallazgo es un error que
  hoy muere sin que nadie lo vea (en un backend real en producción: 12).
- `skapxd/nest-requires-swagger-plugin` y `skapxd/nest-validation-pipe-config`
  — un hallazgo por proyecto, un fix de configuración, y quedan vigiladas las
  premisas de las olas siguientes.
- `skapxd/requires-strict-tsconfig` con la exigencia mínima:
  `{ requiredCompilerOptions: ["strict"] }`. Es el trinquete del tsconfig —
  cada ola le sube un flag (ver abajo).
- `skapxd/no-emoji`, `skapxd/no-deep-relative-imports` — fixes mecánicos.
- `skapxd/prefer-abort-signal` (front) — cada hallazgo es un leak.

**Ola 2 — la forma del código.** Refactors locales, archivo por archivo, sin
tocar contratos. Es la ola que más enseña por repetición:

- `skapxd/no-nested-if` y `skapxd/no-else` — guard clauses. El refactor más
  formativo que existe para un junior: aplana la lógica o confiesa que la
  función hace demasiado.
- `skapxd/one-root-function-per-file` y `skapxd/no-default-export` — el árbol
  de archivos empieza a contar la historia.
- `skapxd/no-accessors`, `skapxd/max-public-methods` — clases con una
  intención (partir un god-object es la cirugía mayor de esta ola: déjala de
  última).
- Front: `skapxd/jsx-return-name-pascal-case`, `skapxd/max-hook-size`,
  `skapxd/no-functions-inside-components`, `skapxd/no-jsx-ternary-null`,
  `skapxd/no-tunnel-props`.
- Nest: `skapxd/nest-no-swagger-in-controllers`,
  `skapxd/nest-dto-requires-api-property`,
  `skapxd/nest-dto-requires-validation`,
  `skapxd/nest-no-inline-query-params`,
  `skapxd/nest-no-direct-instantiation` — mover decoradores y dependencias a
  donde pertenecen.

**Ola 3 — el contrato de errores.** La migración de paradigma
(`@skapxd/result` + `ts-pattern`; ver "Cómo encaja todo" abajo). Aquí NO se va
regla por regla sino **módulo por módulo**: las seis reglas entran juntas
(son un solo sistema) pero acotadas por carpeta, y el primer módulo migrado se
vuelve el ejemplo canónico que el resto copia:

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

(En Nest, suma `skapxd/nest-no-result-response` al grupo: el controller del
módulo migrado traduce el Result, no lo serializa.) Cuando todos los módulos
migraron, las líneas salen del bloque por-carpeta y entran globales: se borran
de la lista de pendientes.

**Ola 4 — el modelado de estados.** Lo más profundo: exige criterio de
diseño, no solo disciplina. Para cuando el equipo ya vio el patrón en la ola 3:

- `requires-strict-tsconfig` al máximo: `["strict", "noImplicitReturns",
  "noUncheckedIndexedAccess"]`. Sube un flag a la vez — cada uno aflora
  errores de compilación que son bugs latentes, no burocracia.
- `skapxd/no-explicit-any`, `skapxd/no-non-null-assertion` y
  `skapxd/no-silenced-compiler` — se cierran las tres puertas de escape del
  compilador.
- `skapxd/class-properties-require-readonly` — el cambio se modela con
  instancias nuevas.
- `skapxd/prefer-tagged-union-state` y `skapxd/no-runtime-state-guard` — los
  booleanos co-dependientes se vuelven uniones etiquetadas.
- `skapxd/no-impossible-branch` — **la última de todas**: solo es sólida
  cuando el tsconfig ya está al máximo (sin `noUncheckedIndexedAccess`,
  acusaría guards necesarios).

### Los dos ejes se combinan

Mientras la lista de pendientes encoge, `skapxd-lint-changed` aplica lo ya
activado solo a los archivos tocados: el código nuevo nace cumpliendo y el
legacy se corrige cuando alguien lo visita (regla del boy scout), no en un
big-bang. Un proyecto mediano recorre las cuatro olas en semanas, no en
trimestres — y cada semana el lint encuentra menos, porque el equipo ya
escribe distinto.

## Cómo encaja todo: `@skapxd/result` + `ts-pattern`

Este plugin no es una colección de reglas sueltas: es el guardián de un
pipeline de errores donde cada pieza cierra un hueco que las otras dejan.

```text
excepción ──trySafe──▶ Result ──map con cause──▶ error de dominio ──match()──▶ UI/respuesta
```

| Pieza | Qué aporta | Regla que lo vigila |
| --- | --- | --- |
| `try/catch` prohibido | Los errores no viajan invisibles al tipo. | `skapxd/no-try-catch` |
| `.then/.catch` prohibido | Una sola forma de asincronía: `await`. | `skapxd/no-promise-chain` |
| `trySafe` (`@skapxd/result`) | La única puerta: lo que lanza se vuelve `Result`. | `skapxd/await-requires-result` |
| Errores de dominio con `cause` | Al traducir un error técnico, la causa sobrevive. | `skapxd/result-error-requires-cause` |
| Un solo contrato `Result` | Nada de `{ ok: ... }` caseros que fragmenten el sistema. | `skapxd/no-ad-hoc-ok-result` |
| `match()` (`ts-pattern`) | Consumo exhaustivo: el compilador exige manejar cada error. | `skapxd/prefer-ts-pattern` |

De punta a punta:

```ts
import { Result, trySafe } from "@skapxd/result";
import { match } from "ts-pattern";

type UserError =
  | { type: "NETWORK"; message: string; cause: unknown }
  | { type: "NOT_FOUND"; message: string };

// 1. La frontera con el mundo que lanza: trySafe + errores de dominio.
async function getUser(id: string): Promise<Result<User, UserError>> {
  const response = await trySafe(() => fetch(`/users/${id}`));

  if (!response.ok) {
    return Result.err({
      cause: response.error, // result-error-requires-cause vigila esto
      message: "No pude cargar el usuario.",
      type: "NETWORK",
    });
  }

  if (response.value.status === 404) {
    return Result.err({ message: "El usuario no existe.", type: "NOT_FOUND" });
  }

  return trySafe(() => response.value.json());
}

// 2. El consumo: el await ya resuelve en Result (await-requires-result pasa)
//    y match() obliga a manejar cada variante (prefer-ts-pattern).
const user = await getUser(id);

const label = match(user)
  .with({ ok: true }, ({ value }) => value.name)
  .with({ ok: false, error: { type: "NOT_FOUND" } }, () => "No existe")
  .with({ ok: false, error: { type: "NETWORK" } }, () => "Reintenta")
  .exhaustive();
```

El resultado: ningún error puede escaparse (sin `try/catch` ni `.catch`, todo
pasa por `trySafe`), ningún error pierde su origen (siempre hay `cause` hasta
la excepción original), y ningún error queda sin manejar (el `.exhaustive()`
de ts-pattern no compila si falta una variante). Legibilidad y manejo de
errores dejan de depender de la disciplina del autor — humano o agente.

### El suelo del sistema: el trace global

Toda cadena de errores necesita exactamente **un punto de aterrizaje** — el
módulo donde la inducción termina. Si el volcadero de errores reportara sus
propios fallos al volcadero, tendrías recursión infinita; la solución (la
misma que usa el SDK de Sentry) es que el fallback del suelo sea síncrono e
infalible — console o un buffer local — nunca el propio suelo:

```ts
// trace-global.ts — el ÚNICO punto donde la cadena aterriza
export async function reportDomainError(error: DomainError): Promise<void> {
  const sent = await trySafe(() => sendToTelemetry(error));

  if (!sent.ok) {
    // El pararrayos: console recibe AMBOS errores completos. No hay
    // recursión: console es síncrono, no retorna Result y no falla.
    console.error("telemetry_failed", { cause: sent.error, dropped: error });
  }
}
```

Fíjate que este módulo **pasa todas las reglas sin exenciones**: el `await`
resuelve en Result, y `console.error` recibiendo el error completo es una
entrega válida para `result-error-requires-handling`. Reglas prácticas para
el suelo: una sola función pública, sin reintentos hacia sí mismo (si quieres
resiliencia: buffer local + `navigator.sendBeacon` al cerrar), y si tu setup
tiene `no-console`, la exención por archivo para *este único módulo* es
legítima y auditable — es la definición misma del suelo.

## Estructura del paquete

```text
src/
├── shared/
│   ├── rules.ts
│   ├── configs/
│   └── index.ts
├── nest/
│   ├── configs.ts
│   └── index.ts
├── next/
│   ├── configs.ts
│   └── index.ts
├── astro/
│   ├── configs.ts
│   └── index.ts
└── index.ts
```

| Módulo | Propósito |
| --- | --- |
| `@skapxd/eslint-opinionated/shared` | Reglas y presets comunes para backend, frontend y paquetes npm. |
| `@skapxd/eslint-opinionated/nest` | Presets específicos para NestJS. |
| `@skapxd/eslint-opinionated/next` | Presets específicos para Next.js. |
| `@skapxd/eslint-opinionated/astro` | Presets específicos para Astro. |
| `@skapxd/eslint-opinionated` | Entry point principal con todas las reglas y configs. |

## Presets

### Shared

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  skapxd.configs.shared.base,
  skapxd.configs.shared.frontend,
  skapxd.configs.shared.backend,
];
```

### Backend

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  {
    files: ["src/server/**/*.{ts,tsx}", "src/app/api/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.backend,
  },
];
```

El contrato del back es el mismo que el del front: todo `await` debe resolver
en un `Result` (`skapxd/await-requires-result`). Exigir además la firma
`Promise<Result<...>>` en cada función async
(`skapxd/async-functions-return-result`) está **apagado por defecto** — los
motivos están documentados en la sección de esa regla. Si quieres el contrato
duro, actívala encima del preset:

```js
export default [
  {
    files: ["src/server/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.backend,
    rules: {
      ...skapxd.configs.shared.backend.rules,
      "skapxd/async-functions-return-result": [
        "error",
        { checkMissingReturnType: true },
      ],
    },
  },
];
```

### Frontend

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.frontend,
  },
];
```

El contrato del front: ninguna función está obligada a retornar `Result`, pero
toda llamada asíncrona debe ir envuelta en `trySafe` — salvo que lo llamado ya
retorne `Result`/`Promise<Result<...>>` (exención type-aware de
`skapxd/await-requires-result`). Aplica el preset a TODO el código del front
(componentes, hooks, servicios), no solo a los componentes.

### Next.js

```js
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import skapxd from "@skapxd/eslint-opinionated";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
  ...skapxd.configs.next,
];
```

También puedes importar solo el factory de Next.js:

```js
import skapxd from "@skapxd/eslint-opinionated";
import { createNextConfigs } from "@skapxd/eslint-opinionated/next";

export default [
  ...createNextConfigs(skapxd),
];
```

### NestJS

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  ...skapxd.configs.nest,
];
```

Nest trae un modelo de errores por excepciones (`HttpException` + exception
filters). El preset no pelea contra eso: asigna a cada capa su rol en el
pipeline de Result:

| Capa Nest | Rol | Contrato |
| --- | --- | --- |
| Services / use-cases | El dominio puro | Todo retorna `Promise<Result<T, DomainError>>`; `trySafe` en la frontera con Mongoose/Prisma/HTTP |
| Controllers | La frontera | Consumen el Result con `match()`: rama ok → DTO, rama err → `throw new HttpException(...)`. El `throw` aquí es el idioma del framework, no una fuga |
| Exception filter global | **El suelo del sistema** | Recibe todo lo que escapó, con el `cause` completo → telemetría/log (ver "El suelo del sistema") |

Detalles del preset:

- Aplica a `src/**/*.ts` — `dev/`, `scripts/`, `e2e/` e `integration-test/`
  quedan fuera a propósito: no son la app.
- Los entrypoints (`main.ts`, `instrumentation.ts`, `app-cluster.ts`) están
  exentos de `await-requires-result`: el bootstrap debe crashear ruidoso.
  Con `no-floating-promises` activa, el clásico `bootstrap();` del `main.ts`
  se escribe `void bootstrap();` — fire-and-forget declarado.
- Los specs colocados (`*.spec.ts`, `*.e2e-spec.ts`) relajan
  `await-requires-result`, `no-try-catch`, `result-error-requires-handling` y
  `no-non-null-assertion` (el `!` sobre un fixture es el
  arrange del test): un test awaitea helpers libremente y descartar un Result
  en una aserción no es perder un trace. `no-floating-promises` sigue activa
  en specs: un `await` olvidado es un falso verde.
- Activa `skapxd/nest-no-result-response` (ver su sección): un controller
  jamás retorna el Result crudo.
- **El contrato Swagger vive en los DTOs, no en el controller.** El preset
  asume el plugin `@nestjs/swagger` activo en `nest-cli.json` (introspecciona
  query/params/body y tipo de retorno solo): `nest-dto-requires-api-property`
  exige `@ApiProperty` en toda propiedad pública de un `*.dto.ts`, y
  `nest-no-swagger-in-controllers` prohíbe los decoradores redundantes
  (`@ApiOperation`, `@ApiResponse`, `@ApiParam`, ...) en los controllers —
  solo se permiten los que el plugin no puede inferir: `ApiExcludeEndpoint`,
  `ApiTags`, `ApiBearerAuth`, `ApiConsumes`/`ApiBody` (uploads multipart).
- **Los DTOs de input validan en runtime**: `nest-dto-requires-validation`
  exige class-validator en cada propiedad, coherencia `?` ↔ `@IsOptional`, y
  `@Type` de class-transformer junto a `@ValidateNested`. Los DTOs de
  respuesta (`out-*`, `*-response`, ...) quedan exentos.
- **Una clase = una responsabilidad**: `max-public-methods` (de las reglas
  base) corre con los hooks de Nest inyectados vía `ignore`, y se apaga en
  `*.controller.ts`/`*.gateway.ts` donde el framework dicta la forma.
  `nest-no-direct-instantiation` (dependencias por constructor, no `new`) en
  `*.service.ts`; `nest-no-inline-query-params` en `*.controller.ts` (2+
  query params → DTO consolidado).
- **La configuración del proyecto también se lintea**: las premisas de las
  que dependen las demás reglas se verifican, no se asumen.
  `nest-requires-swagger-plugin` lee el `nest-cli.json` real (subiendo desde
  `src/main.ts`) y exige el plugin `@nestjs/swagger`;
  `nest-validation-pipe-config` exige `transform: true` (sin él, los `@Type`
  de los DTOs no hacen nada) y `whitelist: true` (sin él, las props sin
  decorador pasan crudas) en todo `new ValidationPipe`.

### Astro

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  ...skapxd.configs.astro,
];
```

> Para los archivos `.astro` el preset no impone parser: necesitas tener
> `eslint-plugin-astro` configurado (su preset recomendado ya lo aporta).
> Los `.ts/.tsx` sí traen el parser de `typescript-eslint` incluido.

También puedes importar solo el factory de Astro:

```js
import skapxd from "@skapxd/eslint-opinionated";
import { createAstroConfigs } from "@skapxd/eslint-opinionated/astro";

export default [
  ...createAstroConfigs(skapxd),
];
```

### Paquete npm

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.package,
  },
];
```

Para librerías npm escritas en TypeScript (tsup o equivalente). Trae las
bases completas + el set type-driven (tipado, con `projectService`) +
`await-requires-result` + el contrato de empaquetado:

- `skapxd/package-requires-typed-exports` — los `exports` del package.json
  cablean los tipos **por condición** (`import` → `.d.mts`, `require` →
  `.d.ts`); el `types` único por subpath es el bug "FalseCJS".
- `skapxd/untrusted-module-requires-adapter` — inerte hasta que declares tu
  inventario de paquetes con tipos mentirosos (ver su sección).

**Este mismo repo se lintea con este preset** — dogfood: la regla de exports
nos obligó a corregir nuestro propio package.json al nacer.

### Strict (sin escape via `eslint-disable`)

Un prompt o un agente puede saltarse cualquier regla con
`// eslint-disable-next-line`. El preset `strict` activa `noInlineConfig`, que
hace que ESLint **ignore todas las directivas inline** en los archivos que cubre:
ningún `eslint-disable` surte efecto, así que las reglas no se pueden bypassear.

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  ...skapxd.configs.next,
  // Aplícalo al final, acotado a los archivos donde quieras blindar las reglas.
  {
    files: ["src/**/*.{ts,tsx}"],
    ...skapxd.configs.strict,
  },
];
```

Si necesitas una excepción puntual (p. ej. archivos generados), añade después un
bloque con `linterOptions: { noInlineConfig: false }` para esos globs.

## Configurar y sobrescribir reglas

Los presets son flat configs normales de ESLint: **el último config que
matchea un archivo gana**. Para ajustar una regla encima de un preset, esparce
sus `rules` y sobrescribe la entrada:

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

Referencia rápida de qué se puede configurar (detalle y defaults en la sección
de cada regla):

| Regla | Opciones |
| --- | --- |
| `async-functions-return-result` | `allowFilePatterns` (globs), `allowNamePatterns` (regex), `checkMissingReturnType`, `checkMissingReturnTypeWhenCallNames`, `requireCallNames`, `promiseTypeNames`, `resultTypeNames` |
| `await-requires-result` | `allowFilePatterns` (globs), `trySafeCallNames` |
| `max-hook-size` | `maxLines`, `maxUseState` |
| `class-properties-require-readonly` | `allowFilePatterns` (globs), `allowPropertyPatterns` (regex), `ormModuleSources` (default `["@nestjs/mongoose", "typeorm"]`) |
| `max-public-methods` | `allowFilePatterns` (globs), `max` (default `1`), `ignore` (aditivo a los hooks de Nest) |
| `no-accessors` | `allowFilePatterns` (globs) |
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
| `no-else` | `allowFilePatterns` (globs) |
| `no-emoji` | `allowFilePatterns` (globs) |
| `no-explicit-any` | las de la regla original de typescript-eslint (`fixToUnknown`, ...) |
| `no-floating-promises` | las de la regla original de typescript-eslint (`ignoreVoid`, `allowList`, ...) |
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

Los `allowFilePatterns` de todas las reglas son **globs** (`*` un segmento,
`**` cualquier profundidad, `{a,b}` alternativas; un patrón sin prefijo
matchea en cualquier carpeta). Las 7 reglas restantes no tienen opciones: su
única configuración es activarlas, apagarlas o cambiar la severidad.

## Reglas

| Regla | Qué protege |
| --- | --- |
| `skapxd/one-root-function-per-file` | Un archivo, una función top-level semántica. |
| `skapxd/async-functions-return-result` | Funciones async de dominio deben retornar `Promise<Result<...>>`. **Apagada por defecto; opt-in** (ver motivos en su sección). |
| `skapxd/requires-strict-tsconfig` | El `tsconfig` debe ser implacable (`strict`, `noImplicitReturns`, `noUncheckedIndexedAccess`): sin ellos, el compilador no puede hacer irrepresentable lo inválido. |
| `skapxd/result-error-requires-cause` | Un `Result.err` derivado debe preservar `cause: result.error`. |
| `skapxd/result-error-requires-handling` | Prohíbe descartar en silencio un Result fallido: el error se transforma o se entrega, nunca se ignora. |
| `skapxd/await-requires-result` | Todo `await` debe resolver en un `Result`: o la función llamada retorna `Promise<Result<...>>` (preferido) o se envuelve en `trySafe`. **Obligatoria en todos los presets tipados.** |
| `skapxd/no-ad-hoc-ok-result` | Evita contratos `{ ok: ... }` hechos a mano en async exports. |
| `skapxd/max-hook-size` | Marca hooks grandes o con demasiados `useState`. |
| `skapxd/class-properties-require-readonly` | Toda propiedad de clase es `readonly`: el cambio se modela con instancias nuevas, no con mutación. |
| `skapxd/max-public-methods` | Una clase, una responsabilidad: máximo N métodos públicos (default 1). Agnóstica al framework, en las reglas base; el preset `nest` le inyecta sus hooks. |
| `skapxd/no-accessors` | Prohíbe `get`/`set`: un método explícito dice la verdad; el accessor esconde computación (y métodos disfrazados). |
| `skapxd/jsx-return-name-pascal-case` | Funciones que retornan JSX deben nombrarse como componentes. |
| `skapxd/nest-dto-requires-api-property` | Toda propiedad pública de un `*.dto.ts` lleva `@ApiProperty`: el contrato HTTP se documenta en el DTO. Preset `nest`. |
| `skapxd/nest-dto-requires-validation` | Los DTOs de input validan en runtime: class-validator en cada propiedad, `@IsOptional` si hay `?`, `@Type` junto a `@ValidateNested`. Preset `nest`. |
| `skapxd/nest-no-direct-instantiation` | Prohíbe `new` sobre imports internos en services: las dependencias entran por el constructor (DI). Preset `nest`. |
| `skapxd/nest-no-inline-query-params` | Dos o más `@Query('x')`/`@ApiQuery` individuales son un DTO disfrazado: consolida en `@Query() filters: Dto`. Preset `nest`. |
| `skapxd/nest-no-result-response` | Los métodos de un `@Controller` no retornan `Result`: el envelope se serializaría al cliente. La activa el preset `nest`. |
| `skapxd/nest-no-swagger-in-controllers` | Los controllers no se llenan de decoradores de swagger; el plugin introspecciona los DTOs. Preset `nest`. |
| `skapxd/nest-requires-swagger-plugin` | `nest-cli.json` debe tener el plugin `@nestjs/swagger`: la premisa de las reglas de swagger, verificada. Preset `nest`. |
| `skapxd/nest-validation-pipe-config` | Todo `new ValidationPipe` configura `transform` y `whitelist`: la premisa de las reglas de DTOs. Preset `nest`. |
| `skapxd/no-deep-relative-imports` | Limita la profundidad de los imports relativos (`../`). |
| `skapxd/no-default-export` | Prohíbe `export default`; el nombre del símbolo es el contrato. Exime configs/stories y, en el preset `next`, los entrypoints del App Router. |
| `skapxd/no-else` | Prohíbe `else`/`else if`: el else es el estado sin nombre. Retorno anticipado, ternario simple o `match()`. |
| `skapxd/no-emoji` | Prohíbe emojis en strings y JSX; cada sistema los renderiza distinto. Usa un icono SVG. |
| `skapxd/no-explicit-any` | Prohíbe `any`: apaga el sistema de tipos donde más se necesita. `unknown` para lo desconocido, el tipo real para lo demás. Wrapper de typescript-eslint. |
| `skapxd/no-floating-promises` | Promesas sin `await` ni `void`: el rechazo muere sin pasar por trySafe. El mensaje corrige el consejo upstream (`.then/.catch` aquí están prohibidos). Wrapper de typescript-eslint. |
| `skapxd/no-impossible-branch` | Condiciones que el type-checker demuestra constantes: la pregunta ya tiene respuesta. Es `@typescript-eslint/no-unnecessary-condition` con nombre semántico y mensajes que enseñan el fix. |
| `skapxd/no-nested-if` | Prohíbe `if` anidados: retorno anticipado o `match()`. Menos carga cognitiva y sin puntos ciegos para las demás reglas. |
| `skapxd/no-non-null-assertion` | Prohíbe el `!`: es "cállate, yo sé más que tú" dicho al compilador. Modela el tipo o maneja la duda. Wrapper de typescript-eslint. |
| `skapxd/no-runtime-state-guard` | Prohíbe `if (this.x) throw` en métodos: el estado inválido se hace irrepresentable en el tipo, no se vigila en runtime. |
| `skapxd/no-silenced-compiler` | Prohíbe `@ts-ignore`/`@ts-nocheck`: silenciar la alarma no arregla el incendio. `@ts-expect-error` con descripción queda para tests de tipos. Wrapper de `ban-ts-comment`. |
| `skapxd/no-tunnel-props` | Ninguna prop viaja más de un nivel: quien la recibe no puede reenviarla a otro componente. Mata el prop drilling. |
| `skapxd/prefer-abort-signal` | Listeners en efectos se limpian con `AbortController` (`{ signal }` + `abort()`), no con `removeEventListener`. |
| `skapxd/prefer-tagged-union-state` | Prohíbe estados inconsistentes representables: flag de loading + campo de error independientes → unión etiquetada. |
| `skapxd/prefer-type-over-interface` | Las uniones discriminadas son types; un `type` no crece en silencio por declaration merging. Wrapper de `consistent-type-definitions`. |
| `skapxd/no-functions-inside-components` | Prohíbe definir funciones dentro de componentes React. |
| `skapxd/no-try-catch` | Prohíbe `try/catch`; usa `trySafe` de `@skapxd/result`. |
| `skapxd/no-promise-chain` | Prohíbe `.then/.catch/.finally`; usa `await` (+ `trySafe`). |
| `skapxd/prefer-ts-pattern` | Prohíbe `switch` y ternarios anidados; usa `match()` de ts-pattern. |
| `skapxd/package-requires-typed-exports` | Los `exports` del package.json declaran `types` por condición (`import` → `.d.mts`, `require` → `.d.ts`): mata el bug FalseCJS. Preset `package`. |
| `skapxd/untrusted-module-requires-adapter` | Los paquetes con tipos mentirosos (@types desfasados) solo se importan desde su adaptador: la mentira vive en UN archivo. Preset `package`. |
| `skapxd/no-jsx-ternary-null` | Prefiere `cond && <El />` sobre `cond ? <El /> : null` en JSX. |

### `skapxd/one-root-function-per-file`

Limita cada archivo a una sola función declarada en la raíz.

Cuando detecta varias funciones, sugiere una estructura con formato tipo
`tree`. Por ejemplo:

```text
payment-gateway.ts
```

puede convertirse en:

```text
payment-gateway/
├── index.ts
└── get-ai-minute-packages.ts
```

En archivos de convención de Next.js (`route.ts`, `page.tsx`, `layout.tsx`,
etc.) no sugiere estructuras inválidas. Mantiene el entrypoint requerido y
sugiere helpers al lado.

### `skapxd/async-functions-return-result`

> **Apagada por defecto desde v0.5.0** — ningún preset la activa. La regla
> obligatoria del sistema de errores es `skapxd/await-requires-result`.
>
> **Por qué se tomó esta decisión:**
>
> 1. **`await-requires-result` produce el mismo estado final con mejor
>    ergonomía.** Si ningún `await` puede quedar sin `Result`, envolver con
>    `trySafe` inline una y otra vez se vuelve incómodo rápido — la presión
>    natural es extraer funciones que retornen `Promise<Result<...>>` con
>    errores de dominio. Se llega a las mismas firmas que esta regla imponía,
>    pero por gravedad, no por decreto.
> 2. **Imponer la firma choca con los bordes del framework.** Los handlers
>    `GET/POST` de Next, `page.tsx`, los callbacks de librerías: sus firmas no
>    son tuyas. Esta regla necesitaba listas de excepciones
>    (`allowFilePatterns`, `allowNamePatterns`) para convivir con eso;
>    `await-requires-result` no necesita ninguna, porque envolver un `await`
>    es compatible con cualquier firma.
> 3. **Adopción incremental.** En un codebase existente, exigir la firma en
>    cada función async lo rompe todo de golpe. Exigir `Result` en los `await`
>    permite migrar llamada por llamada.
>
> Sigue disponible para quien quiera endurecer el contrato (p. ej. un backend
> nuevo donde todas las firmas son tuyas):
>
> ```js
> rules: {
>   "skapxd/async-functions-return-result": ["error", {
>     checkMissingReturnType: true,
>     resultTypeNames: ["Result", "ResultValue", "SafeResult"],
>   }],
> }
> ```

Obliga a que funciones async en dominios configurados declaren un retorno como:

```ts
Promise<Result<Success, DomainError>>
```

Es **type-aware** y está atada a `@skapxd/result`: usa el TypeScript checker para
confirmar que el `Result` viene de ese paquete, no solo que el tipo *se llame*
`Result`. Un `Result` de otro paquete (o un tipo homónimo hecho a mano) **no**
cumple la regla.

```ts
import { Result } from "@skapxd/result";
async function ok(): Promise<Result<number, Error>> {} // ✅

type Result<T, E> = ...;                                // ❌ Result ajeno
async function no(): Promise<Result<number, Error>> {}  // se reporta
```

> Requiere `projectService` (actívalo en `languageOptions.parserOptions` o
> apóyate en un preset tipado del plugin, que ya lo trae).
> Sin información de tipos cae a una comprobación por nombre (`resultTypeNames`),
> menos estricta.

Todas las opciones, con sus defaults:

```js
"skapxd/async-functions-return-result": ["error", {
  allowFilePatterns: [],       // globs de archivos exentos, p. ej. ["src/legacy/**"]
  allowNamePatterns: [],       // regex de nombres exentos, p. ej. ["^(GET|POST)$"]
  checkMissingReturnType: true, // reportar también funciones SIN anotación de retorno
  checkMissingReturnTypeWhenCallNames: [], // ...o solo si el cuerpo llama a estos nombres
  requireCallNames: [],        // acotar la regla a funciones que llamen a estos nombres
  promiseTypeNames: ["Promise"],  // wrappers de promesa aceptados (fallback sin tipos)
  resultTypeNames: ["Result"],    // nombres de Result aceptados (fallback sin tipos)
}]
```

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

### `skapxd/result-error-requires-cause`

Evita perder el error original al transformar un `Result` fallido:

```ts
if (!result.ok) {
  return Result.err({
    cause: result.error,
    message: "No pude completar la operación.",
    type: "OPERATION_FAILED",
  });
}
```

Reconoce todas las formas del guard de Result fallido — `!result.ok`,
`result.ok === false`, `result.ok !== true`, `Result.isErr(result)` y
`if (result.error)` — y dentro del guard exige el `cause` en todo
`Result.err(...)`. Un `Result.err()` **sin argumentos** también se reporta:
descartar el error por completo es el peor caso, no una exención. Y un `cause`
con otro valor (`cause: new Error(...)`) no cuenta: tiene que ser literalmente
el `result.error` del guard.

Esta regla es type-aware. Usa TypeScript parser services para confirmar que el
valor del guard y `Result.err` vienen de `@skapxd/result`. Por eso funciona con
aliases, re-exports y tipos inferidos, sin depender solo del nombre importado en
el archivo. Su punto ciego histórico —el `Result.err` escondido en un `if`
anidado— lo elimina `skapxd/no-nested-if` de raíz.

### `skapxd/result-error-requires-handling`

La hermana de la anterior cierra la última puerta de evasión: el **descarte
silencioso**. Detectar el fallo y botarlo sin tocarlo es legal para
`result-error-requires-cause` (no hay transformación que vigilar), pero deja
morir información valiosa sin que nadie lo decidiera conscientemente:

```ts
const result = await copyTextToClipboard(text);
if (!result.ok) return;            // ❌ el error muere aquí, en silencio
```

El contrato: dentro de un guard de Result fallido, `result.error` (o el
result completo) debe **fluir a alguna parte**. Dos salidas:

```ts
// 1. Transformarlo (y result-error-requires-cause vigila el cause)
if (!result.ok) {
  return Result.err({ cause: result.error, message: "...", type: "COPY_FAILED" });
}

// 2. Entregárselo a alguien: telemetría, estado de error, log de dominio
if (!result.ok) {
  trackClipboardFailure(result.error);
  return;
}

// (propagar el result completo también vale: `if (!result.ok) return result;`)
```

**No hay tercera salida.** `void result.error` no cuenta como manejo, y
manejar sin tocar el error (`setFailed(true)`) tampoco — el detalle se perdió
igual. Esto es deliberado: si darle seguimiento a un error es crítico o no,
no puede depender de la interpretación de quien escribe; el camino por
defecto nunca es ignorarlo.

**El alias tampoco es escape.** Asignar no es consumir: la regla sigue los
alias (y los encadenados, y el destructuring) hasta verificar que alguno se
consume de verdad:

```ts
if (!result.ok) {
  const e = result.error;   // ❌ transferencia sin destino: se reporta
  return;
}

if (!result.ok) {
  const cause = result.error;
  return Result.err({ cause, message: "..." });  // ✅ el alias se consumió
}
```

**Proyectar no es manejar** (desde v0.13.0). Leer `result.error.message` para
la UI está bien — pero si eso es lo ÚNICO que sale del guard, el `cause` murió
en la última milla: diste feedback de que ocurrió un error sin que el *porqué*
llegara a ninguna parte. El error debe fluir **completo** (el objeto entero,
con su cadena de causas adentro):

```ts
if (!result.ok) {
  setFeedback(result.error.message);    // ❌ solo la proyección: el cause se pierde
  return;
}

if (!result.ok) {
  reportDomainError(result.error);      // ✅ el objeto entero → al trace
  setFeedback(result.error.message);    //    y la proyección para la UI, ahora sí
  return;
}
```

Lo mismo vía alias (`const e = result.error; setFeedback(e.message)` no
basta) y vía result (`console.log(result.ok)` no es manejo). Las formas que
mantienen la información completa: `result.error` entero como argumento /
retorno / propiedad, el result completo (`return result`), o la
transformación con `cause`.

Type-aware como su hermana: solo aplica a Results reales de `@skapxd/result`,
con las mismas cinco formas de guard.

### `skapxd/await-requires-result`

> **Es la regla obligatoria del sistema de errores**: la activan todos los
> presets tipados (`shared.frontend`, `shared.backend`, `next/server`,
> `astro/typescript`). El contrato queda así: ninguna función está obligada
> a retornar `Result` (eso es `async-functions-return-result`, apagada por
> defecto), pero todo `await` debe **resolver** en uno. Para activarla en
> otros globs, añádela tú mismo:
>
> ```js
> rules: {
>   "skapxd/await-requires-result": ["error", {
>     trySafeCallNames: ["trySafe"],
>     allowFilePatterns: [],
>   }],
> }
> ```
>
> (`skapxd/await-requires-try-safe` es el nombre anterior; sigue funcionando
> como alias deprecado y se eliminará en una versión futura.)

Hay dos caminos válidos, y la regla recomienda el primero:

**1. El camino preferido: extrae la operación a una función que retorne
`Promise<Result<...>>`** y modela ahí los errores de dominio. El `trySafe` vive
dentro de esa función, en la frontera con el código que lanza, y el resto del
código habla en errores con significado:

```ts
async function getUser(id: string): Promise<Result<User, UserError>> {
  const response = await trySafe(() => fetch(`/users/${id}`));

  if (!response.ok) {
    return Result.err({
      cause: response.error,
      message: "No pude cargar el usuario.",
      type: "USER_FETCH_FAILED",
    });
  }

  return trySafe(() => response.value.json());
}

// En el componente: ya resuelve en Result, pasa directo.
const user = await getUser(id); // ✅
```

La detección es type-aware: la regla resuelve el símbolo hasta `@skapxd/result`,
así que un `Result` casero (homónimo, de otra librería) no exime.

**2. La alternativa rápida: envuelve el `await` en `trySafe` ahí mismo:**

```ts
const result = await trySafe(() => client.execute({...})); // ✅
```

o dentro de un callback:

```ts
const result = await trySafe(async () => {
  const response = await fetch(url);
  return response.json();
});
```

Sirve para código de pegamento, pero deja el error sin modelar (`Result<T,
unknown>`). Cuando la misma operación se repite o el error importa, el mensaje
de la regla empuja hacia el camino 1.

### `skapxd/nest-no-swagger-in-controllers`

La contracara de la anterior: con el plugin de `@nestjs/swagger` activo en
`nest-cli.json`, los decoradores de documentación en el controller son ruido
redundante — el plugin ya introspecciona los DTOs de input y el tipo de
retorno. Un controller lleno de `@ApiOperation`/`@ApiResponse`/`@ApiParam`
entierra la lógica de la frontera bajo metadatos que viven mejor en el DTO:

```ts
@Controller("users")
export class UsersController {
  @ApiOperation({ summary: "Busca un usuario" })   // ❌ redundante con el plugin
  @ApiResponse({ status: 200, type: UserDto })     // ❌ el tipo de retorno ya lo dice
  @ApiParam({ name: "id" })                        // ❌ el DTO de params ya lo dice
  @Get(":id")
  findOne(@Param() params: FindUserParamsDto): Promise<UserDto> { ... }
}
```

Solo se permiten los decoradores que el plugin **no puede inferir**
(`allowedDecoratorNames`, configurable): `ApiExcludeEndpoint` (ocultar rutas
internas), `ApiTags` (agrupación), `ApiBearerAuth` (auth), y
`ApiConsumes`/`ApiBody` (uploads multipart, que la introspección no ve).

La detección compara contra los **imports reales de `@nestjs/swagger`** del
archivo: un decorador propio que se llame `ApiOperation` no se toca. Solo
aplica dentro de clases `@Controller`.

### `skapxd/nest-requires-swagger-plugin`

Las reglas de swagger del preset (`nest-no-swagger-in-controllers`,
`nest-dto-requires-api-property`) descansan sobre una premisa: el plugin
`@nestjs/swagger` activo en `nest-cli.json`, que introspecciona DTOs y tipos
de retorno. Esta regla **verifica la premisa en vez de asumirla**: anclada al
entrypoint (`mainFilePatterns`, default `src/main.ts`, un reporte por
proyecto), sube por las carpetas hasta el `nest-cli.json` real y exige:

```jsonc
// nest-cli.json
{
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]   // ✅ (también acepta { "name": "..." })
  }
}
```

Sin el plugin, el swagger queda vacío — y como el preset prohíbe documentarlo
a mano en los controllers, el error te lo dice en el primer lint, no en el
primer deploy.

### `skapxd/nest-validation-pipe-config`

La otra premisa verificada: todo `new ValidationPipe(...)` (el real, importado
de `@nestjs/common`) debe configurar las dos opciones que hacen reales los
contratos de los DTOs:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,   // sin él, class-transformer no corre: los @Type no hacen NADA
    whitelist: true,   // sin él, las props sin decorador pasan crudas al dominio
    // ...el resto (exceptionFactory, transformOptions) es tuyo
  }),
);
```

`new ValidationPipe()` sin opciones, con una faltante o con `transform: false`
se reporta. Si las opciones llegan como variable, se resuelve por scope; un
identifier irresoluble o un spread reciben el beneficio de la duda.
`requiredPipeOptions` es configurable (p. ej. añadir `forbidNonWhitelisted`).

### `skapxd/no-ad-hoc-ok-result`

Prohíbe que una función async **exportada** retorne objetos literales con la
forma `{ ok: ... }` armados a mano. Un contrato casero fragmenta el sistema:
cada módulo inventa su variante, la exención type-aware de
`await-requires-result` no lo reconoce, y `match()` pierde la exhaustividad.

```ts
export async function getUser(id: string) {
  return { ok: false, message: "falló" };          // ❌ contrato inventado
}

export async function getUser(id: string): Promise<Result<User, UserError>> {
  return Result.err({                               // ✅ el Result real
    cause: error,
    message: "No pude cargar el usuario.",
    type: "USER_FETCH_FAILED",
  });
}
```

Solo mira funciones async exportadas: un helper interno con un objeto `ok`
cualquiera no es un contrato público y no se reporta.

### `skapxd/max-hook-size`

Marca hooks que crecen demasiado o acumulan muchos `useState`.

La intención es empujar el diseño hacia `useReducer`, hooks más pequeños o
módulos de transición de estado.

Opciones (los presets `frontend` y `next` usan `maxLines: 120`, `maxUseState: 1`):

```js
"skapxd/max-hook-size": ["error", {
  maxLines: 120,   // líneas máximas del cuerpo del hook
  maxUseState: 1,  // useState propios permitidos antes de exigir useReducer
}]
```

### `skapxd/jsx-return-name-pascal-case`

Si una función devuelve JSX, es un componente, y debe llamarse como tal:
PascalCase. El mensaje sugiere el rename concreto.

```tsx
function renderUserCard(user: User) {  // ❌ "render*" devuelve JSX → es un componente
  return <article>{user.name}</article>;
}

function UserCard({ user }: { user: User }) {  // ✅ nombre de componente + props
  return <article>{user.name}</article>;
}
```

Esta regla es la que mantiene honesto al resto del sistema React: las reglas
de componentes detectan "componente" por nombre PascalCase, así que una
función `renderX` que devuelve JSX escaparía de ellas. Esta la captura y
fuerza el rename — y con el nombre corregido, las demás ya la ven.

### `skapxd/no-accessors`

Prohíbe `get`/`set` en clases y objetos literales. Un accessor es un método
con sintaxis de propiedad: esconde computación tras un acceso que parece
inocente (`config.token` que en realidad ejecuta código), y abre la puerta al
**método disfrazado** — un `get sendMessage() { return (...) => ... }` que
escapaba de `max-public-methods`:

```ts
class Connection {
  get socket() { return this.current; }   // ❌ computación disfrazada de propiedad
  socket() { return this.current; }       // ✅ el call site dice la verdad: socket()
}
```

Si algo es un dato, es una propiedad `readonly`; si algo es comportamiento,
es un método explícito que cuenta en la superficie pública. No hay tercera
categoría.

### `skapxd/class-properties-require-readonly`

Toda propiedad de clase (incluidas las parameter properties del constructor)
lleva `readonly`. El estado mutable es la raíz de los **estados
inconsistentes** — la misma enfermedad del `useState` con `isLoading`,
`error` y `value` llenos a la vez que motivó este paquete: si los campos
pueden mutar por separado, las combinaciones imposibles se vuelven posibles.
El cambio se modela creando instancias nuevas:

```ts
class Loan {
  constructor(
    readonly amount: number,            // ✅
    private readonly term: number,      // ✅ parameter property también
  ) {}

  withAmount(amount: number): Loan {
    return new Loan(amount, this.term); // el "cambio": una instancia nueva
  }
}

class Cache {
  private entries: string[] = [];       // ❌ private no exime: mutable es mutable
}
```

La mutación inherente (la conexión de un socket que se reemplaza al
reconectar) **se declara visible** en `allowPropertyPatterns: ["^currentSocket$"]`
— una decisión en la config, greppeable, no un default silencioso.

**Compatibilidad con NestJS, investigada y verificada:**

- **DTOs ✅ sin fricción** (verificado empíricamente con class-transformer +
  class-validator reales): `readonly` es chequeo de compilación que se borra
  en runtime — `plainToInstance` asigna, `@Type` convierte, los anidados se
  instancian y la validación corre igual. El issue conocido de
  class-transformer ([typestack/class-transformer#250](https://github.com/typestack/class-transformer/issues/250))
  es sobre `private readonly` detrás de *getters* (accessors) — patrón que
  `no-accessors` ya prohíbe.
- **Capa de persistencia ⚠️ exención POR PROPIEDAD, no por archivo**: una
  propiedad decorada por el ORM (`@Prop` de `@nestjs/mongoose`, `@Column` y
  compañía de `typeorm` — verificados contra los imports reales,
  `ormModuleSources` configurable) le pertenece al ORM y a su modelo de
  mutación (`doc.campo = x; await doc.save()` no compila contra readonly).
  La precisión importa: una propiedad **sin** `@Prop` dentro de un
  `*.schema.ts` es estado de clase normal (campos virtuales, caches) y sí
  exige `readonly` — la exención por nombre de archivo la habría silenciado.
- **Cuidado con los TIPOS array readonly** (`tags: readonly string[]`,
  `ReadonlyArray<T>`): el plugin de `@nestjs/swagger` degrada su inferencia
  con ellos ([nestjs/swagger#2413](https://github.com/nestjs/swagger/issues/2413)).
  Esta regla exige el modificador en la *propiedad* (`readonly tags: string[]`),
  que es inocuo para el plugin — no uses los tipos array readonly en DTOs.

### `skapxd/max-public-methods`

El `one-root-function-per-file` del mundo de clases: **una clase, una
responsabilidad** — máximo `max` métodos públicos (default `1`). Es la regla
que convierte un `loans.service.ts` de 1965 líneas en una carpeta de casos de
uso (`find-apc-score.service.ts`, `create-signature.service.ts`, ...).

Es **agnóstica al framework** y vive en las reglas base: una clase en Nest,
Astro, Next o un proyecto Vite responde al mismo contrato. El conocimiento
del framework lo inyecta cada preset vía `ignore` — la regla en sí no sabe
qué es NestJS.

```ts
// ❌ dos casos de uso conviviendo
export class ApcService {
  async getScore(id: string) { ... }
  async refreshScore(id: string) { ... }
}

// ✅ un caso de uso con su séquito privado
export class FindApcScoreService {
  constructor(private readonly repository: ApcRepository) {}
  async execute(id: string) { return this.normalize(...); }
  private normalize(raw: unknown) { ... }
}
```

No cuentan: constructor, getters/setters, `private`/`protected`, `#privados`
y el prefijo `_`. `ignore` exime nombres por opción — así el **preset `nest`**
inyecta sus hooks (`onModuleInit`, `onApplicationBootstrap`, `canActivate`,
`intercept`, `transform`, `catch`, `use`, ...): callbacks que el framework
llama, no superficie pública. Fuera de Nest esos nombres no significan nada y
cuentan como cualquier método.

El preset `nest` además la **apaga en `*.controller.ts` y `*.gateway.ts`**:
ahí la forma la dicta el framework (un método por ruta/evento) y el límite no
aporta semántica. El mensaje de error es un playbook de refactor completo
(nombres semánticos, extracción de estado compartido, actualización del
módulo y los imports) pensado para que un agente lo ejecute solo.

### `skapxd/nest-dto-requires-api-property`

El contrato HTTP — query, params, body y respuesta — se documenta en el DTO,
no en el controller. Toda propiedad **pública de instancia** de una clase en
un `*.dto.ts` debe llevar `@ApiProperty` o `@ApiPropertyOptional`:

```ts
// create-user.dto.ts
export class CreateUserDto {
  @ApiProperty({ description: "Nombre legal completo", example: "Ana Pérez" })
  name: string;                       // ✅

  email: string;                      // ❌ sin documentar

  @IsString()
  phone: string;                      // ❌ class-validator no documenta
}
```

El plugin de `@nestjs/swagger` infiere el **tipo**, pero la `description` y el
`example` son intención tuya — y son lo que convierte el swagger en un
contrato legible (y en un buen cliente generado). Las propiedades `private`,
`protected`, `#privadas` y `static` no se exigen: swagger no las serializa.
`dtoFilePatterns` ajusta la convención de archivos si no usas `*.dto.ts`.

### `skapxd/nest-dto-requires-validation`

El tipo de TypeScript desaparece en runtime: un DTO de input sin
class-validator es un contrato de mentira — el `ValidationPipe` deja pasar
cualquier cosa (o la descarta en silencio con `whitelist`). Tres contratos en
una regla:

```ts
export class CreateLoanDto {
  @ApiProperty()
  @IsNumber()                 // 1. ✅ toda propiedad valida en runtime
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()               // 2. ✅ el `?` del tipo y el runtime coinciden
  @IsNumber()
  termMonths?: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AddressDto)     // 3. ✅ sin @Type, la validación anidada NO corre
  address: AddressDto;
}
```

1. **Toda propiedad pública** lleva al menos un decorador de class-validator.
2. **`?` exige `@IsOptional`** (o `@ValidateIf`): si el tipo dice opcional y el
   runtime la exige, el contrato miente.
3. **`@ValidateNested` exige `@Type(() => Clase)`** de class-transformer: sin
   él, el objeto anidado llega como plain object y la validación anidada no
   corre — el bug silencioso clásico (esta regla lo encontró en producción).

Los **DTOs de respuesta quedan exentos** por dos vías: nombre de archivo
(`outputDtoFilePatterns`: `out-*`, `output-*`, `*-response`, `*-result`,
`*-output`) y **nombre de clase** (`outputDtoClassPatterns`, regex, default
`(Response|Result|Output)(Dto)?$`) — porque un `UploadDocumentResponseDto`
puede vivir en un archivo de nombre neutro (`upload-document.dto.ts`) o
compartir archivo con DTOs de input, y la exención de la clase no contagia a
sus vecinas. El server los produce, no los recibe. La detección compara
contra los imports reales de `class-validator`/`class-transformer`, así que
un decorador casero homónimo no engaña a la regla.

**El caso Multer** queda cubierto por el conjunto: el archivo llega como
parámetro (`@UploadedFiles() files: Express.Multer.File[]`), nunca en un DTO
validable; el schema multipart se documenta inline en el controller con
`@ApiConsumes` + `@ApiBody` (permitidos por `nest-no-swagger-in-controllers`:
la introspección no ve multipart); y el DTO de respuesta del upload queda
exento por nombre de clase. La validación del archivo en sí (tamaño, mimetype)
va donde Nest la diseñó: `ParseFilePipe` en el parámetro, no class-validator.

### `skapxd/nest-no-direct-instantiation`

En un service, `new FooService()` sobre un import **interno del proyecto**
esquiva el contenedor de DI: NestJS no resuelve sus dependencias, no
participa del lifecycle, y la clase deja de ser testeable con mocks. Las
dependencias entran por el constructor:

```ts
import { FooService } from "#/modules/foo/foo.service";

const foo = new FooService();                            // ❌ esquiva la DI

constructor(private readonly fooService: FooService) {}  // ✅ NestJS resuelve
```

La robustez viene en capas:

1. **Los globals del runtime nunca se marcan** (`new Date()`, `new Map()`,
   `new AbortController()`): la regla parte de los **imports internos**
   (`internalPatterns`: alias `#/`, `@/` y relativos), y un global no se
   importa. Las librerías externas (`new Logger(...)`) también libres, y los
   `import type` no cuentan.
2. **Exención por nombre de clase** (`allowedClassPatterns`, default
   `(Error|Exception|Event)$`): errores, excepciones y eventos de dominio se
   construyen, no se inyectan — vivan en el archivo que vivan.
3. **La capa type-aware** (con `projectService`, que el preset trae): la
   regla resuelve el símbolo de la clase importada y pregunta por el
   decorador `@Injectable`. Sin el decorador es una clase de valor (un DTO,
   un mapper puro) y el `new` es legítimo; con él, pertenece al contenedor y
   se reporta. Irresoluble → conservador, se reporta. En un proyecto real
   esta capa eliminó el 100% de los falsos positivos restantes.

`allowedPatterns` (regex de sources) sigue disponible para convenciones
propias. El preset la activa en `*.service.ts`.

### `skapxd/nest-no-inline-query-params`

Dos o más `@Query('x')` individuales (o `@ApiQuery` sueltos) en un handler
son un DTO disfrazado — sin validación automática, sin tipos de verdad y con
el controller enterrado en decoradores:

```ts
// ❌ cada query a mano
findAll(@Query("status") status?: string, @Query("clientName") name?: string) {}

// ✅ el DTO consolidado: ValidationPipe valida, swagger documenta, el tipo es real
findAll(@Query() filters: ListLoansDto) {}
```

`@Query()` sin argumento (el DTO completo) y un único `@Query('id')` son
legítimos (`max` configurable). El mensaje trae el playbook de migración:
propiedades `?` + `@IsOptional` + validador + `@ApiPropertyOptional`, y
`@Transform`/`@Type` para convertir los strings del query al tipo real.
Conecta con `nest-dto-requires-validation`: el DTO que crees ya queda
vigilado. Solo el `Query`/`ApiQuery` importados de Nest cuentan.

### `skapxd/nest-no-result-response`

El footgun silencioso de mezclar Result con Nest: si un método de un
`@Controller` retorna el `Result` crudo, Nest lo serializa tal cual y el
cliente recibe `{ ok: false, error: {...} }` con tus internals — tipos de
error de dominio, causas, stack traces. Esta regla lo hace imposible:

```ts
@Controller("users")
export class UsersController {
  // ❌ el envelope completo viaja al cliente
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Result<User, UserError>> {
    return this.usersService.findOne(id);
  }

  // ✅ el controller es la frontera: match() traduce
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<UserDto> {
    const user = await this.usersService.findOne(id);

    return match(user)
      .with({ ok: true }, ({ value }) => toUserDto(value))
      .with({ ok: false, error: { type: "NOT_FOUND" } }, () => {
        throw new NotFoundException();
      })
      .exhaustive();
  }
}
```

Es **type-aware**: resuelve el tipo de retorno real del método (anotado o
inferido) hasta el `Result` de `@skapxd/result`, así que devolver el Result
por indirección tampoco escapa. Solo aplica a clases con `@Controller`
(configurable con `controllerDecoratorNames` para decoradores propios); los
services retornan Result con orgullo — ese es el dominio.

### `skapxd/no-deep-relative-imports`

Limita cuántos niveles puede subir un import relativo. Por defecto **prohíbe
cualquier `../`**: un import que sube a una carpeta padre suele ser señal de que
falta un alias de ruta o de que el módulo está mal ubicado.

```ts
import { x } from "./sibling";   // ✅ mismo nivel
import { y } from "../shared/y"; // ❌ sube a una carpeta padre
import { z } from "#/shared/y";  // ✅ alias de ruta
```

Opción `maxDepth` (por defecto `0`) para permitir hasta N niveles de `../`:

```js
rules: {
  // permite ../ (un nivel) pero sigue prohibiendo ../../
  "skapxd/no-deep-relative-imports": ["error", { maxDepth: 1 }],
}
```

Revisa imports estáticos (`import`), re-exports (`export ... from`) e imports
dinámicos (`import(...)`). El remedio habitual es un alias de ruta (`@/...`) o
acercar el módulo a quien lo usa.

### `skapxd/no-nested-if`

Prohíbe un `if` dentro de otro `if` (en la misma función). Cada nivel de
anidación suma carga cognitiva para quien lee — y además crea puntos ciegos
para las demás reglas: un `Result.err` dentro de un if anidado quedaba fuera
del alcance de `result-error-requires-cause`. Esta regla elimina la categoría
completa de evasión en vez de parchear cada caso.

```ts
// ❌ anidado: el lector mantiene dos condiciones en la cabeza
if (!response.ok) {
  if (shouldReport) {
    return Result.err({ cause: response.error, message: "...", type: "X" });
  }
}

// ✅ retorno anticipado: una condición a la vez, camino feliz sin sangría
if (!response.ok && shouldReport) {
  return Result.err({ cause: response.error, message: "...", type: "X" });
}

// ✅ o match() si son variantes de un mismo valor
```

No cuenta como anidación: la cadena `else if` (es secuencia, no anidación), y
una función definida dentro del `if` (unidad cognitiva aparte). El propio
código de este plugin se aplanó con retorno anticipado al activar la regla —
cinco casos, todos quedaron más legibles.

### `skapxd/no-default-export`

Prohíbe `export default` (incluida la forma `export { x as default }`). Con
exports nombrados, el nombre del símbolo es el contrato del módulo: renombrar
con el IDE actualiza todos los usos, `grep` encuentra definición y consumo, y
los autoimports no inventan nombres distintos por archivo.

```ts
export default function getUser() {}   // ❌ cada import puede llamarlo distinto
export function getUser() {}            // ✅ un solo nombre canónico
```

**Dónde sí se permite el default.** Hay entrypoints donde el ecosistema lo
exige, y la regla los reconoce en capas:

1. **Integrados (siempre activos):** configs de tooling (`*.config.{js,mjs,cjs,ts}`:
   `next.config`, `tailwind.config`, `vitest.config`, `eslint.config`, ...) y
   stories de Storybook (`*.stories.*`).
2. **Preset `next` (automático):** los entrypoints del App Router donde Next
   exige el default — `page`, `layout`, `template`, `error`, `loading`,
   `not-found`, `sitemap`, `robots`, `manifest`, `icon`, `opengraph-image`,
   etc. No hay que configurar nada.
3. **`allowFilePatterns` (extensible):** si usas un framework o tool que la
   regla aún no contempla, agrega su glob. Los patrones propios se **suman**
   a los integrados, no los reemplazan. Son globs legibles (`*` un segmento,
   `**` cualquier profundidad, `{a,b}` alternativas) y un patrón sin prefijo
   matchea en cualquier carpeta:

```js
"skapxd/no-default-export": ["error", {
  // p. ej. SvelteKit exige default en +page.ts / +layout.ts
  allowFilePatterns: ["+page.ts", "+layout.ts"],
}]
```

Detalle útil con `React.lazy` (que espera `{ default }`): no hace falta volver
al default export, basta mapear el named en el import dinámico:

```ts
const Card = lazy(() => import("./card").then((m) => ({ default: m.Card })));
```

### `skapxd/no-else`

El `if` maneja una condición *nombrada*; el `else` maneja "todo lo demás" —
un complemento anónimo cuyo significado el lector deduce negando la
condición. Es el último rincón donde un camino vive sin etiqueta, y donde la
no-exhaustividad se esconde: una cadena `if/else if/else` sobre flags maneja
2 de 4 combinaciones y deja el resto cayendo en un cajón que nadie auditó.

```ts
// ❌ ¿qué ES el else? el lector lo deduce; el compilador no audita nada
if (s === "a") { runA(); } else if (s === "b") { runB(); } else { runC(); }

// ✅ guards: cada salida declara su condición y termina
if (!user) return Result.err({ ... });
return Result.ok(buildProfile(user));

// ✅ match: cada variante nombrada y exhaustividad verificada
match(state)
  .with({ status: "a" }, runA)
  .with({ status: "b" }, runB)
  .exhaustive();
```

Las salidas: **retorno anticipado** para flujo, **ternario simple** para
decisiones de valor (los anidados ya los prohíbe `prefer-ts-pattern`), y
**`match().exhaustive()`** para variantes. La única fricción real — dos
ramas de efectos en medio de una función — se resuelve extrayendo la función
que `one-root-function-per-file` ya pedía. Complementa a `no-nested-if`
(profundidad) y a `prefer-tagged-union-state` (este ataca la *declaración*
del estado sin nombre; `no-else` ataca su *consumo*).

### `skapxd/no-emoji`

Prohíbe emojis en strings, template literals y texto JSX. El problema no es
estético: un emoji se renderiza con la fuente de emojis del **sistema del
usuario** — Segoe UI Emoji en Windows, Apple Color Emoji en macOS, Noto en
Android — así que el mismo carácter se ve distinto en cada plataforma, y en
un Linux sin fuente de emojis directamente no se renderiza (sale el cuadro
vacío □). Un SVG se ve idéntico en todas partes.

```tsx
<button>Enviar 🚀</button>                 // ❌ depende de la fuente del sistema
<button>Enviar <Rocket /></button>         // ✅ lucide-react: idéntico en todas partes
```

Detecta por propiedad Unicode (`Extended_Pictographic`), así que los símbolos
tipográficos normales no se tocan: `→`, `✓`, `©`, `·` pasan sin problema.

No revisa comentarios: un emoji en un comentario no llega al navegador. Para
eximir archivos completos (fixtures, seeds), usa `allowFilePatterns`:

```js
"skapxd/no-emoji": ["error", {
  allowFilePatterns: ["tests/fixtures/**"],
}]
```

### `skapxd/no-runtime-state-guard`

El compañero de `prefer-tagged-union-state` para el comportamiento: cuando un
método protege su estado con una comprobación en runtime, la máquina de
estados vive en `if` + `throw` — requiere tests para cada ruta inválida y el
compilador no puede ayudar (*make invalid states unrepresentable*):

```ts
// ❌ el guard en runtime: probable con tests, invisible para el compilador
class Socket {
  private isConnected = false;
  emit(event: string) {
    if (!this.isConnected) throw new Error("Cannot emit: not connected");
  }
}

// ✅ cada estado es un tipo: emit NO EXISTE en el socket desconectado
class DisconnectedSocket {
  connect(): ConnectedSocket { ... }       // la transición retorna el estado nuevo
}
class ConnectedSocket {
  emit(event: string): void { ... }        // sin guard: el compilador lo garantiza
  disconnect(): DisconnectedSocket { ... }
}
```

(La variante funcional: la unión discriminada de `prefer-tagged-union-state`,
consumida con `match()`.) Solo aplica al **estado propio** (`this.<prop>`) en
métodos de clase — validar argumentos o inputs externos es otro territorio
(DTOs, `Result`). Un `if` sobre `this` que retorna temprano sin lanzar
tampoco se toca. Nota la sinergia con `class-properties-require-readonly`:
el flag mutable que este guard necesita ya era ilegal — las dos reglas
empujan juntas hacia las transiciones que retornan instancias nuevas.

### `skapxd/no-tunnel-props`

**Ninguna prop viaja más de un nivel.** El contrato de saltos: quien **crea**
un valor (estado de un hook, acción de un store, dato calculado) puede pasarlo
a UN hijo; quien lo **recibe** como prop no puede reenviarlo a otro
componente. Eso prohíbe exactamente la cadena `abuelo → padre → hijo` — el
prop drilling — sin tocar el paso legítimo de un nivel.

```tsx
// ✅ primer salto: el abuelo CREA la acción y la baja un nivel
const Abuelo = () => {
  const onSelect = useTranscriptStore((s) => s.select);
  return <Padre onSelect={onSelect} />;
};

// ❌ segundo salto: el padre la RECIBE y la reenvía
const Padre = ({ onSelect }) => <Hijo onSelect={onSelect} />;

// ❌ el rename no lo esconde, y usarla localmente no autoriza el reenvío
const Padre = ({ onSelect }) => <Hijo handler={onSelect} />;

// ❌ el túnel puro
const Padre = ({ ...props }) => <Hijo {...props} />;
```

La detección es local y exacta: si el identifier que pones en una prop de otro
componente viene de tus **props destructuradas**, no lo creaste tú — es su
segundo salto.

Las salidas que sugiere el mensaje:

1. **Store global o custom hook**: la acción/estado vive en un store (p. ej.
   [zustand](https://github.com/pmndrs/zustand)) o un hook, y el componente
   que la necesita la consume directo — la cadena desaparece:

   ```tsx
   function Hijo({ entry }: { entry: Entry }) {
     const select = useTranscriptStore((s) => s.select);
     return <button onClick={() => select(entry.id)}>…</button>;
   }
   ```

2. **Composición**: el padre arma el JSX y el intermedio recibe `children` —
   el dato viaja dentro del JSX, no por props. (`children` nunca cuenta como
   túnel: es la alternativa.)

No cuenta como reenvío: usar la prop (`<h2>{title}</h2>`), derivar datos
(`title={game.title}`), o pasarla a un elemento **nativo** (`value={value}`
en un `<input>` es la frontera con el DOM). Para wrappers legítimos de un
design system, exime props por nombre (`allowPropPatterns: ["^className$"]`)
o archivos completos (`allowFilePatterns`).

### `skapxd/no-impossible-branch`

La rama imposible: una condición que el type-checker demuestra constante. Si
el tipo dice que un valor siempre es truthy, ese `if` no decide nada; si un
`?.` cuelga de algo que nunca es nullish, finge una duda que el modelo ya
resolvió. La pregunta ya tiene respuesta — y un `if` que no pregunta es
código muerto disfrazado de prudencia.

```ts
const sheet = workbook.Sheets[name]; // tipo: WorkSheet (¿seguro?)
if (!sheet) continue; // ❌ "always falsy"... ¿o el tipo miente?
```

El mensaje de error enseña la lección completa: **si la comprobación hace
falta en runtime, lo que está mal es el tipo**. El caso clásico es el acceso
por índice sin `noUncheckedIndexedAccess` — `array[i]` y `obj[key]` juran que
nunca son `undefined`, y esta regla, creyéndoles, acusaría guards necesarios.
Por eso va de la mano de `skapxd/requires-strict-tsconfig`, que exige ese
flag: primero el tsconfig dice la verdad, después esta regla opina.

Bajo el capó es `@typescript-eslint/no-unnecessary-condition`
([doc original](https://typescript-eslint.io/rules/no-unnecessary-condition/))
**re-registrada bajo nuestro namespace**: mismo motor y mismas opciones, pero
con un nombre que dice lo que defiende (axioma A1: los estados imposibles son
irrepresentables — es la generalización type-aware de
`no-runtime-state-guard`) y mensajes en español que explican el fix en vez
del críptico "Unnecessary conditional". Los presets tipados activan este
nombre y **no** el original: una sola fuente de verdad para configurarla,
silenciarla o buscarla.

### `skapxd/no-explicit-any`

Prohíbe `any`. No es una regla de estilo: `any` apaga el sistema de tipos en
todo lo que toca — el esfuerzo de modelar estados imposibles muere donde
aparece uno, y se propaga en silencio a cada valor derivado. El mensaje
enseña la salida: `unknown` para lo genuinamente desconocido (obliga a
estrechar antes de usar — la duda queda declarada y verificada), el tipo
real para lo que tiene forma conocida.

Bajo el capó es `@typescript-eslint/no-explicit-any`
([doc original](https://typescript-eslint.io/rules/no-explicit-any/))
re-registrada bajo nuestro namespace con mensajes que enseñan (ver
`skapxd/no-impossible-branch` para el patrón). Los presets tipados activan
este nombre, no el original.

### `skapxd/no-floating-promises`

Una llamada async **sin** `await` no produce `AwaitExpression` — es el punto
ciego de `await-requires-result`: el rechazo muere sin pasar por `trySafe`,
sin trace y sin que nadie lo decidiera (medido al absorberla: 12 promesas
flotantes vivas en un backend en producción).

Esta regla existía en typescript-eslint
([doc original](https://typescript-eslint.io/rules/no-floating-promises/)),
pero su mensaje recomendaba *"end with a call to `.catch`, or end with a
call to `.then` with a rejection handler"* — **dos caminos que
`no-promise-chain` prohíbe**. Obedecer a una regla te estrellaba con la
otra. El wrapper corrige el consejo para este sistema: las dos salidas
legales son `await` (y ahí entra el pipeline de Result) o `void promesa()`
— el fire-and-forget declarado y greppeable del axioma A5 (así se escribe
el `bootstrap()` del `main.ts` de Nest: `void bootstrap();`).

### `skapxd/no-non-null-assertion`

Prohíbe el `!` (non-null assertion): es "cállate, yo sé más que tú" dicho al
compilador — y un `!` equivocado es un crash en runtime que el tipo juraba
imposible. Si el valor de verdad no puede ser nulo, que lo diga el tipo
(modela mejor, o estrecha con un guard que el compilador verifique); si
puede serlo, el `!` no resuelve la duda: la esconde.

La excepción legítima vive en los tests: el `!` sobre un fixture cuya
existencia el propio test garantiza es el arrange, no una mentira — por eso
`nest/tests` la apaga en specs. Bajo el capó es
`@typescript-eslint/no-non-null-assertion`
([doc original](https://typescript-eslint.io/rules/no-non-null-assertion/))
re-registrada con mensajes propios.

### `skapxd/no-silenced-compiler`

No silencies al compilador: `@ts-ignore` y `@ts-nocheck` apagan la alarma en
vez de arreglar el incendio. Si el compilador es el muro de contención del
sistema, nadie lo apaga cuando el modelado se pone difícil — un error de
tipos se resuelve modelando mejor el dominio.

La puerta que queda abierta, a propósito: `@ts-expect-error` **con
descripción**. Es la forma legítima de testear que un estado inválido de
verdad NO compila (la otra mitad son los tests de tipos con `expectTypeOf`,
ver la sección de `requires-strict-tsconfig`) — y a diferencia de
`@ts-ignore`, avisa cuando la supresión deja de hacer falta. Bajo el capó es
`@typescript-eslint/ban-ts-comment`
([doc original](https://typescript-eslint.io/rules/ban-ts-comment/)) con un
nombre que dice lo que defiende y mensajes propios.

### `skapxd/prefer-type-over-interface`

Usa `type`, no `interface`. Las uniones discriminadas — la columna vertebral
del modelado de estados de este paquete — son types, y la homogeneidad
elimina la pregunta "¿esto puede crecer por declaration merging?": un `type`
no puede ser extendido en silencio desde otro archivo; lo que declara es
todo lo que hay.

Bajo el capó es `@typescript-eslint/consistent-type-definitions`
([doc original](https://typescript-eslint.io/rules/consistent-type-definitions/))
re-registrada con un nombre que declara la opinión (como los demás
`prefer-*`). Ojo si la activas suelta: el default upstream prefiere
`interface` — los presets la pasan como `["error", "type"]`.

### `skapxd/no-functions-inside-components`

Prohíbe definir funciones **con peso propio** dentro de un componente React
(una función con nombre PascalCase): handlers con nombre, helpers, callbacks de
`useEffect`. Cada render las recrea, dispara re-renders en hijos memoizados y
mezcla lógica con composición.

```tsx
function Card() {
  const onClick = () => save();          // ❌ handler con nombre en el cuerpo
  useEffect(() => subscribe(), []);      // ❌ callback dentro del componente
  return (
    <ul>
      {items.map((i) => <Li key={i} />)}            {/* ✅ React idiomático */}
      <button onClick={() => save()}>Guardar</button> {/* ✅ React idiomático */}
    </ul>
  );
}
```

Los dos patrones idiomáticos de React están **permitidos por defecto**: el
callback anónimo como valor directo de una prop JSX y el callback anónimo de
`.map(...)` en el render. Forzarlos a salir del componente produce workarounds
peores que el problema (`.bind(null, ...)`, adapters artificiales).

El cuerpo del componente queda como composición declarativa; **toda** función
—handlers, efectos, memos, mapeos— vive fuera:

```tsx
const onClick = () => save();            // ✅ helper fuera del componente

function useCardItems() {                // ✅ lógica en un hook
  return useMemo(() => buildItems(), []);
}

function Card() {
  const items = useCardItems();
  return <ul>{items}</ul>;
}
```

"Componente" se detecta por nombre PascalCase, así que un hook (`useX`) o un
helper en minúscula **sí** pueden tener funciones dentro — ahí es donde se mueve
la lógica.

**Opciones.** Las exenciones aplican solo a **flechas de expresión** (sin
cuerpo `{ }`) en esa posición exacta: el valor directo de una prop JSX, o el
primer argumento de `.map(...)`. La distinción importa: una flecha de expresión
solo puede contener una expresión — es declarativa por construcción —, mientras
que un bloque da pie a `if`s, variables y llamadas que pertenecen fuera:

```tsx
{items.map((i) => <li key={i} />)}              // ✅ flecha de expresión
{items.map((i) => { return <li key={i} />; })}  // ❌ bloque: invita a meter lógica
```

Un handler con nombre en el cuerpo (`const onClick = () => ...`), un callback
de `useEffect` o un `.forEach` siguen reportándose. Para el modo ultraestricto
(ninguna función inline, como en v0.6.0 y anteriores), apágalas explícitamente:

```js
"skapxd/no-functions-inside-components": ["error", {
  allowJsxCallbacks: false,       // también reporta onClick={() => ...}
  allowArrayMapCallbacks: false,  // también reporta items.map((i) => ...)
}]
```

### `skapxd/no-try-catch`

Prohíbe `try/catch`. La intención es que los errores se modelen como `Result` en
vez de saltar como excepciones invisibles en el tipo.

```ts
const result = await trySafe(() => client.execute(query)); // ✅
if (!result.ok) return Result.err({ cause: result.error, type: "DB_FAILED" });
```

Se complementa con `result-error-requires-cause` (preservar la causa) y con
`await-requires-result` (obligatoria en los presets tipados: cada `await`
resuelve en un `Result`).

### `skapxd/no-promise-chain`

Prohíbe encadenar `.then()`, `.catch()` y `.finally()` sobre promesas. La única
forma de tratar funciones asíncronas es `await` (envuelto en `trySafe`), para que
el control de flujo y los errores sean explícitos y secuenciales.

```ts
fetchData().then(handle).catch(report); // ❌
const result = await trySafe(() => fetchData()); // ✅
```

Es **type-aware**: solo marca el `.then/.catch/.finally` cuando el receptor es
una promesa real (un objeto cualquiera con un método `.catch` no se toca). Sin
`projectService` cae a verificación por nombre. La opción `methods` ajusta qué
métodos se prohíben (por defecto los tres):

```js
// solo prohibir .catch, permitir .then/.finally
"skapxd/no-promise-chain": ["error", { methods: ["catch"] }]
```

### `skapxd/prefer-tagged-union-state`

La regla temática del paquete: el estado inconsistente que motivó todo esto,
ahora prohibido en su origen. Detecta las dos formas de la enfermedad:

**Forma A — el tipo enfermo**: un flag boolean de "en proceso" conviviendo
con un campo de error como propiedades independientes. Las combinaciones
imposibles (cargando Y con error, error Y con valor) son *representables*:

```ts
// ❌ 2³ combinaciones; solo 3 tienen sentido
type RequestState = { isLoading: boolean; error?: Error; value?: Data };

// ✅ los estados imposibles no se pueden NI ESCRIBIR
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ok"; value: Data };
```

La forma A aplica **igual en el back**: la clase de un job con
`private isProcessing = false; private lastError?: Error` es la versión OOP
de la máquina repartida, y un schema de Mongoose con `@Prop() isSyncing` +
`@Prop() syncError` es la versión más grave — **la inconsistencia se
persiste en la base de datos**. La regla revisa tipos, interfaces y cuerpos
de clase por igual, con verbos de ambos mundos (`loading`, `submitting`,
`deploying`, `migrating`, `retrying`, ...).

**Forma B — la máquina repartida** (front): varios `useState` que en realidad
son una sola máquina de estados. Cada transición toca varios setters y los
renders intermedios ven combinaciones imposibles:

```ts
// ❌ tres setters para una transición: el render del medio ve mentiras
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [user, setUser] = useState<User | null>(null);

// ✅ UN estado, transición atómica, match() exhaustivo
const [state, setState] = useState<RequestState>({ status: "idle" });
```

**Forma C — la transición repartida (evidencia ESTRUCTURAL, sin depender de
nombres)**: los setters de `useState` se identifican por *posición en el
destructuring* (`const [x, setX] = useState()` — el segundo elemento, se
llame como se llame). Si una misma función llama a dos setters distintos,
eso **prueba** que esos estados son una sola máquina — entre setter y setter,
los renders intermedios ven mentiras:

```ts
const cargar = (respuesta, fallo) => {
  setDatos(respuesta);   // ❌ dos setters en una transición: una máquina
  setError(fallo);       //    repartida, aunque `datos` no se llame "loading"
};
```

Este detector caza lo que los nombres no ven (estados con nombres exóticos o
en español ya cubiertos: `cargando`, `procesando`, `fallo`, ...). El filtro
de precisión: al menos uno de los estados co-actualizados debe ser
loading/error-ish — resetear dos campos independientes de un formulario no
es una máquina.

Sobre la detección por nombres (formas A y B): es deliberadamente el
escalón más bajo de evidencia del paquete — para un tipo *declarado* no hay
comportamiento que observar y el nombre es la única señal disponible. El
**tipo del campo de error no importa** (`Error`, `string`, código numérico,
otro boolean — `isSyncing` + `hasError` es la peor forma): la enfermedad es
la coexistencia. Los **callbacks** quedan excluidos (`onError?: (e) => void`,
miembros de tipo función): un handler no es estado.
`loadingPatterns`/`errorPatterns` ajustan las convenciones. Cierra el círculo con el resto del paquete: la unión etiquetada
es a los estados lo que `Result` es a los errores, y `prefer-ts-pattern` te
espera con el `match().exhaustive()` al otro lado.

### `skapxd/prefer-ts-pattern`

Prohíbe `switch/case` y ternarios anidados, empujando hacia `match()` de
[`ts-pattern`](https://github.com/gvergnaud/ts-pattern), que da exhaustividad
verificada por el compilador.

```ts
// ❌ switch                          // ❌ ternario anidado
switch (status) { ... }              const label = a ? "x" : b ? "y" : "z";

// ✅
const label = match(status)
  .with("active", () => "x")
  .with("paused", () => "y")
  .exhaustive();
```

### `skapxd/prefer-abort-signal`

Dentro de un `useEffect`/`useLayoutEffect`, los listeners se limpian con
`AbortController`, no con `removeEventListener` manual:

```ts
// ❌ registro y limpieza espejados a mano
useEffect(() => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onSystemChange);
  return () => media.removeEventListener("change", onSystemChange);
}, [settings]);

// ✅ un AbortController por efecto
useEffect(() => {
  const controller = new AbortController();
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onSystemChange, { signal: controller.signal });
  return () => controller.abort();
}, [settings]);
```

Por qué: un solo `abort()` limpia **todos** los listeners del efecto (no hay
que espejar cada `add` con su `remove`), y elimina el bug clásico de pasar una
referencia distinta a `removeEventListener` (un `.bind()` o una arrow nueva)
que deja el listener vivo para siempre.

Reporta dos cosas dentro del callback del efecto (incluidas sus funciones
anidadas y el cleanup): `addEventListener` sin `signal` en las options, y
cualquier `removeEventListener`. Fuera de un efecto la regla no opina.

Cuando las options no son un objeto literal, la verificación resuelve en
capas:

1. **Por scope**: `addEventListener("x", fn, opts)` sigue `opts` hasta su
   `const opts = {...}` y lo inspecciona — sin necesitar type-checking.
2. **Por tipo** (con `projectService`): si no hay inicializador visible (un
   parámetro, un import), pregunta al checker si el **tipo** declara `signal`;
   si ni el tipo la tiene, es imposible que llegue y se reporta.
3. Sin inicializador ni tipos: beneficio de la duda.

El boolean de capture (`addEventListener("x", fn, true)`) se reporta siempre:
no puede traer `signal`.

`effectNames` permite cubrir wrappers propios (`["useEffect",
"useLayoutEffect", "useIsomorphicEffect"]`).

### `skapxd/package-requires-typed-exports`

El contrato de empaquetado de una librería TypeScript dual (ESM + CJS): cada
condición del mapa `exports` declara **sus propios tipos**, del sabor
correcto.

```jsonc
"exports": {
  ".": {
    "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
    "require": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
  }
}
```

El antipatrón que mata es el **"FalseCJS"** (el hallazgo #1 de
[arethetypeswrong](https://arethetypeswrong.github.io)): un `types` único por
subpath apuntando al `.d.ts` — los consumidores ESM con
`moduleResolution: node16` reciben tipos CJS y el contrato miente en la
frontera más pública que tiene una librería. tsup con `dts: true` ya genera
los dos sabores (`.d.mts` y `.d.ts`); esta regla verifica que el package.json
de verdad los cablee y que los archivos existan en disco. Anclada al
entrypoint (`src/index.ts` por defecto): un reporte por paquete.

Dogfood: esta regla nació reportando a este mismo repo — nuestros `exports`
tenían el bug y el lint no volvió a verde hasta corregirlos.

### `skapxd/untrusted-module-requires-adapter`

¿Qué pasa cuando los tipos de un paquete de terceros **mienten**? El clásico:
un paquete escrito en JS cuyos tipos viven aparte (`@types/...`) y van
desfasados del runtime real, o índices que juran nunca devolver `undefined`.
Todo el sistema de este paquete descansa en que el tipo dice la verdad
(`no-impossible-branch` le cree ciegamente) — un tipo mentiroso envenena cada
regla type-aware que lo toque.

El playbook, en orden:

1. **Armadura de tsconfig primero**: `noUncheckedIndexedAccess` corrige de
   raíz la clase más común de mentira (index signatures optimistas) sin
   tocar al tercero — `requires-strict-tsconfig` ya lo exige.
2. **Frontera anticorrupción** (lo que esta regla impone): declara el módulo
   como no confiable y enciérralo tras UN adaptador. El adaptador importa el
   paquete, re-declara los tipos honestos (lo que el runtime de verdad
   devuelve) y exporta esa versión. El resto del código importa el adaptador
   y razona con tipos veraces — la mentira queda en un archivo auditable.
3. **`@ts-expect-error` con descripción** dentro del adaptador si hace falta
   forzar la corrección — es la puerta que `no-silenced-compiler` deja
   abierta, declarada y con porqué.
4. **Arregla el upstream**: PR a DefinitelyTyped. Mientras llega, los pasos
   1-3 te protegen.

```js
"skapxd/untrusted-module-requires-adapter": ["error", {
  adapterFilePatterns: ["src/lib/xlsx-adapter.ts"],
  modules: ["xlsx"],
}]
```

Sin `modules` declarados la regla es inerte: el inventario de sospechosos es
una decisión del proyecto, no una adivinanza del linter (axioma A5).

### `skapxd/no-jsx-ternary-null`

Cuando renderizas JSX condicional y una rama del ternario es `null`, prefiere la
forma con `&&`:

```tsx
{isLoggedIn ? <Dashboard /> : null}   // ❌
{isLoggedIn && <Dashboard />}          // ✅
```

Solo aplica a JSX renderizado (hijos de un elemento/fragmento), no a atributos
—donde `&&` cambiaría la semántica—. Cuidado con el clásico gotcha de `&&`: un
valor `0` se renderiza en pantalla; con booleanos no hay problema.

## Supuestos y límites conocidos

Tres reglas se apoyan en **convenciones de React/JS** para identificar lo que
miran. No son fallos: son el contrato de la regla. Conviene conocerlos:

| Regla | Supuesto | Implicación |
| --- | --- | --- |
| `no-functions-inside-components` | "Componente" = función con nombre **PascalCase**. | Un componente en minúscula o anónimo no se detecta; una función PascalCase que *no* sea componente podría marcarse. |
| `jsx-return-name-pascal-case` | Detecta **JSX literal** en el cuerpo de la función. | Si devuelves JSX por indirección (`return render()`), no se detecta. |
| `max-hook-size` | "Hook" = nombre que empieza con **`use`**; el tamaño se mide en líneas. | Una función con lógica de hook pero sin prefijo `use` no se mide. |

Estos supuestos **se auto-refuerzan** con el resto del plugin: si nombras un
componente en minúscula, `jsx-return-name-pascal-case` te obliga a pasarlo a
PascalCase, y entonces `no-functions-inside-components` ya lo reconoce. Por eso no
perseguimos "robustez" más allá de la convención: las reglas que la imponen
cierran el hueco.

En cambio, las reglas atadas a `@skapxd/result`
(`async-functions-return-result`, `result-error-requires-cause`,
`await-requires-result`) **no** dependen de nombres: resuelven el símbolo hasta
el paquete real (vía el `name` de su `package.json`), así que funcionan con
alias, re-exports y en monorepos.

## Notas sobre reglas type-aware

Algunas reglas necesitan información real de TypeScript. Los presets que la
necesitan configuran:

```js
languageOptions: {
  parserOptions: {
    projectService: true,
  },
}
```

Esto hace el lint un poco más lento, pero reduce falsos positivos importantes:
por ejemplo, distinguir un `Result` real de `@skapxd/result` de otro objeto que
casualmente también tenga propiedades `ok` y `error`.

## Licencia

MIT
