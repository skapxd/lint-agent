### `skapxd/nest-controller-delegates-to-use-case`

Un route handler Nest adapta HTTP y delega una sola operación de aplicación. Si verifica firmas, transforma payloads, decide flujo, llama helpers o coordina varios casos de uso, el controller deja de ser frontera de transporte y se convierte en una segunda capa de aplicación sin contrato propio.

```ts
@Controller("webhooks")
export class WebhookController {
  @Post()
  receive(@Body() payload: WebhookDto) {
    const isMessage = payload.event === "message";
    this.recordWebhookUseCase.execute(payload);
    if (isMessage) this.receiveMessageUseCase.execute(payload.data);
    return WebhookAckDto.fromPrimitives({ ok: true });
  }                                      // ❌ transforma, decide y coordina
}
```

La forma preferida deja la operación completa detrás de un único `@UseCase`:

```ts
@Controller("webhooks")
export class WebhookController {
  @Post()
  receive(@Body() payload: WebhookDto) {
    return this.handleWebhookUseCase.execute(payload);
  }                                      // ✅ una frontera, una delegación
}
```

La regla es type-aware. Solo analiza clases cuyo `Controller` y métodos HTTP (`Delete`, `Get`, `Head`, `Options`, `Patch`, `Post`, `Put`) vienen importados desde `nestDecoratorSource` (`@nestjs/common` por defecto); sigue aliases y no acepta decoradores locales homónimos. La llamada válida tiene la forma no computada y no opcional `this.<dependencia>.execute(...)`: el checker resuelve el receptor hasta su `ClassDeclaration` y exige un `@UseCase` real importado desde `useCaseDecoratorSource` (`@skapxd/nest` por defecto). No usa sufijos, nombres de archivo ni listas de APIs supuestamente malas.

La gramática normal acepta exactamente un statement: `return this.useCase.execute(...)`, `return await this.useCase.execute(...)`, `await this.useCase.execute(...)` o `this.useCase.execute(...)`. Los argumentos solo pueden adaptar valores de transporte de forma trivial: identificadores, literales, accesos de propiedad sin llamadas, arrays sin spreads y objetos literales cuyos valores cumplen la misma gramática. Calls o `new` anidados, branching, operadores, assignments, updates, spreads, interpolación de templates, callbacks y casts quedan fuera.

El único segundo statement permitido es un ACK simple:

```ts
await this.recordWebhookUseCase.execute({
  payload,
  rawBody: request.rawBody,
  signature,
});

return WebhookAckDto.fromPrimitives({ ok: true });
```

El checker exige que la expresión retornada tenga el brand `dto` de `dtoLayerSource` (`@skapxd/nest` por defecto). Un factory o constructor de ACK solo recibe valores triviales; un objeto fabricado con cast, una clase plana o un factory que ejecuta otra llamada no pasa.

Cada handler produce como máximo un reporte. La prioridad es estable: múltiples llamadas a `@UseCase`, control flow, calls o construcciones adicionales, transformaciones/statements fuera de la gramática y ausencia de delegación. La regla no intenta decidir si una llamada es negocio, infraestructura, criptografía o seguridad: cualquier call adicional rompe la gramática por forma ejecutable, no por clasificación semántica.

Los handlers con un parámetro decorado mediante `@Res` o `@Next` real de `nestDecoratorSource` quedan fuera de V1 porque controlan la respuesta manualmente. `@Req`, `@Headers`, `@Body`, `@Param` y `@Query` no eximen: sus valores pueden cruzar directamente al use-case. Gateways y SSE también quedan fuera de V1; los gateways no son `@Controller` y `@Sse` no forma parte de los métodos HTTP configurados por defecto. `StreamableFile` y redirects no necesitan excepciones si el handler delega directamente.

Sin type information, reporta `missingTypeInformation` una sola vez en `Program` y exige activar `projectService`/parser services. `allowFilePatterns` se evalúa antes; por defecto exime `**/*.spec.ts`, `**/*.test.ts` y `**/*.e2e-spec.ts`.

Opciones: `allowFilePatterns`, `controllerDecoratorNames`, `httpMethodDecoratorNames`, `nestDecoratorSource`, `responseHandlerParamDecorators`, `useCaseDecoratorNames`, `useCaseDecoratorSource` y `dtoLayerSource`.

Sin autofix: extraer un caso de uso cambia arquitectura, dependencias y tests. La regla está registrada como opt-in; el issue [#191](https://github.com/skapxd/lint-agent/issues/191) conserva la decisión pendiente de activarla en `skapxd/nest/base` después de revisar las mediciones. Si entra, la doctrina del repo exige `error`, nunca `warn`.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
