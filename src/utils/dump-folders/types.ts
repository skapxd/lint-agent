export type ContentSignalKind = "ast" | "identifier" | "import";

export type ContentSignalExamples = Record<ContentSignalKind, string[]>;

export type ContentSignature = {
  examples: ContentSignalExamples;
  keys: Set<string>;
};

export type DumpFolderInfo = {
  directSourceFileNames: string[];
  domainNames: string[];
  domainSignatures: Map<string, ContentSignature>;
};

export type DomainSuggestion = {
  message: string;
  suggestedDomain: string | null;
};
