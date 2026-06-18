### `skapxd/no-anonymous-condition`

La hermana de `no-else`: esa nombra los **caminos**, esta nombra la **pregunta**. Un `if` cuya condición es un cómputo evalúa un valor anónimo cuyo significado vive solo en la cabeza de quien lo escribió; la regla exige bautizarlo (el refactor "introduce explaining variable" de Fowler, como ley):

```ts
if (matchesAnyGlob(filename, options.allowFilePatterns)) { ... }   // ❌ ¿qué significa que matchee?

const esArchivoExento = matchesAnyGlob(filename, options.allowFilePatterns);
if (esArchivoExento) { ... }                                       // ✅ la decisión se lee como prosa
```

Lo **ya nombrado** no se extrae (la lista blanca — extraerlo sería ceremonia sin información):

- Variables y sus negaciones: `isReady`, `!isReady`, `!!isReady`.
- Accesos a propiedad hasta `maxMemberDepth` saltos (contando puntos desde la base como nivel 0: `result.ok` → 1, `options.rules.flag` → 2; default `2`) y sus negaciones — incluido el encadenamiento opcional (`config?.flag`).
- Comparaciones contra literal booleano o nullish (`x.ok === false`, `x == null`, `x !== undefined`): la escritura explícita de la afirmación/negación/presencia. Cubre las formas oficiales del guard de Result, que `result-error-requires-cause/handling` necesitan ver intactas.
- **Type guards demostrados por la firma** (`allowTypePredicates`, default `true`): `if (isFunctionNode(x))` pasa cuando la firma declara `x is FunctionNode` — el type-checker lo demuestra (evidencia, no convención de nombre: una `isX(...)` que devuelve `boolean` a secas sí se extrae). Requiere type info; sin parser services no hay evidencia y toda llamada exige nombre. `Result.isErr(x)` pasa por esta vía: es un type predicate real.

Lo que **sí dispara**: llamadas, comparaciones (`a.length <= b.max`, `status === "ready"`), combinaciones `&&`/`||` y aritmética (`if (total % 2)`). La extracción directa a `const` conserva el narrowing (TS 4.4+, aliased conditions).

**El nombre tiene que informar — anti-nombres que traicionan la regla.** Cumplirla con un nombre vacío es peor que no extraer: el lint queda verde y el lector sigue sin saber qué decide el `if`. El nombre lleva `is/has/needs/lacks/exceeds/reached` + el concepto del dominio (`reachedProjectRoot`, `exceedsStateBudget`). Lo que **no** vale:

- Sufijos `Rule`/`Condition` mecánicos (`isXRule`, `passesCondition`).
- `isNot…` mecánico (niega en el nombre en vez de modelar el concepto positivo).
- Sufijos numerados (`isResult2`): el número no es significado.
- Nombres-AST concatenados a máquina (ruta del nodo + sufijo `Rule`) **sin** una firma type predicate que lo justifique.

Un type predicate descriptivo largo como `isPublicClassMethod` **es legítimo**: lo que sobra es la concatenación mecánica, no la longitud.

**Está en las reglas base** — y es la más invasiva del catálogo: la calibración contra 4 proyectos reales (2026-06-12) midió 473/95/308 hallazgos en tres backends NestJS en producción y 44 en un front pequeño (señal genuina en la muestra revisada a mano). En un proyecto existente, trátala con el playbook de adopción: entra apagada en la lista de pendientes y se enciende por carpetas, nombrando con criterio — el valor de la regla son los nombres, y un nombre autogenerado la traiciona. Este mismo repo la tiene en su lista de pendientes (245 condiciones heredadas) — la regla nació subiendo la vara que su propio código aún está alcanzando.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
