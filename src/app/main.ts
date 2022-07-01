import { container, inject, injectable } from 'tsyringe';
import * as vscode from 'vscode';

import { IExtensionSettings } from './extension-settings/extension-settings.interface';
import { IFileInteractor } from './file-interactor/file-interactor.interface';
import { IImportSorter } from './import-sorter/import-sorter.interface';

import { INJECTION_TOKENS } from './dependency-injection';
import { Range } from './types/range';
import { Utils } from './utils/utils';

@injectable()
export class App {
    constructor(
        @inject(INJECTION_TOKENS.importSorter) private importSorter: IImportSorter,
        @inject(INJECTION_TOKENS.fileInteractor) private fileInteractor: IFileInteractor,
        @inject(INJECTION_TOKENS.extensionSettings) private settings: IExtensionSettings
    ) {}

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

            if (this.settings!.sortOnSaveEnabled) {
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
        const sortingResult = this.importSorter!.sortImports(document.getText());

        return {
            sortedImports: sortingResult.sortedImports,
            range: {
                start: sortingResult.firstRawImportIndex,
                end: sortingResult.lastRawImportIndex,
            },
        };
    }

    private replaceWithSortedImports(sortedImports: string, range: Range) {
        this.fileInteractor.replace('', range.start, range.end, sortedImports);
    }
}
