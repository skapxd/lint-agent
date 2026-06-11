import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

const withImport = (code: string) =>
  `import { ValidationPipe } from "@nestjs/common";\n${code}`;

createRuleTester().run(
  "nest-validation-pipe-config",
  rules["nest-validation-pipe-config"]!,
  {
    invalid: [
      {
        // sin opciones: faltan las dos
        code: withImport("app.useGlobalPipes(new ValidationPipe());"),
        errors: [{ messageId: "missingPipeOptions" }],
        filename: "src/utils/main-config/validate-dto.ts",
      },
      {
        // falta transform: los @Type de los DTOs no corren
        code: withImport(
          "app.useGlobalPipes(new ValidationPipe({ whitelist: true }));",
        ),
        errors: [{ messageId: "missingPipeOptions" }],
        filename: "src/utils/main-config/validate-dto.ts",
      },
      {
        // explícitamente apagado tampoco vale
        code: withImport(
          "app.useGlobalPipes(new ValidationPipe({ transform: false, whitelist: true }));",
        ),
        errors: [{ messageId: "missingPipeOptions" }],
        filename: "src/utils/main-config/validate-dto.ts",
      },
      {
        // options como variable: se resuelve por scope
        code: withImport(
          "const opts = { whitelist: true };\napp.useGlobalPipes(new ValidationPipe(opts));",
        ),
        errors: [{ messageId: "missingPipeOptions" }],
        filename: "src/utils/main-config/validate-dto.ts",
      },
    ],
    valid: [
      // el patrón de tus proyectos
      {
        code: withImport(
          "app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, enableDebugMessages: true }));",
        ),
        filename: "src/utils/main-config/validate-dto.ts",
      },
      // variable resuelta con todo en orden
      {
        code: withImport(
          "const opts = { transform: true, whitelist: true };\napp.useGlobalPipes(new ValidationPipe(opts));",
        ),
        filename: "src/utils/main-config/validate-dto.ts",
      },
      // spread: beneficio de la duda
      {
        code: withImport(
          "app.useGlobalPipes(new ValidationPipe({ ...baseOptions }));",
        ),
        filename: "src/utils/main-config/validate-dto.ts",
      },
      // identifier irresoluble (parámetro): beneficio de la duda
      {
        code: withImport(
          "export const build = (opts: object) => new ValidationPipe(opts);",
        ),
        filename: "src/utils/main-config/validate-dto.ts",
      },
      // un ValidationPipe casero (sin import de @nestjs/common) no aplica
      {
        code: "class ValidationPipe {}\nconst pipe = new ValidationPipe();",
        filename: "src/utils/custom-pipe.ts",
      },
    ],
  },
);
