### `skapxd/one-root-unit-per-file`

Limita cada archivo a una sola unidad de comportamiento declarada en la raíz: una clase o una función. Está activa como `error` en `shared/base-rules` y todos los presets la heredan; sustituye allí a `one-root-function-per-file` para no duplicar diagnósticos.

Reporta una sola vez sobre la segunda unidad y evita duplicar diagnósticos entre firmas overload y su implementación:

```ts
export class SignalParser {}

export function parseSignal() {} // ❌ dos unidades raíz
```

Si la función solo sirve a la clase, debe convertirse en método privado. Si es independiente o reutilizable, debe moverse a un archivo con nombre semántico:

```ts
export class SignalParser {
  private parseSignal() {} // ✅ una unidad raíz
}
```

También acepta una única función, una única clase, un conjunto de overloads del mismo nombre y datos declarativos junto a la unidad. Ignora tipos, interfaces, enums, namespaces, callbacks, funciones anidadas, métodos y object bags.

No tiene opciones ni autofix. `one-root-function-per-file` permanece exportada para configuraciones explícitas, pero no se activa junto a esta regla en ningún preset.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
