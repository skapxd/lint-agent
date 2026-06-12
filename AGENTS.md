# AGENTS.md — cómo trabajamos en este repo

Guía para cualquier agente de código (o humano) que trabaje en esta base.
Léela completa antes de tocar nada: este repo tiene doctrina propia y se
aplica a sí mismo sus propias reglas (dogfood).

## Fuente de verdad: GitHub

Este repo trabaja 100% dentro del ecosistema de GitHub. La conversación
local ayuda a ejecutar, pero la fuente de verdad operacional vive en
issues, ramas, worktrees, commits y pull requests. **No acumular
decisiones, bloqueos, mediciones ni trade-offs solo en el chat: se
registran en el issue o en el PR** — el chat se pierde, el tablero
sobrevive.

## El ritual de verificación (memorízalo primero)

El shell por defecto de esta máquina trae **Node 16**; el repo necesita
Node 22. SIEMPRE antes de cualquier comando de pnpm:

```bash
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
pnpm build && pnpm typecheck && pnpm test && pnpm lint
```

Los cuatro en verde, siempre, antes de declarar cualquier cosa terminada.
`pnpm typecheck` NO es opcional: el CI lo corre y vitest no caza errores de
tipos (un release ya falló por saltárselo).

## Flujo obligatorio

1. Todo cambio no trivial parte de un issue de GitHub, o deja uno
   creado/enlazado antes de implementarse.
2. **Antes de tomar un issue, leer sus comentarios completos**: el tablero
   registra secuencias (`⛔ SECUENCIADO`), clusters con orden obligatorio y
   gates del dueño. No atacar un issue que otro bloquea o extiende.
3. Cada tarea baja a una rama propia con prefijo `codex/`, y
   preferiblemente a un worktree dedicado cuando haya trabajo paralelo o
   riesgo de mezclar contextos.
4. El PR es la unidad de entrega: enlaza el issue (`Closes #N` en el
   commit o el body), resume el cambio, lista las validaciones ejecutadas
   y deja claro lo pendiente.
5. Commits pequeños y revisables; no mezclar refactors, docs y reglas
   nuevas salvo que el issue lo pida como una sola unidad.
6. Cerrar issues solo con la Definición de Hecho cumplida (las DoD de este
   tablero son greppeables a propósito — ejecuta el grep antes de cerrar) o
   cuando el dueño decida explícitamente que el remanente no bloquea.
7. El trabajo queda **sin mergear hasta la revisión del dueño**. La
   revisión aquí es de dos pasadas: la primera valida mecánica, la segunda
   valida criterio (precedente: en el issue #8 se rechazaron 130 nombres
   autogenerados con los tests en verde — cumplir la letra no basta).

## La CLI de gh: recetas

Toda interacción con GitHub va por `gh`. Las formas que usamos:

```bash
# Leer el tablero y un issue con su historia completa
gh issue list --json number,title,labels --jq '.[] | "\(.number): \(.title)"'
gh issue view 16 --comments

# Crear un issue: PRIMERO revisar las plantillas del repo
ls .github/ISSUE_TEMPLATE/   # rule-proposal.md (reglas) | tech-debt.md (deuda)
gh issue create --title 'Regla x: contrato que protege' \
  --label "regla-nueva,decision-pendiente" --body-file /tmp/body.md

# Comentar avances (el formato importa: ver siguiente sección)
gh issue comment 16 --body-file /tmp/comment.md

# Actualizar checkboxes de la DoD en el body del issue
gh issue view 16 --json body --jq .body > /tmp/body.md  # editar y...
gh issue edit 16 --body-file /tmp/body.md

# PRs
gh pr create --title '...' --body-file /tmp/pr.md
gh pr view 20 --json title,body && gh pr diff 20 && gh pr checks 20
```

Trampas conocidas de gh + shell:

- **NUNCA backticks en `--title`**: el shell los ejecuta como comando (ya
  pasó: un título quedó mutilado y apareció un error de clang fantasma).
  Comillas simples, y el código va en el body.
- Cuerpos largos: `--body-file` o heredoc con comillas (`<<'EOF'`), nunca
  interpolación directa.
- No puedes aprobar tu propio PR (la cuenta de gh es la del dueño): deja
  la revisión como comentario en el PR.

## Formato de comentarios en issues y PRs

Los comentarios son el registro permanente del trabajo — markdown completo,
escritos para alguien que llega en frío:

- Abre con `## <qué pasó> (<fecha>)` — los comentarios se leen como
  bitácora.
- **Mediciones SIEMPRE en tabla** (qué se midió, dónde, cuánto), nunca en
  prosa: las tablas se comparan, la prosa no.
- Código con fence y lenguaje (```ts, ```bash); el comando que produjo un
  número va junto al número (reproducibilidad).
- Antes/después para cualquier cambio de forma (nombres, mensajes, tipos).
- Si el avance toca la Definición de Hecho, actualiza los checkboxes del
  body del issue, no solo el comentario.

Esqueleto de un comentario de avance:

```markdown
## Avance: <resumen en una línea> (2026-06-13)

**Hecho**: ...

**Medido**:

| Métrica | Antes | Después |
| --- | --- | --- |
| ...     | ...   | ...     |

**Verificación**: build ✅ · typecheck ✅ · tests (N) ✅ · lint ✅

**Pendiente / bloqueado por**: ...
```

