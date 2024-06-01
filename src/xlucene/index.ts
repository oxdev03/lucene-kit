import { Node } from '../types/ast';
import { parse } from './lucene';

/**
 * Class representing a Lucene query parser.
 */
export default class QueryParser {
  private cachedAst?: Node;

  /**
   * Creates an instance of QueryParser.
   * @param luceneQuery The Lucene query string to parse.
   */
  constructor(private readonly luceneQuery: string) {}

  /**
   * Parses the Lucene query string into an abstract syntax tree (AST).
   * @returns The QueryParser instance
   */
  parse() {
    this.toAST();
    return this;
  }

  private cacheAst() {
    if (!this.cachedAst) {
      this.cachedAst = parse(this.luceneQuery);
    }

    return this.cachedAst!;
  }

  /**
   * Converts the Lucene query string to an abstract syntax tree (AST).
   * @returns The abstract syntax tree (AST) representing the parsed query.
   */
  toAST() {
    return this.cacheAst();
  }
}
