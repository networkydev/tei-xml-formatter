import { Range } from "vscode";

export type TokenType = 
    | "OpenTagStart" // <
    | "CloseTagStart" // </
    | "TagEnd" // >
    | "SelfClosingTagEnd" // />
    | "TagContent" // <hi rend="bold">Hello</hi> -> Hello
    | "PIStart" // <?
    | "PIEnd" // ?>
    | "DeclarationStart" // <!
    | "DeclarationName" // <![CDATA[ -> [CDATA[
    | "CDATATagEnd" // ]]>
    | "CommentEnd" // -->
    | "TagName" // <hi> -> hi, <p> -> p
    | "Attribute" // <hi rend="bold"> -> rend
    | "Equal" // =
    | "DoubleQuote" // "
    | "SingleQuote" // '
    | "WhiteSpace" // " "
    | "AttributeValue" // <hi rend="bold"> -> bold
    | "WhiteSpace" // " ", "    "
    | "NewLine" // \n
    | "EntityCode" // &amp; (is & entity code)
    | "Illegal" // Unknown type

export type Token = {
    Name: TokenType;
    Literal: string;
    Range: Range;
}


// Token Chart
/*
| TokenType         | Description                            | Example (of token)                     |
| ----------------- | -------------------------------------- | -------------------------------------- |
| OpenTagStart      | Start of an opening tag                | <                                      |
| CloseTagStart     | Start of a closing tag                 | </                                     |
| TagEnd            | End of a normal opening/closing tag    | >                                      |
| SelfClosingTagEnd | End of a self-closing tag              | />                                     |
| TagContent        | Inner text content of a tag            | <hi rend="bold">Hello</hi> → Hello     |
| PIStart           | Start of a processing instruction      | <?                                     |
| PIEnd             | End of a processing instruction        | ?>                                     |
| DeclarationStart  | Start of a declaration                 | <!                                     |
| DeclarationName   | Name inside a declaration              | <![CDATA[ → CDATA[                     |
| CDATATagEnd       | End of CDATA section                   | ]]>                                    |
| CommentEnd        | End of a comment                       | -->                                    |
| TagName           | Element/tag name                       | <hi> → hi, <p> → p                     |
| Attribute         | Attribute name                         | <hi rend="bold"> → rend                |
| Equal             | Equal sign between attribute and value | =                                      |
| DoubleQuote       | Double quote                           | "                                      |
| SingleQuote       | Single quote                           | '                                      |
| AttributeValue    | Attribute value                        | <hi rend="bold"> → bold                |
| WhiteSpace        | Space character(s)                     | " " or "  "                            |
| NewLine           | New line character                     | \n                                     |
| EntityCode        | Entity code                            | &amp; (represents &)                   |
| Illegal           | Unknown / invalid token type           | (varies)                               |
*/