## Convenciones del código (las que no perdonan)

- **Un archivo, una función raíz** (`one-root-function-per-file` está
  activa sobre este src). Utils en `src/utils/<dominio>/`, una regla por
  archivo en `src/rules/`, opciones en su getter de `utils/options/`.
- **Los mensajes de regla enseñan el fix** (estilo playbook) y van **sin
  tildes**; los comentarios de código y la documentación, en español
  correcto.
- **Evidencia sobre convención** (axioma A6 del README): type-checker >
  provenance de imports > nombres. Si detectas por nombre, justifica por
  qué no hay evidencia más fuerte disponible.
- **El dogfood manda**: este repo se lintea con su propio preset `package`,
  tipado. La lista de pendientes del `eslint.config.ts` **solo encoge** —
  si tu cambio necesita agregarle una línea, eso es decisión del dueño con
  issue propio, no un commit tuyo.
- Código nuevo no hereda deuda vieja: nada de `@ts-nocheck`, `as any` ni
  nombres plantilla (`matchesXRule`, `isNotX`, sufijos numerados).
- Tras un refactor estructural: borra tus codemods/andamiaje, deja
  `git status` limpio y actualiza la doc que describa la estructura.

## Mediciones de solo lectura (el protocolo)

Toda regla nueva o cambio de presets se calibra contra codebases reales
SIN tocarlas:

1. Config temporal DENTRO del proyecto medido (`.tmp-*.config.mjs`),
   apuntando al dist local de este paquete.
2. `eslint --no-config-lookup --config .tmp-... --format json` → conteos.
3. **Borrar el config temporal.** Cero cambios en el proyecto medido (ni
   código, ni config, ni CI).

Este repo siempre está en la lista de medición. Los resultados van al
issue en tabla, con muestreo manual de hallazgos (señal vs ruido). Medir
NO es adoptar: la adopción en un proyecto es decisión separada del dueño.

## Worktrees: un agente, una tarea, un directorio

Cuando hay más de un agente (o una tarea en paralelo con una revisión en
curso), **cada tarea vive en su propio worktree** — N directorios de
trabajo independientes que comparten el mismo `.git`. La regla nació de
colisiones reales: agentes dejando ramas y archivos a medio camino en el
checkout donde el dueño revisaba.

```bash
# Crear: directorio hermano, 1:1 con issue y rama
git worktree add ../eslint-opinionated-wt/issue-16 -b codex/issue-16-no-unsafe origin/main
cd ../eslint-opinionated-wt/issue-16
pnpm install   # node_modules NO se comparte (pnpm hardlinkea del store: rápido)

# Ver el mapa / limpiar al terminar (parte de la higiene de andamiaje)
git worktree list
git worktree remove ../eslint-opinionated-wt/issue-16 && git branch -d codex/issue-16-no-unsafe
git worktree prune
```

Convenciones y trampas de ESTE repo:

- **Identidad 1:1:** issue `#N` ↔ rama `codex/issue-N-slug` ↔ worktree
  `../eslint-opinionated-wt/issue-N`. Si no puedes nombrar el worktree con
  un issue, no deberías estar creando el worktree.
- **El checkout principal es del dueño**: se queda en `main`, limpio,
  reservado para revisión e integración. Los agentes no trabajan ahí.
- **Cada worktree compila lo suyo**: el dogfood importa `./dist/index.mjs`,
  así que `pnpm build` es POR worktree (el script `lint` ya lo hace). Las
  mediciones de solo lectura apuntan al dist del worktree propio, no al
  del checkout principal.
- **Verificaciones pesadas en paralelo compiten por CPU**: los testers
  tipados ya mostraron timeouts de 5s con la máquina cargada — si dos
  worktrees corren `pnpm test` a la vez y aparece un timeout, re-ejecuta
  antes de asumir rojo real.
- `gh` funciona igual desde cualquier worktree (mismo repo).
- Un worktree huérfano es andamiaje: si `git worktree list` muestra
  entradas de issues cerrados, eso es deuda de limpieza.

## Higiene local

- Antes de editar, sincronizar con `origin/main` y revisar `git status`.
- Stagear solo los archivos de la tarea actual.
- Si aparecen cambios ajenos, no revertirlos: separarlos del scope y
  trabajar alrededor.

## Lo que el agente NO hace

- **Releases**: el tag lo dispara solo el dueño (bump doble: `package.json`
  Y `meta.version` en `src/index.ts`; typecheck antes del tag).
- Push directo a `main` (excepción: solo el dueño, y el issue queda
  comentado con commit, validaciones y razón).
- Decidir severidades de presets: las mediciones se presentan, el dueño
  decide. Doctrina: `off` o `error`, **nunca `warn`**.
- Cerrar issues con DoD incompleta, revertir cambios ajenos del working
  tree, o "mejorar" trabajo ya aprobado fuera del scope de tu issue.

## Al terminar una tarea

1. Verificación completa en verde (los cuatro comandos del ritual).
2. `git status` limpio: solo los archivos de tu tarea, sin andamiaje.
3. Comentario de cierre en el issue (formato de arriba) + checkboxes de la
   DoD actualizados.
4. PR creado con el resumen, o el trabajo en su rama listo para revisión.
5. Reporta lo que te costó decidir: los sitios dudosos son exactamente lo
   que la revisión del dueño mira primero.
