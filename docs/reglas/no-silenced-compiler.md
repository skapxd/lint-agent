### `skapxd/no-silenced-compiler`

No silencies al compilador: `@ts-ignore` y `@ts-nocheck` apagan la alarma en vez de arreglar el incendio. Si el compilador es el muro de contención del sistema, nadie lo apaga cuando el modelado se pone difícil — un error de tipos se resuelve modelando mejor el dominio.

La puerta que queda abierta, a propósito: `@ts-expect-error` **con descripción**. Es la forma legítima de testear que un estado inválido de verdad NO compila (la otra mitad son los tests de tipos con `expectTypeOf`, ver la sección de `requires-strict-tsconfig`) — y a diferencia de `@ts-ignore`, avisa cuando la supresión deja de hacer falta. Bajo el capó es `@typescript-eslint/ban-ts-comment` ([doc original](https://typescript-eslint.io/rules/ban-ts-comment/)) con un nombre que dice lo que defiende y mensajes propios.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
