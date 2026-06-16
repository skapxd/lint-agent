import { formatCompactAdoptionSummary } from "./format-compact-adoption-summary";
import { formatCompactAdoptionRuleSummaries } from "./format-compact-adoption-rule-summaries";
import { formatCompactMessage } from "./format-compact-message";
import { formatCompactPath } from "./format-compact-path";
import { formatCompactStateSummary } from "./format-compact-state-summary";
import { formatCompactSummary } from "./format-compact-summary";
import { formatCompactTypeConfig } from "./format-compact-type-config";
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
  const stateSummary = formatCompactStateSummary(output);
  const typeConfigSummary = formatCompactTypeConfig(output.typeConfig);
  const verificationSummary = formatCompactVerificationSummary(output);
  const hasAdoptionSummary = adoptionSummary.length > 0;
  const hasStateSummary = stateSummary.length > 0;
  const hasVerificationSummary = verificationSummary.length > 0;
  const ruleSummaries = output.ruleSummaries ?? [];
  const shouldShowRuleSummaries =
    !hasAdoptionSummary &&
    !hasVerificationSummary &&
    ruleSummaries.length > 0;
  const filesWithFindings = output.files.filter((file) => file.messages.length > 0);

  if (typeConfigSummary) {
    lines.push(typeConfigSummary);
  }

  if (shouldShowRuleSummaries) {
    lines.push("");
    lines.push(
      ...formatCompactAdoptionRuleSummaries({
        countLabel: "viol",
        header: "rules (orden de resolucion, premisas primero):",
        rules: ruleSummaries,
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
