import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { getUnverifiedCastOptions } from "#/utils/options/get-unverified-cast-options";
import type {
  RuleContext,
  RuleModule,
} from "#/utils/rule-authoring/rule-types";
import { wrapTseslintRule } from "#/utils/rule-authoring/wrap-tseslint-rule";

const unverifiedCastMessage =
  "El `as` que estrecha es el `!` con esteroides: afirma un tipo que nadie verifico, y las reglas type-aware construyen sobre esa mentira. Tres salidas con evidencia: un type predicate con chequeo real (`x is T` + cuerpo honesto), validacion en la frontera (class-validator/zod; en Nest ya lo exige nest-dto-requires-validation), o modela el tipo de origen para que el cast sobre. El `as unknown as X` no es excepcion: es la misma mentira con lavado de manos.";

const upstreamNoUnsafeTypeAssertion = wrapTseslintRule(
  "no-unsafe-type-assertion",
  {
    description:
      "Prohibe casts `as` que estrechan sin evidencia: el tipo nuevo debe venir de un guard, una validacion de frontera o un origen mejor modelado.",
    messages: {
      unsafeOfAnyTypeAssertion: unverifiedCastMessage,
      unsafeToAnyTypeAssertion: unverifiedCastMessage,
      unsafeToUnconstrainedTypeAssertion: unverifiedCastMessage,
      unsafeTypeAssertion: unverifiedCastMessage,
      unsafeTypeAssertionAssignableToConstraint: unverifiedCastMessage,
    },
  },
);

export const noUnverifiedCast: RuleModule = {
  ...upstreamNoUnsafeTypeAssertion,
  meta: {
    ...upstreamNoUnsafeTypeAssertion.meta,
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getUnverifiedCastOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(
      filename,
      options.allowFilePatterns,
    );
    if (isAllowedFilePattern) {
      return {};
    }

    return upstreamNoUnsafeTypeAssertion.create(context);
  },
};
