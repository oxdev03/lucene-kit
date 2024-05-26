import { testWildcard } from '../filter/test-value';
import { isWildCardString } from '../types/guards';

type AnyObject = { [key: string]: any };
type IterationResult = [string, any];

/**
 * Iterates over an object and yields key-value pairs. Supports wildcard matching and maximum depth.
 * @param obj - The object to iterate over.
 * @param field - The field pattern to match, with support for wildcards. Defaults to an empty string.
 * @param maxDepth - The maximum depth to iterate into. Defaults to Infinity.
 * @yields Key-value pairs in the format [field, value].
 */
export default function* iterate(
  obj: AnyObject | any[],
  field: string = '',
  maxDepth: number = Infinity,
): Generator<IterationResult> {
  const splittedFields = field.split('.');

  function* _iterate(obj: AnyObject | any[], currentPath: string[], depth: number): Generator<IterationResult> {
    if (depth > maxDepth) return;

    const currentField = splittedFields[currentPath.length];
    const isWildcard = isWildCardString(currentField);

    if (typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if ((isWildcard ? testWildcard(key, currentField) : key === currentField) || field == '') {
            const newPath = currentPath.concat(key);

            yield* _iterate(obj[key], newPath, depth + 1);
          } else {
            //console.error(currentField, obj, 'test');
          }
        }
      }
    } else {
      yield [currentPath.join('.'), obj];
    }
  }

  yield* _iterate(obj, [], 1);
}
