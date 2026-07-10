# Plantilla: tarea para un agente de código

Cuando delegues trabajo a un agente de código, no le pases una charla ni un resumen suelto: pásale **un markdown autocontenido** que diga qué hacer, por qué hacerlo, dónde tocar, cómo verificarlo y qué no debe mezclar.

> **Regla de oro:** el agente no tiene tu contexto, ni el historial de la conversación, ni el issue abierto en otra pestaña. Todo lo necesario para hacer bien el cambio vive en esta tarea.

## Lectura rápida

| Sección | Para qué sirve |
| --- | --- |
| **Salida esperada** | Define el artefacto final: un único bloque markdown copiable que otro agente puede ejecutar sin contexto externo. |
| **Tipo de tarea** | Evita confundir implementar desde cero con continuar un PR, revisar sin cambios o reparar CI. |
| **Fuente viva** | Evita implementar un issue viejo, un comentario obsoleto o una decisión que ya cambió. |
| **Exploración con `@skapxd/tree`** | Da inventario del proyecto antes de leer archivos completos y ayuda a encontrar utilidades reutilizables. |
| **Diseño** | Convierte intención en contrato ejecutable: qué reporta, qué ignora, qué evidencia usa y qué opciones tiene. |
| **Tests y gates** | Define cómo probar el cambio sin dejar huecos ni validaciones implícitas. |
| **Registro operativo** | Obliga a dejar decisiones, mediciones y bloqueos en GitHub, no solo en chat. |

## Salida esperada

**El resultado de usar esta plantilla es un solo bloque markdown copiable** para pegarlo en un agente de código como tarea inicial.

Ese markdown final debe cumplir estas reglas:

- **Sin prólogo fuera del markdown:** no empieces con “aquí tienes” ni cierres con explicación adicional si lo que se pidió fue una tarea lista para copiar.
- **Un solo bloque de código:** la respuesta completa debe estar dentro de un único bloque fenced `markdown`; no renderices encabezados, párrafos ni bloques `bash` como chat normal fuera de ese bloque.
- **Fence exterior de cuatro backticks:** como la tarea final suele contener bloques internos `bash` con tres backticks, el contenedor exterior debe usar cuatro backticks. Con tres, el primer bloque interno corta el contenedor y el resto queda como chat.
- **Autocontenido:** incluye contexto, diseño, rutas, comandos, tests, gates y límites; el agente no debe depender del chat previo.
- **Tipo de tarea declarado:** dice si el agente implementa desde cero, continúa un PR existente, revisa sin cambios o repara CI/checks.
- **Artefacto final explícito:** la tarea generada incluye su propia salida esperada: PR, comentario, issue actualizado, validaciones, draft, no merge, o lo que aplique.
- **Con secciones reales, no placeholders:** reemplaza las notas de esta plantilla por contenido concreto del issue o cambio.
- **Comandos copiables dentro del bloque:** usa bloques internos `bash` para comandos largos o múltiples, siempre contenidos dentro del fence exterior de cuatro backticks.
- **Listo para ejecución:** quien lo reciba debe poder crear la rama/worktree, implementar, probar y preparar PR sin pedir contexto adicional.

> **Formato obligatorio al responder:** la primera línea de la respuesta debe ser cuatro backticks seguidos de `markdown`; la última línea debe ser cuatro backticks solos. Todo el documento va dentro. No agregues explicación, citas, footers ni notas fuera del bloque.
>
> **Prueba visual:** si el usuario ve encabezados renderizados como chat, tarjetas separadas de `bash` o texto fuera del bloque copiable, la salida está mal.

## Principios

> **1. Autocontenido**
>
> - *Qué exige:* resume en la tarea cualquier decisión tomada en debate.
> - *Evita:* instrucciones inútiles como “ver el issue” o “como discutimos”.

> **2. Fuente viva y fecha de corte**
>
> - *Qué exige:* declara qué issue, PR o documento se leyó y cuándo.
> - *Evita:* implementar contra un estado viejo de GitHub.

