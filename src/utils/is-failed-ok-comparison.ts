// @ts-nocheck
export function isFailedOkComparison(operator, comparedValue) {
  return (
    (operator === "===" && comparedValue === false) ||
    (operator === "!==" && comparedValue === true)
  );
}
