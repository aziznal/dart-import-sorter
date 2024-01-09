import { SubSortingRule } from './sorting-rule';
import { ImportStatement } from './import-statement';

export type StatementGroup = {
    groupRegex: RegExp;
    imports: ImportStatement[];
    order: number;
    subgroupSortingRules?: SubSortingRule[];
};
