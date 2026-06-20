### `skapxd/nest-controller-returns-dto`

El contrato de respuesta de un controller no puede depender de inferencia local ni de tipos que desaparecen en runtime: `@nestjs/swagger` genera el schema del response introspeccionando clases. Si el método no declara tipo, retorna `any`/`unknown`, usa un objeto inline, una `interface`, un `type` alias o un schema de persistencia, el `swagger.json` queda sin schema útil y el cliente generado recibe `any`; además, retornar entidades o schemas acopla el contrato HTTP a la base de datos.

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
  }

  @Post()
  create(): Promise<CreatedUserDto> {
    return this.usersService.create();
  }
}
```

La regla mira solo métodos de ruta (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options`, `@Head`) dentro de clases `@Controller`. Desenvuelve `Promise<T>`, `T[]` y `Array<T>` hasta el tipo base. Ese leaf debe llevar el brand de capa `SKAPXD_LAYER: "dto"` declarado por `@skapxd/nest`, que aparece cuando la clase extiende `Dto()` o `Dto(Base)`; el sufijo del nombre no cuenta porque un schema de DB puede llamarse `UserDto` y seguir siendo el contrato equivocado. En uniones (`FooDto | BarDto`), todos los miembros deben pasar el mismo criterio.

Exenciones deliberadas: `void`/`Promise<void>` para respuestas sin cuerpo, `StreamableFile`/`Buffer` para archivos, métodos que reciben `@Res()`/`@Next()` porque manejan la respuesta manualmente, gateways `@WebSocketGateway` porque no producen Swagger HTTP, primitivos (`string`/`number`/`boolean`) cuando `allowPrimitiveReturns` queda en su default `true`, y archivos de test.

Opciones: `allowFilePatterns`, `controllerDecoratorNames`, `dtoLayerSource`, `gatewayDecoratorNames`, `responseHandlerParamDecorators`, `streamReturnTypes` y `allowPrimitiveReturns`.

Sin autofix: elegir el DTO correcto es una decisión de contrato HTTP, no una edición mecánica segura.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
