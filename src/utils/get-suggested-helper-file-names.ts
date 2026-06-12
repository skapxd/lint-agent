import type { LegacyAstNode } from "#/utils/rule-types";
import { getSuggestedHelperFileName } from "./get-suggested-helper-file-name";

export function getSuggestedHelperFileNames({ extension, fileStem, functionNames }: LegacyAstNode) {
  return [
    ...new Set(
      functionNames.map((functionName: LegacyAstNode) =>
        getSuggestedHelperFileName({
          extension,
          fileStem,
          functionName,
        }),
      ),
    ),
  ];
}
