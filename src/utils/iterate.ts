/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-for-in-array */
import { testWildcard } from '../filter/test-value';
import { isWildCardString } from '../types/guards';
import { IteratorConfig } from '../types/iterator';

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
  config: IteratorConfig = defaultIteratorConfig,
): Generator<IterationResult> {
  const splittedFields = field.split('.'); // Split the field pattern into individual components
  /**
   * Recursively iterates over the object or array and yields iteration results.
   * @param obj The object or array to iterate over.
   * @param currentPath The current path in the object hierarchy.
   * @param depth The current depth of recursion.
   */
  function* _iterate(obj: AnyObject | any[], currentPath: string[], depth: number): Generator<IterationResult> {
    const checkPrivate = config.featureEnablePrivateField;

    if (depth > config.maxDepth) return; // Stop recursion if maximum depth is exceeded

    const currentField = splittedFields[currentPath.length]; // Get the current field to match
    const lastField = splittedFields.length > 0 ? splittedFields.at(-1) : ''; // Get the last field in the pattern
    const isTrailingWildcard = lastField?.endsWith('*') && !currentField; // Check if it's a trailing wildcard pattern
    const isWildcard = isWildCardString(currentField); // Check if the current field is a wildcard

    // Check if the object is iterable and not in the NOT_ITERABLE list
    if (typeof obj === 'object' && obj !== null && !NOT_ITERABLE.some((cls) => obj instanceof cls)) {
      // Handle plain arrays directly if we're at the target field and not using a wildcard
      if (Array.isArray(obj) && currentPath.length === splittedFields.length && !isTrailingWildcard && field) {
        for (let i = 0; i < obj.length; i++) {
          yield [[...currentPath, i].join('.'), obj[i]];
        }
        return;
      }

      // Check if the object is an array with elements having the current field as a key
      const arrayWithInnerKey = Array.isArray(obj) && obj.some((o) => objectHasField(o, currentField, checkPrivate));
      const objWithCurrentField = objectHasField(obj, currentField, checkPrivate);
      // If the object has the current field and it's not an array with inner key
      if (!isWildcard && objWithCurrentField && !arrayWithInnerKey) {
        const newPath = [...currentPath, objWithCurrentField]; // Create new path
        yield* _iterate(obj[objWithCurrentField], newPath, depth + 1); // Recurse into the next level
      } else {
        if (arrayWithInnerKey) {
          splittedFields.splice(currentPath.length, 0, '*'); // Add wildcard for array elements
        }

        // Iterate over the properties of the object
        for (const key in obj) {
          // If the key starts with _, it shouldn't work for wildcard, if not explicity specified
          if (checkPrivate && isPrivateField(key) && privateFieldName(key) != currentField) continue;
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            let objKeyWithCurrentField = '';
            // Match properties based on the field or wildcard pattern
            if (
              !field ||
              (currentField && testWildcard(checkPrivate ? privateFieldName(key) : key, currentField)) ||
              isTrailingWildcard
            ) {
              const newPath = [...currentPath, key];
              yield* _iterate(obj[key], newPath, depth + 1);
            } else if (
              arrayWithInnerKey &&
              typeof obj[key] === 'object' &&
              obj[key] !== null &&
              (objKeyWithCurrentField = objectHasField(obj[key], currentField, checkPrivate))
            ) {
              const newPath = [...currentPath, key, objKeyWithCurrentField];
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              yield* _iterate(obj[key][objKeyWithCurrentField], newPath, depth + 1); // Recurse into the inner key
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

export const defaultIteratorConfig = { maxDepth: Infinity, featureEnablePrivateField: false };

/**
 * Checks if a field is private based on its naming convention (starts with an underscore).
 * @param key - The field name to check.
 * @returns True if the field name starts with an underscore, false otherwise.
 */
function isPrivateField(key: string): boolean {
  return key.startsWith('_');
}

/**
 * Removes the leading underscore from a private field name.
 * @param key - The private field name.
 * @returns The field name without the leading underscore.
 */
function privateFieldName(key: string): string {
  return key.startsWith('_') ? key.slice(1) : key;
}

/**
 * Checks if an object or array contains a key (including private versions).
 * @param obj - The object or array to check.
 * @param key - The key to search for.
 * @param featureEnablePrivateField - whether it should also check the private field
 * @returns The matching key, or an empty string if not found.
 */
function objectHasField(obj: AnyObject | any[], key: string, featureEnablePrivateField: boolean): string {
  const privateKey = `_${key}`;
  if (Object.prototype.hasOwnProperty.call(obj, key)) return key;
  if (featureEnablePrivateField && Object.prototype.hasOwnProperty.call(obj, privateKey)) return privateKey;
  return '';
}
