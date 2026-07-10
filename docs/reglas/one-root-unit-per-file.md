### `skapxd/one-root-unit-per-file`

Limita cada archivo a una sola unidad de comportamiento declarada en la raíz: una clase o una función. Está registrada como **opt-in** mientras el issue #197 mide el impacto de sustituir `one-root-function-per-file` en los presets.

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

No tiene opciones ni autofix. No se activa junto a `one-root-function-per-file`: la decisión de sustitución, deprecación y SemVer depende de la medición de #197.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
