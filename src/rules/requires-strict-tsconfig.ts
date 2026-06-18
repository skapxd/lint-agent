import type { TSESTree } from "@typescript-eslint/utils";
import { dirname, resolve } from "node:path";
import { findProjectFile } from "#/utils/project/find-project-file";
import { getStrictTsconfigOptions } from "#/utils/options/get-strict-tsconfig-options";
import { isAnchorlessCheckRedundant } from "#/utils/project/is-anchorless-check-redundant";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { readResolvedTsconfig } from "#/utils/project/read-resolved-tsconfig";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const requiresStrictTsconfig: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "El tsconfig debe ser implacable: sin los flags estrictos, el compilador no puede hacer irrepresentables los estados invalidos.",
    },
    messages: {
      missingTsconfig:
        "No encontre un tsconfig.json legible en el proyecto. El sistema completo descansa en que el compilador verifique los tipos: sin tsconfig resoluble, esa premisa no se puede comprobar. Crea o ubica un tsconfig.json en la raiz del proyecto, o corrige la ejecucion (cwd/ruta del archivo) para que la regla lo resuelva.",
      missingStrictFlags:
        "El tsconfig no activa: {{missing}}. Sin `strict`, el sistema de tipos esta apagado a medias; sin `noImplicitReturns`, una rama puede salir sin valor y el compilador calla; sin `noUncheckedIndexedAccess`, acceder a un array/objeto dinamico finge que nunca devuelve undefined. Estos flags son los que convierten los estados invalidos en errores de compilacion — agregalos en compilerOptions.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          anchorFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          requiredCompilerOptions: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getStrictTsconfigOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    const isAnchor = matchesAnyGlob(filename, options.anchorFilePatterns);

    return {
      Program(node: TSESTree.Program) {
        const absoluteFilename = resolve(context.cwd ?? process.cwd(), filename);
        const tsconfigPath = findProjectFile(
          dirname(absoluteFilename),
          "tsconfig.json",
        );

        // Fallback para proyectos sin entrypoint clasico (Astro, librerias):
        // si el proyecto SI tiene un archivo ancla, el reporte le pertenece a
        // ese archivo; si no, reporta el primer archivo del run y los demas
        // callan.
        const usesRedundantAnchorlessCheck = !isAnchor &&
          isAnchorlessCheckRedundant(
            tsconfigPath,
            context.cwd ?? process.cwd(),
            options.anchorFilePatterns,
          );
        if (
          usesRedundantAnchorlessCheck
        ) {
          return;
        }

        const compilerOptions = tsconfigPath
          ? readResolvedTsconfig(tsconfigPath)
          : null;

        if (!compilerOptions) {
          context.report({ messageId: "missingTsconfig", node });

          return;
        }

        const missing = options.requiredCompilerOptions.filter(
          (flag: string) => compilerOptions[flag] !== true,
        );

        const hasMissing = missing.length > 0;
        if (hasMissing) {
          context.report({
            data: { missing: missing.map((flag: string) => `\`${flag}\``).join(", ") },
            messageId: "missingStrictFlags",
            node,
          });
        }
      },
    };
  },
};
