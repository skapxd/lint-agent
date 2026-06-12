import type { TSESTree } from "@typescript-eslint/utils";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { getRootIdentifier } from "./get-root-identifier";

export function getCallStructuralRoot(
  node: TSESTree.CallExpression,
): TSESTree.Identifier | null {
  const callee = node.callee;
  const hasMemberCallee = callee.type === "MemberExpression";
  if (!hasMemberCallee) {
    return null;
  }

  const isArrayIsArrayCall =
    callee.object.type === "Identifier" &&
    callee.object.name === "Array" &&
    isMemberPropertyNamed(callee, "isArray");
  if (isArrayIsArrayCall) {
    return getRootIdentifier(node.arguments[0]);
  }

  const isDirectHasOwnPropertyCall = isMemberPropertyNamed(
    callee,
    "hasOwnProperty",
  );
  if (isDirectHasOwnPropertyCall) {
    return getRootIdentifier(callee.object);
  }

  const isHasOwnPropertyCall = isMemberPropertyNamed(callee, "call") &&
    callee.object.type === "MemberExpression" &&
    isMemberPropertyNamed(callee.object, "hasOwnProperty");
  if (isHasOwnPropertyCall) {
    return getRootIdentifier(node.arguments[0]);
  }

  return null;
}
