import { describe, expect, it } from 'vitest';
import personData from '../__fixtures__/data-person';
import { QueryParser, filter } from '../..';
import testFilterQueries from '../__fixtures__/filter';
import ReferenceResolver from '../../handlers/resolver';

describe(`filter`, () => {
  const testGroups = new Set(testFilterQueries.map((t) => t.group)).add('date');
  for (const group of testGroups) {
    describe(`filter with ${group}`, () => {
      const tests = testFilterQueries.filter((t) => t.group == group);

      for (const t of tests) {
        it(`should ${t.desc}`, () => {
          const result = filter(
            new QueryParser(t.query),
            personData,
            new ReferenceResolver(t.variableResolver || {}, t.functionResolver),
          );
          expect(result).toEqual(personData.filter(t.expected));
          t.resultLen(result.length);
        });
      }

      if (group == 'date') {
        it('should Date Range Test 1', () => {
          const query = 'date:[01-01-2022 TO 2024]';
          const data = [
            { id: 1, date: new Date('2023') },
            { id: 2, date: new Date('2021') },
            { id: 3, date: new Date('2025') },
            { id: 4, date: new Date('2023') },
          ];
          const result = filter(new QueryParser(query), data);
          expect(result).toMatchInlineSnapshot(`
            [
              {
                "date": 2023-01-01T00:00:00.000Z,
                "id": 1,
              },
              {
                "date": 2023-01-01T00:00:00.000Z,
                "id": 4,
              },
            ]
          `);
        });

        it('should Date Range Test 2', () => {
          const query = 'date:[2023 TO *]';
          const data = [
            { id: 1, date: new Date('2023') },
            { id: 2, date: new Date('2021') },
            { id: 3, date: new Date('2025') },
          ];
          const result = filter(new QueryParser(query), data);
          expect(result).toMatchInlineSnapshot(`
            [
              {
                "date": 2023-01-01T00:00:00.000Z,
                "id": 1,
              },
              {
                "date": 2025-01-01T00:00:00.000Z,
                "id": 3,
              },
            ]
          `);
        });

        it('should Simple Date Test 1', () => {
          const query = 'date:2023-01-01';
          const data = [
            { id: 1, date: new Date('2023') },
            { id: 1, date: new Date('2023-11-31') },
            { id: 2, date: new Date('2021') },
            { id: 3, date: new Date('2025') },
          ];
          const result = filter(new QueryParser(query), data);
          expect(result).toMatchInlineSnapshot(`
            [
              {
                "date": 2023-01-01T00:00:00.000Z,
                "id": 1,
              },
            ]
          `);
        });
      }
    });
  }

  describe(`filter private fields`, () => {
    const data = [
      { _id: 12, firstName: 'Bettye', lastName: 'Oakland', age: 13, email: 'boaklandb@mail.me' },
      { _id: 13, firstName: 'Emanuele', lastName: 'Doree', age: 14, email: 'edoreec@mail.org' },
      {
        _id: 14,
        firstName: 'Rosalind',
        lastName: 'Bousler',
        age: 15,
        email: 'rbouslerd@mail.com',
      },
    ];
    const iteratorConfig = {
      maxDepth: 3,
      featureEnablePrivateField: true,
    };

    it('should ignore private fields for non field queries', () => {
      const result = filter(new QueryParser('13'), data, undefined, iteratorConfig);
      expect(result).toEqual(data.filter((d) => d.age == 13));
    });

    it('should ignore private fields for wildcards', () => {
      const result = filter(new QueryParser('*:13'), data, undefined, iteratorConfig);
      expect(result).toEqual(data.filter((d) => d.age == 13));
    });

    it('should filter for private fields if specified', () => {
      const result = filter(new QueryParser('id:13'), data, undefined, iteratorConfig);
      expect(result).toEqual(data.filter((d) => d._id == 13));
    });
  });

  describe('filter array fields', () => {
    const data = [
      { id: 1, tags: ['javascript', 'typescript'] },
      { id: 2, tags: ['python', 'typescript'] },
      { id: 3, tags: ['java'] },
      { id: 4, tags: [] },
      { id: 5 },
    ];

    it('should filter by array value', () => {
      const result = filter(new QueryParser('tags:typescript'), data);
      expect(result).toEqual([
        { id: 1, tags: ['javascript', 'typescript'] },
        { id: 2, tags: ['python', 'typescript'] },
      ]);
    });

    it('should handle nested array fields', () => {
      const nestedData = [
        {
          id: 1,
          nested: {
            tags: ['javascript', 'typescript'],
          },
        },
        {
          id: 2,
          nested: {
            tags: ['python'],
          },
        },
        {
          id: 3,
          nested: {
            other: ['something'],
          },
        },
      ];

      const queries = [
        'nested.tags:typescript', // explicit field path
        '*.tags:typescript', // wildcard prefix
        'nested.tags*:typescript', // wildcard suffix
        '*.tags*:typescript', // wildcard on both sides
      ];

      for (const query of queries) {
        const result = filter(new QueryParser(query), nestedData);
        expect(result).toEqual([
          {
            id: 1,
            nested: {
              tags: ['javascript', 'typescript'],
            },
          },
        ]);
      }
    });
  });
});
