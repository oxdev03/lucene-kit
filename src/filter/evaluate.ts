import { Conjunction, GroupLikeNode, Negation, Node, TermLikeNode, VariableNode } from '../types/ast';
import { FlatType } from '../types/data';
import {
  isConjunction,
  isGroupLike,
  isNegation,
  isRange,
  isRegexp,
  isStringDataType,
  isTerm,
  isTermType,
  isVariableNode,
  isWildcard,
} from '../types/guards';
import iterate from '../utils/iterate';
import QueryParser from './query';
import { testRangeNode, testRegexp, testString, testWildcard } from './test-value';

export class ASTEvaluator {
  evaluateAST<T = any>(node: Node, data: T[]): T[] {
    if (!node) return data;

    //console.log(node, data);

    if (isGroupLike(node)) {
      return this.evaluateLogicalGroup(node, data);
    } else if (isConjunction(node)) {
      return this.evaluateConjunction(node, data);
    } else if (isNegation(node)) {
      return this.evaluateNegation(node, data);
    } else if (isVariableNode(node)) {
      return this.evaluateAST(this.evaluateVariable(node, data), data);
    } else if (isTermType(node)) {
      return this.evaluateTermLike(node, data);
    }

    console.error(`${node.type} can't be evaluated`);
    return data;
  }

  evaluateLogicalGroup<T = any>(node: GroupLikeNode, data: any[]): T[] {
    let result: any[] = [];

    for (const subNode of node.flow) {
      const subResult = this.evaluateAST(subNode, data);
      result.push(...subResult.filter((r) => !result.includes(r)));
    }

    return result.sort((a, b) => data.indexOf(a) - data.indexOf(b));
  }

  evaluateVariable(node: VariableNode, _: any[]): Node {
    const ast = new QueryParser('age:30').toAST();
    console.log(ast);
    return ast;
  }

  evaluateTermLike<T = any>(node: TermLikeNode, data: any[]): T[] {
    return data.filter((item) => this.matchTermLike(node, item));
  }

  matchTermLike(node: TermLikeNode, item: any): boolean {
    function testValue(value: FlatType): boolean {
      if (isTerm(node)) {
        return testString(value, node.value.value, isStringDataType(node) ? node.quoted : false);
      } else if (isRegexp(node)) {
        return testRegexp(value, node.value.value);
      } else if (isWildcard(node)) {
        return testWildcard(value, node.value.value);
      } else if (isRange(node)) {
        return (
          testRangeNode(node.left.operator, value, node.left.value.value) &&
          testRangeNode(node.right?.operator, value, node?.right?.value?.value)
        );
      }

      return false;
    }

    for (const [_field, value] of iterate(item, node.field || '')) {
      if (testValue(value)) {
        return true;
      }
    }

    return false;
  }

  evaluateNegation<T = any>(node: Negation, data: any[]): T[] {
    const filteredData = this.evaluateAST(node.node, data);
    return data.filter((item: any) => !filteredData.includes(item));
  }

  evaluateConjunction<T = any>(node: Conjunction, data: any[]): T[] {
    let result = data;
    for (const subNode of node.nodes) {
      result = this.evaluateAST(subNode, result);
    }
    return result;
  }
}
