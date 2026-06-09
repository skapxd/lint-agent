// @ts-nocheck
export const noTryCatch = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe try/catch; usa trySafe de @skapxd/result para modelar el error como Result.",
    },
    messages: {
      noTryCatch:
        "Usa `trySafe` de @skapxd/result en lugar de try/catch. El error queda modelado como Result en vez de saltar como excepcion.",
    },
    schema: [],
  },
  create(context) {
    return {
      TryStatement(node) {
        context.report({
          messageId: "noTryCatch",
          node,
        });
      },
    };
  },
};
