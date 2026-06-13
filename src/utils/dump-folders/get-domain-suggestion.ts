import type {
  ContentSignature,
  DomainSuggestion,
  DumpFolderInfo,
} from "#/utils/dump-folders/types";

const minimumSharedSignals = 2;
const minimumOverlapRatio = 0.25;

export function getDomainSuggestion(
  fileSignature: ContentSignature,
  folderInfo: DumpFolderInfo,
): DomainSuggestion {
  const existingDomains = folderInfo.domainNames
    .map((domainName) => `${domainName}/`)
    .join(", ");
  const lacksFileSignals = fileSignature.keys.size === 0;
  if (lacksFileSignals) {
    return {
      message:
        `No encontre senales de contenido fuertes en este archivo. Usa el nombre como fallback: muevelo a un subdominio existente (${existingDomains}) o crea uno nuevo con nombre de dominio.`,
      suggestedDomain: null,
    };
  }

  const signalSummary = [
    fileSignature.examples.import.length > 0
      ? `imports: ${fileSignature.examples.import.join(", ")}`
      : "",
    fileSignature.examples.ast.length > 0
      ? `AST: ${fileSignature.examples.ast.join(", ")}`
      : "",
    fileSignature.examples.identifier.length > 0
      ? `identificadores: ${fileSignature.examples.identifier.join(", ")}`
      : "",
  ]
    .filter((segment) => segment.length > 0)
    .join("; ");

  const scoredDomains = [...folderInfo.domainSignatures.entries()]
    .map((entry) => {
      const [domainName, domainSignature] = entry;
      let sharedSignalCount = 0;

      for (const key of fileSignature.keys) {
        const domainHasSignal = domainSignature.keys.has(key);
        if (domainHasSignal) {
          sharedSignalCount += 1;
        }
      }

      return {
        domainName,
        overlapRatio: sharedSignalCount / fileSignature.keys.size,
        sharedSignalCount,
      };
    })
    .sort((left, right) => right.sharedSignalCount - left.sharedSignalCount);

  const bestDomain = scoredDomains[0];
  const lacksDomainCandidate = !bestDomain;
  if (lacksDomainCandidate) {
    return {
      message:
        `Tus senales (${signalSummary}) no tienen dominios existentes contra que compararse; crea un dominio nuevo con nombre especifico.`,
      suggestedDomain: null,
    };
  }

  const hasEnoughSharedSignals =
    bestDomain.sharedSignalCount >= minimumSharedSignals;
  const hasEnoughOverlap = bestDomain.overlapRatio >= minimumOverlapRatio;
  const isUsefulSuggestion = hasEnoughSharedSignals && hasEnoughOverlap;
  if (!isUsefulSuggestion) {
    return {
      message:
        `Tus senales (${signalSummary}) no superan el umbral con ningun dominio existente. Crea un dominio nuevo si ninguno de estos aplica: ${existingDomains}.`,
      suggestedDomain: null,
    };
  }

  return {
    message:
      `Tus senales (${signalSummary}) se parecen a \`${bestDomain.domainName}/\` (${bestDomain.sharedSignalCount}/${fileSignature.keys.size} senales compartidas). Muevelo ahi, o crea un dominio nuevo si ninguno aplica. Dominios existentes: ${existingDomains}.`,
    suggestedDomain: bestDomain.domainName,
  };
}
