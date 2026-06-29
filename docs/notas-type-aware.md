# Notas type-aware, supuestos y limites

[README principal](../README.md)

## Supuestos y límites conocidos

Tres reglas se apoyan en **convenciones de React/JS** para identificar lo que miran. No son fallos: son el contrato de la regla. Conviene conocerlos:

| Regla | Supuesto | Implicación |
| --- | --- | --- |
| `no-functions-inside-components` | "Componente" = función con nombre **PascalCase**. | Un componente en minúscula o anónimo no se detecta; una función PascalCase que *no* sea componente podría marcarse. |
| `jsx-return-name-pascal-case` | Detecta **JSX literal** en el cuerpo de la función. | Si devuelves JSX por indirección (`return render()`), no se detecta. |
| `max-hook-size` | "Hook" = nombre que empieza con **`use`**; el tamaño se mide en líneas. | Una función con lógica de hook pero sin prefijo `use` no se mide. |

Estos supuestos **se auto-refuerzan** con el resto de Lint Agent: si nombras un componente en minúscula, `jsx-return-name-pascal-case` te obliga a pasarlo a PascalCase, y entonces `no-functions-inside-components` ya lo reconoce. Por eso no perseguimos "robustez" más allá de la convención: las reglas que la imponen cierran el hueco.

En cambio, las reglas atadas a `@skapxd/result` (`async-functions-return-result`, `result-error-requires-cause`, `await-requires-result`) **no** dependen de nombres: resuelven el símbolo hasta el paquete real (vía el `name` de su `package.json`), así que funcionan con alias, re-exports y en monorepos.

## Notas sobre reglas type-aware

Algunas reglas necesitan información real de TypeScript. Los presets que la necesitan configuran:

```js
languageOptions: {
  parserOptions: {
    projectService: true,
  },
}
```

Esto hace el lint un poco más lento, pero reduce falsos positivos importantes: por ejemplo, distinguir un `Result` real de `@skapxd/result` de otro objeto que casualmente también tenga propiedades `ok` y `error`.

### No mezclar `projectService` con `parserOptions.project`

Los presets tipados (`shared.backend`, `shared.frontend`, `shared.package` y los presets de framework que se apoyan en ellos) ya traen el parser de `typescript-eslint` y `parserOptions.projectService: true`.

Ese es el contrato por defecto porque deja que `typescript-eslint` encuentre el proyecto TypeScript correcto para cada archivo sin pedirle al consumidor que mantenga una lista manual de `tsconfig`. Es el camino recomendado para flat config en proyectos con varios paquetes, tests, scripts o entrypoints.

El anti-patrón es tomar un preset tipado y volver a declarar `parserOptions.project` encima:

```js
import skapxd from "@skapxd/eslint-opinionated";

export default [
  {
    files: ["src/**/*.ts"],
    ...skapxd.configs.shared.backend,
    languageOptions: {
      ...skapxd.configs.shared.backend.languageOptions,
      parserOptions: {
        ...skapxd.configs.shared.backend.languageOptions.parserOptions,
        project: "./tsconfig.json",
      },
    },
  },
];
```

Reproducido con `eslint@9.39.4`, `typescript-eslint@8.59.4` y `typescript@5.9.3`, ese choque falla antes de ejecutar reglas:

```text
/private/tmp/eslint-opinionated-issue-6-repro/src/index.ts
  0:0  error  Parsing error: Enabling "project" does nothing when "projectService" is enabled. You can remove the "project" setting

✖ 1 problem (1 error, 0 warnings)
```

Si necesitas sumar reglas type-aware propias, reutiliza el `languageOptions` del preset y agrega solo `rules` o `plugins`; no declares otro parser ni otro proyecto TypeScript:

```js
import customPlugin from "eslint-plugin-custom";
import skapxd from "@skapxd/eslint-opinionated";

const backend = skapxd.configs.shared.backend;

export default [
  {
    files: ["src/**/*.ts"],
    ...backend,
    languageOptions: backend.languageOptions,
    plugins: {
      ...backend.plugins,
      custom: customPlugin,
    },
    rules: {
      ...backend.rules,
      "custom/requires-domain-error": "error",
    },
  },
];
```

## Contrato mínimo de `typescript-eslint`

Los presets type-aware se publican como contrato: si una regla u opción entra al preset, el `peerDependency` debe declarar la versión mínima real que la soporta. El script `pnpm test:peer-minimum` construye el paquete, lo instala en un proyecto temporal con los peers mínimos exactos y carga cada preset tipado con ESLint.

| Requisito del catálogo | Versión mínima de `typescript-eslint` | Por qué importa |
| --- | --- | --- |
| Wrappers `no-unsafe-*`, `no-floating-promises`, `no-non-null-assertion`, `ban-ts-comment`, `consistent-type-definitions`, `no-unnecessary-condition` | `8.15.0` | Cubre la familia envuelta y deja disponible `no-unsafe-type-assertion` para la siguiente regla del cluster. |
| `allowConstantLoopConditions: "only-allowed-literals"` en `skapxd/no-impossible-branch` | `8.24.0` | Frontera verificada con validación real de ESLint (8.23 rechaza el schema, 8.24 acepta); una bisección anterior dijo 8.31 por installs fallidos silenciados — corregida. |
| Mínimo declarado del paquete | `>=8.24` | Máximo entre 8.15 (`no-unsafe-type-assertion`, para #14) y 8.24 (la opción ya publicada): el mínimo REAL — ni laxo (mentía con >=8) ni más estricto de lo necesario (8.31 excluía 7 versiones válidas). |

## Licencia

MIT
