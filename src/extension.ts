import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
		
		const foo = vscode.window.activeTextEditor;

		console.log(foo?.document.getText());
		
	});

	context.subscriptions.push(disposable);
}
