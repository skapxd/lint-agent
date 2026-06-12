import { collectIdentifiersNamed } from "#/utils/ast/collect-identifiers-named";
import { getFunctionName } from "#/utils/ast/get-function-name";
import { getNoTunnelPropsOptions } from "#/utils/options/get-no-tunnel-props-options";
import { getObjectPatternPropNames } from "#/utils/ast/get-object-pattern-prop-names";
import { isForwardedPropReference } from "#/utils/react/is-forwarded-prop-reference";
import { isPascalCaseJsxElement } from "#/utils/react/is-pascal-case-jsx-element";
import { isPascalCaseName } from "#/utils/naming/is-pascal-case-name";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matching/matches-any-pattern";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

export const noTunnelProps: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ninguna prop viaja mas de un nivel: quien la recibe no puede reenviarla a otro componente.",
    },
    messages: {
      forwardedProp:
        "La prop `{{prop}}` que `{{component}}` recibe se reenvia a otro componente: ya va por su segundo salto (abuelo -> padre -> hijo). Quien CREA un valor puede pasarlo UN nivel; quien lo recibe no lo reenvia. Mueve el estado/accion a un store global (p. ej. zustand) o a un custom hook y consumelo donde se usa, o deja que el padre componga el JSX (`children`).",
      spreadTunnel:
        "`{{component}}` reenvia TODAS sus props con `{...{{name}}}` a otro componente: es un tunel puro. Mueve el estado a un store global (p. ej. zustand) o a un custom hook, o deja que el padre componga el JSX (`children`).",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowPropPatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNoTunnelPropsOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    function reportSpreadTunnel(
      node: RuleNode,
      componentName: string,
      restName: string,
    ) {
      const spreads = collectIdentifiersNamed(node.body, restName).filter(
        (identifier: RuleNode) =>
          identifier.parent?.type === "JSXSpreadAttribute" &&
          isPascalCaseJsxElement(identifier.parent.parent),
      );

      const spread = spreads[0];

      if (spread) {
        context.report({
          data: { component: componentName, name: restName },
          messageId: "spreadTunnel",
          node: spread.parent,
        });
      }
    }

    function reportForwardedProps(
      node: RuleNode,
      componentName: string,
      propNames: readonly string[],
    ) {
      for (const propName of propNames) {
        const matchesAllowedPattern = matchesAnyPattern(propName, options.allowPropPatterns);
        if (matchesAllowedPattern) {
          continue;
        }

        for (const usage of collectIdentifiersNamed(node.body, propName)) {
          const isForwardedPropReferenceUsage = isForwardedPropReference(usage);
          if (isForwardedPropReferenceUsage) {
            context.report({
              data: { component: componentName, prop: propName },
              messageId: "forwardedProp",
              node: usage.parent.parent,
            });
          }
        }
      }
    }

    function reportIfTunnelComponent(node: RuleNode) {
      const componentName = getFunctionName(node);

      const isComponentFunctionName = isPascalCaseName(componentName);
      if (!isComponentFunctionName) {
        return;
      }

      const firstParameter = node.params[0];

      if (!firstParameter) {
        return;
      }

      const { propNames, restName } = getObjectPatternPropNames(firstParameter);

      if (restName) {
        reportSpreadTunnel(node, componentName, restName);
      }

      reportForwardedProps(node, componentName, propNames);
    }

    return {
      ArrowFunctionExpression: reportIfTunnelComponent,
      FunctionDeclaration: reportIfTunnelComponent,
      FunctionExpression: reportIfTunnelComponent,
    };
  },
};
