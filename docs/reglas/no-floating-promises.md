### `skapxd/no-floating-promises`

Una llamada async **sin** `await` no produce `AwaitExpression` — es el punto ciego de `await-requires-result`: el rechazo muere sin pasar por `trySafe`, sin trace y sin que nadie lo decidiera (medido al absorberla: 12 promesas flotantes vivas en un backend en producción).

Esta regla existía en typescript-eslint ([doc original](https://typescript-eslint.io/rules/no-floating-promises/)), pero su mensaje recomendaba *"end with a call to `.catch`, or end with a call to `.then` with a rejection handler"* — **dos caminos que `no-promise-chain` prohíbe**. Obedecer a una regla te estrellaba con la otra. El wrapper corrige el consejo para este sistema: las dos salidas legales son `await` (y ahí entra el pipeline de Result) o `void promesa()` — el fire-and-forget declarado y greppeable del axioma A5 (así se escribe el `bootstrap()` del `main.ts` de Nest: `void bootstrap();`).

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
