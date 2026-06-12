---
name: Propuesta de regla
about: Proponer una regla nueva o un cambio de politica del catalogo
title: "Regla <nombre-de-la-regla>: <contrato que protege>"
labels: regla-nueva, decision-pendiente
assignees: ""
---

## Por que existe / que resuelve

Describe el problema arquitectonico que la regla debe volver verificable.
Incluye la situacion concreta que disparo la propuesta y el axioma del README
que la sostiene.

## Ejemplos

Codigo que deberia fallar:

```ts
// ...
```

Codigo esperado:

```ts
// ...
```

## Diseno propuesto

- Que nodos o patrones debe reportar.
- Que casos debe ignorar.
- Si puede tener autofix seguro.
- Que opciones necesita, si alguna.

## Complicaciones / trade-offs

Enumera los casos donde la regla podria confundirse, ser demasiado invasiva o
chocar con frameworks, runtimes, bundlers, tipos de TypeScript o reglas ya
existentes.

## Encaje en presets

Propon la severidad inicial por preset:

- `shared`:
- `backend` / `nest`:
- `frontend`:
- `next` / `astro`:
- `package`:

Si debe nacer como opt-in, explica por que.

## Plan de validacion

Lista las codebases o fixtures donde se debe medir primero en modo solo
lectura. Incluye que conteos importan y que muestra manual debe revisarse antes
de activarla por defecto.

## Definicion de hecho

- [ ] Regla implementada con tests de casos validos e invalidos.
- [ ] Autofix testeado, si aplica.
- [ ] README actualizado con el contrato y los limites de la regla.
- [ ] Presets decididos explicitamente antes de publicar.
