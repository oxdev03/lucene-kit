import {
  Conjunction,
  GroupLikeNode,
  Negation,
  Node,
  Range,
  Term,
  TermLikeNode,
  VariableNode,
  FunctionNode,
  FieldValue,
  FieldValueVariable,
  NodeType,
} from '../types/ast';
import { FlatType } from '../types/data';
import {
  isConjunction,
  isEmptyNode,
  isFunctionNode,
  isGroupLike,
  isNegation,
  isRange,
  isRegexp,
  isStringDataType,
  isTerm,
  isTermList,
  isTermType,
  isVariableNode,
  isWildcard,
} from '../types/guards';
import iterate from '../utils/iterate';
import QueryParser from '../xlucene';
import ReferenceResolver from './resolver';
import { testRangeNode, testRegexp, testString, testWildcard } from '../filter/test-value';

/**
 * Class for evaluating an abstract syntax tree (AST).
 * Currently used for filtering data
 */
export class ASTEvaluator {
  /**
   * Creates an instance of ASTEvaluator.
   * @param ast The abstract syntax tree (AST) to evaluate.
   * @param resolver Optional reference resolver to resolve variables and functions.
   */
  constructor(
    private readonly ast: Node,
    private readonly resolver?: ReferenceResolver,
  ) {}

  /**
   * Evaluates the AST and filters the provided data.
   * @param data The data to filter based on the AST.
   * @returns The filter data.
   */
  evaluate<T = any>(data: T[]): T[] {
    return this.evaluateAST(this.ast, data);
  }

  /**
   * Recursively evaluates nodes in the AST.
   * @param node The current node to evaluate.
   * @param data The current data.
   * @returns The filtered data.
   * @private
   */
  private evaluateAST<T = any>(node: Node, data: T[]): T[] {
    if (!node) return data;

    if (isEmptyNode(node)) {
      return data;
    } else if (isGroupLike(node)) {
      return this.evaluateLogicalGroup(node, data);
    } else if (isConjunction(node)) {
      return this.evaluateConjunction(node, data);
    } else if (isNegation(node)) {
      return this.evaluateNegation(node, data);
    } else if (isVariableNode(node) && this.resolver) {
      return this.evaluateAST(this.evaluateVariable(node), data);
    } else if (isFunctionNode(node)) {
      const [query, filteredData] = this.evaluateFunctionNode(node, data);
      if (!query) {
        return filteredData;
      } else {
        return this.evaluateAST(query, data);
      }
    } else if (isTermType(node)) {
      return this.evaluateTermLike(node, data);
    }

    console.error(`${node.type} can't be evaluated`);
    return data;
  }

  /**
   * Evaluates a logical group node in the AST (OR, Field Group).
   * @param node The logical group or field group node to evaluate.
   * @param data The data to evaluate based on the AST.
   * @returns The filtered data.
   * @private
   */
  private evaluateLogicalGroup<T = any>(node: GroupLikeNode, data: any[]): T[] {
    const result: any[] = [];

    for (const subNode of node.flow) {
      const subResult = this.evaluateAST(subNode, data);
      result.push(...subResult.filter((r) => !result.includes(r)));
    }

    return result.sort((a, b) => data.indexOf(a) - data.indexOf(b));
  }

  /**
   * Evaluates a variable node in the AST.
   * @param node The variable node to evaluate.
   * @returns The a resolved node or a AST
   * @private
   */
  private evaluateVariable(node: VariableNode): Node {
    const resolved = this.resolver!.resolveVariable(node);

    if (resolved instanceof QueryParser) {
      return resolved.toAST();
    } else {
      const resolvedNode = { ...node } as Term;
      resolvedNode.value = {
        type: 'value',
        value: resolved,
      };
      return resolvedNode;
    }
  }

  /**
   * Evaluates an inner variable node in the AST.
   * @param node The inner variable node to evaluate.
   * @returns The resolved node.
   * @private
   */
  private evaluateInnerVariable(node: FieldValueVariable): FieldValue<any> {
    const resolved = this.resolver!.resolveVariable(node);
    return {
      type: 'value',
      value: resolved,
    };
  }

