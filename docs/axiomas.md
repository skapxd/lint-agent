# Axiomas y motivacion

[README principal](../README.md)

# Lint Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Reglas de ESLint para que los agentes no negocien la arquitectura de tu proyecto.**

A diferencia de un prompt o una nota en el README (que el agente puede priorizar, reinterpretar o ignorar), Lint Agent convierte tus opiniones de arquitectura en guardrails que se **ejecutan** y **fallan** cuando el código no respeta la forma del proyecto — lo haya escrito una persona, Claude, Codex, Cursor o Copilot. El paquete npm se publica como `@skapxd/lint-agent`.

- **Una función por archivo:** un archivo con cinco helpers escondidos no pasa; la regla hasta te dibuja la carpeta sugerida con formato `tree`.
- **Errores con `Result`:** ningún `await` queda fuera del sistema de errores: o llamas una función que retorna `Promise<Result<...>>`, o envuelves la operación en `trySafe`, o awaiteas otro `@UseCase` de `@skapxd/nest` que ya tradujo el `Result` de capa baja a DTO/excepción. Nada lanza sin que la capa lo declare.
- **Causa preservada:** al transformar un error de dominio, el `cause` original no puede desaparecer — type-aware, vía el checker de TypeScript.
- **Hooks acotados:** un hook con demasiado estado deja de pasar como "solo un hook largo" y empuja hacia `useReducer` o módulos más pequeños.

```bash
pnpm eslint
pnpm eslint src/server/payment-gateway.ts
pnpm eslint --max-warnings=0
```

La regla no depende de la intención del autor. Se ejecuta y decide.

## 🤔 ¿Por qué existe este paquete?

Necesitaba una forma **verificable** de decirle a un agente cómo quiero que escriba código en mis proyectos.

Un proyecto *es* su arquitectura. No solo lo que hace, sino su forma: archivos pequeños, nombres que revelan intención, errores modelados, una causa que sobrevive cuando algo falla. Si esa forma se erosiona, lo que queda es código que compila, pasa los tests y aun así ya nadie puede navegar, depurar ni seguir modificando — ni una persona, ni el siguiente agente.

Y la experiencia se repetía siempre igual: la regla quedaba clarísima en la conversación, pero no en el resultado final. El agente entendía la intención general y en el detalle dejaba pequeñas desviaciones:

- un helper que se quedaba en el mismo archivo "porque era pequeño";
- una función `async` que retornaba `Promise<number>` aunque podía fallar;
- un hook que seguía creciendo porque "todavía funcionaba";
- un error técnico capturado por `trySafe` que se perdía al mapearlo a un error de negocio.

Nada de eso rompe la app hoy. **Ese es exactamente el problema.** Son daños pequeños de arquitectura: pasan desapercibidos, se acumulan y después hacen que el proyecto sea más difícil de navegar, depurar y seguir modificando con agentes — justo cuando ya no recuerdas por qué cada cosa estaba donde estaba.

Un prompt ayuda, pero un prompt no es una barrera. El mismo prompt lo interpreta distinto cada agente, cada modelo, e incluso el mismo modelo en momentos distintos. Puede darle más peso a una instrucción que a otra, priorizar que el test pase y dejar lo arquitectónico "suficientemente bien".

Por eso este paquete mueve esa presión fuera del prompt: si la arquitectura importa, tiene que ser ejecutable. La idea no es pedirle mejor al agente que recuerde tus reglas. La idea es que el proyecto tenga una opinión que se pueda verificar después de cada cambio.

## Qué intenta proteger

El objetivo no es "código bonito". El objetivo es que un proyecto siga siendo navegable, depurable y corregible por agentes.

Quiero abrir un proyecto y que `tree` cuente una historia útil: archivos pequeños, nombres semánticos y carpetas que revelan intención.

Quiero que una función de dominio que puede fallar lo diga en su tipo de retorno, no en una convención oral.

Quiero que si un error se transforma, la causa original siga ahí, porque debuggear un mensaje genérico sin `cause` es perder el contexto justo cuando más se necesita.

Quiero que un hook con demasiados estados deje de pasar silenciosamente como "solo un hook largo" y empiece a empujar hacia `useReducer`, hooks más pequeños o módulos de transición explícitos.

