import QueryParser from './query';
import ReferenceResolver from './resolver';

type FieldMapping = {
    [key:string]: string
}

export default function filter(queryInstance: QueryParser, data: any[], fieldMapping: FieldMapping,resolver?: ReferenceResolver) {
    const ast = queryInstance.toAST();    
}
