import * as i from './ast';

function _getType(node: i.Node): i.NodeType | undefined {
  if (!node || typeof node !== 'object') return;
  return node.type || undefined;
}

export function isNode(node: unknown): node is i.Node {
  if (!node || typeof node !== 'object') return false;
  return node['type'] !== undefined;
}

export function isLogicalGroup(node: i.Node): node is i.LogicalGroup {
  return _getType(node) === i.NodeType.LogicalGroup;
}

export function isConjunction(node: i.Node): node is i.Conjunction {
  return _getType(node) === i.NodeType.Conjunction;
}

export function isNegation(node: i.Node): node is i.Negation {
  return _getType(node) === i.NodeType.Negation;
}

export function isFieldGroup(node: i.Node): node is i.FieldGroup {
  return _getType(node) === i.NodeType.FieldGroup;
}

export function isRange(node: i.Node): node is i.Range {
  return _getType(node) === i.NodeType.Range;
}

export function isFunctionNode(node: i.Node): node is i.FunctionNode {
  return _getType(node) === i.NodeType.Function;
}

export function isRegexp(node: i.Node): node is i.Regexp {
  return _getType(node) === i.NodeType.Regexp;
}

export function isWildcard(node: i.Node): node is i.Wildcard {
  return _getType(node) === i.NodeType.Wildcard;
}

export function isVariableNode(node: i.Node): node is i.VariableNode {
  return isTerm(node) && node?.value?.type == 'variable';
}

export function isWildCardString(term) {
  if (typeof term !== 'string') return false;
  if (term.includes('*') || term.includes('?')) return true;
  return false;
}

/* export function isWildcardField(node: i.Node): boolean {
  return !!(node && isWildCardString((node as any).field));
} */

export function isTerm(node: i.Node): node is i.Term {
  return _getType(node) === i.NodeType.Term;
}

export function isTermList(node: i.Node): node is i.TermList {
  return _getType(node) === i.NodeType.TermList;
}

export function isEmptyNode(node: i.Node): node is i.EmptyNode {
  return _getType(node) === i.NodeType.Empty;
}

export function isStringDataType(node: i.Term): node is i.StringDataType & i.Term {
  return !!(node && typeof node?.value?.value === 'string');
}

/** term level queries with field (string|null)  */
export const termTypes: readonly i.NodeType[] = [
  i.NodeType.Term,
  i.NodeType.Regexp,
  i.NodeType.Range,
  i.NodeType.Wildcard,
  i.NodeType.Function,
  i.NodeType.TermList,
];

export function isTermType(node: i.Node): node is i.TermLikeNode {
  return !!(node && termTypes.includes(node?.type));
}

export const groupTypes: i.NodeType[] = [i.NodeType.LogicalGroup, i.NodeType.FieldGroup];

export function isGroupLike(node: i.Node): node is i.GroupLikeNode {
  return !!(node && groupTypes.includes(node?.type));
}
