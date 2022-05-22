import * as vscode from 'vscode';

import { GroupingPreference, RawGroupingPreference } from './types/grouping-preference.model';

import { ImportSorter } from './import-sorter/import-sorter';
import { VscodeDocumentLineReplacer } from './line-replacer/line-replacer';
import { Range } from './types/range';
import { Utils } from './utils';

export function activate(context: vscode.ExtensionContext) {
    const sortImportsCommand = registerSortImportsCommand();
    const sortOnSaveAction = registerSortOnSaveAction();

    context.subscriptions.push(sortImportsCommand);
    context.subscriptions.push(sortOnSaveAction);
}

/** Sets vscode to listen to the activation of the main command and sorts imports when it is activated */
function registerSortImportsCommand() {
    return vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
        if (!Utils.isDartFilename(currentActiveFilename())) {
            vscode.window.showWarningMessage('dartimportsorter only works on .dart files.');
            return;
        }

        const currentExtensionConfig = vscode.workspace.getConfiguration('dartimportsorter');
        const currentDocument = vscode.window.activeTextEditor?.document!;

        sortAndReplaceImports(currentDocument, currentExtensionConfig);
    });
}

/** Sets up listener for save action to sort imports when that happens */
function registerSortOnSaveAction() {
    return vscode.workspace.onWillSaveTextDocument((event) => {
        if (!Utils.isDartFilename(currentActiveFilename())) {
            return;
        }

        // getting config again because it may have changed
        const currentExtensionConfig = vscode.workspace.getConfiguration('dartimportsorter');

        if (currentExtensionConfig.get('sortOnSave')) {
            sortAndReplaceImports(event.document, currentExtensionConfig);
        }
    });
}

function currentActiveFilename() {
    return vscode.window.activeTextEditor?.document.fileName;
}

function sortAndReplaceImports(
    document: vscode.TextDocument,
    config: vscode.WorkspaceConfiguration
) {
    const { sortedImports, range } = sortImports(document, config);

    replaceWithSortedImports(sortedImports, range);
}

function sortImports(
    document: vscode.TextDocument,
    config: vscode.WorkspaceConfiguration
): { sortedImports: string; range: Range } {
    const documentLines = getLinesOfActiveDocument(document);

    const rawSortingRules = config.get('matchingRules') as RawGroupingPreference[];
    const sortingRules = Utils.parseSortingRules(rawSortingRules);

    const leaveEmptyLinesBetweenImports = config.get('leaveEmptyLinesBetweenGroups') as boolean;

    // Sort dem imports
    const importSorter = new ImportSorter(documentLines, sortingRules, {
        leaveEmptyLinesBetweenImports: leaveEmptyLinesBetweenImports,
    });

    const sortedImports = importSorter.sortImports();

    return {
        sortedImports: sortedImports,
        range: { start: importSorter.firstImportIndex, end: importSorter.lastImportIndex },
    };
}

function replaceWithSortedImports(sortedImports: string, range: Range) {
    // Replace unsorted imports with the sorted ones
    const lineReplacer = new VscodeDocumentLineReplacer();

    lineReplacer.replace({
        range: range,
        withLines: sortedImports,
    });
}

function getLinesOfActiveDocument(document: vscode.TextDocument): string[] {
    const lines = document
        .getText()
        .split('\n')
        .map((statement) => statement.replace(/(\r\n|\n|\r)/gm, ''));

    if (lines === null || lines === undefined) {
        vscode.window.showErrorMessage('Could not read document lines.');
        throw new Error('Undefined documentLines in top level method');
    }

    return lines;
}