> **3. Tipo de trabajo explícito**
>
> - *Qué exige:* declara si la tarea es implementación nueva, continuación de PR, revisión/auditoría sin cambios o reparación de CI/checks.
> - *Evita:* reimplementar un PR vivo, crear un PR duplicado o hacer una revisión sin contrato de entrega.

> **4. Exploración estructural primero**
>
> - *Qué exige:* usa `@skapxd/tree` antes de abrir archivos grandes o diseñar una regla nueva.
> - *Evita:* reinventar helpers porque el agente no vio la estructura real del repo.

> **5. Rutas y símbolos exactos**
>
> - *Qué exige:* nombra archivos, funciones, helpers, registros y presets reales.
> - *Evita:* cambios a medias, registros olvidados y duplicación accidental.

> **6. Reusar, no duplicar**
>
> - *Qué exige:* lista las utilidades existentes que deben consumirse y las extracciones permitidas.
> - *Evita:* crear una segunda versión de lógica que ya existe en el repo.

> **7. El mensaje es el producto**
>
> - *Qué exige:* para reglas de lint, redacta el mensaje antes de implementar.
> - *Evita:* reglas que detectan algo, pero no enseñan el fix.

> **8. Spike si hay riesgo**
>
> - *Qué exige:* prueba primero la parte incierta con un test mínimo.
> - *Evita:* construir una regla completa sobre una suposición falsa del checker, AST o runtime.

> **9. Gates exactos**
>
> - *Qué exige:* comandos literales, con Node/PATH si aplica.
> - *Evita:* “corrí tests” sin reproducibilidad.

> **10. Ejemplos copiables**
>
> - *Qué exige:* ejemplos que puedan pegarse en tests o docs.
> - *Evita:* strings inventados, especialmente con `typeToString`, snapshots o salidas frágiles.

> **11. Alcance cerrado**
>
> - *Qué exige:* declarar lo que queda fuera y por qué.
> - *Evita:* refactors no pedidos y cambios mezclados.

## Plantilla

Copia estos encabezados en la tarea final y reemplaza las notas por contenido real. Borra lo que no aplique: un cambio pequeño no necesita spike, opciones ni mediciones externas.

---

### Título

**Propósito:** identificar la tarea de un vistazo.

**Formato:** `# <Título imperativo del cambio> (issue #NNN)`

**Rellena:** nombre del cambio, issue o PR y verbo de acción.

**Evita:** verbos ambiguos como “cerrar el draft” si pueden confundirse con cerrar el PR, mergear o sacar de draft. Usa “revalidar”, “actualizar”, “dejar listo para revisión” o “reparar checks” según corresponda.

**Ejemplo:** `# Implementa nest-controller-input-dtos (issue #182)`

---

### Tipo de tarea

**Propósito:** evitar que el agente ataque el problema equivocado.

**Elige una opción y borra las demás:**

- **Implementación nueva desde issue:** no existe PR vivo; la tarea crea rama/worktree, implementa y abre PR.
- **Continuación de PR existente:** existe PR vivo; la tarea revisa estado actual, actualiza la rama y no crea PR duplicado.
- **Revisión/auditoría sin cambios:** la tarea produce hallazgos y evidencia; no toca código salvo que el usuario lo autorice.
- **Reparación de CI/checks:** la tarea parte de un PR o branch existente y solo corrige el rojo necesario.

**Incluye:** issue, PR, branch y si el PR debe quedar draft, listo para revisión o solo comentado.

---

### Salida esperada del agente

**Propósito:** definir qué debe existir cuando el agente termine la tarea.

**Rellena:** artefacto final concreto: PR creado, PR existente actualizado, comentario en issue, comentario en PR, checkboxes de DoD editados, validaciones pegadas, rama lista, o reporte sin cambios.

**Incluye:** qué no debe hacer el agente al terminar, por ejemplo no mergear, no cerrar issue manualmente, no crear PR nuevo si ya existe uno vivo, no tocar archivos fuera del scope.

**Si la tarea dice “revalidar” o “dejar listo para revisión”:** exige validación local fresca aunque no haya cambios de código. No conviertas la validación completa en opcional por ausencia de diff.

