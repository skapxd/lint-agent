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
      // Pendiente #37: fronteras de ensamblado del plugin
      // contra tipos publicos incompletos de ESLint/typescript-eslint.
      "skapxd/no-unverified-cast": "off",
    },
  },
];
