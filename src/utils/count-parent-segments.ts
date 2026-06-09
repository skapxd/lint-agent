export function countParentSegments(source: string): number {
  let count = 0;

  for (const part of source.split("/")) {
    if (part === "..") {
      count += 1;
      continue;
    }

    if (part === ".") {
      continue;
    }

    break;
  }

  return count;
}
