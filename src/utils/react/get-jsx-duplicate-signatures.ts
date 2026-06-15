import type { TSESTree } from "@typescript-eslint/utils";
import {
  getClassNameSignature,
  type ClassNameSignature,
} from "./get-class-name-signature";
import { getJsxClassAttribute } from "./get-jsx-class-attribute";
import type { DuplicateSignatureOccurrence } from "#/utils/cross-file/create-cross-file-duplicate-reporter";
import type { TextRuleSourceCode } from "#/utils/rule-authoring/rule-types";

type JsxDuplicateSignatureOptions = {
  minClasses: number;
  minPatternNodes: number;
};

/**
 * Convierte un arbol JSX en ocurrencias comparables para detectar repeticion visual sin depender del nombre del componente. La funcion produce dos familias de firma: una local por `className` denso y otra estructural por subarbol con clases.
 *
 * ### Prioridad de reporte
 * `tree:` tiene prioridad sobre `class:` cuando ambas apuntan al mismo nodo, porque una estructura repetida contiene mas decision de componente que una lista de clases aislada.
 *
 * ### Ejemplo
 * ```ts
 * getJsxDuplicateSignatures(cardTree, sourceCode, options);
 * // tres cards con mismo tag, clases e hijos -> signature: "tree:..."
 * // tres botones con solo una clase larga compartida -> signature: "class:..."
 * ```
 */
export function getJsxDuplicateSignatures(
  node: TSESTree.JSXElement | TSESTree.JSXFragment,
  sourceCode: TextRuleSourceCode,
  options: JsxDuplicateSignatureOptions,
): DuplicateSignatureOccurrence[] {
  type JsxSummary = {
    classCount: number;
    classSignatures: ClassNameSignature[];
    nodeCount: number;
    ownClassSignature: ClassNameSignature | null;
    structuralSignature: string;
  };

  function getTagName(name: TSESTree.JSXTagNameExpression): string {
    const isIdentifier = name.type === "JSXIdentifier";
    if (isIdentifier) {
      return name.name;
    }

    const isMemberExpression = name.type === "JSXMemberExpression";
    if (isMemberExpression) {
      return `${getTagName(name.object)}.${getTagName(name.property)}`;
    }

    return sourceCode.getText(name);
  }

  function summarize(child: TSESTree.JSXElement | TSESTree.JSXFragment): JsxSummary {
    const childSummaries = child.children
      .filter(
        (
          nestedChild,
        ): nestedChild is TSESTree.JSXElement | TSESTree.JSXFragment =>
          nestedChild.type === "JSXElement" || nestedChild.type === "JSXFragment",
      )
      .map((nestedChild) => summarize(nestedChild));

    const classAttribute =
      child.type === "JSXElement" ? getJsxClassAttribute(child) : undefined;
    const ownClassSignature = classAttribute
      ? getClassNameSignature(classAttribute, sourceCode)
      : null;
    const ownClassSignatures = ownClassSignature ? [ownClassSignature] : [];
    const classSignatures = [
      ...ownClassSignatures,
      ...childSummaries.flatMap((summary) => summary.classSignatures),
    ];
    const classCount = classSignatures.reduce(
      (total, signature) => total + signature.classes.length,
      0,
    );
    const nodeCount =
      1 +
      childSummaries.reduce((total, summary) => total + summary.nodeCount, 0);
    const tagName =
      child.type === "JSXElement"
        ? getTagName(child.openingElement.name)
        : "Fragment";
    const classSignatureText = ownClassSignature?.signature ?? "no-class";
    const structuralSignature = `${tagName}[${classSignatureText}](${childSummaries
      .map((summary) => summary.structuralSignature)
      .join(",")})`;

    return {
      classCount,
      classSignatures,
      nodeCount,
      ownClassSignature,
      structuralSignature,
    };
  }

  const summary = summarize(node);
  const occurrences: DuplicateSignatureOccurrence[] = [];

  const ownClassSignatures = summary.ownClassSignature
    ? [summary.ownClassSignature]
    : [];
  for (const classSignature of ownClassSignatures) {
    const reachesClassDensity = classSignature.classes.length >= options.minClasses;
    if (!reachesClassDensity) {
      continue;
    }

    occurrences.push({
      node,
      reportPriority: 1,
      signature: `class:${classSignature.signature}`,
    });
  }

  const reachesPatternNodeDensity = summary.nodeCount >= options.minPatternNodes;
  const hasStructuralClasses = summary.classCount > 0;
  const reachesStructuralDensity =
    reachesPatternNodeDensity && hasStructuralClasses;
  if (reachesStructuralDensity) {
    occurrences.push({
      node,
      reportPriority: 0,
      signature: `tree:${summary.structuralSignature}`,
    });
  }

  return occurrences;
}
