import { PersonData } from '../data-person';
import { FunctionResolver, VariableResolver } from '../../../handlers/resolver';
import testVariableQueries from './variable-queries';
import testFunctionQueries from './function-queries';
import testRangeQueries from './range-queries';
import testWildCardQueries from './wilcard-queries';
import testRegexQueries from './regex-queries';
import testFieldGroupQueries from './field-group-queries';
import testLogicalQueries from './logical-queries';

export type TestFilterQuery = {
  group: string;
  difficulty: string;
  desc: string;
  query: string;
  expected: (p: PersonData) => boolean;
  resultLen: (len: number) => void;
  functionResolver?: FunctionResolver;
  variableResolver?: VariableResolver;
};

const testFilterQueries: TestFilterQuery[] = [
  ...testLogicalQueries,
  ...testFieldGroupQueries,
  ...testRegexQueries,
  ...testWildCardQueries,
  ...testRangeQueries,
  ...testVariableQueries,
  ...testFunctionQueries,
];

export default testFilterQueries;
