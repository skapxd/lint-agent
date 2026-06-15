### `skapxd/no-explicit-any`

Prohíbe `any`. No es una regla de estilo: `any` apaga el sistema de tipos en todo lo que toca — el esfuerzo de modelar estados imposibles muere donde aparece uno, y se propaga en silencio a cada valor derivado. El mensaje enseña la salida: `unknown` para lo genuinamente desconocido (obliga a estrechar antes de usar — la duda queda declarada y verificada), el tipo real para lo que tiene forma conocida.

Bajo el capó es `@typescript-eslint/no-explicit-any` ([doc original](https://typescript-eslint.io/rules/no-explicit-any/)) re-registrada bajo nuestro namespace con mensajes que enseñan (ver `skapxd/no-impossible-branch` para el patrón). Los presets tipados activan este nombre, no el original.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
