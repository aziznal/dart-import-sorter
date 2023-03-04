import { ImportStatement } from './import-statement.model';

export type StatementGroup = {
    groupRegex: RegExp;
    imports: ImportStatement[];
	order: number;
};
