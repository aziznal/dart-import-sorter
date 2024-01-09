import { SubSortingRule, SortingRule } from '../types/sorting-rule';
import { inject, injectable } from 'tsyringe';

import { ImportStatement } from '../types/import-statement';

import { IExtensionSettings } from '../extension-settings/extension-settings.interface';
import { IImportSorter, SortingResult } from './import-sorter.interface';

import { ImportUtils } from '../import-utils/import-utils';
import { StatementGroup } from '../types/statement-group';

/**
 * Sorts imports using a basic grouping algorithm.
 */
@injectable()
export class ImportSorter implements IImportSorter {
    constructor(@inject('IExtensionSettings') public settings: IExtensionSettings) {}

    sortImports(rawDocumentBody: string): SortingResult {
        const imports = ImportUtils.findAllImports(rawDocumentBody);

        // if none or only one statement, don't sort
        if (imports.length === 0 || imports.length === 1) {
            return { sortedImports: '', firstRawImportIndex: -1, lastRawImportIndex: -1 }; // nothing to sort
        }

        const groups = this.#groupImports(imports, this.settings.sortingRules);

        groups.forEach((group) => {
            if (!group.subgroupSortingRules) {
                group.imports = ImportUtils.sortAlphabetically(group.imports);
                return;
            }

            group.imports = this.#sortGroup(group.imports, group.subgroupSortingRules);
        });

        const nonEmptyGroups = ImportUtils.removeEmptyGroups(groups);

        return {
            sortedImports: this.#flattenImportGroups(nonEmptyGroups),
            firstRawImportIndex: ImportUtils.lineNumberOfFirstImport(imports),
            lastRawImportIndex: ImportUtils.lineNumberOfLastImport(imports),
        };
    }

    #groupImports(
        imports: ImportStatement[],
        rules: SortingRule[] | SubSortingRule[]
    ): StatementGroup[] {
        let statements = imports.slice();

        const groups: StatementGroup[] = [];

        rules.forEach((rule) => {
            const matchingStatements = statements.filter((statement) =>
                rule.regex.test(statement.path)
            );

            groups.push({
                groupRegex: rule.regex,
                order: rule.order,
                imports: matchingStatements,
                subgroupSortingRules:
                    rule._type === 'SortingRule' ? rule.subgroupSortingRules : undefined,
            });

            // remove matching statements so they don't match again later
            statements = statements.filter((statement) => !matchingStatements.includes(statement));
        });

        // any non-matching statements go at the end
        if (statements.length > 0) {
            groups.push({
                groupRegex: /.*/gm,
                imports: statements,
                order: Math.max(...groups.map((group) => group.order)) + 1,
            });
        }

        return groups;
    }

    #sortGroup(imports: ImportStatement[], rules: SubSortingRule[]): ImportStatement[] {
        let unsortedStatements = imports.slice();
        let sortedStatements: ImportStatement[] = [];

        rules.forEach((rule) => {
            const matchingStatements = unsortedStatements.filter((statement) =>
                rule.regex.test(statement.path)
            );

            sortedStatements.push(...matchingStatements);

            // remove matching statements so they don't match again later
            unsortedStatements = unsortedStatements.filter(
                (statement) => !matchingStatements.includes(statement)
            );
        });

        // any non-matching statements go at the end
        if (unsortedStatements.length > 0) {
            sortedStatements.push(...unsortedStatements);
        }

        return sortedStatements;
    }

    #flattenImportGroups(groups: StatementGroup[]): string {
        groups = groups.sort((groupA, groupB) => groupA.order - groupB.order);

        const concattedGroups = groups
            .map((group) => {
                return group.imports.map((statement) => statement.rawBody).join('\n');
            })
            .join(this.settings.leaveEmptyLinesBetweenImports ? '\n\n' : '\n');

        return concattedGroups;
    }
}
