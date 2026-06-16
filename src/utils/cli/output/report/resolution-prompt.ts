export const baseResolutionPrompt = [
  "como resolver: arregla las reglas en el orden listado, de arriba hacia abajo.",
  "- [premisa]: arreglala primero; desbloquea o reduce reglas dependientes.",
  "- [bloqueada por: X]: no la toques hasta resolver X.",
  "- sin marca: regla independiente; resuelvela cuando convenga.",
  "lee cada mensaje de hallazgo: ahi esta el fix exacto que espera la regla.",
].join("\n");
