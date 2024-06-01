import { expect } from 'vitest';
import { TestFilterQuery } from '.';

const testFieldGroupQueries: TestFilterQuery[] = [
  {
    group: 'field-group',
    difficulty: 'simple',
    desc: 'Simple Test 1',
    query: 'gender:(Male Female)',
    expected: (p) => p.gender === 'Male' || p.gender === 'Female',
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`88`),
  },
  {
    group: 'field-group',
    difficulty: 'simple',
    desc: 'Simple Test 2 and OR',
    query: 'age:(30 OR 40)',
    expected: (p) => p.age === 30 || p.age === 40,
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'field-group',
    difficulty: 'multi',
    desc: 'Multi Field Test 1 and AND',
    query: 'gender:(/a/ AND /le/)',
    expected: (p) => p.gender === 'Male' || p.gender === 'Female',
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`88`),
  },
  {
    group: 'field-group',
    difficulty: 'multi',
    desc: 'Multi Field Test 2 and OR',
    query: 'gender:(Non-binary OR Genderfluid) AND age:(15 OR 17)',
    expected: (p) => (p.gender === 'Non-binary' || p.gender === 'Genderfluid') && (p.age === 15 || p.age === 17),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'field-group',
    difficulty: 'complex',
    desc: 'Complex Test 1',
    query: 'gender:(Male OR Female) AND email:/@gmail.com$/',
    expected: (p) => (p.gender === 'Male' || p.gender === 'Female') && String(p.email).endsWith('@gmail.com'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`0`),
  },
  {
    group: 'field-group',
    difficulty: 'complex',
    desc: 'Complex Test 2',
    query: '(gender:(Male OR Female) OR gender:(Non-binary OR Genderfluid)) AND lastName:(/^A/ OR /^B/)',
    expected: (p) =>
      ['Male', 'Female', 'Non-binary', 'Genderfluid'].includes(p.gender) &&
      (/^A/.test(p.lastName) || /^B/.test(p.lastName)),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`14`),
  },
  {
    group: 'field-group',
    difficulty: 'complex',
    desc: 'Complex Test 3',
    query: 'firstName:(/^A/ OR /^B/) AND lastName:(/^C/ OR /^D/)',
    expected: (p) =>
      (/^A/.test(p.firstName) || /^B/.test(p.firstName)) && (/^C/.test(p.lastName) || /^D/.test(p.lastName)),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`1`),
  },
  {
    group: 'field-group',
    difficulty: 'complex',
    desc: 'Complex Test 4',
    query:
      '(firstName:(Ambrose OR Brandon) AND lastName:(Harpur OR Dunbleton)) OR (firstName:(Corette OR Kaleena) AND lastName:(Bannard OR Eady))',
    expected: (p) =>
      (p.firstName === 'Ambrose' && p.lastName === 'Harpur') ||
      (p.firstName === 'Brandon' && p.lastName === 'Dunbleton') ||
      (p.firstName === 'Corette' && p.lastName === 'Bannard') ||
      (p.firstName === 'Kaleena' && p.lastName === 'Eady'),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`4`),
  },
  {
    group: 'field-group',
    difficulty: 'nested',
    desc: 'Nested Test 1',
    query: '(gender:(Male OR Female) OR gender:(Non-binary OR Genderfluid)) AND age:(30 OR 40)',
    expected: (p) =>
      ['Male', 'Female', 'Non-binary', 'Genderfluid'].includes(p.gender) && (p.age === 30 || p.age === 40),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`2`),
  },
  {
    group: 'field-group',
    difficulty: 'nested',
    desc: 'Nested Test 2',
    query: 'gender:(Male OR Female) AND (age:(20 OR 25) OR age:(30 OR 35))',
    expected: (p) =>
      (p.gender === 'Male' || p.gender === 'Female') && (p.age === 20 || p.age === 25 || p.age === 30 || p.age === 35),
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`7`),
  },
];

export default testFieldGroupQueries;
