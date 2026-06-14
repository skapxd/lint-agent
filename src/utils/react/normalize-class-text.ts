export function normalizeClassText(text: string) {
  const classNames = text.split(/\s+/).filter(Boolean);
  return [...new Set(classNames)].sort();
}
