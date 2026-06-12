### `skapxd/nest-no-direct-instantiation`

En un service, `new FooService()` sobre un import **interno del proyecto**
esquiva el contenedor de DI: NestJS no resuelve sus dependencias, no
participa del lifecycle, y la clase deja de ser testeable con mocks. Las
dependencias entran por el constructor:

```ts
import { FooService } from "#/modules/foo/foo.service";

const foo = new FooService();                            // ❌ esquiva la DI

constructor(private readonly fooService: FooService) {}  // ✅ NestJS resuelve
```

La robustez viene en capas:

1. **Los globals del runtime nunca se marcan** (`new Date()`, `new Map()`,
   `new AbortController()`): la regla parte de los **imports internos**
   (`internalPatterns`: alias `#/`, `@/` y relativos), y un global no se
   importa. Las librerías externas (`new Logger(...)`) también libres, y los
   `import type` no cuentan.
2. **Exención por nombre de clase** (`allowedClassPatterns`, default
   `(Error|Exception|Event)$`): errores, excepciones y eventos de dominio se
   construyen, no se inyectan — vivan en el archivo que vivan.
3. **La capa type-aware** (con `projectService`, que el preset trae): la
   regla resuelve el símbolo de la clase importada y pregunta por el
   decorador `@Injectable`. Sin el decorador es una clase de valor (un DTO,
   un mapper puro) y el `new` es legítimo; con él, pertenece al contenedor y
   se reporta. Irresoluble → conservador, se reporta. En un proyecto real
   esta capa eliminó el 100% de los falsos positivos restantes.

`allowedPatterns` (regex de sources) sigue disponible para convenciones
propias. El preset la activa en `*.service.ts`.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
