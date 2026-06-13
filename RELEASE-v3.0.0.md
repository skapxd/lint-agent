# Release v3.0.0

v3.0.0 publica lo acumulado en `main` desde `v2.0.0`. Es una major porque los presets tipados ahora activan nuevas reglas type-aware como `error` y el peer minimo real de `typescript-eslint` sube a `>=8.24`.

## BREAKING CHANGES

### Presets tipados mas estrictos

Los presets type-aware (`backend`, `frontend`, `package`, `nest/base` y los presets que los componen) ahora activan como `error` estas reglas nuevas del catalogo:

- `skapxd/no-unsafe-assignment`
- `skapxd/no-unsafe-member-access`
- `skapxd/no-unsafe-call`
- `skapxd/no-unsafe-return`
- `skapxd/no-unsafe-argument`
- `skapxd/no-unverified-cast`
- `skapxd/prefer-schema-validation`

Impacto esperado: un consumidor backend o legacy puede recibir cientos o miles de hallazgos al actualizar, especialmente por la familia `no-unsafe-*` y por casts `as` que estrechan sin evidencia runtime.

Migracion:

1. No adoptes todo en un solo PR si el proyecto ya tiene deuda.
2. Mantén el preset completo como meta y apaga temporalmente las reglas pendientes con el bloque de `off` descrito en [`docs/adopcion-legacy.md`](./docs/adopcion-legacy.md).
3. Borra una linea del bloque `off`, arregla esa regla a cero, mergea, y repite por olas.
4. Usa `unknown` en fronteras externas y valida con schema o predicate antes de tocar propiedades, llamar funciones, retornar datos o hacer casts que estrechan.

### Peer minimo real de `typescript-eslint`

`peerDependencies.typescript-eslint` cambia de `>=8` a `>=8.24`.

El rango anterior mentia: el paquete ya dependia de opciones y reglas que no estan soportadas por todas las versiones `8.x`. El contrato queda protegido por `pnpm test:peer-minimum`, que instala el paquete empacado con los peers minimos exactos y carga los presets tipados.

Migracion:

```bash
pnpm add -D typescript-eslint@^8.24
```

Si usas npm o yarn, actualiza la misma dependencia de desarrollo al menos a `8.24.0`.

## Cambios destacados no breaking

### Documentacion navegable

- El README queda como entrada corta de npm y el contenido largo pasa a `docs/`.
- Cada regla tiene ficha propia en `docs/reglas/`.
- El test de integridad docs <-> reglas protege que el catalogo, README e indice sigan sincronizados.

### Reestructura interna de `utils/`

- `utils/` se agrupa por dominios (`ast`, `async`, `imports`, `type-aware`, `rule-authoring`, `options`, etc.).
- No cambia la API publica; es deuda interna pagada para sostener reglas nuevas y dogfood mas estricto.

### Tipos honestos y fin de escapes

- Los consumidores internos de `RuleNode` migran a tipos honestos de `TSESTree`.
- Se eliminan escapes `@ts-nocheck` legacy y se refuerza la frontera de tipos del plugin.
- La lista dogfood deja de depender de silenciar el compilador para que el repo pueda aplicarse sus propias reglas.

### Contrato de peer minimo en CI

- Nuevo script `pnpm test:peer-minimum`.
- CI instala el paquete empacado en un proyecto temporal con `eslint@9.0.0`, `typescript@5.0.2` y `typescript-eslint@8.24.0`.
- Al taggear, el release queda cubierto contra publicar un peer demasiado laxo.

### Performance por release

- Nuevo `pnpm measure:rules`.
- Nuevo workflow manual y por tag `v*` para medir reglas, publicar el reporte completo en #18 y actualizar el dashboard de performance #31.
- El runner de timing queda fijado en `ubuntu-24.04` y los logs muestran progreso por regla.

### CI mas exigente

- `pnpm lint` entra al job principal de CI antes de tests.
- El publish por tag queda protegido por `build-and-test` y `peer-minimum-contract`.
- Actions se actualizan a majors compatibles con Node 24, manteniendo la matriz Node 22/24 y publish en Node 22.

### CLI y workflow del repo

- `skapxd-lint-changed --base` deja de interpolar por shell y pasa argumentos a `git` con `execFileSync`.
- `AGENTS.md` documenta el flujo GitHub-first del repo, worktrees por tarea, formato de comentarios, mediciones de solo lectura y restricciones de release.
- Las plantillas de issue quedan endurecidas para propuestas de reglas y deuda tecnica.

## PRs incluidos

| PR | Cambio |
| --- | --- |
| #19 | README dividido en `docs/`, fichas por regla y guardrail docs-integrity. |
| #20 | Flujo GitHub-first para agentes en `AGENTS.md`. |
| #21 | CI sobre actions compatibles con Node 24. |
| #22 | `skapxd-lint-changed --base` sin interpolacion de shell. |
| #24 | `RuleNode` honesto y eliminacion de escapes de tipos. |
| #27 | Contrato del peer minimo y `pnpm test:peer-minimum`. |
| #28 | Nueva regla `skapxd/no-unverified-cast`. |
| #29 | Nueva regla `skapxd/prefer-schema-validation`. |
| #30 | Medidor permanente de timing por regla. |
| #32 | Fix del separador `--` en el workflow de timing. |
| #33 | Dashboard de timing por release/tag. |
| #34 | Logs incrementales del medidor de timing. |
| #35 | Docs de `projectService` vs `parserOptions.project`. |
| #38 | Activacion de `no-unverified-cast` y `prefer-schema-validation` en presets tipados. |
| #39 | `pnpm lint` como gate de CI. |

Ademas, el rango `v2.0.0..origin/main` incluye los commits de wrappers `no-unsafe-*`, reestructura de `utils/`, templates de issues y limpieza de deuda dogfood que preparan esta major.

## Verificacion esperada antes de cortar tag

```bash
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
pnpm build && pnpm typecheck && pnpm test && pnpm lint && pnpm test:peer-minimum
```

## Paso final del dueño

El tag lo corta el dueño, no el agente:

```bash
git tag v3.0.0 && git push origin v3.0.0
```

Al taggear `v3.0.0`, el workflow de publish debe publicar npm y el workflow de timing debe poblar el dashboard. Ese tag tambien deja cerrado el pendiente operativo de #25.
