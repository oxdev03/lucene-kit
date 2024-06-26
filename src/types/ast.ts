/*
 * This file includes the node types that was adapted from @terascope/teraslice.
 * The original node types implementation can be found at https://github.com/terascope/teraslice/blob/master/packages/xlucene-parser.
 *
 * Copyright (c) 2018
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  value: FieldValue<any>;
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
