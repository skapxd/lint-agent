### `skapxd/nest-validation-pipe-config`

La otra premisa verificada: todo `new ValidationPipe(...)` (el real, importado
de `@nestjs/common`) debe configurar las dos opciones que hacen reales los
contratos de los DTOs:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,   // sin él, class-transformer no corre: los @Type no hacen NADA
    whitelist: true,   // sin él, las props sin decorador pasan crudas al dominio
    // ...el resto (exceptionFactory, transformOptions) es tuyo
  }),
);
```

`new ValidationPipe()` sin opciones, con una faltante o con `transform: false`
se reporta. Si las opciones llegan como variable, se resuelve por scope; un
identifier irresoluble o un spread reciben el beneficio de la duda.
`requiredPipeOptions` es configurable (p. ej. añadir `forbidNonWhitelisted`).

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
