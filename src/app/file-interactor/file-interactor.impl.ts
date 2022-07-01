import { injectable } from 'tsyringe';
import * as vscode from 'vscode';

import { IFileInteractor } from './file-interactor.interface';

import { Range } from '../types/range';

import * as fs from 'fs';

@injectable()
export class FileInteractor implements IFileInteractor {
    private textEditor!: vscode.TextEditor;

    read(filepath: string): string {
        return fs.readFileSync(filepath).toString();
    }

    write(filepath: string): string {
        throw new Error('Method not implemented.');
    }

    replace(filepath: string, from: number, to: number, withLines: string): void {
        this.replaceWith({ range: { start: from, end: to }, withLines: withLines });
    }

    // REFACTOR
    private replaceWith({ range, withLines }: { range: Range; withLines: string }) {
        this.textEditor = this.getTextEditor();

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
