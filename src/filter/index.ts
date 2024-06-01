import { ASTEvaluator } from '../handlers/evaluate';
import QueryParser from '../xlucene';
import ReferenceResolver from '../handlers/resolver';

/**
 * Filters an array of data based on the lucene query.
 * @param queryInstance The QueryParser instance containing the lucene query.
 * @param data The array of data to filter.
 * @param resolver Optional reference resolver to resolve variables and functions in the query.
 * @returns The filtered array of data.
 */
export default function filter<T = any>(
  queryInstance: QueryParser,
  data: T[],
  resolver?: ReferenceResolver,
): T[] {
  const ast = queryInstance.toAST();
  const evaluator = new ASTEvaluator(ast, resolver);

  return evaluator.evaluate(data);
}
