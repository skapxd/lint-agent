### `skapxd/prefer-node-protocol-for-builtins`

Obliga a importar módulos nativos de Node con el protocolo explícito `node:`. El import deja de parecer un paquete npm y declara que la dependencia viene del runtime:

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
const crypto = require("node:crypto");
```

La regla reporta las formas sin protocolo y las corrige de forma mecánica:

```ts
import { readFile } from "fs/promises";
export { join } from "path";
const crypto = require("crypto");
const stream = await import("stream");
```

El autofix antepone `node:` y conserva subpaths como `fs/promises`, `stream/web` o `timers/promises`. Solo se corrigen literales string; imports dinámicos con variable o template quedan fuera porque no hay specifier exacto que reescribir.

La detección no usa una lista congelada. Pregunta al runtime que está ejecutando ESLint con `node:module.isBuiltin("node:" + specifier)`, pero solo después de comprobar que el specifier es bare. Cualquier specifier con protocolo (`node:`, `bun:`, `npm:`, `jsr:`, `http:`) se ignora por completo; por eso `bun:sqlite` no se convierte accidentalmente en `node:bun:sqlite`.

Esto separa `node:crypto` de paquetes externos como `crypto-js`, `fs-extra` o `path-to-regexp`, y evita que un paquete instalado con el mismo nombre opaque visualmente al builtin en review. En Deno además es una compatibilidad real: los builtins de Node se importan con `node:`.

Caveat: la fuente de verdad es el Node que ejecuta ESLint, no necesariamente el Node target del proyecto. Si lintas con un Node más viejo que tu runtime de producción, un builtin recién agregado puede no reportarse. La regla degrada limpio si `isBuiltin` no está disponible en el runtime host: no reporta y no rompe el lint.

`node:` no instala `@types/node`, no configura tu `tsconfig` y no convierte un archivo browser en código server. Si TypeScript no resuelve `node:fs`, el fix correcto es declarar bien los tipos o mover esa dependencia de plataforma, no quitar el protocolo.

Opciones:

```js
"skapxd/prefer-node-protocol-for-builtins": [
  "error",
  {
    allowFilePatterns: ["scripts/legacy/**"],
  },
],
```

Está activa como `error` en las reglas base y, por lo tanto, en los presets que las heredan.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
