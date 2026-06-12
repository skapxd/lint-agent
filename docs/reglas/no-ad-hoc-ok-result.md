### `skapxd/no-ad-hoc-ok-result`

Prohíbe que una función async **exportada** retorne objetos literales con la
forma `{ ok: ... }` armados a mano. Un contrato casero fragmenta el sistema:
cada módulo inventa su variante, la exención type-aware de
`await-requires-result` no lo reconoce, y `match()` pierde la exhaustividad.

```ts
export async function getUser(id: string) {
  return { ok: false, message: "falló" };          // ❌ contrato inventado
}

export async function getUser(id: string): Promise<Result<User, UserError>> {
  return Result.err({                               // ✅ el Result real
    cause: error,
    message: "No pude cargar el usuario.",
    type: "USER_FETCH_FAILED",
  });
}
```

Solo mira funciones async exportadas: un helper interno con un objeto `ok`
cualquiera no es un contrato público y no se reporta.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
