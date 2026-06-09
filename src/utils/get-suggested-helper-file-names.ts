// @ts-nocheck
import { getSuggestedHelperFileName } from "./get-suggested-helper-file-name";

export function getSuggestedHelperFileNames({ extension, fileStem, functionNames }) {
  return [
    ...new Set(
      functionNames.map((functionName) =>
        getSuggestedHelperFileName({
          extension,
          fileStem,
          functionName,
        }),
      ),
    ),
  ];
}
