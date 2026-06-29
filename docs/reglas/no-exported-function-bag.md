### `skapxd/no-exported-function-bag`

Prohíbe exportar un objeto literal que publique dos o más funciones. Eso no es un objeto inocente: es una clase o namespace disfrazado, con varios entrypoints públicos detrás de un solo nombre exportado.

```ts
// ❌ bolsa de funciones exportada
export const relatedRender = {
  renderBranches() {},
  renderUnresolved() {},
};

// ✅ una capacidad pública por módulo
export function renderBranches() {}
```

La regla cubre `export const x = { ... }`, `export default { ... }`, `const x = { ... }; export { x };` y aliases como `export { x as publicName };`. Cuenta methods (`a() {}`), arrows (`a: () => {}`), function expressions (`a: function a() {}`) y funciones dentro de spreads locales resolubles (`const shared = { a() {} }; export const x = { ...shared, b() {} };`).

No cuenta getters/setters, datos, objetos plugin/config con referencias (`{ configs, rules }`), una sola función pública ni re-exports desde otro módulo (`export { x } from "./x"`). Un spread importado o no resoluble tampoco se inventa: si la regla no puede demostrar el shape por AST local, no reporta.

Sin autofix. Separar una bolsa de funciones exige decidir nombres semánticos, mover imports, partir estado compartido y actualizar consumidores; un fix mecánico fabricaría archivos nominales y arquitectura peor.

**Opciones.** `allowFilePatterns` permite declarar deuda legacy por glob. No existe `allowObjectNames`: permitir nombres concretos sería el bypass que esta regla intenta cerrar.

**Presets.** Activa como `error` en `shared`/`base-rules`; la heredan `base`, `backend`, `frontend`, `package` y las bases de `nest`, `next` y `astro`. Es agnóstica al framework: decide por AST local y exportaciones, no por convenciones de nombres ni por tipos.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
