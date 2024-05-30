import { FieldValue, FieldValueVariable, FunctionNode, VariableNode } from '../types/ast';
import { FlatType } from '../types/data';
import QueryParser from './query';

type ResolverReturnType = FlatType | QueryParser;

export type VariableResolver = {
  [name: string]: ((node: VariableNode | FieldValueVariable) => ResolverReturnType) | ResolverReturnType;
};

export type FunctionResolver = {
  [name: string]: (node: FunctionNode) => ResolverReturnType;
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

  resolveVariable(node: VariableNode | FieldValueVariable): ResolverReturnType {
    const varName = typeof node.value == 'object' ? node.value.value : node.value;
    const resolver = this.variablesResolver[varName];
    if (varName && resolver !== undefined) {
      if (typeof resolver == 'function') {
        return resolver(node);
      } else {
        return resolver;
      }
    }

    return undefined;
  }

  resolveFunction(node: FunctionNode): ResolverReturnType {
    const funcName = node.name;
    const resolver = this.functionResolver[funcName];
    if (funcName && resolver !== undefined) {
      return resolver(node);
    }

    return undefined;
  }
}
