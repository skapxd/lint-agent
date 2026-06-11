import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("no-accessors", rules["no-accessors"]!, {
  invalid: [
    {
      code: "class Connection { get socket() { return this.current; } }",
      errors: [{ messageId: "noAccessor" }],
      filename: "src/connection.ts",
    },
    {
      code: "class Connection { set socket(value: unknown) { this.current = value; } }",
      errors: [{ messageId: "noAccessor" }],
      filename: "src/connection.ts",
    },
    {
      // el método disfrazado que evadía max-public-methods: muere de raíz
      code: "class FatService { get sendMessage() { return (jid: string) => jid; } }",
      errors: [{ messageId: "noAccessor" }],
      filename: "src/fat.service.ts",
    },
    {
      // los accessors de objetos literales también esconden computación
      code: "const config = { get token() { return compute(); } };",
      errors: [{ messageId: "noAccessor" }],
      filename: "src/config.ts",
    },
  ],
  valid: [
    // el método explícito: dice la verdad y cuenta en la superficie pública
    {
      code: "class Connection { socket() { return this.current; } }",
      filename: "src/connection.ts",
    },
    // propiedades normales no son accessors
    {
      code: "class Snapshot { readonly value: number = 1; }",
      filename: "src/snapshot.ts",
    },
    {
      code: "const config = { token: 'abc' };",
      filename: "src/config.ts",
    },
    {
      code: "class Legacy { get old() { return 1; } }",
      filename: "src/legacy/old.ts",
      options: [{ allowFilePatterns: ["src/legacy/**"] }],
    },
  ],
});
