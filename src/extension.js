const vscode = require("vscode");
const { createRenderer, render } = require("./render");
const { page } = require("./webview");
const { OutlineTree } = require("./outline");

const VIEW_TYPE = "mdview.editor";

function dirOf(uri) {
  return uri.with({ path: uri.path.replace(/\/[^/]*$/, "") });
}

class MdViewProvider {
  constructor(outline) {
    this.outline = outline;
  }

  resolveCustomTextEditor(document, panel) {
    const webview = panel.webview;
    const base = dirOf(document.uri);
    const folder = vscode.workspace.getWorkspaceFolder(document.uri);

    webview.options = {
      enableScripts: true,
      localResourceRoots: [base, ...(folder ? [folder.uri] : [])],
    };

    const md = createRenderer((src) =>
      webview.asWebviewUri(vscode.Uri.joinPath(base, src)).toString()
    );

    const nonce = String(Math.random()).slice(2);
    webview.html = page(nonce, webview.cspSource);

    let toc = [];
    const push = () => {
      const out = render(md, document.getText());
      toc = out.toc;
      webview.postMessage({ type: "render", html: out.html, toc });
      if (panel.active) this.outline.setActive({ uri: document.uri, toc, panel });
    };

    // Debounced so fast typing in a side-by-side text editor stays smooth.
    let timer;
    const changeSub = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() !== document.uri.toString()) return;
      clearTimeout(timer);
      timer = setTimeout(push, 120);
    });

    const stateSub = panel.onDidChangeViewState(() => {
      if (panel.active) this.outline.setActive({ uri: document.uri, toc, panel });
    });

    const msgSub = webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "copy") {
        await vscode.env.clipboard.writeText(msg.text);
        return;
      }
      if (msg.type !== "link") return;
      const href = msg.href;
      if (/^(https?|mailto):/i.test(href)) {
        await vscode.env.openExternal(vscode.Uri.parse(href));
        return;
      }
      const [rel] = href.split("#");
      try {
        await vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.joinPath(base, rel || ".")
        );
      } catch {
        vscode.window.showWarningMessage(`Cannot open: ${href}`);
      }
    });

    panel.onDidDispose(() => {
      clearTimeout(timer);
      changeSub.dispose();
      stateSub.dispose();
      msgSub.dispose();
      this.outline.clearIf(document.uri);
    });

    push();
    if (panel.active) this.outline.setActive({ uri: document.uri, toc, panel });
  }
}

function activeUri() {
  const tab = vscode.window.tabGroups.activeTabGroup.activeTab;
  return (tab && tab.input && tab.input.uri) || null;
}

function activate(context) {
  const outline = new OutlineTree();

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(VIEW_TYPE, new MdViewProvider(outline), {
      webviewOptions: { retainContextWhenHidden: true },
      supportsMultipleEditorsPerDocument: true,
    }),
    vscode.window.registerTreeDataProvider("mdview.outline", outline),
    vscode.commands.registerCommand("mdview.revealHeading", (id) => {
      if (outline.active) outline.active.panel.webview.postMessage({ type: "reveal", id });
    }),
    vscode.commands.registerCommand("mdview.openSource", async () => {
      const uri = activeUri();
      if (uri) await vscode.commands.executeCommand("vscode.openWith", uri, "default");
    }),
    vscode.commands.registerCommand("mdview.openPreview", async () => {
      const uri = vscode.window.activeTextEditor?.document.uri || activeUri();
      if (uri) await vscode.commands.executeCommand("vscode.openWith", uri, VIEW_TYPE);
    })
  );
}

module.exports = { activate, deactivate() {} };
