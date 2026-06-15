### `skapxd/filename-matches-root-function`

[Indice de reglas](./README.md) · [README principal](../../README.md)

El archivo debe llamarse como la versión kebab de su función raíz exportada: `kebab(exportRaiz) === basename(archivo)`. A4 no se cumple solo con funciones pequeñas: el árbol también debe leerse como un índice. Si ves `get-node-ts.ts`, sabes que el export raíz será `getNodeTS` o una forma equivalente normalizada a kebab; si importas `createUser`, sabes buscar `create-user.ts`.

La regla se apoya en dos premisas ya activas en las bases: `one-root-function-per-file` deja un único candidato semántico y `no-default-export` hace que el nombre público sea el named export. Por eso no intenta resolver módulos arbitrarios ni defaults: busca la función raíz exportada que `one-root-function-per-file` ya considera raíz y compara su nombre público con el stem del archivo.

La comparación es estricta del lado del archivo: `filenameSinExtension` debe ser kebab. No se normaliza `Card.tsx` a `card`; un componente React vive en `card.tsx` y exporta `Card`. El export sí se normaliza con `to-kebab-case`, que cubre acrónimos sin mantener una lista manual: `getNodeTS` y `getNodeTs` comparan contra `get-node-ts`.

Exenciones:

- `index.ts` y barrels: nombran la carpeta, no una función raíz.
- Módulos sin función raíz exportada: constantes, tipos, interfaces o inventarios no tienen candidato que comparar.
- `allowFilePatterns`: globs para deuda o convenciones externas que no deben bloquear adopción.

No tiene autofix. Renombrar el archivo o renombrar el export cambia imports y API pública; esa decisión pertenece al humano que entiende el módulo.

```ts
// get-node.ts
export const getNode = () => {}; // OK

// get-node-ts.ts
export const getNodeTS = () => {}; // OK

// card.tsx
export function Card() {
  return <div />;
} // OK

// get-node.ts
export const fetchNode = () => {}; // ERROR: el archivo esperado es fetch-node.ts
```
