### `skapxd/nest-dto-no-class-decorator`

El brand `"dto"` de `@skapxd/nest` solo prueba que la clase extiende `Dto(...)`. No prueba que la clase sea un contrato HTTP puro. Si la misma clase declara `@Schema`, `@Entity` u otro decorador de clase, ya no es solo DTO: queda registrada como modelo de persistencia y puede filtrar columnas/campos internos como respuesta HTTP cuando `nest-controller-returns-dto` la acepta por brand.

```ts
import { Dto } from "@skapxd/nest";

@Schema()
export class UserDto extends Dto() {
  @Prop()
  passwordHash!: string;
}                                      // ❌ schema disfrazado de DTO
```

La salida correcta separa persistencia y transporte. La entity/schema vive en su clase; el DTO extiende `Dto(...)` sin decoradores de clase, y el mapeo decide que campos cruzan la frontera HTTP.

```ts
@Schema()
export class UserSchema {
  @Prop()
  passwordHash!: string;
}

export class UserDto extends Dto() {
  @Expose()
  id!: string;
}                                      // ✅ DTO puro, sin decorador de clase
```

La regla es type-aware: resuelve el tipo de instancia de `ClassDeclaration` y `ClassExpression`, verifica que lleve el brand `SKAPXD_LAYER: "dto"` originado en `@skapxd/nest`, y solo entonces lee los decoradores de clase declarados en esa misma clase. No recorre la cadena de herencia: `class UserDto extends Dto(UserSchema) {}` y `class PdfFileDto extends Dto(StreamableFile) {}` son validos porque extender es libre; lo prohibido es declarar un decorador de clase sobre el propio DTO.

Los decoradores de propiedad siguen siendo validos (`@Expose`, `@ApiProperty`, validadores). La regla reporta sobre el decorador de clase exacto y permite una escape hatch explicita con `allowedClassDecorators` para decoradores de clase que el proyecto decida aceptar en DTOs.

Opciones: `dtoLayerSource` y `allowedClassDecorators`.

Sin autofix: quitar `@Schema`/`@Entity` implica separar modelos y mapear contratos, no una edicion mecanica segura.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
