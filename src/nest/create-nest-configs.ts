import { nestEntrypointFilePatterns } from "#/constants/nest-entrypoint-file-patterns";
import { nestFrameworkHookNames } from "#/constants/nest-framework-hook-names";
import {
  baseRules,
  createTypedLanguageOptions,
  type OpinionatedConfigList,
  type OpinionatedPluginReference,
  typeDrivenRules,
} from "#/shared/configs";

export function createNestConfigs(
  pluginReference: OpinionatedPluginReference,
) {
  const typedLanguageOptions = createTypedLanguageOptions();

  return [
    // El dominio completo (services, controllers, modules, guards, ...).
    // Las carpetas fuera de src (dev/, scripts/, e2e/, integration-test/)
    // quedan fuera del preset a propósito: no son la app.
    {
      files: ["src/**/*.ts"],
      languageOptions: typedLanguageOptions,
      name: "skapxd/nest/base",
      // Solo el plugin skapxd: las reglas de typescript-eslint entran
      // re-registradas bajo nuestro namespace (typeDrivenRules).
      plugins: { skapxd: pluginReference },
      rules: {
        ...baseRules,
        ...typeDrivenRules,
        // Nota: class-properties-require-readonly viene de las bases sin
        // override — la exención de la capa de persistencia es por
        // PROPIEDAD (decoradores @Prop/@Column verificados contra los
        // imports de @nestjs/mongoose/typeorm), no por nombre de archivo.
        // La regla agnóstica de las bases, con el conocimiento del
        // framework inyectado: los hooks de Nest (onModuleInit,
        // canActivate, intercept, ...) no cuentan como superficie pública.
        "skapxd/max-public-methods": [
          "error",
          { ignore: [...nestFrameworkHookNames] },
        ],
        // Todo await resuelve en Result, salvo entrypoints (crashean ruidoso)
        // y composición de otro @UseCase real (ya tradujo Result a DTO/throw).
        "skapxd/await-requires-result": [
          "error",
          { allowFilePatterns: [...nestEntrypointFilePatterns] },
        ],
        // El contrato HTTP se documenta en los DTOs (@ApiProperty), no en el
        // controller: el plugin @nestjs/swagger introspecciona el resto.
        "skapxd/nest-controller-injects-use-case": "error",
        "skapxd/nest-controller-input-dtos": "error",
        "skapxd/nest-controller-returns-dto": "error",
        "skapxd/nest-dto-no-class-decorator": "error",
        "skapxd/nest-dto-no-inline-object": "error",
        "skapxd/nest-dto-requires-api-property": "error",
        // Todo DTO valida en runtime con class-validator (+ @Type de
        // class-transformer para anidados); las exenciones de output son
        // opt-in por configuracion, no convencion de nombres.
        "skapxd/nest-dto-requires-validation": "error",
        "skapxd/nest-module-layer-folders": "error",
        // El controller es la frontera: consume el Result con match() y
        // traduce a DTO o HttpException. Devolverlo crudo serializa el
        // envelope { ok, error } al cliente.
        "skapxd/nest-no-result-response": "error",
        "skapxd/nest-no-swagger-in-controllers": "error",
        // El @UseCase es la frontera de aplicacion: consume el Result de la
        // capa baja y lanza la excepcion que los filters de Nest traducen.
        "skapxd/nest-use-case-no-result-response": "error",
        // Configuración del proyecto verificada por el lint: el plugin de
        // swagger en nest-cli.json (la premisa de las reglas de swagger) y
        // un ValidationPipe con transform + whitelist (la premisa de las
        // reglas de DTOs).
        "skapxd/nest-requires-swagger-plugin": "error",
        "skapxd/nest-validation-pipe-config": "error",
      },
    },
    // En services, las dependencias entran por el constructor (DI), no con
    // `new`.
    {
      files: ["src/**/*.service.ts"],
      name: "skapxd/nest/services",
      plugins: { skapxd: pluginReference },
      rules: {
        "skapxd/nest-no-direct-instantiation": "error",
      },
    },
    // La forma de controllers y gateways la dicta el framework (un método
    // por ruta/evento): ahí el límite de métodos públicos no aporta
    // semántica. Y 2+ query params individuales son un DTO disfrazado.
    {
      files: ["src/**/*.controller.ts", "src/**/*.gateway.ts"],
      name: "skapxd/nest/controllers",
      plugins: { skapxd: pluginReference },
      rules: {
        "skapxd/max-public-methods": "off",
        "skapxd/nest-no-inline-query-params": "error",
      },
    },
    // Specs colocados: los tests awaitean helpers y SUTs libremente, y
    // descartar un Result en una aserción no es perder un trace.
    {
      files: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
      name: "skapxd/nest/tests",
      plugins: { skapxd: pluginReference },
      rules: {
        // El `!` sobre un fixture cuya existencia el propio test garantiza
        // no es mentirle al compilador: es el arrange. no-floating-promises
        // sí queda activa — un await olvidado en un spec es un falso verde.
        "skapxd/await-requires-result": "off",
        "skapxd/no-non-null-assertion": "off",
        "skapxd/no-rethrow-result-error": "off",
        "skapxd/no-try-catch": "off",
        "skapxd/result-error-requires-handling": "off",
        "skapxd/result-error-requires-modeling": "off",
      },
    },
  ] satisfies OpinionatedConfigList;
}
