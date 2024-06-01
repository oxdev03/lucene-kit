import * as i from './ast';

function _getType(node: unknown): i.NodeType | undefined {
  if (!node || typeof node !== 'object') return;
  return (node as any).type || undefined;
}

export function isLogicalGroup(node: unknown): node is i.LogicalGroup {
  return _getType(node) === i.NodeType.LogicalGroup;
}

export function isConjunction(node: unknown): node is i.Conjunction {
  return _getType(node) === i.NodeType.Conjunction;
}

export function isNegation(node: unknown): node is i.Negation {
  return _getType(node) === i.NodeType.Negation;
}

export function isFieldGroup(node: unknown): node is i.FieldGroup {
  return _getType(node) === i.NodeType.FieldGroup;
}

export function isRange(node: unknown): node is i.Range {
  return _getType(node) === i.NodeType.Range;
}

export function isFunctionNode(node: unknown): node is i.FunctionNode {
  return _getType(node) === i.NodeType.Function;
}

export function isRegexp(node: unknown): node is i.Regexp {
  return _getType(node) === i.NodeType.Regexp;
}

export function isWildcard(node: unknown): node is i.Wildcard {
  return _getType(node) === i.NodeType.Wildcard;
}

export function isVariableNode(node: unknown): node is i.VariableNode {
  return isTerm(node) && node?.value?.type == 'variable';
}

export function isWildCardString(term) {
  if (typeof term !== 'string') return false;
  if (term.includes('*') || term.includes('?')) return true;
  return false;
}

export function isWildcardField(node: unknown): boolean {
  return !!(node && isWildCardString((node as any).field));
}

export function isTerm(node: unknown): node is i.Term {
  return _getType(node) === i.NodeType.Term;
}

export function isTermList(node: unknown): node is i.TermList {
  return _getType(node) === i.NodeType.TermList;
}

export function isEmptyNode(node: unknown): node is i.EmptyNode {
  return _getType(node) === i.NodeType.Empty;
}

export function isStringDataType(node: any): node is i.StringDataType {
  return !!(node && typeof node?.value?.value === 'string');
}

export function isBooleanDataType(node: unknown): node is i.BooleanDataType {
  return !!(node && (node as any).field_type === 'boolean');
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

export function isTermType(node: unknown): node is i.TermLikeNode {
  return !!(node && termTypes.includes((node as any).type));
}

export const groupTypes: i.NodeType[] = [i.NodeType.LogicalGroup, i.NodeType.FieldGroup];

export function isGroupLike(node: unknown): node is i.GroupLikeNode {
  return !!(node && groupTypes.includes((node as any).type));
}
