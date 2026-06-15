### `skapxd/nest-no-inline-query-params`

Dos o más `@Query('x')` individuales (o `@ApiQuery` sueltos) en un handler son un DTO disfrazado — sin validación automática, sin tipos de verdad y con el controller enterrado en decoradores:

```ts
// ❌ cada query a mano
findAll(@Query("status") status?: string, @Query("clientName") name?: string) {}

// ✅ el DTO consolidado: ValidationPipe valida, swagger documenta, el tipo es real
findAll(@Query() filters: ListLoansDto) {}
```

`@Query()` sin argumento (el DTO completo) y un único `@Query('id')` son legítimos (`max` configurable). El mensaje trae el playbook de migración: propiedades `?` + `@IsOptional` + validador + `@ApiPropertyOptional`, y `@Transform`/`@Type` para convertir los strings del query al tipo real. Conecta con `nest-dto-requires-validation`: el DTO que crees ya queda vigilado. Solo el `Query`/`ApiQuery` importados de Nest cuentan.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
