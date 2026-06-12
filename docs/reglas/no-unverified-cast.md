### `skapxd/no-unverified-cast`

Prohibe casts `as` que estrechan sin evidencia. Un `as Config`, `as User` o
`as unknown as FunctionNode` afirma un tipo que nadie verifico; despues, las
reglas type-aware razonan sobre esa mentira como si fuera verdad.

```ts
const config = JSON.parse(raw) as Config; // afirma sin verificar
const node = current as unknown as FunctionNode; // misma mentira, lavada
```

Las salidas aceptadas tienen evidencia:

```ts
function isConfig(value: unknown): value is Config {
  return typeof value === "object" && value !== null && "rules" in value;
}

const parsed: unknown = JSON.parse(raw);
if (!isConfig(parsed)) return Result.err({ message: "config invalida" });
```

Tambien sirven validacion en la frontera (zod, valibot, class-validator; en
Nest, `nest-dto-requires-validation` ya exige esa premisa) o modelar mejor el
tipo de origen para que el cast sobre. Ensanchar (`sub as Base`) y `as const`
no afirman una forma nueva sin comprobarla, asi que pasan.

Bajo el capo es `@typescript-eslint/no-unsafe-type-assertion`
([doc original](https://typescript-eslint.io/rules/no-unsafe-type-assertion/))
re-registrada con mensajes propios. Nace registrada y documentada; su entrada
en presets tipados queda para el gate de medicion del cluster #14/#16/#17.

Lo que NO cubre:

- Tipos declarados a mano que mienten sobre un runtime externo. Defensa de
  proceso: leer la fuente real, usar `expectTypeOf`/tests de contrato y mover
  la mentira a un adaptador auditable si no hay tipos confiables.
- Type predicates mentirosos. TypeScript verifica la firma `x is T`, no prueba
  que el cuerpo demuestre `T`. Defensa de proceso: predicates con chequeos
  reales, tests negativos y tratar `no-impossible-branch` como detector de
  humo cuando un guard empieza a parecer imposible.

Puedes eximir archivos frontera con `allowFilePatterns` mientras la frontera
se mantiene local, nombrada y auditada:

```js
"skapxd/no-unverified-cast": [
  "error",
  { allowFilePatterns: ["src/adapters/**"] },
],
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
