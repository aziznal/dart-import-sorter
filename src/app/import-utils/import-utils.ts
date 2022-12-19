import { ImportType } from './../types/import-types';
import { StatementGroup } from '../types/statement-group';

export class ImportUtils {
    static indexOfFirstImport(imports: string[]): number {
        return imports.findIndex((statement) => this.isImportStatement(statement));
    }

    static indexOfLastImport(imports: string[]): number {
        // reversing to find last item that matches
        const reversedLastIndex = imports
            .reverse()
            .findIndex((statement) => this.isImportStatement(statement))!;

        if (reversedLastIndex === -1) {
            return 0;
        }

        // to get real index
        return imports.length - reversedLastIndex;
    }

    static isImportStatement(statement: string): boolean {
        // note: all these import statements probably have '\n' at the end, so use 'm' flag for multiline detection
        return RegExp(/^import.*;$/, 'gm').test(statement);
    }

    static extractFormattedImports(document: string): string[] {
        return document
            .split('\n')
            .filter((line) => this.isImportStatement(line))
            .map((line) => line.trim());
    }

    static sortAlphabetically(imports: string[]): string[] {
        return imports.sort();
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

    static getImportType(importStatement: string): ImportType | null {
        if (this.isPackageImport(importStatement)) {
            return ImportType.package;
        }

        if (this.isRelativeImport(importStatement)) {
            return ImportType.relative;
        }

        if (this.isAbsoluteImport(importStatement)) {
            return ImportType.absolute;
        }

        if (this.isBuiltinImport(importStatement)) {
            return ImportType.builtin;
        }

        return null;
    }

    private static isPackageImport(importStatement: string): boolean {
        return RegExp('^package:.*.dart$').test(importStatement);
    }

    private static isRelativeImport(importStatement: string): boolean {
        return RegExp('^../.*.dart$').test(importStatement);
    }

    private static isAbsoluteImport(importStatement: string): boolean {
        return RegExp('^\w(?!.*:)+\/*.*\.dart$').test(importStatement);
    }

    private static isBuiltinImport(importStatement: string): boolean {
        return RegExp('^.*$').test(importStatement);
    }
}
