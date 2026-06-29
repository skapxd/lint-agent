# Spike: diseno output-first del CLI

## Alcance y metodo

Este spike responde al issue #127 en el worktree `codex/issue-127-output-first-doc`. Es docs-only: no cambia `src/`, presets, reglas ni grafo. El objetivo es juzgar el output como producto consumible por una persona y por un agente, no como subproducto tecnico de ESLint.

La medicion uso el build local de Lint Agent (`@skapxd/eslint-opinionated@7.1.0`) sobre dos codebases: este repo con preset `package` y `en-boca-astro` con preset `astro`. En ambos casos se generaron `compact`, `json` y `toon`, en modo evaluate y `--adopt 10`, con salida completa a `/tmp/eslint-output-spike-127/`.

| Codebase | Preset | Modo | Comando base |
| --- | --- | --- | --- |
| `Lint Agent` | `package` | evaluate | `node dist/cli.mjs /Users/manuelmeneses/dev/npm-packages/eslint-opinionated-wt/issue-127 --preset package --yes --format <fmt> --output /tmp/eslint-output-spike-127/self-evaluate.<fmt>` |
| `Lint Agent` | `package` | adopt | `node dist/cli.mjs /Users/manuelmeneses/dev/npm-packages/eslint-opinionated-wt/issue-127 --preset package --yes --format <fmt> --adopt 10 --output /tmp/eslint-output-spike-127/self-adopt10.<fmt>` |
| `en-boca-astro` | `astro` | evaluate | `node dist/cli.mjs /Users/manuelmeneses/dev/productos/en-boca-astro --preset astro --yes --format <fmt> --output /tmp/eslint-output-spike-127/en-boca-astro-evaluate.<fmt>` |
| `en-boca-astro` | `astro` | adopt | `node dist/cli.mjs /Users/manuelmeneses/dev/productos/en-boca-astro --preset astro --yes --format <fmt> --adopt 10 --output /tmp/eslint-output-spike-127/en-boca-astro-adopt10.<fmt>` |

El repo `en-boca-astro` ya tenia cambios locales ajenos antes de medir (`deno.json`, `deno.lock`, `skapxd-report.txt`). Las corridas no agregaron cambios nuevos y `configDeleted: true` quedo presente en la salida.

## Mediciones reales

| Reporte | Bytes | Lineas | Lectura |
| --- | ---: | ---: | --- |
| `self-evaluate.compact` | 1119 | 20 | Humano lo lee, pero el conteo no cuadra: `5 errors` contra 1 regla listada. |
| `self-evaluate.json` | 86035 | 2366 | Demasiado grande para 5 hallazgos porque emite 383 archivos, casi todos sin mensajes. |
| `self-evaluate.toon` | 1807 | 32 | Mucho mas eficiente; aun no explica la reconciliacion. |
| `self-adopt10.compact` | 478 | 10 | Pequeno, pero el usuario debe inferir que la seed/rules son el lote accionable. |
| `self-adopt10.json` | 1550 | 54 | Util para maquina; falta prompt y desglose de no-atribuibles del evaluate base. |
| `self-adopt10.toon` | 1141 | 32 | Compacto para agente; falta la misma guia semantica. |
| `en-boca-astro-evaluate.compact` | 683819 | 3972 | Muestra el mapa arriba, pero el detalle domina y el conteo no reconcilia. |
| `en-boca-astro-evaluate.json` | 2365813 | 26983 | Volumen alto: util como data dump, malo como producto leible. |
| `en-boca-astro-evaluate.toon` | 461418 | 4495 | Mejor densidad que JSON, pero sigue sin prompt ni reconciliacion. |
| `en-boca-astro-adopt10.compact` | 47351 | 352 | El lote reduce el ruido, pero no ensena como usarlo. |
| `en-boca-astro-adopt10.json` | 140097 | 2355 | Parseable; no contiene una instruccion lista para ejecutar. |
| `en-boca-astro-adopt10.toon` | 47942 | 502 | Mejor formato para agentes; incompleto como contrato de accion. |

