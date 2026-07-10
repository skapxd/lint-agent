import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeLineCount } from "#/utils/ast/get-node-line-count";
import { isPublicClassMethod } from "#/utils/ast/is-public-class-method";

export type ClassMetrics = {
  internalMethodCount: number;
  lines: number;
  methodCount: number;
  propertyCount: number;
  publicMethodCount: number;
};

export function getClassMetrics(
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
): ClassMetrics {
  const methods = node.body.body.filter(
    (member) => member.type === "MethodDefinition" && member.kind === "method",
  );
  const publicMethodCount = node.body.body.filter(isPublicClassMethod).length;
  const propertyCount = node.body.body.reduce((count, member) => {
    const isPropertyDefinition = member.type === "PropertyDefinition";
    if (isPropertyDefinition) {
      return count + 1;
    }

    const isConstructor =
      member.type === "MethodDefinition" && member.kind === "constructor";
    if (!isConstructor) {
      return count;
    }

    return (
      count +
      member.value.params.filter(
        (parameter) => parameter.type === "TSParameterProperty",
      ).length
    );
  }, 0);

  return {
    internalMethodCount: methods.length - publicMethodCount,
    lines: getNodeLineCount(node),
    methodCount: methods.length,
    propertyCount,
    publicMethodCount,
  };
}
