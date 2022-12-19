import { ImportType } from './../types/import-types';
import { ImportUtils } from './import-utils';

describe('Import Utils', () => {
    test('should get correct index of first import', () => {
        const imports = `

import 'bla1';
import 'bla2';
import 'bla3';
import 'bla4';`.split('\n');

        expect(ImportUtils.indexOfFirstImport(imports)).toBe(2);
    });

    test('should get correct index of last import', () => {
        const imports = `

import 'bla1';
import 'bla2';
import 'bla3';
import 'bla4';`.split('\n');

        expect(ImportUtils.indexOfLastImport(imports)).toBe(6);

        expect(ImportUtils.indexOfLastImport([''])).toBe(0);
    });

    test('should correctly detect import statements', () => {
        const imports = [
            `import 'something';`,
            `import 'something' as something_else;`,
            `import 'something/with/a/long/path';`,
            `import '';`,
            `import 'as' as a_s;`,
        ];

        imports.forEach((statement) => {
            expect(ImportUtils.isImportStatement(statement)).toBe(true);
        });
    });

    test('should get only path section of an import', () => {
        const imports = [
            `import 'something';`,
            `import 'something' as something_else;`,
            `import 'something/with/a/long/path';`,
            `import '';`,
            `import 'as' as a_s;`,
        ];

        const importPaths = [`something`, `something`, `something/with/a/long/path`, ``, `as`];

        imports.forEach((statement, i) => {
            expect(ImportUtils.getImportPath(statement)).toBe(importPaths[i]);
        });
    });

    test('should sort imports alphabetically', () => {
        const imports = [
            `import 'csomething/with/a/long/path';`,
            `import 'eas' as a_s;`,
            `import 'd';`,
            `import 'asomething';`,
            `import 'bsomething' as something_else;`,
        ];

        const sortedImports = [
            `import 'asomething';`,
            `import 'bsomething' as something_else;`,
            `import 'csomething/with/a/long/path';`,
            `import 'd';`,
            `import 'eas' as a_s;`,
        ];

        expect(ImportUtils.sortAlphabetically(imports)).toStrictEqual(sortedImports);
    });

    test.only('detects package import type', () => {
        expect(ImportUtils.getImportType("package:packageName/package_name.dart")).toBe(ImportType.package);
        
        expect(ImportUtils.getImportType("../path/package_name.dart")).toBe(ImportType.relative);
        
        expect(ImportUtils.getImportType("src/lib/path/package_name.dart")).toBe(ImportType.absolute);

        // expect(ImportUtils.getImportType("dart:io")).toBe(ImportType.builtin);
    });
});
