### `skapxd/max-public-methods`

`one-root-unit-per-file` limita cuántas unidades viven en el archivo; esta regla aplica el mismo contrato dentro de cada clase: **una clase, una responsabilidad** — máximo `max` métodos públicos (default `1`). Es la regla que convierte un `loans.service.ts` de 1965 líneas en una carpeta de casos de uso (`find-apc-score.service.ts`, `create-signature.service.ts`, ...).

Es **agnóstica al framework** y vive en las reglas base: una clase en Nest, Astro, Next o un proyecto Vite responde al mismo contrato. El conocimiento del framework lo inyecta cada preset vía `ignore` — la regla en sí no sabe qué es NestJS.

```ts
// ❌ dos casos de uso conviviendo
export class ApcService {
  async getScore(id: string) { ... }
  async refreshScore(id: string) { ... }
}

// ✅ un caso de uso con su séquito privado
export class FindApcScoreService {
  constructor(private readonly repository: ApcRepository) {}
  async execute(id: string) { return this.normalize(...); }
  private normalize(raw: unknown) { ... }
}
```

No cuentan: constructor, getters/setters, `private`/`protected`, `#privados` y el prefijo `_`. `ignore` exime nombres por opción — así el **preset `nest`** inyecta sus hooks (`onModuleInit`, `onApplicationBootstrap`, `canActivate`, `intercept`, `transform`, `catch`, `use`, ...): callbacks que el framework llama, no superficie pública. Fuera de Nest esos nombres no significan nada y cuentan como cualquier método.

El preset `nest` además la **apaga en `*.controller.ts` y `*.gateway.ts`**: ahí la forma la dicta el framework (un método por ruta/evento) y el límite no aporta semántica. El mensaje de error es un playbook de refactor completo (nombres semánticos, extracción de estado compartido, actualización del módulo y los imports) pensado para que un agente lo ejecute solo.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
