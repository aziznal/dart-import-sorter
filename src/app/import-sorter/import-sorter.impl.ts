import { inject, injectable } from 'tsyringe';

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
        const strippedImports = ImportUtils.extractFormattedImports(rawDocumentBody);

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
            firstRawImportIndex: ImportUtils.indexOfFirstImport(rawDocumentBody.split('\n')),
            lastRawImportIndex: ImportUtils.indexOfLastImport(rawDocumentBody.split('\n')),
        };
    }

    private groupImports(strippedImports: string[]): StatementGroup[] {
        let statements = strippedImports.slice();

        const groups: StatementGroup[] = [];

        this.settings.sortingRules.forEach((preference) => {
            const matchingStatements = statements.filter((statement) =>
                preference.regex.test(ImportUtils.getImportPath(statement))
            );

            groups.push({
                groupRegex: preference.regex,
                order: preference.order,
                imports: matchingStatements,
            });

            // remove matching statements so they don't match again with later regex
            statements = statements.filter((statement) => !matchingStatements.includes(statement));
        });

        // if there are imports that don't match anything, throw them at the end
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
                return group.imports.join('\n');
            })
            .join(this.settings.leaveEmptyLinesBetweenImports ? '\n\n' : '\n');

        return concattedGroups;
    }
}
