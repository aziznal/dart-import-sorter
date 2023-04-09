import 'reflect-metadata';

import { IExtensionSettings } from '../extension-settings/extension-settings.interface';
import { IImportSorter } from './import-sorter.interface';

import { ImportSorter } from './import-sorter.impl';

const DEFAULT_SETTINGS: IExtensionSettings = {
    leaveEmptyLinesBetweenImports: false,
    sortOnSaveEnabled: false,
    sortingRules: [
        {
            _type: 'GroupingPreference',
            label: 'Dart',
            order: 1,
            regex: RegExp('^dart:.*$', 'm'),
        },
        {
            _type: 'GroupingPreference',
            label: 'Flutter',
            order: 1,
            regex: RegExp('^package:flutter/.*$', 'm'),
        },
        {
            _type: 'GroupingPreference',
            label: 'Any non-app Packages',
            order: 1,
            regex: RegExp('^package:(?!gym_app).*$', 'm'),
        },
        {
            _type: 'GroupingPreference',
            label: 'Gym App',
            order: 1,
            regex: RegExp('^package:gym_app.*$', 'm'),
        },
        {
            _type: 'GroupingPreference',
            label: 'Relative Imports',
            order: 1,
            regex: RegExp('^\\..*$', 'm'),
        },
    ],

    projectName: 'gym_app',
};

describe('Sorts imports within a group after initial sorting', () => {
    let importSorter: IImportSorter;
    let settings: IExtensionSettings;

    beforeEach(() => {
        settings = DEFAULT_SETTINGS;
        importSorter = new ImportSorter(settings);
    });

    test('Sorts two imports in a subgroup according to subgrouping rules', () => {
        // given
        const rawImports = `import 'dart:convert';

import 'package:mockito/mockito.dart';`;

        // override settings
        settings = {
            ...settings,
            leaveEmptyLinesBetweenImports: true,
            sortingRules: [
                {
                    _type: 'GroupingPreference',
                    label: 'All',
                    order: 1,
                    regex: RegExp('.*', 'm'),
                    subgroupSortingRules: [
                        {
                            _type: 'SubgroupingPreference',
                            label: 'Package Imports',
                            order: 1,
                            regex: RegExp('^package:.*$', 'm'),
                        },
                        {
                            _type: 'SubgroupingPreference',
                            label: 'Dart',
                            order: 2,
                            regex: RegExp('^dart:.*$', 'm'),
                        },
                    ],
                },
            ],
        };
        importSorter = new ImportSorter(settings);

        // when
        const sortingResult = importSorter.sortImports(rawImports);

        // then
        const expectedResult = `import 'package:mockito/mockito.dart';
import 'dart:convert';`;

        expect(sortingResult.sortedImports).toEqual(expectedResult);
    });

    test('Sorts imports in a subgroup according to subgrouping rules', () => {
        // given
        const rawImports = `import 'dart:convert';
import '../../mocks/common.dart';
    
import 'package:mockito/mockito.dart';
        
import 'package:gym_app/something.dart';`;

        // override settings
        settings = {
            ...settings,
            leaveEmptyLinesBetweenImports: true,
            sortingRules: [
                {
                    _type: 'GroupingPreference',
                    label: 'Dart',
                    order: 1,
                    regex: RegExp('^dart:.*$', 'm'),
                },
                {
                    _type: 'GroupingPreference',
                    label: 'Packages that are not this app',
                    order: 2,
                    regex: RegExp('^package:(?!gym_app).*$'),
                },
                {
                    _type: 'GroupingPreference',
                    label: 'Packages that are this app and relative imports',
                    order: 3,
                    regex: RegExp('^(package:gym_app|\\.).*$'),
                    subgroupSortingRules: [
                        {
                            _type: 'SubgroupingPreference',
                            label: 'Package Imports',
                            order: 1,
                            regex: RegExp('^package:gym_app.*$', 'm'),
                        },
                        {
                            _type: 'SubgroupingPreference',
                            label: 'Relative Imports',
                            order: 2,
                            regex: RegExp('^\\..*$', 'm'),
                        },
                    ],
                },
            ],
        };
        importSorter = new ImportSorter(settings);

        // when
        const sortingResult = importSorter.sortImports(rawImports);

        // then
        const expectedResult = `import 'dart:convert';

import 'package:mockito/mockito.dart';

import 'package:gym_app/something.dart';
import '../../mocks/common.dart';`;

        expect(sortingResult.sortedImports).toEqual(expectedResult);
    });

    test('Sorts imports alphabetically if subgrouping rules are not defined', () => {
        // given
        const rawImports = `import 'dart:convert';
import '../../mocks/common.dart';

import 'package:mockito/mockito.dart';

import 'package:gym_app/something.dart';`;

        // override settings
        settings = {
            ...settings,
            leaveEmptyLinesBetweenImports: true,
            sortingRules: [
                {
                    _type: 'GroupingPreference',
                    label: 'Dart',
                    order: 1,
                    regex: RegExp('^dart:.*$', 'm'),
                },
                {
                    _type: 'GroupingPreference',
                    label: 'Packages that are not this app',
                    order: 2,
                    regex: RegExp('^package:(?!gym_app).*$'),
                },
                {
                    _type: 'GroupingPreference',
                    label: 'Packages that are this app and relative imports',
                    order: 3,
                    regex: RegExp('^(package:gym_app|\\.).*$'),
                },
            ],
        };

        importSorter = new ImportSorter(settings);

        // when
        const sortingResult = importSorter.sortImports(rawImports);

        // then
        const expectedResult = `import 'dart:convert';

import 'package:mockito/mockito.dart';

import '../../mocks/common.dart';
import 'package:gym_app/something.dart';`;

        expect(sortingResult.sortedImports).toEqual(expectedResult);
    });

    test('Sorts imports in a subgroup with complex subgrouping rules', () => {
        // given
        const rawImports = `import 'dart:convert';
import '../../mocks/common.dart';

import 'package:mockito/mockito.dart';

import 'package:gym_app/something.dart';`;

        // override settings
        settings = {
            ...settings,
            leaveEmptyLinesBetweenImports: true,
            sortingRules: [
                {
                    _type: 'GroupingPreference',
                    label: 'All',
                    order: 1,
                    regex: RegExp('.*', 'm'),
                    subgroupSortingRules: [
                        {
                            _type: 'SubgroupingPreference',
                            label: 'Packages that are not this app',
                            order: 1,
                            regex: RegExp('^package:(?!gym_app).*$'),
                        },
                        {
                            _type: 'SubgroupingPreference',
                            label: 'Packages that are this app',
                            order: 2,
                            regex: RegExp('^package:gym_app.*$', 'm'),
                        },
                        {
                            _type: 'SubgroupingPreference',
                            label: 'Dart',
                            order: 3,
                            regex: RegExp('^dart:.*$', 'm'),
                        },
                    ],
                },
            ],
        };

        importSorter = new ImportSorter(settings);

        // when
        const sortingResult = importSorter.sortImports(rawImports);

        // then
        const expectedResult = `import 'package:mockito/mockito.dart';
import 'package:gym_app/something.dart';
import 'dart:convert';
import '../../mocks/common.dart';`;

        expect(sortingResult.sortedImports).toEqual(expectedResult);
    });
});
