### `skapxd/nest-controller-returns-dto`

El contrato de respuesta de un controller no puede depender de inferencia local: `@nestjs/swagger` genera el schema del response desde el tipo de retorno del método de ruta. Si el método no declara tipo, retorna `any`/`unknown` o usa un objeto inline, el `swagger.json` queda sin schema útil y el cliente generado recibe `any`.

```ts
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

Declara el DTO explícito, incluso cuando TypeScript podría inferirlo:

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

La regla mira solo métodos de ruta (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options`, `@Head`) dentro de clases `@Controller`. Desenvuelve `Promise<T>`, `T[]` y `Array<T>` hasta el tipo base. Acepta una referencia de tipo como DTO; el sufijo `Dto` es opcional con `requireDtoSuffix: false` por defecto, porque el plugin introspecciona clases aunque no sigan esa convención de nombre.

Exenciones deliberadas: `void`/`Promise<void>` para respuestas sin cuerpo, `StreamableFile`/`Buffer` para archivos, métodos que reciben `@Res()`/`@Next()` porque manejan la respuesta manualmente, gateways `@WebSocketGateway` porque no producen Swagger HTTP, primitivos (`string`/`number`/`boolean`) cuando `allowPrimitiveReturns` queda en su default `true`, y archivos de test.

Opciones: `allowFilePatterns`, `controllerDecoratorNames`, `gatewayDecoratorNames`, `responseHandlerParamDecorators`, `streamReturnTypes`, `allowPrimitiveReturns` y `requireDtoSuffix`.

Sin autofix: elegir el DTO correcto es una decisión de contrato HTTP, no una edición mecánica segura.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
