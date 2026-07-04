### `skapxd/no-internal-module-imports`

Una carpeta con `index.ts`/`index.js` que reexporta archivos relativos declara una API publica. Desde fuera de esa carpeta no se importan archivos internos: el consumidor habla con el indice o el simbolo no es realmente publico.

```ts
// src/modules/users/index.ts
export { findUser } from "./user-repository";

// src/app/report.ts
import { findUser } from "@/modules/users/user-repository"; // ❌ bypass del index
```

La salida legal pasa por la API publica del modulo:

```ts
import { findUser } from "@/modules/users"; // ✅ contrato publico declarado
```

La regla resuelve imports relativos y aliases `#/`/`@/` contra `src/` por defecto. Si el import no resuelve a un archivo real, no reporta: paquetes externos, aliases desconocidos o paths generados quedan fuera en vez de inventar certeza. Un import desde dentro del mismo modulo tambien pasa, porque el `index.ts` necesita reexportar sus piezas internas.

Un `index.ts` que declara una ruta o codigo propio sin reexports relativos no cuenta como frontera. Esto evita tratar convenciones de framework (`src/pages/**/index.ts`) como barrels arquitectonicos.

Los submodulos pueden publicar su propia API: si `src/modules/users/events/index.ts` existe, `@/modules/users/events` es una entrada publica valida; lo prohibido es `@/modules/users/events/publisher` desde fuera de `events`.

Opciones:

```js
"skapxd/no-internal-module-imports": [
  "error",
  {
    aliasPrefixes: ["#/", "@/"],
    allowFilePatterns: ["scripts/legacy/**"],
    indexFileNames: ["index.ts", "index.tsx", "index.js", "index.jsx"],
    sourceRoot: "src",
  },
],
```

Esta activa como `error` en las reglas base. No tiene autofix: decidir que reexportar en el indice es una decision de API publica, no una reescritura mecanica segura.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
