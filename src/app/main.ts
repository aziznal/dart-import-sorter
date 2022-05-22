import * as vscode from 'vscode';

import { IExtensionSettings } from './extension-settings/extension-settings.interface';

import { ExtensionSettings } from './extension-settings/extension-settings.impl';
import { FileInteractor } from './file-interactor/file-interactor.impl';
import { ImportSorter } from './import-sorter/import-sorter.impl';
import { Range } from './types/range';
import { Utils } from './utils';

export class App {
    settings: IExtensionSettings = new ExtensionSettings();

    /** Sets vscode to listen to the activation of the main command and sorts imports when it is activated */
    registerSortImportsCommand() {
        return vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
            if (!this.checkIsDartFile()) {
                vscode.window.showWarningMessage('dartimportsorter only works on .dart files.');
                return;
            }

            this.sortAndReplaceImports();
        });
    }

    /** Sets up listener for save action to sort imports when that happens */
    registerSortOnSaveAction() {
        return vscode.workspace.onWillSaveTextDocument((event) => {
            if (!this.checkIsDartFile()) {
                return;
            }

            if (this.settings.sortOnSaveEnabled) {
                this.sortAndReplaceImports(event.document);
            }
        });
    }

    private checkIsDartFile() {
        return Utils.isDartFilename(this.getCurrentActiveFilename());
    }

    private getCurrentActiveFilename() {
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
        const sortingResult = new ImportSorter().sortImports(document.getText());

        return {
            sortedImports: sortingResult.sortedImports,
            range: {
                start: sortingResult.firstRawImportIndex,
                end: sortingResult.lastRawImportIndex,
            },
        };
    }

    private replaceWithSortedImports(sortedImports: string, range: Range) {
        new FileInteractor().replace('', range.start, range.end, sortedImports);
    }
}
