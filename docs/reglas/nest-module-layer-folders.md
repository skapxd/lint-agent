### `skapxd/nest-module-layer-folders`

Un módulo Nest bajo `src/modules/<modulo>/` debe declarar su arquitectura en el árbol: `http/` recibe transporte, `application/` contiene casos de uso, `domain/` guarda el modelo puro, `infrastructure/` encierra adaptadores runtime/DB/git y `contracts/` contiene contratos externos no HTTP. La raíz queda reservada para `<modulo>.module.ts` e `index.ts`.

```text
src/modules/whatsapp/open-wa-webhook.controller.ts                 ❌ controller plano
src/modules/whatsapp/runtime/whatsapp-client.ts                    ❌ carpeta top-level no declarada
src/modules/whatsapp/http/openwa/openwa.module.ts                  ❌ module file anidado
```

La forma esperada hace visibles las fronteras sin leer el código:

```text
src/modules/whatsapp/whatsapp.module.ts                            ✅ composición en la raíz
src/modules/whatsapp/http/openwa/open-wa-webhook.controller.ts     ✅ transporte HTTP
src/modules/whatsapp/application/receive-message.use-case.ts       ✅ caso de uso
src/modules/whatsapp/domain/incoming-message.ts                    ✅ dominio
src/modules/whatsapp/infrastructure/runtime/whatsapp-client.ts     ✅ adaptador runtime
src/modules/whatsapp/contracts/provider.contract.ts                ✅ contrato externo no HTTP
```

La regla no exige que existan todas las capas. Un módulo pequeño puede tener solo `http/` y `application/`; lo que prohíbe es esconder archivos planos en la raíz o inventar carpetas top-level como `runtime/`, `postgres/` u `openwa/` fuera de una capa declarada. Los `*.module.ts` anidados fallan porque v1 no modela submódulos implícitos.

La clasificación combina ruta con evidencia ejecutable. Los sufijos `*.controller.ts`, `*.gateway.ts` y `*.dto.ts` apuntan a `http/`; `*.use-case.ts` apunta a `application/`. También reconoce `@Controller`, `@WebSocketGateway`, `@UseCase` y `extends Dto()` solo cuando el símbolo local viene importado desde su paquete configurado; aliases importados cuentan y decoradores locales con el mismo nombre no. La regla funciona sin type checker y no convierte la falta de type info en fatal.

Los sufijos de infraestructura no están activos por defecto. `repository`, `client` o `reader` son nombres demasiado ambiguos para imponerlos sin calibración; si un proyecto demuestra señal suficiente puede activarlos explícitamente:

```js
"skapxd/nest-module-layer-folders": [
  "error",
  {
    modulesRoot: "src/modules",
    allowedLayers: ["http", "application", "domain", "infrastructure", "contracts"],
    rootFileNames: ["index.ts"],
    allowFilePatterns: ["**/*.fixture.ts"],
    suffixLayers: {
      infrastructure: [".repository.ts", ".client.ts"],
    },
    controllerDecoratorSource: "@nestjs/common",
    gatewayDecoratorSource: "@nestjs/websockets",
    useCaseDecoratorSource: "@skapxd/nest",
    dtoLayerSource: "@skapxd/nest",
  },
],
```

`suffixLayers` amplía los defaults por capa; declarar una capa existente reemplaza solo sus sufijos, así que `{ http: [] }` desactiva la clasificación HTTP por nombre sin apagar la evidencia de imports. Los specs colocados (`**/*.spec.ts`, `**/*.test.ts`, `**/*.e2e-spec.ts`) siempre están permitidos y `allowFilePatterns` agrega exenciones del proyecto.

Sin autofix: mover archivos cambia imports, providers, exports y a veces el grafo de módulos Nest. La regla enseña el destino, pero no hace un rename parcial peligroso. Tampoco valida dirección de imports entre capas; ese contrato necesita otra regla y otra medición.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
