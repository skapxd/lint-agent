# TODO

Memoria de trabajo del repo. Cada tarea es **autoexplicativa**: contiene todo
el contexto para retomarla sin el chat donde nació. Contrato del archivo:

- Cada entrada lleva: **estado**, **fecha de creación**, **por qué existe y
  qué resuelve**, **acciones ya ejecutadas** y **análisis de implementación**
  (el análisis vive aquí; el código vive en el código).
- Estados: `pendiente` · `bloqueada (decisión)` · `en progreso` · `hecha`.
- Al terminar una tarea se mueve a la sección "Hechas" con la fecha de
  cierre y el commit/versión que la resolvió. Este archivo solo se publica
  en el repo (npm solo empaqueta `dist/`).

---

## 1. Subir las GitHub Actions a versiones con Node 24

- **Estado:** pendiente — **URGENTE: deadline 2026-06-16**
- **Creada:** 2026-06-12 (detectada en la revisión con agentes del 2026-06-09)
- **Por qué existe:** `checkout@v4`, `setup-node@v4` y `pnpm/action-setup@v4`
  en `.github/workflows/ci.yml` corren sobre Node 20, deprecado en los
  runners de GitHub desde el 2026-06-16. Riesgo: el pipeline de publicación
  (tag → npm con provenance) empieza a fallar y bloquea releases.
- **Alcance:** este repo **y los hermanos** con el mismo workflow:
  `tree`, `skapxd-result`, `outline`, `excel2md`
  (todos en `/Users/manuelmeneses/dev/npm-packages/`).
- **Acciones ejecutadas:** ninguna aún.
- **Análisis de implementación:** subir `actions/checkout` y
  `actions/setup-node` a la major que corre en Node 24 (v5+;
  verificar la última en el marketplace al momento de hacerlo) y
  `pnpm/action-setup` a su equivalente. Revisar breaking changes de
  `setup-node` (cache de pnpm). Probar con un push a main (el workflow
  corre en push) antes de confiar un tag. Repetir el mismo diff en los 4
  repos hermanos; en cada uno verificar que el workflow sea idéntico antes
  de copiar.

## 2. Regla `no-anonymous-condition` (solo condiciones nombradas en el `if`)

- **Estado:** bloqueada (decisión) — falta visto bueno del dueño al diseño
- **Creada:** 2026-06-12
- **Por qué existe / qué resuelve:** propuesta del dueño: dentro de un `if`
  solo deben existir variables con nombre semántico; una expresión compleja
  se extrae a `const nombreSemantico = expresion` y el `if` se lee como
  prosa (`if (esArchivoExento)`). Es el refactor "introduce explaining
  variable" (Fowler) convertido en guardrail, hermana de `no-else`: esa
  nombra los **caminos**, esta nombra la **pregunta** (axioma A5 del
  README: las decisiones se declaran, no se interpretan).
- **Acciones ejecutadas:**
  - 2026-06-12: medición de impacto con heurística regex sobre 3 codebases:
    - `eslint-opinionated/src`: 258 ifs, **224 con expresión (87%)**.
    - backend Nest real (onboar): 1025 ifs, 584 con expresión (57%).
    - `excel2md-web`: 75 ifs, 43 con expresión (57%).
    Conclusión: sería la regla más invasiva del catálogo; el default debe
    permitir lo "ya nombrado" y exigir extracción solo donde se gana
    semántica.
  - 2026-06-12: detectado conflicto interno — ver análisis.
- **Análisis de implementación:**
  - **Permitido por defecto (ya tiene nombre):** `Identifier`
    (`if (isReady)`), `!Identifier`, `MemberExpression` de hasta ~2 niveles
    (`result.ok`, `this.x`, `options.flag`) y su negación.
  - **Exige extracción:** `CallExpression`, `BinaryExpression`
    (comparaciones), `LogicalExpression` (`&&`/`||`), aritmética.
  - **Conflicto interno (CRÍTICO):** nuestras reglas de Result reconocen el
    guard **por su forma** (`!result.ok`, `result.ok === false`,
    `Result.isErr(x)`, `if (result.error)`). Si esta regla obliga a
    extraerlo (`const fallo = !result.ok; if (fallo)`),
    `result-error-requires-cause` y `result-error-requires-handling` quedan
    ciegas. Dos salidas: (a) v1 barata — eximir el idioma de Result (esas
    formas quedan permitidas en el `if`); (b) correcta a largo plazo —
    enseñar a las reglas de Result a seguir el alias del guard, como ya
    siguen el alias de `result.error`. Empezar por (a).
  - **Narrowing:** TypeScript 4.4+ estrecha a través de condiciones
    extraídas a `const` (aliased conditions), incluidos type predicates y
    discriminantes — documentar que la extracción debe ser `const` directa.
  - **Nombre:** `no-anonymous-condition` ("la condición sin nombre", eco
    del mensaje de no-else). Mensaje estilo playbook: mostrar el antes y el
    después con `const`.
  - **Opciones:** `allowFilePatterns`, quizá `maxMemberDepth` y
    `allowedCallPatterns` (¿type guards `isX(...)`/`hasX(...)` permitidos
    por nombre? decidir con el dueño — huele a A6 débil).
  - **Validación:** correr contra los 3 backends Nest + excel2md y revisar
    una muestra de hallazgos a mano antes de decidir si entra a las bases o
    nace como opt-in.

