### `skapxd/repeated-jsx-requires-component`

Detecta patrones de UI repetidos que ya dejaron de ser markup local y pasaron a ser una unidad sin nombre. Axioma A4: si la misma forma aparece por tercera vez, merece un componente con contrato propio.

```tsx
<div className="rounded-lg border p-4 shadow-sm">
  <h3 className="text-lg font-bold">{a.title}</h3>
</div>
<div className="border shadow-sm rounded-lg p-4">
  <h3 className="font-bold text-lg">{b.title}</h3>
</div>
<div className="shadow-sm p-4 border rounded-lg">
  <h3 className="text-lg font-bold">{c.title}</h3>
</div>
```

La regla compara dos firmas:

| Firma | Que compara | Caso |
| --- | --- | --- |
| Receta de clases | El conjunto normalizado de `className`; el orden no importa. | Un Card visual escrito con tags distintos. |
| Sub-arbol JSX | Jerarquia de tags + clases normalizadas por nodo. | El mismo bloque copiado con datos distintos. |

La repeticion es el disparador: `minRepetitions` default `3`. La densidad solo filtra ruido: `minClasses` default `4` para recetas de clase y `minPatternNodes` default `2` para sub-arboles. Un `<span className="mt-2" />` repetido tres veces sigue siendo trivial.

`className` se lee sin type-aware y sin lista de helpers. Dentro del atributo, la regla recorre la expresion y extrae todos los literales de string que existan en llamadas, ternarios, logicos, arrays, objetos y templates. Lo runtime queda como dinamico; la forma de la expresion entra en la firma, asi que un ternario y un string plano con las mismas clases no matchean.

El JSX producido por callbacks de iteracion (`.map`/`.forEach`) no cuenta: eso ya es repeticion por datos, no copy-paste estructural.

La deteccion cross-file usa un indice global en memoria. Dentro del runner por archivo de ESLint sigue siendo best-effort: el conteo global existe, pero las ubicaciones cross-file pueden concentrarse en el archivo que cruza el umbral porque ESLint no reabre resultados ya emitidos. El reporte cross-file exacto queda para el runner de dos pasadas (#53); mientras tanto, lo que los presets activan con seguridad es la señal intra-archivo y el conteo cross-file latente. `--cache` es incompatible: el resultado de un archivo depende de los otros archivos lintados en el mismo proceso.

Opciones:

```js
rules: {
  "skapxd/repeated-jsx-requires-component": [
    "error",
    {
      minClasses: 4,
      minPatternNodes: 2,
      minRepetitions: 3,
    },
  ],
}
```

**Presets.** Activa como `error` en `frontend`, `next/react` y `astro/react` con los defaults actuales (`minPatternNodes: 2`, `minClasses: 4`, `minRepetitions: 3`). No se pasa configuración en los presets: usan los defaults de la regla.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
