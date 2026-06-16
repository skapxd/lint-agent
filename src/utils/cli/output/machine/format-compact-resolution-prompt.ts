export function formatCompactResolutionPrompt(
  resolutionPrompt: string | undefined,
) {
  if (resolutionPrompt === undefined) {
    return [];
  }

  return resolutionPrompt.split("\n");
}
