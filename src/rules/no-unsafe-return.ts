import { unsafeAnyMessage } from "#/rules/no-unsafe-common";
import { wrapTseslintRule } from "#/utils/rule-authoring/wrap-tseslint-rule";

// @typescript-eslint/no-unsafe-return: un `any` no puede salir de una funcion
// y contaminar a su llamador.
export const noUnsafeReturn = wrapTseslintRule("no-unsafe-return", {
  description:
    "Prohibe retornar `any`: valida y estrecha antes de convertir una frontera desconocida en contrato de salida.",
  messages: {
    unsafeReturn: unsafeAnyMessage,
    unsafeReturnAssignment: unsafeAnyMessage,
    unsafeReturnThis: unsafeAnyMessage,
  },
});
