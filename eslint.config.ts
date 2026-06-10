import tseslint from "typescript-eslint";
// Se importa el plugin ya construido (bundleado, sin alias `#/`): jiti —el cargador
// de config de ESLint— usa el resolver nativo de Node, que rechaza los specifiers
// `#/`. Por eso el script `lint` ejecuta `tsup` antes. Bonus: el dogfood corre
// sobre el artefacto real que reciben los consumidores.
import skapxd from "./dist/index.mjs";

// Dogfooding: el plugin se aplica sus propias reglas sobre su código fuente.
// Mantiene viva la filosofía one-root-function-per-file y evita que un archivo
// como el viejo rules.ts (1367 líneas) vuelva a aparecer.
export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      skapxd,
    },
    rules: {
      ...skapxd.configs.shared.base.rules,
      // Dogfood de la opción extensible: el entrypoint del plugin exige
      // `export default` por convención de plugins de ESLint.
      "skapxd/no-default-export": [
        "error",
        { allowFilePatterns: ["[\\\\/]src[\\\\/]index\\.ts$"] },
      ],
    },
  },
];
