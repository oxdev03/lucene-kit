import { describe, expect, it, test } from 'vitest';
import personData, { PersonData } from '../__fixtures__/data-person';
import ReferenceResolver, {
  FunctionResolver,
  FunctionResolverReturnType,
  VariableResolver,
} from '../../handlers/resolver';
import { QueryParser, filter } from '../..';
import testFunctionQueries from '../__fixtures__/filter/function-queries';
import testFilterQueries from '../__fixtures__/filter';

describe('filter with OR,AND,NOT', () => {
  type Test = {
    group: 'simple' | 'multi' | 'complex' | 'nested';
    desc: string;
    query: string;
    expected: (p: (typeof personData)[0]) => boolean;
  };

  const testsSimple: Test[] = [
    {
      group: 'simple',
      desc: 'Simple Test 1 (AND)',
      query: 'gender:Male AND age:47',
      expected: (p) => p.gender === 'Male' && p.age === 47,
    },
    {
      group: 'simple',
      desc: 'Simple Test 2 (OR)',
      query: 'gender:Non-binary OR age:15',
      expected: (p) => p.gender === 'Non-binary' || p.age === 15,
    },
    {
      group: 'simple',
      desc: 'Simple Test 3 (NOT)',
      query: 'NOT gender:Female',
      expected: (p) => p.gender !== 'Female',
    },
    {
      group: 'simple',
      desc: 'Simple Test 4 (Grouping)',
      query: '(gender:Male AND age:40) OR (NOT gender:Female)',
      expected: (p) => (p.gender === 'Male' && p.age == 40) || p.gender !== 'Female',
    },
    {
      group: 'simple',
      desc: 'Simple Test 5 (Negation)',
      query: '!age:30',
      expected: (p) => p.age !== 30,
    },
    {
      group: 'simple',
      desc: 'Simple Test 6 (AND, OR)',
      query: 'gender:Female AND (age:20 OR age:60)',
      expected: (p) => p.gender === 'Female' && (p.age == 20 || p.age == 60),
    },
    {
      group: 'simple',
      desc: 'Simple Test 7 (NOT, Grouping)',
      query: 'NOT (gender:Male OR age:20)',
      expected: (p) => !(p.gender === 'Male' || p.age === 20),
    },
    {
      group: 'simple',
      desc: 'Simple Test 8 (Negation, Grouping)',
      query: '!(gender:Female AND (age:40 OR age:50))',
      expected: (p) => !(p.gender === 'Female' && (p.age == 40 || p.age == 50)),
    },
    {
      group: 'simple',
      desc: 'Simple Test 9 (AND, Negation)',
      query: 'gender:Male AND !age:50',
      expected: (p) => p.gender === 'Male' && p.age !== 50,
    },
    {
      group: 'simple',
      desc: 'Simple Test 10 (OR, Negation)',
      query: 'gender:Female OR !age:30',
      expected: (p) => p.gender === 'Female' || p.age !== 30,
    },
  ];

  const testsMulti: Test[] = [
    {
      group: 'multi',
      desc: 'Multi Test 1 (AND)',
      query: 'gender:Male AND age:47',
      expected: (p) => p.gender === 'Male' && p.age === 47,
    },
    {
      group: 'multi',
      desc: 'Multi Test 2 (OR)',
      query: 'gender:Non-binary OR age:15',
      expected: (p) => p.gender === 'Non-binary' || p.age === 15,
    },
    {
      group: 'multi',
      desc: 'Multi Test 3 (NOT)',
      query: 'NOT gender:Female AND NOT age:30',
      expected: (p) => p.gender !== 'Female' && p.age !== 30,
    },
    {
      group: 'multi',
      desc: 'Multi Test 4 (Grouping)',
      query: '(gender:Male OR age:55) AND (NOT gender:Female OR age:25)',
      expected: (p) => (p.gender === 'Male' || p.age === 55) && (p.gender !== 'Female' || p.age === 25),
    },
    {
      group: 'multi',
      desc: 'Multi Test 5 (Negation)',
      query: '!age:47',
      expected: (p) => p.age !== 47,
    },
    {
      group: 'multi',
      desc: 'Multi Test 6 (AND, OR)',
      query: '(gender:Female AND age:25) OR (gender:Male OR age:55)',
      expected: (p) => (p.gender === 'Female' && p.age === 25) || p.gender === 'Male' || p.age === 55,
    },
    {
      group: 'multi',
      desc: 'Multi Test 7 (NOT, Grouping)',
      query: 'NOT (gender:Male OR age:25) AND NOT (gender:Female AND age:30)',
      expected: (p) => !(p.gender === 'Male' || p.age === 25) && !(p.gender === 'Female' && p.age === 30),
    },
    {
      group: 'multi',
      desc: 'Multi Test 8 (Negation, Grouping)',
      query: '!(gender:Female AND age:47) AND !(gender:Male OR age:25)',
      expected: (p) => !(p.gender === 'Female' && p.age === 47) && !(p.gender === 'Male' || p.age === 25),
    },
    {
      group: 'multi',
      desc: 'Multi Test 9 (AND, Negation)',
      query: 'gender:Male AND !(age:55)',
      expected: (p) => p.gender === 'Male' && p.age !== 55,
    },
    {
      group: 'multi',
      desc: 'Multi Test 10 (OR, Negation)',
      query: 'gender:Female OR !(age:25)',
      expected: (p) => p.gender === 'Female' || p.age !== 25,
    },
  ];

  const testsComplex: Test[] = [
    {
      group: 'complex',
      desc: 'Complex Test 1',
      query: '(gender:Male AND age:47) OR (gender:Female AND age:55)',
      expected: (p) => (p.gender === 'Male' && p.age === 47) || (p.gender === 'Female' && p.age === 55),
    },
    {
      group: 'complex',
      desc: 'Complex Test 2',
      query: '(gender:Non-binary OR (age:15 AND NOT gender:Male))',
      expected: (p) => p.gender === 'Non-binary' || (p.age === 15 && p.gender !== 'Male'),
    },
    {
      group: 'complex',
      desc: 'Complex Test 3',
      query:
        '((age:55 AND NOT gender:Male) OR (age:20 AND gender:Female)) AND NOT (firstName:"Ambrose" OR lastName:"Bannard")',
      expected: (p) =>
        ((p.age === 55 && p.gender !== 'Male') || (p.age === 20 && p.gender === 'Female')) &&
        !(p.firstName === 'Ambrose' || p.lastName === 'Bannard'),
    },
    {
      group: 'complex',
      desc: 'Complex Test 4',
      query: '(gender:Female OR (age:77 AND NOT gender:Male)) AND NOT (age:77 OR age:84)',
      expected: (p) =>
        (p.gender === 'Female' || (p.age === 77 && p.gender !== 'Male')) && !(p.age === 77 || p.age === 84),
    },
    {
      group: 'complex',
      desc: 'Complex Test 5',
      query: '(gender:Male OR (age:30 AND NOT gender:Female)) AND (firstName:"Kaleb" OR firstName:"Cece")',
      expected: (p) =>
        (p.gender === 'Male' || (p.age === 30 && p.gender !== 'Female')) &&
        (p.firstName === 'Kaleb' || p.firstName === 'Cece'),
    },
    {
      group: 'complex',
      desc: 'Complex Test 6',
      query:
        '((gender:Non-binary AND age:95) OR (gender:Polygender AND age:95)) AND NOT (firstName:"Kipp" OR firstName:"Francklin")',
      expected: (p) =>
        ((p.gender === 'Non-binary' && p.age === 95) || (p.gender === 'Polygender' && p.age === 95)) &&
        !(p.firstName === 'Kipp' || p.firstName === 'Francklin'),
    },
    {
      group: 'complex',
      desc: 'Complex Test 7',
      query: '(age:55 AND NOT gender:Male) OR (age:60 AND gender:Female)',
      expected: (p) => (p.age === 55 && p.gender !== 'Male') || (p.age === 60 && p.gender === 'Female'),
    },
    {
      group: 'complex',
      desc: 'Complex Test 8',
      query: '(age:35 AND NOT gender:Female) OR (age:62 AND gender:Male)',
      expected: (p) => (p.age === 35 && p.gender !== 'Female') || (p.age === 62 && p.gender === 'Male'),
    },
    {
      group: 'complex',
      desc: 'Complex Test 9',
      query: '(gender:Non-binary OR gender:Genderfluid) AND NOT (age:55)',
      expected: (p) => (p.gender === 'Non-binary' || p.gender === 'Genderfluid') && !(p.age === 55),
    },
    {
      group: 'complex',
      desc: 'Complex Test 10',
      query: '(age:20 AND NOT gender:Female) OR (age:70 AND gender:Male)',
      expected: (p) => (p.age === 20 && p.gender !== 'Female') || (p.age === 70 && p.gender === 'Male'),
    },
  ];

  const testsNested: Test[] = [
    {
      group: 'nested',
      desc: 'Nested Test 1',
      query: '(((gender:Male AND age:47))) OR (gender:Female AND age:55) AND age:30',
      //@ts-expect-error
      expected: (p) => (p.gender === 'Male' && p.age === 47) || (p.gender === 'Female' && p.age === 55 && p.age === 30),
    },
    {
      group: 'nested',
      desc: 'Nested Test 2',
      query: '(((NOT gender:Female) AND age:15)) OR (gender:Male AND age:84) AND NOT gender:Non-binary',

      expected: (p) =>
        //@ts-expect-error
        (p.gender !== 'Female' && p.age === 15) || (p.gender === 'Male' && p.age === 84 && p.gender !== 'Non-binary'),
    },
    {
      group: 'nested',
      desc: 'Nested Test 3',
      query: '((NOT age:15) OR (gender:Female OR age:55)) AND NOT age:30',
      //@ts-expect-error
      expected: (p) => (p.age !== 15 || p.gender === 'Female' || p.age === 55) && p.age !== 30,
    },
    {
      group: 'nested',
      desc: 'Nested Test 4',
      query: '((gender:Male OR age:15) OR (NOT gender:Female AND age:55)) AND NOT age:30',
      expected: (p) => (p.gender === 'Male' || p.age === 15 || (p.gender !== 'Female' && p.age === 55)) && p.age !== 30,
    },
    {
      group: 'nested',
      desc: 'Nested Test 5',
      query: '(((NOT (gender:Male OR age:15))) OR (gender:Female AND age:55)) AND age:30',
      expected: (p) =>
        ((!(p.gender === 'Male' || p.age === 15) && p.age === 30) || (p.gender === 'Female' && p.age === 55)) &&
        p.age === 30,
    },
    {
      group: 'nested',
      desc: 'Nested Test 6',
      query: '(((gender:Female AND NOT age:15)) OR (gender:Male OR age:84)) AND NOT gender:Non-binary',
      expected: (p) =>
        (p.gender === 'Female' && p.age !== 15) || ((p.gender === 'Male' || p.age === 84) && p.gender !== 'Non-binary'),
    },
    {
      group: 'nested',
      desc: 'Nested Test 7',
      query: '(((gender:Male AND NOT age:15)) OR (NOT gender:Female OR age:55)) AND NOT age:30',
      expected: (p) =>
        ((p.gender === 'Male' && p.age !== 15 && p.age === 30) || p.gender !== 'Female' || p.age === 55) &&
        p.age !== 30,
    },
    {
      group: 'nested',
      desc: 'Nested Test 8',
      query: '(((gender:Female OR age:15))) OR (NOT gender:Female AND age:55) AND age:30',
      expected: (p) => p.gender === 'Female' || p.age === 15 || (p.gender !== 'Female' && p.age === 55),
    },
    {
      group: 'nested',
      desc: 'Nested Test 9',
      query: '(((NOT gender:Male)) OR (gender:Female OR age:55)) AND NOT age:30',
      expected: (p) => (p.gender !== 'Male' || p.age === 55) && p.age !== 30,
    },
    {
      group: 'nested',
      desc: 'Nested Test 10',
      query: '((NOT gender:Female) OR (gender:Male AND age:84)) AND NOT gender:Non-binary',
      //@ts-expect-error
      expected: (p) => (p.gender !== 'Female' || (p.gender == 'Male' && p.age === 84)) && p.gender !== 'Non-binary',
    },
  ];

  const tests: Test[] = [...testsSimple, ...testsMulti, ...testsComplex, ...testsNested];

  tests.forEach((t) => {
    it(`should ${t.desc}`, () => {
      const result = filter(new QueryParser(t.query), personData);
      expect(result).toEqual(personData.filter(t.expected));
      expect(result.length).toMatchSnapshot();
    });
  });
});

