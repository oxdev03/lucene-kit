import { Conjunction, LogicalGroup, Negation, Node, NodeType, Term } from '../../types/ast';
import { isConjunction, isLogicalGroup, isNegation, isTerm } from '../../types/guards';

export function evaluateAST(node: Node, data: any[]): any[] {
  if (!node) return data;

  //console.log(node, data);

  if (isLogicalGroup(node)) {
    return evaluateLogicalGroup(node, data);
  } else if (isConjunction(node)) {
    return evaluateConjunction(node, data);
  } else if (isNegation(node)) {
    return evaluateNegation(node, data);
  } else if (isTerm(node)) {
    return evaluateTerm(node, data);
  }

  console.error(`${node.type} can't be evaluated`);
  return data;
}

function evaluateLogicalGroup(node: LogicalGroup, data: any[]) {
  let result: any[] = [];

  for (const subNode of node.flow) {
    const subResult = evaluateAST(subNode, data);
    result.push(...subResult.filter((r) => !result.includes(r)));
  }

  return result.sort((a, b) => data.indexOf(a) - data.indexOf(b));
}

function evaluateTerm(node: Term, data: any[]) {
  return data.filter((item) => {
    return matchTerm(node, item);
  });
}

function matchTerm(term: Term, item: any) {
  if (term.field && item[term.field] != null) {
    if (Array.isArray(item[term.field])) {
      return item[term.field].includes(term.value.value);
    } else {
      return item[term.field] == term.value.value;
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