## 3. Capa meta `defineDomainRule()` sobre los axiomas

- **Estado:** bloqueada (decisión) — trabajo grande, merece sesión propia
- **Creada:** 2026-06-11
- **Por qué existe / qué resuelve:** pregunta original del dueño: "¿se
  pueden hacer reglas de linter para modelar cualquier negocio usando
  axiomas?". El manifiesto de 8 axiomas ya quedó en el README (v0.14.0,
  sección "Los axiomas"). Falta la mitad generativa: un helper
  `defineDomainRule()` con el que un equipo declare reglas de SU dominio
  (p. ej. "toda mutación de Pedido pasa por OrderService") derivadas de los
  axiomas, sin escribir un plugin de ESLint desde cero.
- **Acciones ejecutadas:** manifiesto publicado (v0.14.0). API no diseñada.
- **Análisis de implementación:** diseñar primero 3-4 casos de uso reales
  (de los backends de Unibank) y extraer el API mínimo que los cubre.
  Candidatos de primitivas: "X solo se importa desde Y" (ya existe el
  patrón en untrusted-module-requires-adapter), "X solo se instancia en Y"
  (nest-no-direct-instantiation generalizada), "toda llamada a X exige Y en
  scope". Evitar un DSL gigante: empezar con 2-3 primitivas con evidencia
  type-aware (axioma A6). Riesgo: API pública difícil de revertir —
  prototipar en un proyecto real antes de publicar.

## 4. Eliminar los 187 `// @ts-nocheck` legacy de `src/`

- **Estado:** pendiente (existe chip de tarea en Claude Code para correrla
  en worktree propio)
- **Creada:** 2026-06-12 (deuda visible desde que existe
  `no-silenced-compiler`)
- **Por qué existe / qué resuelve:** 187 de ~210 archivos de `src/` llevan
  `// @ts-nocheck` (convención heredada: los utils manipulan AST sin tipar
  contra TSESTree). El paquete envía `no-silenced-compiler` como error: la
  incoherencia dogfood es visible. Hoy es LA ÚNICA línea de la lista de
  pendientes del `eslint.config.ts`.
- **Acciones ejecutadas:**
  - 2026-06-12: dogfood endurecido — el repo se lintea con su preset
    `package` completo y TIPADO (projectService); 6 hallazgos reales
    corregidos (2 awaits desnudos en cli.ts, parseAsync flotante, tipo
    mentiroso en get-object-pattern-prop-names, `?? null` muerto, `any`
    convertido en excepción declarada).
  - 2026-06-12: los 7 archivos nuevos (wrappers + util) nacieron sin
    pragma — el código nuevo ya no agrega deuda.
- **Análisis de implementación:** por lotes (por carpeta), quitando el
  pragma y tipando contra `@typescript-eslint/utils` (TSESTree). El
  tsconfig ya está al máximo (strict + noImplicitReturns +
  noUncheckedIndexedAccess), así que aflorarán errores reales: resolverlos
  modelando, no con casts. Tras cada lote: `pnpm build && pnpm typecheck &&
  pnpm test && pnpm lint` (Node 22 vía
  `export PATH="/Users/manuelmeneses/.nvm/versions/node/v22.14.0/bin:$PATH"`;
  el shell por defecto trae Node 16). 322 tests deben seguir verdes. Al
  terminar: borrar la línea `"skapxd/no-silenced-compiler": "off"` del
  eslint.config.ts — definición de hecho.

## 5. Sanear `--base` del CLI (`skapxd-lint-changed`)

- **Estado:** pendiente
- **Creada:** 2026-06-12 (detectada en la revisión del 2026-06-09)
- **Por qué existe / qué resuelve:** en `src/cli.ts`, el valor de `--base`
  se interpola directo en `execSync("git diff ... ${base}...HEAD")`: un
  `--base "main; rm -rf ."` ejecuta el comando inyectado. Severidad
  moderada (CLI local, el atacante eres tú mismo o un script), pero es
  exactamente el tipo de hueco que este paquete predica cerrar.
