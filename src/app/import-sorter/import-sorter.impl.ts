import { inject, injectable } from 'tsyringe';

import { IExtensionSettings } from '../extension-settings/extension-settings.interface';
import { IImportSorter, SortingResult } from './import-sorter.interface';

import { ImportUtils } from '../import-utils/import-utils';
import { ImportGroup } from '../types/import-group';

/**
 * Sorts imports using a basic grouping algorithm.
 */
@injectable()
export class ImportSorter implements IImportSorter {
    constructor(@inject('IExtensionSettings') public settings: IExtensionSettings) {}

    sortImports(rawDocumentBody: string): SortingResult {
        const formattedImports = ImportUtils.extractFormattedImports(rawDocumentBody);

        if (formattedImports.length === 0) {
            return { sortedImports: '', firstRawImportIndex: -1, lastRawImportIndex: -1 }; // nothing to sort
        }

        const groups = this.groupImports(formattedImports);

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

    private groupImports(importStatements: string[]): ImportGroup[] {
        let copiedImportStatements = importStatements.slice();

        const importGroups: ImportGroup[] = [];

        this.settings.sortingRules.forEach((preference) => {
            const matchingStatements = copiedImportStatements.filter((statement) =>
                preference.regex.test(ImportUtils.getImportPath(statement))
            );

            importGroups.push({
                groupRegex: preference.regex,
                order: preference.order,
                imports: matchingStatements,
            });

            // remove matching statements so they don't match again with later regex
            copiedImportStatements = copiedImportStatements.filter(
                (statement) => !matchingStatements.includes(statement)
            );
        });

        // if there are imports that don't match anything, throw them at the end
        if (copiedImportStatements.length > 0) {
            importGroups.push({
                groupRegex: /.*/gm,
                imports: copiedImportStatements,
                order: Math.max(...importGroups.map((group) => group.order)) + 1,
            });
        }

        return importGroups;
    }

    private flattenImportGroups(groups: ImportGroup[]): string {
        groups = groups.sort((groupA, groupB) => groupA.order - groupB.order);

        const concattedGroups = groups
            .map((group) => {
                return group.imports.join('\n');
            })
            .join(this.settings.leaveEmptyLinesBetweenImports ? '\n\n' : '\n');

        return concattedGroups;
    }
}
