---
name: Propuesta de regla
about: Proponer una regla nueva o un cambio de politica del catalogo
title: "Regla <nombre-de-la-regla>: <contrato que protege>"
labels: regla-nueva, decision-pendiente
assignees: ""
---

## Por que existe / que resuelve

Describe el problema arquitectonico que la regla debe volver verificable. Incluye la situacion concreta que disparo la propuesta y el axioma del README que la sostiene.

## Ejemplos

Codigo que deberia fallar:

```ts
// ...
```

Codigo esperado:

```ts
// ...
```

Codigo que PARECE violacion pero debe pasar (la semilla de la lista blanca y de los casos `valid` de los tests — piensa la exencion antes que la regla):

```ts
// ej.: el `while (true)` de no-impossible-branch, el `== null` de
// no-anonymous-condition, el `null` de Prisma que significa "borra el campo"
```

## Diseno propuesto

- Que nodos o patrones debe reportar.
- Que casos debe ignorar.
- Si puede tener autofix seguro.
- Que opciones necesita, si alguna.
- Nombre: en la familia de la casa (`no-*`, `prefer-*`, `requires-*`,
  `max-*`) y que diga lo que DEFIENDE, no lo que detecta
  (no-impossible-branch, no no-unnecessary-condition).

## Mensaje de error (borrador)

Redacta el mensaje ANTES de implementar — en esta casa el mensaje ES el producto: el linter es el code review que nadie tiene tiempo de hacer. Prueba de fuego: **si no puedes ensenar el fix en el mensaje, el diseno no esta listo.** Estilo playbook (que patron usar, como se llama, donde va), sin tildes, y sin recomendar nada que otra regla del catalogo prohiba.

> ...

## Estrategia de implementacion

Explica que evidencia usara la regla y por que ese nivel de evidencia alcanza:

- **AST-only:** que puede decidir mirando solo la sintaxis.
- **Type-aware:** si necesita parser services, simbolos, tipos, imports
  resueltos o `package.json` del simbolo origen.
- **Por nombre / convencion:** que nombres, patrones de archivo o globs usara,
  y por que no hay una evidencia mas fuerte disponible.
- **Paquete de terceros:** si conviene envolver una regla existente, sumar una
  dependencia o copiar una lista de referencia. Incluye costo de dependencia,
  compatibilidad y mantenimiento.
- **Runtime / filesystem:** si necesita leer archivos del proyecto
  (`tsconfig`, `package.json`, configs de framework), define desde donde se
  resuelve y que pasa si faltan.

Si hay varias rutas, compara la version barata contra la version correcta y propone con cual empezar.

## Sinergias y premisas con el resto del catalogo

Las lecciones mas caras vienen de la interaccion entre reglas, no de las reglas solas. Responde explicitamente:

- **¿De que premisas depende?** (flags de tsconfig, otra regla, type info) y
  que pasa si la regla llega ANTES que su premisa (el caso del guardian
  mudo: no-impossible-branch sin noUncheckedIndexedAccess acusa guards
  necesarios).
- **¿A que reglas fortalece?**
- **¿A que reglas puede cegar o contradecir?** (no-anonymous-condition casi
  ciega a las reglas de Result, que reconocen el guard por su forma; el
  mensaje upstream de no-floating-promises recomendaba .then/.catch que
  no-promise-chain prohibe).

## Complicaciones / trade-offs

Enumera los casos donde la regla podria confundirse, ser demasiado invasiva o chocar con frameworks, runtimes, bundlers o tipos de TypeScript.

## Encaje en presets

Doctrina de la casa: **`off` o `error`, nunca `warn`** (un warn se ignora desde el dia dos). Propon la severidad inicial por preset:

- `shared`:
- `backend` / `nest`:
- `frontend`:
- `next` / `astro`:
- `package`:

Si debe nacer como opt-in, explica por que (precedente: el volumen medido de no-anonymous-condition; entro a bases solo por decision explicita del dueno).

## Plan de validacion

Medicion de SOLO LECTURA (config temporal `.tmp-*.config.mjs` dentro del proyecto medido, borrado al final; cero cambios en lo medido). Lista las codebases — **este repo SIEMPRE esta en la lista**: toda regla nueva nos mide a nosotros primero. Incluye que conteos importan y que muestra manual debe revisarse antes de activarla por defecto.

Si el propio src queda debiendo, decide DE ANTEMANO el destino de esa deuda: exencion de frontera (`allowFilePatterns`) o linea en la lista de pendientes del eslint.config.ts con su issue de cumplimiento.

## Definicion de hecho

- [ ] Regla implementada con tests de casos validos e invalidos (incluidos
      los "parece violacion pero debe pasar").
- [ ] Mensaje final fiel al borrador: ensena el fix y no contradice a
      ninguna otra regla del catalogo.
- [ ] Autofix testeado, si aplica.
- [ ] Estrategia de implementacion validada: AST-only, type-aware, por nombre,
      paquete de terceros o lectura de archivos.
- [ ] Medicion de solo lectura ejecutada y muestreo manual revisado.
- [ ] Deuda dogfood propia resuelta o registrada (exencion o pendientes+issue).
- [ ] README actualizado con el contrato y los limites de la regla (cuando
      exista `docs/reglas/`, ver issue #15: la ficha propia de la regla).
- [ ] Presets decididos explicitamente antes de publicar.
