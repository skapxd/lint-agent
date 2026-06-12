type TreeChildLinesInput = {
  indent?: string;
  names: readonly string[];
};

export function getTreeChildLines({ indent = "", names }: TreeChildLinesInput) {
  return names.map((name: string, index: number) => {
    const branch = index === names.length - 1 ? "└──" : "├──";

    return `${indent}${branch} ${name}`;
  });
}
