export interface Node {
  type: NodeType;
}

export enum NodeType {
  LogicalGroup = 'logical-group',
  FieldGroup = 'field-group',
  Conjunction = 'conjunction',
  Negation = 'negation',
  Term = 'term',
  Exists = 'exists',
  Range = 'range',
  Regexp = 'regexp',
  Wildcard = 'wildcard',
  Empty = 'empty',
  Function = 'function',
  TermList = 'term-list',
}

export type GroupLikeType = NodeType.LogicalGroup | NodeType.FieldGroup;

export interface GroupLikeNode extends Node {
  type: GroupLikeType;
  flow: Conjunction[];
}

export interface Conjunction extends Node {
  type: NodeType.Conjunction;
  nodes: Node[];
}

export interface Negation extends Node {
  type: NodeType.Negation;
  node: Node;
}

export interface LogicalGroup extends GroupLikeNode {
  type: NodeType.LogicalGroup;
}

export interface FieldGroup extends GroupLikeNode {
  type: NodeType.FieldGroup;
  field: string;
}

export interface TermLikeNode extends Node {
  type: TermLikeType;
  field: Field;
  analyzed?: boolean;
}

export interface EmptyNode extends Node {
  type: NodeType.Empty;
}

export type FieldValue<T> = FieldValueValue<T> | FieldValueVariable;

export interface FieldValueValue<T> {
  type: 'value';
  value: T;
}

export interface FieldValueVariable {
  type: 'variable';
  scoped: boolean;
  value: string;
}

export type TermLikeType =
  | NodeType.Term
  | NodeType.Regexp
  | NodeType.Range
  | NodeType.Wildcard
  | NodeType.Function
  | NodeType.TermList;

export type Field = string | null;

export interface TermList extends TermLikeNode {
  type: NodeType.TermList;
  value: FieldValue<any>[];
}

export type RangeOperator = 'gte' | 'gt' | 'lt' | 'lte';

export interface Range extends TermLikeNode {
  type: NodeType.Range;
  left: RangeNode;
  right?: RangeNode;
  __range?: boolean;
}

export interface RangeNode {
  operator: RangeOperator;
  value: FieldValue<number | string>;
}

export interface Term extends AnyDataType, TermLikeNode {
  type: NodeType.Term;
}

export interface Regexp extends RegexpDataType, TermLikeNode {
  type: NodeType.Regexp;
}

export interface Wildcard extends StringDataType, TermLikeNode {
  type: NodeType.Wildcard;
}

export interface VariableNode extends TermLikeNode {
  value: FieldValueVariable;
}

export interface FunctionNode extends TermLikeNode {
  type: NodeType.Function;
  name: string;
  description?: string;
  params: (Term | TermList)[];
}

export interface AnyDataType {
  value: FieldValue<string | number | boolean | any>;
}

export interface NumberDataType {
  value: FieldValue<number>;
}

export interface StringDataType {
  value: FieldValue<string>;
  quoted: boolean;
  restricted?: boolean;
}

export interface RegexpDataType {
  value: FieldValueValue<RegExp>;
}

export interface BooleanDataType {
  value: FieldValue<boolean>;
}
