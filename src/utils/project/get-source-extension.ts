export function getSourceExtension(fileName: string) {
  return fileName.endsWith(".tsx") ? ".tsx" : ".ts";
}
