### `skapxd/nested-function-requires-capture`

Exige que una funcion nombrada dentro de otra tenga una razon lexico-sintactica
para vivir ahi: **capturar un binding local** de una funcion ancestro. Si no
cierra sobre parametros o variables locales del scope que la contiene, es un
helper extraible disfrazado y debe moverse a su propio archivo.

```ts
function processOrders(orders: number[]) {
  function double(value: number) {      // ❌ no captura nada de processOrders
    return value * 2;
  }

  return orders.map(double);
}
```

El arreglo esperado es extraer el helper y pasarle lo que necesite por
argumentos. Imports, globals y constantes top-level no cuentan como captura:
siguen estando disponibles desde un modulo propio.

```ts
import { double } from "#/utils/math/double";

function processOrders(orders: number[]) {
  return orders.map(double);
}
```

La captura local si legitima el anidamiento: el helper representa un closure
real, no una funcion escondida.

```ts
function makeScaler(multiplier: number) {
  function scale(value: number) {       // ✅ captura multiplier
    return value * multiplier;
  }

  return scale;
}
```

La regla solo mira funciones con identidad propia declaradas dentro del cuerpo
de otra funcion: `function helper() {}` y declaradores `const helper = () => {}`
o `const helper = function () {}`. No toca callbacks anonimos pasados inline ni
funciones anonimas retornadas inline:

```ts
orders.map((value) => value * 2);       // ✅ callback anonimo inline
const adder = (left: number) => (right: number) => left + right; // ✅ factory
```

`this` no cuenta como captura: una funcion que solo usa `this` sigue siendo
extraible como metodo. La recursion sobre el propio nombre tampoco cuenta,
porque el nombre se mueve junto con la funcion extraida.

**Frontera React.** Si algun ancestro funcion es PascalCase, esta regla no
reporta. Ese terreno pertenece a `skapxd/no-functions-inside-components`, que
explica el problema como re-render y separa callbacks idiomaticos de React.

**Presets.** Activa como `error` en `shared`/`base-rules`; la heredan todos
los presets compartidos. La regla es agnostica al framework: solo usa AST y
scope lexico para decidir si hay captura local.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
