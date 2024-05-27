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
    const lastField = splittedFields.length ? splittedFields[splittedFields.length - 1] : '';
    const isTrailingWildcard = lastField?.endsWith('*') && !currentField;
    const isWildcard = isWildCardString(currentField);

    if (typeof obj === 'object' && obj !== null) {
      if (!isWildcard && obj.hasOwnProperty(currentField)) {
        const newPath = currentPath.concat(currentField);
        yield* _iterate(obj[currentField], newPath, depth + 1);
      } else {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (!field || (currentField && testWildcard(key, currentField)) || isTrailingWildcard) {
              const newPath = currentPath.concat(key);
              yield* _iterate(obj[key], newPath, depth + 1);
            }
          }
        }
      }
    } else if (currentPath.length === splittedFields.length || isTrailingWildcard || !field) {
      yield [currentPath.join('.'), obj];
    }
  }

  yield* _iterate(obj, [], 1);
}
