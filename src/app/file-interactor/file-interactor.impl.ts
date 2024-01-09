import { injectable } from 'tsyringe';
import * as vscode from 'vscode';

import { IFileInteractor, ReplaceRangeInFileOptions } from './file-interactor.interface';

import * as fs from 'fs';

@injectable()
export class FileInteractor implements IFileInteractor {
    private textEditor!: vscode.TextEditor;

    read(filepath: string): string {
        return fs.readFileSync(filepath).toString();
    }

    replace({ from, to, replacement }: ReplaceRangeInFileOptions): void {
        this.textEditor = this.getTextEditor();

        if (replacement.length === 0 || to === -1 || from === -1) {
            return; // nothing to sort
        }

        const lineRange = new vscode.Range(
            new vscode.Position(from, 0),
            new vscode.Position(to, 0)
        );

        this.textEditor.edit((editor) => {
            editor.replace(lineRange, replacement + '\n');
        });
    }

    private getTextEditor(): vscode.TextEditor {
        const textEditor = vscode.window.activeTextEditor;

        if (!textEditor) {
            vscode.window.showErrorMessage(
                "Couldn't sort imports. Are you sure you have an active editor tab open?"
            );

            throw new Error('Undefined textEditor ref');
        }

        return textEditor;
    }
}
