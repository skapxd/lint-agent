import type { LegacyAstNode } from "#/utils/rule-types";
export function toKebabCase(value: LegacyAstNode) {
  return value
    .replace(/OEmbed/g, "Oembed")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLocaleLowerCase();
}
