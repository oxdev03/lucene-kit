import { describe, expect, it } from 'vitest';
import iterate from '../../utils/iterate';

describe('iterate', () => {
  const testObj = {
    key1: {
      nestedKey1: 'value1',
      nestedKey2: 'value2',
      nestedArray: ['arrayValue1', 'arrayValue2'],
    },
    key2: {
      nestedKey1: 'value3',
    },
    key3: 'value4',
    lkey: 'value5'
  };

  it('should iterate over all fields when field is empty', () => {
    const result = [...iterate(testObj, '')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "key1.nestedKey1",
          "value1",
        ],
        [
          "key1.nestedKey2",
          "value2",
        ],
        [
          "key1.nestedArray.0",
          "arrayValue1",
        ],
        [
          "key1.nestedArray.1",
          "arrayValue2",
        ],
        [
          "key2.nestedKey1",
          "value3",
        ],
        [
          "key3",
          "value4",
        ],
        [
          "lkey",
          "value5",
        ],
      ]
    `);
  });

  it('should iterate over nested fields with wildcard', () => {
    const result = [...iterate(testObj, 'key1.*')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "key1.nestedKey1",
          "value1",
        ],
        [
          "key1.nestedKey2",
          "value2",
        ],
        [
          "key1.nestedArray.0",
          "arrayValue1",
        ],
        [
          "key1.nestedArray.1",
          "arrayValue2",
        ],
      ]
    `);
  });

  it('should match specific nested fields with wildcard', () => {
    const result = [...iterate(testObj, '*.nestedKey1')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "key1.nestedKey1",
          "value1",
        ],
        [
          "key2.nestedKey1",
          "value3",
        ],
      ]
    `);
  });

  it('should iterate over arrays correctly', () => {
    const result = [...iterate(testObj, 'key?.nestedArray.*')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "key1.nestedArray.0",
          "arrayValue1",
        ],
        [
          "key1.nestedArray.1",
          "arrayValue2",
        ],
      ]
    `);
  });

  it('should handle nested objects correctly', () => {
    const nestedObj = {
      a: {
        b: {
          c: 'value',
        },
      },
    };
    const result = [...iterate(nestedObj)];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "a.b.c",
          "value",
        ],
      ]
    `);
  });

  it('should match wildcard with question mark', () => {
    const result = [...iterate(testObj, 'key?.nestedKey1')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "key1.nestedKey1",
          "value1",
        ],
        [
          "key2.nestedKey1",
          "value3",
        ],
      ]
    `);
  });

  it('should handle top-level wildcard', () => {
    const result = [...iterate(testObj, 'key*')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "key1.nestedKey1",
          "value1",
        ],
        [
          "key1.nestedKey2",
          "value2",
        ],
        [
          "key1.nestedArray.0",
          "arrayValue1",
        ],
        [
          "key1.nestedArray.1",
          "arrayValue2",
        ],
        [
          "key2.nestedKey1",
          "value3",
        ],
        [
          "key3",
          "value4",
        ],
      ]
    `);
  });

  it('should match exact field', () => {
    const result = [...iterate(testObj, 'key3')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "key3",
          "value4",
        ],
      ]
    `);
  });

  it('should handle deeply nested wildcards', () => {
    const deepObj = {
      a: {
        b: {
          c: 'value1',
          d: 'value2',
        },
        e: 'value3',
      },
      b: {
        c: 'value1'
      }
    };
    const result = [...iterate(deepObj, 'a.*')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "a.b.c",
          "value1",
        ],
        [
          "a.b.d",
          "value2",
        ],
        [
          "a.e",
          "value3",
        ],
      ]
    `);
  });

  it.todo('should handle array elements as objects', () => {
    const arrayObj = {
      arr: [{ key: 'value1' }, { key: 'value2' }, { key2: 'value3' }],
    };
    const result = [...iterate(arrayObj, 'arr.*.key')];
    const alternativeResult = [...iterate(arrayObj, 'arr.key')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "arr.0.key",
          "value1",
        ],
        [
          "arr.1.key",
          "value2",
        ],
      ]
    `);
    // FIXME: able to access array keys without *
    expect(alternativeResult).toEqual(result);
  });

  it('should access array elements with index', () => {
    const arrayObj = {
      arr: [{ key: 'value1' }, { key: 'value2' }, { key2: 'value3' }],
    };
    const result = [...iterate(arrayObj, 'arr.0.key')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "arr.0.key",
          "value1",
        ],
      ]
    `);
  });

  it('should handle plain array', () => {
    const plainArray = ['val1', 'val2'];
    const result = [...iterate(plainArray, '*')];
    const alternativeResult = [...iterate(plainArray, '')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "0",
          "val1",
        ],
        [
          "1",
          "val2",
        ],
      ]
    `);
    expect(alternativeResult).toEqual(result);
  });
});
