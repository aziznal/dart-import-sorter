import { IImportSorter } from './import-sorter.interface';

import { ExtensionSettings } from '../extension-settings/extension-settings.impl';
import { ImportGroup } from '../types/import-group';

/**
 * Sorts imports using a basic grouping algorithm.
 */
export class ImportSorter implements IImportSorter {
    settings = new ExtensionSettings();

    constructor(public rawImports: string[]) {}

    get firstRawImportIndex(): number {
        return this.rawImports.findIndex((statement) => this.isImportStatement(statement));
    }

    get lastRawImportIndex(): number {
        if (this.rawImports === undefined) {
            return 0;
        }

        // reversing to find last item that matches
        const reversedLastIndex = this.rawImports
            .reverse()
            .findIndex((statement) => this.isImportStatement(statement))!;

        if (reversedLastIndex === -1) {
            return 0;
        }

        // to get real index
        return this.rawImports?.length - reversedLastIndex;
    }

    sortImports(): string {
        const rawImports = this.getRawImports();

        if (rawImports.length === 0) {
            return ''; // nothing to sort
        }

        const groups = this.groupImports(rawImports);

        groups.forEach((group) => {
            group.imports = this.sortAlphabetically(group.imports);
        });

        const nonEmptyGroups = this.removeEmptyGroups(groups);

        if (nonEmptyGroups.length === 0) {
            return ''; // nothing to sort
        }

        return this.flattenImportGroups(nonEmptyGroups);
    }

    private groupImports(importStatements: string[]): ImportGroup[] {
        let copiedImportStatements = importStatements.slice();

        const importGroups: ImportGroup[] = [];

        this.settings.sortingRules.forEach((preference) => {
            const matchingStatements = copiedImportStatements.filter((statement) =>
                preference.regex.test(this.strip(statement))
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

    private strip(statement: string) {
        return statement
            .trim()
            .replace(/'/g, '')
            .replace(/;/g, '')
            .replace('import ', '')
            .replace(/ as .*/, '')
            .trim();
    }

    private removeEmptyGroups(groups: ImportGroup[]): ImportGroup[] {
        return groups.filter((group) => group.imports.length > 0);
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

    private getRawImports(): string[] {
        return this.rawImports
            .filter((line) => this.isImportStatement(line))
            .map((line) => line.trim());
    }

    private sortAlphabetically(imports: string[]): string[] {
        return imports.sort();
    }

    private isImportStatement(value: string) {
        // note: all these import statements probably have '\n' at the end, so use 'm' flag for multiline detection
        return RegExp(/^import.*;$/, 'gm').test(value);
    }
}
