// Detección por propiedad Unicode: Extended_Pictographic cubre los emojis y
// pictogramas (🚀, ✅, 😄) sin tocar símbolos de texto normales (→, ✓, ©).
const emojiPattern = /\p{Extended_Pictographic}/u;

export function containsEmoji(value: string) {
  return emojiPattern.test(value);
}
