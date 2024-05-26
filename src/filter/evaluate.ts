import { Conjunction, GroupLikeNode, LogicalGroup, Negation, Node, NodeType, Term, TermLikeNode } from '../types/ast';
import {
  isConjunction,
  isGroupLike,
  isNegation,
  isRegexp,
  isStringDataType,
  isTerm,
  isTermType,
  isWildcard,
} from '../types/guards';
import iterate from '../utils/iterate';
import { testRegexp, testString, testWildcard } from './test-value';

export function evaluateAST(node: Node, data: any[]): any[] {
  if (!node) return data;

  //console.log(node, data);

  if (isGroupLike(node)) {
    return evaluateLogicalGroup(node, data);
  } else if (isConjunction(node)) {
    return evaluateConjunction(node, data);
  } else if (isNegation(node)) {
    return evaluateNegation(node, data);
  } else if (isTermType(node)) {
    return evaluateTermLike(node, data);
  }

  console.error(`${node.type} can't be evaluated`);
  return data;
}

function evaluateLogicalGroup(node: GroupLikeNode, data: any[]) {
  let result: any[] = [];

  for (const subNode of node.flow) {
    const subResult = evaluateAST(subNode, data);
    result.push(...subResult.filter((r) => !result.includes(r)));
  }

  return result.sort((a, b) => data.indexOf(a) - data.indexOf(b));
}

function evaluateTermLike(node: TermLikeNode, data: any[]) {
  return data.filter((item) => matchTermLike(node, item));
}

function matchTermLike(node: TermLikeNode, item: any): boolean {
  function testValue(value: string): boolean {
    if (isTerm(node)) {
      return testString(value, node.value.value, isStringDataType(node) ? node.quoted : false);
    } else if (isRegexp(node)) {
      return testRegexp(value, node.value.value);
    } else if (isWildcard(node)) {
      return testWildcard(value, node.value.value);
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

function evaluateNegation(node: Negation, data: any[]) {
  const filteredData = evaluateAST(node.node, data);
  return data.filter((item: any) => !filteredData.includes(item));
}

function evaluateConjunction(node: Conjunction, data: any[]) {
  let result = data;
  for (const subNode of node.nodes) {
    result = evaluateAST(subNode, result);
  }
  return result;
}
