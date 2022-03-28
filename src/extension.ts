import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('dartimportsorter.sortImports', () => {
		const importSorter = new ImportSorter();
		importSorter.sortImports();
	});

	context.subscriptions.push(disposable);
}

class ImportSorter {
	documentLines!: string[];
	textEditor!: vscode.TextEditor;

	constructor() {
		this.textEditor = this.getTextEditor();
		this.documentLines = this.getDocumentLines();
	}

	sortImports() {
		const rawImports = this.getRawImportStatements();

		const groupedImports = this.getGroupedImportStatements(rawImports);

		const alphabeticallyOrderedImports = this.sortImportsAlphabetically(groupedImports);

		// TODO: pass alphabeticallyOrderedImports once implemented
		this.removePreviousImports().then(() => this.insertSortedImports(rawImports));
	}

	private getDocumentLines(): string[] {
		return this.textEditor.document.getText().split('\n');
	}

	private getTextEditor(): vscode.TextEditor {
		const textEditor = vscode.window.activeTextEditor!;

		if (textEditor === undefined) {
			vscode.window.showErrorMessage("Couldn't sort imports. Are you sure you have an active editor tab open?");
			throw new Error('Undefined textEditor ref');
		}

		return textEditor;
	}
	
	private getLastImportStatementIndex(): number {
		if (this.documentLines === undefined) {
			return 0;
		}
	
		// reversing to find last item that matches
		const reversedLastIndex = this.documentLines.reverse().findIndex(statement => this.isImportStatement(statement))!;
	
		if (reversedLastIndex === -1) {
			return 0;
		}
	
		// to get real index
		return this.documentLines?.length - reversedLastIndex;
	}
	
	private getRawImportStatements(): string[] {
		return this.documentLines.filter(line => this.isImportStatement(line)).map((line) => line.trim());
	}

	private getGroupedImportStatements(importStatements: string[]): string[][] {
		// TODO: implement
		return [importStatements];
	}

	private sortImportsAlphabetically(importGroups: string[][]): string[][] {
		// TODO: implement
		return importGroups;
	}

	private removePreviousImports(): Thenable<boolean> {
		return this.textEditor.edit((editor) => {
			this.documentLines.slice(this.getLastImportStatementIndex()).forEach((_line, index) => {
				editor.delete(new vscode.Range(new vscode.Position(index, 0), new vscode.Position(index, Number.MAX_SAFE_INTEGER)));
			});
		});
	}

	private insertSortedImports(importStatements: string[]) {
		this.textEditor.edit((editor) => {
			importStatements.sort().forEach((importStatement, index) => {	
				editor.replace(new vscode.Position(index, 0), importStatement);
			});
		});
	}

	private isImportStatement(value: string) {
		// note: all these import statements probably have '\n' at the end, so use 'm' flag for multiline detection
		return RegExp(/^import.*;$/, 'gm').test(value);
	}	
}