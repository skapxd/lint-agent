type BuiltinDetector = (specifier: string) => boolean;

export function isBuiltinDetector(
  detectorCandidate: unknown,
): detectorCandidate is BuiltinDetector {
  return typeof detectorCandidate === "function";
}
