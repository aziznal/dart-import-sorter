import * as vscode from 'vscode';

import { App } from './app/main';

export function activate(context: vscode.ExtensionContext) {
    const app = new App();

    const sortImportsCommand = app.registerSortImportsCommand();
    const sortOnSaveAction = app.registerSortOnSaveAction();

    context.subscriptions.push(sortImportsCommand);
    context.subscriptions.push(sortOnSaveAction);
}
