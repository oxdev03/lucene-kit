import { ASTEvaluator } from './evaluate';
import QueryParser from './query';
import ReferenceResolver from './resolver';

export default function filter<T = any>(
  queryInstance: QueryParser,
  data: T[],
  resolver?: ReferenceResolver,
): T[] {
  const ast = queryInstance.toAST();
  const evaluator = new ASTEvaluator(ast, resolver);

  return evaluator.evaluate(data);
}
