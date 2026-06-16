### `skapxd/prefer-type-over-interface`

Usa `type`, no `interface`. Las uniones discriminadas — la columna vertebral del modelado de estados de este paquete — son types, y la homogeneidad elimina la pregunta "¿esto puede crecer por declaration merging?": un `type` no puede ser extendido en silencio desde otro archivo; lo que declara es todo lo que hay.

```ts
// ❌ interface deja abierta la puerta a declaration merging accidental.
interface UserState {
  status: "idle" | "loading";
}
```

```ts
// ✅ type cierra la forma declarada y permite uniones discriminadas.
type UserState = { status: "idle" } | { status: "loading" };
```

Bajo el capó es `@typescript-eslint/consistent-type-definitions` ([doc original](https://typescript-eslint.io/rules/consistent-type-definitions/)) re-registrada con un nombre que declara la opinión (como los demás `prefer-*`). Ojo si la activas suelta: el default upstream prefiere `interface` — los presets la pasan como `["error", "type"]`.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
