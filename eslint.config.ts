// Se importa el plugin ya construido (bundleado, sin alias `#/`): jiti —el cargador
// de config de ESLint— usa el resolver nativo de Node, que rechaza los specifiers
// `#/`. Por eso el script `lint` ejecuta `tsup` antes. Bonus: el dogfood corre
// sobre el artefacto real que reciben los consumidores.
import skapxd from "./dist/index.mjs";

// Dogfooding: el plugin es una libreria npm hecha con tsup, asi que se aplica
// su propio preset `package` COMPLETO — con type info (projectService), el set
// type-driven y el contrato de empaquetado (package-requires-typed-exports).
// Las reglas que les vendemos a los consumidores nos juzgan a nosotros primero.
export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: skapxd.configs.shared.package.languageOptions,
    plugins: {
      skapxd,
    },
    rules: {
      ...skapxd.configs.shared.package.rules,
      // Dogfood de la opción extensible: el entrypoint del plugin exige
      // `export default` por convención de plugins de ESLint.
      "skapxd/no-default-export": [
        "error",
        { allowFilePatterns: ["src/index.ts"] },
      ],
      // ─── Lista de pendientes (solo encoge; ver "Adopción en proyectos
      // legacy" en el README) ─────────────────────────────────────────────
      // 245 condiciones anónimas heredadas de antes de que la regla entrara
      // a las bases: cada extracción necesita un nombre con criterio, no
      // autogenerado (issue #8).
      "skapxd/no-anonymous-condition": "off",
      // `RuleNode` (la frontera de tipos de la fase 1 del issue #4) declara
      // todas las propiedades del AST como presentes: miente a propósito
      // para que 190 archivos compilen sin casts. Esta regla le cree al
      // tipo, así que acusaría guards necesarios. Se reactiva por lotes al
      // migrar a nodos TSESTree honestos (issue #10).
      "skapxd/no-impossible-branch": "off",
    },
  },
  {
    files: ["src/utils/rule-types.ts"],
    rules: {
      // Archivo de frontera de tipos + helpers de lectura de opciones.
      "skapxd/one-root-function-per-file": "off",
    },
  },
];
