### `skapxd/prefer-schema-validation`

Detecta validadores artesanales: cuerpos de función con muchas comprobaciones estructurales (`typeof x.y`, `"k" in x`, `Array.isArray(x.z)`, `x.hasOwnProperty(...)`) sobre el mismo valor raíz declarado como `unknown` o `any`.

```ts
function validateUser(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  if (!("name" in data)) return false;
  if (typeof (data as Record<string, unknown>).name !== "string") return false;
  if (!Array.isArray((data as Record<string, unknown>).roles)) return false; // ❌ schema artesanal

  return true;
}
```

Ese código ya es un schema, pero escrito rama por rama: sin errores por campo, sin composición y fácil de desincronizar del tipo que dice proteger. Decláralo en la frontera:

```ts
const UserSchema = z.object({ // ✅ schema declarado en la frontera
  name: z.string(),
  roles: z.array(z.string()),
});

const user = UserSchema.parse(data);
```

La regla agrupa por identidad del símbolo raíz: checks sobre `data`, `data.user` y `data.roles` cuentan juntos para `data`. El tipo raíz se toma del símbolo declarado, no del narrowing puntual dentro de una rama; por eso el primer `typeof data === "object"` no oculta los checks siguientes. El umbral por defecto es `maxStructuralChecks: 4`; un type predicate corto y honesto sigue siendo legal.

Checks sobre valores ya tipados no cuentan. Validar un `TSESTree.Node`, `UserInput` o una unión discriminada puede ser narrowing normal: el crimen que esta regla nombra es convertir una frontera desconocida en formulario manual.

Relación con #16: `no-unverified-cast` cierra el cast que finge evidencia. Esta regla viene después: una vez que el valor externo sigue siendo `unknown` hasta validarse, detecta cuándo esa validación se volvió schema artesanal. Nadie valida lo que ya convirtió en `any` o en `User` con una afirmación sin prueba.

| Frontera | Herramienta preferida |
| --- | --- |
| `fetch`/JSON externo | zod o valibot (`Schema.parse(data)`) |
| HTTP Nest | DTO con class-validator/class-transformer |
| Variables de entorno | Config validada al arrancar |
| Predicate local y pequeño | Type predicate con checks reales |

Opciones:

```js
"skapxd/prefer-schema-validation": [
  "error",
  {
    allowFilePatterns: ["src/legacy/**"],
    maxStructuralChecks: 4,
  },
],
```

Esta activa como `error` en los presets tipados. El autofix no existe porque traducir una forma manual a schema es diseño, no una transformación mecánica.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
