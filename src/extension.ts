import * as vscode from 'vscode'; // Import VS Code API
import { Formatter } from './formatter';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('tei-xml-formatter is now active!');

	let formatter = new Formatter;
	let selector: vscode.DocumentSelector = { scheme: 'file', language: 'xml' };
	const formatRegister = vscode.languages.registerDocumentFormattingEditProvider(selector, formatter);

	context.subscriptions.push(formatRegister);
}

// This method is called when your extension is deactivated
export function deactivate() { }
