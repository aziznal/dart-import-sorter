import * as vscode from 'vscode';

import { GroupingPreference, ImportSorter } from './import-sorter';
import { VscodeDocumentLineReplacer } from './line-replacer';

type RawGroupingPreference = { label: string; regex: string; order: number; regexFlags: string[] };

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
        const documentLines = vscode.window.activeTextEditor?.document
            .getText()
            .split('\n')
            .map((statement) => statement.replace(/(\r\n|\n|\r)/gm, ''));

        if (documentLines === undefined) {
            vscode.window.showErrorMessage('Could not read document lines.');
            throw new Error('Undefined documentLines in top level method');
        }

        // Load sorting rules
        const config = vscode.workspace.getConfiguration('dartimportsorter');
        const rawSortingRules = config.get('matchingRules') as RawGroupingPreference[];
        const sortingRules = parseSortingRules(rawSortingRules);

        // Sort dem imports
        const importSorter = new ImportSorter(documentLines, sortingRules);
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
    });

    context.subscriptions.push(disposable);
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
