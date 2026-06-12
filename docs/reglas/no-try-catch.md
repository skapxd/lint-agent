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

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
