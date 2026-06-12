---
name: Deuda tecnica
about: Registrar deuda conocida con contexto suficiente para pagarla sin el chat donde nacio
title: "<verbo imperativo>: <que se paga>"
labels: deuda-tecnica
assignees: ""
---

## Por que existe

Como se contrajo la deuda y que decision la origino. Si fue un trade-off
deliberado (ej.: la fase 1 del RuleNode acepto un tipo que miente para
eliminar 187 pragmas), DECLARALO: una deuda escondida en un comentario es
peor que la deuda misma.

## Estado actual, medido

Conteos reproducibles, con el comando que los produce:

```bash
# ej.: grep -rl "@ts-nocheck" src/ | wc -l
```

Si la deuda esta apagando una regla del dogfood, di cual linea de la lista
de pendientes del eslint.config.ts le corresponde.

## Acciones ya ejecutadas

Historial con fechas: que se intento, que se decidio, que quedo a medias.
Este issue debe poder retomarse en frio por un agente que no vio el chat.

## Analisis de implementacion

El analisis vive aqui; el codigo vive en el codigo. Incluye:

- Estrategia por lotes (por carpeta/familia) si el volumen lo pide.
- Que NO debe hacerse (ej.: nombres autogenerados en #8, casts en vez de
  modelar en #4) — la mecanica barata que traicionaria el objetivo.
- Verificacion tras cada lote:

```bash
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"  # el shell trae Node 16
pnpm build && pnpm typecheck && pnpm test && pnpm lint
```

## Definicion de hecho

Checkboxes verificables — la mejor DoD es greppeable (ej.: "el grep X
devuelve 0", "la linea Y sale de la lista de pendientes"):

- [ ] ...
- [ ] Verificacion completa en verde (build, typecheck, tests, lint).
- [ ] Si la deuda apagaba una regla: la linea eliminada de la lista de
      pendientes del eslint.config.ts.
