import { expect } from 'vitest';
import { TestFilterQuery } from '.';

const testRangeQueries: TestFilterQuery[] = [
  {
    group: 'range',
    difficulty: 'simple',
    desc: 'Simple Range Test 1',
    query: 'age:[0 TO 30]',
    expected: (p) => p.age >= 0 && p.age <= 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`31`),
  },
  {
    group: 'range',
    difficulty: 'simple',
    desc: 'Simple Range Test 2',
    query: 'age:[20 TO *]',
    expected: (p) => p.age >= 20,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`78`),
  },
  {
    group: 'range',
    difficulty: 'simple',
    desc: 'Simple Range Test 3',
    query: 'age:>=30 && age:[* TO 60]',
    expected: (p) => p.age >= 30 && p.age >= 0 && p.age <= 60,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`30`),
  },
  {
    group: 'range',
    difficulty: 'complex',
    desc: 'Complex Range Test 1',
    query: '(age:>=30 && age:<=60) || (age:>19 && age:<21)',
    expected: (p) => p.age == 20 || (p.age >= 30 && p.age <= 60),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`31`),
  },
];

export default testRangeQueries;
