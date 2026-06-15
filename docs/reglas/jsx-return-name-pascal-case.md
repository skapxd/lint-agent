### `skapxd/jsx-return-name-pascal-case`

Si una función devuelve JSX, es un componente, y debe llamarse como tal: PascalCase. El mensaje sugiere el rename concreto.

```tsx
function renderUserCard(user: User) {  // ❌ "render*" devuelve JSX → es un componente
  return <article>{user.name}</article>;
}

function UserCard({ user }: { user: User }) {  // ✅ nombre de componente + props
  return <article>{user.name}</article>;
}
```

Esta regla es la que mantiene honesto al resto del sistema React: las reglas de componentes detectan "componente" por nombre PascalCase, así que una función `renderX` que devuelve JSX escaparía de ellas. Esta la captura y fuerza el rename — y con el nombre corregido, las demás ya la ven.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