Quiero que un agente pueda generar código, pero que el proyecto le conteste:

> "Esto compila, pero no se escribe así aquí."

Eso es lo que estas reglas intentan proteger.

## Los axiomas

Las reglas no son una colección de gustos: se derivan de ocho axiomas. Si una regla nueva no es consecuencia de alguno, no entra. Si dos reglas chocan, gana la que defiende el axioma más fundamental (el orden es jerárquico).

| # | Axioma | Reglas que lo ejecutan |
| --- | --- | --- |
| A1 | **Los estados imposibles son irrepresentables.** El tipo modela exactamente los estados válidos; lo inválido no compila. | `prefer-tagged-union-state`, `no-runtime-state-guard`, `requires-strict-tsconfig`, `no-impossible-branch`, `no-explicit-any`, `no-unsafe-*`, `prefer-type-over-interface` |
| A2 | **Ningún efecto es invisible al tipo.** Si una operación puede fallar, su firma lo confiesa — no una convención oral ni un `throw` sorpresa. | `await-requires-result`, `no-try-catch`, `no-promise-chain`, `no-ad-hoc-ok-result`, `no-floating-promises`, `no-unsafe-*` |
| A3 | **La información no se destruye.** Un error que se transforma conserva su `cause`; uno que se detecta llega a alguien. Nadie decide "esto no importa" en silencio. | `result-error-requires-cause`, `result-error-requires-handling` |
| A4 | **Una unidad, una responsabilidad, un nombre semántico.** El árbol de archivos cuenta una historia; una clase expone una intención. | `one-root-function-per-file`, `one-root-unit-per-file`, `filename-matches-root-function`, `max-class-size`, `max-public-methods`, `no-exported-function-bag`, `no-default-export`, `jsx-return-name-pascal-case`, `max-hook-size`, `no-magic-numbers`, `dense-function-requires-comment` |
| A5 | **Las decisiones se declaran, no se interpretan.** Cada rama es explícita y exhaustiva; un caso ignorado es una decisión visible, no un hueco. | `no-else`, `no-nested-if`, `prefer-ts-pattern`, `no-silenced-compiler`, `dense-function-requires-comment`, el `void promesa()` de `no-floating-promises` |
| A6 | **Evidencia sobre convención.** Una regla decide por lo que el type-checker o los imports demuestran, no por cómo se llama un archivo o un campo. | la implementación type-aware de las reglas de Result, `nest-no-direct-instantiation` (@Injectable resuelto por símbolo), la exención ORM por decorador de `class-properties-require-readonly` |
| A7 | **Las fronteras son explícitas y únicas.** Lo que cruza una capa lo hace por un contrato, una sola vez, sin túneles. | `no-deep-relative-imports`, `no-internal-module-imports`, `no-tunnel-props`, `nest-no-result-response`, `nest-no-swagger-in-controllers`, `nest-no-inline-query-params` |
| A8 | **Inmutable por defecto.** La mutación es la excepción que se pide con evidencia, no el estado natural de las cosas. | `class-properties-require-readonly`, `no-accessors` |

A6 es distinto a los demás: no produce reglas, produce **cómo se implementan** todas. Por eso las reglas de este paquete prefieren parser services y provenance de imports antes que globs de nombres — el nombre es la evidencia más débil que aceptamos, y solo como último recurso.

## Por qué las alternativas no bastan

### ESLint core

ESLint core puede limitar líneas, complejidad o cantidad de statements. Eso es útil, pero demasiado genérico.

No entiende una regla como:

> "Este archivo tiene 15 funciones en la raíz. Convierte el archivo en una
> carpeta, deja `index.ts`, mueve cada helper a un archivo semántico y muestra la
> estructura sugerida con caracteres tipo `tree`."

Tampoco sabe que `src/app/api/foo/route.ts` en Next.js no puede convertirse en `src/app/api/foo/route/index.ts`.

### `typescript-eslint`

`typescript-eslint` es excelente para reglas de TypeScript, y este paquete lo usa como base. Pero sus reglas no imponen contratos de dominio como:

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

Lint Agent usa parser services y el TypeScript checker para aplicar esas reglas sobre tipos reales, no solo sobre nombres de imports.

### Plugins de React, Next.js y Astro

Los plugins de framework protegen invariantes del framework: hooks, rendering, rutas, convenciones del compilador, etc.

