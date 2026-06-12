# AGENTS.md

## Modo de trabajo

Este repo trabaja 100% dentro del ecosistema de GitHub. La conversacion local ayuda a ejecutar, pero la fuente de verdad operacional debe quedar en issues, ramas, worktrees, commits y pull requests.

## Flujo obligatorio

1. Todo cambio no trivial parte de un issue de GitHub o deja uno creado/enlazado antes de implementarse.
2. Cada tarea se baja a una rama propia, con prefijo `codex/`, y preferiblemente a un worktree dedicado cuando haya trabajo paralelo o riesgo de mezclar contextos.
3. No acumular decisiones importantes solo en el chat: registrar el estado, bloqueos, mediciones y trade-offs en el issue o en el PR.
4. El PR es la unidad de entrega. Debe enlazar el issue, resumir el cambio, listar validaciones ejecutadas y dejar claro que queda pendiente.
5. Los commits deben ser pequenos y revisables. Evitar mezclar refactors, docs y reglas nuevas salvo que el issue los pida como una sola unidad.
6. Cerrar issues solo cuando el criterio de hecho este cumplido o cuando el dueno decida explicitamente que el remanente ya no bloquea.

## Higiene local

- Antes de editar, sincronizar con `origin/main` y revisar `git status`.
- Stagear solo los archivos de la tarea actual.
- Si aparecen cambios ajenos, no revertirlos: separarlos del scope y trabajar alrededor.
- Despues de implementar, correr las validaciones relevantes y reportarlas en el PR.

## Publicacion

- Preferir branch + PR sobre pushes directos a `main`.
- Si por excepcion se empuja directo a `main`, el issue debe quedar comentado con commit, validaciones y razon de la excepcion.
- Mantener labels, estado del issue y PR alineados con la realidad del trabajo.
