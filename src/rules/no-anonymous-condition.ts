import type { TSESTree } from "@typescript-eslint/utils";
import { callHasTypePredicate } from "#/utils/type-aware/call-has-type-predicate";
import { getMemberChainDepth } from "#/utils/ast/get-member-chain-depth";
import { getNoAnonymousConditionOptions } from "#/utils/options/get-no-anonymous-condition-options";
import { isLiteralGuardComparison } from "#/utils/ast/is-literal-guard-comparison";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { isParserServicesWithTypeInformation } from "#/utils/type-aware/is-parser-services-with-type-information";
import { unwrapNegations } from "#/utils/ast/unwrap-negations";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

// La hermana de no-else: esa nombra los CAMINOS, esta nombra la PREGUNTA.
// Un if cuya condicion es un computo (llamada, comparacion, combinacion
// logica, aritmetica) evalua un valor anonimo cuyo significado vive solo en
// la cabeza de quien lo escribio. Lo ya-nombrado no se toca: variables,
// accesos a propiedad acotados, sus negaciones, comparaciones con literal
// booleano (el idioma de Result incluido) y type guards demostrados por la
// firma (`x is T`) — evidencia, no convencion de nombre.
export const noAnonymousCondition: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "La condicion sin nombre: el if solo acepta condiciones ya nombradas (variables, accesos acotados, type guards demostrados); todo computo se extrae a una const con nombre semantico.",
    },
    messages: {
      anonymousCondition:
        "La condicion sin nombre: este if evalua un computo cuyo significado el lector debe deducir. Extraelo a una const con nombre que diga QUE DECIDE el if, no que compara el codigo: `const esArchivoExento = matchesAnyGlob(archivo, patrones); if (esArchivoExento) ...`. El nombre lleva `is/has/needs/lacks/exceeds/reached` + el concepto del dominio (`reachedProjectRoot`, `exceedsStateBudget`), no un sufijo mecanico que cumpla la regla sin informar. La extraccion conserva el narrowing (TS 4.4+). Lo ya-nombrado no se extrae: variables, accesos acotados (hasta {{maxMemberDepth}} saltos) y sus negaciones, comparaciones con literal booleano o nullish, y type guards que la firma demuestra (`x is T`). Catalogo de anti-nombres y excepciones en la ficha de la regla.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowTypePredicates: {
            type: "boolean",
          },
          maxMemberDepth: {
            type: "number",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNoAnonymousConditionOptions(
      context.options[0] as Parameters<
        typeof getNoAnonymousConditionOptions
      >[0],
    );
    const filename = context.filename ?? context.getFilename();
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    return {
      IfStatement(node: TSESTree.IfStatement) {
        const condition = unwrapNegations(node.test);

        // Un literal constante es territorio de no-impossible-branch.
        const isLiteralNode = condition.type === "Literal";
        if (isLiteralNode) {
          return;
        }

        const depth = getMemberChainDepth(condition);

        const isAllowedMemberGuard = depth !== null && depth <= options.maxMemberDepth;
        if (isAllowedMemberGuard) {
          return;
        }

        const isAllowedLiteralGuardComparison = isLiteralGuardComparison(condition, options.maxMemberDepth);
        if (isAllowedLiteralGuardComparison) {
          return;
        }

        const isProvenTypeGuard =
          condition.type === "CallExpression" &&
          options.allowTypePredicates &&
          isParserServicesWithTypeInformation(sourceCode.parserServices) &&
          callHasTypePredicate(
            condition,
            sourceCode.parserServices,
          );

        if (isProvenTypeGuard) {
          return;
        }

        context.report({
          data: { maxMemberDepth: String(options.maxMemberDepth) },
          messageId: "anonymousCondition",
          node: node.test,
        });
      },
    };
  },
};
