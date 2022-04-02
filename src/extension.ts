import * as vscode from 'vscode';

import { ImportSorter } from './import-sorter';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
		const importSorter = new ImportSorter();
		importSorter.sortImports();
	});

	context.subscriptions.push(disposable);
}
