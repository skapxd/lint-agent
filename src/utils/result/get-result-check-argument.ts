import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

// Extrae el Result de una guarda con type-guard, p. ej. `Result.isErr(result)`
// o `Result.isOk(result)`. Devuelve `{ name, node }` del argumento, o null.
export function getResultCheckArgument(node: RuleNode, methodName: string) {
  const unwrappedNode = unwrapExpression(node);

  const lacksResultCheckCall = unwrappedNode.type !== "CallExpression" ||
    unwrappedNode.callee.type !== "MemberExpression" ||
    !isMemberPropertyNamed(unwrappedNode.callee, methodName);
  if (
    lacksResultCheckCall
  ) {
    return null;
  }

  const argument = unwrappedNode.arguments[0];

  const isIdentifierArgument = argument?.type === "Identifier";
  if (!isIdentifierArgument) {
    return null;
  }

  return { name: argument.name, node: argument };
}
