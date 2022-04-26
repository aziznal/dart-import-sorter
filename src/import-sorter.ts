import { GroupingPreference } from './types/grouping-preference.model';
import { ImportGroup } from './types/import-group';

export class ImportSorter {
    document: string[];
    private sortingRules: GroupingPreference[];

    constructor(document: string[], sortingRules: GroupingPreference[]) {
        this.document = document;
        this.sortingRules = sortingRules;
    }

    get firstImportIndex(): number {
        // TODO: Implement
        return 0;
    }

    get lastImportIndex(): number {
        if (this.document === undefined) {
            return 0;
        }

        // reversing to find last item that matches
        const reversedLastIndex = this.document
            .reverse()
            .findIndex((statement) => this.isImportStatement(statement))!;

        if (reversedLastIndex === -1) {
            return 0;
        }

        // to get real index
        return this.document?.length - reversedLastIndex;
    }

    sortImports(): string {
        const rawImports = this.getRawImports();

        const groups = this.groupImports(rawImports);

        groups.forEach((group) => {
            group.imports = this.sortAlphabetically(group.imports);
        });

        return this.flattenImportGroups(groups);
    }

    private groupImports(importStatements: string[]): ImportGroup[] {
        let copiedImportStatements = importStatements.slice();

        const importGroups: ImportGroup[] = [];

        this.sortingRules.forEach((preference) => {
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

    strip(statement: string) {
        return statement
            .trim()
            .replace(/'/g, '')
            .replace(/;/g, '')
            .replace('import ', '')
            .replace(/ as .*/, '')
            .trim();
    }

    private flattenImportGroups(groups: ImportGroup[]): string {
        groups = groups.sort((groupA, groupB) => groupA.order - groupB.order);

        const concattedGroups = groups
            .map((group) => {
                return group.imports.join('\n');
            })
            .join('\n\n');

        return concattedGroups;
    }

    private getRawImports(): string[] {
        return this.document
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
