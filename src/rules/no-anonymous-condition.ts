import { callHasTypePredicate } from "#/utils/call-has-type-predicate";
import { getMemberChainDepth } from "#/utils/get-member-chain-depth";
import { getNoAnonymousConditionOptions } from "#/utils/get-no-anonymous-condition-options";
import { isLiteralGuardComparison } from "#/utils/is-literal-guard-comparison";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import { unwrapNegations } from "#/utils/unwrap-negations";
import type { RuleModule } from "#/utils/rule-types";

type ConditionNode = {
  type: string;
  value?: unknown;
  [key: string]: unknown;
};

type IfStatementNode = {
  test: ConditionNode;
};

type RuleContext = {
  filename?: string;
  getFilename?: () => string;
  options: unknown[];
  report: (descriptor: {
    data?: Record<string, string>;
    messageId: string;
    node: unknown;
  }) => void;
  sourceCode?: {
    parserServices?: unknown;
  };
};

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
        "La condicion sin nombre: este if evalua un computo cuyo significado el lector debe deducir. Extraelo a una const con nombre semantico y la decision se lee como prosa: `const esArchivoExento = matchesAnyGlob(archivo, patrones); if (esArchivoExento) ...`. La extraccion directa a const conserva el narrowing (TS 4.4+). Lo ya-nombrado no se extrae: variables (`isReady`), accesos como `result.ok` (hasta {{maxMemberDepth}} saltos), sus negaciones (`!result.ok`), comparaciones con literal booleano o nullish (`x.ok === false`, `x == null`) y type guards que la firma demuestra (`x is T`).",
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
    const filename = context.filename ?? context.getFilename?.() ?? "";

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    return {
      IfStatement(node: IfStatementNode) {
        const condition = unwrapNegations(node.test) as ConditionNode;

        // Un literal constante es territorio de no-impossible-branch.
        if (condition.type === "Literal") {
          return;
        }

        const depth = getMemberChainDepth(condition);

        if (depth !== null && depth <= options.maxMemberDepth) {
          return;
        }

        if (isLiteralGuardComparison(condition, options.maxMemberDepth)) {
          return;
        }

        const isProvenTypeGuard =
          condition.type === "CallExpression" &&
          options.allowTypePredicates &&
          callHasTypePredicate(
            condition,
            context.sourceCode?.parserServices as Parameters<
              typeof callHasTypePredicate
            >[1],
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
