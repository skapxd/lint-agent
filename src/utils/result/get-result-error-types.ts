import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

/**
 * Extrae los tipos del canal de error (`E`) de un `Result<T, E>`.
 *
 * Un `Result<T, E>` es la union `Ok<T> | Err<E>`; la propiedad `error` solo
 * vive en el miembro `Err`. Recorre los miembros de la union (desenvolviendo
 * antes una Promise) y devuelve el tipo de `error` de cada `Err` encontrado.
 * Devuelve varios tipos cuando el retorno es una union de Results distintos.
 */
export function getResultErrorTypes(
  resultType: ts.Type,
  typeContext: TypeContext,
): ts.Type[] {
  const awaitedType = typeContext.checker.getAwaitedType(resultType) ?? resultType;
  const members = awaitedType.isUnion() ? awaitedType.types : [awaitedType];

  const errorTypes: ts.Type[] = [];
  for (const member of members) {
    const errorSymbol = member.getProperty("error");
    if (!errorSymbol) {
      continue;
    }
    errorTypes.push(typeContext.checker.getTypeOfSymbol(errorSymbol));
  }

  return errorTypes;
}
