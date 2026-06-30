# Presets y estructura de Lint Agent

[README principal](../README.md)

## Estructura del paquete

Lint Agent se publica tecnicamente como `@skapxd/lint-agent`; los subpaths de esta seccion mantienen ese identificador porque son contratos de importacion.

```text
src/
├── index.ts            ← entrypoint del plugin (registro de reglas y presets)
├── cli.ts              ← bin skapxd-lint
├── rules/              ← una regla por archivo
├── constants/          ← convenciones de frameworks (entrypoints, hooks, stems)
├── shared/             ← reglas base + presets base/backend/frontend/package + strict
├── nest/ next/ astro/  ← presets por framework
└── utils/              ← un util por archivo, agrupados por dominio:
    ├── ast/               lectura estructural del AST
    ├── async/             awaits y AbortSignal
    ├── imports/           provenance de imports (evidencia, no convención)
    ├── matching/          globs y regex (picomatch)
    ├── naming/            kebab/pascal case
    ├── nest/              decoradores y nest-cli.json
    ├── options/           lectura tipada de las opciones de cada regla
    ├── project/           filesystem del proyecto (package.json, tsconfig)
    ├── react/             JSX, hooks, useState
    ├── result/            el corazón: detección type-aware de @skapxd/result
    ├── rule-authoring/    frontera de tipos y wrapper de typescript-eslint
    ├── suggestions/       mensajes que enseñan (ejemplos y árboles sugeridos)
    ├── text/              emojis y texto
    └── type-aware/        type-checker: símbolos, firmas, type predicates
```

| Módulo | Propósito |
| --- | --- |
| `@skapxd/lint-agent/shared` | Reglas y presets comunes para backend, frontend y paquetes npm. |
| `@skapxd/lint-agent/nest` | Presets específicos para NestJS. |
| `@skapxd/lint-agent/next` | Presets específicos para Next.js. |
| `@skapxd/lint-agent/astro` | Presets específicos para Astro. |
| `@skapxd/lint-agent` | Entry point principal con todas las reglas y configs. |

## Presets

