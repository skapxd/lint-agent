### `skapxd/no-default-export`

Prohíbe `export default` (incluida la forma `export { x as default }`). Con
exports nombrados, el nombre del símbolo es el contrato del módulo: renombrar
con el IDE actualiza todos los usos, `grep` encuentra definición y consumo, y
los autoimports no inventan nombres distintos por archivo.

```ts
export default function getUser() {}   // ❌ cada import puede llamarlo distinto
export function getUser() {}            // ✅ un solo nombre canónico
```

**Dónde sí se permite el default.** Hay entrypoints donde el ecosistema lo
exige, y la regla los reconoce en capas:

1. **Integrados (siempre activos):** configs de tooling (`*.config.{js,mjs,cjs,ts}`:
   `next.config`, `tailwind.config`, `vitest.config`, `eslint.config`, ...) y
   stories de Storybook (`*.stories.*`).
2. **Preset `next` (automático):** los entrypoints del App Router donde Next
   exige el default — `page`, `layout`, `template`, `error`, `loading`,
   `not-found`, `sitemap`, `robots`, `manifest`, `icon`, `opengraph-image`,
   etc. No hay que configurar nada.
3. **`allowFilePatterns` (extensible):** si usas un framework o tool que la
   regla aún no contempla, agrega su glob. Los patrones propios se **suman**
   a los integrados, no los reemplazan. Son globs legibles (`*` un segmento,
   `**` cualquier profundidad, `{a,b}` alternativas) y un patrón sin prefijo
   matchea en cualquier carpeta:

```js
"skapxd/no-default-export": ["error", {
  // p. ej. SvelteKit exige default en +page.ts / +layout.ts
  allowFilePatterns: ["+page.ts", "+layout.ts"],
}]
```

Detalle útil con `React.lazy` (que espera `{ default }`): no hace falta volver
al default export, basta mapear el named en el import dinámico:

```ts
const Card = lazy(() => import("./card").then((m) => ({ default: m.Card })));
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
