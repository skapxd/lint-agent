### `skapxd/no-functions-inside-components`

Prohíbe definir funciones **con peso propio** dentro de un componente React
(una función con nombre PascalCase): handlers con nombre, helpers, callbacks de
`useEffect`. Cada render las recrea, dispara re-renders en hijos memoizados y
mezcla lógica con composición.

```tsx
function Card() {
  const onClick = () => save();          // ❌ handler con nombre en el cuerpo
  useEffect(() => subscribe(), []);      // ❌ callback dentro del componente
  return (
    <ul>
      {items.map((i) => <Li key={i} />)}            {/* ✅ React idiomático */}
      <button onClick={() => save()}>Guardar</button> {/* ✅ React idiomático */}
    </ul>
  );
}
```

Los dos patrones idiomáticos de React están **permitidos por defecto**: el
callback anónimo como valor directo de una prop JSX y el callback anónimo de
`.map(...)` en el render. Forzarlos a salir del componente produce workarounds
peores que el problema (`.bind(null, ...)`, adapters artificiales).

El cuerpo del componente queda como composición declarativa; **toda** función
—handlers, efectos, memos, mapeos— vive fuera:

```tsx
const onClick = () => save();            // ✅ helper fuera del componente

function useCardItems() {                // ✅ lógica en un hook
  return useMemo(() => buildItems(), []);
}

function Card() {
  const items = useCardItems();
  return <ul>{items}</ul>;
}
```

"Componente" se detecta por nombre PascalCase, así que un hook (`useX`) o un
helper en minúscula **sí** pueden tener funciones dentro — ahí es donde se mueve
la lógica.

**Opciones.** Las exenciones aplican solo a **flechas de expresión** (sin
cuerpo `{ }`) en esa posición exacta: el valor directo de una prop JSX, o el
primer argumento de `.map(...)`. La distinción importa: una flecha de expresión
solo puede contener una expresión — es declarativa por construcción —, mientras
que un bloque da pie a `if`s, variables y llamadas que pertenecen fuera:

```tsx
{items.map((i) => <li key={i} />)}              // ✅ flecha de expresión
{items.map((i) => { return <li key={i} />; })}  // ❌ bloque: invita a meter lógica
```

Un handler con nombre en el cuerpo (`const onClick = () => ...`), un callback
de `useEffect` o un `.forEach` siguen reportándose. Para el modo ultraestricto
(ninguna función inline, como en v0.6.0 y anteriores), apágalas explícitamente:

```js
"skapxd/no-functions-inside-components": ["error", {
  allowJsxCallbacks: false,       // también reporta onClick={() => ...}
  allowArrayMapCallbacks: false,  // también reporta items.map((i) => ...)
}]
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
