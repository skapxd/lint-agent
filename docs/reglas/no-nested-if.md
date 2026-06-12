### `skapxd/no-nested-if`

Prohíbe un `if` dentro de otro `if` (en la misma función). Cada nivel de
anidación suma carga cognitiva para quien lee — y además crea puntos ciegos
para las demás reglas: un `Result.err` dentro de un if anidado quedaba fuera
del alcance de `result-error-requires-cause`. Esta regla elimina la categoría
completa de evasión en vez de parchear cada caso.

```ts
// ❌ anidado: el lector mantiene dos condiciones en la cabeza
if (!response.ok) {
  if (shouldReport) {
    return Result.err({ cause: response.error, message: "...", type: "X" });
  }
}

// ✅ retorno anticipado: una condición a la vez, camino feliz sin sangría
if (!response.ok && shouldReport) {
  return Result.err({ cause: response.error, message: "...", type: "X" });
}

// ✅ o match() si son variantes de un mismo valor
```

No cuenta como anidación: la cadena `else if` (es secuencia, no anidación), y
una función definida dentro del `if` (unidad cognitiva aparte). El propio
código de este plugin se aplanó con retorno anticipado al activar la regla —
cinco casos, todos quedaron más legibles.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
