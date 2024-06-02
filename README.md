# Lucene-Kit

[![npm version](https://badge.fury.io/js/lucene-kit.svg)](https://badge.fury.io/js/lucene-kit)
[![Build Status](https://github.com/oxdev03/lucene-kit/actions/workflows/release.yml/badge.svg)](https://github.com/oxdev03/lucene-kit/actions)
[![Coverage Status](https://coveralls.io/repos/github/oxdev03/lucene-kit/badge.svg?branch=main)](https://coveralls.io/github/oxdev03/lucene-kit?branch=main)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/lucene-kit.svg)](https://www.npmjs.com/package/lucene-kit)

Lucene-Kit offers a lightweight and extended Lucene-like parser, search engine, and serializer for JavaScript and TypeScript applications.

## Key Features

- Serialize complex search queries
- Conduct in-memory searches on JSON documents/objects
- Leverage features beyond Lucene including **Regex**, **Variables**, and **Functions**
  - Save queries inside Variables (see below)
  - Filter data through functions
  - Resolve to values
- Customize and parse your own search queries with ease

# Table of Contents

1. [Lucene-Kit](#lucene-kit)
2. [Key Features](#key-features)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Usage](#usage)
   1. [CommonJS (CJS) Usage](#commonjs-cjs-usage)
   2. [ECMAScript Modules (ESM) Usage](#ecmascript-modules-esm-usage)
   3. [Search and Filtering Usage](#search-and-filtering-usage)
   4. [Serializer Usage](#serializer-usage)
6. [Query Syntax](#query-syntax)
   1. [Grammar](#grammar)
   2. [Syntax Cheat Sheet](#syntax-cheat-sheet)
      - [String](#string)
      - [Number](#number)
      - [Boolean](#boolean)
      - [Range](#range)
      - [Wildcard](#wildcard)
      - [Regex](#regex)
      - [Fields](#fields)
      - [Logical Operations](#logical-operations)
      - [Field Group](#field-group)
      - [Variables](#variables)
        - [Use Cases](#use-cases)
        - [Usage](#usage-1)
      - [Functions](#functions)
        - [Use Cases](#use-cases-1)
        - [Syntax](#syntax)
        - [Usage](#usage-2)
7. [Limitations](#limitations)
   1. [Lucene Features](#lucene-features)
   2. [Search/Filter](#searchfilter)
8. [Contributing](#contributing)
9. [Credits](#credits)
10. [License](#license)

## Requirements

- Node.js / Browser

## Installation

```bash
npm install lucene-kit
```

## Usage

Lucene-Kit supports both CommonJS (CJS) and ECMAScript modules (ESM).

### CommonJS (CJS) Usage

```javascript
const { filter, QueryParser } = require('lucene-kit');

console.log(filter(new QueryParser('age:12'), data));
```

### ECMAScript modules (ESM) Usage

```javascript
import { filter, QueryParser } from 'lucene-kit';

console.log(filter(new QueryParser('age:12'), data));
```

### Search and Filtering Usage

```typescript
const data = [
  { id: 1, gender: 'Male', firstName: 'Ambrose', age: 47 },
  { id: 2, gender: 'Non-binary', firstName: 'Jarid', age: 15 },
  { id: 3, gender: 'Female', firstName: 'Corette', age: 55 },
  { id: 4, gender: 'Female', firstName: 'Kaleena', age: 77 },
  { id: 5, gender: 'Male', firstName: 'Brennen', age: 84 },
];

// Helper function, just for demo
const $q = (q) => new QueryParser(q);

filter($q('age:47'), data);
filter($q('age:[0 TO 80]'), data);
filter($q('gender:*ale OR age:>55'), data);
```

### Serializer Usage

```typescript
// Returns the AST (Abstract Syntax Tree)
const ast = new QueryParser('gender:*ale OR age:>55').toAST();
```

You can evaluate the AST similarly to [evaluate.ts](./src/handlers/evaluate.ts). Refer to the [fixtures](./src/tests/xlucene/__snapshots__/parser.test.ts.snap) for numerous examples of serialized queries. Import the typings of the AST from [ast.ts](./src/types/ast.ts). Additionally, utilize various [type guards](./src/types/guards.ts) when iterating through the AST.

## Query Syntax

### Grammar

The Lucene Grammar is completely based on the implementation of [xlucene-parser](https://github.com/terascope/teraslice/tree/master/packages/xlucene-parser), using `peggyjs` for the [grammar](./src/xlucene/grammar/lucene.pegjs). Its based on Lucene but extends it with additional terms like regex, variable and functions.

### Syntax Cheat Sheet

#### String

```rb
# Search for the word anywhere in the object (case insensitive)
word

# Search for the word anywhere in the object (exact match, case sensitive)
'word'
"word"
```

#### Number

```rb
# Search for age greater than, greater than or equal to, less than, less than or equal to
age:100
age:>100
age:>=100
age:<100
age:<=100
```

#### Boolean

```rb
male:true
male:false
```

#### Range

```rb
# Search within a range (from, to)
age:[0 TO 20]

# Search within a range (from, infinity) (-infinity, to)
age:[0 TO *]
age:[* TO 20]
```

#### Wildcard

```rb
# Trailing wildcard: matches everything containing 'word' and everything after it
word*

# Leading wildcard: matches everything containing 'word' and everything before it
*word

# Infix wildcard: matches everything containing 'w' and 'ord' with any characters in between
w*rd

# Single character wildcard: matches everything containing 'w' and 'ord' with any single character in between
w?rd

# Mixed wildcard: combination of all wildcards
*t?ain
```

#### Regex

```rb
# Basic regex: supports the whole JavaScript regex subset
/[a-z]+/

# Regex with escaped characters
/\d+\.\d*/

# Regex with flags
/test/i
```

#### Fields

```rb
# Search for 'word' in the object property 'sentence'
sentence:word

# Search for 'word' in the object properties starting with 's' and any nested property, e.g., [{s: {a: 'word'}}]
s*:word

# Search for 'word' in the object by nested key 's.a'
s.a:word

# Search for 'word' in the object by nested key, where '?' can be any character, e.g., [{s: {a: 'word'}, r: {a: 'word'}}]
?.a:word

# Search for 'word' in the object by nested key, where '*' can represent any string, e.g., [{sentence_one: {a: 'word'}, sentence_two: {a: 'word'}}]
*.a:word

# Previously mentioned syntax can be combined with fields
s:/word/

s:w?r*

age:[0 TO 20]
```

#### Logical Operations

```rb
# Conjunction: Both conditions must be true
gender:Male AND age:47

# Disjunction: Either condition must be true
gender:Non-binary OR age:15

# Negation: Excludes documents that match the specified condition
NOT gender:Female

# Negation with '!' before field
!gender:Female

# Mixing with nesting and grouping
(gender:Male AND age:40) OR (NOT gender:Female)
gender:Female AND (age:20 OR age:60)
NOT (gender:Male OR age:20)
!(gender:Female AND (age:40 OR age:50))
((age:55 AND NOT gender:Male) OR (age:20 AND gender:Female)) AND NOT (firstName:"Ambrose" OR lastName:"Bannard")
```

#### Field Group

```rb
# Field gender includes Male or Female
gender:(Male Female)
gender:(Male OR Female)
gender:(/a/ AND /le/)

# Combination of previously used syntax
(firstName:(Ambrose OR Brandon) AND lastName:(Harpur OR Dunbleton)) OR (firstName:(Corette OR Kaleena) AND lastName:(Bannard OR Eady))
```

#### Variables

The Variable feature is an addition beyond Lucene grammar with the following use cases:

##### Use Cases

- Saving frequently used values
- Saving long values for better experience
- Specifying values that are generic
- Specifying values that are scoped to a field
- Saving queries as values

##### Usage

The `ReferenceResolver` class is used to resolve variable references. Valid variable references are specified using `$name` or `@name` (scoped) in the query. The references are resolved during runtime.

1. When the query is evaluated, it resolves the reference, supporting the use case of saving long values or just values.

   ```typescript
   import { filter, QueryParser, ReferenceResolver } from 'lucene-kit';

   console.log(
     filter(new QueryParser('gender:$nb'), data, new ReferenceResolver().addVariableResolver('nb', 'Non-Binary')),
   );
   ```

2. The Reference Resolver also passes the variable node, so you can determine the field and if the variable is scoped, supporting the use case of generic values, values based on the field, and more.

   ```typescript
   import { filter, QueryParser, ReferenceResolver, VariableNode } from 'lucene-kit';

   const resolver = new ReferenceResolver();
   resolver.addVariableResolver('nb', (node: VariableNode) => {
     if (node.field == 'gender') {
       return 'Non-Binary';
     } else {
       return node.scoped ? 'some value' : 'default value';
     }
   });

   console.log(filter(new QueryParser('gender:$nb'), data, resolver));
   ```

3. It's also possible to resolve new queries, supporting use cases like saving often-used queries or evaluating terms to queries.

   ```typescript
   import { filter, QueryParser, ReferenceResolver } from 'lucene-kit';

   const resolver = new ReferenceResolver();
   resolver.addVariableResolver('kid', new QueryParser('kid:[0 TO 14]'));
   resolver.addVariableResolver(
     'adult',
     (node) => /* also possible with functions*/ new QueryParser('adult:[18 TO *]'),
   );

   // $kid resolves to kid:[0 TO 14] => firstName:A* AND kid:[0 TO 14]
   console.log(filter(new QueryParser('firstName:A* AND $kid'), data, resolver));
   ```

#### Functions

The Function feature extends Lucene grammar, offering versatile use cases:

##### Use Cases

- Utilizing parameters and current data
- Resolving to a value
- Filtering the current data
- Evaluating queries based on data or parameters

##### Syntax

```rb
# Function without parameters
field:func()

# Function with arguments
field:func(arg1 arg2 arg3)
field:func(arg1, arg2, arg3)

# Function with parameters
field:func(param1:value param2:value2)

# Function with parameters containing term lists or tuples
field:func(list:[a b [c [d e] [f g]]])

# Function with references to variables, variable reference should only resolve to values
field:func($nb)
```

##### Usage

The `ReferenceResolver` class resolves function references during runtime. Functions can only be evaluated if a field is specified.

The `FunctionNode` and the current data is passed to the callback. Currently, there are no helpers, so parameters need to be parsed manually.

Below is an example demonstrating the usage of parameters, filtering data, resolving values, and more:

```typescript
import { filter, QueryParser, ReferenceResolver } from 'lucene-kit';

const resolver = new ReferenceResolver().addFunctionResolver('mature', (node, data) => {
  const { params } = node.params;
  // Perform operations based on parameters
  const level = params.find(...);
  if (level <= 1) {
    // Filter the current data
    return { data: data.filter(p => p.age >= 14 && p.age <= 18) };
  } else if (level <= 10) {
    // Return a query to be evaluated
    return new QueryParser('age:[20 TO 30]');
  } else {
    // Resolve a value
    return 99;
  }
});

console.log(filter(new QueryParser('age:maturity(level:1)'), data, resolver));
```

## Limitations

### Lucene Features

The following Lucene features are not currently supported but may be added in the future:

- [Fuzzy Searches](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Fuzzy%20Searches)
- [Proximity Searches](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Proximity%20Searches)
- [Boosting a Term](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Boosting%20a%20Term)

### Search/Filter

The following filters are not yet supported:

- Date Ranges (e.g., `date_field:['2021' TO '2024']`)
- Iterating over Array Object key without index like (e.g., `field.key_in_array`, working `field.*.key_in_array`)

## Contributing

Contributions to [lucene-kit](https://github.com/oxdev03/lucene-kit) are welcome! If you'd like to contribute, please follow these guidelines:

1. Fork the repository on GitHub.

2. Create a new branch from the `master` branch for your changes.

3. Make your modifications and ensure they adhere to the project's coding standards.

4. Commit your changes with commit messages following the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) style guide.

5. Push your branch to your forked repository.

6. Submit a pull request to the `master` branch of the main [lucene-kit](https://github.com/oxdev03/lucene-kit) repository.

## Credits

The [Grammar](./src/xlucene/grammar/lucene.pegjs) is entirely based on the implementation of [xlucene-parser](https://github.com/terascope/teraslice/tree/master/packages/xlucene-parser). Huge thanks to them, and consider giving them a star on GitHub

## License

Lucene-Kit is released under the [MIT License](https://opensource.org/licenses/mit). For more information, please refer to the [LICENSE](./LICENSE) file.
