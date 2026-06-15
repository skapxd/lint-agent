### `skapxd/no-deep-relative-imports`

Limita cuántos niveles puede subir un import relativo. Por defecto **prohíbe cualquier `../`**: un import que sube a una carpeta padre suele ser señal de que falta un alias de ruta o de que el módulo está mal ubicado.

```ts
import { x } from "./sibling";   // ✅ mismo nivel
import { y } from "../shared/y"; // ❌ sube a una carpeta padre
import { z } from "#/shared/y";  // ✅ alias de ruta
```

Opción `maxDepth` (por defecto `0`) para permitir hasta N niveles de `../`:

```js
rules: {
  // permite ../ (un nivel) pero sigue prohibiendo ../../
  "skapxd/no-deep-relative-imports": ["error", { maxDepth: 1 }],
}
```

Revisa imports estáticos (`import`), re-exports (`export ... from`) e imports dinámicos (`import(...)`). El remedio habitual es un alias de ruta (`@/...`) o acercar el módulo a quien lo usa.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
