import type { TSESTree } from "@typescript-eslint/utils";
import { getClassMetrics } from "#/utils/ast/get-class-metrics";
import { getLargestExtractableClassLiteral } from "#/utils/ast/get-largest-extractable-class-literal";
import { getMaxClassSizeOptions } from "#/utils/options/get-max-class-size-options";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

export const maxClassSize: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Limita cada clase a 150 lineas para exigir unidades pequenas y semanticas.",
    },
    messages: {
      tooLargeClass:
        "[REFACTOR REQUERIDO] La clase {{className}} tiene {{lines}} lineas (max {{maxLines}}), {{methodCount}} metodos ({{publicMethodCount}} publicos, {{internalMethodCount}} internos) y {{propertyCount}} propiedades. Dividela en clases mas pequenas y semanticas, cada una con una sola responsabilidad; mueve a cada clase solo los metodos, estado y dependencias que necesita. Extrae transformaciones puras y configuracion declarativa a modulos importables, no a providers artificiales. Conserva {{className}} como orquestador solo si existe coordinacion real.",
      tooLargeClassWithExtractableData:
        "[EXTRACCION REQUERIDA] La clase {{className}} tiene {{lines}} lineas (max {{maxLines}}), {{methodCount}} metodos ({{publicMethodCount}} publicos, {{internalMethodCount}} internos) y {{propertyCount}} propiedades. El literal declarativo de {{dataLines}} lineas dentro de {{memberName}} explica el exceso. Si son datos estaticos, extraelos a una constante o modulo importable; si dependen de argumentos, usa una funcion factory; usa un provider injectable solo cuando existan dependencias, estado o lifecycle reales.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          maxLines: { minimum: 1, type: "integer" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const { maxLines } = getMaxClassSizeOptions(context.options[0]);

    function reportIfTooLarge(
      node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
    ) {
      const metrics = getClassMetrics(node);
      const staysWithinClassBudget = metrics.lines <= maxLines;
      if (staysWithinClassBudget) {
        return;
      }

      const className = node.id?.name ?? "anonymous";
      const data = {
        className,
        internalMethodCount: String(metrics.internalMethodCount),
        lines: String(metrics.lines),
        maxLines: String(maxLines),
        methodCount: String(metrics.methodCount),
        propertyCount: String(metrics.propertyCount),
        publicMethodCount: String(metrics.publicMethodCount),
      };
      const literal = getLargestExtractableClassLiteral(node);
      const extractionFits =
        literal !== null &&
        literal.dataLines - 1 >= metrics.lines - maxLines;

      if (extractionFits) {
        context.report({
          data: {
            ...data,
            dataLines: String(literal.dataLines),
            memberName: literal.memberName,
          },
          messageId: "tooLargeClassWithExtractableData",
          node: node.id ?? node,
        });
        return;
      }

      context.report({
        data,
        messageId: "tooLargeClass",
        node: node.id ?? node,
      });
    }

    return {
      ClassDeclaration: reportIfTooLarge,
      ClassExpression: reportIfTooLarge,
    };
  },
};
