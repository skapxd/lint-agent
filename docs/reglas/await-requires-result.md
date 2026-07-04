### `skapxd/await-requires-result`

> **Es la regla obligatoria del sistema de errores**: la activan todos los presets tipados (`shared.frontend`, `shared.backend`, `next/server`, `astro/typescript`). El contrato queda así: ninguna función está obligada a retornar `Result` (eso es `async-functions-return-result`, apagada por defecto), pero todo `await` debe **resolver** en uno, salvo la exención explícita de capa de aplicación Nest descrita abajo. Para activarla en otros globs, añádela tú mismo:
>
> ```js
> rules: {
>   "skapxd/await-requires-result": ["error", {
>     trySafeCallNames: ["trySafe"],
>     allowFilePatterns: [],
>     useCaseDecoratorNames: ["UseCase"],
>     useCaseDecoratorSource: "@skapxd/nest",
>   }],
> }
> ```
>
> (`skapxd/await-requires-try-safe` fue el nombre anterior; el alias se eliminó en la v1.0.0 — si tu config lo menciona, renómbralo a `skapxd/await-requires-result`: mismo comportamiento, mismas opciones.)

Hay dos caminos válidos, y la regla recomienda el primero:

**1. El camino preferido: extrae la operación a una función que retorne `Promise<Result<...>>`** y modela ahí los errores de dominio. El `trySafe` vive dentro de esa función, en la frontera con el código que lanza, y el resto del código habla en errores con significado:

```ts
async function getUser(id: string): Promise<Result<User, UserError>> {
  const response = await trySafe(() => fetch(`/users/${id}`));

  if (!response.ok) {
    return Result.err({
      cause: response.error,
      message: "No pude cargar el usuario.",
      type: "USER_FETCH_FAILED",
    });
  }

  return trySafe(() => response.value.json());
}

// En el componente: ya resuelve en Result, pasa directo.
const user = await getUser(id); // ✅
```

La detección es type-aware: la regla resuelve el símbolo hasta `@skapxd/result`, así que un `Result` casero (homónimo, de otra librería) no exime.

**Exención Nest: awaitar otro `@UseCase` de `@skapxd/nest` no exige `Result`.** La capa de aplicación traduce el `Result` de la capa baja a DTO o excepción HTTP; por eso `await this.createOrder.execute(dto)` o `await uc.execute(dto)` pasan cuando el receptor tipado es una clase decorada con el `UseCase` real de `@skapxd/nest`. La exención no aplica a `this`/`super`: `await this.fetchRaw(url)` dentro de un use-case sigue marcado porque esa autollamada baja a infra cruda y debe moverse a repository/provider o retornar `Result`.

```ts
@UseCase()
class PlaceOrderUseCase {
  constructor(private readonly createOrder: CreateOrderUseCase) {}

  async execute(dto: Dto): Promise<OrderDto> {
    return await this.createOrder.execute(dto); // ✅ otro @UseCase de @skapxd/nest
  }

  private async fetchRaw(url: string): Promise<Raw> {
    return await fetch(url).then((response) => response.json()); // ❌ autollamada/infra cruda
  }
}
```

Un decorador local llamado `UseCase` no basta: la regla verifica el origen del símbolo contra `useCaseDecoratorSource` (`@skapxd/nest` por defecto). Fuera de Nest, o sin ese decorador real, la exención no dispara y el comportamiento queda igual que antes.

**2. La alternativa rápida: envuelve el `await` en `trySafe` ahí mismo:**

```ts
const result = await trySafe(() => client.execute({...})); // ✅
```

o dentro de un callback:

```ts
const result = await trySafe(async () => {
  const response = await fetch(url);
  return response.json();
});
```

Sirve para código de pegamento, pero deja el error sin modelar (`Result<T, unknown>`). Cuando la misma operación se repite o el error importa, el mensaje de la regla empuja hacia el camino 1.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
