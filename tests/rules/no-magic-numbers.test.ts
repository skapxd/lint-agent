import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const calibratedNoMagicNumbersOptions = {
  ignore: [-1, 0, 1, 2],
  ignoreArrayIndexes: true,
  ignoreEnums: true,
  ignoreReadonlyClassProperties: true,
  ignoreDefaultValues: true,
  enforceConst: true,
};

createRuleTester().run("no-magic-numbers", rules["no-magic-numbers"]!, {
  invalid: [
    {
      code: "setTimeout(fn, 3000);",
      errors: [{ messageId: "noMagic" }],
      options: [calibratedNoMagicNumbersOptions],
    },
  ],
  valid: [
    {
      code: "for (let i = 0; i < items.length; i += 1) {}",
      options: [calibratedNoMagicNumbersOptions],
    },
    {
      code: "const first = items[0];",
      options: [calibratedNoMagicNumbersOptions],
    },
    {
      code: "enum Status { Draft = 3 }",
      options: [calibratedNoMagicNumbersOptions],
    },
  ],
});
