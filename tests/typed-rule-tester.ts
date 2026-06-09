import path from "node:path";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

/**
 * RuleTester con información de tipos para la regla type-aware
 * `result-error-requires-cause`. Usa `projectService` sobre el tsconfig de
 * `tests/fixtures`, desde donde la resolución de módulos encuentra el
 * `@skapxd/result` real instalado en node_modules (requisito de
 * `isSkapxdResultSourceFile`, que solo matchea rutas dentro de node_modules).
 */
export function createTypedRuleTester() {
  return new RuleTester({
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.ts*"],
        },
        tsconfigRootDir: path.join(import.meta.dirname, "fixtures"),
      },
    },
  });
}
