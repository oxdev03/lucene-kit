import { expect, describe, it } from 'vitest';
import { parse } from '../../xlucene/lucene';
import queries from '../__fixtures__/queries';

describe('Lucene Parser', () => {
  queries.forEach((test) => {
    it(`should parse ${test.description}`, () => {
      expect(parse(test.query)).toMatchSnapshot();
    });
  });
});
