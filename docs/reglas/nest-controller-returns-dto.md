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

Declara una clase DTO explícita con `extends Dto()` de `@skapxd/nest`, incluso cuando TypeScript podría inferir el tipo, y usa un wrapper nombrado para listados:

```ts
@Controller("users")
export class UsersController {
  @Get()
  findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }                                      // ❌ lista cruda: no hay espacio para paginación/metadata

  @Post()
  create(): Promise<CreatedUserDto> {
    return this.usersService.create();
  }                                      // ✅ contrato HTTP introspectable
}
```

Para listados, el contrato top-level también es una clase DTO:

```ts
class ListUsersDto extends Dto() {
  items!: UserDto[];
}

@Controller("users")
export class UsersController {
  @Get()
  findAll(): Promise<ListUsersDto> {
    return this.usersService.findAll();
  }                                      // ✅ wrapper DTO extensible
}
```

La regla mira solo métodos de ruta (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options`, `@Head`) dentro de clases `@Controller`. Obtiene el retorno desde el checker, desenvuelve `Promise<T>`/awaited hasta el tipo efectivo y exige que el contrato top-level lleve el brand de capa `SKAPXD_LAYER: "dto"` declarado por `@skapxd/nest`, que aparece cuando la clase extiende `Dto()` o `Dto(Base)`. `T[]`, `Array<T>`, `ReadonlyArray<T>` y tuplas fallan aunque `T` sea DTO válido: una respuesta HTTP de listado debe cruzar como wrapper nombrado `extends Dto()` con una propiedad `items`, no como contenedor genérico del lenguaje. El sufijo del nombre no cuenta porque un schema de DB puede llamarse `UserDto` y seguir siendo el contrato equivocado. Cualquier unión falla (`FooDto | BarDto`, `FooDto | null`, `FooDto | string`): si la respuesta es polimórfica, usa un DTO contenedor con discriminador.

La regla separa seis fallas porque el fix no es intercambiable:

- Unión (`FooDto | BarDto`, `FooDto | null`, `FooDto | string`): el endpoint debe declarar una forma única; usa un DTO contenedor con discriminador.
- Sin cuerpo (`void`/`undefined`): incluso una respuesta de confirmación debe declarar una forma documentable, por ejemplo `DeletedDto`.
- Lista cruda (`UserDto[]`, `Array<UserDto>`, `ReadonlyArray<UserDto>` o tupla): un endpoint no debe exponer `Dto[]` como contrato HTTP; usa un wrapper DTO con `items` y deja espacio para paginación o metadata.
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

Fuera de alcance: métodos que reciben `@Res()`/`@Next()` porque manejan la respuesta manualmente, gateways `@WebSocketGateway` porque no producen Swagger HTTP, métodos no-ruta y archivos permitidos por `allowFilePatterns`. `void`, primitivos, interfaces, `type` aliases, entities, listas crudas top-level, streams crudos y uniones no son respuestas válidas para esta regla; si necesitas enviar un archivo, retorna una clase `extends Dto(StreamableFile)`.

Opciones: `allowFilePatterns`, `controllerDecoratorNames`, `dtoLayerSource`, `gatewayDecoratorNames` y `responseHandlerParamDecorators`.

Sin autofix: elegir el DTO correcto es una decisión de contrato HTTP, no una edición mecánica segura.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
