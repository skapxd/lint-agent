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

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
