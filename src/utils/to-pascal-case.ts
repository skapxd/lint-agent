export function toPascalCase(value: string) {
  return value.replace(/^[a-z]/, (letter) => letter.toLocaleUpperCase());
}
