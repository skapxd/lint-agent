### `skapxd/one-root-function-per-file`

Limita cada archivo a una sola función declarada en la raíz.

Cuando detecta varias funciones, sugiere una estructura con formato tipo
`tree`. Por ejemplo:

```text
payment-gateway.ts
```

puede convertirse en:

```text
payment-gateway/
├── index.ts
└── get-ai-minute-packages.ts
```

En archivos de convención de Next.js (`route.ts`, `page.tsx`, `layout.tsx`,
etc.) no sugiere estructuras inválidas. Mantiene el entrypoint requerido y
sugiere helpers al lado.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
