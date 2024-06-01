import { expect } from 'vitest';
import { TestFilterQuery } from '.';
import { QueryParser } from '../../..';
import { PersonData } from '../data-person';

const testFunctionQueries: TestFilterQuery[] = [
  {
    group: 'function',
    difficulty: 'simple',
    desc: 'Simple Function Test 1',
    query: 'age:determine($a) AND age:determine2($b)',
    expected: (p) => p.age >= 0 && p.age <= 16,
    functionResolver: {
      determine: (node) => {
        const firstParameter = node.params[0] as any;
        if (firstParameter.value.value == 'kid') {
          return new QueryParser('age:[0 TO 16]');
        }
      },
      determine2: () => {
        return { resolved: new QueryParser('age:[0 TO 16]') };
      },
    },
    variableResolver: {
      a: () => 'kid',
    },
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`21`),
  },
  {
    group: 'function',
    difficulty: 'simple',
    desc: 'Simple Function Test 2',
    query: 'age:tuple(t:[a [b [$c]]]) OR field:undefined_func()',
    expected: (p) => p.age >= 0 && p.age <= 16,
    functionResolver: {
      tuple: (node, data: PersonData[]) => {
        const tParam = node.params.find((p) => p.field == 't')!;
        expect(tParam.value).toMatchInlineSnapshot(`
          [
            {
              "type": "value",
              "value": "a",
            },
            [
              {
                "type": "value",
                "value": "b",
              },
              [
                {
                  "type": "value",
                  "value": "c",
                },
              ],
            ],
          ]
        `);

        return {
          data: data.filter((p) => p.age >= 0 && p.age <= 16),
        };
      },
    },
    variableResolver: {
      c: 'c',
    },
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`21`),
  },
  {
    group: 'function',
    difficulty: 'simple',
    desc: 'Simple Function Test 3',
    query: 'age:tuple(param1 t:[[a][b]] , c:12 d:11)',
    expected: (p) => p.age == 16,
    functionResolver: {
      tuple: (node, data) => {
        expect(node.params).toMatchInlineSnapshot(`
            [
              {
                "field": null,
                "quoted": false,
                "restricted": true,
                "type": "term",
                "value": {
                  "type": "value",
                  "value": "param1",
                },
              },
              {
                "field": "t",
                "type": "term-list",
                "value": [
                  [
                    {
                      "type": "value",
                      "value": "a",
                    },
                  ],
                  [
                    {
                      "type": "value",
                      "value": "b",
                    },
                  ],
                ],
              },
              {
                "field": "c",
                "type": "term",
                "value": {
                  "type": "value",
                  "value": 12,
                },
              },
              {
                "field": "d",
                "type": "term",
                "value": {
                  "type": "value",
                  "value": 11,
                },
              },
            ]
          `);

        return {
          resolved: 16,
        };
      },
    },
    variableResolver: {
      c: 'c',
    },
    resultLen: (len) => expect(len).toMatchInlineSnapshot(`0`),
  },
];

export default testFunctionQueries;
