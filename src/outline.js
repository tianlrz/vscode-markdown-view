const vscode = require("vscode");

/**
 * VS Code's built-in Outline view is driven by IOutlineService, which only has
 * creators for text editors and notebooks — a custom editor can never populate
 * it, and there is no extension API to supply one. So this contributes its own
 * outline tree, placed in the Explorer next to where the built-in one sits.
 */
class OutlineTree {
  constructor() {
    this._emitter = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._emitter.event;
    /** @type {{uri: vscode.Uri, toc: Array, panel: vscode.WebviewPanel}|null} */
    this.active = null;
  }

  setActive(entry) {
    this.active = entry;
    this._emitter.fire();
  }

  clearIf(uri) {
    if (this.active && this.active.uri.toString() === uri.toString()) {
      this.active = null;
      this._emitter.fire();
    }
  }

  getTreeItem(item) {
    return item;
  }

  getChildren(parent) {
    if (parent) return [];
    if (!this.active || !this.active.toc.length) return [];

    const min = Math.min(...this.active.toc.map((h) => h.level));
    return this.active.toc.map((h) => {
      const item = new vscode.TreeItem(
        "  ".repeat(Math.max(0, h.level - min)) + h.text,
        vscode.TreeItemCollapsibleState.None
      );
      item.iconPath = new vscode.ThemeIcon(h.level <= min ? "symbol-class" : "symbol-field");
      item.tooltip = h.text;
      item.command = {
        command: "mdview.revealHeading",
        title: "Go to heading",
        arguments: [h.id],
      };
      return item;
    });
  }
}

module.exports = { OutlineTree };
