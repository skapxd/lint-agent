### `skapxd/nest-dto-no-inline-object`

El plugin de `@nestjs/swagger` introspecciona clases, no objetos literales inline. En un `*.dto.ts`, una propiedad pública de instancia no debe declarar un objeto anidado como `{ ... }`, `{ ... }[]`, `Array<{ ... }>` ni documentarlo como `@ApiProperty({ type: Object })`, porque el `swagger.json` queda vacío/opaco y el cliente generado recibe un `object` sin forma.

```ts
export class EvaluationDto {
  @ApiProperty({ type: Object })
  decisionResult: {
    approved: boolean;
    riskLevel: string;
  };                              // ❌ objeto anidado sin clase DTO
}
```

Modela el anidado como clase DTO propia y referencia esa clase desde el decorador:

```ts
class DecisionResultDto {
  @ApiProperty()
  approved: boolean;

  @ApiProperty()
  riskLevel: string;
}

export class EvaluationDto {
  @ApiProperty({ type: DecisionResultDto })
  decisionResult: DecisionResultDto; // ✅ el plugin puede introspeccionarlo
}
```

La regla es sintáctica: mira la anotación de tipo y los argumentos inline de `@ApiProperty`/`@ApiPropertyOptional`. No marca primitivas, enums, uniones de literales, arrays de clase o primitivo, `@ApiProperty({ type: FooDto })`, `@ApiProperty({ type: [FooDto] })` ni `@ApiProperty({ type: () => FooDto })`. `Record<...>`, `Partial<...>` y otros utilitarios quedan fuera de scope en esta iteración: también pueden documentar mal, pero requieren una decisión separada para no mezclar un guardrail de objetos inline con una política de utilitarios opacos.

Sin autofix: extraer una clase DTO necesita nombre, ubicación y decoradores por campo.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
