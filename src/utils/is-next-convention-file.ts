import { isInSourceRoot } from "./is-in-source-root";
import { isInsideAppDirectory } from "./is-inside-app-directory";
import { nextAppMetadataFileStems } from "#/constants/next-app-metadata-file-stems";
import { nextAppRouteSegmentFileStems } from "#/constants/next-app-route-segment-file-stems";
import { nextProjectRootFileStems } from "#/constants/next-project-root-file-stems";

type NextConventionFileInput = {
  fileStem: string;
  filename: string;
};

export function isNextConventionFile({
  fileStem,
  filename,
}: NextConventionFileInput) {
  if (
    [
      ...nextAppRouteSegmentFileStems,
      ...nextAppMetadataFileStems,
    ].includes(fileStem)
  ) {
    return isInsideAppDirectory(filename);
  }

  if (nextProjectRootFileStems.includes(fileStem)) {
    return isInSourceRoot(filename);
  }

  return false;
}
