### `skapxd/no-jsx-ternary-null`

Cuando renderizas JSX condicional y una rama del ternario es `null`, prefiere la forma con `&&`:

```tsx
{isLoggedIn ? <Dashboard /> : null}   // ❌
{isLoggedIn && <Dashboard />}          // ✅
```

Solo aplica a JSX renderizado (hijos de un elemento/fragmento), no a atributos —donde `&&` cambiaría la semántica—. Cuidado con el clásico gotcha de `&&`: un valor `0` se renderiza en pantalla; con booleanos no hay problema.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
