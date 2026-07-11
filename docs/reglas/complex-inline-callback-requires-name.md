### `skapxd/complex-inline-callback-requires-name`

Exige extraer a una función con nombre semántico los callbacks inline que acumulan al menos dos decisiones propias. El contrato aplica a funciones entregadas directamente como argumento de cualquier llamada o constructor; no clasifica APIs por nombres como `filter`, `useEffect`, `transaction` o `Promise`.

```ts
// ❌ la llamada esconde una política de dos decisiones
const relevantItems = items.filter(
  (item) => item.active || item.visible || item.pinned,
);
```

```ts
// ✅ el nombre declara la intención y la llamada lee como prosa
const isRelevantItem = (item: Item) =>
  item.active || item.visible || item.pinned;

const relevantItems = items.filter(isRelevantItem);
```

Cuenta cada `IfStatement`, ternario, `LogicalExpression` (`&&`, `||`, `??`), `SwitchCase` distinto de `default`, loop, `CatchClause` y asignación lógica (`&&=`, `||=`, `??=`). Una cadena `a || b || c` contiene dos nodos lógicos y, por tanto, dos decisiones.

La caminata se detiene al entrar en otra función: las decisiones de un callback anidado no inflan el conteo exterior y cada callback inline se evalúa por separado. Un callback con cero o una decisión permanece permitido.

No reporta referencias a funciones extraídas, funciones almacenadas antes de entregarlas, propiedades de objeto, campos de clase, atributos JSX, IIFEs ni funciones complejas que no son argumentos directos. Una `FunctionExpression` inline sigue fallando aunque tenga nombre interno: la llamada todavía recibe la implementación en vez de una referencia semántica.

No hay autofix. Extraer puede perder inferencia contextual o alterar `this`, `arguments`, recursión y capturas. Conserva la forma arrow/`function` y las capturas en el scope válido más cercano; dentro de componentes respeta `no-functions-inside-components`, y una nueva unidad top-level debe respetar `one-root-unit-per-file`.

La V1 es AST-only y no cubre wrappers transparentes de TypeScript como `as` o `satisfies`.

| Preset | Estado |
| --- | --- |
| `shared.base` / `base-rules` | Opt-in mientras #201 espera la decisión del dueño posterior a la medición. |
| Presets que heredan `shared.base` | Opt-in. |

| Axioma | Relación |
| --- | --- |
| A4 | Una política con varias decisiones recibe una unidad y un nombre semántico. |
| A5 | La intención compuesta se declara en la llamada; el lector no la reconstruye dentro de un callback anónimo. |
| A6 | La detección usa posición y tipos AST, nunca nombres de APIs o frameworks. |

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
