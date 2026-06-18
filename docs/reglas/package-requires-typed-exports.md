### `skapxd/package-requires-typed-exports`

El contrato de empaquetado de una librería TypeScript dual (ESM + CJS): cada condición del mapa `exports` declara **sus propios tipos**, del sabor correcto.

```jsonc
"exports": {
  ".": {
    "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
    "require": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
  }
}
```

El antipatrón que mata es el **"FalseCJS"** (el hallazgo #1 de [arethetypeswrong](https://arethetypeswrong.github.io)): un `types` único por subpath apuntando al `.d.ts` — los consumidores ESM con `moduleResolution: node16` reciben tipos CJS y el contrato miente en la frontera más pública que tiene una librería. tsup con `dts: true` ya genera los dos sabores (`.d.mts` y `.d.ts`); esta regla verifica que el package.json de verdad los cablee y que los archivos existan en disco. Anclada al entrypoint (`src/index.ts` por defecto): un reporte por paquete.

Si la regla **no encuentra un `package.json` legible** subiendo desde el archivo, la acción es ejecutar desde el paquete correcto, crear el `package.json`, o corregir el JSON ilegible antes de validar los `exports`.

Dogfood: esta regla nació reportando a este mismo repo — nuestros `exports` tenían el bug y el lint no volvió a verde hasta corregirlos.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
