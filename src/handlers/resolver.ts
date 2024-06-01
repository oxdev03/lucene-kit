import { FieldValueVariable, FunctionNode, VariableNode } from '../types/ast';
import { FlatType } from '../types/data';
import QueryParser from '../xlucene';

/**
 * return type of a variable resolver, which can be a FlatType or a QueryParser instance.
 */
type VariableResolverReturnType = FlatType | QueryParser;

/**
 * a mapping from variable names to resolver functions or resolved values.
 */
export type VariableResolver = {
  [name: string]:
    | ((node: VariableNode | FieldValueVariable) => VariableResolverReturnType)
    | VariableResolverReturnType;
};

/**
 * the return type of a function resolver, which can be a FlatType, a QueryParser instance,
 * or an object containing resolved value and filtered data.
 */
export type FunctionResolverReturnType<T> =
  | FlatType
  | QueryParser
  | {
      resolved?: VariableResolverReturnType;
      data?: T;
    };

/**
 * a callback function for resolving functions, taking a function node and filtered data,
 * and returning the resolved value or an object containing resolved value and filtered data.
 */
export type FunctionResolverCallBack<T> = (node: FunctionNode, data: T) => FunctionResolverReturnType<T>;

/**
 * a function resolver, a mapping from function names to resolver callback functions.
 */
export type FunctionResolver = {
  [name: string]: FunctionResolverCallBack<any>;
};

/**
 * A class for resolving references, including variables and functions.
 */
export default class ReferenceResolver {
  private variablesResolver: VariableResolver = {};
  private functionResolver: FunctionResolver = {};

  /**
   * Creates an instance of ReferenceResolver.
   * @param variablesResolver The variable resolver mapping.
   * @param functionResolver The function resolver mapping.
   */
  constructor(variablesResolver: VariableResolver = {}, functionResolver: FunctionResolver = {}) {
    this.variablesResolver = variablesResolver;
    this.functionResolver = functionResolver;
  }

  /**
   * Adds a variable resolver to the resolver mapping.
   * @param name The name of the variable.
   * @param resolver The resolver function or resolved value.
   * @returns The ReferenceResolver instance for chaining.
   */
  addVariableResolver(name: string, resolver: VariableResolver['']): this {
    this.variablesResolver[name] = resolver;
    return this;
  }

  /**
   * Adds a function resolver to the resolver mapping.
   * @param name The name of the function.
   * @param resolver The callback function for resolving the function.
   * @returns The ReferenceResolver instance for chaining.
   */
  addFunctionResolver(name: string, resolver: FunctionResolverCallBack<any>): this {
    this.functionResolver[name] = resolver;
    return this;
  }

  /**
   * Resolves a variable node to its value using the variable resolver mapping.
   * @param node The variable node to resolve.
   * @returns The resolved value.
   */
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

  /**
   * Resolves a function node to its value using the function resolver mapping.
   * @param node The function node to resolve.
   * @param data Additional data to pass to the resolver.
   * @returns The resolved value or an object containing resolved value and additional data.
   */
  resolveFunction<T = any>(node: FunctionNode, data: T): FunctionResolverReturnType<T> {
    const funcName = node.name;
    const resolver = this.functionResolver[funcName];
    if (funcName && resolver !== undefined) {
      return resolver(node, data);
    } else {
      return undefined;
    }
  }
}