**Si la tarea revalida un PR existente:** el registro normal va en comentario del PR. El issue solo se actualiza o comenta si cambia la DoD, el alcance, las mediciones, un bloqueo o una decisión de criterio.

**Ejemplo para PR existente:** `PR #NNN actualizado o confirmado sin cambios, validaciones completas en tabla, comentario de avance si hubo cambios de criterio, sin merge y sin sacar de draft salvo instrucción explícita.`

---

### Apertura

**Propósito:** orientar al agente antes de entrar en detalles.

**Rellena:** un párrafo con el repo, qué existe hoy, qué debe existir al terminar y el enlace de trazabilidad.

**Incluye:** archivos clave que debe leer primero y cualquier contrato local obligatorio como `AGENTS.md`.

---

### Intención

**Propósito:** explicar el “para qué” del cambio.

**Rellena:** la motivación de alto nivel, sin entrar todavía en implementación.

**Incluye:** si esa motivación debe quedar reflejada en código, comentario de regla, doc o JSDoc.

---

### Contexto necesario

**Propósito:** darle al agente el contexto que no puede inferir solo leyendo archivos.

**Rellena:** decisiones ya tomadas, contratos de paquetes, invariantes, límites del issue y detalles del dominio.

**Incluye:** qué decisión reemplaza a cuál si hubo debate previo, y qué follow-up no debe mezclarse.

---

### Fuente viva y fecha de corte

**Propósito:** evitar drift entre la tarea y GitHub.

**Rellena:** issue, PR, documento o fuente oficial leída; fecha exacta; y qué parte manda si hay conflicto entre body, comentario, PR, `AGENTS.md` o docs oficiales.

**Incluye:** instrucción explícita de reconsultar si el estado vivo cambió después de esa fecha. Si mencionas SHAs, checks, merge state o conteos, márcalos como “observado en fecha” y exige reconsulta antes de actuar. Si el dueño da una instrucción nueva fuera de GitHub, registra la decisión en issue o PR antes de implementarla cuando el repo use GitHub como fuente operacional.

**Separa autoridad de proceso y autoridad funcional:** `AGENTS.md` manda en flujo, ramas, gates, formato y restricciones operativas; el comentario/review más reciente del dueño manda en alcance funcional del cambio. Si chocan, no inventes jerarquía silenciosa: declara el conflicto y registra la decisión en GitHub.

---

### Preparación de rama, PR y worktree

**Usa esta sección cuando haya que tocar código o continuar un PR.**

**Propósito:** evitar worktrees duplicados, ramas obsoletas y PRs paralelos.

**Rellena:** comandos defensivos para descubrir el estado antes de crear nada.

**Base recomendada:**

```bash
cd /ruta/al/repo
git status --short
git worktree list
git fetch origin --prune
GH="$(command -v gh || true)"
if [ -z "$GH" ] && [ -x /opt/homebrew/bin/gh ]; then GH=/opt/homebrew/bin/gh; fi
test -n "$GH" || { echo "GitHub CLI no encontrado"; exit 1; }
```

**Si el PR ya existe:** reutiliza su branch/worktree si ya está creado; crea worktree solo si falta; revisa si el branch está detrás de `origin/main`; actualiza con la estrategia mínima del repo; si necesitas push forzado tras rebase, usa `--force-with-lease`.

**Incluye auditoría explícita del diff del PR:**

```bash
cd /ruta/al/worktree
git fetch origin --prune
GH="$(command -v gh || true)"
if [ -z "$GH" ] && [ -x /opt/homebrew/bin/gh ]; then GH=/opt/homebrew/bin/gh; fi
test -n "$GH" || { echo "GitHub CLI no encontrado"; exit 1; }
"$GH" pr view NNN --json number,title,state,isDraft,headRefName,baseRefName,mergeStateStatus,statusCheckRollup
"$GH" pr diff NNN
git diff origin/main...HEAD
git diff --stat origin/main...HEAD
git diff --name-only origin/main...HEAD
```

