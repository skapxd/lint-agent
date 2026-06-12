import { getFileName } from "./get-file-name";
import { getSourceExtension } from "./get-source-extension";
import { getSuggestedHelperPath } from "./get-suggested-helper-path";
import { isHttpRouteMethod } from "./is-http-route-method";
import { isNextConventionFile } from "./is-next-convention-file";

type MoveSuggestionInput = {
  filename: string;
  functionName: string;
};

export function getMoveSuggestion({ filename, functionName }: MoveSuggestionInput) {
  const fileName = getFileName(filename);
  const extension = getSourceExtension(fileName);
  const fileStem = fileName.slice(0, -extension.length);
  const suggestedPath = getSuggestedHelperPath({
    extension,
    fileStem,
    filename,
    functionName,
  });

  if (fileStem === "route" && isHttpRouteMethod(functionName)) {
    return `Mueve la implementacion de \`${functionName}\` a \`${suggestedPath}\` si solo se usa aqui y deja \`${functionName}\` en route.ts delegando a ese helper. No conviertas route.ts en route/index.ts porque Next no lo reconoce.`;
  }

  if (isNextConventionFile({ fileStem, filename })) {
    return `Mueve \`${functionName}\` a \`${suggestedPath}\` si solo se usa aqui y deja \`${fileName}\` como entrypoint de Next. No conviertas \`${fileName}\` en \`${fileStem}/index${extension}\` porque Next exige el nombre exacto del archivo.`;
  }

  return `Mueve \`${functionName}\` a \`${suggestedPath}\` si solo se usa aqui.`;
}
