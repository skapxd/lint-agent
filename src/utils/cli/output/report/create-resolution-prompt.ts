import { baseResolutionPrompt } from "./resolution-prompt";

type CreateResolutionPromptInput = {
  seed?: string | null;
};

export function createResolutionPrompt({ seed }: CreateResolutionPromptInput) {
  const hasSeed = seed !== null && seed !== undefined && seed.length > 0;

  if (!hasSeed) {
    return baseResolutionPrompt;
  }

  return `${baseResolutionPrompt}\ncierra este lote con \`--verify ${seed}\`; no cierres por conteo global.`;
}
