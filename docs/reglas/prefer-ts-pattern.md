### `skapxd/prefer-ts-pattern`

Prohíbe `switch/case` y ternarios anidados, empujando hacia `match()` de [`ts-pattern`](https://github.com/gvergnaud/ts-pattern), que da exhaustividad verificada por el compilador.

```ts
// ❌ switch                          // ❌ ternario anidado
switch (status) { ... }              const label = a ? "x" : b ? "y" : "z";

// ✅
const label = match(status)
  .with("active", () => "x")
  .with("paused", () => "y")
  .exhaustive();
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
