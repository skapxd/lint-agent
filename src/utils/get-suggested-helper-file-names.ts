import { getSuggestedHelperFileName } from "./get-suggested-helper-file-name";

type SuggestedHelperFileNamesInput = {
  extension: string;
  fileStem: string;
  functionNames: readonly string[];
};

export function getSuggestedHelperFileNames({
  extension,
  fileStem,
  functionNames,
}: SuggestedHelperFileNamesInput) {
  return [
    ...new Set(
      functionNames.map((functionName: string) =>
        getSuggestedHelperFileName({
          extension,
          fileStem,
          functionName,
        }),
      ),
    ),
  ];
}
