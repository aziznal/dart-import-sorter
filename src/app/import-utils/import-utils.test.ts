/* eslint-disable @typescript-eslint/naming-convention */
import { ImportStatement } from './../types/import-statement.model';
import { ImportUtils } from './import-utils';

describe('Import Utils', () => {
    test('should get correct index of first import', () => {
        const imports = [
            new ImportStatement("import 'bla1';", 99),
            new ImportStatement("import 'bla2';", 3),
            new ImportStatement("import 'bla3';", 12),
            new ImportStatement("import 'bla4';", 6),
        ];

        expect(ImportUtils.lineNumberOfFirstImport(imports)).toBe(3);
    });

    test('should get correct index of last import', () => {
        const imports = [
            new ImportStatement("import 'bla1';", 99),
            new ImportStatement("import 'bla2';", 3),
            new ImportStatement("import 'bla3';", 12),
            new ImportStatement("import 'bla4';", 6),
        ];

        expect(ImportUtils.lineNumberOfLastImport(imports)).toBe(99);
    });

    test('should correctly detect import statements', () => {
        const imports = [
            `import 'something';`,
            `import 'something/with/a/long/path';`,

            `import 'something' as something_else;`,
            `import 'as' as a_s;`,
            `import 'as' show Foo;`,

            // single line conditional import
            `import 'dart.math' if (dart.library.html) 'dart:html';`,

            // simplified multiline conditional import
            `import 'foo.dart' if (dart.library.io) 'src/hw_io.dart' if (dart.library.html) 'src/hw_html.dart';`,
        ];

        imports.forEach((statement) => {
            expect(ImportUtils.isImportStatement(statement)).toBe(true);
        });
    });

    test('should detect basic consecutive import statements', () => {
        const raw = `
import 'something.dart';
import 'something.dart' as something_else;
        `;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(2);

        // import text should be present
        expect(imports[0].rawBody).toContain("import 'something.dart';");
        expect(imports[1].rawBody).toContain("import 'something.dart' as something_else;");
    });

    test('should detect basic consecutive import statements with a blank lines', () => {
        const raw = `
import 'something.dart';

import 'something.dart' as something_else;
        `;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(2);

        // import text should be present
        expect(imports[0].rawBody).toContain("import 'something.dart';");
        expect(imports[1].rawBody).toContain("import 'something.dart' as something_else;");
    });

    test('should detect basic import statements with comments', () => {
        const raw = `
// this is a comment
import 'something.dart';
// this is a comment, too!
import 'something.dart' as something_else;
        `;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(2);

        // both import and comment text should be present
        expect(imports[0].rawBody).toContain('this is a comment');
        expect(imports[0].rawBody).toContain("import 'something.dart';");

        expect(imports[1].rawBody).toContain('this is a comment, too!');
        expect(imports[1].rawBody).toContain("import 'something.dart' as something_else;");
    });

    test('should detect conditional imports with comments mixed with basic imports', () => {
        const raw = `
// this is a comment
import 'something.dart';

// this is a comment, too!
import 'something.dart' as something_else;

// This is a conditional import!
import 'dart.math' if (dart.library.html) 'dart:html';

// this is also a conditional import!
import 'dart.math' if (dart.library.html) 'dart:html';
`;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(4);

        // both import and comment text should be present
        expect(imports[0].rawBody).toContain('this is a comment');
        expect(imports[0].rawBody).toContain("import 'something.dart';");

        expect(imports[1].rawBody).toContain('this is a comment, too!');
        expect(imports[1].rawBody).toContain("import 'something.dart' as something_else;");

        expect(imports[2].rawBody).toContain('This is a conditional import!');
        expect(imports[2].rawBody).toContain(
            "import 'dart.math' if (dart.library.html) 'dart:html';"
        );

        expect(imports[3].rawBody).toContain('this is also a conditional import!');
        expect(imports[3].rawBody).toContain(
            "import 'dart.math' if (dart.library.html) 'dart:html';"
        );
    });

    test('should detect multiline conditional imports with basic imports with no blank lines', () => {
        const raw = `
// this is a comment
import 'something.dart';
import 'dart:math'
    if (dart.library.html) 'dart:html'
    if (dart.library.io) 'dart:io';
`;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(2);

        // both import and comment text should be present
        expect(imports[0].rawBody).toContain('this is a comment');
        expect(imports[0].rawBody).toContain("import 'something.dart';");

        expect(imports[1].rawBody).toContain(
            `import 'dart:math'
    if (dart.library.html) 'dart:html'
    if (dart.library.io) 'dart:io';`
        );
    });

    test('should detect multiline conditional imports with basic imports with blank lines', () => {
        const raw = `
// this is a comment
import 'something.dart';

import 'dart:math'
    if (dart.library.html) 'dart:html'
    if (dart.library.io) 'dart:io';
`;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(2);

        // both import and comment text should be present
        expect(imports[0].rawBody).toContain('this is a comment');
        expect(imports[0].rawBody).toContain("import 'something.dart';");

        expect(imports[1].rawBody).toContain(
            `import 'dart:math'
    if (dart.library.html) 'dart:html'
    if (dart.library.io) 'dart:io';`
        );
    });

    test('should detect multiline conditional imports with comments mixed with basic imports', () => {
        const raw = `
// this is a comment
import 'something.dart';

// this is a conditional import
import 'dart:math'
    // we import this sometimes
    if (dart.library.html) 'dart:html'

    // but other times we import this
    if (dart.library.io) 'dart:io';
`;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(2);

        // both import and comment text should be present
        expect(imports[0].rawBody).toContain('this is a comment');
        expect(imports[0].rawBody).toContain("import 'something.dart';");

        expect(imports[1].rawBody).toContain('// this is a conditional import\n');
        expect(imports[1].rawBody).toContain("import 'dart:math'\n");
        expect(imports[1].rawBody).toContain('  // we import this sometimes\n');
        expect(imports[1].rawBody).toContain("  if (dart.library.html) 'dart:html'\n");
        expect(imports[1].rawBody).toContain('  // but other times we import this\n');
        expect(imports[1].rawBody).toContain("  if (dart.library.io) 'dart:io';");
    });

    test('should detect multiline conditional imports with comments mixed with basic imports with many blank lines', () => {
        const raw = `
// this is a comment
import 'something.dart';

// this is a conditional import
import 'dart:math'


    // we import this sometimes
    if (dart.library.html) 'dart:html'



    // but other times we import this
    if (dart.library.io) 'dart:io';
`;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(2);

        // both import and comment text should be present
        expect(imports[0].rawBody).toContain('this is a comment');
        expect(imports[0].rawBody).toContain("import 'something.dart';");

        expect(imports[1].rawBody).toContain('// this is a conditional import\n');
        expect(imports[1].rawBody).toContain("import 'dart:math'\n");
        expect(imports[1].rawBody).toContain('  // we import this sometimes\n');
        expect(imports[1].rawBody).toContain("  if (dart.library.html) 'dart:html'\n");
        expect(imports[1].rawBody).toContain('  // but other times we import this\n');
        expect(imports[1].rawBody).toContain("  if (dart.library.io) 'dart:io';");
    });

    test('should detect multiline conditional imports with comments mixed with basic imports with many trailing blank lines', () => {
        const raw = `
// this is a comment
import 'something.dart';

// this is a conditional import
import 'dart:math'
    // we import this sometimes
    if (dart.library.html) 'dart:html'

    // but other times we import this
    if (dart.library.io) 'dart:io';







    `;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(2);

        // both import and comment text should be present
        expect(imports[0].rawBody).toContain('this is a comment');
        expect(imports[0].rawBody).toContain("import 'something.dart';");

        expect(imports[1].rawBody).toContain('// this is a conditional import\n');
        expect(imports[1].rawBody).toContain("import 'dart:math'\n");
        expect(imports[1].rawBody).toContain('  // we import this sometimes\n');
        expect(imports[1].rawBody).toContain("  if (dart.library.html) 'dart:html'\n");
        expect(imports[1].rawBody).toContain('  // but other times we import this\n');
        expect(imports[1].rawBody).toContain("  if (dart.library.io) 'dart:io';");
    });

    test('should simplify a multiline import statement into a single line', () => {
        const raw = `
import 'foo.dart'
    if (dart.library.io) 'src/hw_io.dart'
    if (dart.library.html) 'src/hw_html.dart';
`;

        const simplifiedImport = ImportUtils.simplifyImport(raw);
        const expected = `import 'foo.dart' if (dart.library.io) 'src/hw_io.dart' if (dart.library.html) 'src/hw_html.dart';`;

        expect(simplifiedImport).toBe(expected);
    });

    test('should simplify a multiline import statement with comments into a single line', () => {
        const raw = `
// this is a comment
import 'foo.dart'
    // this is a comment, too!
    if (dart.library.io) 'src/hw_io.dart'

    // this is also a comment
    if (dart.library.html) 'src/hw_html.dart';
`;

        const simplifiedImport = ImportUtils.simplifyImport(raw);
        const expected = `import 'foo.dart' if (dart.library.io) 'src/hw_io.dart' if (dart.library.html) 'src/hw_html.dart';`;

        expect(simplifiedImport).toBe(expected);
    });

    test('should simplify a multiline import statement with comments and annotations into a single line', () => {
        const raw = `
// This is also a multiline conditional import
@deprecated
import 'package:gym_app/various'
    if (dart.library.io) 'package:gym_app/various_io'
    if (dart.library.html) 'package:gym_app/various_web';
`;

        const simplifiedImport = ImportUtils.simplifyImport(raw);
        const expected = `import 'package:gym_app/various' if (dart.library.io) 'package:gym_app/various_io' if (dart.library.html) 'package:gym_app/various_web';`;

        expect(simplifiedImport).toBe(expected);
    });

    test('should correctly find all import statements from a raw string', () => {
        const raw = `
import 'something';
import 'something' as something_else;
import 'something/with/a/long/path';
import '';
import 'as' as a_s;

// multiline imports
import 'foo.dart'
    if (dart.library.io) 'src/hw_io.dart'
    if (dart.library.html) 'src/hw_html.dart';

import 'bar.dart'
    if (dart.library.html) 'package:eam_flutter/form/webui.dart'
    as multiPlatform;   

// this is a comment
import 'baz.dart';

@deprecated
import 'qux.dart';

// this is deprecated
@deprecated
import 'quux.dart';
`;

        const imports = ImportUtils.findAllImports(raw);

        expect(imports.length).toBe(10);

        // both import and comment text should be present (if applicable)
        expect(imports[0].rawBody).toContain("import 'something';");
        expect(imports[1].rawBody).toContain("import 'something' as something_else;");
        expect(imports[2].rawBody).toContain("import 'something/with/a/long/path';");
        expect(imports[3].rawBody).toContain("import '';");
        expect(imports[4].rawBody).toContain("import 'as' as a_s;");

        expect(imports[5].rawBody).toContain("import 'foo.dart'");
        expect(imports[5].rawBody).toContain("if (dart.library.io) 'src/hw_io.dart'");
        expect(imports[5].rawBody).toContain("if (dart.library.html) 'src/hw_html.dart';");

        expect(imports[6].rawBody).toContain("import 'bar.dart'");
        expect(imports[6].rawBody).toContain(
            "if (dart.library.html) 'package:eam_flutter/form/webui.dart'"
        );
        expect(imports[6].rawBody).toContain('as multiPlatform;');

        expect(imports[7].rawBody).toContain('// this is a comment');
        expect(imports[7].rawBody).toContain("import 'baz.dart';");

        expect(imports[8].rawBody).toContain('@deprecated');
        expect(imports[8].rawBody).toContain("import 'qux.dart';");

        expect(imports[9].rawBody).toContain('// this is deprecated');
        expect(imports[9].rawBody).toContain('@deprecated');
        expect(imports[9].rawBody).toContain("import 'quux.dart';");
    });

    test('should get only path section of an import', () => {
        const imports = {
            "import 'something';": 'something',
            "import 'something' as something_else;": 'something',
            "import 'something/with/a/long/path';": 'something/with/a/long/path',
            "import '';": '',
            "import 'as' as a_s;": 'as',
            "import 'as' show a_s;": 'as',

            // multiline imports
            "import 'foo.dart'\n    if (dart.library.io) 'src/hw_io.dart'\n    if (dart.library.html) 'src/hw_html.dart';":
                'foo.dart',

            // import with a comment
            "// This imports foo\nimport 'foo.dart';": 'foo.dart',

            // annotated import
            "// @deprecated\nimport 'foo.dart';": 'foo.dart',

            // import with a commented import before it
            "// import 'not_this_one.dart'\nimport 'foo.dart';": 'foo.dart',
        } as any;

        Object.keys(imports).forEach((raw) => {
            const importStatement = new ImportStatement(raw, 0);
            expect(importStatement.path).toBe(imports[raw]);
        });
    });

    test('should sort imports alphabetically', () => {
        const imports = [
            new ImportStatement(`import 'csomething/with/a/long/path';`, 0),
            new ImportStatement(`import 'eas' as a_s;`, 0),
            new ImportStatement(`import 'd';`, 0),
            new ImportStatement(`import 'asomething';`, 0),
            new ImportStatement(`import 'bsomething' as something_else;`, 0),
        ];

        const sortedImports = [
            new ImportStatement(`import 'asomething';`, 0),
            new ImportStatement(`import 'bsomething' as something_else;`, 0),
            new ImportStatement(`import 'csomething/with/a/long/path';`, 0),
            new ImportStatement(`import 'd';`, 0),
            new ImportStatement(`import 'eas' as a_s;`, 0),
        ];

        expect(ImportUtils.sortAlphabetically(imports)).toStrictEqual(sortedImports);
    });
});
