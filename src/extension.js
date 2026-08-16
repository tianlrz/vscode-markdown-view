const vscode = require("vscode");
const MarkdownIt = require("markdown-it");
const hljs = require("highlight.js/lib/common");

const VIEW_TYPE = "mdview.editor";

/** GitHub-ish heading slugs, so in-document TOC links resolve. */
function slugify(text, used) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
  const key = base || "section";
  const n = (used.get(key) || 0) + 1;
  used.set(key, n);
  return n === 1 ? key : `${key}-${n}`;
}

function createRenderer(webview, docUri) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
    highlight(str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        } catch {
          /* fall through to escaped plain text */
        }
      }
      return "";
    },
  });

  // Relative image paths must be rewritten to webview URIs or they render broken.
  const baseImage =
    md.renderer.rules.image ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const srcIdx = token.attrIndex("src");
    if (srcIdx >= 0) {
      const src = token.attrs[srcIdx][1];
      if (!/^(https?:|data:|vscode-)/i.test(src)) {
        const resolved = vscode.Uri.joinPath(
          docUri.with({ path: docUri.path.replace(/\/[^/]*$/, "") }),
          src
        );
        token.attrs[srcIdx][1] = webview.asWebviewUri(resolved).toString();
      }
    }
    return baseImage(tokens, idx, options, env, self);
  };

  // Give headings stable ids so anchor links work.
  const used = new Map();
  md.core.ruler.push("mdview_heading_ids", (state) => {
    used.clear();
    const toks = state.tokens;
    for (let i = 0; i < toks.length; i++) {
      if (toks[i].type !== "heading_open") continue;
      const inline = toks[i + 1];
      if (!inline || inline.type !== "inline") continue;
      toks[i].attrSet("id", slugify(inline.content, used));
    }
  });

  return md;
}

const STYLE = `
:root { color-scheme: light dark; }
body {
  margin: 0;
  padding: 2rem 3rem 6rem;
  max-width: 60rem;
  font-family: var(--vscode-font-family), -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 15px;
  line-height: 1.75;
  color: var(--vscode-editor-foreground);
  background: var(--vscode-editor-background);
  word-wrap: break-word;
}
h1, h2, h3, h4, h5, h6 { line-height: 1.3; margin: 2em 0 .7em; font-weight: 600; }
h1 { font-size: 1.9em; }
h2 { font-size: 1.5em; border-bottom: 1px solid var(--vscode-panel-border, rgba(128,128,128,.35)); padding-bottom: .3em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1.05em; }
h1:first-child, h2:first-child { margin-top: 0; }
p, ul, ol, blockquote, table, pre { margin: 0 0 1.1em; }
a { color: var(--vscode-textLink-foreground); text-decoration: none; }
a:hover { text-decoration: underline; }
ul, ol { padding-left: 1.6em; }
li { margin: .3em 0; }
blockquote {
  margin-left: 0; padding: .3em 1em;
  border-left: 4px solid var(--vscode-textBlockQuote-border, rgba(128,128,128,.5));
  background: var(--vscode-textBlockQuote-background, rgba(128,128,128,.08));
  color: var(--vscode-descriptionForeground);
}
code {
  font-family: var(--vscode-editor-font-family), monospace;
  font-size: .89em;
  background: var(--vscode-textCodeBlock-background, rgba(128,128,128,.16));
  padding: .15em .4em; border-radius: 3px;
}
pre {
  background: var(--vscode-textCodeBlock-background, rgba(128,128,128,.12));
  border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.25));
  border-radius: 6px; padding: 1em; overflow-x: auto;
}
pre code { background: none; padding: 0; font-size: .88em; }
table { border-collapse: collapse; display: block; overflow-x: auto; }
th, td { border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.35)); padding: .5em .85em; }
th { background: var(--vscode-editorWidget-background, rgba(128,128,128,.12)); font-weight: 600; }
img { max-width: 100%; }
hr { border: none; border-top: 1px solid var(--vscode-panel-border, rgba(128,128,128,.35)); margin: 2em 0; }
kbd {
  font-family: var(--vscode-editor-font-family), monospace; font-size: .85em;
  border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.4));
  border-bottom-width: 2px; border-radius: 4px; padding: .1em .4em;
}
/* highlight.js -> VS Code token colors, so it tracks whatever theme is active */
.hljs-comment, .hljs-quote { color: var(--vscode-editorLineNumber-foreground); font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-doctag { color: var(--vscode-debugTokenExpression-name, #569cd6); }
.hljs-string, .hljs-regexp, .hljs-addition { color: var(--vscode-debugTokenExpression-string, #ce9178); }
.hljs-number, .hljs-variable, .hljs-template-variable { color: var(--vscode-debugTokenExpression-number, #b5cea8); }
.hljs-title, .hljs-section, .hljs-function .hljs-title { color: var(--vscode-symbolIcon-functionForeground, #dcdcaa); }
.hljs-type, .hljs-class .hljs-title, .hljs-built_in { color: var(--vscode-symbolIcon-classForeground, #4ec9b0); }
.hljs-attr, .hljs-attribute, .hljs-name { color: var(--vscode-symbolIcon-propertyForeground, #9cdcfe); }
.hljs-meta { color: var(--vscode-descriptionForeground); }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 600; }
`;

