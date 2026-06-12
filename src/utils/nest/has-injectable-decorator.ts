import type { RuleNode, TypeContext } from "#/utils/rule-authoring/rule-types";
import ts from "typescript";
import { resolveAliasSymbol } from "#/utils/resolve-alias-symbol";

// ¿La clase a la que apunta este identifier está decorada con @Injectable?
// - true: pertenece al contenedor de DI — instanciarla a mano lo esquiva.
// - false: clase de valor (DTO, mapper, error) — el `new` es legítimo.
// - null: no se pudo resolver el símbolo hasta una declaración de clase.
export function hasInjectableDecorator(identifier: RuleNode, typeContext: TypeContext) {
  const symbol = typeContext.services.getSymbolAtLocation(identifier);

  if (!symbol) {
    return null;
  }

  const resolved = resolveAliasSymbol(symbol, typeContext);
  const declaration = (resolved.declarations ?? []).find((candidate: ts.Declaration) =>
    ts.isClassDeclaration(candidate),
  );

  if (!declaration) {
    return null;
  }

  const decorators = ts.canHaveDecorators(declaration)
    ? (ts.getDecorators(declaration) ?? [])
    : [];

  return decorators.some((decorator: ts.Decorator) => {
    const expression = decorator.expression;
    const callee = ts.isCallExpression(expression)
      ? expression.expression
      : expression;

    return ts.isIdentifier(callee) && callee.text === "Injectable";
  });
}
