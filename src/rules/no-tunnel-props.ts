// @ts-nocheck
import { collectIdentifiersNamed } from "#/utils/collect-identifiers-named";
import { getFunctionName } from "#/utils/get-function-name";
import { getNoTunnelPropsOptions } from "#/utils/get-no-tunnel-props-options";
import { getObjectPatternPropNames } from "#/utils/get-object-pattern-prop-names";
import { isForwardedPropReference } from "#/utils/is-forwarded-prop-reference";
import { isPascalCaseJsxElement } from "#/utils/is-pascal-case-jsx-element";
import { isPascalCaseName } from "#/utils/is-pascal-case-name";
import { matchesAnyGlob } from "#/utils/matches-any-glob";

export const noTunnelProps = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe componentes-tunel: props que solo pasan de largo hacia otros componentes.",
    },
    messages: {
      tunnelProps:
        "{{count}} props de `{{component}}` solo pasan de largo hacia otros componentes ({{props}}). Esto es prop drilling: mueve ese estado/acciones a un store global (p. ej. zustand) o a un custom hook y consumelo donde se usa, o invierte la estructura con composicion (`children`).",
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
          maxPassThroughProps: { type: "number" },
        },
        type: "object",
      },
    ],
  },
  create(context) {
    const options = getNoTunnelPropsOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    function reportSpreadTunnel(node, componentName, restName) {
      const spreads = collectIdentifiersNamed(node.body, restName).filter(
        (identifier) =>
          identifier.parent?.type === "JSXSpreadAttribute" &&
          isPascalCaseJsxElement(identifier.parent.parent),
      );

      if (spreads.length > 0) {
        context.report({
          data: { component: componentName, name: restName },
          messageId: "spreadTunnel",
          node: spreads[0].parent,
        });
      }
    }

    function getPassThroughProps(node, propNames) {
      return propNames.filter((propName) => {
        const usages = collectIdentifiersNamed(node.body, propName);

        return (
          usages.length > 0 &&
          usages.every((usage) => isForwardedPropReference(usage, propName))
        );
      });
    }

    function reportIfTunnelComponent(node) {
      const componentName = getFunctionName(node);

      if (!isPascalCaseName(componentName)) {
        return;
      }

      const { propNames, restName } = getObjectPatternPropNames(node.params[0]);

      if (restName) {
        reportSpreadTunnel(node, componentName, restName);
      }

      const passThroughProps = getPassThroughProps(node, propNames);

      if (passThroughProps.length < options.maxPassThroughProps) {
        return;
      }

      context.report({
        data: {
          component: componentName,
          count: String(passThroughProps.length),
          props: passThroughProps.map((name) => `\`${name}\``).join(", "),
        },
        messageId: "tunnelProps",
        node: node.params[0],
      });
    }

    return {
      ArrowFunctionExpression: reportIfTunnelComponent,
      FunctionDeclaration: reportIfTunnelComponent,
      FunctionExpression: reportIfTunnelComponent,
    };
  },
};
