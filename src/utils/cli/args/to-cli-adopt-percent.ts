export function toCliAdoptPercent(rawPercent: string) {
  const normalizedPercent = rawPercent.endsWith("%")
    ? rawPercent.slice(0, -1)
    : rawPercent;
  const isValidPercent = /^(?:100|[1-9]?\d)$/u.test(normalizedPercent);

  if (!isValidPercent) {
    return null;
  }

  return Number(normalizedPercent);
}
