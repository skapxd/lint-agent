import { createAstroConfigs } from "./astro";
import { createNextConfigs } from "./next";
import { createSharedConfigs, rules, strictConfig } from "./shared";

const plugin = {
  // Diccionario dinámico de configs (cada entrada es un flat config o un array
  // de ellos). Se tipa laxo, como es convención en los plugins de ESLint, para
  // que `skapxd.configs.<preset>` sea accesible desde el config del consumidor.
  configs: {} as Record<string, any>,
  meta: {
    name: "@skapxd/eslint-opinionated",
    version: "0.7.0",
  },
  rules,
};

const sharedConfigs = createSharedConfigs(plugin);
const nextConfigs = createNextConfigs(plugin);
const astroConfigs = createAstroConfigs(plugin);

plugin.configs = {
  ...sharedConfigs,
  astro: astroConfigs,
  next: nextConfigs,
  shared: sharedConfigs,
  strict: strictConfig,
};

export const configs = plugin.configs;
export { rules };
export default plugin;
