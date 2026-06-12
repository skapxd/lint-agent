import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const untrustedXlsx = {
  adapterFilePatterns: ["src/lib/xlsx-adapter.ts"],
  modules: ["xlsx"],
};

createRuleTester().run(
  "untrusted-module-requires-adapter",
  rules["untrusted-module-requires-adapter"]!,
  {
    invalid: [
      {
        // Importar el modulo sospechoso fuera del adaptador: la mentira de
        // sus tipos se riega por el proyecto.
        code: 'import * as XLSX from "xlsx";',
        errors: [{ messageId: "untrustedImport" }],
        filename: "src/lib/grid/build-sheet-grid.ts",
        options: [untrustedXlsx],
      },
      {
        // Los subpaths del modulo tambien cuentan.
        code: 'import { utils } from "xlsx/lite";',
        errors: [{ messageId: "untrustedImport" }],
        filename: "src/hooks/use-upload.ts",
        options: [untrustedXlsx],
      },
    ],
    valid: [
      // El adaptador es el unico lugar donde la mentira se mira de frente.
      {
        code: 'import * as XLSX from "xlsx";',
        filename: "src/lib/xlsx-adapter.ts",
        options: [untrustedXlsx],
      },
      // Sin inventario de sospechosos, la regla es inerte.
      {
        code: 'import * as XLSX from "xlsx";',
        filename: "src/lib/grid/build-sheet-grid.ts",
      },
      // Un modulo con prefijo parecido NO es el modulo (xlsx-utils ≠ xlsx).
      {
        code: 'import { helper } from "xlsx-utils";',
        filename: "src/lib/grid/build-sheet-grid.ts",
        options: [untrustedXlsx],
      },
    ],
  },
);
