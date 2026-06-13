import { Linter, RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";
import type { RuleModule } from "#/utils/rule-authoring/rule-types";

// RuleTester busca `describe`/`it` globales; en vitest hay que inyectarlos.
// Los tipos de eslint no declaran estos estáticos, por eso el cast puntual.
const testFrameworkHooks = RuleTester as unknown as {
  afterAll: typeof afterAll;
  describe: typeof describe;
  it: typeof it;
  itOnly: typeof it.only;
};
testFrameworkHooks.afterAll = afterAll;
testFrameworkHooks.describe = describe;
testFrameworkHooks.it = it;
testFrameworkHooks.itOnly = it.only;

/**
 * RuleTester sintáctico: parser de typescript-eslint sin información de tipos.
 * Sirve para las 6 reglas que solo miran el AST. La regla type-aware
 * (`result-error-requires-cause`) necesita un harness aparte con `projectService`.
 */
export function createRuleTester() {
  const ruleTester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      parser: tseslint.parser as unknown as Linter.Parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      sourceType: "module",
    },
  });

  return {
    run(
      ruleName: string,
      rule: RuleModule,
      testCases: Parameters<RuleTester["run"]>[2],
    ) {
      ruleTester.run(
        ruleName,
        rule as unknown as Parameters<RuleTester["run"]>[1],
        testCases,
      );
    },
  };
}
