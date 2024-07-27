import { RangeOperator } from '../types/ast';
import { FlatType } from '../types/data';
import { isWildCardString } from '../types/guards';

const MAX_TIMESTAMP = 8.64e15;

/**
 * Tests if a value matches a string or number filter.
 * @param value The value to test.
 * @param filter The filter to match against.
 * @param quoted whether it should be a strict message.
 * @returns True if the value matches the filter, otherwise false.
 */
export function testString(value: FlatType, filter: string | number | boolean, quoted: boolean): boolean {
  if (quoted) {
    return String(value) == String(filter);
  } else if (value instanceof Date) {
    return value.toLocaleString().includes(new Date(String(filter)).toLocaleString());
  } else {
    return String(value).toLocaleLowerCase().includes(String(filter).toLowerCase());
  }
}

/**
 * Tests if a value matches a regular expression filter.
 * @param value The value to test.
 * @param filter The regular expression filter.
 * @returns True if the value matches the filter, otherwise false.
 */
export function testRegexp(value: FlatType, filter: RegExp) {
  if (value == undefined || value == null) {
    return false;
  }
  return filter.test(String(value));
}

/**
 * Tests if a value matches a wildcard filter.
 * @param value The value to test.
 * @param filter The wildcard filter.
 * @returns True if the value matches the wildcard filter, otherwise false.
 */
export function testWildcard(value: FlatType, filter: string): boolean {
  const regexPattern = escapeRegExp(filter).replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);
  return testRegexp(value, regex);
}

/**
 * Tests if a value matches a range filter.
 * @param operator The range operator.
 * @param value The value to test.
 * @param filter The filter to compare against.
 * @returns True if the value matches the range filter, otherwise false.
 */
export function testRangeNode(
  operator?: RangeOperator,
  value?: FlatType,
  filter?: string | number | boolean | undefined | null,
) {
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

/**
 * Compares two values of possibly different types.
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @param falseValue The value to return if comparison is not applicable.
 * @returns -1 if a < b, 0 if a == b, 1 if a > b, or the falseValue if comparison is not applicable.
 */
function compareValues(a: FlatType, b: FlatType, falseValue: number): number {
  if (typeof a === 'number') {
    return a - Number(b);
  } else if (typeof b === 'string' && isWildCardString(b)) {
    return testWildcard(a, b) ? 0 : -1;
  } else if (a instanceof Date) {
    return a.getTime() - new Date(b == Infinity ? MAX_TIMESTAMP : String(b)).getTime();
  } else if (typeof b === 'boolean' || typeof a === 'boolean') {
    return a == b ? 1 : 0;
  } else if (typeof a === 'string') {
    return a.localeCompare(String(b));
  } else {
    return falseValue;
  }
}

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param str The string to escape.
 * @returns The escaped string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
