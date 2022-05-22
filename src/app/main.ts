import * as vscode from 'vscode';

import { ExtensionSettings } from './extension-settings/extension-settings.impl';
import { FileInteractor } from './file-interactor/file-interactor.impl';
import { ImportSorter } from './import-sorter/import-sorter.impl';
import { Range } from './types/range';
import { Utils } from './utils';

export class App {
    /** Sets vscode to listen to the activation of the main command and sorts imports when it is activated */
    registerSortImportsCommand() {
        return vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
            if (!Utils.isDartFilename(this.currentActiveFilename())) {
                vscode.window.showWarningMessage('dartimportsorter only works on .dart files.');
                return;
            }

            this.sortAndReplaceImports();
        });
    }

    /** Sets up listener for save action to sort imports when that happens */
    registerSortOnSaveAction() {
        return vscode.workspace.onWillSaveTextDocument((event) => {
            if (!Utils.isDartFilename(this.currentActiveFilename())) {
                return;
            }

            if (new ExtensionSettings().sortOnSaveEnabled) {
                this.sortAndReplaceImports(event.document);
            }
        });
    }

    private currentActiveFilename() {
        return vscode.window.activeTextEditor?.document.fileName;
    }

    private sortAndReplaceImports(document?: vscode.TextDocument) {
        if (document === null || document === undefined) {
            document = vscode.window.activeTextEditor?.document!;
        }

        const { sortedImports, range } = this.sortImports(document);

        this.replaceWithSortedImports(sortedImports, range);
    }

    private sortImports(document: vscode.TextDocument): { sortedImports: string; range: Range } {
        const documentLines = Utils.splitIntoStringArray(document.getText());

        // Sort dem imports
        const importSorter = new ImportSorter(documentLines);

        const sortedImports = importSorter.sortImports();

        return {
            sortedImports: sortedImports,
            range: {
                start: importSorter.firstRawImportIndex,
                end: importSorter.lastRawImportIndex,
            },
        };
    }

    private replaceWithSortedImports(sortedImports: string, range: Range) {
        new FileInteractor().replace('', range.start, range.end, sortedImports);
    }
}
