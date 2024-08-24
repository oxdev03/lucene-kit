#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const peg = require('peggy');
const tspegjs = require('ts-pegjs');

function generate() {
  const input = path.join(__dirname, '..', 'src', 'xlucene', 'grammar', 'lucene.pegjs');
  const output = path.join(__dirname, '..', 'src', 'xlucene', 'lucene.ts');

  const current = fs.existsSync(output) && fs.readFileSync(output, 'utf8');
  const grammar = fs.readFileSync(input, 'utf8');
  const updated = peg.generate(grammar, {
    output: 'source',
    optimize: 'speed',
    plugins: [tspegjs],
    parser: {},
    format: 'commonjs',
    tspegjs: {
      noTslint: true,
      customHeader: `//@ts-nocheck\nimport { propagateDefaultField, validateScopedChars } from "./helpers";\nimport { NodeType } from "../types/ast";`,
    },
  });

  if (current === updated) return null;
  fs.writeFileSync(output, updated, 'utf8');
  return output;
}

if (require.main === module) {
  const outputFile = generate();
  if (outputFile) {
    console.error(`* generated ${path.relative(process.cwd(), outputFile)}`);
  }
} else {
  module.exports = generate;
}
