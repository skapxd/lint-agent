### `skapxd/nest-dto-requires-api-property`

El contrato HTTP — query, params, body y respuesta — se documenta en el DTO,
no en el controller. Toda propiedad **pública de instancia** de una clase en
un `*.dto.ts` debe llevar `@ApiProperty` o `@ApiPropertyOptional`:

```ts
// create-user.dto.ts
export class CreateUserDto {
  @ApiProperty({ description: "Nombre legal completo", example: "Ana Pérez" })
  name: string;                       // ✅

  email: string;                      // ❌ sin documentar

  @IsString()
  phone: string;                      // ❌ class-validator no documenta
}
```

El plugin de `@nestjs/swagger` infiere el **tipo**, pero la `description` y el
`example` son intención tuya — y son lo que convierte el swagger en un
contrato legible (y en un buen cliente generado). Las propiedades `private`,
`protected`, `#privadas` y `static` no se exigen: swagger no las serializa.
`dtoFilePatterns` ajusta la convención de archivos si no usas `*.dto.ts`.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
