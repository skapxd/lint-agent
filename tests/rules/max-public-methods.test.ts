import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run("max-public-methods", rules["max-public-methods"]!, {
  invalid: [
    {
      // dos casos de uso en una clase: refactor requerido
      code: `
export class ApcService {
  async getScore(id: string) { return id; }
  async refreshScore(id: string) { return id; }
}
`,
      errors: [{ messageId: "tooManyPublicMethods" }],
      filename: "src/apc/apc.service.ts",
    },
    {
      // el límite es configurable y se respeta el excedente
      code: `
export class BigService {
  a() {}
  b() {}
  c() {}
}
`,
      errors: [{ messageId: "tooManyPublicMethods" }],
      filename: "src/big/big.service.ts",
      options: [{ max: 2 }],
    },
    {
      // sin el `ignore` del preset, un hook de Nest cuenta como cualquier
      // método: en una clase de Astro/Vite ese nombre no significa nada
      code: `
export class PixiScene {
  render() {}
  onModuleInit() {}
}
`,
      errors: [{ messageId: "tooManyPublicMethods" }],
      filename: "src/scenes/pixi-scene.ts",
    },
  ],
  valid: [
    // un caso de uso, con todo su séquito privado
    {
      code: `
export class FindApcScoreService {
  constructor(private readonly repository: unknown) {}
  async execute(id: string) { return this.normalize(id); }
  private normalize(id: string) { return id; }
  protected audit() {}
  _legacyHelper() {}
  get cached() { return null; }
}
`,
      filename: "src/apc/find-apc-score.service.ts",
    },
    // la regla es agnóstica: el conocimiento del framework entra por
    // `ignore` (el preset nest pasa sus hooks así)
    {
      code: `
export class WarmupService {
  async execute() {}
  async onModuleInit() {}
  async onApplicationBootstrap() {}
}
`,
      filename: "src/warmup/warmup.service.ts",
      options: [{ ignore: ["onModuleInit", "onApplicationBootstrap"] }],
    },
    // `ignore` con nombres propios del proyecto
    {
      code: `
export class LegacyService {
  execute() {}
  legacyEntry() {}
}
`,
      filename: "src/legacy/legacy.service.ts",
      options: [{ ignore: ["legacyEntry"] }],
    },
    // exención por glob para los legacy aún no migrados
    {
      code: `
export class OldService {
  a() {}
  b() {}
}
`,
      filename: "src/modules/legacy/old.service.ts",
      options: [{ allowFilePatterns: ["src/modules/legacy/**"] }],
    },
  ],
});
