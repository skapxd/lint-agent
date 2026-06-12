import type { RuleNode, RuleSourceCode, TypeContext } from "#/utils/rule-types";
import { getVariableInitializer } from "./get-variable-initializer";
import { objectExpressionHasSignal } from "./object-expression-has-signal";

// addEventListener(type, listener, options): ¿las options traen `signal`?
// Resolución en capas: objeto literal → inspección directa; identifier →
// se sigue hasta su inicializador en el scope; sin inicializador → el type
// checker pregunta si el TIPO declara `signal` (si ni el tipo la tiene, es
// imposible que llegue); sin tipos → beneficio de la duda.
export function hasAbortSignalOption(
  callExpression: RuleNode,
  sourceCode: RuleSourceCode,
  typeContext: TypeContext | null,
) {
  const options = callExpression.arguments[2];

  if (!options) {
    return false;
  }

  // `addEventListener("x", fn, true)`: el boolean de capture nunca trae signal.
  if (options.type === "Literal") {
    return false;
  }

  if (options.type === "ObjectExpression") {
    return objectExpressionHasSignal(options);
  }

  const scope =
    options.type === "Identifier" ? sourceCode.getScope?.(options) : null;
  const initializer = scope ? getVariableInitializer(options, scope) : null;

  if (initializer?.type === "ObjectExpression") {
    return objectExpressionHasSignal(initializer);
  }

  if (typeContext) {
    const type = typeContext.services.getTypeAtLocation(options);

    return Boolean(typeContext.checker.getPropertyOfType(type, "signal"));
  }

  return true;
}
