import * as vscode from 'vscode';

import { Range } from '../types/range';

export class VscodeDocumentLineReplacer {
    textEditor!: vscode.TextEditor;

    constructor() {
        this.textEditor = this.getTextEditor();
    }

    // REFACTOR
    replace({ range, withLines }: { range: Range; withLines: string }) {
        if (withLines.length === 0 || range.end === -1 || range.start === -1) {
            return; // nothing to sort
        }

        const lineRange = new vscode.Range(
            new vscode.Position(range.start, 0),
            new vscode.Position(range.end, 0)
        );

        this.textEditor.edit((editor) => {
            editor.replace(lineRange, withLines + '\n');
        });
    }

    private getTextEditor(): vscode.TextEditor {
        const textEditor = vscode.window.activeTextEditor!;

        if (textEditor === undefined) {
            vscode.window.showErrorMessage(
                "Couldn't sort imports. Are you sure you have an active editor tab open?"
            );

            throw new Error('Undefined textEditor ref');
        }

        return textEditor;
    }
}
