/* eslint-disable @typescript-eslint/no-explicit-any */
/*  eslint-disable @typescript-eslint/no-unsafe-argument  */
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

  /**
   * Recursively iterates over the object or array and yields iteration results.
   * @param obj The object or array to iterate over.
   * @param currentPath The current path in the object hierarchy.
   * @param depth The current depth of recursion.
   */
  function* _iterate(obj: AnyObject | any[], currentPath: string[], depth: number): Generator<IterationResult> {
    if (depth > maxDepth) return;

    const currentField = splittedFields[currentPath.length];
    const lastField = splittedFields.length ? splittedFields[splittedFields.length - 1] : '';
    const isTrailingWildcard = lastField?.endsWith('*') && !currentField;
    const isWildcard = isWildCardString(currentField);

    if (typeof obj === 'object' && obj !== null) {
      // If the object is not an array and has the current field, continue iteration.
      if (!isWildcard && Object.prototype.hasOwnProperty.call(obj, currentField)) {
        const newPath = currentPath.concat(currentField);
        yield* _iterate(obj[currentField], newPath, depth + 1);
      } else {
        // If the object is an array or contains the wildcard, iterate over its properties.
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Filter properties based on the field or wildcard pattern.
            if (!field || (currentField && testWildcard(key, currentField)) || isTrailingWildcard) {
              const newPath = currentPath.concat(key);
              yield* _iterate(obj[key], newPath, depth + 1);
            }
          }
        }
      }
    } else if (currentPath.length === splittedFields.length || isTrailingWildcard || !field) {
      // If reached the end of the path or it's a trailing wildcard, yield the current path and object.
      yield [currentPath.join('.'), obj];
    }
  }

  // Start the iteration from the top-level object or array.
  yield* _iterate(obj, [], 1);
}
