/*
 * This file includes the helpers for the grammar implementation that was adapted from @terascope/teraslice.
 * The original XLucene implementation can be found at https://github.com/terascope/teraslice/blob/master/packages/xlucene-parser.
 *
 * Copyright (c) 2018
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as i from '../../types/ast';
import * as utils from '../../types/guards';

/* v8 ignore start */
// Ignore coverage for grammar specific validation

function validateScopedChars(chars: string[]) {
  for (const [idx, char] of chars.entries()) {
    if (char === '.' && chars[idx + 1] === '.') {
      throw new Error(`Invalid scoped variable "@${chars.join('')}", char "." cannot be next to another "." char`);
    }
  }
}

/**
 * Propagate the default field on a field group expression
 */
function propagateDefaultField(node: i.Node, field: string): void {
  if (!node) return;

  if (utils.isRange(node)) {
    node.field ??= field;
    return;
  }

  if (utils.isTermType(node)) {
    node.field ??= field;
    return;
  }

  if (utils.isNegation(node)) {
    propagateDefaultField(node.node, field);
    return;
  }

  if (utils.isGroupLike(node)) {
    for (const conj of node.flow) {
      propagateDefaultField(conj, field);
    }
    return;
  }

  if (utils.isConjunction(node)) {
    for (const conj of node.nodes) {
      propagateDefaultField(conj, field);
    }
  }
}
/* v8 ignore stop */

export { propagateDefaultField, validateScopedChars };
