import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSkapxdNestSourceFile } from "#/utils/nest/is-skapxd-nest-source-file";

export function getSkapxdLayerOfType(
  type: ts.Type,
  typeContext: TypeContext,
  packageName: string,
): string | null {
  const { checker } = typeContext;
  for (const prop of checker.getPropertiesOfType(type)) {
    const declarations = prop.getDeclarations() ?? [];
    const isDeclaredByLayerSource = declarations.some((declaration) =>
      isSkapxdNestSourceFile(declaration.getSourceFile().fileName, packageName),
    );
    if (!isDeclaredByLayerSource) {
      continue;
    }

    const [declaration] = declarations;
    if (!declaration) {
      continue;
    }

    const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
    if (propType.isStringLiteral()) {
      return propType.value;
    }
  }

  return null;
}
