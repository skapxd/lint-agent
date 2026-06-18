### `skapxd/trysafe-only-at-boundary`

`trySafe` es la frontera donde una excepción de runtime o paquete se convierte en `Result`. Si `trySafe(() => X())` envuelve una llamada a código del proyecto, la captura quedó una capa demasiado arriba: el `Result` debería nacer dentro de la función que toca el driver, SDK, filesystem o runtime, y viajar hacia las capas de dominio sin re-envolverse.

```ts
// Use-case: captura tarde, sobre código nuestro.
const result = await trySafe(() => this.repository.upsert(input)); // ❌
```

```ts
// Repository: la frontera toca el driver y devuelve Result.
async upsert(input: Input): Promise<Result<Entity | null>> {
  return trySafe(() => this.model.findOneAndUpdate({ id: input.id }, input).exec());
}

// Use-case: consume el contrato directo.
const result = await this.repository.upsert(input); // ✅
```

La regla marca solo el caso claro: un `trySafe` real de `@skapxd/result` cuyo callback retorna una única llamada y cuyo callee resuelve, con información de tipos, a declaraciones del proyecto. Se abstiene si no hay type-info, si el callback orquesta varias operaciones, si el callee es `any`, si no puede resolver símbolos o si las declaraciones mezclan origen interno y externo.

No marca llamadas directas a runtime o paquetes:

```ts
trySafe(() => readFile(path, "utf8")); // ✅ frontera real
trySafe(() => this.model.findOneAndUpdate(query, update).exec()); // ✅ driver externo
```

También permite tests por defecto (`*.spec.ts`, `*.test.ts`, `__tests__`, e2e), porque los specs usan `trySafe` libremente sobre helpers del proyecto sin representar deuda de capas.

La regla nace opt-in y fuera de presets. Tras `result@2.0.0`, el no-op silencioso que motivaba el caso más fuerte ya está resuelto: `trySafe` await-ea thenables y no solo `instanceof Promise`. Lo que queda es disciplina arquitectónica con falsos positivos reales (orquestación legítima o captura puntual de dominio), así que no se activa como `error` global hasta medirla y decidir su promoción.

```js
export default [
  {
    rules: {
      "skapxd/trysafe-only-at-boundary": "error",
    },
  },
];
```

No tiene autofix. Mover la captura a la frontera correcta exige cambiar firmas, propagación de `Result` y manejo de error en la capa consumidora.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
