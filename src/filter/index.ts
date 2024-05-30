import { ASTEvaluator } from './evaluate';
import QueryParser from './query';
import ReferenceResolver from './resolver';

type FieldMapping = {
  [key: string]: string;
};

export default function filter<T = any>(
  queryInstance: QueryParser,
  data: T[],
  resolver?: ReferenceResolver,
  fieldMapping?: FieldMapping,
): T[] {
  const ast = queryInstance.toAST();
  const evaluator = new ASTEvaluator(ast, resolver);

  return evaluator.evaluate(data);
}
