### `skapxd/max-class-size`

Limita cada `ClassDeclaration` y `ClassExpression` a `150` líneas físicas por defecto. El presupuesto pertenece a la clase, no al archivo: decoradores, comentarios y líneas vacías dentro del rango cuentan; tipos, constantes u otras declaraciones externas no.

La regla cierra el bypass de [`skapxd/max-public-methods`](./max-public-methods.md): una clase puede conservar una sola capacidad pública y aun acumular cientos de líneas, métodos privados, estado y configuración. Los conteos de métodos y propiedades aparecen en el diagnóstico para orientar el refactor, pero no crean presupuestos adicionales.

```ts
// ❌ una sola capacidad publica no justifica una clase de 151+ lineas
export class OrderDecisionModel {
  async decide(input: OrderInput) {
    // transporte, request, parsing y validacion mezclados
  }

  private createRequest() { /* ... */ }
  private createTools() { /* ... */ }
  private parseDecision() { /* ... */ }
  private validateMetadata() { /* ... */ }
}
```

```ts
// ✅ la clase conserva coordinacion real y delega unidades semanticas
export class OrderDecisionModel {
  constructor(private readonly fetchOrderDecision: FetchOrderDecision) {}

  async decide(input: OrderInput) {
    const response = await this.fetchOrderDecision(createOrderRequest(input));
    return parseOrderDecision(response);
  }
}
```

Cuando un `ObjectExpression` o `ArrayExpression` completamente declarativo explica por sí solo el exceso, el mensaje cambia a `tooLargeClassWithExtractableData`. Solo promete esa salida si reemplazar el literal por una referencia de una línea devuelve la clase al presupuesto; un literal menor conserva el mensaje general.

La clasificación declarativa acepta recursivamente `null`, strings, booleanos, números JSON válidos, arrays, objetos con claves estáticas, `as const` y `satisfies`. Rechaza spreads, calls, `new`, funciones, métodos, `this`, `await`, identifiers como valores, regex, bigint, `undefined`, `NaN`, `Infinity` y claves computadas no resolubles. No persigue constantes importadas ni infiere DTOs, schemas o configuración por nombres.

```ts
// ❌ el literal declarativo basta para explicar el exceso
export class OrderDecisionModel {
  createTools() {
    return [
      // datos JSON-compatible extensos
    ] as const;
  }
}
```

```ts
// ✅ datos estaticos fuera de la clase; funcion factory si dependen de argumentos
export const ORDER_TOOLS = [
  // datos declarativos
] as const;

export function createOrderRequest(input: OrderInput) {
  return { input, tools: ORDER_TOOLS };
}
```

No hay autofix: dividir responsabilidades, dependencias y wiring exige criterio. Una clase injectable nueva solo tiene sentido cuando existen dependencias, estado o lifecycle reales; una transformación pura o configuración declarativa debe quedar como módulo importable.

Opciones:

```js
"skapxd/max-class-size": ["error", { maxLines: 150 }]
```

| Preset | Estado |
| --- | --- |
| `shared.base` / `base-rules` | `error` |
| Presets que heredan `shared.base` | `error` |

| Axioma | Relación |
| --- | --- |
| A4 | Una clase conserva una responsabilidad y un nombre semántico dentro de un presupuesto explícito. |
| A6 | La detección usa tipos AST y rangos físicos; nunca nombres, decoradores o sufijos de clase. |

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
