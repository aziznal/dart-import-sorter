import { ImportStatement } from '../types/import-statement.model';
import { StatementGroup } from '../types/statement-group';

export class ImportUtils {
    static lineNumberOfFirstImport(imports: ImportStatement[]): number {
        return imports
            .map((statement) => statement.lineNumber)
            .reduce((min, current) => (current < min ? current : min), Number.MAX_SAFE_INTEGER);
    }

    static lineNumberOfLastImport(imports: ImportStatement[]): number {
        return imports
            .map((statement) => statement.lineNumber)
            .reduce((max, current) => (current > max ? current : max), Number.MIN_SAFE_INTEGER);
    }

    static isImportStatement(statement: string): boolean {
        // note: all these import statements probably have '\n' at the end, so use 'm' flag for multiline detection
        return RegExp(/^import\s+[\s\S]*?;\s*$/, 'gm').test(statement);
    }

    static findAllImports(document: string): ImportStatement[] {
        const lines = document.split('\n');

        let currentImport: ImportStatement | undefined;
        const imports: ImportStatement[] = [];

        lines.forEach((line, index) => {
            const lineNumber = index + 1;

            // line is import
            if (this.isImportStatement(line)) {
                if (!currentImport) {
                    currentImport = new ImportStatement(line, lineNumber);
                } else {
                    currentImport.rawBody += '\n' + line;
                }

                imports.push(currentImport);
                currentImport = undefined;
                return;
            }

            // line is not empty, but not an import
            if (line.trim() !== '') {
                if (!currentImport) {
                    currentImport = new ImportStatement(line, lineNumber);
                } else {
                    currentImport.rawBody += '\n' + line;
                }

                return;
            }

            // line is empty
            if (line.trim() === '') {
                // if current import is a valid import, add it to the list
                if (
                    currentImport &&
                    this.isImportStatement(this.simplifyMultilineImport(currentImport.rawBody))
                ) {
                    imports.push(currentImport);
                    currentImport = undefined;
                }
            }
        });

        return imports;
    }

    static sortAlphabetically(imports: ImportStatement[]): ImportStatement[] {
        return imports.sort((a, b) => {
            return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
        });
    }

    /**
     * Returns only the path part of an import
     *
     * Example:
     * ```dart
     * import 'path/to/import.dart' as some_import;
     * ```
     *
     * becomes
     *
     * ```dart
     * 'path/to/import.dart'
     * ```
     * */
    static getImportPath(statement: string) {
        // TODO: convert to using regex to extract path to support multiline imports
        return statement
            .trim()
            .replace(/'/g, '')
            .replace(/"/g, '')
            .replace(/;/g, '')
            .replace('import ', '')
            .replace(/ as .*/, '')
            .trim();
    }

    static removeEmptyGroups(groups: StatementGroup[]): StatementGroup[] {
        return groups.filter((group) => group.imports.length > 0);
    }

    static simplifyMultilineImport(statement: string): string {
        let formattedStatement = statement.trim();

        // first remove comments
        formattedStatement = formattedStatement.replace(/\/\/.*$/gm, '');

        // then remove tabs
        formattedStatement = formattedStatement.replace(/\t/g, '');

        // then remove newlines
        formattedStatement = formattedStatement.replace(/\n/g, '');

        // then remove multiple spaces
        formattedStatement = formattedStatement.replace(/\s{2,}/g, ' ');

        return formattedStatement;
    }
}