La reconciliacion falla en las dos codebases medidas.

| Codebase | `errorCount` | Suma de `ruleSummaries.violationCount` | No atribuidos | Ejemplo |
| --- | ---: | ---: | ---: | --- |
| `Lint Agent` | 5 | 1 | 4 | Parse errors en `scripts/*.mjs` por `parserOptions.project`. |
| `en-boca-astro` | 3671 | 3670 | 1 | `@typescript-eslint/no-explicit-any`: `Definition for rule '@typescript-eslint/no-explicit-any' was not found.` |

Ejemplo real del problema de `self-evaluate.compact`:

```text
5 errors | 5 files | preset package
tipos: config clonada sin flags nuevos

rules (orden de resolucion, premisas primero):
  1. skapxd/no-default-export: 1 viol, 1 file

scripts/check-peer-latest.mjs
  0:0  parse  Parsing error: "parserOptions.project" has been provided for @typescript-eslint/parser. The file was not found in any of the provided proje...
```

Ejemplo real del problema de `en-boca-astro`:

```text
3671 errors | 130 files | preset astro
...
rules (orden de resolucion, premisas primero):
  ...
```

El mapa de reglas suma 3670, pero el detalle contiene un hallazgo externo:

```text
sse/event-emitter.ts
  24:1  @typescript-eslint/no-explicit-any  Definition for rule '@typescript-eslint/no-explicit-any' was not found.
```

## Auditoria del output actual

| Elemento | Humano | Agente LLM | Fallo de producto |
| --- | --- | --- | --- |
| Resumen inicial | Comunica volumen, archivos y preset en una linea. En cinco segundos se entiende que hay deuda. | Da senales parseables si el agente tolera texto libre. | No distingue errores accionables de errores de config/directivas/parse. Cuando no cuadra con la lista de reglas, destruye confianza. |
| `tipos:` / `typeConfig` | Es valioso porque declara si el CLI clono o endurecio tsconfig. | El campo estructurado existe en JSON/TOON y permite decidir si una regla type-aware opino con flags endurecidos. | La linea no dice que esta informacion puede cambiar los hallazgos; tampoco la conecta con reglas bloqueadas por premisas de tipos. |
| `rules (orden de resolucion, premisas primero)` | Es el mejor avance de #122: pone mapa antes del detalle. | `ruleSummaries` entrega `dependencyLayer` y `blockedBy`, suficiente para ordenar trabajo. | El nombre de la seccion no basta. No dice si empezar por el 1, si resolver todas las premisas primero, ni como tratar reglas sin marca. |
| Marca `[premisa]` | Aporta, pero no se autodefine. El usuario tiene que saber que desbloquea dependientes. | Puede inferirse si el agente entiende grafo, pero no hay instruccion local. | La marca es semantica comprimida sin leyenda; #125 existe porque el valor se perdio en lectura real. |
| Marca `[bloqueada por: X]` | Advierte orden, pero no dice "no la toques todavia". | Sirve como edge del grafo, pero el agente puede gastar trabajo en dependientes igual. | Falta convertir dato en politica operativa. |
| Reglas sin marca | Parecen menos importantes que `[premisa]`, pero muchas son el primer trabajo correcto. | No hay campo equivalente a `independent: true`; solo ausencia de `blockedBy`. | Ausencia de marca no es explicacion. Debe decir que son independientes y resolubles cuando convenga. |
| Listado por archivo | Es navegable en terminal y VSCode; los mensajes-playbook son el activo principal del paquete. | Contiene el fix esperado en cada mensaje. | En reportes grandes ahoga la guia. En compact los mensajes se truncan a 140 caracteres y a veces corta justo la accion. |
| `compact` | Es el mejor formato humano para una mirada rapida y para pegar en un issue. | No deberia ser input primario de agente por truncamiento y texto libre. | Hoy carga demasiada responsabilidad: intenta ser resumen, guia, detalle y data source al mismo tiempo. |
| `json` | No es lectura humana. | Es parseable, pero verboso: `self-evaluate.json` pesa 86 KB para 5 hallazgos porque incluye 383 archivos, la mayoria limpios. | Funciona como volcado de datos, no como output-first. Falta `resolutionPrompt`, `countBreakdown` y una forma de no emitir ruido por defecto. |
| `toon` | No es para humano, aunque se puede ojear. | Es el mejor formato para agente: deduplica mensajes y separa `messages` de `findings`. | Aun replica la historia incompleta: no trae prompt ni reconciliacion. |
| `--adopt` | Reduce volumen y da seed. | La seed es buen contrato reproducible. | No explica que el lote se cierra con `--verify <seed>`, ni que se deben ignorar reglas fuera de la seed salvo decision explicita. |

