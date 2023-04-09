import { SubgroupingPreference } from './grouping-preference.model';
import { ImportStatement } from './import-statement.model';

export interface StatementGroup {
    groupRegex: RegExp;
    imports: ImportStatement[];
    order: number;
    subgroupSortingRules?: SubgroupingPreference[];
}
