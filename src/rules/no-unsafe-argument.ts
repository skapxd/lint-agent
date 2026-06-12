import { unsafeAnyMessage } from "#/rules/no-unsafe-common";
import { wrapTseslintRule } from "#/utils/rule-authoring/wrap-tseslint-rule";

// @typescript-eslint/no-unsafe-argument: un `any` no entra a APIs tipadas sin
// validacion previa.
export const noUnsafeArgument = wrapTseslintRule("no-unsafe-argument", {
  description:
    "Prohibe pasar `any` como argumento: primero declara `unknown` y estrecha con schema o type predicate honesto.",
  messages: {
    unsafeArgument: unsafeAnyMessage,
    unsafeArraySpread: unsafeAnyMessage,
    unsafeSpread: unsafeAnyMessage,
    unsafeTupleSpread: unsafeAnyMessage,
  },
});
