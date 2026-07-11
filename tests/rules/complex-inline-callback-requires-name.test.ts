import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "complex-inline-callback-requires-name",
  rules["complex-inline-callback-requires-name"]!,
  {
    invalid: [
      {
        code: `const units = rootUnits.filter(
  (unit, index) =>
    unit.kind === "class" ||
    !overloadNames.has(unit.name) ||
    rootUnits.findIndex(
      (candidate) =>
        candidate.kind === "function" && candidate.name === unit.name,
    ) === index,
);`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: "items.filter((item) => item.active || item.visible || item.pinned);",
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `transaction((tx) => {
  if (tx.needsInsert) tx.insert();
  return tx.ready ? tx.commit() : tx.rollback();
});`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `new Promise((resolve) => {
  if (ready) resolve(value);
  return failed ? resolve(null) : undefined;
});`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `run(function named(value) {
  if (value.active) return value;
  return value.visible ? value : null;
});`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `outer((value) => {
  if (value.active) value.open();
  inner((candidate) => candidate.active || candidate.visible || candidate.pinned);
  return value.ready ? value : null;
});`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `items.map((item) => {
  switch (item.kind) {
    case "first": return 1;
    case "second": return 2;
    default: return 0;
  }
});`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `run(() => {
  for (;;) break;
  for (const key in value) consume(key);
});`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `run(() => {
  for (const item of items) consume(item);
  while (ready) wait();
});`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `run(() => {
  do work(); while (ready);
  try { work(); } catch (error) { recover(error); }
});`,
        errors: [
          {
            data: { decisionCount: "2" },
            messageId: "complexInlineCallback",
          },
        ],
      },
      {
        code: `run(() => {
  ready &&= active;
  visible ||= pinned;
  selected ??= fallback;
});`,
        errors: [
          {
            data: { decisionCount: "3" },
            messageId: "complexInlineCallback",
          },
        ],
      },
    ],
    valid: [
      "items.map((item) => item.id);",
      "items.filter((item) => item.active && item.visible);",
      `function isRelevantItem(item) {
  if (item.active) return true;
  return item.visible ? true : false;
}
items.filter(isRelevantItem);`,
      `const storedCallback = (item) => {
  if (item.active) return true;
  return item.visible ? true : false;
};
items.filter(storedCallback);`,
      `const handlers = {
  select: (item) => {
    if (item.active) return true;
    return item.visible ? true : false;
  },
};`,
      {
        code: `const view = <Button onClick={() => {
  if (ready) submit();
  return failed ? retry() : undefined;
}} />;`,
        filename: "button.tsx",
      },
      `(function () {
  if (ready) return value;
  return failed ? null : value;
})();`,
      `items.filter((item) => {
  function nested(value) {
    if (value.active) return true;
    return value.visible ? true : false;
  }

  return nested(item);
});`,
      "items.map((item) => other.some((value) => value.active && value.visible));",
      `items.map((item) => {
  switch (item.kind) {
    default: return item;
  }
});`,
    ],
  },
);
