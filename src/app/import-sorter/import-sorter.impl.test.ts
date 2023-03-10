import 'reflect-metadata';

import { IExtensionSettings } from '../extension-settings/extension-settings.interface';
import { IImportSorter } from './import-sorter.interface';

import { ImportSorter } from './import-sorter.impl';

const DEFAULT_MESSY_IMPORTS = `
import 'package:easy_localization/easy_localization.dart';
import 'package:get/route_manager.dart';
import 'package:my_package/foo/a.dart';
import 'package:provider/provider.dart';
import 'package:test/test.dart';

import "package:gym_app/constants/custom_colors.dart";


import "package:gym_app/generated/locale_keys.g.dart";
import "package:gym_app/src/app.dart";
import "package:gym_app/src/app_routes.dart";
import "package:gym_app/src/widgets/loading_display/rotating_dumbbell_widget.dart";
import 'dart:async' as something_else;
import 'dart:collection' as clc;
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod';
import "package:gym_app/widgets/loading.dart";
import "package:gym_app/widgets/main_category.dart";
import "package:gym_app/widgets/something_went_wrong.dart";



import '../sea/foo/a.dart';
import '../somewhere/foo/a.dart';


import 'home_viewmodel.dart';
import 'path/to/my_other_file.dart';
import 'package:flutter_test';
import '../beyond/foo/a.dart';
import '../lib/foo/a.dart';
import '../the/foo/a.dart';
import "package:gym_app/src/pages/auth/widgets/sign_in_page.dart";
import "package:gym_app/src/theme/app_theme.dart";
import "package:gym_app/src/widgets/loading_display/fading_loading_text_widget.dart";



import "package:gym_app/src/widgets/loading_display/rotating_dumbbell_widget.dart";


import "package:gym_app/di/service_locator.dart";
import "package:gym_app/domain/category/models/category.dart";





class Foo {
  final String foo = '';
}
`;

const DEFAULT_SORTED_IMPORTS = `import 'dart:async' as something_else;
import 'dart:collection' as clc;
import 'dart:math';

import 'package:flutter/material.dart';

import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod';
import 'package:flutter_test';
import 'package:get/route_manager.dart';
import 'package:my_package/foo/a.dart';
import 'package:provider/provider.dart';
import 'package:test/test.dart';

import "package:gym_app/constants/custom_colors.dart";
import "package:gym_app/di/service_locator.dart";
import "package:gym_app/domain/category/models/category.dart";
import "package:gym_app/generated/locale_keys.g.dart";
import "package:gym_app/src/app.dart";
import "package:gym_app/src/app_routes.dart";
import "package:gym_app/src/pages/auth/widgets/sign_in_page.dart";
import "package:gym_app/src/theme/app_theme.dart";
import "package:gym_app/src/widgets/loading_display/fading_loading_text_widget.dart";
import "package:gym_app/src/widgets/loading_display/rotating_dumbbell_widget.dart";
import "package:gym_app/src/widgets/loading_display/rotating_dumbbell_widget.dart";
import "package:gym_app/widgets/loading.dart";
import "package:gym_app/widgets/main_category.dart";
import "package:gym_app/widgets/something_went_wrong.dart";

import '../beyond/foo/a.dart';
import '../lib/foo/a.dart';
import '../sea/foo/a.dart';
import '../somewhere/foo/a.dart';
import '../the/foo/a.dart';

import 'home_viewmodel.dart';
import 'path/to/my_other_file.dart';`;

const DEFAULT_SETTINGS: IExtensionSettings = {
    leaveEmptyLinesBetweenImports: false,
    sortOnSaveEnabled: false,
    sortingRules: [
        {
            order: 1,
            regex: RegExp('^dart:.*$', 'm'),
        },
        {
            order: 1,
            regex: RegExp('^package:flutter/.*$', 'm'),
        },
        {
            order: 1,
            regex: RegExp('^package:(?!gym_app).*$', 'm'),
        },
        {
            order: 1,
            regex: RegExp('^package:gym_app.*$', 'm'),
        },
        {
            order: 1,
            regex: RegExp('^\\..*$', 'm'),
        },
    ],

    projectName: '',
};

