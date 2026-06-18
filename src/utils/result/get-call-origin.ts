import type { TSESTree } from "@typescript-eslint/utils";
import { getCallOriginDeclarations } from "./get-call-origin-declarations";
import { isExternalOrigin } from "./is-external-origin";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export type CallOrigin = "external" | "mixed" | "project" | "unknown";

export function getCallOrigin(
  call: TSESTree.CallExpression,
  typeContext: TypeContext,
): CallOrigin {
  const declarations = getCallOriginDeclarations(call, typeContext);
  const lacksDeclarations = declarations.length === 0;
  if (lacksDeclarations) {
    return "unknown";
  }

  const origins = new Set(
    declarations.map((declaration) =>
      isExternalOrigin(declaration, typeContext.services.program),
    ),
  );
  const hasSingleOrigin = origins.size === 1;
  if (!hasSingleOrigin) {
    return "mixed";
  }

  return origins.has(true) ? "external" : "project";
}
