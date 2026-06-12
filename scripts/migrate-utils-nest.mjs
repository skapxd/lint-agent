import { runMoveMigration } from "./lib/move-ts-files.mjs";

runMoveMigration({
  moves: [
    ["src/utils/get-decorator-name.ts", "src/utils/nest/get-decorator-name.ts"],
    [
      "src/utils/has-class-decorator-named.ts",
      "src/utils/nest/has-class-decorator-named.ts",
    ],
    ["src/utils/has-injectable-decorator.ts", "src/utils/nest/has-injectable-decorator.ts"],
    ["src/utils/is-http-route-method.ts", "src/utils/nest/is-http-route-method.ts"],
    ["src/utils/is-query-with-string-arg.ts", "src/utils/nest/is-query-with-string-arg.ts"],
    ["src/utils/nest-cli-has-swagger-plugin.ts", "src/utils/nest/nest-cli-has-swagger-plugin.ts"],
  ],
});
