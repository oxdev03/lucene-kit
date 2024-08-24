import { expect } from 'vitest';
import { TestFilterQuery } from '.';

const testWildCardQueries: TestFilterQuery[] = [
  {
    group: 'wildcard',
    difficulty: 'simple',
    desc: 'Simple Wildcard Field Test 1',
    query: '*Name:A*',
    expected: (p) => p.firstName.startsWith('A') || p.lastName.startsWith('A'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`12`),
  },
  {
    group: 'wildcard',
    difficulty: 'simple',
    desc: 'Simple Wildcard Field Test 2',
    query: 'firstName:*ose',
    expected: (p) => /.*ose/.test(p.firstName),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'wildcard',
    difficulty: 'simple',
    desc: 'Simple Wildcard Field Test 3',
    query: 'first*me:Amb*',
    expected: (p) => p.firstName.startsWith('Amb'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'wildcard',
    difficulty: 'complex',
    desc: 'Complex Wildcard Field Test 1',
    query: 'firs?Name:Amb?ose',
    expected: (p) => /Amb.ose/.test(p.firstName),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'wildcard',
    difficulty: 'complex',
    desc: 'Complex Wildcard Field Test 2',
    query: 'fi*st?ame:Ambrose',
    expected: (p) => /Ambrose/.test(p.firstName),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'wildcard',
    difficulty: 'complex',
    desc: 'Complex Wildcard Field Test 3',
    query: '*s?Name:Amb*',
    expected: (p) => p.firstName.startsWith('Amb') || p.lastName.startsWith('Amb'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
];

export default testWildCardQueries;
