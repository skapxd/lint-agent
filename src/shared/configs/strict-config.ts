// Config endurecida: ignora TODOS los comentarios `eslint-disable` (y demás
// directivas inline) en los archivos que cubre. Así ni una persona ni un agente
// pueden saltarse una regla con `// eslint-disable-next-line`.
export const strictConfig = {
  linterOptions: {
    noInlineConfig: true,
  },
  name: "skapxd/strict",
};
