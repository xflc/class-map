const vscode = require('vscode');
const { spawn } = require('child_process');

function activate(context) {
    const subclassProvider = new SubclassProvider();
    vscode.window.registerTreeDataProvider('subclassView', subclassProvider);

    const getSubclassesCommand = vscode.commands.registerCommand('extension.getSubclasses', function (uri) {
        subclassProvider.refresh();
    });

    context.subscriptions.push(getSubclassesCommand);
}

class SubclassProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    async getChildren(element) {
        if (!element) {
            // Initialize the root nodes
            return [new ClassNode('Animal', 'Animal')];
        } else {
            const className = element.className;
            const subclasses = await findSubclasses(className);
            return subclasses.map(subclass => new ClassNode(subclass, className));
        }
    }
}

class ClassNode extends vscode.TreeItem {
    constructor(label, className) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.className = className;
    }
}

async function findSubclasses(className) {
    try {
        const document = vscode.window.activeTextEditor.document;
        if (document.languageId === 'python') {
            const text = document.getText();
            const pythonProcess = spawn('python', ['-c', `
                import ast

                def find_subclasses(node, target_class):
                    if isinstance(node, ast.ClassDef):
                        if target_class in [base.id for base in node.bases]:
                            yield node.name
                    for child in ast.iter_child_nodes(node):
                        yield from find_subclasses(child, target_class)

                tree = ast.parse('''${text}''')
                subclasses = list(find_subclasses(tree, '${className}'))
                print(subclasses)
            `], { shell: true });

            return new Promise((resolve, reject) => {
                let output = '';
                pythonProcess.stdout.on('data', data => {
                    output += data.toString();
                });

                pythonProcess.on('close', code => {
                    if (code === 0) {
                        resolve(output.trim().split('\n'));
                    } else {
                        reject(`Error executing Python script: ${output}`);
                    }
                });
            });
        }
    } catch (error) {
        console.error(error);
    }

    return [];
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
