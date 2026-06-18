### `skapxd/no-rethrow-result-error`

`trySafe` captura una excepción para convertirla en `Result`. Re-lanzar luego el error crudo (`throw result.error` o `throw error` dentro de la rama `{ ok: false }`) deshace el contrato: el flujo hizo `excepción -> Result -> excepción` y volvió al mismo punto con ceremonia adicional.

La regla marca solo el error crudo extraído de un `Result` real de `@skapxd/result`:

```ts
const result = await trySafe(() => readFile(path, "utf8"));
if (!result.ok) {
  throw result.error; // ❌ vuelve a excepción cruda
}
```

También cubre la rama fallida de `match(result).with({ ok: false }, ({ error }) => ...)`, porque ese `error` es el mismo valor crudo:

```ts
match(result).with({ ok: false }, ({ error }) => {
  throw error; // ❌ mismo reproceso
});
```

El fix depende del origen del error. Si el `trySafe` envolvió runtime o paquete externo (`fs`, SDK, driver, `JSON.parse`), la capa que tocó esa frontera debe envolver en un error de dominio conservando `cause`. Si el origen es código de dominio propio, propaga el `Result` completo; re-envolver una `HttpException` de dominio puede convertir un 400/404 en 500.

```ts
// Frontera runtime/paquete: transformar sin perder causa.
if (!result.ok) {
  return Result.err({ cause: result.error, message: "No pude leer el archivo." });
}

// Origen de dominio: propagar, no re-lanzar.
if (!result.ok) {
  return result;
}
```

No marca `throw new X(...)`, aunque el error original vaya en `{ cause: result.error }`: eso es transformar, no re-lanzar el crudo.

```ts
if (!result.ok) {
  throw new DomainError("No pude guardar", { cause: result.error }); // ✅ error nuevo
}
```

Exenciones deliberadas: archivos de test, controllers Nest, lifecycle/bootstrap (`onModuleInit`, `onApplicationBootstrap`, `forRootAsync`), seeders, decoradores y middleware transversales. En esas fronteras el `throw` puede ser la forma explícita de abortar el arranque o delegar el mapeo al framework. Sin información de tipos la regla se abstiene; sin origen resoluble usa el mensaje genérico, pero igual marca el re-throw crudo.

No tiene autofix. Propagar, envolver o traducir a excepción HTTP es una decisión de capa; un fix mecánico cambiaría semántica.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
