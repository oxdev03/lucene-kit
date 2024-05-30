import { RangeOperator } from '../types/ast';
import { isWildCardString } from '../types/guards';

type FlatType = string | number | undefined | boolean | null | Date;

export function testString(value: FlatType, filter: string | number, quoted: boolean): boolean {
  if (value == undefined || value == null) {
    return false;
  } else if (quoted) {
    return String(value) == filter;
  } else if (typeof filter == 'string') {
    return String(value).includes(filter);
  } else if (typeof filter == 'number' || typeof filter == 'boolean') {
    return value == filter;
  }

  throw new Error(`Test String ${value} with filter ${filter} not covered`);
}

export function testRegexp(value: FlatType, filter: RegExp) {
  if (value == undefined || value == null) {
    return false;
  }
  return filter.test(String(value));
}

export function testWildcard(value: FlatType, filter: string): boolean {
  const regexPattern = escapeRegExp(filter).replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);
  return testRegexp(value, regex);
}

export function testRangeNode(operator?: RangeOperator, value?: FlatType, filter?: string | number) {
  switch (operator) {
    case 'gte':
      return compareValues(value, filter, -1) >= 0;
    case 'gt':
      return compareValues(value, filter, -1) > 0;
    case 'lt':
      return compareValues(value, filter, 1) < 0;
    case 'lte':
      return compareValues(value, filter, 1) <= 0;
    default:
      return true;
  }
}

function compareValues(a: FlatType, b: FlatType, falseValue: number): number {
  if (typeof a === 'number') {
    return a - Number(b);
  } else if (typeof a === 'string') {
    return a.localeCompare(String(b));
  } else if (a instanceof Date) {
    return a.getTime() - new Date(String(b)).getTime();
  } else if (typeof b === 'boolean' || typeof a === 'boolean') {
    return a == b ? 1 : 0;
  } else if (typeof b === 'string' && isWildCardString(b)) {
    return testWildcard(a, b) ? 0 : -1;
  } else {
    return falseValue;
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
