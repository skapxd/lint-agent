### `skapxd/dense-function-requires-comment`

Exige un comentario de bloque de motivación antes de una función exportada que combina tres señales de densidad: muchas líneas, muchos literales estáticos y muchas ramas. No convierte todas las funciones en JSDoc obligatorio; solo marca funciones donde el código puede estar correcto y aun así esconder el modelo mental.

La regla protege el punto ciego que dejan las reglas de nombres y tamaño: una función puede tener buen nombre, un archivo propio y código legible línea por línea, pero perder la intención cuando acumula decisiones estáticas. En ese caso el lector necesita una vista de alto nivel antes de entrar al detalle.

| Señal | Default | Qué cuenta |
| --- | --- | --- |
| Líneas | `30` | Líneas del nodo de función exportada. |
| Literales | `10` | Literales `string`, `number` y template literals dentro del subtree de la función. |
| Ramas | `5` | `IfStatement`, `ConditionalExpression` y `SwitchCase` dentro del subtree de la función. |

Las tres señales deben cruzar el umbral al mismo tiempo. Un config builder largo con muchos literales pero pocas ramas no dispara; una función ramificada pero corta tampoco. La densidad es combinada, no una excusa para comentar cualquier función.

```ts
// ❌ funcion exportada densa sin declarar su modelo mental
export function classifyCell(state: CellState) {
  if (state.selected) return "selected";
  if (state.error) return "error";
  if (state.formula) return "formula";
  // ...muchas ramas y literales mas
}
```

El comentario válido es un bloque inmediatamente anterior a la función (`/** ... */` o `/* ... */`). Un `//` de una línea no cuenta porque no escala bien para una explicación markdown-friendly. Además, el bloque debe tener estructura markdown mínima para que VSCode lo renderice como hover útil:

| Estructura | Qué exige |
| --- | --- |
| Header | Al menos una línea que empiece con uno a seis `#` y espacio. Usa niveles discretos como `###` o `####`. |
| Code fence | Al menos un par de fences markdown con tres backticks, para un ejemplo entrada→salida o pseudocódigo. |

````ts
// ✅ el bloque explica motivacion, prioridad y ejemplo antes del codigo denso
/**
 * Traduce el estado visual de una celda al modo auditoria: cursor, seleccion,
 * precedentes/dependientes y celdas neutras compiten por el color final.
 *
 * ### Prioridad
 * cursor -> seleccion -> relaciones directas -> relaciones profundas -> formula/ciclo/normal.
 *
 * ### Ejemplo
 * ```ts
 * getCellClass({ precedent: true }); // -> "precedent"
 * ```
 */
export function getCellClass(state: CellState) {
  // ...
}
````

La regla no exige `@param`, `@returns` ni tags JSDoc. Esto es motivación de diseño, no documentación de API: debe explicar qué problema resuelve la función en alto nivel, qué reglas o prioridades gobiernan el cuerpo si aplica, y un ejemplo entrada→salida o pseudocódigo. No debe narrar la implementación línea por línea.

La calidad semántica no se valida. ESLint solo comprueba que existe un bloque y que tiene header + code fence; si el comentario está vacío, redundante o desactualizado, eso falla en revisión humana.

Opciones:

```js
"skapxd/dense-function-requires-comment": [
  "error",
  {
    minLines: 30,
    minLiterals: 10,
    minBranches: 5,
    requireCodeFence: true,
    requireHeader: true,
    allowFilePatterns: ["src/generated/**"],
  },
],
```

| Preset | Estado |
| --- | --- |
| `shared.base` / `base-rules` | `error` |
| Presets que heredan `shared.base` | `error` |

| Axioma | Relación |
| --- | --- |
| A4 | La función densa conserva una unidad con nombre, pero necesita declarar el modelo mental para que la responsabilidad sea navegable. |
| A5 | La intención se declara; el lector no debe inferirla desde una lista larga de literales y ramas. |

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
