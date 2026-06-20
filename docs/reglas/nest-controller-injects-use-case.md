### `skapxd/nest-controller-injects-use-case`

Un controller o gateway es frontera de transporte: recibe HTTP/WebSocket, delega el flujo de negocio y devuelve un DTO o lanza lo que NestJS sabe mapear. Si inyecta un repository/service directo, salta el use-case; con eso salta autorizacion, validaciones de dominio, mapeo de errores y cualquier regla que viva en la capa de aplicacion.

```ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersRepository: UsersRepository) {}
}                                      // ❌ salta el use-case
```

La dependencia correcta es un caso de uso marcado con `@UseCase` real de `@skapxd/nest`:

```ts
@UseCase()
export class GetUserUseCase {}

@Controller("users")
export class UsersController {
  constructor(private readonly getUser: GetUserUseCase) {}
}                                      // ✅ controller -> use-case
```

La regla es type-aware y mira los parametros del constructor de clases decoradas con `@Controller` o `@WebSocketGateway`. Para cada parametro resuelve el tipo hasta la `ClassDeclaration` real; si no hay type-info, el tipo es `any`/`unknown`, no resuelve a clase, o no hay simbolo confiable, se abstiene. Si la clase viene de origen externo (`node_modules`, libreria default, caches de runtime) se permite: infra de framework como config, logger, reflector o adaptadores externos no son dominio del proyecto. Tambien se permite una allowlist explicita por nombre con `allowedInjectionTypeNames`.

El caso de uso no se detecta por sufijo ni por nombre de archivo. La regla lee los decoradores de la clase inyectada, resuelve el simbolo del decorador con TypeScript y exige que el simbolo venga del paquete configurado en `useCaseDecoratorSource` (`@skapxd/nest` por defecto) y que su nombre resuelto este en `useCaseDecoratorNames` (`UseCase` por defecto). Un decorador local llamado `UseCase` no pasa.

Gateways no quedan exentos: `@WebSocketGateway` tambien es frontera de transporte y solo orquesta casos de uso. Una clase sin `@Controller`/`@WebSocketGateway` no aplica a esta regla; el modelo de capas bajo el use-case se gobierna por reglas separadas.

Opciones: `allowFilePatterns`, `controllerDecoratorNames`, `gatewayDecoratorNames`, `useCaseDecoratorNames`, `useCaseDecoratorSource` y `allowedInjectionTypeNames`.

Sin autofix: decidir si una clase debe marcarse con `@UseCase` o si hay que extraer un use-case nuevo cambia arquitectura, no sintaxis.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
