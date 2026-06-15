### `skapxd/prefer-abort-signal`

Dentro de un `useEffect`/`useLayoutEffect`, los listeners se limpian con `AbortController`, no con `removeEventListener` manual:

```ts
// ❌ registro y limpieza espejados a mano
useEffect(() => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onSystemChange);
  return () => media.removeEventListener("change", onSystemChange);
}, [settings]);

// ✅ un AbortController por efecto
useEffect(() => {
  const controller = new AbortController();
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onSystemChange, { signal: controller.signal });
  return () => controller.abort();
}, [settings]);
```

Por qué: un solo `abort()` limpia **todos** los listeners del efecto (no hay que espejar cada `add` con su `remove`), y elimina el bug clásico de pasar una referencia distinta a `removeEventListener` (un `.bind()` o una arrow nueva) que deja el listener vivo para siempre.

Reporta dos cosas dentro del callback del efecto (incluidas sus funciones anidadas y el cleanup): `addEventListener` sin `signal` en las options, y cualquier `removeEventListener`. Fuera de un efecto la regla no opina.

Cuando las options no son un objeto literal, la verificación resuelve en capas:

1. **Por scope**: `addEventListener("x", fn, opts)` sigue `opts` hasta su `const opts = {...}` y lo inspecciona — sin necesitar type-checking.
2. **Por tipo** (con `projectService`): si no hay inicializador visible (un parámetro, un import), pregunta al checker si el **tipo** declara `signal`; si ni el tipo la tiene, es imposible que llegue y se reporta.
3. Sin inicializador ni tipos: beneficio de la duda.

El boolean de capture (`addEventListener("x", fn, true)`) se reporta siempre: no puede traer `signal`.

`effectNames` permite cubrir wrappers propios (`["useEffect", "useLayoutEffect", "useIsomorphicEffect"]`).

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
