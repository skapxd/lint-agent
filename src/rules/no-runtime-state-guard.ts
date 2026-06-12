import { containsThrowStatement } from "#/utils/contains-throw-statement";
import { getContainingFunction } from "#/utils/get-containing-function";
import { getNoRuntimeStateGuardOptions } from "#/utils/get-no-runtime-state-guard-options";
import { getThisPropertyInTest } from "#/utils/get-this-property-in-test";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

export const noRuntimeStateGuard: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe proteger el estado de una clase con if(this.x) + throw: el estado invalido debe ser irrepresentable en el tipo.",
    },
    messages: {
      runtimeStateGuard:
        "Este metodo protege su estado con una comprobacion en runtime (`if` sobre `this.{{property}}` + `throw`): la maquina de estados vive en runtime, exige tests para cada ruta invalida y el compilador no puede ayudar. Hazlo irrepresentable: cada estado es un tipo — una clase por estado cuyas transiciones RETORNAN el estado nuevo (DisconnectedSocket.connect(): ConnectedSocket, y emit solo existe en ConnectedSocket), o una union discriminada consumida con match(). Lo que hoy pruebas con tests, el compilador lo prueba gratis.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: LegacyAstNode) {
    const options = getNoRuntimeStateGuardOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    return {
      IfStatement(node: LegacyAstNode) {
        const containingFunction = getContainingFunction(node);

        // Solo el guard del ESTADO PROPIO en metodos de clase: validar
        // argumentos o inputs externos es otro territorio (DTOs, Result).
        if (containingFunction?.parent?.type !== "MethodDefinition") {
          return;
        }

        const property = getThisPropertyInTest(node.test);

        if (!property || !containsThrowStatement(node.consequent)) {
          return;
        }

        context.report({
          data: { property },
          messageId: "runtimeStateGuard",
          node: node.test,
        });
      },
    };
  },
};
