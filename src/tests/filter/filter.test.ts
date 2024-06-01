import { describe, expect, it } from 'vitest';
import personData from '../__fixtures__/data-person';
import { QueryParser, filter } from '../..';
import testFilterQueries from '../__fixtures__/filter';
import ReferenceResolver from '../../handlers/resolver';

describe(`filter`, () => {
  const testGroups = new Set(testFilterQueries.map((t) => t.group));
  testGroups.forEach((group) => {
    describe(`filter with ${group}`, () => {
      const tests = testFilterQueries.filter((t) => t.group == group);

      tests.forEach((t) => {
        it(`should ${t.desc}`, () => {
          const result = filter(
            new QueryParser(t.query),
            personData,
            new ReferenceResolver(t.variableResolver || {}, t.functionResolver),
          );
          expect(result).toEqual(personData.filter(t.expected));
          t.resultLen(result.length);
        });
      });

      if (group == 'range') {
        it.todo('should Date Range Test 1', () => {
          const query = 'date:[01-01-2022 TO 01-01-2024]';
          const data = [
            { id: 1, date: new Date('2023') },
            { id: 2, date: new Date('2021') },
          ];
          const result = filter(new QueryParser(query), data);
          expect(result).toMatchInlineSnapshot(`[]`);
        });
      }
    });
  });
});
