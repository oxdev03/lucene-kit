type FlatType = string | number | undefined | boolean | bigint | null;

export function testString(value: FlatType, filter: string, quoted: boolean): boolean {
    return value == filter;
}

export function testRegexp(value: FlatType, filter: string) {

    return false;
}