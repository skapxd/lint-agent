import { createAstroConfigs } from "./astro";
import { createNestConfigs } from "./nest";
import { createNextConfigs } from "./next";
import { createSharedConfigs, rules, strictConfig } from "./shared";

declare const __PKG_VERSION__: string;

type RuleEntry = [string, Record<string, unknown>];

type OpinionatedFlatConfig = {
  files: string[];
  languageOptions: Record<string, unknown>;
  linterOptions: Record<string, unknown>;
  name: string;
  plugins: Record<string, unknown>;
  rules: Record<string, RuleEntry>;
};

type OpinionatedConfigList = OpinionatedFlatConfig[];

type SharedConfigs = Record<
  "backend" | "base" | "frontend" | "package",
  OpinionatedFlatConfig
>;

type PluginConfigs = SharedConfigs & {
  astro: OpinionatedConfigList;
  nest: OpinionatedConfigList;
  next: OpinionatedConfigList;
  shared: SharedConfigs;
  strict: OpinionatedFlatConfig;
};

type Plugin = {
  configs: PluginConfigs;
  meta: {
    name: string;
    version: string;
  };
  rules: typeof rules;
};

const plugin: Plugin = {
  configs: {} as PluginConfigs,
  meta: {
    name: "@skapxd/eslint-opinionated",
    version: __PKG_VERSION__,
  },
  rules,
};

const sharedConfigs = createSharedConfigs(plugin);
const nestConfigs = createNestConfigs(plugin);
const nextConfigs = createNextConfigs(plugin);
const astroConfigs = createAstroConfigs(plugin);

plugin.configs = {
  ...(sharedConfigs as unknown as SharedConfigs),
  astro: astroConfigs as unknown as OpinionatedConfigList,
  nest: nestConfigs as unknown as OpinionatedConfigList,
  next: nextConfigs as unknown as OpinionatedConfigList,
  shared: sharedConfigs as unknown as SharedConfigs,
  strict: strictConfig as unknown as OpinionatedFlatConfig,
} satisfies PluginConfigs;

export const configs = plugin.configs;
export { rules };
export default plugin;
