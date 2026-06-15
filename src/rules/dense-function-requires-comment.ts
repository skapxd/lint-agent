import type { TSESTree } from "@typescript-eslint/utils";
import { getCommentMarkdownStructure } from "#/utils/dense-function/get-comment-markdown-structure";
import {
  getDenseFunctionMetrics,
  type DenseFunctionMetrics,
} from "#/utils/dense-function/get-dense-function-metrics";
import { getDenseFunctionRequiresCommentOptions } from "#/utils/options/get-dense-function-requires-comment-options";
import { getFunctionNodeName } from "#/utils/ast/get-function-node-name";
import { getVariableDeclaratorName } from "#/utils/ast/get-variable-declarator-name";
import { isFunctionNode, type FunctionNode } from "#/utils/ast/is-function-node";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type {
  RuleComment,
  RuleContext,
  RuleModule,
} from "#/utils/rule-authoring/rule-types";

type DenseFunctionSubject = {
  commentTargetNode: TSESTree.Node;
  functionNode: FunctionNode;
  name: string;
  reportNode: TSESTree.Node;
};

export const denseFunctionRequiresComment: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Exige un comentario de bloque de motivacion antes de funciones exportadas densas.",
    },
    messages: {
      markdownStructureMissing:
        "El comentario de la funcion densa {{name}} necesita estructura markdown para un hover util en el editor: al menos un ejemplo en bloque de codigo (entrada -> salida) y un header markdown. Asi VSCode lo renderiza legible al hacer hover sobre la funcion.",
      missingMotivationComment:
        "La funcion {{name}} es densa ({{lines}} lineas, {{literals}} literales, {{branches}} ramas) y no explica su intencion. Anade un comentario de bloque de motivacion ANTES de la funcion: que problema resuelve (alto nivel), y un ejemplo o pseudocodigo. No documentes la implementacion (el codigo ya la cuenta); documenta el porque, para que se entienda de un vistazo.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          minBranches: {
            type: "number",
          },
          minLines: {
            type: "number",
          },
          minLiterals: {
            type: "number",
          },
          requireCodeFence: {
            type: "boolean",
          },
          requireHeader: {
            type: "boolean",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getDenseFunctionRequiresCommentOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    function getBlockCommentImmediatelyBefore(node: TSESTree.Node): RuleComment | null {
      const commentsBefore = sourceCode.getCommentsBefore?.(node) ?? [];

      return commentsBefore.find((comment) => {
        const isBlockComment = comment.type === "Block";
        const endsOnPreviousLine = comment.loc.end.line === node.loc.start.line - 1;

        return isBlockComment && endsOnPreviousLine;
      }) ?? null;
    }

    function isDenseFunction(metrics: DenseFunctionMetrics) {
      const hasEnoughLines = metrics.lines >= options.minLines;
      const hasEnoughLiterals = metrics.literals >= options.minLiterals;
      const hasEnoughBranches = metrics.branches >= options.minBranches;

      return hasEnoughLines && hasEnoughLiterals && hasEnoughBranches;
    }

    function reportIfDenseWithoutComment(subject: DenseFunctionSubject) {
      const metrics = getDenseFunctionMetrics(subject.functionNode);
      const lacksDenseSignal = !isDenseFunction(metrics);
      if (lacksDenseSignal) {
        return;
      }

      const motivationBlock = getBlockCommentImmediatelyBefore(
        subject.commentTargetNode,
      );
      const lacksMotivationBlock = !motivationBlock;
      if (lacksMotivationBlock) {
        context.report({
          data: {
            branches: String(metrics.branches),
            lines: String(metrics.lines),
            literals: String(metrics.literals),
            name: subject.name,
          },
          messageId: "missingMotivationComment",
          node: subject.reportNode,
        });
        return;
      }

      const structure = getCommentMarkdownStructure(motivationBlock);
      const lacksRequiredCodeFence =
        options.requireCodeFence && !structure.hasCodeFence;
      const lacksRequiredHeader = options.requireHeader && !structure.hasHeader;
      const lacksMarkdownStructure =
        lacksRequiredCodeFence || lacksRequiredHeader;
      if (lacksMarkdownStructure) {
        context.report({
          data: { name: subject.name },
          messageId: "markdownStructureMissing",
          node: subject.reportNode,
        });
      }
    }

    return {
      Program(node: TSESTree.Program) {
        for (const statement of node.body) {
          const isNamedExport = statement.type === "ExportNamedDeclaration";
          if (!isNamedExport) {
            continue;
          }

          const declaration = statement.declaration;
          const lacksDeclaration = !declaration;
          if (lacksDeclaration) {
            continue;
          }

          const isExportedFunctionDeclaration = isFunctionNode(declaration);
          if (isExportedFunctionDeclaration) {
            reportIfDenseWithoutComment({
              commentTargetNode: statement,
              functionNode: declaration,
              name: getFunctionNodeName(declaration),
              reportNode: declaration,
            });
            continue;
          }

          const isExportedVariableDeclaration =
            declaration.type === "VariableDeclaration";
          if (!isExportedVariableDeclaration) {
            continue;
          }

          for (const declarator of declaration.declarations) {
            const functionNode = declarator.init;
            const lacksFunctionInitializer = !isFunctionNode(functionNode);
            if (lacksFunctionInitializer) {
              continue;
            }

            reportIfDenseWithoutComment({
              commentTargetNode: statement,
              functionNode,
              name: getVariableDeclaratorName(declarator),
              reportNode: declarator.id,
            });
          }
        }
      },
    };
  },
};
