import * as vscode from 'vscode';
import { Lexer } from './parser/lexer';

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

        let lex: Lexer = new Lexer(editor.document);
        let char: string;
        let rng: vscode.Range | undefined = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
        do {
            if ( rng === undefined ) {
                vscode.window.showErrorMessage("range is undefined");
                return;
            }
            rng = lex.nextPosition(rng.start.line, rng.start.character);
            // TODO
            char = document.getText(rng); // On the last loop through rng becomes undefined and so this method returns the entire text document. Make a better loop
            console.log(char);
        } while (rng !== undefined);

        return;
    }
}