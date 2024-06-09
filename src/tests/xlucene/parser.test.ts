import { expect, describe, it } from 'vitest';
import { parse } from '../../xlucene/lucene';
import queries from '../__fixtures__/queries';
import QueryParser from '../../xlucene';

describe('Lucene Parser', () => {
  queries.forEach((test) => {
    it(`should parse ${test.description}`, () => {
      const ast = new QueryParser(test.query).parse().toAST();
      expect(ast).toMatchSnapshot();
      expect(ast).toEqual(parse(test.query));
    });
  });
});