**No sustituyas revisión por inventario:** `--name-only` y `--stat` sirven para orientar superficie, pero no revisan comportamiento. Si la tarea es revalidar un PR, exige leer el patch completo con `gh pr diff NNN` o `git diff origin/main...HEAD`. Si rediriges el patch a un archivo, agrega el comando que lo lee o inspecciona; generar `/tmp/pr.patch` sin leerlo no cuenta como auditoría.

**Si debes reutilizar o crear un worktree para un branch remoto existente:** no encadenes `worktree add` y `git switch -c` a ciegas. Primero detecta si el worktree ya existe; si existe, entra y verifica que esté en la rama esperada y limpio antes de sincronizar. Si no existe, detecta si la rama local existe; si existe, crea el worktree desde esa rama; si no existe, créala desde el remoto en el mismo `worktree add`.

```bash
cd /ruta/al/repo
BRANCH="codex/issue-NNN-slug"
WORKTREE="../lint-agent-wt/issue-NNN"
if [ -e "$WORKTREE/.git" ]; then
  cd "$WORKTREE"
else
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git worktree add "$WORKTREE" "$BRANCH"
  else
    git worktree add -b "$BRANCH" "$WORKTREE" "origin/$BRANCH"
  fi
  cd "$WORKTREE"
fi
test "$(git branch --show-current)" = "$BRANCH" || { echo "Worktree en branch inesperada"; exit 1; }
git status --short --branch
test -z "$(git status --short)" || { echo "Worktree sucio antes de sincronizar"; exit 1; }
git fetch origin --prune
git show-ref --verify --quiet "refs/remotes/origin/$BRANCH" || { echo "Branch remoto origin/$BRANCH no encontrado"; exit 1; }
git merge --ff-only "origin/$BRANCH"
git status --short --branch
git rev-parse HEAD
git rev-parse "origin/$BRANCH"
```

**No revalides worktrees stale ni sucios:** después de entrar al worktree, verifica que esté limpio, sincroniza con el remoto del PR o falla explícitamente. Revalidar un `HEAD` viejo o un árbol local sucio produce una falsa señal verde.

**Si el PR no existe:** crea una rama 1:1 con el issue y el prefijo del agente; no inventes otro issue ni otro PR si GitHub ya muestra uno vivo para la misma tarea.

**Incluye:** qué comando debe usar para ver el PR, qué hacer si `gh` no existe, cómo auditar el diff y cuándo reportar blocker.

**Bloques `bash` autosuficientes:** cada bloque copiable debe incluir el `cd` necesario, el `export PATH` si usa Node/pnpm/npx, y las variables que consume. No asumas que el agente ejecutará todos los bloques en la misma sesión o directorio.

---

### Exploración estructural con `@skapxd/tree`

**Propósito:** darle al agente inventario del proyecto antes de diseñar o leer archivos completos.

**Primero, inventario desde la raíz del repo:**

```bash
cd /ruta/al/worktree
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
npx --yes @skapxd/tree@1.3.2 .
```

**Por qué así:** `@skapxd/tree` ya respeta `.gitignore` y filtra clutter común. No agregues `--ignore` por costumbre: úsalo solo si el repo tiene ruido adicional no cubierto por `.gitignore`, y explica por qué.

**Después, relaciones de los puntos de entrada relevantes:**

```bash
cd /ruta/al/worktree
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
npx --yes @skapxd/tree@1.3.2 src/rules/regla.ts -r
npx --yes @skapxd/tree@1.3.2 docs/reglas/regla.md -r
```

**Regla práctica:** trabaja con el inventario completo de archivos, carpetas y relaciones. La estructura pesa poco frente al beneficio de saber qué existe antes de diseñar o editar. No agregues `--depth`, `--summary` ni otros recortes a los comandos generados por defecto; recorta solo después de ver que el grafo real dejó de ser barato y explica la razón.

**Incluye:** qué imports, importers o docs enlazadas debe leer después del mapa.

---

### Paso 1: Spike

**Usa esta sección solo si la detección es incierta.**

**Propósito:** bajar riesgo antes de implementar todo.

