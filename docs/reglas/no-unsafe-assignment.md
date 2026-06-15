### `skapxd/no-unsafe-assignment`

Impide asignar un `any` invisible a variables o propiedades: la frontera debe declararse `unknown` y validarse. Wrapper de typescript-eslint.

Familia indivisible de wrappers sobre `@typescript-eslint/no-unsafe-*`: `no-unsafe-assignment`, `no-unsafe-member-access`, `no-unsafe-call`, `no-unsafe-return` y `no-unsafe-argument`. Cierra el hueco que `no-explicit-any` no puede ver: el `any` invisible que aparece sin escribir `any`, por ejemplo en `JSON.parse()` y `response.json()`.

```ts
const data = await response.json();
console.log(data.user.name); // any invisible propagado
return data;
```

La salida legal es declarar la frontera como desconocida y estrechar con evidencia runtime:

```ts
const data: unknown = await response.json();
const user = UserSchema.parse(data);
console.log(user.name);
```

El punto no es ordenar zod, valibot o class-validator como dependencia. El punto es cerrar las salidas ilegales hasta que un schema o un type predicate honesto sean el camino barato: `res.json()`/`JSON.parse()` producen `any`, `no-unsafe-*` impide tocarlo, `unknown` obliga a estrechar, y las reglas de ramificación/casts hacen caro fingir evidencia. En Nest, un `req.body` ya validado por DTO pertenece a otra frontera: la regla no pelea con `nest-dto-requires-validation`; depende de esa premisa.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