## Principios de diseno

| Principio | Decision |
| --- | --- |
| Autoexplicado | Toda marca, numero y bloque debe traer su semantica en el output. Si alguien pregunta "que significa esto?", el output fallo. |
| Jerarquia de atencion | El orden debe ser: estado, reconciliacion, como actuar, plan de reglas, detalle. El detalle nunca debe preceder ni sepultar la guia. |
| Una sola historia | `compact`, `json` y `toon` deben contar lo mismo: mismo prompt, mismo desglose, mismo plan. Cambia la forma, no la verdad. |
| Conteo reconciliable | El headline no puede prometer un total que el mapa no explica. La identidad debe ser visible: `total = accionables + no atribuidos + warnings si aplica`. |
| Accion antes que taxonomia | La lista de reglas no es un inventario; es un plan de trabajo. Las etiquetas sirven si cambian la accion. |
| Conciso por defecto | El output no debe convertirse en manual. Un bloque fijo de 4-6 lineas vale; repetir explicaciones por regla no. |
| Detalle completo, guia arriba | En reportes gigantes, no hay que ocultar hallazgos por defecto, pero si hay que hacer que la primera pantalla sea suficiente para saber como empezar. |
| Datos computables solamente | Todo lo propuesto sale de datos que ya existen o de clasificaciones simples sobre `ruleId`, `fatal`, mensaje "rule not found", `ruleSummaries`, `typeConfig` y conteos ESLint. Si un dato requiere inferir intencion de dominio, no entra. |

## Propuesta de output ideal

La estructura comun debe ser:

| Orden | Seccion | Funcion |
| ---: | --- | --- |
| 1 | Estado | Resultado accionable, preset, archivos afectados y modo. |
| 2 | Reconciliacion | Desglose de conteos: reglas `skapxd/*`, no atribuidos/config/directivas/parse, warnings. |
| 3 | Tipos | Origen y flags de la config type-aware. |
| 4 | Como resolver | Prompt corto, imperativo, igual en los tres formatos. |
| 5 | Plan de reglas | Orden topologico y de esfuerzo, con premisas, bloqueadas e independientes explicadas por el prompt. |
| 6 | Detalle | Hallazgos por archivo, navegables, sin archivos limpios por defecto en formatos machine. |

Prompt propuesto, sin tildes y reusable como constante:

```text
como resolver: arregla las reglas en el orden listado, de arriba hacia abajo.
- [premisa]: arreglala primero; desbloquea o reduce reglas dependientes.
- [bloqueada por: X]: no la toques hasta resolver X.
- sin marca: regla independiente; resuelvela cuando convenga.
lee cada mensaje de hallazgo: ahi esta el fix exacto que espera la regla.
```

El prompt no debe cambiar por formato. En `compact` aparece como bloque antes del plan. En `json` y `toon` aparece como `resolutionPrompt`.

### Compact ideal

