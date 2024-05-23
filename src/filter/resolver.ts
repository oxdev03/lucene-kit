type VariableResolver = {
  [name: string]: ((node: any, ast: any) => string) | string;
};

type FunctionResolver = {
  [name: string]: ((params: { [key: string]: any }) => string) | ((...args: any[]) => string);
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
