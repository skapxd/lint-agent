### `skapxd/nest-no-swagger-in-controllers`

La contracara de la anterior: con el plugin de `@nestjs/swagger` activo en
`nest-cli.json`, los decoradores de documentación en el controller son ruido
redundante — el plugin ya introspecciona los DTOs de input y el tipo de
retorno. Un controller lleno de `@ApiOperation`/`@ApiResponse`/`@ApiParam`
entierra la lógica de la frontera bajo metadatos que viven mejor en el DTO:

```ts
@Controller("users")
export class UsersController {
  @ApiOperation({ summary: "Busca un usuario" })   // ❌ redundante con el plugin
  @ApiResponse({ status: 200, type: UserDto })     // ❌ el tipo de retorno ya lo dice
  @ApiParam({ name: "id" })                        // ❌ el DTO de params ya lo dice
  @Get(":id")
  findOne(@Param() params: FindUserParamsDto): Promise<UserDto> { ... }
}
```

Solo se permiten los decoradores que el plugin **no puede inferir**
(`allowedDecoratorNames`, configurable): `ApiExcludeEndpoint` (ocultar rutas
internas), `ApiTags` (agrupación), `ApiBearerAuth` (auth), y
`ApiConsumes`/`ApiBody` (uploads multipart, que la introspección no ve).

La detección compara contra los **imports reales de `@nestjs/swagger`** del
archivo: un decorador propio que se llame `ApiOperation` no se toca. Solo
aplica dentro de clases `@Controller`.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
