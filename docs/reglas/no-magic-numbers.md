### `skapxd/no-magic-numbers`

Prohíbe números mágicos: un literal numérico significativo sin nombre. A4 exige que una unidad con responsabilidad propia tenga nombre semántico; un timeout, límite, porcentaje, tamaño de lote o factor de negocio no puede quedar crudo dentro de una expresión porque nadie sabe qué representa ni dónde cambiarlo con seguridad.

```ts
setTimeout(fn, 3000);                // ❌ ¿3000 qué significa?

const FEEDBACK_MS = 3000;
setTimeout(fn, FEEDBACK_MS);         // ✅ el valor tiene nombre de dominio
```

Bajo el capó es `@typescript-eslint/no-magic-numbers` ([doc original](https://typescript-eslint.io/rules/no-magic-numbers/)) re-registrada bajo nuestro namespace con mensaje playbook. No hay motor propio: el valor está en calibrar el ruido y enseñar el arreglo.

La config de los presets base es:

```js
"skapxd/no-magic-numbers": ["error", {
  ignore: [-1, 0, 1, 2],
  ignoreArrayIndexes: true,
  ignoreEnums: true,
  ignoreReadonlyClassProperties: true,
  ignoreDefaultValues: true,
  enforceConst: true,
}]
```

Se eximen los idiomáticos que no cargan intención de dominio por sí solos: `-1`, `0`, `1`, `2`, índices de array, miembros de enum, propiedades readonly de clase y valores por defecto. Eso conserva expresiones normales como `i += 1`, `items[0]` o `enum Status { Draft = 1 }` y concentra la regla en valores con significado real. Si el número sí explica un límite o política, aunque sea pequeño, el nombre sigue siendo responsabilidad de revisión humana.

Está activa como `error` en `shared`/`base-rules`; la heredan todos los presets compartidos. No necesita información de tipos.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
