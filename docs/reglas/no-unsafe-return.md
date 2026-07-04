### `skapxd/no-unsafe-return`

Impide retornar `any` desde una funcion tipada: el dato externo se estrecha antes de salir de la frontera. Wrapper de typescript-eslint.

Familia indivisible de wrappers sobre `@typescript-eslint/no-unsafe-*`: `no-unsafe-assignment`, `no-unsafe-member-access`, `no-unsafe-call`, `no-unsafe-return` y `no-unsafe-argument`. Cierra el hueco que `no-explicit-any` no puede ver: el `any` invisible que aparece sin escribir `any`, por ejemplo en `JSON.parse()` y `response.json()`.

```ts
async function getUser(): Promise<User> {
  const data = await response.json();

  return data; // ❌ retorna any invisible como User
}
```

La salida legal es declarar la frontera como desconocida y estrechar con evidencia runtime:

```ts
async function getUser(): Promise<User> {
  const data: unknown = await response.json();

  return UserSchema.parse(data); // ✅ retorna un User validado
}
```

El punto no es ordenar zod, valibot o class-validator como dependencia. El punto es cerrar las salidas ilegales hasta que un schema o un type predicate honesto sean el camino barato: `res.json()`/`JSON.parse()` producen `any`, `no-unsafe-*` impide tocarlo, `unknown` obliga a estrechar, y las reglas de ramificación/casts hacen caro fingir evidencia. En Nest, un `req.body` ya validado por DTO pertenece a otra frontera: la regla no pelea con `nest-dto-requires-validation`; depende de esa premisa.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
