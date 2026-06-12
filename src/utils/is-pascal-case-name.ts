export function isPascalCaseName(value: string) {
  return /^[A-Z][A-Za-z0-9]*$/.test(value);
}
