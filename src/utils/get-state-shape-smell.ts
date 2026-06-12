import type { LegacyAstNode } from "#/utils/rule-types";
import { matchesAnyPattern } from "./matches-any-pattern";
import { memberIsBoolean } from "./member-is-boolean";

// Analiza los miembros de un tipo, interface o CLASE buscando la forma
// enferma: un flag boolean de "en proceso" conviviendo con un campo de error
// como miembros independientes. Devuelve { flag, error } o null. Aplica
// igual en front (estado de UI) y en back (clases de jobs, schemas que
// PERSISTEN la inconsistencia).
export function getStateShapeSmell(members: LegacyAstNode, options: LegacyAstNode) {
  let flag = null;
  let error = null;

  for (const member of members) {
    const isShapeMember =
      member.type === "TSPropertySignature" || member.type === "PropertyDefinition";

    if (!isShapeMember || member.key?.type !== "Identifier") {
      continue;
    }

    const name = member.key.name;
    // Un callback no es estado: `onError` en unas props es un handler
    // legítimo, no un campo de error conviviendo con el flag.
    const isCallback =
      /^on[A-Z]/.test(name) ||
      member.typeAnnotation?.typeAnnotation?.type === "TSFunctionType";

    if (isCallback) {
      continue;
    }

    // Los patrones se comparan en minúsculas: isLoading, IsLoading y
    // is_loading son la misma enfermedad. El TIPO del campo de error no
    // importa (Error, string, code numérico, boolean): la enfermedad es la
    // coexistencia, no el tipo.
    const comparableName = name.toLowerCase();

    if (
      memberIsBoolean(member) &&
      matchesAnyPattern(comparableName, options.loadingPatterns)
    ) {
      flag = name;
      continue;
    }

    if (matchesAnyPattern(comparableName, options.errorPatterns)) {
      error = name;
    }
  }

  return flag && error ? { error, flag } : null;
}
