### `skapxd/class-properties-require-readonly`

Toda propiedad de clase (incluidas las parameter properties del constructor) lleva `readonly`. El estado mutable es la raíz de los **estados inconsistentes** — la misma enfermedad del `useState` con `isLoading`, `error` y `value` llenos a la vez que motivó este paquete: si los campos pueden mutar por separado, las combinaciones imposibles se vuelven posibles. El cambio se modela creando instancias nuevas:

```ts
class Loan {
  constructor(
    readonly amount: number,            // ✅
    private readonly term: number,      // ✅ parameter property también
  ) {}

  withAmount(amount: number): Loan {
    return new Loan(amount, this.term); // el "cambio": una instancia nueva
  }
}

class Cache {
  private entries: string[] = [];       // ❌ private no exime: mutable es mutable
}
```

La mutación inherente (la conexión de un socket que se reemplaza al reconectar) **se declara visible** en `allowPropertyPatterns: ["^currentSocket$"]` — una decisión en la config, greppeable, no un default silencioso.

**Compatibilidad con NestJS, investigada y verificada:**

- **DTOs ✅ sin fricción** (verificado empíricamente con class-transformer + class-validator reales): `readonly` es chequeo de compilación que se borra en runtime — `plainToInstance` asigna, `@Type` convierte, los anidados se instancian y la validación corre igual. El issue conocido de class-transformer ([typestack/class-transformer#250](https://github.com/typestack/class-transformer/issues/250)) es sobre `private readonly` detrás de *getters* (accessors) — patrón que `no-accessors` ya prohíbe.
- **Capa de persistencia ⚠️ exención POR PROPIEDAD, no por archivo**: una propiedad decorada por el ORM (`@Prop` de `@nestjs/mongoose`, `@Column` y compañía de `typeorm` — verificados contra los imports reales, `ormModuleSources` configurable) le pertenece al ORM y a su modelo de mutación (`doc.campo = x; await doc.save()` no compila contra readonly). La precisión importa: una propiedad **sin** `@Prop` dentro de un `*.schema.ts` es estado de clase normal (campos virtuales, caches) y sí exige `readonly` — la exención por nombre de archivo la habría silenciado.
- **Cuidado con los TIPOS array readonly** (`tags: readonly string[]`, `ReadonlyArray<T>`): el plugin de `@nestjs/swagger` degrada su inferencia con ellos ([nestjs/swagger#2413](https://github.com/nestjs/swagger/issues/2413)). Esta regla exige el modificador en la *propiedad* (`readonly tags: string[]`), que es inocuo para el plugin — no uses los tipos array readonly en DTOs.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
