import { createAstroConfigs } from "./astro";
import { createNestConfigs } from "./nest";
import { createNextConfigs } from "./next";
import { createSharedConfigs, rules, strictConfig } from "./shared";

const plugin = {
  // Diccionario dinámico de configs (cada entrada es un flat config o un array
  // de ellos). Se tipa laxo, como es convención en los plugins de ESLint, para
  // que `skapxd.configs.<preset>` sea accesible desde el config del consumidor:
  // con `unknown`, spreadear `...skapxd.configs.backend.rules` no compila en
  // los eslint.config.ts de los consumidores. Excepción declarada, no trampa.
  // eslint-disable-next-line skapxd/no-explicit-any -- DX del consumidor: ver arriba
  configs: {} as Record<string, any>,
  meta: {
    name: "@skapxd/eslint-opinionated",
    version: "1.0.0",
  },
  rules,
};

const sharedConfigs = createSharedConfigs(plugin);
const nestConfigs = createNestConfigs(plugin);
const nextConfigs = createNextConfigs(plugin);
const astroConfigs = createAstroConfigs(plugin);

plugin.configs = {
  ...sharedConfigs,
  astro: astroConfigs,
  nest: nestConfigs,
  next: nextConfigs,
  shared: sharedConfigs,
  strict: strictConfig,
};

export const configs = plugin.configs;
export { rules };
export default plugin;
