import type { TSESTree } from "@typescript-eslint/utils";
import {
  createCrossFileDuplicateReporter,
  type DuplicateSignatureOccurrence,
} from "#/utils/cross-file/create-cross-file-duplicate-reporter";
import { getRepeatedJsxRequiresComponentOptions } from "#/utils/options/get-repeated-jsx-requires-component-options";
import { getJsxDuplicateSignatures } from "#/utils/react/get-jsx-duplicate-signatures";
import { isJsxInsideIterationCallback } from "#/utils/react/is-jsx-inside-iteration-callback";
import type {
  RuleContext,
  RuleModule,
} from "#/utils/rule-authoring/rule-types";

export const repeatedJsxRequiresComponent: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Detecta patrones JSX repetidos que ya son un componente sin nombre.",
    },
    messages: {
      repeatedJsx:
        "Este bloque JSX (misma estructura y clases) aparece {{count}} veces: es un componente sin nombre. A la tercera repeticion se aisla (regla de tres). Extrae la forma comun a un componente y pasa lo que cambia como props. La iteracion con `.map` no cuenta.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          minClasses: { minimum: 1, type: "number" },
          minPatternNodes: { minimum: 1, type: "number" },
          minRepetitions: { minimum: 2, type: "number" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getRepeatedJsxRequiresComponentOptions(context.options[0]);
    const sourceCodeCandidate = context.sourceCode ?? context.getSourceCode();
    const getText = sourceCodeCandidate.getText;
    const lacksTextSourceCode = !getText;
    if (lacksTextSourceCode) {
      return {};
    }

    const sourceCode = {
      ...sourceCodeCandidate,
      getText,
    };
    const occurrences: DuplicateSignatureOccurrence[] = [];
    const reporter = createCrossFileDuplicateReporter({
      context,
      getOccurrences: () => occurrences,
      messageId: "repeatedJsx",
      minRepetitions: options.minRepetitions,
      namespace: "repeated-jsx-requires-component",
    });

    function collectJsxSignatures(
      node: TSESTree.JSXElement | TSESTree.JSXFragment,
    ) {
      const isInsideIteration = isJsxInsideIterationCallback(node);
      if (isInsideIteration) {
        return;
      }

      occurrences.push(
        ...getJsxDuplicateSignatures(node, sourceCode, {
          minClasses: options.minClasses,
          minPatternNodes: options.minPatternNodes,
        }),
      );
    }

    return {
      "Program:exit"() {
        reporter.collectAndReport();
      },
      JSXElement(node: TSESTree.JSXElement) {
        collectJsxSignatures(node);
      },
      JSXFragment(node: TSESTree.JSXFragment) {
        collectJsxSignatures(node);
      },
    };
  },
};
