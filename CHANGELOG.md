# Change Log

All notable changes to the "dartimportsorter" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]


## [0.2.6] - 12th June (2022-06-12)
### Added:
-   Improved flutter package detection. packages starting with 'flutter_' are classified different from official flutter packages

## [0.2.3] - 26th May (2022-05-26)

### Added
-   CD part of CI/CD to continously publish extension

## [0.2.2] - 26th May (2022-05-26)
- This version is the result of a successful CI/CD experiment

## [0.2.1] - 26th May (2022-05-26)

### Added:
-   Unit tests for major parts of extension
-   Dependency injection

### Fixed:
- Messy code. Spread code pools into different coherent files / modules

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
