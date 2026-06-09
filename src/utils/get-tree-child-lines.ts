// @ts-nocheck
export function getTreeChildLines({ indent = "", names }) {
  return names.map((name, index) => {
    const branch = index === names.length - 1 ? "└──" : "├──";

    return `${indent}${branch} ${name}`;
  });
}
