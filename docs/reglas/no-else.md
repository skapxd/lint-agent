### `skapxd/no-else`

El `if` maneja una condición *nombrada*; el `else` maneja "todo lo demás" — un complemento anónimo cuyo significado el lector deduce negando la condición. Es el último rincón donde un camino vive sin etiqueta, y donde la no-exhaustividad se esconde: una cadena `if/else if/else` sobre flags maneja 2 de 4 combinaciones y deja el resto cayendo en un cajón que nadie auditó.

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

Las salidas: **retorno anticipado** para flujo, **ternario simple** para decisiones de valor (los anidados ya los prohíbe `prefer-ts-pattern`), y **`match().exhaustive()`** para variantes. La única fricción real — dos ramas de efectos en medio de una función — se resuelve extrayendo la función que `one-root-function-per-file` ya pedía. Complementa a `no-nested-if` (profundidad) y a `prefer-tagged-union-state` (este ataca la *declaración* del estado sin nombre; `no-else` ataca su *consumo*).

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
