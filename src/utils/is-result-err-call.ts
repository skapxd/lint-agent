import type { RuleNode } from "#/utils/rule-types";
import { isMemberPropertyNamed } from "./is-member-property-named";

export function isResultErrCall(node: RuleNode) {
  // No se exige que el objeto se llame literalmente `Result`: un alias
  // (`import { Result as R }`) también vale. La identidad real (que provenga de
  // @skapxd/result) la verifica `isSkapxdResultErrCall` con el símbolo.
  return (
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "Identifier" &&
    isMemberPropertyNamed(node.callee, "err")
  );
}
