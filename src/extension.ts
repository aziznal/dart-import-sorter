import * as vscode from 'vscode';

import { GroupingPreference, RawGroupingPreference } from './types/grouping-preference.model';

import { ImportSorter } from './import-sorter';
import { VscodeDocumentLineReplacer } from './line-replacer';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
        if (!isDartFilename(vscode.window.activeTextEditor?.document.fileName)) {
            vscode.window.showWarningMessage('dartimportsorter only works on .dart files.');
            return;
        }

        const currentExtensionConfig = vscode.workspace.getConfiguration('dartimportsorter');
        const currentDocument = vscode.window.activeTextEditor?.document!;

        sortImports(currentDocument, currentExtensionConfig);
    });

    context.subscriptions.push(disposable);

    const sortOnSave = vscode.workspace.onWillSaveTextDocument((event) => {
        if (!isDartFilename(vscode.window.activeTextEditor?.document.fileName)) {
            return;
        }

        // getting config again because it may have changed
        const currentExtensionConfig = vscode.workspace.getConfiguration('dartimportsorter');

        if (currentExtensionConfig.get('sortOnSave')) {
            sortImports(event.document, currentExtensionConfig);
        }
    });

    context.subscriptions.push(sortOnSave);
}

function sortImports(document: vscode.TextDocument, config: vscode.WorkspaceConfiguration) {
    const documentLines = document
        .getText()
        .split('\n')
        .map((statement) => statement.replace(/(\r\n|\n|\r)/gm, ''));

    if (documentLines === undefined) {
        vscode.window.showErrorMessage('Could not read document lines.');
        throw new Error('Undefined documentLines in top level method');
    }

    const rawSortingRules = config.get('matchingRules') as RawGroupingPreference[];
    const leaveEmptyLinesBetweenImports = config.get('leaveEmptyLinesBetweenGroups') as boolean;

    const sortingRules = parseSortingRules(rawSortingRules);

    // Sort dem imports
    const importSorter = new ImportSorter(documentLines, sortingRules, {
        leaveEmptyLinesBetweenImports: leaveEmptyLinesBetweenImports,
    });
    const sortedImports = importSorter.sortImports();

    // Replace unsorted imports with the sorted ones
    const lineReplacer = new VscodeDocumentLineReplacer();
    lineReplacer.replace({
        range: {
            start: importSorter.firstImportIndex,
            end: importSorter.lastImportIndex,
        },
        withLines: [sortedImports],
    });
}

function isDartFilename(filename?: string): boolean {
    if (!filename) {
        return false;
    }

    return filename.slice(-5) === '.dart';
}

function parseSortingRules(rawSortingRules: RawGroupingPreference[]): GroupingPreference[] {
    const formattedRules = rawSortingRules.map((rule) => {
        return {
            order: rule.order,
            regex: RegExp(rule.regex, rule.regexFlags.join('')),
        };
    });

    return formattedRules;
}
