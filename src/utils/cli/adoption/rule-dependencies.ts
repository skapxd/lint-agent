export type RuleDependencyMap = Readonly<Record<string, readonly string[]>>;

// Grafo de dependencias duras entre reglas (premisa -> dependiente).
// Fuente: docs/analisis/dependencias-entre-reglas.md (spike #104).
// Clave = regla dependiente; valor = ids de sus premisas duras.
export const RULE_DEPENDENCIES: RuleDependencyMap = {
  "skapxd/filename-matches-root-function": [
    // docs/reglas/filename-matches-root-function.md:7: one-root-unit-per-file deja una unica unidad raiz y, por tanto, una unica funcion candidata.
    "skapxd/one-root-unit-per-file",
    // docs/reglas/filename-matches-root-function.md:7: no-default-export hace que el nombre publico sea el named export.
    "skapxd/no-default-export",
  ],
  // docs/reglas/no-impossible-branch.md:10: primero el tsconfig dice la verdad, despues esta regla opina.
  "skapxd/no-impossible-branch": ["skapxd/requires-strict-tsconfig"],
  // docs/reglas/untrusted-module-requires-adapter.md:7: armadura de tsconfig primero.
  "skapxd/untrusted-module-requires-adapter": [
    "skapxd/requires-strict-tsconfig",
  ],
  // docs/reglas/no-ad-hoc-ok-result.md:3: la exencion type-aware de await-requires-result no reconoce el Result.ok ad hoc.
  "skapxd/await-requires-result": ["skapxd/no-ad-hoc-ok-result"],
  // docs/reglas/prefer-schema-validation.md:31: esta regla viene despues de mantener externo como unknown hasta validarlo.
  "skapxd/prefer-schema-validation": ["skapxd/no-unverified-cast"],
  // docs/reglas/nest-requires-swagger-plugin.md:14: sin plugin el swagger queda vacio y no se documenta a mano en controllers.
  "skapxd/nest-no-swagger-in-controllers": [
    "skapxd/nest-requires-swagger-plugin",
  ],
  // docs/reglas/nest-requires-swagger-plugin.md:3: las reglas swagger del preset descansan en el plugin.
  "skapxd/nest-dto-requires-api-property": [
    "skapxd/nest-requires-swagger-plugin",
  ],
  // src/nest/create-nest-configs.ts:59-62: ValidationPipe con transform + whitelist es premisa de DTOs.
  "skapxd/nest-dto-requires-validation": [
    "skapxd/nest-validation-pipe-config",
  ],
};
