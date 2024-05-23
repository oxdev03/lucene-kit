import { Node } from '../types/ast';
import { parse } from '../xlucene/lucene';

export default class QueryParser {
  private cachedAst?: Node;

  constructor(private readonly lucenceQuery: string) {}

  parse() {
    this.toAST() 
    return this; 
  }

  private cacheAst() {
    if(!this.cachedAst) {
      this.cachedAst = parse(this.lucenceQuery);
    }
    
    return this.cachedAst!;
  }

  toAST() {
    return this.cacheAst();
  }
}
