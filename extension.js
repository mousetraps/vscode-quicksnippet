var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var json = require('comment-json');
var prependFile = require('prepend-file');

var SNIPPET_TEMPLATE_NAME = 'snippet-comment-template.txt';

// this method is called when the extension is activated
exports.activate = function activate(context) {
    console.log('Extension "create-snippet" is now active!');
    SNIPPET_TEMPLATE_NAME = path.join(context.extensionPath, SNIPPET_TEMPLATE_NAME);
    var disposable = vscode.commands.registerCommand(
        'extension.createSnippet',
        function() {
            var editor = vscode.window.activeTextEditor;
            if (!editor) {
                // Don't open text editor
                return;
            }

            var snippetFilename = getSnippetFilename(editor);

            fs.exists(snippetFilename, function(exists) {
                if (!exists) {
                    fs.writeFileSync(snippetFilename, '{ }', {encoding: 'utf8'});
                }
                
                createSnippet(snippetFilename, editor);
            });
        });

    context.subscriptions.push(disposable);
};

function createSnippet(snippetFilename, editor) {
    fs.readFile(snippetFilename, 'utf8', function(e, data) {
        console.log(data);
        var jsonData = (data ? json.parse(data, null, false) : {});
        addSelectedSnippetAsync(jsonData, editor).then(function(result) {
            jsonData = result;
            updateSnippetFile(snippetFilename, jsonData);
        });
    });
}

function addSelectedSnippetAsync(jsonData, editor) {
    var newJsonData = {};

    var snippetBody = getSnippetBody(editor);

    return vscode.window.showInputBox({prompt:'Enter a name for your snippet'}).then(function(value) {
        var snippetName = value;

        if (typeof (jsonData['//$']) !== 'undefined') {
            // newJsonData['//$'] = jsonData['//$'];
        }
    
        newJsonData[snippetName] = {
            prefix: 'yourPrefixHere',
            body: snippetBody,
            description: 'Your snippet description here.'
        };
    
        for (var key in jsonData) {
            if (key !== snippetName && key !== '//$') {
                newJsonData[key] = jsonData[key];
            }
        }
        console.log(newJsonData);
        return newJsonData;
    })
}

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

    snippetParts[0] = snippetParts[0].trimLeft();

    var trimLast = snippetParts[snippetParts.length - 1].trimLeft();
    var trimLastLength = snippetParts[snippetParts.length - 1].length - trimLast.length;
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
    console.log(jsonData);
    fs.writeFile(
        snippetFilename,
        json.stringify(jsonData, null, ' '), {encoding: 'utf8'},
        function(err) {
            if (err) {
                throw err;
            }
        }
    );
}
