import { getInternalValueImports } from "#/utils/get-internal-value-imports";
import { getNestDirectInstantiationOptions } from "#/utils/get-nest-direct-instantiation-options";
import { getTypeContext } from "#/utils/get-type-context";
import { hasInjectableDecorator } from "#/utils/has-injectable-decorator";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matches-any-pattern";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

export const nestNoDirectInstantiation: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe `new` sobre imports internos del proyecto: las dependencias entran por el constructor (DI).",
    },
    messages: {
      noDirectInstantiation:
        "[INYECCION REQUERIDA] No instancies `{{name}}` con `new`: viene de `{{source}}`, codigo interno del proyecto. (1) Agregalo al constructor: `constructor(private readonly {{camelName}}: {{name}}) {}`; (2) reemplaza el uso por `this.{{camelName}}`; (3) verifica que `{{name}}` este registrado como provider en su modulo. Asi NestJS resuelve el grafo de dependencias y la clase queda testeable con mocks. Si no es un injectable (un value object, un error de dominio), agregalo a `allowedPatterns`.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowedClassPatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowedPatterns: {
            items: { type: "string" },
            type: "array",
          },
          internalPatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: LegacyAstNode) {
    const options = getNestDirectInstantiationOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    let internalImports = new Map();

    return {
      Program(node: LegacyAstNode) {
        internalImports = getInternalValueImports(
          node,
          options.internalPatterns,
          options.allowedPatterns,
        );
      },
      NewExpression(node: LegacyAstNode) {
        if (node.callee.type !== "Identifier") {
          return;
        }

        const name = node.callee.name;
        const source = internalImports.get(name);

        if (!source) {
          return;
        }

        // Errores, excepciones y eventos se construyen, no se inyectan.
        if (matchesAnyPattern(name, options.allowedClassPatterns)) {
          return;
        }

        // Con type-info, la semántica exacta: solo lo decorado @Injectable
        // pertenece al contenedor. Una clase de valor (DTO, mapper) sin el
        // decorador se instancia legítimamente. Irresoluble → conservador.
        if (
          typeContext &&
          hasInjectableDecorator(node.callee, typeContext) === false
        ) {
          return;
        }

        context.report({
          data: {
            camelName: name.charAt(0).toLowerCase() + name.slice(1),
            name,
            source,
          },
          messageId: "noDirectInstantiation",
          node,
        });
      },
    };
  },
};
