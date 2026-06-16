import path from "node:path";

export function getEphemeralTsconfigExtendsPath(
  ephemeralTsconfigPath: string,
  tsconfigPath: string,
) {
  const relativePath = path.relative(
    path.dirname(ephemeralTsconfigPath),
    tsconfigPath,
  );
  const posixRelativePath = relativePath.split(path.sep).join("/");
  const needsDotPrefix =
    !posixRelativePath.startsWith(".") && !posixRelativePath.startsWith("/");

  return needsDotPrefix ? `./${posixRelativePath}` : posixRelativePath;
}
