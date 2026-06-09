// @ts-nocheck
export function isPromiseType(type, typeContext) {
  return typeContext.checker.getPromisedTypeOfPromise(type) !== undefined;
}
