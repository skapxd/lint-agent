# Pipeline de Result y ts-pattern

[README principal](../README.md)

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
