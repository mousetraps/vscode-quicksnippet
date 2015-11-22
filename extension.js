// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var json = require('comment-json');
var uuid = require('node-uuid');
var stringify = require('json-stable-stringify');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "create-snippet" is now active!'); 

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
	   // The code you place here will be executed every time your command is executed

		// Display a message box to the user
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			return; // No open text editor
		}

		var snippetPath = path.join(process.env.APPDATA, 'Code', 'User', 'snippets', editor.document.languageId + '.json');
		fs.readFile(snippetPath, 'utf8', function (e, data) {
			console.log(data);
			var jsonData = JSON.parse(data, null, true);
			console.log(jsonData);
			var selection = editor.document.getText(editor.selection);
			var snippetParts = (selection + "$1").split(/\r?\n/);
			
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
				snippetParts[i] = Array(Math.max(trimLength - trimLastLength + 1, 0)).join(trimCharacter) + trim;
			}

			jsonData["REPLACE-WITH-YOUR-SNIPPET-NAME"] = {
				"prefix": "yourPrefixHere",
				"body": snippetParts,
				"description": "Your snippet description here."
			}	
			console.log(jsonData);

			fs.writeFile(snippetPath, stringify(jsonData, { 
                space: '  ',
			cmp: function(a,b){
				if (b.key === 'REPLACE-WITH-YOUR-SNIPPET-NAME') {
					return 1;
				}
				if (a.key === 'REPLACE-WITH-YOUR-SNIPPET-NAME') {
					return -1;
				}
				return a.key < b.key ? -1 : 1
			}}), {encoding:'utf8'},
				function (err) {
					vscode.window.showInformationMessage('Hello World!', selection);
					vscode.workspace.openTextDocument(snippetPath).then(function (document) {
						vscode.window.showTextDocument(document, vscode.ViewColumn.Two);
					});
		        });
		});
	});

	context.subscriptions.push(disposable);
}


exports.activate = activate;