# Plantilla: brief en markdown para un agente de código

Cuando el trabajo se delega a un agente de código (Codex, Claude Code, etc.), no se le pasa una charla: se le pasa **un solo markdown autocontenido** que define la intención, el diseño y cómo verificarlo. Este documento captura la estructura que usamos, y por qué cada parte importa.

La regla de oro: **el agente no tiene tu contexto, ni el historial de la conversación, ni el issue abierto en otra pestaña.** Todo lo que necesita para hacer el cambio bien —y para no hacerlo mal— vive en el brief.

## Principios (los no-negociables)

1. **Autocontenido.** Si una decisión se tomó en un debate, resúmela en el brief. No escribas "como discutimos" ni "ver el issue"; el agente no estuvo. Referencia el issue para trazabilidad, no como fuente de contexto faltante.
2. **Rutas y símbolos exactos.** Nombra los archivos reales a tocar, las funciones/utilidades a reusar y **dónde se registra/activa** el cambio. Un brief vago produce reimplementación o un cambio a medias.
3. **Reusar, no duplicar.** Lista las utilidades existentes que debe consumir. Si hay que *extraer* una pieza inline a un util compartido, dilo explícitamente (y qué otra regla debe pasar a consumirlo).
4. **El mensaje ES el producto** (para reglas de lint). Incluye el **borrador del mensaje de error**, y que enseñe el fix concreto: qué patrón usar, cómo se llama, dónde va. Prueba de fuego: si no puedes enseñar el fix en el mensaje, el diseño no está listo.
5. **Spike si hay riesgo.** Si la detección depende de algo incierto (un símbolo que cruza paquetes, un tipo exótico del checker), exige un **spike de de-riesgo con test** ANTES de codear el resto, y da un fallback. No mandes al agente a construir sobre una suposición.
6. **Gates exactos.** Los comandos que deben quedar verdes, con la versión de Node y el `PATH` si aplica. Sin "corre los tests": el comando literal.
7. **Ejemplos copiables; no inventes strings de tests.** Los ejemplos de código deben poder pegarse. Para aserciones frágiles (salida de `typeToString`, snapshots), instruye "corre el test y fija el valor observado", no adivines el string.
8. **Alcance cerrado.** Declara qué queda **fuera de alcance** y por qué. Evita que el agente se expanda a refactors no pedidos.

## Esqueleto

Copia y rellena. Borra las secciones que no apliquen (un cambio pequeño no necesita "spike" ni "opciones").

```markdown
# <Título imperativo del cambio> (issue #NNN)

<1 párrafo: repo, qué existe hoy, qué debe pasar a existir. Enlaza el issue
para trazabilidad. Menciona leer primero los archivos clave.>

## Intención (documéntala en el código/JSDoc)

<Por qué existe el cambio, a alto nivel. El "para qué", no el "cómo". Esto
también debe quedar en el código, no solo en el brief.>

## Contexto necesario

<Los hechos que el agente no puede inferir: contratos de un paquete, decisiones
de diseño ya tomadas, invariantes. Autocontenido.>

## Paso 1 — Spike (solo si la detección es incierta)

<Qué confirmar y cómo, con un test temporal. Vía primaria + fallback. "No sigas
hasta tener una vía con test verde."> 

## Diseño

- **Qué reporta / hace.**
- **Qué ignora** (la semilla de los casos válidos).
- **Reuso:** utilidades existentes a consumir (rutas exactas). Extracciones a
  compartir, si aplica.
- **Opciones** (con defaults), si alguna.

## Mensaje(s) de error (borrador)  ← para reglas de lint

> <Texto que enseña el fix, con ejemplo copiable. Un messageId por causa si los
> fixes difieren.>

## Registro y activación  ← para reglas nuevas

<Dónde se importa/registra, en qué preset y severidad, qué docs/índices tocar.>

## Tests

<Casos válidos e inválidos, incluidos los "parece violación pero debe pasar".
Qué messageId/data espera cada uno. No inventar strings frágiles.>

## Fuera de alcance

<Lo que NO se toca, y por qué. Follow-ups conocidos.>

## Gates (todos verdes)

​```bash
<comandos literales, con Node/PATH>
​```

## PR

<Rama, título, `Refs`/`Closes`, si sale draft.>
```

## Variantes

- **Regla nueva:** usa todas las secciones. No olvides Registro/activación (import, `src/shared/rules.ts`, preset en `src/nest/…` o el que aplique), la ficha en `docs/reglas/`, la fila en `README.md` y el conteo de fichas.
- **Modificar una regla existente:** enfoca el brief en el *delta*. Di explícitamente qué se conserva intacto y qué cambia, y recuerda que los tests existentes deben seguir verdes (no regresión).
- **Cambio en otro repo/paquete** (p. ej. un paquete de decoradores): el agente trabaja en ESE repo; dile que siga su `AGENTS.md` y su estructura, y ancla el brief en hechos verificables (exports publicados, API), no en la estructura interna que no puedes ver.

## Checklist antes de despachar

- [ ] ¿Un agente sin contexto podría ejecutarlo de principio a fin? (autocontenido)
- [ ] ¿Están las rutas de archivos y las utilidades a reusar, por nombre?
- [ ] ¿El mensaje de error enseña el fix? (si es regla)
- [ ] ¿Hay spike para lo incierto, con fallback?
- [ ] ¿Los gates son comandos literales que deben quedar verdes?
- [ ] ¿Está declarado lo que queda fuera de alcance?
- [ ] ¿Los tests cubren los "parece violación pero debe pasar"?

---

[Índice de reglas](./reglas/README.md) | [Propuesta de regla (issue template)](../.github/ISSUE_TEMPLATE/rule-proposal.md) | [README principal](../README.md)
