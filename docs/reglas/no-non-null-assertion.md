### `skapxd/no-non-null-assertion`

Prohíbe el `!` (non-null assertion): es "cállate, yo sé más que tú" dicho al compilador — y un `!` equivocado es un crash en runtime que el tipo juraba imposible. Si el valor de verdad no puede ser nulo, que lo diga el tipo (modela mejor, o estrecha con un guard que el compilador verifique); si puede serlo, el `!` no resuelve la duda: la esconde.

```ts
type User = { name?: string };
declare const user: User;

// ❌ el ! niega la duda y puede explotar si name no existe.
const displayName = user.name!.toUpperCase();
```

```ts
type User = { name?: string };
declare const user: User;

// ✅ la ausencia se maneja en vez de negarse.
const displayName = user.name?.toUpperCase() ?? "Usuario sin nombre";
```

La excepción legítima vive en los tests: el `!` sobre un fixture cuya existencia el propio test garantiza es el arrange, no una mentira — por eso `nest/tests` la apaga en specs. Bajo el capó es `@typescript-eslint/no-non-null-assertion` ([doc original](https://typescript-eslint.io/rules/no-non-null-assertion/)) re-registrada con mensajes propios.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
