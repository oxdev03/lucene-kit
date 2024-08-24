import { describe, it, expect } from 'vitest';
import { testString, testRegexp, testWildcard, testRangeNode } from '../../filter/test-value';

describe('testString', () => {
  it('should return true for exact matches when quoted is true', () => {
    expect(testString('test', 'test', true)).toBe(true);
    expect(testString(123, '123', true)).toBe(true);
  });

  it('should return false for non-exact matches when quoted is true', () => {
    expect(testString('test', 'testing', true)).toBe(false);
    expect(testString(123, '124', true)).toBe(false);
  });

  it('should return true for substring matches when quoted is false', () => {
    expect(testString('testing', 'test', false)).toBe(true);
    expect(testString(12_345, '234', false)).toBe(true);
  });

  it('should return false for non-matching substrings when quoted is false', () => {
    expect(testString('testing', 'xyz', false)).toBe(false);
    expect(testString(12_345, '678', false)).toBe(false);
  });

  it('should correctly compare boolean values', () => {
    expect(testString(true, true, false)).toBe(true);
    expect(testString(false, true, false)).toBe(false);
  });
});

describe('testRegexp', () => {
  it('should return true if the value matches the regex', () => {
    expect(testRegexp('abc123', /abc\d+/)).toBe(true);
    expect(testRegexp('123-456', /\d{3}-\d{3}/)).toBe(true);
  });

  it('should return false if the value does not match the regex', () => {
    expect(testRegexp('abcdef', /\d+/)).toBe(false);
    expect(testRegexp('123-456', /\d{4}/)).toBe(false);
  });

  it('should return false for undefined or null values', () => {
    expect(testRegexp(undefined, /abc/)).toBe(false);
    expect(testRegexp(null, /abc/)).toBe(false);
  });
});

describe('testWildcard', () => {
  it('should match a string with wildcard patterns', () => {
    expect(testWildcard('hello world', 'hello*')).toBe(true);
    expect(testWildcard('test123', 'test?23')).toBe(true);
    expect(testWildcard('test123', '*123')).toBe(true);
  });

  it('should not match a string if it does not fit the wildcard pattern', () => {
    expect(testWildcard('hello world', 'world*')).toBe(false);
    expect(testWildcard('test123', 'test?3')).toBe(false);
    expect(testWildcard('test123', 't3*3*')).toBe(false);
  });
});

describe('testRangeNode', () => {
  it('should handle greater than or equal to (gte) comparisons with numbers', () => {
    expect(testRangeNode('gte', 5, 5)).toBe(true);
    expect(testRangeNode('gte', 6, 5)).toBe(true);
    expect(testRangeNode('gte', 4, 5)).toBe(false);
    expect(testRangeNode('gte', 0, 0)).toBe(true);
    expect(testRangeNode('gte', -1, 0)).toBe(false);
  });

  it('should handle greater than or equal to (gte) comparisons with strings', () => {
    expect(testRangeNode('gte', 'b', 'a')).toBe(true);
    expect(testRangeNode('gte', 'a', 'a')).toBe(true);
    expect(testRangeNode('gte', 'a', 'b')).toBe(false);
    expect(testRangeNode('gte', 'apple', 'apple')).toBe(true);
  });

  it('should handle greater than (gt) comparisons with numbers', () => {
    expect(testRangeNode('gt', 6, 5)).toBe(true);
    expect(testRangeNode('gt', 5, 5)).toBe(false);
    expect(testRangeNode('gt', 4, 5)).toBe(false);
    expect(testRangeNode('gt', 0, -1)).toBe(true);
    expect(testRangeNode('gt', -1, -1)).toBe(false);
  });

  it('should handle greater than (gt) comparisons with strings', () => {
    expect(testRangeNode('gt', 'b', 'a')).toBe(true);
    expect(testRangeNode('gt', 'a', 'a')).toBe(false);
    expect(testRangeNode('gt', 'a', 'b')).toBe(false);
  });

  it('should handle less than (lt) comparisons with numbers', () => {
    expect(testRangeNode('lt', 4, 5)).toBe(true);
    expect(testRangeNode('lt', 5, 5)).toBe(false);
    expect(testRangeNode('lt', 6, 5)).toBe(false);
    expect(testRangeNode('lt', -1, 0)).toBe(true);
    expect(testRangeNode('lt', 0, 0)).toBe(false);
  });

  it('should handle less than (lt) comparisons with strings', () => {
    expect(testRangeNode('lt', 'a', 'b')).toBe(true);
    expect(testRangeNode('lt', 'a', 'a')).toBe(false);
    expect(testRangeNode('lt', 'b', 'a')).toBe(false);
  });

  it('should handle less than or equal to (lte) comparisons with numbers', () => {
    expect(testRangeNode('lte', 5, 5)).toBe(true);
    expect(testRangeNode('lte', 4, 5)).toBe(true);
    expect(testRangeNode('lte', 6, 5)).toBe(false);
    expect(testRangeNode('lte', -1, 0)).toBe(true);
    expect(testRangeNode('lte', 0, 0)).toBe(true);
  });

  it('should handle less than or equal to (lte) comparisons with strings', () => {
    expect(testRangeNode('lte', 'a', 'b')).toBe(true);
    expect(testRangeNode('lte', 'a', 'a')).toBe(true);
    expect(testRangeNode('lte', 'b', 'a')).toBe(false);
    expect(testRangeNode('lte', 'b', 'a*')).toBe(true);
    expect(testRangeNode('gte', 'a', 'a*')).toBe(true);
  });

  it('should return true for default cases without an operator', () => {
    expect(testRangeNode(undefined, 5, 5)).toBe(true);
    expect(testRangeNode(undefined, 'test', 'test')).toBe(true);
  });

  it('should handle comparisons with dates', () => {
    const date1 = '2023-01-01';
    const date2 = '2024-01-01';

    expect(testRangeNode('gte', new Date(date1), date1)).toBe(true);
    expect(testRangeNode('gt', new Date(date2), date1)).toBe(true);
    expect(testRangeNode('lt', new Date(date1), date2)).toBe(true);
    expect(testRangeNode('lte', new Date(date1), date2)).toBe(true);
    expect(testRangeNode('lte', new Date(date2), date2)).toBe(true);
    expect(testRangeNode('lt', new Date(date2), date1)).toBe(false);
  });

  it('should handle comparisons with mixed types (number and string)', () => {
    expect(testRangeNode('gt', 10, '2')).toBe(true);
    expect(testRangeNode('lt', 2, '10')).toBe(true);
    expect(testRangeNode('lte', 2, '2')).toBe(true);
  });

  it('should handle undefined and null values', () => {
    expect(testRangeNode('gt', undefined, 5)).toBe(false);
    expect(testRangeNode('gt', 5, undefined)).toBe(false);
    expect(testRangeNode('lt', null, 5)).toBe(false);
    expect(testRangeNode('lte', 5, null)).toBe(false);
  });

  it('should handle boolean values', () => {
    expect(testRangeNode('gt', true, false)).toBe(false);
    expect(testRangeNode('lte', false, true)).toBe(true);
    expect(testRangeNode('gte', true, true)).toBe(true);
    expect(testRangeNode('lt', false, false)).toBe(false);
  });
});