```text
3670 errores accionables + 1 aviso cli/config | 130 files | preset astro
conteo: 3671 total = 3670 reglas skapxd + 1 no atribuido (config/directivas/parse) + 0 warnings
tipos: config endurecida (noImplicitReturns, noUncheckedIndexedAccess)

como resolver:
  arregla las reglas en el orden listado, de arriba hacia abajo.
  [premisa]: arreglala primero; desbloquea o reduce reglas dependientes.
  [bloqueada por: X]: no la toques hasta resolver X.
  sin marca: regla independiente; resuelvela cuando convenga.
  lee cada mensaje de hallazgo: ahi esta el fix exacto que espera la regla.

rules (plan de resolucion):
  1. skapxd/max-hook-size: 1 viol, 1 file [independiente]
  2. skapxd/no-default-export: 1 viol, 1 file [premisa]
  3. skapxd/requires-strict-tsconfig: 1 viol, 1 file [premisa]
  ...
  35. skapxd/no-impossible-branch: 69 viol, 21 files [bloqueada por: requires-strict-tsconfig]
  37. skapxd/filename-matches-root-function: 186 viol, 100 files [bloqueada por: one-root-function-per-file, no-default-export]

no atribuidos:
  sse/event-emitter.ts:24:1  @typescript-eslint/no-explicit-any  Definition for rule '@typescript-eslint/no-explicit-any' was not found. (directiva/config externa; no es regla skapxd accionable)

src/components/admin/AnaliticasView.tsx
  4:1  skapxd/requires-strict-tsconfig  El tsconfig no activa: `noImplicitReturns`, `noUncheckedIndexedAccess`. Sin `strict`, el sistema de tipos esta apagado a medias; ...
```

Cambios deliberados: el headline ya no dice solo `3671 errors`; separa accionable de ruido de reporte. La linea `conteo` hace la suma auditable. El bloque `no atribuidos` no es opcional cuando existe diferencia. La marca `[independiente]` puede imprimirse solo si el prompt no basta; si se considera demasiado ruido, debe existir al menos en JSON/TOON como `resolutionRole: "independent"`.

### JSON ideal

```json
{
  "v": 2,
  "status": "findings",
  "mode": "evaluate",
  "preset": "astro",
  "targetPath": "/Users/manuelmeneses/dev/productos/en-boca-astro",
  "countBreakdown": {
    "totalErrorCount": 3671,
    "actionableErrorCount": 3670,
    "skapxdRuleViolationCount": 3670,
    "unattributedErrorCount": 1,
    "warningCount": 0,
    "filesWithFindings": 130
  },
  "unattributedFindings": [
    {
      "filePath": "sse/event-emitter.ts",
      "line": 24,
      "column": 1,
      "ruleId": "@typescript-eslint/no-explicit-any",
      "category": "rule-definition-missing",
      "message": "Definition for rule '@typescript-eslint/no-explicit-any' was not found.",
      "actionability": "cli-config-not-project-debt"
    }
  ],
  "typeConfig": {
    "source": "cloned",
    "addedFlags": ["noImplicitReturns", "noUncheckedIndexedAccess"]
  },
  "resolutionPrompt": "como resolver: arregla las reglas en el orden listado, de arriba hacia abajo.\n- [premisa]: arreglala primero; desbloquea o reduce reglas dependientes.\n- [bloqueada por: X]: no la toques hasta resolver X.\n- sin marca: regla independiente; resuelvela cuando convenga.\nlee cada mensaje de hallazgo: ahi esta el fix exacto que espera la regla.",
  "rulePlan": [
    {
      "ruleId": "skapxd/no-default-export",
      "violationCount": 1,
      "affectedFileCount": 1,
      "dependencyLayer": 0,
      "resolutionRole": "premise",
      "blockedBy": [],
      "unblocks": ["skapxd/filename-matches-root-function"]
    }
  ],
  "files": [
    {
      "filePath": "src/components/admin/AnaliticasView.tsx",
      "messages": [
        {
          "line": 4,
          "column": 1,
          "ruleId": "skapxd/requires-strict-tsconfig",
          "severity": 2,
          "message": "El tsconfig no activa: `noImplicitReturns`, `noUncheckedIndexedAccess`..."
        }
      ]
    }
  ]
}
```

El campo `files` debe contener hallazgos por defecto. Si alguien necesita inventario de archivos escaneados, debe existir `scannedFileCount`, `cleanFileCount` o un modo verbose, no 378 entradas limpias mezcladas con 5 hallazgos como en `self-evaluate.json`.

### TOON ideal

