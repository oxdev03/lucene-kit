import { expect, test, describe, it } from 'vitest';
import { parse } from '../../xlucene/lucene';

describe('Lucene Parser', () => {
  const tests = [
    // Simple Queries
    { query: 'query', description: 'simple query' },
    { query: 'query', description: 'simple query with !' },
    { query: 'anotherQuery', description: 'another simple query' },

    // Edge Cases
    { query: '', description: 'empty query' },
    { query: '*:*', description: 'match all query' },
    { query: 'field:', description: 'field with no value' },

    // Boolean Queries
    { query: 'title:"The Right Way" AND text:go', description: 'AND operator' },
    { query: 'title:"The Right Way" OR text:go', description: 'OR operator' },
    { query: 'title:"The Right Way" NOT text:go', description: 'NOT operator' },
    { query: 'title:"The Right Way" AND NOT text:go', description: 'AND NOT combination' },
    { query: 'title:"The Right Way" AND !text:go', description: 'AND ! combination' },

    // Grouping
    { query: '(apple OR banana) AND (red OR yellow)', description: 'grouping with OR and AND' },
    { query: '(title:foo AND body:bar) OR (title:baz AND body:qux)', description: 'nested groups' },
    { query: 'title:foo (bar AND baz)', description: 'field and grouped terms' },

    // Escaping
    { query: 'field:name:value', description: 'escaped field name' },
    { query: 'field:foo\\-bar', description: 'escaped hyphen' },
    { query: 'field:"a phrase with \\"escaped quotes\\""', description: 'escaped quotes in phrase' },

    // Wildcards
    { query: 'field:foo*', description: 'trailing wildcard' },
    { query: 'field:*foo', description: 'leading wildcard' },
    { query: 'field:f*o', description: 'infix wildcard' },
    { query: 'field:?oo', description: 'single character wildcard' },

    // Proximity Searches TODO: Patch proximity support to xlucene
    // { query: '"jakarta apache"~10', description: 'proximity search' },
    // { query: 'roam~', description: 'fuzzy search with default similarity' },
    // { query: 'roam~0.8', description: 'fuzzy search with similarity specified' },

    // Boosting TODO: Patch boost support to xlucene
    // { query: 'jakarta^4 apache', description: 'boosting term' },
    // { query: '"jakarta apache"^4 "Apache Lucene"', description: 'boosting phrase' },

    // Range Searches
    { query: 'date:[20020101 TO 20030101]', description: 'inclusive range search' },
    { query: 'date:{20020101 TO 20030101}', description: 'exclusive range search' },
    { query: 'field:[* TO 100]', description: 'range with open start' },
    { query: 'field:[100 TO *]', description: 'range with open end' },

    // Regex
    { query: 'field:/[a-z]+/', description: 'basic regex' },
    { query: 'field:/\\d{2,4}/', description: 'regex with quantifier' },
    { query: 'field:/\\d+\\.\\d*/', description: 'regex with escaped characters' },

    // Combinations and Complex Cases
    { query: 'title:foo AND (bar OR baz) AND -qux', description: 'AND with grouped OR and NOT' },
    { query: '((title:foo AND body:bar) OR (title:baz AND body:qux))', description: 'complex nested groups' },
    { query: '+title:foo -body:bar', description: 'mandatory and prohibited terms' },
    { query: '_exists_:title', description: 'exists query' },
    { query: '_missing_:title', description: 'missing query' },

    // Queries with Special Characters
    { query: 'field:"C:\\\\Users\\\\name"', description: 'escaped backslashes in path' },
    { query: 'field:"foo\\ bar"', description: 'escaped space in phrase' },
    { query: 'field:"foo/bar"', description: 'slash in phrase' },

    // Nested Fields
    { query: 'field1:foo AND (field2:bar OR field3:baz)', description: 'different fields in groups' },
    { query: 'field1:(foo AND bar) OR field2:(baz AND qux)', description: 'nested groups with different fields' },

    // Complex Boolean Logic
    { query: '(title:"foo bar" AND body:qux) OR (title:baz AND body:quux)', description: 'nested AND/OR' },
    {
      query: '((title:foo AND body:bar) OR (title:baz AND body:qux)) AND (date:[20200101 TO 20210101])',
      description: 'nested groups with range',
    },

    // Mixed Case Sensitivity
    { query: 'Title:Foo AND body:Bar', description: 'mixed case field names' },
    { query: 'TITLE:Foo AND BODY:Bar', description: 'uppercase field names' },

    // Punctuation and Special Characters
    { query: 'title:"Hello, World!"', description: 'phrase with punctuation' },
    { query: 'title:foo+bar', description: 'plus sign in term' },
    { query: 'title:foo-bar', description: 'hyphen in term' },

    // Numeric Fields
    { query: 'age:[10 TO 20]', description: 'numeric range' },
    { query: 'price:>=10', description: 'greater than or equal to' },
    { query: 'price:<=20', description: 'less than or equal to' },
    { query: 'price:-20', description: 'negative number' },

    // Date Fields
    { query: 'date:[2020-01-01 TO 2021-01-01]', description: 'date range' },
    { query: 'date:{2020-01-01 TO 2021-01-01}', description: 'exclusive date range' },

    // Wildcard in Field Names
    { query: 'field*:foo', description: 'wildcard in field name' },
    { query: 'field?name:foo', description: 'single character wildcard in field name' },

    // Queries with Non-ASCII Characters
    { query: 'title:日本語', description: 'query with Japanese characters' },
    { query: 'title:汉字', description: 'query with Chinese characters' },
    { query: 'title:한국어', description: 'query with Korean characters' },

    // Queries with Accents
    { query: 'title:résumé', description: 'query with accented characters' },

    // Nested Complex Queries
    {
      query: '(title:(foo OR bar) AND body:(baz OR qux)) AND date:[20200101 TO 20210101]',
      description: 'nested complex with range',
    },
    {
      query: '((title:foo AND body:bar) OR (title:baz AND body:qux)) AND (status:active OR status:pending)',
      description: 'nested complex with multiple fields',
    },

    // Combinations of Everything
    {
      query: '(title:"foo bar" AND body:(qux OR quux)) OR (date:[20200101 TO 20210101] AND status:active)',
      description: 'combination of phrases, fields, ranges, and boolean logic',
    },

    // xLucene Addition: Variables
    {
      query: 'title:$refTitle AND $refTitle',
      description: 'variable reference',
    },
    /*
    Todo: fix escaping vars
    {
      query: 'title:\$refTitle',
      description: 'escaped variable reference',
    }, 
    */
    {
      query: 'title:ref$title',
      description: 'not a variable reference',
    },
    
    // xLucene Addition: Functions
    {
      query: 'field:func(val:"quoted", val2:500, val3:    with spaces)',
      description: 'query with function',
    }
  ];

  tests.forEach((test) => {
    it(`should parse ${test.description}`, () => {
      expect(parse(test.query)).toMatchSnapshot();
    });
  });
});
