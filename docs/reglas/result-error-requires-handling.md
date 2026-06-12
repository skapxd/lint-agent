### `skapxd/result-error-requires-handling`

La hermana de la anterior cierra la última puerta de evasión: el **descarte
silencioso**. Detectar el fallo y botarlo sin tocarlo es legal para
`result-error-requires-cause` (no hay transformación que vigilar), pero deja
morir información valiosa sin que nadie lo decidiera conscientemente:

```ts
const result = await copyTextToClipboard(text);
if (!result.ok) return;            // ❌ el error muere aquí, en silencio
```

El contrato: dentro de un guard de Result fallido, `result.error` (o el
result completo) debe **fluir a alguna parte**. Dos salidas:

```ts
// 1. Transformarlo (y result-error-requires-cause vigila el cause)
if (!result.ok) {
  return Result.err({ cause: result.error, message: "...", type: "COPY_FAILED" });
}

// 2. Entregárselo a alguien: telemetría, estado de error, log de dominio
if (!result.ok) {
  trackClipboardFailure(result.error);
  return;
}

// (propagar el result completo también vale: `if (!result.ok) return result;`)
```

**No hay tercera salida.** `void result.error` no cuenta como manejo, y
manejar sin tocar el error (`setFailed(true)`) tampoco — el detalle se perdió
igual. Esto es deliberado: si darle seguimiento a un error es crítico o no,
no puede depender de la interpretación de quien escribe; el camino por
defecto nunca es ignorarlo.

**El alias tampoco es escape.** Asignar no es consumir: la regla sigue los
alias (y los encadenados, y el destructuring) hasta verificar que alguno se
consume de verdad:

```ts
if (!result.ok) {
  const e = result.error;   // ❌ transferencia sin destino: se reporta
  return;
}

if (!result.ok) {
  const cause = result.error;
  return Result.err({ cause, message: "..." });  // ✅ el alias se consumió
}
```

**Proyectar no es manejar** (desde v0.13.0). Leer `result.error.message` para
la UI está bien — pero si eso es lo ÚNICO que sale del guard, el `cause` murió
en la última milla: diste feedback de que ocurrió un error sin que el *porqué*
llegara a ninguna parte. El error debe fluir **completo** (el objeto entero,
con su cadena de causas adentro):

```ts
if (!result.ok) {
  setFeedback(result.error.message);    // ❌ solo la proyección: el cause se pierde
  return;
}

if (!result.ok) {
  reportDomainError(result.error);      // ✅ el objeto entero → al trace
  setFeedback(result.error.message);    //    y la proyección para la UI, ahora sí
  return;
}
```

Lo mismo vía alias (`const e = result.error; setFeedback(e.message)` no
basta) y vía result (`console.log(result.ok)` no es manejo). Las formas que
mantienen la información completa: `result.error` entero como argumento /
retorno / propiedad, el result completo (`return result`), o la
transformación con `cause`.

Type-aware como su hermana: solo aplica a Results reales de `@skapxd/result`,
con las mismas cinco formas de guard.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
