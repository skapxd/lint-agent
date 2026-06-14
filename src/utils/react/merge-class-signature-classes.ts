type ClassSignaturePart = {
  classes: string[];
};

export function mergeClassSignatureClasses(parts: ClassSignaturePart[]) {
  const classNames = parts.flatMap((part) => part.classes);
  return [...new Set(classNames)].sort();
}