```text
v: 2
status: findings
mode: evaluate
preset: astro
countBreakdown:
  totalErrorCount: 3671
  actionableErrorCount: 3670
  skapxdRuleViolationCount: 3670
  unattributedErrorCount: 1
  warningCount: 0
  filesWithFindings: 130
resolutionPrompt: "como resolver: arregla las reglas en el orden listado, de arriba hacia abajo.\n- [premisa]: arreglala primero; desbloquea o reduce reglas dependientes.\n- [bloqueada por: X]: no la toques hasta resolver X.\n- sin marca: regla independiente; resuelvela cuando convenga.\nlee cada mensaje de hallazgo: ahi esta el fix exacto que espera la regla."
rulePlan[37]{ruleId,violationCount,affectedFileCount,resolutionRole,blockedBy}:
  skapxd/max-hook-size,1,1,independent,[]
  skapxd/no-default-export,1,1,premise,[]
  skapxd/no-impossible-branch,69,21,blocked,[requires-strict-tsconfig]
unattributedFindings[1]{file,line,column,ruleId,category,messageId}:
  sse/event-emitter.ts,24,1,@typescript-eslint/no-explicit-any,rule-definition-missing,m385
messages[...]{id,ruleId,message}:
  m385,@typescript-eslint/no-explicit-any,"Definition for rule '@typescript-eslint/no-explicit-any' was not found."
findings[...]{file,line,column,severity,messageId}:
  src/components/admin/AnaliticasView.tsx,4,1,2,m1
```

TOON ya tiene la mejor idea estructural: deduplicar mensajes y referenciarlos por `messageId`. El cambio es subir la guia y la reconciliacion al mismo nivel que `adoption`, `ruleSummaries` y `findings`.

## Como presentar un error individual

El error individual no necesita un segundo mensaje inventado si el mensaje de regla ya ensena el fix. Si se agregan campos nuevos, deben ser metadatos de navegacion y accion, no texto duplicado.

| Campo | Estado | Justificacion |
| --- | --- | --- |
| `file`, `line`, `column` | Ya existe. | Navegacion directa. |
| `ruleId` | Ya existe. | Contrato roto. |
| `message` / `messageId` | Ya existe. | Playbook del fix. |
| `resolutionRole` por regla | Nuevo en plan, no por finding. | Evita repetir `[premisa]` miles de veces. |
| `category` para no atribuidos | Nuevo. | Distingue deuda accionable de parse/config/directivas. |
| `actionability` | Nuevo para no atribuidos. | Evita que un agente intente "arreglar" ruido del CLI como si fuera regla del proyecto. |

No recomiendo partir cada mensaje de regla en `why` y `fix` todavia. Eso exigiria reescribir 100+ mensajes y puede destruir el valor actual: una frase compacta que explica contrato y salida. El primer salto de producto es report-level: prompt, conteo, plan y categorias.

## Reportes gigantes

`en-boca-astro-evaluate.compact` tiene 3972 lineas; `json` llega a 2.3 MB. La respuesta no debe ser "imprime menos sin avisar". La respuesta es hacer que la primera pantalla sea suficiente para actuar y que el detalle completo quede navegable.

Propuesta:

| Problema | Decision |
| --- | --- |
| El detalle tapa la guia | Guia fija antes del detalle: resumen, conteo, prompt, plan. |
| El output completo no cabe en contexto de agente | Mantener `--output <path>` como ruta principal para reportes grandes; stdout queda en resumen corto. |
| JSON emite archivos limpios | Emitir hallazgos por defecto y mover conteos de escaneo a campos agregados. |
| Compact trunca mensajes | Aceptable para terminal, pero el prompt debe recordar que el mensaje completo vive en JSON/TOON si hace falta precision. Si compact sigue truncando, no debe ser formato primario de agentes. |
| Miles de hallazgos en una ronda legacy | `--adopt` sigue siendo el modo de trabajo. El output debe decir que el cierre del lote es `--verify <seed>`, no "limpia todo". |

## Cambios de logica necesarios

