### `skapxd/nest-no-result-response`

El footgun silencioso de mezclar Result con Nest: si un método de un
`@Controller` retorna el `Result` crudo, Nest lo serializa tal cual y el
cliente recibe `{ ok: false, error: {...} }` con tus internals — tipos de
error de dominio, causas, stack traces. Esta regla lo hace imposible:

```ts
@Controller("users")
export class UsersController {
  // ❌ el envelope completo viaja al cliente
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Result<User, UserError>> {
    return this.usersService.findOne(id);
  }

  // ✅ el controller es la frontera: match() traduce
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<UserDto> {
    const user = await this.usersService.findOne(id);

    return match(user)
      .with({ ok: true }, ({ value }) => toUserDto(value))
      .with({ ok: false, error: { type: "NOT_FOUND" } }, () => {
        throw new NotFoundException();
      })
      .exhaustive();
  }
}
```

Es **type-aware**: resuelve el tipo de retorno real del método (anotado o
inferido) hasta el `Result` de `@skapxd/result`, así que devolver el Result
por indirección tampoco escapa. Solo aplica a clases con `@Controller`
(configurable con `controllerDecoratorNames` para decoradores propios); los
services retornan Result con orgullo — ese es el dominio.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
