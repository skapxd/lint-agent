### `skapxd/no-emoji`

Prohíbe emojis en strings, template literals y texto JSX. El problema no es estético: un emoji se renderiza con la fuente de emojis del **sistema del usuario** — Segoe UI Emoji en Windows, Apple Color Emoji en macOS, Noto en Android — así que el mismo carácter se ve distinto en cada plataforma, y en un Linux sin fuente de emojis directamente no se renderiza (sale el cuadro vacío □). Un SVG se ve idéntico en todas partes.

```tsx
<button>Enviar 🚀</button>                 // ❌ depende de la fuente del sistema
<button>Enviar <Rocket /></button>         // ✅ lucide-react: idéntico en todas partes
```

Detecta por propiedad Unicode (`Extended_Pictographic`), así que los símbolos tipográficos normales no se tocan: `→`, `✓`, `©`, `·` pasan sin problema.

No revisa comentarios: un emoji en un comentario no llega al navegador. Para eximir archivos completos (fixtures, seeds), usa `allowFilePatterns`:

```js
"skapxd/no-emoji": ["error", {
  allowFilePatterns: ["tests/fixtures/**"],
}]
```

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