const CLIENT = `
const vscodeApi = acquireVsCodeApi();
const root = document.getElementById("content");

window.addEventListener("message", (e) => {
  const msg = e.data;
  if (msg.type !== "render") return;
  const y = window.scrollY;
  root.innerHTML = msg.html;
  // Keep the reader where they were across live re-renders.
  window.scrollTo(0, y);
  vscodeApi.setState({ scroll: y });
});

document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  if (href.startsWith("#")) {
    const el = document.getElementById(decodeURIComponent(href.slice(1)));
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    return;
  }
  e.preventDefault();
  vscodeApi.postMessage({ type: "link", href });
});

const prev = vscodeApi.getState();
if (prev && prev.scroll) {
  window.addEventListener("load", () => window.scrollTo(0, prev.scroll));
}
`;

class MdViewProvider {
  constructor(context) {
    this.context = context;
  }

  resolveCustomTextEditor(document, panel) {
    const webview = panel.webview;
    const folder = vscode.workspace.getWorkspaceFolder(document.uri);
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        document.uri.with({ path: document.uri.path.replace(/\/[^/]*$/, "") }),
        ...(folder ? [folder.uri] : []),
      ],
    };

    const md = createRenderer(webview, document.uri);
    const nonce = String(Math.random()).slice(2);
    webview.html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>${STYLE}</style></head>
<body><div id="content"></div>
<script nonce="${nonce}">${CLIENT}</script></body></html>`;

    const push = () => webview.postMessage({ type: "render", html: md.render(document.getText()) });

    // Debounced so fast typing in a side-by-side text editor stays smooth.
    let timer;
    const sub = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() !== document.uri.toString()) return;
      clearTimeout(timer);
      timer = setTimeout(push, 120);
    });

    const linkSub = webview.onDidReceiveMessage(async (msg) => {
      if (msg.type !== "link") return;
      const href = msg.href;
      if (/^(https?|mailto):/i.test(href)) {
        await vscode.env.openExternal(vscode.Uri.parse(href));
        return;
      }
      const [rel, frag] = href.split("#");
      const target = vscode.Uri.joinPath(
        document.uri.with({ path: document.uri.path.replace(/\/[^/]*$/, "") }),
        rel || "."
      );
      try {
        await vscode.commands.executeCommand("vscode.open", target);
      } catch {
        vscode.window.showWarningMessage(`Cannot open: ${href}${frag ? "#" + frag : ""}`);
      }
    });

    panel.onDidDispose(() => {
      clearTimeout(timer);
      sub.dispose();
      linkSub.dispose();
    });

    push();
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(VIEW_TYPE, new MdViewProvider(context), {
      webviewOptions: { retainContextWhenHidden: true },
      supportsMultipleEditorsPerDocument: true,
    }),
    vscode.commands.registerCommand("mdview.openSource", async () => {
      const uri = vscode.window.tabGroups.activeTabGroup.activeTab?.input?.uri;
      if (uri) await vscode.commands.executeCommand("vscode.openWith", uri, "default");
    }),
    vscode.commands.registerCommand("mdview.openPreview", async () => {
      const uri = vscode.window.activeTextEditor?.document.uri;
      if (uri) await vscode.commands.executeCommand("vscode.openWith", uri, VIEW_TYPE);
    })
  );
}

module.exports = { activate, deactivate() {} };
