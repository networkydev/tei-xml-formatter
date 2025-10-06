import * as vscode from 'vscode';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import { Lexer } from './parser/lexer';
import { Token } from './parser/token';
import { json } from 'stream/consumers';

export class Formatter implements vscode.DocumentFormattingEditProvider {
    /**
     * helper func to debug, delete in prod
     * @param charr character number on line 0 to get
     * @returns a string for the return of getText(), undefined returns ""
     */
    getChar(line: number, charr: number): string {
        let charia = vscode.window.activeTextEditor?.document.getText(new vscode.Range(new vscode.Position(line, charr), new vscode.Position(line, charr+1))) ?? "";
        return charia;
    } 

    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        // Entire part is to expose stuff to the debug REPL. Delete in prod
        let getChar = this.getChar;
        (globalThis as any).vscode = vscode;
        (globalThis as any).Range = vscode.Range;
        (globalThis as any).Position = vscode.Position;
        (globalThis as any).document = document;

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return; // or throw an error
        }


        const parser = new XMLParser();
        let parsedXML = parser.parse(document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).range.end.character))));
        console.log(JSON.stringify(parsedXML, null, 2));
        return;
    }
}