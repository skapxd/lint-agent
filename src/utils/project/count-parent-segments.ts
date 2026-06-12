export function countParentSegments(source: string): number {
  let count = 0;

  for (const part of source.split("/")) {
    const isPart = part === "..";
    if (isPart) {
      count += 1;
      continue;
    }

    const isCurrentSegment = part === ".";
    if (isCurrentSegment) {
      continue;
    }

    break;
  }

  return count;
}
