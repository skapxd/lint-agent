import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { getStringLiteralValue } from "#/utils/react/get-string-literal-value";
import { mergeClassSignatureClasses } from "#/utils/react/merge-class-signature-classes";
import { normalizeClassText } from "#/utils/react/normalize-class-text";
import { readStaticObjectKey } from "#/utils/react/read-static-object-key";
import type { TextRuleSourceCode } from "#/utils/rule-authoring/rule-types";

export type ClassNameSignature = {
  classes: string[];
  signature: string;
};

/**
 * Resume cualquier forma estatica o semi-estatica de `className` en una firma comparable entre JSX repetidos. El objetivo no es evaluar Tailwind ni ejecutar expresiones, sino conservar la forma estructural suficiente para detectar "este patron visual ya quiere ser componente".
 *
 * ### Reglas de lectura
 * Literales y templates aportan clases; ternarios, arrays, objetos, llamadas y logicos conservan su shape; lo que no se puede entender queda como `dynamic:<tipo>:<texto>` para no inventar equivalencias.
 *
 * ### Ejemplo
 * ```ts
 * className={cn("p-2", active && "bg-blue-500")}
 * // -> call:cn(literal(p-2),logical:&&(literal(bg-blue-500)))
 * // -> classes: ["bg-blue-500", "p-2"]
 * ```
 */
export function getClassNameSignature(
  attribute: TSESTree.JSXAttribute,
  sourceCode: TextRuleSourceCode,
): ClassNameSignature | null {
  type ExpressionSignature = {
    classes: string[];
    shape: string;
  };

  function readExpression(node: TSESTree.Node): ExpressionSignature {
    const literalValue = getStringLiteralValue(node);
    if (literalValue !== null) {
      const classes = normalizeClassText(literalValue);
      return {
        classes,
        shape: `literal(${classes.join(" ")})`,
      };
    }

    const isTemplateLiteral = node.type === "TemplateLiteral";
    if (isTemplateLiteral) {
      const quasiParts = node.quasis.map((quasi) =>
        normalizeClassText(quasi.value.cooked ?? quasi.value.raw),
      );
      const classes = [...new Set(quasiParts.flat())].sort();
      return {
        classes,
        shape: `template(${quasiParts.map((part) => part.join(" ")).join("|")}:dynamic)`,
      };
    }

    const isConditionalExpression = node.type === "ConditionalExpression";
    if (isConditionalExpression) {
      const consequent = readExpression(node.consequent);
      const alternate = readExpression(node.alternate);
      return {
        classes: mergeClassSignatureClasses([consequent, alternate]),
        shape: `conditional(${consequent.shape}|${alternate.shape})`,
      };
    }

    const isLogicalExpression = node.type === "LogicalExpression";
    if (isLogicalExpression) {
      const right = readExpression(node.right);
      return {
        classes: right.classes,
        shape: `logical:${node.operator}(${right.shape})`,
      };
    }

    const isCallExpression = node.type === "CallExpression";
    if (isCallExpression) {
      const argumentSignatures = node.arguments.map((argument) =>
        readExpression(argument),
      );
      return {
        classes: mergeClassSignatureClasses(argumentSignatures),
        shape: `call:${sourceCode.getText(node.callee)}(${argumentSignatures
          .map((argument) => argument.shape)
          .join(",")})`,
      };
    }

    const isArrayExpression = node.type === "ArrayExpression";
    if (isArrayExpression) {
      const elementSignatures = node.elements
        .filter((element): element is TSESTree.Expression => element !== null)
        .map((element) => readExpression(element));
      return {
        classes: mergeClassSignatureClasses(elementSignatures),
        shape: `array(${elementSignatures
          .map((element) => element.shape)
          .join(",")})`,
      };
    }

    const isObjectExpression = node.type === "ObjectExpression";
    if (isObjectExpression) {
      function readProperty(
        property: TSESTree.ObjectLiteralElement,
      ): ExpressionSignature {
        const isProperty = property.type === "Property";
        if (!isProperty) {
          return {
            classes: [],
            shape: "spread:dynamic",
          };
        }

        const keyValue = readStaticObjectKey(property.key);
        const keyClasses = keyValue ? normalizeClassText(keyValue) : [];
        const valueSignature = readExpression(property.value);
        return {
          classes: [...new Set([...keyClasses, ...valueSignature.classes])].sort(),
          shape: `property(${keyClasses.join(" ")}:${valueSignature.shape})`,
        };
      }
      const propertySignatures = node.properties.map(readProperty);
      return {
        classes: mergeClassSignatureClasses(propertySignatures),
        shape: `object(${propertySignatures
          .map((property) => property.shape)
          .join(",")})`,
      };
    }

    const childSignatures = getNodeChildren(node).map((child) =>
      readExpression(child),
    );
    const hasLiteralChildren = childSignatures.some(
      (child) => child.classes.length > 0,
    );
    if (hasLiteralChildren) {
      return {
        classes: mergeClassSignatureClasses(childSignatures),
        shape: `${node.type}(${childSignatures
          .map((child) => child.shape)
          .join(",")})`,
      };
    }

    return {
      classes: [],
      shape: `dynamic:${node.type}:${sourceCode.getText(node)}`,
    };
  }

  const value = attribute.value;
  const lacksValue = !value;
  if (lacksValue) {
    return null;
  }

  const literalValue = getStringLiteralValue(value);
  if (literalValue !== null) {
    const classes = normalizeClassText(literalValue);
    return {
      classes,
      signature: `plain(${classes.join(" ")})`,
    };
  }

  const isExpressionContainer = value.type === "JSXExpressionContainer";
  if (!isExpressionContainer) {
    return null;
  }

  const isEmptyExpression = value.expression.type === "JSXEmptyExpression";
  if (isEmptyExpression) {
    return null;
  }

  const expressionSignature = readExpression(value.expression);
  return {
    classes: expressionSignature.classes,
    signature: expressionSignature.shape,
  };
}
