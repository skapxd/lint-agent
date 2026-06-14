import fs from "node:fs";

export function removeFileIfExists(filePath: string) {
  const exists = fs.existsSync(filePath);

  if (exists) {
    fs.unlinkSync(filePath);
  }
}
