import * as vscode from 'vscode';

import { ExtensionSettings } from './extension-settings/extension-settings.impl';
import { ImportSorter } from './import-sorter/import-sorter.impl';
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

        sortAndReplaceImports();
    });
}

/** Sets up listener for save action to sort imports when that happens */
function registerSortOnSaveAction() {
    return vscode.workspace.onWillSaveTextDocument((event) => {
        if (!Utils.isDartFilename(currentActiveFilename())) {
            return;
        }

        if (new ExtensionSettings().sortOnSaveEnabled) {
            sortAndReplaceImports(event.document);
        }
    });
}

function currentActiveFilename() {
    return vscode.window.activeTextEditor?.document.fileName;
}

function sortAndReplaceImports(document?: vscode.TextDocument) {
    if (document === null || document === undefined) {
        document = vscode.window.activeTextEditor?.document!;
    }

    const { sortedImports, range } = sortImports(document);

    replaceWithSortedImports(sortedImports, range);
}

function sortImports(document: vscode.TextDocument): { sortedImports: string; range: Range } {
    const documentLines = Utils.splitIntoStringArray(document.getText());

    // Sort dem imports
    const importSorter = new ImportSorter(documentLines);

    const sortedImports = importSorter.sortImports();

    return {
        sortedImports: sortedImports,
        range: { start: importSorter.firstRawImportIndex, end: importSorter.lastRawImportIndex },
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
