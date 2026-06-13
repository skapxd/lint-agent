import type { Linter } from "eslint";
import type { RuleModule } from "#/utils/rule-authoring/rule-types";

export type OpinionatedPluginReference = {
  configs?: PluginConfigs;
  meta: {
    name: string;
    version: string;
  };
  rules: Record<string, RuleModule>;
};

export type OpinionatedRules = Record<string, Linter.RuleEntry | undefined>;

export type OpinionatedConfig = Omit<
  Linter.Config,
  "name" | "plugins" | "rules"
> & {
  name: string;
  plugins: Record<string, OpinionatedPluginReference>;
  rules: OpinionatedRules;
};
export type OpinionatedConfigList = OpinionatedConfig[];

export type OpinionatedStrictConfig = Omit<
  Linter.Config,
  "linterOptions" | "name"
> & {
  linterOptions: Linter.LinterOptions;
  name: string;
};

export type SharedConfigs = Record<
  "backend" | "base" | "frontend" | "package",
  OpinionatedConfig
>;

export type PluginConfigs = SharedConfigs & {
  astro: OpinionatedConfigList;
  nest: OpinionatedConfigList;
  next: OpinionatedConfigList;
  shared: SharedConfigs;
  strict: OpinionatedStrictConfig;
};