  /**
   * Evaluates a function node in the AST.
   * @param node The function node to evaluate.
   * @param data current data for filtering.
   * @returns The resolved node, AST or filtered data.
   * @private
   */
  private evaluateFunctionNode<T = any>(node: FunctionNode, data: T): [Node | undefined, T] {
    const resolveVariableInTermList = (
      term: FieldValue<any> | FieldValue<any>[],
    ): FieldValue<any> | FieldValue<any>[] => {
      if (Array.isArray(term)) {
        return term.map(resolveVariableInTermList) as FieldValue<any>[];
      } else if (term.type === 'variable') {
        return this.evaluateInnerVariable(term);
      } else {
        return term;
      }
    };

    // resolve parameters which use variable
    //@ts-expect-error
    node.params = node.params.map((p) => {
      if (isVariableNode(p)) {
        return this.evaluateVariable(p);
      } else if (isTermList(p)) {
        //@ts-expect-error
        p.value = p.value.map((v) => resolveVariableInTermList(v));
      }
      return p;
    });

    const resolved = this.resolver!.resolveFunction(node, data);

    const resolvedNode: Term = {
      type: NodeType.Term,
      field: node.field,
      value: {
        type: 'value',
        value: resolved,
      },
    };

    if (resolved instanceof QueryParser) {
      return [resolved.toAST(), data];
    } else if (typeof resolved == 'object' && !(resolved instanceof Date) && (resolved?.resolved || resolved?.data)) {
      const query =
        resolved?.resolved instanceof QueryParser
          ? resolved?.resolved.toAST()
          : {
              ...resolvedNode,
              value: {
                type: 'value',
                value: resolved.resolved,
              },
            };
      return [resolved?.resolved ? query : undefined, resolved?.data == undefined ? data : resolved.data];
    } else {
      const resolvedNode: Term = {
        type: NodeType.Term,
        field: node.field,
        value: {
          type: 'value',
          value: resolved,
        },
      };
      return [resolvedNode, data];
    }
  }

  /**
   * Evaluates a term-like node in the AST.
   * @param node The term-like node to evaluate.
   * @param data The current data to filter based on the AST.
   * @returns The filtered data.
   * @private
   */
  private evaluateTermLike<T = any>(node: TermLikeNode, data: any[]): T[] {
    return data.filter((item) => this.matchTermLike(node, item));
  }

  /**
   * Determines if a term-like node matches a given item in the data.
   * @param node The term-like node to match.
   * @param item The item from the data to match against.
   * @returns True if the node matches the item, otherwise false.
   * @private
   */
  private matchTermLike(node: TermLikeNode, item: any): boolean {
    const testValue = (value: FlatType): boolean => {
      if (isTerm(node)) {
        return testString(value, node.value.value, isStringDataType(node) ? node.quoted : false);
      } else if (isRegexp(node)) {
        return testRegexp(value, node.value.value);
      } else if (isWildcard(node)) {
        return testWildcard(value, node.value.value);
      } else if (isRange(node)) {
        const left = (isVariableNode(node.left) ? this.evaluateVariable(node.left) : node.left) as Range['left'];
        const right = (isVariableNode(node.right) ? this.evaluateVariable(node.right) : node.right) as Range['right'];
        return (
          testRangeNode(left.operator, value, left.value.value) &&
          testRangeNode(right?.operator, value, right?.value?.value)
        );
      }

      return false;
    };

    for (const [_field, value] of iterate(item, node.field || '')) {
      if (testValue(value)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluates a negation node in the AST (NOT, !).
   * @param node The negation node to evaluate.
   * @param data The current data to filter based on the AST.
   * @returns The filtered data.
   * @private
   */
  private evaluateNegation<T = any>(node: Negation, data: any[]): T[] {
    const filteredData = this.evaluateAST(node.node, data);
    return data.filter((item: any) => !filteredData.includes(item));
  }

  /**
   * Evaluates a conjunction node in the AST (AND).
   * @param node The conjunction node to evaluate.
   * @param data The current data to filter based on the AST.
   * @returns The filtered data.
   * @private
   */
  private evaluateConjunction<T = any>(node: Conjunction, data: any[]): T[] {
    let result = data;
    for (const subNode of node.nodes) {
      result = this.evaluateAST(subNode, result);
    }
    return result;
  }
}
