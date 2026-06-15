### `skapxd/nest-dto-requires-validation`

El tipo de TypeScript desaparece en runtime: un DTO de input sin class-validator es un contrato de mentira — el `ValidationPipe` deja pasar cualquier cosa (o la descarta en silencio con `whitelist`). Tres contratos en una regla:

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

Los **DTOs de respuesta quedan exentos** por dos vías: nombre de archivo (`outputDtoFilePatterns`: `out-*`, `output-*`, `*-response`, `*-result`, `*-output`) y **nombre de clase** (`outputDtoClassPatterns`, regex, default `(Response|Result|Output)(Dto)?$`) — porque un `UploadDocumentResponseDto` puede vivir en un archivo de nombre neutro (`upload-document.dto.ts`) o compartir archivo con DTOs de input, y la exención de la clase no contagia a sus vecinas. El server los produce, no los recibe. La detección compara contra los imports reales de `class-validator`/`class-transformer`, así que un decorador casero homónimo no engaña a la regla.

**El caso Multer** queda cubierto por el conjunto: el archivo llega como parámetro (`@UploadedFiles() files: Express.Multer.File[]`), nunca en un DTO validable; el schema multipart se documenta inline en el controller con `@ApiConsumes` + `@ApiBody` (permitidos por `nest-no-swagger-in-controllers`: la introspección no ve multipart); y el DTO de respuesta del upload queda exento por nombre de clase. La validación del archivo en sí (tamaño, mimetype) va donde Nest la diseñó: `ParseFilePipe` en el parámetro, no class-validator.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
