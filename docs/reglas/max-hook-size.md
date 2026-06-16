### `skapxd/max-hook-size`

Marca hooks que crecen demasiado o acumulan muchos `useState`.

La intención no es contar líneas por deporte: un hook grande suele esconder flujos mezclados, y varios `useState` suelen esconder estado sin modelo explícito.

Cuando el exceso viene de varios `useState`, la salida depende de la relación entre esos estados:

- Estados relacionados porque representan fases de una misma cosa (`idle | loading | success | error`) → colapsarlos en un único estado con unión discriminada. Es la salida preferida porque hace irrepresentables combinaciones como `isLoading + error + value` activos al mismo tiempo.
- Estados relacionados porque cambian juntos mediante transiciones explícitas → moverlos a `useReducer` con acciones de unión discriminada, para que cada transición quede nombrada y atómica.
- Estados independientes entre sí → dividir el componente o hook. Si no forman una máquina común, juntarlos en un reducer sería teatro: el problema es que la unidad hace demasiado.

Las reglas hermanas [`skapxd/prefer-tagged-union-state`](./prefer-tagged-union-state.md) y [`skapxd/no-runtime-state-guard`](./no-runtime-state-guard.md) materializan la primera salida: el estado inválido debe quedar fuera del tipo, no vigilado en runtime ni repartido entre flags.

Opciones (los presets `frontend` y `next` usan `maxLines: 120`, `maxUseState: 1`):

```js
"skapxd/max-hook-size": ["error", {
  maxLines: 120,   // líneas máximas del cuerpo del hook
  maxUseState: 1,  // useState propios permitidos antes de exigir useReducer
}]
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
