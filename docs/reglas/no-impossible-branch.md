### `skapxd/no-impossible-branch`

La rama imposible: una condición que el type-checker demuestra constante. Si
el tipo dice que un valor siempre es truthy, ese `if` no decide nada; si un
`?.` cuelga de algo que nunca es nullish, finge una duda que el modelo ya
resolvió. La pregunta ya tiene respuesta — y un `if` que no pregunta es
código muerto disfrazado de prudencia.

```ts
const sheet = workbook.Sheets[name]; // tipo: WorkSheet (¿seguro?)
if (!sheet) continue; // ❌ "always falsy"... ¿o el tipo miente?
```

El mensaje de error enseña la lección completa: **si la comprobación hace
falta en runtime, lo que está mal es el tipo**. El caso clásico es el acceso
por índice sin `noUncheckedIndexedAccess` — `array[i]` y `obj[key]` juran que
nunca son `undefined`, y esta regla, creyéndoles, acusaría guards necesarios.
Por eso va de la mano de `skapxd/requires-strict-tsconfig`, que exige ese
flag: primero el tsconfig dice la verdad, después esta regla opina.

Bajo el capó es `@typescript-eslint/no-unnecessary-condition`
([doc original](https://typescript-eslint.io/rules/no-unnecessary-condition/))
**re-registrada bajo nuestro namespace**: mismo motor y mismas opciones, pero
con un nombre que dice lo que defiende (axioma A1: los estados imposibles son
irrepresentables — es la generalización type-aware de
`no-runtime-state-guard`) y mensajes en español que explican el fix en vez
del críptico "Unnecessary conditional". Los presets tipados activan este
nombre y **no** el original: una sola fuente de verdad para configurarla,
silenciarla o buscarla.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
