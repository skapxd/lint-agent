### `skapxd/untrusted-module-requires-adapter`

¿Qué pasa cuando los tipos de un paquete de terceros **mienten**? El clásico:
un paquete escrito en JS cuyos tipos viven aparte (`@types/...`) y van
desfasados del runtime real, o índices que juran nunca devolver `undefined`.
Todo el sistema de este paquete descansa en que el tipo dice la verdad
(`no-impossible-branch` le cree ciegamente) — un tipo mentiroso envenena cada
regla type-aware que lo toque.

El playbook, en orden:

1. **Armadura de tsconfig primero**: `noUncheckedIndexedAccess` corrige de
   raíz la clase más común de mentira (index signatures optimistas) sin
   tocar al tercero — `requires-strict-tsconfig` ya lo exige.
2. **Frontera anticorrupción** (lo que esta regla impone): declara el módulo
   como no confiable y enciérralo tras UN adaptador. El adaptador importa el
   paquete, re-declara los tipos honestos (lo que el runtime de verdad
   devuelve) y exporta esa versión. El resto del código importa el adaptador
   y razona con tipos veraces — la mentira queda en un archivo auditable.
3. **`@ts-expect-error` con descripción** dentro del adaptador si hace falta
   forzar la corrección — es la puerta que `no-silenced-compiler` deja
   abierta, declarada y con porqué.
4. **Arregla el upstream**: PR a DefinitelyTyped. Mientras llega, los pasos
   1-3 te protegen.

```js
"skapxd/untrusted-module-requires-adapter": ["error", {
  adapterFilePatterns: ["src/lib/xlsx-adapter.ts"],
  modules: ["xlsx"],
}]
```

Sin `modules` declarados la regla es inerte: el inventario de sospechosos es
una decisión del proyecto, no una adivinanza del linter (axioma A5).

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
