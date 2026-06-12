### `skapxd/max-hook-size`

Marca hooks que crecen demasiado o acumulan muchos `useState`.

La intención es empujar el diseño hacia `useReducer`, hooks más pequeños o
módulos de transición de estado.

Opciones (los presets `frontend` y `next` usan `maxLines: 120`, `maxUseState: 1`):

```js
"skapxd/max-hook-size": ["error", {
  maxLines: 120,   // líneas máximas del cuerpo del hook
  maxUseState: 1,  // useState propios permitidos antes de exigir useReducer
}]
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
