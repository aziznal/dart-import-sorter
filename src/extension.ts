import 'reflect-metadata';

import { container } from 'tsyringe';
import * as vscode from 'vscode';

import { App } from './app/main';

export function activate(context: vscode.ExtensionContext) {
    const app = container.resolve(App);

    const sortImportsCommand = app.registerSortImportsCommand();
    const sortOnSaveAction = app.registerSortOnSaveAction();

    context.subscriptions.push(sortImportsCommand);
    context.subscriptions.push(sortOnSaveAction);
}
