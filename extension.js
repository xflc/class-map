const vscode = require('vscode');

class TreeItem {
    constructor(label, collapsibleState) {
        this.label = label;
        this.collapsibleState = collapsibleState;
    }
}

class TreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    getChildren(element) {
        if (!element) {
            return ['Hello World'];
        } else if (element === 'Hello World') {
            return ['Child 1', 'Child 2', 'Child 3'];
        } else {
            return []; // No more children for individual items
        }
    }

    getTreeItem(element) {
        return new TreeItem(element, vscode.TreeItemCollapsibleState.Collapsed);
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }
}

function activate(context) {
    const treeDataProvider = new TreeDataProvider();
    vscode.window.registerTreeDataProvider('helloWorld', treeDataProvider);

    // Create a command to refresh the tree view
    vscode.commands.registerCommand('extension.refreshTree', () => {
        treeDataProvider.refresh();
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
