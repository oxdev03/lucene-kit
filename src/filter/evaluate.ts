import {
  Conjunction,
  GroupLikeNode,
  Negation,
  Node,
  RangeNode,
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
import QueryParser from './query';
import ReferenceResolver from './resolver';
import { testRangeNode, testRegexp, testString, testWildcard } from './test-value';

export class ASTEvaluator {
  constructor(private readonly ast: Node, private readonly resolver?: ReferenceResolver) {}

  evaluate<T = any>(data: T[]): T[] {
    return this.evaluateAST(this.ast, data);
  }

  private evaluateAST<T = any>(node: Node, data: T[]): T[] {
    if (!node) return data;

    //console.log(node, data);

    if (isGroupLike(node)) {
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

  private evaluateLogicalGroup<T = any>(node: GroupLikeNode, data: any[]): T[] {
    let result: any[] = [];

    for (const subNode of node.flow) {
      const subResult = this.evaluateAST(subNode, data);
      result.push(...subResult.filter((r) => !result.includes(r)));
    }

    return result.sort((a, b) => data.indexOf(a) - data.indexOf(b));
  }

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

  private evaluateInnerVariable(node: FieldValueVariable): FieldValue<any> {
    const resolved = this.resolver!.resolveVariable(node);
    return {
      type: 'value',
      value: resolved,
    };
  }

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
      const query = resolved instanceof QueryParser ? resolved.toAST() : resolvedNode;
      return [resolved?.resolved ? query : undefined, resolved?.data || data];
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

  private evaluateTermLike<T = any>(node: TermLikeNode, data: any[]): T[] {
    return data.filter((item) => this.matchTermLike(node, item));
  }

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

  private evaluateNegation<T = any>(node: Negation, data: any[]): T[] {
    const filteredData = this.evaluateAST(node.node, data);
    return data.filter((item: any) => !filteredData.includes(item));
  }

  private evaluateConjunction<T = any>(node: Conjunction, data: any[]): T[] {
    let result = data;
    for (const subNode of node.nodes) {
      result = this.evaluateAST(subNode, result);
    }
    return result;
  }
}
