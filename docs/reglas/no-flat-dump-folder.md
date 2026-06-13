### `skapxd/no-flat-dump-folder`

Evita que una carpeta cajón de sastre (`utils/`, `helpers/`, `lib/`,
`common/`, `misc/`) vuelva a acumular archivos sueltos. La regla aplica A4 al
nivel carpeta: el árbol debe contar qué dominio vive ahí, no esconderlo detrás
de un nombre genérico.

Falla cuando un archivo `.ts`/`.tsx` vive directamente dentro de una carpeta
cuyo nombre está en `dumpFolderNames` y la cantidad de archivos sueltos supera
`maxLooseFiles` (default `0`). `index.ts` queda exento porque es el contrato de
la carpeta, no otro util suelto.

```text
src/utils/get-user.ts          # falla: utils/ no afirma dominio
src/utils/result/get-user.ts   # ok: vive en result/
src/rules/no-foo.ts            # ok: rules/ es una familia homogénea
```

El disparo es barato y por nombre, pero el mensaje mira contenido: imports,
literales de tipos de nodo AST e identificadores dominantes. Con eso compara el
archivo contra las firmas de los subdominios existentes y sugiere el destino
cuando hay evidencia suficiente. Si el archivo es mudo (`export {}` o una
transformación mínima sin señales fuertes), no inventa: lista los dominios
existentes y pide elegir por nombre.

No tiene autofix. Elegir el dominio correcto es criterio arquitectónico; mover
automáticamente a `misc2/` solo recrearía el cajón dentro del cajón.

Opciones:

```ts
{
  dumpFolderNames: ["utils", "helpers", "lib", "common", "misc"],
  maxLooseFiles: 0,
  allowFilePatterns: [],
}
```

La V1 solo reporta cajones de sastre por nombre. La detección V2 de archivos
mal ubicados por contenido queda como medición separada: útil si reproduce el
ground truth manual con poco ruido, pero no forma parte de esta regla.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
