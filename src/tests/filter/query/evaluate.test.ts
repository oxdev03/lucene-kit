import { test } from 'vitest';
import { evaluateAST } from '../../../filter/query/evaluate';
import QueryParser from '../../../filter/query';

test('evaluate ast', () => {
  const result = evaluateAST(new QueryParser('field2:test field:foo').toAST(), [{ field: 'foo' }, { field2: 'test' }]);
  console.log(result);
});
