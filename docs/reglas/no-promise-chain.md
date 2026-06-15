### `skapxd/no-promise-chain`

Prohíbe encadenar `.then()`, `.catch()` y `.finally()` sobre promesas. La única forma de tratar funciones asíncronas es `await` (envuelto en `trySafe`), para que el control de flujo y los errores sean explícitos y secuenciales.

```ts
fetchData().then(handle).catch(report); // ❌
const result = await trySafe(() => fetchData()); // ✅
```

Es **type-aware**: solo marca el `.then/.catch/.finally` cuando el receptor es una promesa real (un objeto cualquiera con un método `.catch` no se toca). Sin `projectService` cae a verificación por nombre. La opción `methods` ajusta qué métodos se prohíben (por defecto los tres):

```js
// solo prohibir .catch, permitir .then/.finally
"skapxd/no-promise-chain": ["error", { methods: ["catch"] }]
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
