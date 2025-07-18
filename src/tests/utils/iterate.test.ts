import { describe, expect, it } from 'vitest';
import iterate, { defaultIteratorConfig } from '../../utils/iterate';

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
    lkey: 'value5',
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
        c: 'value1',
      },
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

  it('should handle array elements as objects', () => {
    const arrayObj = {
      arr: [{ key: 'value1' }, { key: 'value2' }, { key2: 'value3' }],
    };
    const result = [...iterate(arrayObj, 'arr.*.key')];
    const alternativeResult = [...iterate(arrayObj, 'arr.key')];
    expect(alternativeResult).toMatchInlineSnapshot(`
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

    expect(alternativeResult).toEqual(result);
  });

  it('should handle array elements as objects with nested array objects', () => {
    const arrayObj = {
      arr: [
        {
          key: [
            {
              foo: 'bar',
            },
          ],
        },
      ],
    };
    const alternativeResult = [...iterate(arrayObj, 'arr.key.foo')];
    const result = [...iterate(arrayObj, 'arr.*.key.*.foo')];
    expect(alternativeResult).toMatchInlineSnapshot(`
      [
        [
          "arr.0.key.0.foo",
          "bar",
        ],
      ]
    `);

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

  it('should follow max depth', () => {
    const deepObj = {
      a: {
        b: {
          c: 'value1',
          d: 'value2',
        },
        e: 'value3',
      },
      b: {
        c: 'value1',
      },
    };
    const result = [...iterate(deepObj, 'a.*', { ...defaultIteratorConfig, maxDepth: 3 })];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "a.e",
          "value3",
        ],
      ]
    `);
  });

  it('should iterate over date', () => {
    const obj = {
      date: new Date('2024'),
    };

    const result = [...iterate(obj)];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "date",
          2024-01-01T00:00:00.000Z,
        ],
      ]
    `);
  });

  it('should iterate over class instance', () => {
    // TODO: support iterating over class getters

    const Cls = class {
      field = 1;
      self = this;
      static field2() {
        return 2;
      }
      field3() {
        return 3;
      }
      get field4() {
        return 4;
      }
    };

    const result = [...iterate(new Cls(), '', { ...defaultIteratorConfig, maxDepth: 3 })];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "field",
          1,
        ],
        [
          "self.field",
          1,
        ],
      ]
    `);
  });

  it('should handle object with plain array', () => {
    const someObj = {
      tags: ['tagA', 'tagB'],
    };
    const result = [...iterate(someObj, 'tags')];
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "tags.0",
          "tagA",
        ],
        [
          "tags.1",
          "tagB",
        ],
      ]
    `);
  });

  describe('iterate private fields feature', () => {
    const objWithPrivateFields = {
      private: {
        _id: 123,
        name: 'Max',
      },
      someArr: [
        {
          _id: 456,
          name: 'Alex',
        },
      ],
      _privateArr: [
        {
          _id: 789,
          name: 'John',
        },
      ],
    };

    it('should not iterate over private fields by default', () => {
      const obj = {
        _id: 123,
        name: 'Max',
        person: {
          _id: 456,
          nested: {
            foo: 'bar',
          },
        },
      };

      const result = [...iterate(obj, '', { ...defaultIteratorConfig, featureEnablePrivateField: true })];
      const resultDisabledFeature = [...iterate(obj, '')];
      expect(result).toMatchInlineSnapshot(`
        [
          [
            "name",
            "Max",
          ],
          [
            "person.nested.foo",
            "bar",
          ],
        ]
      `);
      expect(result).not.toBe(resultDisabledFeature);
    });

    it('should iterate over private field if specified', () => {
      const obj = {
        _id: 123,
        _idSimilar: 456,
        name: 'Max',
      };

      const result = [...iterate(obj, 'id', { ...defaultIteratorConfig, featureEnablePrivateField: true })];
      const resultDisabledFeature = [...iterate(obj, 'id')];
      expect(result).toMatchInlineSnapshot(`
        [
          [
            "_id",
            123,
          ],
        ]
      `);
      expect(result).not.toBe(resultDisabledFeature);
    });

    it('should not iterate over private fields by default with wildcard', () => {
      const result = [
        ...iterate(objWithPrivateFields, '*', { ...defaultIteratorConfig, featureEnablePrivateField: true }),
      ];
      const resultDisabledFeature = [...iterate(objWithPrivateFields, '*')];
      expect(result).toMatchInlineSnapshot(`
        [
          [
            "private.name",
            "Max",
          ],
          [
            "someArr.0.name",
            "Alex",
          ],
        ]
      `);
      expect(result).not.toBe(resultDisabledFeature);
    });

    it('should iterate over private fields with wildcard if specified', () => {
      const result = [
        ...iterate(objWithPrivateFields, '*.id', { ...defaultIteratorConfig, featureEnablePrivateField: true }),
      ];
      const resultDisabledFeature = [...iterate(objWithPrivateFields, '*.id')];
      expect(result).toMatchInlineSnapshot(`
        [
          [
            "private._id",
            123,
          ],
          [
            "someArr.0._id",
            456,
          ],
        ]
      `);
      expect(result).not.toBe(resultDisabledFeature);
    });

    // This won't be supported
    it.skip('should handle top-level wildcard for private fields', () => {
      /* v8 ignore start */
      const obj = {
        private: {
          _id: 123,
          _insider: true,
        },
      };
      const result = [...iterate(obj, 'private.i*')];
      expect(result).toMatchInlineSnapshot(`
        [
          [
            "private._id",
            123,
          ],
          [
            "private._insider",
            true,
          ],
        ]
      `);
      /* v8 ignore stop */
    });
  });
});
