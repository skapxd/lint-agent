import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    ["src/utils/anchor-file-exists.ts", "src/utils/project/anchor-file-exists.ts"],
    ["src/utils/count-parent-segments.ts", "src/utils/project/count-parent-segments.ts"],
    ["src/utils/find-project-file.ts", "src/utils/project/find-project-file.ts"],
    ["src/utils/get-directory-name.ts", "src/utils/project/get-directory-name.ts"],
    ["src/utils/get-file-name.ts", "src/utils/project/get-file-name.ts"],
    ["src/utils/get-package-name.ts", "src/utils/project/get-package-name.ts"],
    ["src/utils/get-path-parts.ts", "src/utils/project/get-path-parts.ts"],
    ["src/utils/get-source-extension.ts", "src/utils/project/get-source-extension.ts"],
    [
      "src/utils/get-untyped-export-conditions.ts",
      "src/utils/project/get-untyped-export-conditions.ts",
    ],
    [
      "src/utils/is-anchorless-check-redundant.ts",
      "src/utils/project/is-anchorless-check-redundant.ts",
    ],
    ["src/utils/is-in-source-root.ts", "src/utils/project/is-in-source-root.ts"],
    [
      "src/utils/is-inside-app-directory.ts",
      "src/utils/project/is-inside-app-directory.ts",
    ],
    [
      "src/utils/is-next-convention-file.ts",
      "src/utils/project/is-next-convention-file.ts",
    ],
    ["src/utils/read-resolved-tsconfig.ts", "src/utils/project/read-resolved-tsconfig.ts"],
  ],
});
