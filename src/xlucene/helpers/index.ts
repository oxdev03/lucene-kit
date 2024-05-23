import * as i from '../../types/ast'
import * as utils from '../../types/guards'

function validateScopedChars(chars: string[]) {
  chars.forEach((char, ind) => {
    if (char === '.' && chars[ind + 1] === '.') {
      throw new Error(`Invalid scoped variable "@${chars.join('')}", char "." cannot be next to another "." char`);
    }
  });
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

export { propagateDefaultField, validateScopedChars };
