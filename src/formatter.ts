/*
    Node class
    just a text 


    Thoughts:
    There is no ned for the node class to even have a concept of anything XML related. It only needs to know of token groups

*/


import * as vscode from 'vscode';
import { SaxesParser } from 'saxes';

// Base type node
type Node =  {
    type: NodeType;
    body: string; // The full node as string
    closed: boolean; // Whether the node end tag has been encountered
    parent?: Node; // Contains a reference to the parent object, TypeScript does not have a way of finding the parent array form witihn the children array
    children: Node[]; // Any children the node has
}

type Tag = Node & {
    /**
     * Stores the close tag as a string. Is empty if a self closing tag
     */
    closeTag?: string;
}

type NodeType = "Root" | "XMLDecl" | "DocType" | "PI" | "CData" | "Tag" | "Comment" | "Text";

export class Formatter implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        const root: Node = {
            type: "Root",
            body: "",
            closed: false,
            // Doesn't have a parent
            children: []
        };

        const stack: Node[] = [root]; // stack[len() - 1] holds the current parent

        const parser = new SaxesParser();
        const he = require("he");

        parser.on("error", function (e) {
            console.error(e);
            vscode.window.showErrorMessage("Error: " + e.message);
            return;
        });
        
        parser.on("xmldecl", dec => { // Always the first line in the XML document
            const node: Node = {
                type: "XMLDecl",
                body: `<?xml version="${dec.version}"${dec.encoding !== undefined ? ` encoding="${dec.encoding}"` : ``}${dec.standalone !== undefined ? ` standalone="${dec.standalone}"` : ``}?>`,
                closed: true,
                parent: stack[stack.length - 1],
                children: []
            };

            stack[stack.length - 1].children.push(node);
        });
        
        parser.on("doctype", doc => {
            const node: Node = {
                type: "DocType",
                body: `<!DOCTYPE${doc}>`,
                closed: true,
                parent: stack[stack.length - 1],
                children: []
            };

            stack[stack.length - 1].children.push(node);
        });
        
        parser.on("processinginstruction", pi => {
            const node: Node = {
                type: "PI",
                body: `<?${pi.target}${pi.body !== "" ? ` ${pi.body.replace(/[\n\t]/g,"")}` : ``}?>`,
                closed: true,
                parent: stack[stack.length - 1],
                children: []
            };

            stack[stack.length - 1].children.push(node);
        });
        
        parser.on("cdata", cdata => {
            const node: Node = {
                type: "CData",
                body: `<![CDATA[${cdata}]]>`,
                closed: true,
                parent: stack[stack.length - 1],
                children: []
            };
            
            stack[stack.length - 1].children.push(node);
        });
        
        parser.on("opentag", tag => {
            const node: Tag = {
                type: "Tag",
                body: `<${tag.name}`,
                closed: false,
                parent: stack[stack.length - 1],
                children: []
            };

            for (const key in tag.attributes) {
                node.body += ` ${key}="${tag.attributes[`${key}`]}"`;
            }

            if (tag.isSelfClosing) {
                node.closed = true;
                node.body += "/>";
            } else {
                node.body += ">";
            }

            stack[stack.length - 1].children.push(node);
            !tag.isSelfClosing && stack.push(node); // Node is not yet closed so make it the new parent
        });
        
        parser.on("closetag", tag => {
            if (tag.isSelfClosing) { return; }
            const node: Tag = stack[stack.length - 1]; // Grab the most recent parent node to close
            node.closeTag = `</${tag.name}>`;

            stack.pop();
        });
        
        parser.on("comment", comment => {
            const node: Node = {
                type: "Comment",
                body: `<!--${comment}-->`,
                closed: true,
                parent: stack[stack.length - 1],
                children: []
            };

            stack[stack.length - 1].children.push(node);
        });
        
        parser.on("text", text => {
            const node: Node = {
                type: "Text",
                // body: text.replace(/[ \t\n]+/g, " "), // Normalize all spaces to one
                body: text,
                closed: true,
                parent: stack[stack.length - 1],
                children: []
            };

            stack[stack.length - 1].children.push(node);
        });

        parser.write(document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).range.end.character)))).close();

        const folder = vscode.workspace.workspaceFolders?.[0];
        if (!folder) {
            vscode.window.showErrorMessage("No workspace open");
            return;
        }
        
        const fileUri = vscode.Uri.joinPath(folder.uri, "formatted.json");
        vscode.workspace.fs.writeFile(fileUri, Buffer.from(JSON.stringify(root, (key, value) => {
            if (key === "parent") { return undefined; } // skip parent to avoid circular refs
            return value;
            }, 2), "utf8"));

        // console.log(JSON.stringify(formatted));

        return;
    }
}
