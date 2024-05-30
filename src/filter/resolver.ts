import { VariableNode } from "../types/ast";
import { FlatType } from "../types/data";
import QueryParser from "./query";

type ResolverReturnType = FlatType | QueryParser;

type VariableResolver = {
  [name: string]: ((node: VariableNode) => ResolverReturnType ) | ResolverReturnType;
};

type FunctionResolver = {
  [name: string]: ((params: { [key: string]: any }) => ResolverReturnType) | ((...args: any[]) => ResolverReturnType);
};

export default class ReferenceResolver {
  private variablesResolver: VariableResolver = {};
  private functionResolver: FunctionResolver = {};

  constructor(variablesResolver: VariableResolver = {}, functionResolver: FunctionResolver = {}) {
    this.variablesResolver = variablesResolver;
    this.functionResolver = functionResolver;
  }

  addVariableResolver(name: string, resolver: VariableResolver['']) {
    this.variablesResolver[name] = resolver;
  }

  addFunctionResolver(name: string, resolver: FunctionResolver['']) {
    this.functionResolver[name] = resolver;
  }
}