Los presets tipados ya traen `parserOptions.projectService: true`. Si necesitas sumar reglas type-aware propias, no agregues `parserOptions.project`: reutiliza el `languageOptions` del preset. Ver [la nota sobre `projectService` y `parserOptions.project`](./notas-type-aware.md#no-mezclar-projectservice-con-parseroptionsproject).

### Shared

Las reglas agnosticas al framework viven en `shared.base` como `error`. Por eso `skapxd/nested-function-requires-capture`, que solo depende de AST y scope, `skapxd/no-magic-numbers`, que wrappea una regla sintactica calibrada sin type info, y `skapxd/dense-function-requires-comment`, que mide estructura local sin type info, quedan en las bases y las heredan `shared.backend`, `shared.frontend`, `shared.package` y los presets de framework que extienden las bases.

```js
import skapxd from "@skapxd/lint-agent";

export default [
  skapxd.configs.shared.base,
  skapxd.configs.shared.frontend,
  skapxd.configs.shared.backend,
];
```

### Backend

```js
import skapxd from "@skapxd/lint-agent";

export default [
  {
    files: ["src/server/**/*.{ts,tsx}", "src/app/api/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.backend,
  },
];
```

El contrato del back es el mismo que el del front: todo `await` debe resolver en un `Result` (`skapxd/await-requires-result`). Exigir además la firma `Promise<Result<...>>` en cada función async (`skapxd/async-functions-return-result`) está **apagado por defecto** — los motivos están documentados en la sección de esa regla. Si quieres el contrato duro, actívala encima del preset:

```js
export default [
  {
    files: ["src/server/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.backend,
    rules: {
      ...skapxd.configs.shared.backend.rules,
      "skapxd/async-functions-return-result": [
        "error",
        { checkMissingReturnType: true },
      ],
    },
  },
];
```

### Frontend

```js
import skapxd from "@skapxd/lint-agent";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.frontend,
  },
];
```

El contrato del front: ninguna función está obligada a retornar `Result`, pero toda llamada asíncrona debe ir envuelta en `trySafe` — salvo que lo llamado ya retorne `Result`/`Promise<Result<...>>` (exención type-aware de `skapxd/await-requires-result`). Aplica el preset a TODO el código del front (componentes, hooks, servicios), no solo a los componentes.

### Next.js

```js
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import skapxd from "@skapxd/lint-agent";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
  ...skapxd.configs.next,
];
```

También puedes importar solo el factory de Next.js:

```js
import skapxd from "@skapxd/lint-agent";
import { createNextConfigs } from "@skapxd/lint-agent/next";

export default [
  ...createNextConfigs(skapxd),
];
```

### NestJS

```js
import skapxd from "@skapxd/lint-agent";

export default [
  ...skapxd.configs.nest,
];
```

Nest trae un modelo de errores por excepciones (`HttpException` + exception filters). El preset no pelea contra eso: asigna a cada capa su rol en el pipeline de Result:

| Capa Nest | Rol | Contrato |
| --- | --- | --- |
| Services / use-cases | El dominio puro | Todo retorna `Promise<Result<T, DomainError>>`; `trySafe` en la frontera con Mongoose/Prisma/HTTP |
| Controllers | La frontera | Consumen el Result con `match()`: rama ok → DTO, rama err → `throw new HttpException(...)`. El `throw` aquí es el idioma del framework, no una fuga |
| Exception filter global | **El suelo del sistema** | Recibe todo lo que escapó, con el `cause` completo → telemetría/log (ver "El suelo del sistema") |

Detalles del preset:

- Aplica a `src/**/*.ts` — `dev/`, `scripts/`, `e2e/` e `integration-test/` quedan fuera a propósito: no son la app.
- Los entrypoints (`main.ts`, `instrumentation.ts`, `app-cluster.ts`) están exentos de `await-requires-result`: el bootstrap debe crashear ruidoso. Con `no-floating-promises` activa, el clásico `bootstrap();` del `main.ts` se escribe `void bootstrap();` — fire-and-forget declarado.
- Los specs colocados (`*.spec.ts`, `*.e2e-spec.ts`) relajan `await-requires-result`, `no-try-catch`, `result-error-requires-handling` y `no-non-null-assertion` (el `!` sobre un fixture es el arrange del test): un test awaitea helpers libremente y descartar un Result en una aserción no es perder un trace. `no-floating-promises` sigue activa en specs: un `await` olvidado es un falso verde.
- Activa `skapxd/nest-no-result-response` (ver su sección): un controller jamás retorna el Result crudo.
- **El contrato Swagger vive en los DTOs, no en el controller.** El preset asume el plugin `@nestjs/swagger` activo en `nest-cli.json` (introspecciona query/params/body y tipo de retorno solo): `nest-dto-requires-api-property` exige `@ApiProperty` en toda propiedad pública de un `*.dto.ts`, y `nest-no-swagger-in-controllers` prohíbe los decoradores redundantes (`@ApiOperation`, `@ApiResponse`, `@ApiParam`, ...) en los controllers — solo se permiten los que el plugin no puede inferir: `ApiExcludeEndpoint`, `ApiTags`, `ApiBearerAuth`, `ApiConsumes`/`ApiBody` (uploads multipart).
- **Todo DTO valida en runtime**: `nest-dto-requires-validation` exige class-validator en cada propiedad, coherencia `?` ↔ `@IsOptional`, y `@Type` de class-transformer junto a `@ValidateNested`. Mongo schemaless no impone contrato; la app sí. Para uniones discriminadas o genéricos no triviales, modela con zod/valibot o especializa el DTO, no con `@Allow()` ni `unknown`.
- **Una clase = una responsabilidad**: `max-public-methods` (de las reglas base) corre con los hooks de Nest inyectados vía `ignore`, y se apaga en `*.controller.ts`/`*.gateway.ts` donde el framework dicta la forma. `nest-no-direct-instantiation` (dependencias por constructor, no `new`) en `*.service.ts`; `nest-no-inline-query-params` en `*.controller.ts` (2+ query params → DTO consolidado).
- **La configuración del proyecto también se lintea**: las premisas de las que dependen las demás reglas se verifican, no se asumen. `nest-requires-swagger-plugin` lee el `nest-cli.json` real (subiendo desde `src/main.ts`) y exige el plugin `@nestjs/swagger`; `nest-validation-pipe-config` exige `transform: true` (sin él, los `@Type` de los DTOs no hacen nada) y `whitelist: true` (sin él, las props sin decorador pasan crudas) en todo `new ValidationPipe`.

### Astro

```js
import skapxd from "@skapxd/lint-agent";

export default [
  ...skapxd.configs.astro,
];
```

> Para los archivos `.astro` el preset no impone parser: necesitas tener
> `eslint-plugin-astro` configurado (su preset recomendado ya lo aporta).
> Los `.ts/.tsx` sí traen el parser de `typescript-eslint` incluido.

El bloque `src/**/*.{ts,tsx}` de Astro trae el mismo set type-driven de `shared.frontend` (`no-unsafe-*`, `no-explicit-any`, `no-impossible-branch`, `no-floating-promises`, `no-unverified-cast`, etc.) sobre `projectService`, además de `await-requires-result`. Los archivos `.astro` quedan fuera de ese bloque type-aware: reciben las reglas base, y el parser/procesador específico lo sigue aportando `eslint-plugin-astro`.

Si `skapxd/requires-strict-tsconfig` reporta que faltan `noImplicitReturns` o `noUncheckedIndexedAccess`, corrige el `tsconfig` antes de limpiar en masa `no-impossible-branch`: sin esos flags, TypeScript finge que accesos como `rows[0]` o `record[key]` nunca devuelven `undefined`, y esa mentira puede convertir guards necesarios en falsos positivos.

También puedes importar solo el factory de Astro:

```js
import skapxd from "@skapxd/lint-agent";
import { createAstroConfigs } from "@skapxd/lint-agent/astro";

export default [
  ...createAstroConfigs(skapxd),
];
```

### Paquete npm

```js
import skapxd from "@skapxd/lint-agent";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    ...skapxd.configs.shared.package,
  },
];
```

Para librerías npm escritas en TypeScript (tsup o equivalente). Trae las bases completas + el set type-driven (tipado, con `projectService`) + `await-requires-result` + el contrato de empaquetado:

- `skapxd/package-requires-typed-exports` — los `exports` del package.json cablean los tipos **por condición** (`import` → `.d.mts`, `require` → `.d.ts`); el `types` único por subpath es el bug "FalseCJS".
- `skapxd/untrusted-module-requires-adapter` — inerte hasta que declares tu inventario de paquetes con tipos mentirosos (ver su sección).

**Lint Agent se lintea con este preset** — dogfood: la regla de exports nos obligó a corregir nuestro propio package.json al nacer.

### Strict (sin escape via `eslint-disable`)

Un prompt o un agente puede saltarse cualquier regla con `// eslint-disable-next-line`. El preset `strict` activa `noInlineConfig`, que hace que ESLint **ignore todas las directivas inline** en los archivos que cubre: ningún `eslint-disable` surte efecto, así que las reglas no se pueden bypassear.

```js
import skapxd from "@skapxd/lint-agent";

export default [
  ...skapxd.configs.next,
  // Aplícalo al final, acotado a los archivos donde quieras blindar las reglas.
  {
    files: ["src/**/*.{ts,tsx}"],
    ...skapxd.configs.strict,
  },
];
```

Si necesitas una excepción puntual (p. ej. archivos generados), añade después un bloque con `linterOptions: { noInlineConfig: false }` para esos globs.
