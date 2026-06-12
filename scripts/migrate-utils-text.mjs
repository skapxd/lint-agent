import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [["src/utils/contains-emoji.ts", "src/utils/text/contains-emoji.ts"]],
});
