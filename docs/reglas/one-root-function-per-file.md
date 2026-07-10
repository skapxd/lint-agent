### `skapxd/one-root-function-per-file`

Limita cada archivo a una sola función declarada en la raíz.

Permanece disponible para configuraciones explícitas, pero ya no está activa en los presets: `one-root-unit-per-file` la sustituye en `shared/base-rules` y amplía el contrato a clases sin dejar diagnósticos duplicados.

Cuando detecta varias funciones, sugiere una estructura con formato tipo `tree`. Por ejemplo:

```ts
export function chargeCard() {}
export function refundCard() {} // ❌ dos funciones raiz en un archivo
```

La salida legal deja un solo contrato top-level por archivo:

```ts
export function chargeCard() {} // ✅ una funcion raiz
```

Cuando el archivo original se llama:

```text
payment-gateway.ts
```

puede convertirse en:

```text
payment-gateway/
├── index.ts
└── get-ai-minute-packages.ts
```

En archivos de convención de Next.js (`route.ts`, `page.tsx`, `layout.tsx`, etc.) no sugiere estructuras inválidas. Mantiene el entrypoint requerido y sugiere helpers al lado.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
