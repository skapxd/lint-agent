import type { TSESTree } from "@typescript-eslint/utils";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { getTypeReferenceName } from "#/utils/typescript/get-type-reference-name";
import { isClassDecoratedBySkapxdNest } from "#/utils/nest/is-class-decorated-by-skapxd-nest";
import { resolveClassDeclarationOfNode } from "#/utils/nest/resolve-class-declaration-of-node";

const primitiveReturnTypes = new Set([
  "TSStringKeyword",
  "TSNumberKeyword",
  "TSBooleanKeyword",
]);

type NestControllerDtoReturnTypeOptions = {
  allowPrimitiveReturns: boolean;
  dtoDecoratorNames: string[];
  dtoDecoratorSource: string;
  streamReturnTypes: string[];
};

/**
 * ### Contrato de retorno DTO
 *
 * Esta regla separa dos politicas: los retornos directos conservan las exenciones historicas (`void`, primitivos y streams), pero una union representa variantes del mismo contrato HTTP y cada variante debe resolver a clase `@Dto`.
 *
 * ```ts
 * Promise<UserDto | AdminDto> // valido: ambas ramas son @Dto
 * Promise<UserDto | string> // invalido: la union ya no acepta primitivos sueltos
 * ```
 */
export function isAllowedNestControllerDtoReturnType(
  annotation: TSESTree.TypeNode,
  typeContext: TypeContext,
  options: NestControllerDtoReturnTypeOptions,
): boolean {
  function isDtoClassTypeReference(typeReference: TSESTree.TSTypeReference): boolean {
    const classDeclaration = resolveClassDeclarationOfNode(
      typeReference,
      typeContext,
    );
    if (!classDeclaration) {
      return false;
    }

    return isClassDecoratedBySkapxdNest(
      classDeclaration.declaration,
      typeContext,
      options.dtoDecoratorNames,
      options.dtoDecoratorSource,
    );
  }

  function isAllowedDtoOnlyType(typeNode: TSESTree.TypeNode): boolean {
    const isArrayType = typeNode.type === "TSArrayType";
    if (isArrayType) {
      return isAllowedDtoOnlyType(typeNode.elementType);
    }

    const isUnionType = typeNode.type === "TSUnionType";
    if (isUnionType) {
      return typeNode.types.every((memberType) =>
        isAllowedDtoOnlyType(memberType),
      );
    }

    const isNotTypeReference = typeNode.type !== "TSTypeReference";
    if (isNotTypeReference) {
      return false;
    }

    const typeName = getTypeReferenceName(typeNode.typeName);
    const isPromiseOrArrayWrapper = typeName === "Promise" || typeName === "Array";
    if (!isPromiseOrArrayWrapper) {
      return isDtoClassTypeReference(typeNode);
    }

    const wrappedType = typeNode.typeArguments?.params[0];
    if (!wrappedType) {
      return false;
    }

    return isAllowedDtoOnlyType(wrappedType);
  }

  function isAllowedReturnType(typeNode: TSESTree.TypeNode): boolean {
    const isArrayType = typeNode.type === "TSArrayType";
    if (isArrayType) {
      return isAllowedReturnType(typeNode.elementType);
    }

    const isUnionType = typeNode.type === "TSUnionType";
    if (isUnionType) {
      return typeNode.types.every((memberType) =>
        isAllowedDtoOnlyType(memberType),
      );
    }

    const isVoidReturnType = typeNode.type === "TSVoidKeyword";
    if (isVoidReturnType) {
      return true;
    }

    const isPrimitiveReturnType = primitiveReturnTypes.has(typeNode.type);
    if (isPrimitiveReturnType) {
      return options.allowPrimitiveReturns;
    }

    const isNotTypeReference = typeNode.type !== "TSTypeReference";
    if (isNotTypeReference) {
      return false;
    }

    const typeName = getTypeReferenceName(typeNode.typeName);
    const isPromiseOrArrayWrapper = typeName === "Promise" || typeName === "Array";
    const isStreamReturnType = Boolean(
      typeName &&
        options.streamReturnTypes.includes(typeName),
    );
    if (isStreamReturnType) {
      return true;
    }

    if (!isPromiseOrArrayWrapper) {
      return isDtoClassTypeReference(typeNode);
    }

    const wrappedType = typeNode.typeArguments?.params[0];
    if (!wrappedType) {
      return false;
    }

    return isAllowedReturnType(wrappedType);
  }

  return isAllowedReturnType(annotation);
}