| Area | Cambio de alto nivel | Datos requeridos |
| --- | --- | --- |
| Modelo de salida | Agregar `countBreakdown`, `resolutionPrompt`, `rulePlan` o extender `ruleSummaries`, y `unattributedFindings`. | `errorCount`, `warningCount`, `files`, `ruleSummaries`, `message.ruleId`, `fatal`, `isRuleDefinitionMissingMessage`. |
| Reconciliacion | Calcular `skapxdRuleViolationCount`, `unattributedErrorCount`, `actionableErrorCount` y categorias de no atribuidos. | Ya existe; falta centralizarlo. |
| Categorias no atribuidas | Clasificar `ruleId === null` o `parse` como `parse`, `fatal === true` como `fatal`, `Definition for rule ... was not found` como `rule-definition-missing`, regla no `skapxd/*` como `external-rule`. | No requiere semantica de dominio; solo metadata ESLint y regex existente. |
| Prompt | Crear una constante unica `resolutionPrompt` usada por compact, JSON y TOON. | Texto fijo. |
| Plan de reglas | Reusar `createAdoptionRuleSummaries`, agregar `resolutionRole` (`premise`, `blocked`, `independent`) y opcionalmente `unblocks`. | `blockedBy` actual mas inversa del grafo presente en el reporte. |
| Compact renderer | Insertar reconciliacion y prompt antes de reglas; mostrar no atribuidos en seccion propia; mantener detalle por archivo despues. | Campos nuevos. |
| JSON renderer | Dejar de ser solo `JSON.stringify(output)` si se necesita versionado/compatibilidad; al menos emitir los campos nuevos. | Campos nuevos. |
| TOON renderer | Agregar `countBreakdown`, `resolutionPrompt`, `rulePlan` y `unattributedFindings` al objeto que entra a `encodeLines`. | Campos nuevos. |
| Archivos limpios en machine output | Emitir solo archivos con mensajes por defecto o agregar `filesWithFindings` separado de `scannedFileCount`. | `files.filter(file.messages.length > 0)` ya se usa en compact. |
| Adopt/verify | El prompt debe mencionar seed y cierre con `--verify <seed>` cuando `mode` sea `adopt` o `verify`. | `adoption.seed`, `verification.seed`. |

## Mapa de issues

| Issue | Encaje en la vision | Cambio de forma |
| --- | --- | --- |
| #122 | Ya puso el mapa de reglas en evaluate y expuso `ruleSummaries`; es la base del plan de resolucion. | No queda completo sin prompt ni reconciliacion. La seccion deberia renombrarse de inventario a plan. |
| #125 | Se convierte en `resolutionPrompt` obligatorio y comun para `compact`, `json` y `toon`. | El prompt no debe ser comentario decorativo; debe vivir antes del plan y como campo machine. En `adopt` debe incluir seed/verify. |
| #126 | Se convierte en `countBreakdown` + `unattributedFindings` visibles. | La decision superior es no esconder los no atribuidos: separarlos del conteo accionable y mostrarlos como config/directivas/parse. |
| Falta posterior | Reducir ruido de `json` y alinear `files` con hallazgos reales. | No esta cubierto por #122/#125/#126, pero la medicion lo prueba: 86 KB para 5 hallazgos es mala salida de producto. |

## Definicion de hecho del spike

| Item | Estado |
| --- | --- |
| Output real generado en 3 formatos sobre 2 codebases, con y sin `--adopt` | Hecho; 12 reportes en `/tmp/eslint-output-spike-127/`. |
| Muestras incluidas | Hecho; se incluyen fragmentos reales y tabla de tamanos. |
| Auditoria por elemento, humano/agente | Hecho; tabla de auditoria. |
| Principios defendidos | Hecho; ocho principios. |
| Propuesta del output ideal | Hecho; estructura comun y ejemplos `compact`, `json`, `toon`. |
| Cambios de logica del CLI | Hecho; tabla de campos/renderers/datos requeridos. |
| Mapa #122/#125/#126 | Hecho; tabla de encaje. |
| Docs-only | Hecho; este documento es el unico archivo nuevo del spike. |
