### `skapxd/nest-controller-returns-dto`

El contrato de respuesta de un controller no puede depender de tipos que desaparecen en runtime: `@nestjs/swagger` genera el schema del response introspeccionando clases marcadas. Si el tipo efectivo del retorno cae en `any`/`unknown`, usa un objeto inline, una `interface`, un `type` alias o un schema de persistencia, el `swagger.json` queda sin schema útil y el cliente generado recibe `any`; además, retornar entidades o schemas acopla el contrato HTTP a la base de datos.

```ts
import { Dto } from "@skapxd/nest";

class UserDto extends Dto() {
  id!: string;
}

class CreatedUserDto extends Dto() {
  id!: string;
}

@Controller("users")
export class UsersController {
  @Get()
  findAll() {
    return this.usersService.findAll();
  }                                      // ❌ swagger no ve el DTO de salida

  @Post()
  create(): { id: string } {
    return { id: "1" };
  }                                      // ❌ objeto inline, no clase introspectable
}
```

Declara una clase DTO explícita con `extends Dto()` de `@skapxd/nest`, incluso cuando TypeScript podría inferir el tipo:

```ts
@Controller("users")
export class UsersController {
  @Get()
  findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }                                      // ✅ leaf de retorno marcado con Dto()

  @Post()
  create(): Promise<CreatedUserDto> {
    return this.usersService.create();
  }                                      // ✅ contrato HTTP introspectable
}
```

La regla mira solo métodos de ruta (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options`, `@Head`) dentro de clases `@Controller`. Obtiene el retorno desde el checker, desenvuelve `Promise<T>`, `T[]` y `Array<T>` hasta el tipo base, y exige que ese leaf lleve el brand de capa `SKAPXD_LAYER: "dto"` declarado por `@skapxd/nest`, que aparece cuando la clase extiende `Dto()` o `Dto(Base)`. El sufijo del nombre no cuenta porque un schema de DB puede llamarse `UserDto` y seguir siendo el contrato equivocado. Cualquier unión falla (`FooDto | BarDto`, `FooDto | null`, `FooDto | string`): si la respuesta es polimórfica, usa un DTO contenedor con discriminador.

La regla separa cinco fallas porque el fix no es intercambiable:

- Unión (`FooDto | BarDto`, `FooDto | null`, `FooDto | string`): el endpoint debe declarar una forma única; usa un DTO contenedor con discriminador.
- Sin cuerpo (`void`/`undefined`): incluso una respuesta de confirmación debe declarar una forma documentable, por ejemplo `DeletedDto`.
- Primitivo (`string`, `number`, `boolean`, `bigint`): un escalar suelto no genera contrato útil; envuélvelo en un DTO con campo nombrado.
- No-clase (`interface`, `type`, `any`, `unknown` o retorno sin tipo útil): `@nestjs/swagger` introspecciona clases, no tipos borrados por TypeScript.
- Clase sin brand (`UserSchema`, entity de persistencia, clase plana o clase con brand falso/local): ya existe runtime, pero falta marcar el contrato HTTP con `extends Dto()` de `@skapxd/nest`; si es persistencia, crea un DTO de presentación aparte.

En todos los casos el mensaje muestra `checker.typeToString(...)` del retorno efectivo para que el fix parta del tipo real que está exponiendo el controller. Para respuestas polimórficas, modela el contrato como contenedor:

```ts
class PaymentDto extends Dto() {
  @Expose() status!: "approved" | "rejected";
  @Expose() @Type(() => ApprovedDto) approved?: ApprovedDto;
  @Expose() @Type(() => RejectedDto) rejected?: RejectedDto;
}
```

Fuera de alcance: métodos que reciben `@Res()`/`@Next()` porque manejan la respuesta manualmente, gateways `@WebSocketGateway` porque no producen Swagger HTTP, métodos no-ruta y archivos permitidos por `allowFilePatterns`. `void`, primitivos, interfaces, `type` aliases, entities, streams crudos y uniones no son respuestas válidas para esta regla; si necesitas enviar un archivo, retorna una clase `extends Dto(StreamableFile)`.

Opciones: `allowFilePatterns`, `controllerDecoratorNames`, `dtoLayerSource`, `gatewayDecoratorNames` y `responseHandlerParamDecorators`.

Sin autofix: elegir el DTO correcto es una decisión de contrato HTTP, no una edición mecánica segura.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
