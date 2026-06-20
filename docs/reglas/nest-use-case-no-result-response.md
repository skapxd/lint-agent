### `skapxd/nest-use-case-no-result-response`

Un `@UseCase` es la frontera de aplicacion: consume el `Result` de repositories, providers o domain-services y lanza la excepcion que el exception filter de Nest mapea a HTTP. Si el use-case devuelve `Result`, el envelope `{ ok, error }` sube hasta el controller y obliga a re-mapear `result.error -> HttpException` a mano, duplicando el mecanismo que Nest ya ofrece.

```ts
@UseCase()
export class GetUserUseCase {
  // ❌ la frontera de aplicacion propaga el envelope hacia arriba
  async execute(id: string): Promise<Result<UserDto, UserNotFoundError>> {
    return this.users.findById(id);
  }
}
```

La forma esperada es desenvolver el `Result` dentro del use-case y lanzar ahi la excepcion de frontera:

```ts
@UseCase()
export class GetUserUseCase {
  // ✅ el use-case consume Result y sale por DTO o excepcion
  async execute(id: string): Promise<UserDto> {
    const result = await this.users.findById(id);

    return result.match({
      ok: (user) => toUserDto(user),
      err: (error) => {
        throw new NotFoundException(messageFrom(error));
      },
    });
  }
}
```

La regla es type-aware: resuelve el tipo real del metodo publico y reporta `Result<...>` o `Promise<Result<...>>`, aunque el retorno sea inferido. Tambien resuelve el decorador de la clase con TypeScript y exige que `@UseCase` venga del paquete configurado en `useCaseDecoratorSource` (`@skapxd/nest` por defecto); un decorador local falso llamado `UseCase` no aplica.

Solo mira metodos publicos (`kind === "method"`). Metodos `private`, `protected` o `#`-private pueden devolver `Result` porque son plumbing interno; getters, setters y constructors quedan fuera. Una clase sin `@UseCase` real tampoco aplica: en repositories/providers de capa baja, devolver `Result` sigue siendo el contrato correcto.

Opciones: `allowFilePatterns`, `useCaseDecoratorNames` y `useCaseDecoratorSource`.

Sin autofix: decidir que excepcion lanzar y como mapear el error de dominio no es una transformacion mecanica segura.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
