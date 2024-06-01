import { expect } from 'vitest';
import { TestFilterQuery } from '.';

const testsSimple: TestFilterQuery[] = [
  {
    group: 'conjunction',
    difficulty: 'simple',
    desc: 'Simple Test 1 (AND)',
    query: 'gender:Male AND age:47',
    expected: (p) => p.gender === 'Male' && p.age === 47,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'disjunction',
    difficulty: 'simple',
    desc: 'Simple Test 2 (OR)',
    query: 'gender:Non-binary OR age:15',
    expected: (p) => p.gender === 'Non-binary' || p.age === 15,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`3`),
  },
  {
    group: 'negation',
    difficulty: 'simple',
    desc: 'Simple Test 3 (NOT)',
    query: 'NOT gender:Female',
    expected: (p) => p.gender !== 'Female',
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`57`),
  },
  {
    group: 'logical',
    difficulty: 'simple',
    desc: 'Simple Test 4 (Grouping)',
    query: '(gender:Male AND age:40) OR (NOT gender:Female)',
    expected: (p) => (p.gender === 'Male' && p.age == 40) || p.gender !== 'Female',
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`57`),
  },
  {
    group: 'negation',
    difficulty: 'simple',
    desc: 'Simple Test 5 (Negation)',
    query: '!age:30',
    expected: (p) => p.age !== 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`98`),
  },
  {
    group: 'logical',
    difficulty: 'simple',
    desc: 'Simple Test 6 (AND, OR)',
    query: 'gender:Female AND (age:20 OR age:60)',
    expected: (p) => p.gender === 'Female' && (p.age == 20 || p.age == 60),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'logical',
    difficulty: 'simple',
    desc: 'Simple Test 7 (NOT, Grouping)',
    query: 'NOT (gender:Male OR age:20)',
    expected: (p) => !(p.gender === 'Male' || p.age === 20),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`55`),
  },
  {
    group: 'logical',
    difficulty: 'simple',
    desc: 'Simple Test 8 (Negation, Grouping)',
    query: '!(gender:Female AND (age:40 OR age:50))',
    expected: (p) => !(p.gender === 'Female' && (p.age == 40 || p.age == 50)),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`100`),
  },
  {
    group: 'logical',
    difficulty: 'simple',
    desc: 'Simple Test 9 (AND, Negation)',
    query: 'gender:Male AND !age:50',
    expected: (p) => p.gender === 'Male' && p.age !== 50,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`44`),
  },
  {
    group: 'logical',
    difficulty: 'simple',
    desc: 'Simple Test 10 (OR, Negation)',
    query: 'gender:Female OR !age:30',
    expected: (p) => p.gender === 'Female' || p.age !== 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`99`),
  },
];
const testsMulti: TestFilterQuery[] = [
  {
    group: 'conjunction',
    difficulty: 'multi',
    desc: 'Multi Test 1 (AND)',
    query: 'gender:Male AND age:47',
    expected: (p) => p.gender === 'Male' && p.age === 47,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'disjunction',
    difficulty: 'multi',
    desc: 'Multi Test 2 (OR)',
    query: 'gender:Non-binary OR age:15',
    expected: (p) => p.gender === 'Non-binary' || p.age === 15,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`3`),
  },
  {
    group: 'negation',
    difficulty: 'multi',
    desc: 'Multi Test 3 (NOT)',
    query: 'NOT gender:Female AND NOT age:30',
    expected: (p) => p.gender !== 'Female' && p.age !== 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`56`),
  },
  {
    group: 'logical',
    difficulty: 'multi',
    desc: 'Multi Test 4 (Grouping)',
    query: '(gender:Male OR age:55) AND (NOT gender:Female OR age:25)',
    expected: (p) => (p.gender === 'Male' || p.age === 55) && (p.gender !== 'Female' || p.age === 25),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`45`),
  },
  {
    group: 'negation',
    difficulty: 'multi',
    desc: 'Multi Test 5 (Negation)',
    query: '!age:47 AND !age:43',
    expected: (p) => p.age !== 47 && p.age !== 43,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`97`),
  },
  {
    group: 'logical',
    difficulty: 'multi',
    desc: 'Multi Test 6 (AND, OR)',
    query: '(gender:Female AND age:25) OR (gender:Male OR age:55)',
    expected: (p) => (p.gender === 'Female' && p.age === 25) || p.gender === 'Male' || p.age === 55,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`47`),
  },
  {
    group: 'logical',
    difficulty: 'multi',
    desc: 'Multi Test 7 (NOT, Grouping)',
    query: 'NOT (gender:Male OR age:25) AND NOT (gender:Female AND age:30)',
    expected: (p) => !(p.gender === 'Male' || p.age === 25) && !(p.gender === 'Female' && p.age === 30),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`53`),
  },
  {
    group: 'logical',
    difficulty: 'multi',
    desc: 'Multi Test 8 (Negation, Grouping)',
    query: '!(gender:Female AND age:47) AND !(gender:Male OR age:25)',
    expected: (p) => !(p.gender === 'Female' && p.age === 47) && !(p.gender === 'Male' || p.age === 25),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`54`),
  },
  {
    group: 'logical',
    difficulty: 'multi',
    desc: 'Multi Test 9 (AND, Negation)',
    query: 'gender:Male AND !(age:55)',
    expected: (p) => p.gender === 'Male' && p.age !== 55,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`45`),
  },
  {
    group: 'logical',
    difficulty: 'multi',
    desc: 'Multi Test 10 (OR, Negation)',
    query: 'gender:Female OR !(age:25)',
    expected: (p) => p.gender === 'Female' || p.age !== 25,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`99`),
  },
];
const testsComplex: TestFilterQuery[] = [
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 1',
    query: '(gender:Male AND age:47) OR (gender:Female AND age:55)',
    expected: (p) => (p.gender === 'Male' && p.age === 47) || (p.gender === 'Female' && p.age === 55),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`3`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 2',
    query: '(gender:Non-binary OR (age:15 AND NOT gender:Male))',
    expected: (p) => p.gender === 'Non-binary' || (p.age === 15 && p.gender !== 'Male'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`3`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 3',
    query:
      '((age:55 AND NOT gender:Male) OR (age:20 AND gender:Female)) AND NOT (firstName:"Ambrose" OR lastName:"Bannard")',
    expected: (p) =>
      ((p.age === 55 && p.gender !== 'Male') || (p.age === 20 && p.gender === 'Female')) &&
      !(p.firstName === 'Ambrose' || p.lastName === 'Bannard'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`0`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 4',
    query: '(gender:Female OR (age:77 AND NOT gender:Male)) AND NOT (age:77 OR age:84)',
    expected: (p) =>
      (p.gender === 'Female' || (p.age === 77 && p.gender !== 'Male')) && !(p.age === 77 || p.age === 84),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`41`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 5',
    query: '(gender:Male OR (age:30 AND NOT gender:Female)) AND (firstName:"Kaleb" OR firstName:"Cece")',
    expected: (p) =>
      (p.gender === 'Male' || (p.age === 30 && p.gender !== 'Female')) &&
      (p.firstName === 'Kaleb' || p.firstName === 'Cece'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 6',
    query:
      '((gender:Non-binary AND age:95) OR (gender:Polygender AND age:95)) AND NOT (firstName:"Kipp" OR firstName:"Francklin")',
    expected: (p) =>
      ((p.gender === 'Non-binary' && p.age === 95) || (p.gender === 'Polygender' && p.age === 95)) &&
      !(p.firstName === 'Kipp' || p.firstName === 'Francklin'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 7',
    query: '(age:55 AND NOT gender:Male) OR (age:60 AND gender:Female)',
    expected: (p) => (p.age === 55 && p.gender !== 'Male') || (p.age === 60 && p.gender === 'Female'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`3`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 8',
    query: '(age:35 AND NOT gender:Female) OR (age:62 AND gender:Male)',
    expected: (p) => (p.age === 35 && p.gender !== 'Female') || (p.age === 62 && p.gender === 'Male'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 9',
    query: '(gender:Non-binary OR gender:Genderfluid) AND NOT (age:55)',
    expected: (p) => (p.gender === 'Non-binary' || p.gender === 'Genderfluid') && !(p.age === 55),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`6`),
  },
  {
    group: 'logical',
    difficulty: 'complex',
    desc: 'Complex Test 10',
    query: '(age:20 AND NOT gender:Female) OR (age:70 AND gender:Male)',
    expected: (p) => (p.age === 20 && p.gender !== 'Female') || (p.age === 70 && p.gender === 'Male'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
];
const testsNested: TestFilterQuery[] = [
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 1',
    query: '(((gender:Male AND age:47))) OR (gender:Female AND age:55) AND age:30',
    //@ts-expect-error query just for testing grouping
    expected: (p) => (p.gender === 'Male' && p.age === 47) || (p.gender === 'Female' && p.age === 55 && p.age === 30),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 2',
    query: '(((NOT gender:Female) AND age:15)) OR (gender:Male AND age:84) AND NOT gender:Non-binary',

    expected: (p) =>
      //@ts-expect-error no over-lap
      (p.gender !== 'Female' && p.age === 15) || (p.gender === 'Male' && p.age === 84 && p.gender !== 'Non-binary'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`3`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 3',
    query: '((NOT age:15) OR (gender:Female OR age:55)) AND NOT age:30',
    //@ts-expect-error no over-lap
    expected: (p) => (p.age !== 15 || p.gender === 'Female' || p.age === 55) && p.age !== 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`97`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 4',
    query: '((gender:Male OR age:15) OR (NOT gender:Female AND age:55)) AND NOT age:30',
    expected: (p) => (p.gender === 'Male' || p.age === 15 || (p.gender !== 'Female' && p.age === 55)) && p.age !== 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`45`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 5',
    query: '(((NOT (gender:Male OR age:15))) OR (gender:Female AND age:55)) AND age:30',
    expected: (p) =>
      ((!(p.gender === 'Male' || p.age === 15) && p.age === 30) || (p.gender === 'Female' && p.age === 55)) &&
      p.age === 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 6',
    query: '(((gender:Female AND NOT age:15)) OR (gender:Male OR age:84)) AND NOT gender:Non-binary',
    expected: (p) =>
      (p.gender === 'Female' && p.age !== 15) || ((p.gender === 'Male' || p.age === 84) && p.gender !== 'Non-binary'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`88`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 7',
    query: '(((gender:Male AND NOT age:15)) OR (NOT gender:Female OR age:55)) AND NOT age:30',
    expected: (p) =>
      ((p.gender === 'Male' && p.age !== 15 && p.age === 30) || p.gender !== 'Female' || p.age === 55) && p.age !== 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`57`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 8',
    query: '(((gender:Female OR age:15))) OR (NOT gender:Female AND age:55) AND age:30',
    expected: (p) => p.gender === 'Female' || p.age === 15 || (p.gender !== 'Female' && p.age === 55),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`44`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 9',
    query: '(((NOT gender:Male)) OR (gender:Female OR age:55)) AND NOT age:30',
    expected: (p) => (p.gender !== 'Male' || p.age === 55) && p.age !== 30,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`54`),
  },
  {
    group: 'logical',
    difficulty: 'nested',
    desc: 'Nested Test 10',
    query: '((NOT gender:Female) OR (gender:Male AND age:84)) AND NOT gender:Non-binary',
    //@ts-expect-error no-over-lap
    expected: (p) => (p.gender !== 'Female' || (p.gender == 'Male' && p.age === 84)) && p.gender !== 'Non-binary',
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`54`),
  },
];

const testLogicalQueries: TestFilterQuery[] = [...testsSimple, ...testsMulti, ...testsComplex, ...testsNested];

export default testLogicalQueries;
