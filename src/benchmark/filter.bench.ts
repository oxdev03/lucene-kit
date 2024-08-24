import { bench, describe } from 'vitest';
import testFilterQueries from '../tests/__fixtures__/filter';
import personData from '../tests/__fixtures__/data-person';
import { QueryParser, filter } from '..';
import ReferenceResolver from '../handlers/resolver';

const testGroups = new Set(testFilterQueries.map((t) => t.group));

describe('Filter', () => {
  for (const group of testGroups) {
    const testQuery = testFilterQueries.filter((t) => t.group == group);
    // prepare ast, so its not considered in benchmark
    const queries = testQuery.map((t) => {
      const ast = new QueryParser(t.query).parse();
      return () => filter(ast, personData, new ReferenceResolver(t.variableResolver || {}, t.functionResolver));
    });
    bench(`should filter with ${group}`, () => {
      for (const filterData of queries) {
        filterData();
      }
    });
  }
});
