import { unsafeAnyMessage } from "#/rules/no-unsafe-common";
import { wrapTseslintRule } from "#/utils/rule-authoring/wrap-tseslint-rule";

// @typescript-eslint/no-unsafe-member-access: no se puede navegar una forma
// que el tipo no conoce.
export const noUnsafeMemberAccess = wrapTseslintRule(
  "no-unsafe-member-access",
  {
    description:
      "Prohibe leer miembros desde `any`: una frontera sin validar debe ser `unknown` hasta que un schema o predicate pruebe su forma.",
    messages: {
      errorComputedMemberAccess: unsafeAnyMessage,
      errorMemberExpression: unsafeAnyMessage,
      errorThisMemberExpression: unsafeAnyMessage,
      unsafeComputedMemberAccess: unsafeAnyMessage,
      unsafeMemberExpression: unsafeAnyMessage,
      unsafeThisMemberExpression: unsafeAnyMessage,
    },
  },
);
