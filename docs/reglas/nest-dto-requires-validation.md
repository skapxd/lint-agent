### `skapxd/nest-dto-requires-validation`

El tipo de TypeScript desaparece en runtime: un DTO sin class-validator es un contrato de mentira. En Mongo schemaless la base no impone forma, así que el contrato vive en la app: si una propiedad pública de un `*.dto.ts` no tiene validador, la forma que entra o sale quedó sin garantía ejecutable. Tres contratos en una regla:

```ts
export class CreateLoanDto {
  @ApiProperty()
  amount: number;              // ❌ el tipo desaparece; falta validador runtime

  @ApiProperty()
  termMonths?: number;         // ❌ `?` sin @IsOptional miente al runtime
}
```

```ts
export class CreateLoanDto {
  @ApiProperty()
  @IsNumber()                 // 1. ✅ toda propiedad valida en runtime
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()               // 2. ✅ el `?` del tipo y el runtime coinciden
  @IsNumber()
  termMonths?: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AddressDto)     // 3. ✅ sin @Type, la validación anidada NO corre
  address: AddressDto;
}
```

1. **Toda propiedad pública** lleva al menos un decorador de class-validator.
2. **`?` exige `@IsOptional`** (o `@ValidateIf`): si el tipo dice opcional y el runtime la exige, el contrato miente.
3. **`@ValidateNested` exige `@Type(() => Clase)`** de class-transformer: sin él, el objeto anidado llega como plain object y la validación anidada no corre — el bug silencioso clásico (esta regla lo encontró en producción).

Por defecto **no hay exenciones para DTOs de respuesta**: `outputDtoFilePatterns` y `outputDtoClassPatterns` arrancan en `[]`. Siguen existiendo para consumidores que decidan eximir outputs explícitos, pero esa decisión se declara en configuración; el nombre `out-*`, `*-response`, `*-result`, `*-output` o `*ResponseDto` ya no tiene autoridad por sí solo. La detección compara contra los imports reales de `class-validator`/`class-transformer`, así que un decorador casero homónimo no engaña a la regla.

Los tipos que class-validator modela mal no se escapan con `@Allow()` ni `unknown`: se modelan mejor. Especializa genéricos (`PageOfUserDto` en vez de `PageDto<T>` sin contrato concreto), y para uniones discriminadas, records dinámicos o shapes que dependen de una etiqueta usa zod/valibot; `prefer-schema-validation` ya acepta esa salida porque el schema valida, tipa y conserva el contrato en runtime.

**El caso Multer** queda cubierto por el conjunto: el archivo llega como parámetro (`@UploadedFiles() files: Express.Multer.File[]`), nunca en un DTO validable; el schema multipart se documenta inline en el controller con `@ApiConsumes` + `@ApiBody` (permitidos por `nest-no-swagger-in-controllers`: la introspección no ve multipart); y si hay DTO de respuesta del upload, sus propiedades también declaran contrato o se eximen explícitamente por configuración. La validación del archivo en sí (tamaño, mimetype) va donde Nest la diseñó: `ParseFilePipe` en el parámetro, no class-validator.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
