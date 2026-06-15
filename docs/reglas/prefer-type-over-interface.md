### `skapxd/prefer-type-over-interface`

Usa `type`, no `interface`. Las uniones discriminadas — la columna vertebral del modelado de estados de este paquete — son types, y la homogeneidad elimina la pregunta "¿esto puede crecer por declaration merging?": un `type` no puede ser extendido en silencio desde otro archivo; lo que declara es todo lo que hay.

Bajo el capó es `@typescript-eslint/consistent-type-definitions` ([doc original](https://typescript-eslint.io/rules/consistent-type-definitions/)) re-registrada con un nombre que declara la opinión (como los demás `prefer-*`). Ojo si la activas suelta: el default upstream prefiere `interface` — los presets la pasan como `["error", "type"]`.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
