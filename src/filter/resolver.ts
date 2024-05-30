import { VariableNode } from '../types/ast';
import { FlatType } from '../types/data';
import QueryParser from './query';

type ResolverReturnType = FlatType | QueryParser;

export type VariableResolver = {
  [name: string]: ((node: VariableNode) => ResolverReturnType) | ResolverReturnType;
};

export type FunctionResolver = {
  [name: string]: ((params: { [key: string]: any }) => ResolverReturnType) | ((...args: any[]) => ResolverReturnType);
};

export default class ReferenceResolver {
  private variablesResolver: VariableResolver = {};
  private functionResolver: FunctionResolver = {};

  constructor(variablesResolver: VariableResolver = {}, functionResolver: FunctionResolver = {}) {
    this.variablesResolver = variablesResolver;
    this.functionResolver = functionResolver;
  }

  addVariableResolver(name: string, resolver: VariableResolver['']): ReferenceResolver {
    this.variablesResolver[name] = resolver;
    return this;
  }

  addFunctionResolver(name: string, resolver: FunctionResolver['']): ReferenceResolver {
    this.functionResolver[name] = resolver;
    return this;
  }

  resolveVariable(node: VariableNode) : ResolverReturnType {
    const resolver =  this.variablesResolver[node.value.value]
    if(node.value.value && resolver !== undefined) {
      if(typeof resolver == 'function') {
        return resolver(node)
      } else {
        return resolver;
      }
    }

    return undefined;
  }
}
