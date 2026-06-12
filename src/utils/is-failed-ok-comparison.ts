export function isFailedOkComparison(
  operator: string,
  comparedValue: boolean | null | undefined,
) {
  return (
    (operator === "===" && comparedValue === false) ||
    (operator === "!==" && comparedValue === true)
  );
}
