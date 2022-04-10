import * as vscode from 'vscode';

import { ImportSorter } from './import-sorter';
import { VscodeDocumentLineReplacer } from './line-replacer';

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

        const importSorter = new ImportSorter(documentLines);
        const sortedImports = importSorter.sortImports();

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
