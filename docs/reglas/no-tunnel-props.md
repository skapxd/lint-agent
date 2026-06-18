### `skapxd/no-tunnel-props`

**Ninguna prop viaja más de un nivel.** El contrato de saltos: quien **crea** un valor (estado de un hook, acción de un store, dato calculado) puede pasarlo a UN hijo; quien lo **recibe** como prop no puede reenviarlo a otro componente. Eso prohíbe exactamente la cadena `abuelo → padre → hijo` — el prop drilling — sin tocar el paso legítimo de un nivel.

```tsx
// ✅ primer salto: el abuelo CREA la acción y la baja un nivel
const Abuelo = () => {
  const onSelect = useTranscriptStore((s) => s.select);
  return <Padre onSelect={onSelect} />;
};

// ❌ segundo salto: el padre la RECIBE y la reenvía
const Padre = ({ onSelect }) => <Hijo onSelect={onSelect} />;

// ❌ el rename no lo esconde, y usarla localmente no autoriza el reenvío
const Padre = ({ onSelect }) => <Hijo handler={onSelect} />;

// ❌ el túnel puro
const Padre = ({ ...props }) => <Hijo {...props} />;
```

La detección es local y exacta: si el identifier que pones en una prop de otro componente viene de tus **props destructuradas**, no lo creaste tú — es su segundo salto.

Las salidas que sugiere el mensaje — **el criterio para elegir**: si lo que viaja es **estado o una acción compartida**, sácalo a un store/hook (salida 1); si el padre **solo compone UI**, deja que arme el JSX y baje `children` (salida 2).

1. **Store global o custom hook**: la acción/estado vive en un store (p. ej. [zustand](https://github.com/pmndrs/zustand)) o un hook, y el componente que la necesita la consume directo — la cadena desaparece:

   ```tsx function Hijo({ entry }: { entry: Entry }) { const select = useTranscriptStore((s) => s.select); return <button onClick={() => select(entry.id)}>…</button>; } ```

2. **Composición**: el padre arma el JSX y el intermedio recibe `children` — el dato viaja dentro del JSX, no por props. (`children` nunca cuenta como túnel: es la alternativa.)

No cuenta como reenvío: usar la prop (`<h2>{title}</h2>`), derivar datos (`title={game.title}`), o pasarla a un elemento **nativo** (`value={value}` en un `<input>` es la frontera con el DOM). Para wrappers legítimos de un design system, exime props por nombre (`allowPropPatterns: ["^className$"]`) o archivos completos (`allowFilePatterns`).

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
