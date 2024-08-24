/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { testWildcard } from '../filter/test-value';
import { isWildCardString } from '../types/guards';

type AnyObject = { [key: string]: any };
type IterationResult = [string, any];

const NOT_ITERABLE = [Date];

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
  const splittedFields = field.split('.'); // Split the field pattern into individual components

  /**
   * Recursively iterates over the object or array and yields iteration results.
   * @param obj The object or array to iterate over.
   * @param currentPath The current path in the object hierarchy.
   * @param depth The current depth of recursion.
   */
  function* _iterate(obj: AnyObject | any[], currentPath: string[], depth: number): Generator<IterationResult> {
    if (depth > maxDepth) return; // Stop recursion if maximum depth is exceeded

    const currentField = splittedFields[currentPath.length]; // Get the current field to match
    const lastField = splittedFields.length > 0 ? splittedFields.at(-1) : ''; // Get the last field in the pattern
    const isTrailingWildcard = lastField?.endsWith('*') && !currentField; // Check if it's a trailing wildcard pattern
    const isWildcard = isWildCardString(currentField); // Check if the current field is a wildcard

    // Check if the object is iterable and not in the NOT_ITERABLE list
    if (typeof obj === 'object' && obj !== null && !NOT_ITERABLE.some((cls) => obj instanceof cls)) {
      // Check if the object is an array with elements having the current field as a key
      const arrayWithInnerKey =
        Array.isArray(obj) && obj.some((o) => Object.prototype.hasOwnProperty.call(o, currentField));

      // If the object has the current field and it's not an array with inner key
      if (!isWildcard && Object.prototype.hasOwnProperty.call(obj, currentField) && !arrayWithInnerKey) {
        const newPath = [...currentPath, currentField]; // Create new path
        yield* _iterate(obj[currentField], newPath, depth + 1); // Recurse into the next level
      } else {
        if (arrayWithInnerKey) {
          splittedFields.splice(currentPath.length, 0, '*'); // Add wildcard for array elements
        }

        // Iterate over the properties of the object
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Match properties based on the field or wildcard pattern
            if (!field || (currentField && testWildcard(key, currentField)) || isTrailingWildcard) {
              const newPath = [...currentPath, key];
              yield* _iterate(obj[key], newPath, depth + 1);
            } else if (
              arrayWithInnerKey &&
              typeof obj[key] === 'object' &&
              obj[key] !== null &&
              Object.prototype.hasOwnProperty.call(obj[key], currentField)
            ) {
              const newPath = [...currentPath, key, currentField];
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              yield* _iterate(obj[key][currentField], newPath, depth + 1); // Recurse into the inner key
            }
          }
        }
      }
    } else if (currentPath.length === splittedFields.length || isTrailingWildcard || !field) {
      // If reached the end of the path, or it's a trailing wildcard, or no specific field pattern
      yield [currentPath.join('.'), obj];
    }
  }

  // Start the iteration from the top-level object or array
  yield* _iterate(obj, [], 1);
}
