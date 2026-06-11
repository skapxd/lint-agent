import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "nest-no-direct-instantiation",
  rules["nest-no-direct-instantiation"]!,
  {
    invalid: [
      {
        // instanciar un service interno esquiva el contenedor de DI
        code: `
import { FooService } from "#/modules/foo/foo.service";

export class BarService {
  run() {
    const foo = new FooService();
    return foo;
  }
}
`,
        errors: [{ messageId: "noDirectInstantiation" }],
        filename: "src/modules/bar/bar.service.ts",
      },
      {
        // los relativos también son internos
        code: `
import { Helper } from "../helpers/helper";

export class BarService {
  run() {
    return new Helper();
  }
}
`,
        errors: [{ messageId: "noDirectInstantiation" }],
        filename: "src/modules/bar/bar.service.ts",
      },
    ],
    valid: [
      // DI por constructor: el patrón objetivo
      {
        code: `
import { FooService } from "#/modules/foo/foo.service";

export class BarService {
  constructor(private readonly fooService: FooService) {}
  run() {
    return this.fooService;
  }
}
`,
        filename: "src/modules/bar/bar.service.ts",
      },
      // librerías externas se instancian libre
      {
        code: `
import { Logger } from "@nestjs/common";

export class BarService {
  private readonly logger = new Logger("Bar");
}
`,
        filename: "src/modules/bar/bar.service.ts",
      },
      // import type no es import de valor
      {
        code: `
import type { FooService } from "#/modules/foo/foo.service";

export class BarService {
  constructor(private readonly fooService: FooService) {}
}
`,
        filename: "src/modules/bar/bar.service.ts",
      },
      // los globals del runtime nunca se marcan: no son imports internos
      {
        code: `
export class BarService {
  run() {
    return { at: new Date(), cache: new Map(), abort: new AbortController() };
  }
}
`,
        filename: "src/modules/bar/bar.service.ts",
      },
      // errores, excepciones y eventos se construyen, no se inyectan
      // (exención por NOMBRE de clase, sin configurar nada)
      {
        code: `
import { UserNotFoundError } from "#/modules/users/users.errors";
import { WhatsignException } from "#/packages/whatsign/exceptions";
import { EnterStateEvent } from "#/packages/fsm/events";

export class BarService {
  run() {
    throw new UserNotFoundError();
  }

  emit() {
    return [new WhatsignException(), new EnterStateEvent()];
  }
}
`,
        filename: "src/modules/bar/bar.service.ts",
        options: [{ allowFilePatterns: [] }],
      },
      // allowedPatterns por source sigue disponible para convenciones propias
      {
        code: `
import { UserSnapshot } from "#/modules/users/users.values";

export class BarService {
  run() {
    return new UserSnapshot();
  }
}
`,
        filename: "src/modules/bar/bar.service.ts",
        options: [{ allowedPatterns: ["\\.values$"] }],
      },
    ],
  },
);
