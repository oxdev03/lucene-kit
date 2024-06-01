import { expect } from 'vitest';
import { TestFilterQuery } from '.';
import { QueryParser } from '../../..';

const testVariableQueries: TestFilterQuery[] = [
  {
    group: 'variable',
    difficulty: 'simple',
    desc: 'Simple Global Variable Test 1',
    query: 'age:$age',
    expected: (p) => p.age === 30,
    variableResolver: {
      age: 30,
    },
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'variable',
    difficulty: 'simple',
    desc: 'Simple Global Variable Test 2',
    query: 'age:$age',
    expected: (p) => p.age == undefined,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`0`),
  },
  {
    group: 'variable',
    difficulty: 'simple',
    desc: 'Simple Global Variable Test 3',
    query: 'age:($age1 OR $age2)',
    expected: (p) => p.age == 30 || p.age == 34,
    variableResolver: {
      age1: 30,
      age2: 34,
    },
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`3`),
  },
  {
    group: 'variable',
    difficulty: 'simple',
    desc: 'Simple Global Variable Test 4',
    query: 'age:$kid',
    expected: (p) => p.age >= 0 && p.age <= 14,
    variableResolver: {
      kid: new QueryParser('age:[0 TO 14]'),
    },
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`20`),
  },
  {
    group: 'variable',
    difficulty: 'simple',
    desc: 'Simple Global Variable Test 5',
    query: 'age:[$baby TO $teen]',
    expected: (p) => p.age >= 0 && p.age <= 16,
    variableResolver: {
      baby: 0,
      teen: 16,
    },
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`21`),
  },
  {
    group: 'variable',
    difficulty: 'simple',
    desc: 'Complex Global Variable Test 1',
    query: '$query1 AND (age:[$25 TO $50] OR $query2)',
    expected: (p) =>
      ((p.gender === 'Male' && p.age >= 20) || (p.gender === 'Female' && p.age >= 20)) && p.age >= 25 && p.age <= 50,
    variableResolver: {
      '25': 25,
      '50': 50,
      query2: new QueryParser('age:[$22 TO $55]'),
      query1: new QueryParser('(gender:Male AND age:>=20) OR (gender:Female AND age:>=20)'),
    },
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`23`),
  },
];

export default testVariableQueries;
