import fs from "node:fs";
import { getAdoptionStateFilePath } from "./get-adoption-state-file-path";

export function removeAdoptionState(targetPath: string) {
  const statePath = getAdoptionStateFilePath(targetPath);
  const hasStateFile = fs.existsSync(statePath);

  if (hasStateFile) {
    fs.rmSync(statePath);
  }

  return statePath;
}
