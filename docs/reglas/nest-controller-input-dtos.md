### `skapxd/nest-controller-input-dtos`

Un controller no debe recibir estructuras borradas en runtime ni fragmentos sueltos de la request. Si un método de ruta declara input HTTP con `@Body()`, `@Query()` o `@Param()`, ese parámetro debe cruzar como una clase DTO completa que extienda `Dto()` o `Dto(Base)` de `@skapxd/nest`. Esa brand `SKAPXD_LAYER: "dto"` es la evidencia que permite a `class-validator`, `class-transformer`, Swagger y la separación de capas trabajar sobre una frontera real, no sobre una interface, un alias, un `Record`, una entity de persistencia o una clase plana con nombre convincente.

```ts
import { Body, Controller, Param, Post } from "@nestjs/common";

interface CreateUserBody {
  name: string;
}

@Controller("users")
export class UsersController {
  @Post(":id")
  create(@Param("id") id: string, @Body() body: CreateUserBody) {
    return this.createUser.execute({ id, ...body });
  }                                      // ❌ campos sueltos + interface borrada en runtime
}
```

Declara DTOs de entrada completos y pásalos enteros al handler:

```ts
import { Body, Controller, Param, Post } from "@nestjs/common";
import { Dto } from "@skapxd/nest";

class CreateUserParamsDto extends Dto() {
  id!: string;
}

class CreateUserBodyDto extends Dto() {
  name!: string;
}

@Controller("users")
export class UsersController {
  @Post(":id")
  create(@Param() params: CreateUserParamsDto, @Body() body: CreateUserBodyDto) {
    return this.createUser.execute({ params, body });
  }                                      // ✅ frontera HTTP con clases DTO reales
}
```

La regla mira solo métodos de ruta (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options`, `@Head`) dentro de clases `@Controller`. Los decoradores de input cubiertos por defecto son `Body`, `Query` y `Param`, pero solo cuentan si el nombre local viene importado desde `@nestjs/common`; un decorador local llamado `Body` no dispara la regla y un alias como `Body as HttpBody` sí se rastrea por provenance. Un método sin `@Body()`/`@Query()`/`@Param()` pasa: una acción como `sync()` no necesita inventarse un DTO vacío si no declara input HTTP.

Falla cualquier decorator de campo (`@Body("name")`, `@Query("status")`, `@Param("id")`) porque el fix correcto es un DTO completo con una propiedad nombrada, no primitivos desperdigados en la firma. También fallan arrays crudos (`CreateUserDto[]`, `Array<CreateUserDto>`, `ReadonlyArray<CreateUserDto>` y tuplas), destructuring (`@Body() { name }: CreateUserDto`), `interface`, `type`, `Record`, `any`, `unknown`, entities/schemas y clases sin brand. Un DTO que contiene una propiedad array sí pasa: el array pertenece al contrato de la clase, no a la firma del controller.

Mapped types solo son válidos si el tipo efectivo conserva la brand de `@skapxd/nest`. Si `PartialType(CreateUserDto)` no la conserva, envuélvelo explícitamente:

```ts
import { PartialType } from "@nestjs/swagger";
import { Dto } from "@skapxd/nest";

class CreateUserDto extends Dto() {
  name!: string;
}

class UpdateUserDto extends Dto(PartialType(CreateUserDto)) {}
```

Fuera de alcance: `@UploadedFile`, `@UploadedFiles`, `@Req`, `@Headers` y demás decoradores que no representan un DTO completo de input HTTP. Tampoco toca arrays de salida (`Promise<UserDto[]>`): eso pertenece a `nest-controller-returns-dto`.

Opciones: `allowFilePatterns`, `controllerDecoratorNames`, `checkedDecorators`, `nestDecoratorSource` y `dtoLayerSource`. Por defecto los specs colocados (`**/*.spec.ts`, `**/*.test.ts`, `**/*.e2e-spec.ts`) quedan exentos igual que en la regla de retornos.

Sin autofix: mover campos a DTOs, elegir validadores y preservar compatibilidad de contratos HTTP es una decisión de dominio, no una edición mecánica segura.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
