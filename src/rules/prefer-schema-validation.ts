import type { TSESTree } from "@typescript-eslint/utils";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { getPreferSchemaValidationOptions } from "#/utils/options/get-prefer-schema-validation-options";
import type {
  RuleContext,
  RuleModule,
} from "#/utils/rule-authoring/rule-types";
import { getContainingFunction } from "#/utils/ast/get-containing-function";
import type { FunctionNode } from "#/utils/ast/is-function-node";
import { getStructuralCheckRoot } from "#/utils/schema-validation/get-structural-check-root";
import { getDeclaredSymbolType } from "#/utils/type-aware/get-declared-symbol-type";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isUnknownOrAnyType } from "#/utils/type-aware/is-unknown-or-any-type";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
import ts from "typescript";

type StructuralCheckBucket = {
  count: number;
  node: TSESTree.Identifier;
};

export const preferSchemaValidation: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefiere schemas declarativos sobre validadores artesanales con muchos checks estructurales sobre unknown/any.",
    },
    messages: {
      preferSchema:
        "Estas validando una forma compleja a mano: {{count}} comprobaciones estructurales sobre el mismo valor. Eso ES un schema — escrito rama por rama, sin errores con detalle y desincronizable del tipo que protege. Declaralo: zod/valibot (`const user = Schema.parse(data)` valida, estrecha el tipo con evidencia runtime y reporta QUE campo fallo) o, en Nest, class-validator en el DTO. Un type predicate corto y honesto sigue siendo legal: esta regla solo dispara cuando el guard se volvio formulario.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          maxStructuralChecks: {
            minimum: 1,
            type: "number",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getPreferSchemaValidationOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);
    const checksByFunction = new Map<
      FunctionNode,
      Map<ts.Symbol, StructuralCheckBucket>
    >();

    const isAllowedFilePattern = matchesAnyGlob(
      filename,
      options.allowFilePatterns,
    );
    const lacksTypeContext = !typeContext;
    const shouldSkipRule = isAllowedFilePattern || lacksTypeContext;
    if (shouldSkipRule) {
      return {};
    }

    const recordStructuralCheck = (node: TSESTree.Node): void => {
      const root = getStructuralCheckRoot(node);
      if (!root) {
        return;
      }

      const containingFunction = getContainingFunction(node);
      if (!containingFunction) {
        return;
      }

      const symbol = typeContext.services.getSymbolAtLocation(root);
      if (!symbol) {
        return;
      }

      const resolvedSymbol = resolveAliasSymbol(symbol, typeContext);
      const declaredType = getDeclaredSymbolType(
        resolvedSymbol,
        root,
        typeContext,
      );
      const hasUnknownRootType = isUnknownOrAnyType(declaredType);
      if (!hasUnknownRootType) {
        return;
      }

      const checksByRoot = checksByFunction.get(containingFunction) ??
        new Map<ts.Symbol, StructuralCheckBucket>();
      const bucket = checksByRoot.get(resolvedSymbol) ?? { count: 0, node: root };
      bucket.count += 1;
      checksByRoot.set(resolvedSymbol, bucket);
      checksByFunction.set(containingFunction, checksByRoot);
    };

    return {
      BinaryExpression(node: TSESTree.BinaryExpression) {
        recordStructuralCheck(node);
      },
      CallExpression(node: TSESTree.CallExpression) {
        recordStructuralCheck(node);
      },
      "Program:exit"() {
        for (const [functionNode, checksByRoot] of checksByFunction) {
          for (const check of checksByRoot.values()) {
            const hasEnoughStructuralChecks =
              check.count >= options.maxStructuralChecks;
            if (!hasEnoughStructuralChecks) {
              continue;
            }

            context.report({
              data: { count: String(check.count) },
              messageId: "preferSchema",
              node: functionNode,
            });
          }
        }
      },
      UnaryExpression(node: TSESTree.UnaryExpression) {
        recordStructuralCheck(node);
      },
    };
  },
};
