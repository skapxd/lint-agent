import { unsafeAnyMessage } from "#/rules/no-unsafe-common";
import { wrapTseslintRule } from "#/utils/rule-authoring/wrap-tseslint-rule";

// @typescript-eslint/no-unsafe-assignment: cierra el `any` invisible que nace
// en fronteras como JSON.parse() y response.json().
export const noUnsafeAssignment = wrapTseslintRule("no-unsafe-assignment", {
  description:
    "Prohibe asignar valores `any`: el `any` invisible de JSON.parse()/response.json() debe declararse `unknown` y estrecharse con evidencia.",
  messages: {
    anyAssignment: unsafeAnyMessage,
    anyAssignmentThis: unsafeAnyMessage,
    unsafeArrayPattern: unsafeAnyMessage,
    unsafeArrayPatternFromTuple: unsafeAnyMessage,
    unsafeArraySpread: unsafeAnyMessage,
    unsafeAssignment: unsafeAnyMessage,
    unsafeObjectPattern: unsafeAnyMessage,
  },
});
