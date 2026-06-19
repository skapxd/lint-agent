### `skapxd/result-error-requires-modeling`

Una frontera que captura con `trySafe` y devuelve `Result` tiene que **modelar** su canal de error, no dejarlo como `unknown`:

```ts
// ❌ La frontera captura, pero el error sale crudo: el consumidor no puede
//    discriminar nada — todo colapsa a un fallo opaco.
async findById(id: string): Promise<Result<User | null, unknown>> {
  return trySafe(() => this.model.findById(id).exec());
}

// ✅ El error crudo del runtime se mapea a un error de dominio (tagged union).
async findById(id: string): Promise<Result<User | null, RepositoryError>> {
  const result = await trySafe(() => this.model.findById(id).exec());
  if (result.ok) {
    return result;
  }
  return Result.err(toRepositoryError(result.error, { operation: "findById", id }));
}
```

`trySafe` siempre devuelve `Result<_, unknown>` porque en JavaScript se puede lanzar cualquier cosa. Esa `unknown` es correcta **dentro** de la frontera, pero no puede ser el contrato hacia arriba: un `Result<_, unknown>` da la *forma* (`{ ok, error }`) sin el *contenido*. El consumidor se queda sin nada sobre lo que hacer `match()` y termina tratando un `CastError` de id invalido (400), un conflicto de clave duplicada (409) y un timeout de conexion (503) como un mismo `500` generico. La frontera es justo el lugar donde todavia se sabe que clase de fallo es; si no se modela ahi, esa informacion se pierde para siempre.

La regla reporta cualquier funcion cuyo tipo de retorno sea `Result<_, unknown>` o `Promise<Result<_, unknown>>` (tambien `any`). El arreglo es transformar el error crudo en un error de dominio —idealmente un tagged union `{ _tag, cause, ... }`— preservando el original en `cause` (lo exige tambien `skapxd/result-error-requires-cause`).

Esta regla es type-aware: usa los parser services de TypeScript para confirmar que el retorno es un `Result` de `@skapxd/result` y para leer el tipo del canal de error, asi que funciona con aliases, tipos inferidos (sin anotacion explicita) y `Promise<Result<...>>`. Sin informacion de tipos se mantiene en silencio.

Opciones:

- `allowFilePatterns: string[]` — globs de archivos exentos (scripts de build, fronteras transversales genuinas donde cualquier fallo se traduce a un mismo output).

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
