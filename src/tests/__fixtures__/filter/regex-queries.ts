/* eslint-disable unicorn/better-regex */
import { expect } from 'vitest';
import { TestFilterQuery } from '.';

const testRegexQueries: TestFilterQuery[] = [
  {
    group: 'regex',
    difficulty: 'simple',
    desc: 'Simple Test 1 with Regex',
    query: 'gender:/Male|Female/ AND age:30',
    expected: (p) => /Male|Female/.test(p.gender) && p.age === 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'regex',
    difficulty: 'simple',
    desc: 'Simple Test 2 with Regex flags',
    query: 'lastName:/^a/i AND age:38',
    expected: (p) => /^a/i.test(p.lastName) && p.age === 38,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'regex',
    difficulty: 'escaped',
    desc: 'Escaped Regex Test 1',
    query: '/.com$/',
    expected: (p) => /\.com$/.test(p.email || ''),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`60`),
  },
  {
    group: 'regex',
    difficulty: 'escaped',
    desc: 'Escaped Regex Test 2',
    query: 'lastName:/^D.*e$/',
    expected: (p) => /^D.*e$/.test(p.lastName),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'regex',
    difficulty: 'nested',
    desc: 'Nested Regex Test 1',
    query: 'gender:/^(Male|Female|Non-binary)$/ AND email:/@/ AND age:/^3[0-9]$/',
    expected: (p) =>
      /^(Male|Female|Non-binary)$/.test(p.gender) && /@/.test(p.email || '') && /^3[0-9]$/.test(p.age.toString()),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`12`),
  },
  {
    group: 'regex',
    difficulty: 'nested',
    desc: 'Nested Regex Test 2',
    query: 'gender:/^(Male|Female)$/ AND lastName:/^H.*e$/',
    expected: (p) => /^(Male|Female)$/.test(p.gender) && /^H.*e$/.test(p.lastName),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
];

export default testRegexQueries;
