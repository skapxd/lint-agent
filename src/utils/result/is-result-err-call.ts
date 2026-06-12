import type { TSESTree } from "@typescript-eslint/utils";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";

export function isResultErrCall(node: TSESTree.Node): node is TSESTree.CallExpression & {
  callee: TSESTree.MemberExpression & { object: TSESTree.Identifier };
} {
  // No se exige que el objeto se llame literalmente `Result`: un alias
  // (`import { Result as R }`) también vale. La identidad real (que provenga de
  // @skapxd/result) la verifica `isSkapxdResultErrCall` con el símbolo.
  return (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "Identifier" &&
    isMemberPropertyNamed(node.callee, "err")
  );
}
