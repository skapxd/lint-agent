import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// Con type-info, un identifier irresoluble (parámetro) se juzga por su TIPO:
// si el tipo ni siquiera declara `signal`, es imposible que lo traiga.
const typedWithoutSignal = `
declare function useEffect(callback: () => void): void;
declare const target: { addEventListener: (t: string, l: () => void, o?: unknown) => void };

export function useThing(listenerOptions: { passive?: boolean }) {
  useEffect(() => {
    target.addEventListener("resize", () => {}, listenerOptions);
  });
}
`;

// El tipo declara `signal`: beneficio de la duda con fundamento.
const typedWithSignal = `
declare function useEffect(callback: () => void): void;
declare const target: { addEventListener: (t: string, l: () => void, o?: unknown) => void };

export function useThing(listenerOptions: { passive?: boolean; signal?: unknown }) {
  useEffect(() => {
    target.addEventListener("resize", () => {}, listenerOptions);
  });
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "prefer-abort-signal",
  rules["prefer-abort-signal"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: typedWithoutSignal,
        errors: [{ messageId: "addWithoutSignal" }],
        filename: "typed-without-signal.ts",
      },
    ],
    valid: [{ code: typedWithSignal, filename: "typed-with-signal.ts" }],
  },
);
