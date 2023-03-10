import { inject, injectable } from 'tsyringe';

import { ImportStatement } from '../types/import-statement.model';

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
        const strippedImports = ImportUtils.findAllImports(rawDocumentBody);

        if (strippedImports.length === 0) {
            return { sortedImports: '', firstRawImportIndex: -1, lastRawImportIndex: -1 }; // nothing to sort
        }

        const groups = this.groupImports(strippedImports);

        groups.forEach((group) => {
            group.imports = ImportUtils.sortAlphabetically(group.imports);
        });

        const nonEmptyGroups = ImportUtils.removeEmptyGroups(groups);

        return {
            sortedImports: this.flattenImportGroups(nonEmptyGroups),
            firstRawImportIndex: ImportUtils.lineNumberOfFirstImport(strippedImports),
            lastRawImportIndex: ImportUtils.lineNumberOfLastImport(strippedImports),
        };
    }

    private groupImports(strippedImports: ImportStatement[]): StatementGroup[] {
        let statements = strippedImports.slice();

        const groups: StatementGroup[] = [];

        this.settings.sortingRules.forEach((preference) => {
            const matchingStatements = statements.filter((statement) =>
                preference.regex.test(statement.path)
            );

            groups.push({
                groupRegex: preference.regex,
                order: preference.order,
                imports: matchingStatements,
            });

            // remove matching statements so they don't match again with later regex
            statements = statements.filter((statement) => !matchingStatements.includes(statement));
        });

        // if there are remaining imports that don't match anything, throw them at the end
        if (statements.length > 0) {
            groups.push({
                groupRegex: /.*/gm,
                imports: statements,
                order: Math.max(...groups.map((group) => group.order)) + 1,
            });
        }

        return groups;
    }

    private flattenImportGroups(groups: StatementGroup[]): string {
        groups = groups.sort((groupA, groupB) => groupA.order - groupB.order);

        const concattedGroups = groups
            .map((group) => {
                return group.imports.map((statement) => statement.rawBody).join('\n');
            })
            .join(this.settings.leaveEmptyLinesBetweenImports ? '\n\n' : '\n');

        return concattedGroups;
    }
}
