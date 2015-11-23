var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var json = require('comment-json');
var stringify = require('json-stable-stringify');

var DEFAULT_SNIPPET_NAME = 'REPLACE-WITH-YOUR-SNIPPET-NAME';

// this method is called when the extension is activated
exports.activate = function activate(context) {
    console.log('Extension "create-snippet" is now active!');

    var disposable = vscode.commands.registerCommand(
        'extension.sayHello',
        function() {
            var editor = vscode.window.activeTextEditor;
            if (!editor) {
                // Don't open text editor
                return;
            }

            var snippetFilename = getSnippetFilename(editor);

            fs.readFile(snippetFilename, 'utf8', function(e, data) {
                var snippetBody = getSnippetBody(editor);

                console.log(data);
                var jsonData = JSON.parse(data, null, true);
                jsonData[DEFAULT_SNIPPET_NAME] = {
                    prefix: 'yourPrefixHere',
                    body: snippetBody,
                    description: 'Your snippet description here.'
                };
                console.log(jsonData);

                updateSnippetFile(snippetFilename, jsonData);
            });
        });

    context.subscriptions.push(disposable);
};

function getSnippetFilename(editor) {
    var userDataPath = process.env.APPDATA ||
        (process.platform === 'darwin' ?
        process.env.HOME + 'Library/Preference' : '/var/local');

    return path.join(
        userDataPath,
        'Code', 'User', 'snippets',
        editor.document.languageId + '.json');
}

function getSnippetBody(editor) {
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
    return snippetParts;
}

function updateSnippetFile(snippetFilename, jsonData) {
    fs.writeFile(
        snippetFilename,
        stringify(jsonData, {space: '  ', cmp: snippetCompare}), {encoding: 'utf8'},
        function(err) {
            vscode.workspace.openTextDocument(snippetFilename).then(function(document) {
                vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
            });
        }
    );
}

function snippetCompare(a, b) {
    if (b.key === DEFAULT_SNIPPET_NAME) {
        return 1;
    } else if (a.key === DEFAULT_SNIPPET_NAME) {
        return -1;
    }
    return a.key < b.key ? -1 : 1;
}

