import { ImportStatement } from '../types/import-statement';
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

    static isPotentialImportStatement(statement: string): boolean {
        return RegExp(/^import\s+[\s\S]*?\s*$/, 'gm').test(statement);
    }

    static findAllImports(document: string): ImportStatement[] {
        // add empty line at the end to make sure last import is detected
        const lines = document.split('\n').concat(['']);

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

                    // incrementing only when not first import, because first
                    // import's first line number is important when replacing
                    // imports (compared to the last import, in which only the
                    // last line number matters)
                    if (imports.length > 0) {
                        currentImport.lineNumber += 1;
                    }
                }

                imports.push(currentImport);
                currentImport = undefined;
                return;
            }

            // line is not empty, but not an import
            if (line.trim() !== '') {
                // 1. if current import is a valid import, add it to the list
                if (
                    currentImport &&
                    this.isImportStatement(this.simplifyImport(currentImport.rawBody))
                ) {
                    imports.push(currentImport);
                    currentImport = undefined;
                }

                // 2. otherwise, initialize a new import if it doesn't exist
                if (!currentImport) {
                    currentImport = new ImportStatement(line, lineNumber);
                } else {
                    // 2.1 and append the line to the current import
                    currentImport.rawBody += '\n' + line;

                    // incrementing only when not first import, because first
                    // import's first line number is important when replacing
                    // imports (compared to the last import, in which only the
                    // last line number matters)
                    if (imports.length > 0) {
                        currentImport.lineNumber += 1;
                    }
                }

                return;
            }

            // line is empty
            if (line.trim() === '') {
                // if current import is a valid import, add it to the list
                if (
                    currentImport &&
                    this.isImportStatement(this.simplifyImport(currentImport.rawBody))
                ) {
                    imports.push(currentImport);
                    currentImport = undefined;
                    return;
                }

                // if current import is potentially a valid import, continue
                if (
                    currentImport &&
                    this.isPotentialImportStatement(this.simplifyImport(currentImport.rawBody))
                ) {
                    currentImport.lineNumber += 1;
                    return;
                }

                if (
                    currentImport &&
                    !this.isImportStatement(this.simplifyImport(currentImport.rawBody))
                ) {
                    currentImport = undefined;
                    return;
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

    static simplifyImport(statement: string): string {
        let formattedStatement = statement.trim();

        // remove comments
        formattedStatement = formattedStatement.replace(/\/\/.*$/gm, '');

        // remove annotations
        formattedStatement = formattedStatement.replace(/@.*$/gm, '');

        // remove tabs
        formattedStatement = formattedStatement.replace(/\t/g, '');

        // remove newlines
        formattedStatement = formattedStatement.replace(/\n/g, '');

        // remove multiple spaces
        formattedStatement = formattedStatement.replace(/\s{2,}/g, ' ');

        return formattedStatement;
    }
}
