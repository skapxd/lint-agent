import { formatCompactAdoptionSummary } from "./format-compact-adoption-summary";
import { formatCompactAdoptionRuleSummaries } from "./format-compact-adoption-rule-summaries";
import { formatCompactCountBreakdown } from "./format-compact-count-breakdown";
import { formatCompactMessage } from "./format-compact-message";
import { formatCompactPath } from "./format-compact-path";
import { formatCompactResolutionPrompt } from "./format-compact-resolution-prompt";
import { formatCompactStateSummary } from "./format-compact-state-summary";
import { formatCompactSummary } from "./format-compact-summary";
import { formatCompactTypeConfig } from "./format-compact-type-config";
import { formatCompactUnattributedFindings } from "./format-compact-unattributed-findings";
import { formatCompactVerificationSummary } from "./format-compact-verification-summary";
import type { SkapxdLintOutput } from "#/utils/cli/types";

/**
 * ### Reporte compacto de maquina
 *
 * El compact necesita ser legible en una terminal grande sin perder el mapa de
 * resolucion: primero orienta con resumen, tipos y reglas; despues muestra el
 * detalle por archivo. Las secciones de adopcion/verificacion ya traen su propio
 * mapa, por eso el resumen global de reglas solo aparece en evaluate/changed.
 *
 * ```text
 * resumen -> tipos -> reglas -> archivo -> mensajes
 * adopt/verify -> resumen propio -> archivo -> mensajes
 * ```
 */
export function renderCompactOutput(output: SkapxdLintOutput) {
  const lines = [formatCompactSummary(output)];
  const adoptionSummary = formatCompactAdoptionSummary(output);
  const countBreakdown = formatCompactCountBreakdown(output.countBreakdown);
  const resolutionPrompt = formatCompactResolutionPrompt(output.resolutionPrompt);
  const stateSummary = formatCompactStateSummary(output);
  const typeConfigSummary = formatCompactTypeConfig(output.typeConfig);
  const unattributedFindings = formatCompactUnattributedFindings({
    findings: output.unattributedFindings,
    targetPath: output.targetPath,
  });
  const verificationSummary = formatCompactVerificationSummary(output);
  const hasAdoptionSummary = adoptionSummary.length > 0;
  const hasCountBreakdown = countBreakdown.length > 0;
  const hasResolutionPrompt = resolutionPrompt.length > 0;
  const hasStateSummary = stateSummary.length > 0;
  const hasUnattributedFindings = unattributedFindings.length > 0;
  const hasVerificationSummary = verificationSummary.length > 0;
  const rulePlan = output.rulePlan ?? [];
  const shouldShowRuleSummaries =
    !hasAdoptionSummary &&
    !hasVerificationSummary &&
    rulePlan.length > 0;
  const filesWithFindings = output.files.filter((file) => file.messages.length > 0);

  if (hasCountBreakdown) {
    lines.push("");
    lines.push(...countBreakdown);
  }

  if (typeConfigSummary) {
    lines.push("");
    lines.push(typeConfigSummary);
  }

  if (hasResolutionPrompt) {
    lines.push("");
    lines.push(...resolutionPrompt);
  }

  if (shouldShowRuleSummaries) {
    lines.push("");
    lines.push(
      ...formatCompactAdoptionRuleSummaries({
        countLabel: "viol",
        header: "rules (plan de resolucion):",
        rules: rulePlan,
      }),
    );
  }

  if (hasAdoptionSummary) {
    lines.push("");
    lines.push(...adoptionSummary);
  }

  if (hasStateSummary) {
    lines.push("");
    lines.push(...stateSummary);
  }

  if (hasVerificationSummary) {
    lines.push("");
    lines.push(...verificationSummary);
  }

  if (hasUnattributedFindings) {
    lines.push("");
    lines.push(...unattributedFindings);
  }

  for (const file of filesWithFindings) {
    const relativeFilePath = formatCompactPath(file.filePath, output.targetPath ?? null);

    lines.push("");
    lines.push(relativeFilePath);

    for (const message of file.messages) {
      const ruleId = message.ruleId ?? "parse";
      const location = `${message.line}:${message.column}`;
      const text = formatCompactMessage(message.message);

      lines.push(`  ${location}  ${ruleId}  ${text}`);
    }
  }

  return `${lines.join("\n")}\n`;
}
