import { Conjunction, LogicalGroup, Negation, Node, NodeType, Term, TermLikeNode } from '../types/ast';
import {
  isConjunction,
  isLogicalGroup,
  isNegation,
  isRegexp,
  isStringDataType,
  isTerm,
  isTermType,
} from '../types/guards';
import { testRegexp, testString } from './test-value';

export function evaluateAST(node: Node, data: any[]): any[] {
  if (!node) return data;

  //console.log(node, data);

  if (isLogicalGroup(node)) {
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

function evaluateLogicalGroup(node: LogicalGroup, data: any[]) {
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
    }

    return false;
  }

  // Check if the field is specified and exists in the item
  if (node.field && typeof item === 'object' && item[node.field] != null) {
    const fields = node.field.split('.'); // Support nested fields
    let fieldValue = item;
    for (const field of fields) {
      if (fieldValue[field] != null) {
        fieldValue = fieldValue[field];
      } else {
        return false; // Field does not exist
      }
    }

    // If the field value is an array, check each element
    if (Array.isArray(fieldValue)) {
      return fieldValue.some(testValue); // Support field inside array
    } else {
      return testValue(fieldValue);
    }
  }

  // If the field is not specified or doesn't exist, iterate over the whole item
  if (typeof item === 'object') {
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        if (testValue(item[key])) {
          return true;
        }
      }
    }
  } else {
    // Handle cases where item is a primitive type like string, number, etc.
    return testValue(item);
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
