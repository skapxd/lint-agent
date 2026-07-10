import type { TSESTree } from "@typescript-eslint/utils";
import {
  getRootUnitEntries,
  type RootUnitEntry,
} from "#/utils/ast/get-root-unit-entries";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

export const oneRootUnitPerFile: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Limita cada archivo a una sola clase o funcion declarada en la raiz.",
    },
    messages: {
      tooManyRootUnits:
        "Este archivo declara {{count}} unidades de comportamiento en la raiz: {{unitNames}}. Deja una sola clase o funcion top-level. Si una funcion solo sirve a una clase, conviertela en metodo private; si es independiente o reutilizable, muevela a un archivo con nombre semantico. Si hay varias clases, deja cada una en su propio archivo.",
    },
    schema: [],
  },
  create(context: RuleContext) {
    return {
      Program(node: TSESTree.Program) {
        const rootUnits = node.body.flatMap((statement: TSESTree.Node) =>
          getRootUnitEntries(statement),
        );
        const overloadNames = new Set(
          rootUnits
            .filter((unit) => unit.node.type === "TSDeclareFunction")
            .map((unit) => unit.name),
        );
        const isRootUnitRepresentative = (
          unit: RootUnitEntry,
          index: number,
        ) => {
          const isOverloadMember =
            unit.kind === "function" && overloadNames.has(unit.name);
          if (!isOverloadMember) {
            return true;
          }

          const firstOverloadIndex = rootUnits.findIndex((candidate) => {
            const hasSameFunctionName =
              candidate.kind === "function" && candidate.name === unit.name;

            return hasSameFunctionName;
          });

          return firstOverloadIndex === index;
        };
        const units = rootUnits.filter(isRootUnitRepresentative);

        const hasAtMostOneRootUnit = units.length <= 1;
        if (hasAtMostOneRootUnit) {
          return;
        }

        const secondUnit = units[1];
        if (!secondUnit) {
          return;
        }

        context.report({
          data: {
            count: String(units.length),
            unitNames: units.map((unit) => unit.name).join(", "),
          },
          messageId: "tooManyRootUnits",
          node: secondUnit.node,
        });
      },
    };
  },
};
