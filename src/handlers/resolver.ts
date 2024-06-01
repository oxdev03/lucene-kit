import { FieldValue, FieldValueVariable, FunctionNode, VariableNode } from '../types/ast';
import { FlatType } from '../types/data';
import QueryParser from '../xlucene';

type VariableResolverReturnType = FlatType | QueryParser;
export type FunctionResolverReturnType<T> =
  | FlatType
  | QueryParser
  | {
      resolved?: FlatType | QueryParser;
      data?: T;
    };

export type VariableResolver = {
  [name: string]:
    | ((node: VariableNode | FieldValueVariable) => VariableResolverReturnType)
    | VariableResolverReturnType;
};

export type FunctionResolverCallBack<T> = (node: FunctionNode, data: T) => FunctionResolverReturnType<T>

export type FunctionResolver = {
  [name: string]: FunctionResolverCallBack<any>;
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

  addFunctionResolver(name: string, resolver: FunctionResolverCallBack<any>): ReferenceResolver {
    this.functionResolver[name] = resolver;
    return this;
  }

  resolveVariable(node: VariableNode | FieldValueVariable): VariableResolverReturnType {
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

  resolveFunction<T = any>(node: FunctionNode, data: T): FunctionResolverReturnType<T> {
    const funcName = node.name;
    const resolver = this.functionResolver[funcName];
    if (funcName && resolver !== undefined) {
      return resolver(node, data);
    }

    return undefined;
  }
}