- **Acciones ejecutadas:** ninguna aún.
- **Análisis de implementación:** dos opciones, preferir la (a):
  (a) reemplazar `execSync(string)` por `execFileSync("git", [args])` — los
  argumentos viajan como array, sin shell, la inyección muere de raíz;
  (b) validar el ref contra `git check-ref-format` o una regex de refs.
  Tocar el helper `git()` interno de `lintChanged` y los 4 comandos que lo
  usan. Tests: difícil de testear unitario (execSync real); mínimo un test
  del shape de argumentos si se extrae un util `buildGitArgs`.

## 6. Documentar el choque `parserOptions.project` vs `projectService`

- **Estado:** pendiente
- **Creada:** 2026-06-12 (detectada en la revisión del 2026-06-09)
- **Por qué existe / qué resuelve:** los presets tipados traen
  `projectService`. Si el consumidor además define su propio bloque con
  `parserOptions.project` (estilo viejo) sobre los mismos archivos, ESLint
  puede duplicar programas TS (lento) o lanzar errores confusos de
  resolución. Hoy no está documentado: el consumidor que mezcla ambos se
  estrella sin pista.
- **Acciones ejecutadas:** ninguna aún.
- **Análisis de implementación:** sección corta en el README (en "Notas
  sobre reglas type-aware"): qué trae el preset, qué NO debe agregar el
  consumidor, y el patrón correcto para sumar reglas tipadas propias
  (reusar `languageOptions` del preset en vez de declarar otro parser).
  Reproducir el choque en un proyecto de prueba para documentar el error
  textual que produce (googleabilidad).

## 7. Eliminar el alias deprecado `await-requires-try-safe`

- **Estado:** pendiente — programada para la v1.0.0 (no antes)
- **Creada:** 2026-06-12 (deuda declarada desde v0.4.0)
- **Por qué existe / qué resuelve:** la regla se renombró a
  `await-requires-result` en v0.4.0; el alias viejo sigue registrado con
  `meta.deprecated` + `replacedBy` para no romper consumidores. En v1.0.0
  (primer breaking declarado) se elimina.
- **Acciones ejecutadas:** alias marcado deprecated y testeado
  (tests/configs.test.ts, describe "alias deprecado").
- **Análisis de implementación:** borrar la entrada del diccionario en
  `src/shared/rules.ts`, el test del alias, y la mención en README. Anotar
  en el changelog de v1.0.0 la migración (buscar/reemplazar el nombre).

## 8. excel2md-web: adoptar v0.17.0 + tsconfig duro (repo vecino)

- **Estado:** pendiente (vive en `/Users/manuelmeneses/dev/excel2md-web`,
  no en este repo)
- **Creada:** 2026-06-12
- **Por qué existe / qué resuelve:** al subir de 0.13.0 a 0.14.0, el lint
  reportó 10 errores; el diagnóstico mostró que 6 eran la regla
  type-aware creyéndole a tipos que mienten porque el tsconfig de Astro
  (`astro/tsconfigs/strict`) NO trae `noUncheckedIndexedAccess`.
  Verificado empíricamente: con el flag activado, 10 → 4 hallazgos.
- **Acciones ejecutadas:** diagnóstico completo + verificación con el flag
  (2026-06-12, revertida — el repo quedó intacto).
- **Análisis de implementación:** (1) `pnpm i -D
  @skapxd/eslint-opinionated@latest`; (2) agregar a `compilerOptions`:
  `"noUncheckedIndexedAccess": true, "noImplicitReturns": true` — ojo:
  puede aflorar errores de `astro check` en accesos por índice sin guard
  (bugs latentes reales, revisarlos); (3) resolver los 4 hallazgos
  legítimos: 3 × `no-else` (guard clauses / `match()`: use-a11y-settings,
  build-dependent-tree, get-cell-class) y 1 × comparación imposible
  (`value !== null` en count-non-empty-cells:11 — el tipo de
  `CellObject.v` nunca incluye `null`; borrar esa comparación).

---

## Hechas

- **Bug FalseCJS en los `exports`** — cerrada 2026-06-12, v0.17.0. Los
  `.d.mts` que tsup generaba no estaban cableados; ahora cada condición
  declara sus types y la regla `package-requires-typed-exports` lo vigila
  (dogfood: la regla nació reportando a este repo).
- **Dogfood tipado completo** — cerrada 2026-06-12 (commit `6e36226`): el
  repo se lintea con su preset `package` + projectService; única excepción
  pendiente: tarea #4.
- **Veredicto d903f74** (commit pusheado sin permiso) — cerrada 2026-06-12:
  se queda en la historia, no se reescribe main.
- **Manifiesto de axiomas** — cerrada 2026-06-11, v0.14.0 (sección "Los
  axiomas" del README). La mitad generativa sigue en la tarea #3.
- **Recomendación de tests a nivel de tipos** — cerrada 2026-06-11:
  documentada en README (expectTypeOf de vitest + @ts-expect-error).
