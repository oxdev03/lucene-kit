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
});