**Rellena:** qué confirmar, con qué test mínimo, cuál es la vía primaria y cuál es el fallback.

**Incluye:** “No sigas hasta tener una vía con test verde” cuando el resto del diseño dependa de esa prueba.

---

### Diseño

**Propósito:** convertir la intención en un contrato implementable.

Rellena estos puntos:

- **Qué reporta / hace:** conducta exacta que cambia.
- **Qué ignora:** semilla de los casos válidos.
- **Evidencia:** AST-only, type-aware, provenance de imports, brand/símbolo, filesystem o runtime; y qué pasa si falta esa evidencia.
- **Reuso:** utilidades existentes a consumir, con rutas exactas.
- **Extracciones:** helper compartido a crear, si evita duplicación real.
- **Opciones:** defaults y razones, si aplica.
- **Superficies a verificar:** archivos, registros, docs, tests o helpers que deben inspeccionarse sin convertir esa lista en obligación de tocarlos.

> **Cuidado:** una ruta listada para verificar no es una ruta obligatoria a modificar. Si el estado actual ya cumple, no agregues churn para “hacer aparecer” el archivo en el diff.

---

### Mensaje(s) de error

**Usa esta sección para reglas de lint.**

**Propósito:** diseñar el producto que verá quien recibe el error.

**Rellena:** `messageId` por causa cuando los fixes difieren.

**Incluye:** texto que enseñe el fix con patrón, nombre y ubicación.

> **Prueba de fuego:** si el mensaje no puede enseñar el fix, el diseño todavía no está listo.

---

### Registro y activación

**Usa esta sección para reglas nuevas o cambios de preset.**

**Propósito:** evitar que la regla exista pero no corra.

**Rellena:** dónde se importa, dónde se registra, en qué preset entra, severidad, docs e índices que deben actualizarse.

---

### Tests

**Propósito:** transformar el contrato en casos ejecutables.

**Rellena:** casos inválidos, casos válidos y casos que parecen violación pero deben pasar.

**Incluye:** `messageId` y `data` esperados.

**Cuidado:** para valores frágiles como `typeToString`, instruye correr el test y fijar el valor observado.

---

### Fuera de alcance

**Propósito:** impedir que el agente mezcle follow-ups o refactors no pedidos.

**Rellena:** lo que no se toca y por qué.

**Incluye:** reglas vecinas, issues relacionados o trabajo futuro que no debe entrar en este PR.

**No sobrejustifiques exclusiones:** si algo queda fuera porque no está en el alcance v1, dilo así. No inventes una razón semántica general que pueda bloquear o sesgar una regla futura.

---

### Gates

**Propósito:** definir cuándo el cambio está realmente listo.

**Rellena:** comandos literales que deben quedar verdes, con Node/PATH si aplica.

**Si la tarea es revalidar un PR o dejarlo listo para revisión:** el ritual local completo es obligatorio aunque no cambies código. Los checks remotos verdes no reemplazan la revalidación local cuando ese es el objetivo de la tarea.

**Cada bloque debe ser autosuficiente:** incluye `cd /ruta/al/worktree` y `export PATH=...` dentro del bloque de gates. No dependas de un `cd` o `PATH` declarado en una sección anterior.

**Durante debug:** puedes pedir tests focales o comandos separados para aislar fallas, pero no son el gate final.

**Gate final obligatorio:**

```bash
cd /ruta/al/worktree
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
pnpm build && pnpm typecheck && pnpm test && pnpm lint
```

**No lo condiciones a cambios de código:** si la tarea dice revalidar, auditar o dejar listo para revisión, el comando encadenado final corre igual.

---

### Registro operativo

**Propósito:** dejar el trabajo auditable en GitHub.

**Rellena:** qué comentario, update o checkbox debe quedar en issue o PR.

**Incluye:** mediciones en tabla, decisiones, bloqueos y DoD.

**Para PR existente:** comenta en el PR por defecto. Comenta o edita el issue solo si cambió DoD, alcance, medición, bloqueo o criterio; no uses el issue para ruido de revalidación sin cambios.

