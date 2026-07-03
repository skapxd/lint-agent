### `skapxd/no-local-function-bag`

Prohíbe declarar un objeto local de módulo que defina dos o más funciones inline. Eso no es encapsulación limpia: es un namespace privado disfrazado que esconde varias capacidades detrás de un identificador y evita que el árbol de archivos cuente la historia.

```ts
// ❌ bolsa local de funciones
const cli = {
  parseOptions() {},
  getTargetPath() {},
  writeOrPrint() {},
};

// ✅ funciones semánticas directas
function parseOptions() {}

export function getTargetPath() {
  return parseOptions();
}
```

Cuenta methods (`a() {}`), arrows (`a: () => {}`), function expressions (`a: function a() {}`) y funciones dentro de spreads locales resolubles (`const shared = { a() {} }; const parser = { ...shared, b() {} };`).

No cuenta getters/setters, datos, objetos plugin/config con referencias (`{ configs, rules }`, `{ build: buildCommand }`), una sola función local ni objetos exportados que ya gobierna `no-exported-function-bag`. Un spread importado o no resoluble tampoco se inventa: si la regla no puede demostrar el shape por AST local, no reporta.

Sin autofix. Separar una bolsa local exige elegir nombres semánticos, reemplazar llamadas `objeto.metodo()` por llamadas directas, mover imports si se parten módulos y decidir qué estado compartido era real. Un fix mecánico fabricaría arquitectura nominal.

**Opciones.** `allowFilePatterns` permite declarar deuda legacy por glob. No existe `allowObjectNames`: permitir nombres concretos como `cli`, `helpers`, `api` o `actions` sería el bypass que esta regla intenta cerrar.

**Presets.** Activa como `error` en `shared`/`base-rules`; la heredan `base`, `backend`, `frontend`, `package` y las bases de `nest`, `next` y `astro`. Es agnóstica al framework y AST-only: no intenta probar estado compartido, flujo ni aliasing.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
