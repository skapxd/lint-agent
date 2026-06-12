import type { TSESTree } from "@typescript-eslint/utils";
import { collectIdentifiersNamed } from "#/utils/ast/collect-identifiers-named";
import { getDeclaredAliasTargets } from "#/utils/imports/get-declared-alias-targets";
import { isInsideNode } from "#/utils/ast/is-inside-node";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";

// ¿La referencia consume el error de verdad? El contrato:
// - El ERROR debe fluir COMPLETO: `result.error` (o su alias) como argumento,
//   retorno o propiedad. Una proyección (`result.error.message`, `e.type`)
//   pierde el `cause` y NO cuenta — la UI puede leer el mensaje, pero el
//   objeto entero tiene que salir hacia alguna parte.
// - El result completo (`return result`, `fn(result)`) también vale: el
//   error viaja adentro.
// - Descartes no cuentan: `void x`, expresión suelta, alias nunca consumido
//   (se siguen recursivamente, destructuring incluido).
export function isConsumedResultReference(
  identifier: TSESTree.Node,
  searchRoot: TSESTree.Node | null,
  represents: "error" | "result" = "result",
  visited: Set<string> = new Set(),
): boolean {
  const member =
    identifier.parent?.type === "MemberExpression" &&
    identifier.parent.object === identifier
      ? identifier.parent
      : null;

  // Cualquier acceso sobre el error es proyección; sobre el result, solo
  // `.error` mantiene la información completa (`.ok`/`.value` la pierden).
  const projectsErrorReference = member && represents === "error";
  if (projectsErrorReference) {
    return false;
  }

  const projectsResultValue = member && !isMemberPropertyNamed(member, "error");
  if (projectsResultValue) {
    return false;
  }

  const reference = member ?? identifier;
  const referenceRepresents = member ? "error" : represents;
  const parent = reference.parent;

  // `result.error.message`: proyección encadenada sobre el error.
  const projectsNestedErrorValue = parent?.type === "MemberExpression" && parent.object === reference;
  if (projectsNestedErrorValue) {
    return false;
  }

  const voidsResultReference = parent?.type === "UnaryExpression" && parent.operator === "void";
  if (voidsResultReference) {
    return false;
  }

  const isExpressionStatementNode = parent?.type === "ExpressionStatement";
  if (isExpressionStatementNode) {
    return false;
  }

  const isDirectConsumption = parent?.type !== "VariableDeclarator" || parent.init !== reference;
  if (isDirectConsumption) {
    return true;
  }

  const targets = getDeclaredAliasTargets(parent.id, referenceRepresents).filter(
    (target) => !visited.has(target.name),
  );

  return targets.some((target) => {
    visited.add(target.name);

    return collectIdentifiersNamed(searchRoot, target.name)
      .filter((aliasReference: TSESTree.Node) => !isInsideNode(aliasReference, parent.id))
      .some((aliasReference: TSESTree.Node) =>
        isConsumedResultReference(
          aliasReference,
          searchRoot,
          target.represents,
          visited,
        ),
      );
  });
}
