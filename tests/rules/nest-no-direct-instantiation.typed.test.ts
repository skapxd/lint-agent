import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

// Con type-info, la regla resuelve el símbolo de la clase importada y
// pregunta por el decorador @Injectable: solo lo que pertenece al contenedor
// de DI exige inyección; las clases de valor se instancian legítimamente.
const instantiatesInjectable = `
import { DiFooService } from "./di-foo.service";

export class ConsumerService {
  run() {
    return new DiFooService();
  }
}
`;

const instantiatesPlainClass = `
import { DiPlainMapper } from "./di-plain-mapper";

export class ConsumerService {
  run() {
    return new DiPlainMapper().map(1);
  }
}
`;

// Import irresoluble: conservador, se reporta igual que sin tipos.
const instantiatesUnresolvable = `
// @ts-expect-error módulo inexistente a propósito
import { GhostService } from "./missing-module";

export class ConsumerService {
  run() {
    return new GhostService();
  }
}
`;

const ruleTester = createTypedRuleTester();
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "nest-no-direct-instantiation",
  rules["nest-no-direct-instantiation"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: instantiatesInjectable,
        errors: [{ messageId: "noDirectInstantiation" }],
        filename: "di-consumer-injectable.ts",
      },
      {
        code: instantiatesUnresolvable,
        errors: [{ messageId: "noDirectInstantiation" }],
        filename: "di-consumer-missing.ts",
      },
    ],
    valid: [
      {
        code: instantiatesPlainClass,
        filename: "di-consumer-plain.ts",
      },
    ],
  },
);
