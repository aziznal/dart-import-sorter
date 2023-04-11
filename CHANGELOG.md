# Change Log

All notable changes to the "dartimportsorter" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.3.3] - 11th April (2023-04-11)

### Fixed:

-   Mismatched key names and nullability in sorting rule model causing parsing to fail

## [0.3.2] - 9th April (2023-04-09)

### Added:

-   Ability to sort imports in a group

## [0.3.1] - 25th March (2023-03-25)

### Fixed:

-   Issue where sorting a single import would cause it to be duplicated (issue #53)

## [0.3.0] - 10th March (2023-03-10)

### Added:

-   Support for comments and annotations
-   Support for conditional imports

## [0.2.10] - 12th August (2022-08-12)

### Bugfix:

-   Remove newline chars from parsed project name in pubspec.yaml

## [0.2.9] - 1st July (2022-07-01)

### Hotfix:

-   Switched extension to use platform-specific paths

## [0.2.8] - 1st July (2022-07-01)

### Added:

-   Ability to automatically detect current project name from pubspec.yaml file

## [0.2.7] - 19th June (2022-06-19)

### Added:

-   Support for double quotes in import statements
-   'Buy me a coffee' button. Any support is appreciated.

## [0.2.6] - 12th June (2022-06-12)

### Added:

-   Improved flutter package detection. packages starting with 'flutter\_' are classified different from official flutter packages

## [0.2.3] - 26th May (2022-05-26)

### Added

-   CD part of CI/CD to continously publish extension

## [0.2.2] - 26th May (2022-05-26)

-   This version is the result of a successful CI/CD experiment

## [0.2.1] - 26th May (2022-05-26)

### Added:

-   Unit tests for major parts of extension
-   Dependency injection

### Fixed:

-   Messy code. Spread code pools into different coherent files / modules

## [0.2.0] - 5th May (2022-05-05)

### Added

-   Icon for extension in marketplace

## [0.1.1] - 5th May (2022-05-05)

### Added:

-   Updated information to readme and package.json

## [0.1.0] - 4th May (2022-05-04)

### Added:

-   Ability to toggle leaving empty lines between groups on or off
-   Condition to make sure extension is only ran on files ending with `.dart`
-   `sortOnSave` option

### Fixed:

-   Fixed bug where random new lines would be added before or after an import

## [0.0.4] - 27th April (2022-04-27)

### Added:

-   Ability to run extension using shortcut `Ctrl + Alt + O`

## [0.0.3] - 27th April (2022-04-27)

### Changed:

-   Default sorting rules no longer contain 'gym_app' as default app name

## [0.0.2] - 27th April (2022-04-27)

### Added:

-   Ability to change sorting rules through settings.json file

## [0.0.1] - 15th April (2022-04-15)

### Added:

-   basic grouping and sorting logic to extension
-   MIT License
