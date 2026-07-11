export function formatLayerList(layers: readonly string[]) {
  return layers.length > 0
    ? layers.map((layer) => `\`${layer}\``).join(", ")
    : "ninguna capa";
}