Eso es necesario, pero no responde preguntas de arquitectura del proyecto:

- ¿este hook ya es demasiado grande?
- ¿este archivo debería ser una carpeta?
- ¿este helper debe quedarse junto al entrypoint de Next?
- ¿este error de negocio preserva el error técnico que lo causó?

Lint Agent los complementa. No los reemplaza.

### Reglas genéricas de complejidad

`max-lines-per-function`, `complexity` y `max-statements` son reglas útiles, pero son reglas ciegas al dominio.

Un hook con 14 `useState` no solo es "largo": probablemente está modelando transiciones de estado que deberían vivir en un reducer o en módulos separados. Por eso `skapxd/max-hook-size` mira específicamente hooks y cantidad de estado propio.

### Codemods, grep y herramientas de búsqueda

Un codemod puede mover archivos. `rg` puede encontrar patrones. Pero esas herramientas no mantienen la restricción viva en el editor, CI y `lint`.

Son útiles para arreglar. No son suficientes para gobernar.

### Prompts e instrucciones para agentes

Los prompts son necesarios. Sin contexto, un agente no tiene cómo saber qué quieres. Pero el prompt es una instrucción, no una garantía.

El mismo prompt lo interpreta distinto cada agente, cada modelo, e incluso el mismo modelo en momentos distintos. Además, cuando una tarea tiene muchas restricciones, el agente puede resolver lo funcional y fallar en lo arquitectónico.

Este paquete mueve esa presión fuera del prompt: la regla se ejecuta después y puede fallar con un mensaje concreto.

### Optimización de precisión y contexto para LLMs (La ventaja de la fragmentación y el rol del LSP)

Los agentes de IA sufren frecuentemente de **imprecisión de edición** (generación de parches / diffs) cuando trabajan sobre archivos monolíticos: confunden bloques de código similares, pierden la indentación y generan alucinaciones sintácticas.

Al fragmentar el código al extremo mediante reglas como `skapxd/one-root-unit-per-file` (manteniendo un promedio de ~20-50 líneas por archivo):
1. **Edición trivial e infalible:** La modificación se vuelve sumamente simple. Reescribir o parchar un archivo pequeño tiene un riesgo de error sintáctico cercano a cero y un costo insignificante en tokens.
2. **Foco en el contexto (Señal/Ruido):** El agente solo carga en su ventana de contexto el archivo específico de interés, eliminando el ruido de cientos de líneas de código irrelevante que podrían desviar la atención del LLM.

Esta fragmentación extrema es viable y sostenible porque asume que el agente opera en un entorno dotado de un **Language Server Protocol (LSP)** (como `tsserver` o `vtsls`). El LSP proporciona la brújula determinista del agente (ejecutando operaciones como *Go to Definition* o *Rename Symbol*), lo que le permite localizar y refactorizar el código de manera segura y precisa en un árbol de archivos hiper-modularizado.

### Comparación rápida

| Herramienta | Estilo/sintaxis | Type-aware | Framework-aware | Arquitectura de archivos | Result/cause | Guardrail CLI/CI |
| --- | --- | --- | --- | --- | --- | --- |
| ESLint core | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `typescript-eslint` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| React/Next/Astro plugins | ✅ | Parcial | ✅ | Parcial | ❌ | ✅ |
| `max-lines` / `complexity` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Codemods / search | ❌ | Parcial | Parcial | ✅ | Parcial | ❌ |
| Prompt/instrucciones para agentes | ❌ | ❌ | Parcial | Parcial | Parcial | ❌ |
| **Lint Agent** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

### En resumen

Lint Agent existe para cubrir un hueco que ninguna de las anteriores cubre por sí sola: que un proyecto pueda **opinar de forma verificable** sobre cómo un agente escribe código — su forma de archivos, sus contratos de error, su manera de no perder la causa — y no solo sobre su estilo o su sintaxis.

No busca ser un style guide universal. Es una capa de guardrails ejecutables para proyectos que prefieren muchos archivos pequeños, nombres semánticos, errores modelados con `Result` y estructuras que se entienden desde el árbol del proyecto.

Las reglas no viven en el prompt, donde el agente puede ignorarlas. Viven en un comando que puede fallar y decir exactamente qué se rompió.
