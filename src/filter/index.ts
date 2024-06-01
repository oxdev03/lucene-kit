import { ASTEvaluator } from '../handlers/evaluate';
import QueryParser from '../xlucene';
import ReferenceResolver from '../handlers/resolver';

export default function filter<T = any>(
  queryInstance: QueryParser,
  data: T[],
  resolver?: ReferenceResolver,
): T[] {
  const ast = queryInstance.toAST();
  const evaluator = new ASTEvaluator(ast, resolver);

  return evaluator.evaluate(data);
}
