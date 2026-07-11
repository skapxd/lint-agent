### `skapxd/nest-layer-import-direction`

Impide que una capa interna de un módulo Nest dependa de transporte o adaptadores concretos. `nest-module-layer-folders` hace visible el layout; esta regla convierte la dirección de sus imports en un contrato ejecutable. Deriva de A7 porque una frontera desaparece cuando el núcleo importa detalles externos, y aplica A6 resolviendo paths reales en vez de inferir arquitectura por nombres como `Repository`, `Adapter` o `Service`.

```ts
// src/modules/orders/domain/order.ts
import { TursoOrderRepository } from "../infrastructure/turso/turso-order-repository"; // ❌
```

La dependencia se invierte declarando el puerto en la capa interna que lo necesita, implementándolo en infraestructura y componiendo el adaptador concreto desde `orders.module.ts`.

## Matriz por defecto

| Origen | Targets permitidos |
| --- | --- |
| `domain` | `domain` |
| `application` | `application`, `domain` |
| `http` | `http`, `application` |
| `infrastructure` | `infrastructure`, `application`, `domain`, `contracts` |
| `contracts` | `contracts` |

`contracts` contiene contratos externos no HTTP; no es el cajón de puertos internos. Los puertos que necesita un caso de uso pertenecen a `application` o `domain`. La matriz también se aplica entre módulos distintos.

`<modulo>.module.ts` es composition root y puede importar todas las capas. El `index.ts` público solo puede reexportar `application`, `domain` y `contracts`; no expone transporte ni adaptadores concretos. Un import hacia el `index.ts` público de otro módulo se acepta sin seguir sus reexports transitivos en V1.

La regla evalúa imports estáticos, `import type`, reexports con source e `import()` con string literal. Resuelve relativos y aliases configurados, extensiones omitidas y directorios con `index.*`. Los paquetes externos, los aliases no configurados, `require()`, imports dinámicos no literales y targets fuera de `modulesRoot` quedan fuera de V1.

Los imports locales reconocidos son fail-closed: si un relativo o alias configurado apunta dentro de `modulesRoot` pero no resuelve a un archivo real, la regla reporta `unresolvedInternalImport`. Un path roto no puede evadir la matriz.

Opciones:

```js
"skapxd/nest-layer-import-direction": [
  "error",
  {
    modulesRoot: "src/modules",
    sourceRoot: "src",
    aliasPrefixes: ["#/", "@/"],
    allowFilePatterns: ["**/*.fixture.ts"],
    allowedLayerImports: {
      domain: ["domain"],
      application: ["application", "domain"],
      http: ["http", "application"],
      infrastructure: ["infrastructure", "application", "domain", "contracts"],
      contracts: ["contracts"],
    },
    publicIndexAllowedLayers: ["application", "domain", "contracts"],
  },
],
```

Cada entrada declarada en `allowedLayerImports` reemplaza únicamente la política de esa capa; las capas no declaradas conservan el default. Los specs colocados (`**/*.spec.ts`, `**/*.test.ts`, `**/*.e2e-spec.ts`) siempre están permitidos y `allowFilePatterns` agrega exenciones del proyecto.

La regla está registrada como opt-in mientras #192 calibra la señal en proyectos reales; no está activa en `skapxd/nest/base`. No tiene autofix ni suggestions: invertir una dependencia puede exigir crear puertos, mover contratos y ajustar providers, y una reescritura parcial sería incorrecta.

---

[Indice de reglas](./README.md) | [README principal](../../README.md)
