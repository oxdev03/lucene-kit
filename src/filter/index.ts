import { ASTEvaluator } from '../handlers/evaluate';
import QueryParser from '../xlucene';
import ReferenceResolver from '../handlers/resolver';
import { IteratorConfig } from '../types/iterator';

/**
 * Filters an array of data based on the lucene query.
 * @param queryInstance The QueryParser instance containing the lucene query.
 * @param data The array of data to filter.
 * @param resolver Optional reference resolver to resolve variables and functions in the query.
 * @param iteratorConfig Optional iterator config to control the behavior of the object iterator
 * @returns The filtered array of data.
 */
export default function filter<T = unknown>(
  queryInstance: QueryParser,
  data: T[],
  resolver?: ReferenceResolver,
  iteratorConfig?: IteratorConfig,
): T[] {
  const ast = queryInstance.toAST();
  const evaluator = new ASTEvaluator(ast, resolver, iteratorConfig);

  return evaluator.evaluate(data);
}
