import ts from "typescript";

export function isUnknownOrAnyType(type: ts.Type): boolean {
  return (type.flags & (ts.TypeFlags.Unknown | ts.TypeFlags.Any)) !== 0;
}
