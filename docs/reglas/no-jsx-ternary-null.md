### `skapxd/no-jsx-ternary-null`

Cuando renderizas JSX condicional y una rama del ternario **renderiza nada** (`null` o `undefined`), prefiere la forma con `&&`:

```tsx
{isLoggedIn ? <Dashboard /> : null}   // ❌
{isLoggedIn && <Dashboard />}          // ✅
```

Solo aplica a JSX renderizado (hijos de un elemento/fragmento), no a atributos —donde `&&` cambiaría la semántica—. Cuidado con el clásico gotcha de `&&`: un valor `0` se renderiza en pantalla; con booleanos no hay problema.

**Dos salidas, según qué esconde la condición.** El mensaje no promueve solo `&&`:

- Si `condicion` es un **booleano genuino**, basta con `&&`.
- Si `condicion` **esconde un estado** de una unión (`loading`/`success`/`error`), el ternario-con-null ignora los demás estados **en silencio** y un estado nuevo se renderiza como nada. Consúmelo con `match(estado).with(...).exhaustive()` de **ts-pattern** (la misma salida de [`prefer-ts-pattern`](./prefer-ts-pattern.md)): `.exhaustive()` obliga a cubrir cada variante.

```tsx
{state.status === "ok" ? <Data value={state.value} /> : null}   // ❌ ignora loading/error
match(state)
  .with({ status: "loading" }, () => <Spinner />)
  .with({ status: "error" }, ({ error }) => <Err error={error} />)
  .with({ status: "ok" }, ({ value }) => <Data value={value} />)
  .exhaustive()                                                   // ✅
```

**Detección: `null` y `undefined` (nullish completo).** La regla marca cualquier rama que renderice nada — el literal `null` **o** el identificador `undefined` —, no solo `null`. Ambos pintan lo mismo en JSX y esconden el mismo bug de estado silenciado; el contrato no cambia (mismo `messageId`), solo se cubren más casos. Si en un proyecto la rama `undefined` generara ruido, se puede acotar a `null` desde el helper `rendersNothing` de la regla, pero la decisión por defecto es cubrir el nullish completo.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
