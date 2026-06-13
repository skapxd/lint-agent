import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "nested-function-requires-capture",
  rules["nested-function-requires-capture"]!,
  {
    invalid: [
      {
        code: `
          function processOrders(orders: number[]) {
            function double(value: number) {
              return value * 2;
            }

            return orders.map(double);
          }
        `,
        errors: [{ messageId: "missingCapture" }],
      },
      {
        code: `
          function parse(raw: string) {
            const toNumber = (value: string) => Number(value.trim());

            return raw.split(",").map(toNumber);
          }
        `,
        errors: [{ messageId: "missingCapture" }],
      },
      {
        code: `
          function build() {
            const helper = function (value: number) {
              return value + 1;
            };

            return helper(1);
          }
        `,
        errors: [{ messageId: "missingCapture" }],
      },
      {
        code: `
          function createCounter() {
            const count = 1;
            const helper = () => helper();

            return count + helper();
          }
        `,
        errors: [{ messageId: "missingCapture" }],
      },
      {
        code: `
          function bindMethod() {
            const helper = () => this.save();

            return helper;
          }
        `,
        errors: [{ messageId: "missingCapture" }],
      },
    ],
    valid: [
      `
        function makeScaler(multiplier: number) {
          function scale(value: number) {
            return value * multiplier;
          }

          return scale;
        }
      `,
      `
        function create(context: { report: (node: unknown) => void }) {
          function reportHere(node: unknown) {
            context.report(node);
          }

          return { CallExpression: reportHere };
        }
      `,
      `
        function processOrders(orders: number[]) {
          return orders.map((value) => value * 2);
        }
      `,
      `
        const adder = (left: number) => (right: number) => left + right;
      `,
      `
        function useList(items: string[]) {
          return items.map(function (item) {
            return item.trim();
          });
        }
      `,
      `
        function Card() {
          function formatLabel(value: string) {
            return value.trim();
          }

          return formatLabel("x");
        }
      `,
      `
        function makeFormatter(prefix: string) {
          const suffix = "!";

          if (prefix) {
            function format(value: string) {
              return prefix + value + suffix;
            }

            return format;
          }

          return (value: string) => value;
        }
      `,
    ],
  },
);