describe('filter with field groups', () => {
  type Test = {
    group: 'simple' | 'multi' | 'complex' | 'nested';
    desc: string;
    query: string;
    expected: (p: (typeof personData)[0]) => boolean;
  };

  const simpleTests: Test[] = [
    {
      group: 'simple',
      desc: 'Simple Test 1',
      query: 'gender:(Male Female)',
      expected: (p) => p.gender === 'Male' || p.gender === 'Female',
    },
    {
      group: 'simple',
      desc: 'Simple Test 2 and OR',
      query: 'age:(30 OR 40)',
      expected: (p) => p.age === 30 || p.age === 40,
    },
  ];

  const multiTests: Test[] = [
    {
      group: 'multi',
      desc: 'Multi Field Test 1 and AND',
      query: 'gender:(/a/ AND /le/)',
      expected: (p) => p.gender === 'Male' || p.gender === 'Female',
    },
    {
      group: 'multi',
      desc: 'Multi Field Test 2 and OR',
      query: 'gender:(Non-binary OR Genderfluid) AND age:(15 OR 17)',
      expected: (p) => (p.gender === 'Non-binary' || p.gender === 'Genderfluid') && (p.age === 15 || p.age === 17),
    },
  ];

  const complexTests: Test[] = [
    {
      group: 'complex',
      desc: 'Complex Grouping Test 1',
      query: 'gender:(Male OR Female) AND email:/@gmail.com$/',
      expected: (p) => (p.gender === 'Male' || p.gender === 'Female') && String(p.email).endsWith('@gmail.com'),
    },
    {
      group: 'complex',
      desc: 'Complex Grouping Test 2',
      query: '(gender:(Male OR Female) OR gender:(Non-binary OR Genderfluid)) AND lastName:(/^A/ OR /^B/)',
      expected: (p) =>
        ['Male', 'Female', 'Non-binary', 'Genderfluid'].includes(p.gender) &&
        (/^A/.test(p.lastName) || /^B/.test(p.lastName)),
    },
    {
      group: 'complex',
      desc: 'Complex Grouping Test 3',
      query: 'firstName:(/^A/ OR /^B/) AND lastName:(/^C/ OR /^D/)',
      expected: (p) =>
        (/^A/.test(p.firstName) || /^B/.test(p.firstName)) && (/^C/.test(p.lastName) || /^D/.test(p.lastName)),
    },
    {
      group: 'complex',
      desc: 'Complex Grouping Test 4',
      query:
        '(firstName:(Ambrose OR Brandon) AND lastName:(Harpur OR Dunbleton)) OR (firstName:(Corette OR Kaleena) AND lastName:(Bannard OR Eady))',
      expected: (p) =>
        (p.firstName === 'Ambrose' && p.lastName === 'Harpur') ||
        (p.firstName === 'Brandon' && p.lastName === 'Dunbleton') ||
        (p.firstName === 'Corette' && p.lastName === 'Bannard') ||
        (p.firstName === 'Kaleena' && p.lastName === 'Eady'),
    },
  ];

  const nestedTests: Test[] = [
    {
      group: 'nested',
      desc: 'Nested Grouping Test 1',
      query: '(gender:(Male OR Female) OR gender:(Non-binary OR Genderfluid)) AND age:(30 OR 40)',
      expected: (p) =>
        ['Male', 'Female', 'Non-binary', 'Genderfluid'].includes(p.gender) && (p.age === 30 || p.age === 40),
    },
    {
      group: 'nested',
      desc: 'Nested Grouping Test 2',
      query: 'gender:(Male OR Female) AND (age:(20 OR 25) OR age:(30 OR 35))',
      expected: (p) =>
        (p.gender === 'Male' || p.gender === 'Female') &&
        (p.age === 20 || p.age === 25 || p.age === 30 || p.age === 35),
    },
  ];

  const tests: Test[] = [...simpleTests, ...multiTests, ...complexTests, ...nestedTests];

  tests.forEach((t) => {
    it(`should ${t.desc}`, () => {
      const result = filter(new QueryParser(t.query), personData);
      expect(result).toEqual(personData.filter(t.expected));
      expect(result.length).toMatchSnapshot();
    });
  });
});

describe(`filter`, () => {
  const testGroups = new Set(testFilterQueries.map((t) => t.group));
  testGroups.forEach((group) => {
    describe(`filter with ${group}`, () => {
      const tests = testFilterQueries.filter((t) => t.group == group);

      tests.forEach((t) => {
        it(`should ${t.desc}`, () => {
          const result = filter(
            new QueryParser(t.query),
            personData,
            new ReferenceResolver(t.variableResolver || {}, t.functionResolver),
          );
          expect(result).toEqual(personData.filter(t.expected));
          t.resultLen(result.length);
        });
      });

      if (group == 'range') {
        it.todo('should Date Range Test 1', () => {
          const query = 'date:[01-01-2022 TO 01-01-2024]';
          const data = [
            { id: 1, date: new Date('2023') },
            { id: 2, date: new Date('2021') },
          ];
          const result = filter(new QueryParser(query), data);
          expect(result).toMatchInlineSnapshot(`[]`);
        });
      }
    });
  });
});