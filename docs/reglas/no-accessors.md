### `skapxd/no-accessors`

Prohíbe `get`/`set` en clases y objetos literales. Un accessor es un método con sintaxis de propiedad: esconde computación tras un acceso que parece inocente (`config.token` que en realidad ejecuta código), y abre la puerta al **método disfrazado** — un `get sendMessage() { return (...) => ... }` que escapaba de `max-public-methods`:

```ts
class Connection {
  get socket() { return this.current; }   // ❌ computación disfrazada de propiedad
  socket() { return this.current; }       // ✅ el call site dice la verdad: socket()
}
```

Si algo es un dato, es una propiedad `readonly`; si algo es comportamiento, es un método explícito que cuenta en la superficie pública. No hay tercera categoría.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
