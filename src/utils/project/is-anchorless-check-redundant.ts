import { dirname } from "node:path";
import { anchorFileExists } from "#/utils/project/anchor-file-exists";

// Raices de proyecto ya revisadas por la via del fallback (proyectos sin
// archivo ancla, como Astro o librerias): el primer archivo del run reporta
// y los demas callan. Vive a nivel de modulo: persiste durante todo el run
// de ESLint, que es exactamente el alcance del "una vez por proyecto".
const checkedRoots = new Set<string>();

// Decide si un archivo NO-ancla puede saltarse la revision del tsconfig:
// porque su raiz ya fue revisada en este run, o porque el proyecto SI tiene
// un archivo ancla y el reporte le pertenece a ese archivo (determinista).
export function isAnchorlessCheckRedundant(
  tsconfigPath: string | null,
  fallbackRootKey: string,
  anchorFilePatterns: readonly string[],
) {
  const rootKey = tsconfigPath ?? fallbackRootKey;

  if (checkedRoots.has(rootKey)) {
    return true;
  }

  checkedRoots.add(rootKey);

  if (!tsconfigPath) {
    return false;
  }

  return anchorFileExists(dirname(tsconfigPath), anchorFilePatterns);
}
