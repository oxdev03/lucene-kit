type FlatType = string | number | undefined | boolean | null;

export function testString(value: FlatType, filter: string | number, quoted: boolean): boolean {
  if (value == undefined || value == null) {
    return false;
  } else if (quoted) {
    return String(value) == filter;
  } else if (typeof filter == 'string') {
    return String(value).includes(filter);
  } else if (typeof filter == 'number' || typeof filter == 'boolean') {
    return value == filter;
  }

  throw new Error(`Test String ${value} with filter ${filter} not covered`);
}

export function testRegexp(value: FlatType, filter: RegExp) {
  if (value == undefined || value == null) {
    return false;
  }
  return filter.test(String(value));
}

export function testWildcard(value: FlatType, filter: string): boolean {
  const regexPattern = escapeRegExp(filter).replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);
  return testRegexp(value, regex);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
