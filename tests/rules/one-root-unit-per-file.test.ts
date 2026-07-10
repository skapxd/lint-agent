import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "one-root-unit-per-file",
  rules["one-root-unit-per-file"]!,
  {
    invalid: [
      {
        code: "function first() {}\nfunction second() {}",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "function parse() {}\nfunction parse() {}",
        errors: [
          {
            data: { count: "2", unitNames: "parse, parse" },
            messageId: "tooManyRootUnits",
          },
        ],
      },
      {
        code: "const first = () => {};\nconst second = function () {};",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "class First {}\nclass Second {}",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "class First {}\nfunction second() {}",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "function first() {}\nclass Second {}",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "const First = class {};\nfunction second() {}",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "const First = class {};\nconst Second = class {};",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "export class First {}\nexport const second = () => {};",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "export default class First {}\nexport function second() {}",
        errors: [{ messageId: "tooManyRootUnits" }],
      },
      {
        code: "export function parseSignal(value: string): string;\nexport function parseSignal(value: number): string;\nexport function parseSignal(value: string | number): string { return String(value); }\nexport class SignalParser {}",
        errors: [
          {
            data: {
              count: "2",
              unitNames: "parseSignal, SignalParser",
            },
            column: 8,
            line: 4,
            messageId: "tooManyRootUnits",
          },
        ],
      },
      {
        code: "const first = () => {}, Second = class {};",
        errors: [
          {
            data: {
              count: "2",
              unitNames: "first, Second",
            },
            messageId: "tooManyRootUnits",
          },
        ],
      },
    ],
    valid: [
      "export function only() {}",
      "export class Only { public run() {} private normalize() {} }",
      "export function parseSignal(value: string): string;\nexport function parseSignal(value: number): string;\nexport function parseSignal(value: string | number): string { return String(value); }",
      "type Signal = string;\ninterface Input { value: string }\nenum State { Ready }\nconst DEFAULT_SIGNAL = 'ready';\nexport class Only {}",
      "import { value } from './value';\nexport type { Signal } from './signal';\nconst data = value;",
      "namespace Signal { export const value = 'ready'; }",
      "register(() => {});",
      "const created = factory(() => class {});",
      "const create = () => class {};",
      "function outer() { function inner() {} return inner; }",
      "const handlers = { first() {}, second() {} };",
      "export { SignalParser } from './signal-parser';",
    ],
  },
);
