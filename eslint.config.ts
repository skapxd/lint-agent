// Se importa el plugin ya construido (bundleado, sin alias `#/`): jiti —el cargador
// de config de ESLint— usa el resolver nativo de Node, que rechaza los specifiers
// `#/`. Por eso el script `lint` ejecuta `tsup` antes. Bonus: el dogfood corre
// sobre el artefacto real que reciben los consumidores.
import skapxd from "./dist/index.mjs";

// Dogfooding: el plugin se aplica su propio preset backend COMPLETO — con type
// info (projectService) y el set type-driven incluido. Las reglas transversales
// que les vendemos a los consumidores nos juzgan a nosotros primero.
export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: skapxd.configs.shared.backend.languageOptions,
    plugins: {
      skapxd,
    },
    rules: {
      ...skapxd.configs.shared.backend.rules,
      // Dogfood de la opción extensible: el entrypoint del plugin exige
      // `export default` por convención de plugins de ESLint.
      "skapxd/no-default-export": [
        "error",
        { allowFilePatterns: ["src/index.ts"] },
      ],
      // ─── Lista de pendientes (solo encoge; ver "Adopción en proyectos
      // legacy" en el README) ─────────────────────────────────────────────
      // 187 archivos heredan `// @ts-nocheck` de antes de que existiera la
      // regla: quitarlos exige tipar los utils contra TSESTree (tarea
      // aparte). El código nuevo ya nace sin el pragma.
      "skapxd/no-silenced-compiler": "off",
    },
  },
];
