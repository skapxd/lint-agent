import { createAstroConfigs } from "./astro";
import { createNestConfigs } from "./nest";
import { createNextConfigs } from "./next";
import { createSharedConfigs, rules, strictConfig } from "./shared";
import type { OpinionatedPluginReference, PluginConfigs } from "./shared/configs";

declare const __PKG_VERSION__: string;

type Plugin = OpinionatedPluginReference & {
  configs: PluginConfigs;
};

type PluginInConstruction = Omit<Plugin, "configs"> & {
  configs?: PluginConfigs;
};

function attachPluginConfigs<
  TPlugin extends PluginInConstruction,
  TPluginConfigs extends PluginConfigs,
>(
  pluginReference: TPlugin,
  pluginConfigs: TPluginConfigs,
): asserts pluginReference is TPlugin & { configs: TPluginConfigs } {
  pluginReference.configs = pluginConfigs;
}

const plugin: PluginInConstruction = {
  meta: {
    name: "@skapxd/lint-agent",
    version: __PKG_VERSION__,
  },
  rules,
};

const sharedConfigs = createSharedConfigs(plugin);
const nestConfigs = createNestConfigs(plugin);
const nextConfigs = createNextConfigs(plugin);
const astroConfigs = createAstroConfigs(plugin);

const pluginConfigs = {
  ...sharedConfigs,
  astro: astroConfigs,
  nest: nestConfigs,
  next: nextConfigs,
  shared: sharedConfigs,
  strict: strictConfig,
} satisfies PluginConfigs;

attachPluginConfigs(plugin, pluginConfigs);

const completedPlugin = plugin satisfies Plugin;

export const configs = completedPlugin.configs;
export { rules };
export default completedPlugin;
