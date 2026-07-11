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
  let propertyCount = 0;
  for (const member of node.body.body) {
    const isPropertyDefinition = member.type === "PropertyDefinition";
    if (isPropertyDefinition) {
      propertyCount += 1;
      continue;
    }

    const isConstructor =
      member.type === "MethodDefinition" && member.kind === "constructor";
    if (!isConstructor) {
      continue;
    }

    propertyCount += member.value.params.filter(
      (parameter) => parameter.type === "TSParameterProperty",
    ).length;
  }

  return {
    internalMethodCount: methods.length - publicMethodCount,
    lines: getNodeLineCount(node),
    methodCount: methods.length,
    propertyCount,
    publicMethodCount,
  };
}
