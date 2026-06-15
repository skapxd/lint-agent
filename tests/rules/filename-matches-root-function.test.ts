import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "filename-matches-root-function",
  rules["filename-matches-root-function"]!,
  {
    invalid: [
      {
        code: "export const fetchNode = () => {};",
        errors: [
          {
            data: {
              expected: "fetch-node.ts",
              exportName: "fetchNode",
              filename: "get-node.ts",
            },
            messageId: "filenameMismatch",
          },
        ],
        filename: "get-node.ts",
      },
      {
        code: "export function MyComponent() { return <div />; }",
        errors: [
          {
            data: {
              expected: "my-component.tsx",
              exportName: "MyComponent",
              filename: "MyComponent.tsx",
            },
            messageId: "filenameMismatch",
          },
        ],
        filename: "MyComponent.tsx",
      },
    ],
    valid: [
      {
        code: "export const getNode = () => {};",
        filename: "get-node.ts",
      },
      {
        code: "export const getNodeTS = () => {};",
        filename: "get-node-ts.ts",
      },
      {
        code: "export function Card() { return <div />; }",
        filename: "card.tsx",
      },
      {
        code: "export { Card } from './card';",
        filename: "index.ts",
      },
      {
        code: "export const unsafeAnyMessage = 'unsafe any';\nexport type UnsafeRuleName = 'no-unsafe-assignment';",
        filename: "no-unsafe-common.ts",
      },
      {
        code: "const getNode = () => {};\nexport { getNode };",
        filename: "get-node.ts",
      },
      {
        code: "export const fetchNode = () => {};",
        filename: "legacy/get-node.ts",
        options: [{ allowFilePatterns: ["legacy/**"] }],
      },
    ],
  },
);