> **No dejes decisiones solo en chat.**

---

### PR

**Propósito:** definir la unidad de entrega.

**Rellena:** rama, worktree, título, `Refs`/`Closes`, si debe salir draft y qué debe contener el body.

**Si ya existe PR vivo:** nombra el número y branch; declara que no se crea PR duplicado; define si se actualiza body, se agrega comentario o solo se revalidan checks.

## Variantes

| Caso | Qué cambia en la tarea |
| --- | --- |
| **Regla nueva** | Usa todas las secciones. Incluye registro en `src/shared/rules.ts`, preset correspondiente, ficha en `docs/reglas/`, fila en índice y conteo si aplica. |
| **Modificar regla existente** | Enfoca la tarea en el *delta*. Declara qué se conserva intacto y qué cambia. Los tests existentes deben seguir verdes. |
| **Continuar PR existente** | Declara PR, branch y estado draft/listo; reconsulta issue y PR; reutiliza worktree si existe; no crea PR duplicado; separa archivos a verificar de archivos a modificar. |
| **Reparar CI/checks** | Parte del PR o branch rojo; toca solo lo necesario para volver a verde; conserva alcance y body del PR salvo que la corrección cambie el contrato. |
| **Revisión/auditoría** | Produce hallazgos, evidencia y riesgos; no modifica archivos ni abre PR salvo instrucción explícita. |
| **Cambio en otro repo/paquete** | El agente trabaja en ese repo, lee su `AGENTS.md` y ancla la tarea en hechos verificables como exports publicados o API real. |

## Checklist antes de despachar

- [ ] **Autocontenido:** un agente sin contexto puede ejecutarlo de principio a fin.
- [ ] **Output copiable:** la respuesta final es un único bloque `markdown` con fence exterior de cuatro backticks; no hay chat renderizado fuera.
- [ ] **Tipo de tarea claro:** implementación nueva, continuación de PR, revisión o reparación de CI.
- [ ] **Salida del agente clara:** dice qué artefacto final debe quedar y qué acciones están prohibidas al cerrar.
- [ ] **Título sin ambigüedad:** no usa verbos que puedan confundirse con cerrar, mergear o sacar de draft.
- [ ] **Rutas exactas:** archivos, utilidades y registros están nombrados.
- [ ] **PR/worktree defensivo:** si hay PR vivo, no crea duplicado y no asume que el worktree ya no existe.
- [ ] **Worktree fresco:** si reutiliza worktree, verifica branch esperada, worktree limpio, existencia de `origin/<branch>`, fetch y sincronización con `origin/<branch>` antes de validar.
- [ ] **Diff auditado:** si hay PR vivo, la tarea exige revisar el patch completo con `gh pr diff` o `git diff origin/main...HEAD`; `--name-only`/`--stat` no bastan y un patch redirigido a archivo debe leerse.
- [ ] **Verificar no es tocar:** las superficies listadas no obligan churn si ya cumplen.
- [ ] **Tree completo:** los comandos `@skapxd/tree -r` no usan `--depth`, `--summary` ni recortes por defecto.
- [ ] **Bloques autosuficientes:** cada bloque `bash` incluye `cd`, `PATH` y variables necesarias.
- [ ] **Revalidación real:** si la tarea dice revalidar/listo para revisión, exige `pnpm build && pnpm typecheck && pnpm test && pnpm lint` fresco aunque no haya cambios.
- [ ] **Mensaje útil:** si es regla de lint, el mensaje enseña el fix.
- [ ] **Spike definido:** lo incierto tiene prueba mínima y fallback.
- [ ] **Gates literales:** comandos exactos, con Node/PATH si aplica.
- [ ] **Alcance cerrado:** follow-ups y exclusiones están declarados.
- [ ] **Tests completos:** incluye inválidos, válidos y “parece violación pero debe pasar”.

---

[Índice de reglas](./reglas/README.md) | [Propuesta de regla (issue template)](../.github/ISSUE_TEMPLATE/plantilla-propuesta-regla.md) | [README principal](../README.md)
