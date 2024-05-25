import { bench, describe } from 'vitest';
import queries from '../tests/__fixtures__/queries';
import { parse } from '../xlucene/lucene';

describe('Lucene Parser', () => {
  queries.forEach((test) => {
    bench(`should parse ${test.description}`, () => {
      parse(test.query);
    });
  });
});
