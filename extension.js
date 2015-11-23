var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var json = require('comment-json');
var stringify = require('json-stable-stringify');

// this method is called when the extension is activated
function activate(context) {
    console.log('Extension "create-snippet" is now active!');

    var disposable = vscode.commands.registerCommand(
        'extension.sayHello',
        function() {
            // called whenever the command is executed

            var editor = vscode.window.activeTextEditor;
            if (!editor) {
                // Don't open text editor
                return;
            }

            var userDataPath = process.env.APPDATA ||
                process.platform === 'darwin' ?
                process.env.HOME + 'Library/Preference' : '/var/local';

            var snippetFilename = path.join(
                userDataPath,
                'Code', 'User', 'snippets',
                editor.document.languageId + '.json');

            fs.readFile(snippetFilename, 'utf8', function(e, data) {
                console.log(data);
                var jsonData = JSON.parse(data, null, true);
                console.log(jsonData);
                var selection = editor.document.getText(editor.selection);
                var snippetParts = (selection + '$1').split(/\r?\n/);

                var trimFirst = snippetParts[0].trimLeft();

                var trimLast = snippetParts[snippetParts.length - 1].trimLeft();
                var trimLastLength = snippetParts[snippetParts.length - 1].length - trimLast.length;

                snippetParts[0] = trimFirst;
                snippetParts[snippetParts.length - 1] = trimLast;

                for (var i = 0; i < snippetParts.length; i++) {
                    snippetParts[i] = snippetParts[i].trimRight();
                    if (i === 0 || i === snippetParts.length - 1) {
                        continue;
                    }
                    var trim = snippetParts[i].trimLeft();
                    var trimLength = snippetParts[i].length - trim.length;
                    var trimCharacter = snippetParts[i][0];
                    snippetParts[i] =
                        Array(Math.max(trimLength - trimLastLength + 1, 0))
                        .join(trimCharacter) + trim;
                }

                jsonData['REPLACE-WITH-YOUR-SNIPPET-NAME'] = {
                    prefix: 'yourPrefixHere',
                    body: snippetParts,
                    description: 'Your snippet description here.'
                };

                console.log(jsonData);

                fs.writeFile(snippetFilename, stringify(jsonData, {
                    space: '  ',
                    cmp: function(a, b) {
                        if (b.key === 'REPLACE-WITH-YOUR-SNIPPET-NAME') {
                            return 1;
                        }
                        if (a.key === 'REPLACE-WITH-YOUR-SNIPPET-NAME') {
                            return -1;
                        }
                        return a.key < b.key ? -1 : 1;
                    }}), {encoding: 'utf8'},
                        function(err) {
                            vscode.window.showInformationMessage('Hello World!', selection);
                            vscode.workspace.openTextDocument(snippetFilename).then(function(document) {
                                vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
                            });
                        });
            });
        });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
