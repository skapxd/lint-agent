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
- **Errores con `Result`:** una función `async` que puede fallar lo dice en su
  tipo de retorno (`Promise<Result<...>>`), no en una convención oral.
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

## Estructura del paquete

```text
src/
├── shared/
│   ├── rules.ts
│   ├── configs/
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

### Frontend

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.frontend,
  },
  // Capa de servicios: todo await debe ir envuelto en trySafe.
  skapxd.configs.shared.frontendServices,
];
```

Por defecto `frontendServices` aplica a `**/services/**` y `**/api/**`. Si tus
servicios viven en otra carpeta, sobreescribe `files`:

```js
export default [
  {
    ...skapxd.configs.shared.frontendServices,
    files: ["src/data/**/*.{ts,tsx}"],
  },
];
```

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

## Reglas

| Regla | Qué protege |
| --- | --- |
| `skapxd/one-root-function-per-file` | Un archivo, una función top-level semántica. |
| `skapxd/async-functions-return-result` | Funciones async de dominio deben retornar `Promise<Result<...>>`. |
| `skapxd/result-error-requires-cause` | Un `Result.err` derivado debe preservar `cause: result.error`. |
| `skapxd/await-requires-try-safe` | Los `await` deben estar protegidos por `trySafe`. La activa el preset `shared.frontendServices` en la capa de servicios. |
| `skapxd/no-ad-hoc-ok-result` | Evita contratos `{ ok: ... }` hechos a mano en async exports. |
| `skapxd/max-hook-size` | Marca hooks grandes o con demasiados `useState`. |
| `skapxd/jsx-return-name-pascal-case` | Funciones que retornan JSX deben nombrarse como componentes. |
| `skapxd/no-deep-relative-imports` | Limita la profundidad de los imports relativos (`../`). |
| `skapxd/no-functions-inside-components` | Prohíbe definir funciones dentro de componentes React. |
| `skapxd/no-try-catch` | Prohíbe `try/catch`; usa `trySafe` de `@skapxd/result`. |
| `skapxd/no-promise-chain` | Prohíbe `.then/.catch/.finally`; usa `await` (+ `trySafe`). |
| `skapxd/prefer-ts-pattern` | Prohíbe `switch` y ternarios anidados; usa `match()` de ts-pattern. |
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

> Requiere `projectService` (los presets `backend` y `next/server` ya lo activan).
> Sin información de tipos cae a una comprobación por nombre (`resultTypeNames`),
> menos estricta.

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

Esta regla es type-aware. Usa TypeScript parser services para confirmar que el
valor del guard y `Result.err` vienen de `@skapxd/result`. Por eso funciona con
aliases, re-exports y tipos inferidos, sin depender solo del nombre importado en
el archivo.

### `skapxd/await-requires-try-safe`

> Es la regla más agresiva del paquete (marca *todos* los `await` sin proteger),
> así que solo la activa el preset `shared.frontendServices`, acotada a la capa
> de servicios (`**/services/**`, `**/api/**`). Para activarla en otros globs,
> añádela tú mismo:
>
> ```js
> rules: {
>   "skapxd/await-requires-try-safe": ["error", {
>     trySafeCallNames: ["trySafe"],
>     allowFilePatterns: [],
>   }],
> }
> ```

Obliga a proteger operaciones `await` con `trySafe`:

```ts
const result = await trySafe(() => client.execute({...}));
```

o dentro de un callback:

```ts
const result = await trySafe(async () => {
  const response = await fetch(url);
  return response.json();
});
```

Si lo que se awaitea ya retorna `Result`/`Promise<Result<...>>` de
`@skapxd/result`, la regla no exige `trySafe`: los errores ya están modelados en
el tipo y envolverlo sería redundante.

```ts
declare function getUser(): Promise<Result<User, Error>>;

const result = await getUser(); // ✅ ya es un Result, no necesita trySafe
```

Esta exención es type-aware: un `Result` casero (que no venga de
`@skapxd/result`) no exime.

### `skapxd/max-hook-size`

Marca hooks que crecen demasiado o acumulan muchos `useState`.

La intención es empujar el diseño hacia `useReducer`, hooks más pequeños o
módulos de transición de estado.

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
  "skapxd/no-deep-relative-imports": ["warn", { maxDepth: 1 }],
}
```

Revisa imports estáticos (`import`), re-exports (`export ... from`) e imports
dinámicos (`import(...)`). El remedio habitual es un alias de ruta (`@/...`) o
acercar el módulo a quien lo usa.

### `skapxd/no-functions-inside-components`

Prohíbe **cualquier** función definida dentro de un componente React (una función
con nombre PascalCase). Cada render recrea esas funciones, lo que dispara
re-renders innecesarios en hijos memoizados y mezcla lógica con composición.

```tsx
function Card() {
  const onClick = () => save();          // ❌ se recrea en cada render
  useEffect(() => subscribe(), []);      // ❌ callback dentro del componente
  return <ul>{items.map((i) => <Li />)}</ul>; // ❌ callback de .map en el render
}
```

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

### `skapxd/no-try-catch`

Prohíbe `try/catch`. La intención es que los errores se modelen como `Result` en
vez de saltar como excepciones invisibles en el tipo.

```ts
const result = await trySafe(() => client.execute(query)); // ✅
if (!result.ok) return Result.err({ cause: result.error, type: "DB_FAILED" });
```

Se complementa con `result-error-requires-cause` (preservar la causa) y, si la
activas, con `await-requires-try-safe` (que además exige envolver cada `await`).

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
`await-requires-try-safe`) **no** dependen de nombres: resuelven el símbolo hasta
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
