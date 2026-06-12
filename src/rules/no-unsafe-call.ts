import { unsafeAnyMessage } from "#/rules/no-unsafe-common";
import { wrapTseslintRule } from "#/utils/rule-authoring/wrap-tseslint-rule";

// @typescript-eslint/no-unsafe-call: si algo es `any`, ni siquiera sabemos si
// es invocable.
export const noUnsafeCall = wrapTseslintRule("no-unsafe-call", {
  description:
    "Prohibe invocar valores `any`: valida la frontera y deja que el tipo demuestre que el valor es callable.",
  messages: {
    errorCall: unsafeAnyMessage,
    errorCallThis: unsafeAnyMessage,
    errorNew: unsafeAnyMessage,
    errorTemplateTag: unsafeAnyMessage,
    unsafeCall: unsafeAnyMessage,
    unsafeCallThis: unsafeAnyMessage,
    unsafeNew: unsafeAnyMessage,
    unsafeTemplateTag: unsafeAnyMessage,
  },
});