describe('', () => {
    let importSorter: IImportSorter;
    let settings: IExtensionSettings;

    beforeEach(() => {
        settings = DEFAULT_SETTINGS;
        importSorter = new ImportSorter(settings);
    });

    test('Groups imports correctly with default settings, but with line breaks enabled', () => {
        settings = { ...settings, leaveEmptyLinesBetweenImports: true };
        importSorter = new ImportSorter(settings);

        const sortingResult = importSorter.sortImports(DEFAULT_MESSY_IMPORTS);

        expect(sortingResult.firstRawImportIndex).toBe(2);
        expect(sortingResult.lastRawImportIndex).toBe(47);
        expect(sortingResult.sortedImports).toBe(DEFAULT_SORTED_IMPORTS);
    });

    test('Leaves new lines between groups', () => {
        settings = { ...settings, leaveEmptyLinesBetweenImports: true };
        importSorter = new ImportSorter(settings);

        const sortingResult = importSorter.sortImports(DEFAULT_MESSY_IMPORTS);

        expect(sortingResult.firstRawImportIndex).toBe(2);
        expect(sortingResult.lastRawImportIndex).toBe(47);
        expect(sortingResult.sortedImports).toBe(DEFAULT_SORTED_IMPORTS);
    });

    test("Doesn't leave new lines between groups", () => {
        settings = { ...settings, leaveEmptyLinesBetweenImports: false };
        importSorter = new ImportSorter(settings);

        const messyImports = `import 'viewmodel.dart';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gym_app/constants';



import 'dart:math';

import '../beyond/foo/something.dart';
`;

        const expectedSortedImports = `import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:gym_app/constants';
import '../beyond/foo/something.dart';
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(10);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);
    });

    test('Sorts a basic list of consecutive imports', () => {
        const messyImports = `import 'viewmodel.dart';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gym_app/constants';
import 'dart:math';
import '../beyond/foo/something.dart';
`;

        const expectedSortedImports = `import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:gym_app/constants';
import '../beyond/foo/something.dart';
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(6);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);

        // Sorting again should not change anything
        const sortingResult2 = importSorter.sortImports(sortingResult.sortedImports);

        expect(sortingResult2.firstRawImportIndex).toBe(1);
        expect(sortingResult2.lastRawImportIndex).toBe(6);

        expect(sortingResult2.sortedImports).toBe(expectedSortedImports);
    });

    test('Sorts a list of consecutive imports, with line breaks', () => {
        const messyImports = `import 'viewmodel.dart';
import 'dart:async';










import 'package:flutter/material.dart';
import 'package:gym_app/constants';


import 'dart:math';

import '../beyond/foo/something.dart';
`;

        const expectedSortedImports = `import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:gym_app/constants';
import '../beyond/foo/something.dart';
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(19);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);

        // Sorting again should not change anything (but last index is now 6 because line breaks were removed in the first sort)
        const sortingResult2 = importSorter.sortImports(sortingResult.sortedImports);

        expect(sortingResult2.firstRawImportIndex).toBe(1);
        expect(sortingResult2.lastRawImportIndex).toBe(6);

        expect(sortingResult2.sortedImports).toBe(expectedSortedImports);
    });

    test('Sorts a list of consecutive imports, with comments (especially the last import)', () => {
        const messyImports = `// I was the first import
import 'viewmodel.dart';
// I was the second import
import 'dart:async';
// I was the third import
import 'package:flutter/material.dart';
// I was the fourth import
import 'package:gym_app/constants';
// I was the fifth import
import 'dart:math';
// I was the sixth import
import '../beyond/foo/something.dart';
`;

        const expectedSortedImports = `// I was the second import
import 'dart:async';
// I was the fifth import
import 'dart:math';
// I was the third import
import 'package:flutter/material.dart';
// I was the fourth import
import 'package:gym_app/constants';
// I was the sixth import
import '../beyond/foo/something.dart';
// I was the first import
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(12);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);

        // Sorting again should not change anything
        const sortingResult2 = importSorter.sortImports(sortingResult.sortedImports);

        expect(sortingResult2.firstRawImportIndex).toBe(1);
        expect(sortingResult2.lastRawImportIndex).toBe(12);

        expect(sortingResult2.sortedImports).toBe(expectedSortedImports);
    });

    test('Sorts a list of imports, with comments and line breaks', () => {
        const messyImports = `// I was the first import
import 'viewmodel.dart';

// I was the second import
import 'dart:async';





// I was the third import
import 'package:flutter/material.dart';
// I was the fourth import
import 'package:gym_app/constants';

// I was the fifth import
import 'dart:math';

// I was the sixth import
import '../beyond/foo/something.dart';
`;

        const expectedSortedImports = `// I was the second import
import 'dart:async';
// I was the fifth import
import 'dart:math';
// I was the third import
import 'package:flutter/material.dart';
// I was the fourth import
import 'package:gym_app/constants';
// I was the sixth import
import '../beyond/foo/something.dart';
// I was the first import
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(20);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);

        // Sorting again should not change anything
        const sortingResult2 = importSorter.sortImports(sortingResult.sortedImports);

        expect(sortingResult2.firstRawImportIndex).toBe(1);
        expect(sortingResult2.lastRawImportIndex).toBe(12);

        expect(sortingResult2.sortedImports).toBe(expectedSortedImports);
    });

    test('Sorts a consecutive list of imports, with annotations', () => {
        const messyImports = `@deprecated
import 'viewmodel.dart';
@deprecated
import 'dart:async';
@deprecated
import 'package:flutter/material.dart';
@deprecated
import 'package:gym_app/constants';
@deprecated
import 'dart:math';
@deprecated
import '../beyond/foo/something.dart';
`;

        const expectedSortedImports = `@deprecated
import 'dart:async';
@deprecated
import 'dart:math';
@deprecated
import 'package:flutter/material.dart';
@deprecated
import 'package:gym_app/constants';
@deprecated
import '../beyond/foo/something.dart';
@deprecated
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(12);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);

        // Sorting again should not change anything
        const sortingResult2 = importSorter.sortImports(sortingResult.sortedImports);

        expect(sortingResult2.firstRawImportIndex).toBe(1);
        expect(sortingResult2.lastRawImportIndex).toBe(12);

        expect(sortingResult2.sortedImports).toBe(expectedSortedImports);
    });

    test('Sorts a list of imports, with annotations and line breaks', () => {
        const messyImports = `@deprecated
import 'viewmodel.dart';


@deprecated
import 'dart:async';

@deprecated
import 'package:flutter/material.dart';
@deprecated
import 'package:gym_app/constants';


@deprecated
import 'dart:math';

@deprecated
import '../beyond/foo/something.dart';
    `;

        const expectedSortedImports = `@deprecated
import 'dart:async';
@deprecated
import 'dart:math';
@deprecated
import 'package:flutter/material.dart';
@deprecated
import 'package:gym_app/constants';
@deprecated
import '../beyond/foo/something.dart';
@deprecated
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(18);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);

        // Sorting again should not change anything
        const sortingResult2 = importSorter.sortImports(sortingResult.sortedImports);

        expect(sortingResult2.firstRawImportIndex).toBe(1);
        expect(sortingResult2.lastRawImportIndex).toBe(12);

        expect(sortingResult2.sortedImports).toBe(expectedSortedImports);
    });

    test('Sorts a list of imports, with comments and annotations', () => {
        const messyImports = `// I was the first import
@deprecated
import 'viewmodel.dart';
// I was the second import
@deprecated
import 'dart:async';
// I was the third import
import 'package:flutter/material.dart';
// I was the fourth import
@deprecated
import 'package:gym_app/constants';
// I was the fifth import
import 'dart:math';
// I was the sixth import
@deprecated
import '../beyond/foo/something.dart';
`;

        const expectedSortedImports = `// I was the second import
@deprecated
import 'dart:async';
// I was the fifth import
import 'dart:math';
// I was the third import
import 'package:flutter/material.dart';
// I was the fourth import
@deprecated
import 'package:gym_app/constants';
// I was the sixth import
@deprecated
import '../beyond/foo/something.dart';
// I was the first import
@deprecated
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(16);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);

        // Sorting again should not change anything
        const sortingResult2 = importSorter.sortImports(sortingResult.sortedImports);

        expect(sortingResult2.firstRawImportIndex).toBe(1);
        expect(sortingResult2.lastRawImportIndex).toBe(16);

        expect(sortingResult2.sortedImports).toBe(expectedSortedImports);
    });

    test('Sorts a list of imports, with comments, annotations, and line breaks', () => {
        const messyImports = `// I was the first import
@deprecated
import 'viewmodel.dart';


// I was the second import
@deprecated
import 'dart:async';
// I was the third import
import 'package:flutter/material.dart';



// I was the fourth import
@deprecated
import 'package:gym_app/constants';

// I was the fifth import
import 'dart:math';
// I was the sixth import
@deprecated
import '../beyond/foo/something.dart';
`;

        const expectedSortedImports = `// I was the second import
@deprecated
import 'dart:async';
// I was the fifth import
import 'dart:math';
// I was the third import
import 'package:flutter/material.dart';
// I was the fourth import
@deprecated
import 'package:gym_app/constants';
// I was the sixth import
@deprecated
import '../beyond/foo/something.dart';
// I was the first import
@deprecated
import 'viewmodel.dart';`;

        const sortingResult = importSorter.sortImports(messyImports);

        expect(sortingResult.firstRawImportIndex).toBe(1);
        expect(sortingResult.lastRawImportIndex).toBe(22);
        expect(sortingResult.sortedImports).toBe(expectedSortedImports);

        // Sorting again should not change anything
        const sortingResult2 = importSorter.sortImports(sortingResult.sortedImports);

        expect(sortingResult2.firstRawImportIndex).toBe(1);
        expect(sortingResult2.lastRawImportIndex).toBe(16);

        expect(sortingResult2.sortedImports).toBe(expectedSortedImports);
    });

    test('Return no result when there are no imports to sort', () => {
        const sortingResult = importSorter.sortImports('');

        expect(sortingResult.firstRawImportIndex).toBe(-1);
        expect(sortingResult.lastRawImportIndex).toBe(-1);
        expect(sortingResult.sortedImports).toBe('');
    });
});
