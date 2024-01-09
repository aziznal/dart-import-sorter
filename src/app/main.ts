import { inject, injectable } from 'tsyringe';
import * as vscode from 'vscode';

import { IExtensionSettings } from './extension-settings/extension-settings.interface';
import { IFileInteractor } from './file-interactor/file-interactor.interface';
import { IImportSorter } from './import-sorter/import-sorter.interface';

import { INJECTION_TOKENS } from './dependency-injection';
import { Utils } from './utils/utils';

@injectable()
export class App {
    constructor(
        @inject(INJECTION_TOKENS.importSorter) private importSorter: IImportSorter,
        @inject(INJECTION_TOKENS.fileInteractor) private fileInteractor: IFileInteractor,
        @inject(INJECTION_TOKENS.extensionSettings) private settings: IExtensionSettings
    ) {}

    registerSortImportsCommand() {
        return vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
            if (!this.#isCurrentFileDart()) {
                vscode.window.showWarningMessage('dartimportsorter only works on .dart files.');
                return;
            }

            this.#sortImports();
        });
    }

    registerSortOnSaveAction() {
        return vscode.workspace.onWillSaveTextDocument((event) => {
            if (!this.#isCurrentFileDart()) {
                return;
            }

            if (this.settings.sortOnSaveEnabled) {
                this.#sortImports(event.document);
            }
        });
    }

    #isCurrentFileDart() {
        return Utils.isDartFilename(vscode.window.activeTextEditor?.document.fileName);
    }

    #sortImports(document?: vscode.TextDocument) {
        if (!document) {
            document = vscode.window.activeTextEditor?.document!;
        }

        const { sortedImports, start, end } = this.#getSortedImports(document);

        this.#replaceRange({
            replacement: sortedImports,
            start,
            end,
        });
    }

    #getSortedImports(document: vscode.TextDocument): {
        sortedImports: string;
        start: number;
        end: number;
    } {
        const sortingResult = this.importSorter.sortImports(document.getText());

        return {
            sortedImports: sortingResult.sortedImports,
            start: sortingResult.firstRawImportIndex,
            end: sortingResult.lastRawImportIndex,
        };
    }

    #replaceRange({
        replacement,
        start,
        end,
    }: {
        replacement: string;
        start: number;
        end: number;
    }) {
        // replacing a range is non-inclusive of the start index, so we need to subtract 1
        this.fileInteractor.replace({
            from: start - 1,
            to: end,
            replacement,
        });
    }
}
