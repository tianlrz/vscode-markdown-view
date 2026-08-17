const STYLE = `
:root { color-scheme: light dark; --toc-w: 16rem; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--vscode-font-family), -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 15px; line-height: 1.75;
  color: var(--vscode-editor-foreground);
  background: var(--vscode-editor-background);
}
.layout { display: flex; align-items: flex-start; }

/* ---- table of contents ---- */
#toc {
  position: sticky; top: 0; flex: 0 0 var(--toc-w); width: var(--toc-w);
  max-height: 100vh; overflow-y: auto;
  padding: 1.6rem .6rem 3rem 1.2rem;
  border-right: 1px solid var(--vscode-panel-border, rgba(128,128,128,.25));
  font-size: 12.5px; line-height: 1.5;
}
#toc.hidden { display: none; }
#toc .toc-title {
  font-size: 10.5px; text-transform: uppercase; letter-spacing: .1em; font-weight: 600;
  color: var(--vscode-descriptionForeground); margin: 0 0 .7em .4rem;
}
#toc a {
  display: block; padding: .2em .45rem; border-radius: 4px; text-decoration: none;
  color: var(--vscode-descriptionForeground);
  border-left: 2px solid transparent;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
#toc a:hover { color: var(--vscode-editor-foreground); background: var(--vscode-list-hoverBackground, rgba(128,128,128,.12)); }
#toc a.lv2 { padding-left: 1.1rem; }
#toc a.lv3 { padding-left: 1.9rem; font-size: 12px; }
#toc a.lv4, #toc a.lv5, #toc a.lv6 { padding-left: 2.6rem; font-size: 11.5px; }
#toc a.active {
  color: var(--vscode-textLink-foreground);
  border-left-color: var(--vscode-textLink-foreground);
  background: var(--vscode-list-activeSelectionBackground, rgba(128,128,128,.16));
}

/* ---- document ---- */
main { flex: 1 1 auto; min-width: 0; padding: 2rem 3rem 8rem; }
.doc { max-width: 54rem; }
h1,h2,h3,h4,h5,h6 { line-height: 1.3; margin: 2em 0 .7em; font-weight: 600; scroll-margin-top: 1rem; }
h1 { font-size: 1.9em; }
h2 { font-size: 1.5em; border-bottom: 1px solid var(--vscode-panel-border, rgba(128,128,128,.35)); padding-bottom: .3em; }
h3 { font-size: 1.25em; } h4 { font-size: 1.05em; }
h1:first-child, h2:first-child { margin-top: 0; }
p, ul, ol, blockquote, table, pre { margin: 0 0 1.1em; }
a { color: var(--vscode-textLink-foreground); text-decoration: none; }
a:hover { text-decoration: underline; }
ul, ol { padding-left: 1.6em; }
li { margin: .3em 0; }
li input[type=checkbox] { margin-right: .2em; vertical-align: -1px; }
blockquote {
  margin-left: 0; padding: .3em 1em;
  border-left: 4px solid var(--vscode-textBlockQuote-border, rgba(128,128,128,.5));
  background: var(--vscode-textBlockQuote-background, rgba(128,128,128,.08));
  color: var(--vscode-descriptionForeground);
}
code {
  font-family: var(--vscode-editor-font-family), monospace; font-size: .89em;
  background: var(--vscode-textCodeBlock-background, rgba(128,128,128,.16));
  padding: .15em .4em; border-radius: 3px;
}
pre {
  position: relative;
  background: var(--vscode-textCodeBlock-background, rgba(128,128,128,.12));
  border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.25));
  border-radius: 6px; padding: 1em; overflow-x: auto;
}
pre code { background: none; padding: 0; font-size: .88em; }
pre .copy {
  position: absolute; top: .45rem; right: .45rem; opacity: 0; transition: opacity .12s;
  font: inherit; font-size: 11px; cursor: pointer; padding: .2em .55em; border-radius: 4px;
  color: var(--vscode-button-secondaryForeground, var(--vscode-editor-foreground));
  background: var(--vscode-button-secondaryBackground, rgba(128,128,128,.25));
  border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.35));
}
pre:hover .copy { opacity: 1; }
pre .copy:hover { background: var(--vscode-button-secondaryHoverBackground, rgba(128,128,128,.4)); }
table { border-collapse: collapse; display: block; overflow-x: auto; }
th, td { border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.35)); padding: .5em .85em; }
th { background: var(--vscode-editorWidget-background, rgba(128,128,128,.12)); font-weight: 600; }
img { max-width: 100%; }
hr { border: none; border-top: 1px solid var(--vscode-panel-border, rgba(128,128,128,.35)); margin: 2em 0; }
.frontmatter {
  display: grid; grid-template-columns: auto 1fr; gap: .15em .9em;
  font-size: 12.5px; color: var(--vscode-descriptionForeground);
  background: var(--vscode-editorWidget-background, rgba(128,128,128,.08));
  border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.25));
  border-radius: 6px; padding: .8em 1em; margin-bottom: 1.6em;
}
.frontmatter .fm-k { font-weight: 600; color: var(--vscode-editor-foreground); }

/* ---- find bar ---- */
#find {
  position: fixed; top: .6rem; right: 1.2rem; z-index: 20; display: none;
  align-items: center; gap: .4rem; padding: .35rem .5rem; border-radius: 6px;
  background: var(--vscode-editorWidget-background, #252526);
  border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.4));
  box-shadow: 0 2px 10px rgba(0,0,0,.35);
}
#find.open { display: flex; }
#find input {
  font: inherit; font-size: 12.5px; width: 13rem; padding: .2em .45em; border-radius: 4px;
  color: var(--vscode-input-foreground); background: var(--vscode-input-background);
  border: 1px solid var(--vscode-input-border, transparent);
}
#find button {
  font: inherit; font-size: 12px; cursor: pointer; padding: .18em .5em; border-radius: 4px;
  color: var(--vscode-button-secondaryForeground, var(--vscode-editor-foreground));
  background: var(--vscode-button-secondaryBackground, rgba(128,128,128,.25));
  border: 1px solid var(--vscode-panel-border, rgba(128,128,128,.35));
}
#find .count { font-size: 11.5px; color: var(--vscode-descriptionForeground); min-width: 4.2rem; text-align: center; }
mark.find { background: var(--vscode-editor-findMatchHighlightBackground, #ffd33d55); color: inherit; }
mark.find.current { background: var(--vscode-editor-findMatchBackground, #f6b73caa); outline: 1px solid var(--vscode-focusBorder, #007fd4); }

/* ---- highlight.js -> VS Code token colors ---- */
.hljs-comment, .hljs-quote { color: var(--vscode-editorLineNumber-foreground); font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-doctag { color: var(--vscode-debugTokenExpression-name, #569cd6); }
.hljs-string, .hljs-regexp, .hljs-addition { color: var(--vscode-debugTokenExpression-string, #ce9178); }
.hljs-number, .hljs-variable, .hljs-template-variable { color: var(--vscode-debugTokenExpression-number, #b5cea8); }
.hljs-title, .hljs-section, .hljs-function .hljs-title { color: var(--vscode-symbolIcon-functionForeground, #dcdcaa); }
.hljs-type, .hljs-class .hljs-title, .hljs-built_in { color: var(--vscode-symbolIcon-classForeground, #4ec9b0); }
.hljs-attr, .hljs-attribute, .hljs-name { color: var(--vscode-symbolIcon-propertyForeground, #9cdcfe); }
.hljs-meta { color: var(--vscode-descriptionForeground); }
.hljs-emphasis { font-style: italic; } .hljs-strong { font-weight: 600; }

@media (max-width: 880px) { #toc { display: none; } main { padding: 1.5rem 1.4rem 6rem; } }
`;

const CLIENT = `
const vscodeApi = acquireVsCodeApi();
const doc = document.getElementById("doc");
const tocEl = document.getElementById("toc");
let headings = [];

/* ------------------------------------------------------------- rendering */

function buildToc(toc) {
  // Hide only when there is genuinely nothing to show. A threshold higher than
  // this makes the outline look broken on short documents.
  if (!toc.length) { tocEl.classList.add("hidden"); return; }
  tocEl.classList.remove("hidden");
  tocEl.innerHTML =
    '<div class="toc-title">Outline</div>' +
    toc.map((h) =>
      '<a class="lv' + h.level + '" href="#" data-id="' + h.id + '" title="' +
      h.text.replace(/"/g, "&quot;") + '">' +
      h.text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])) +
      "</a>"
    ).join("");
}

function decorateCodeBlocks() {
  for (const pre of doc.querySelectorAll("pre")) {
    if (pre.querySelector(".copy")) continue;
    const btn = document.createElement("button");
    btn.className = "copy";
    btn.textContent = "Copy";
    btn.addEventListener("click", () => {
      const code = pre.querySelector("code");
      vscodeApi.postMessage({ type: "copy", text: code ? code.innerText : pre.innerText });
      btn.textContent = "Copied";
      setTimeout(() => (btn.textContent = "Copy"), 1200);
    });
    pre.appendChild(btn);
  }
}

function collectHeadings() {
  headings = [...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => h.id);
}

function apply(msg) {
  const y = window.scrollY;
  doc.innerHTML = msg.html;
  buildToc(msg.toc);
  decorateCodeBlocks();
  collectHeadings();
  window.scrollTo(0, y);
  vscodeApi.setState({ scroll: y });
  syncActive();
}

window.addEventListener("message", (e) => {
  const msg = e.data;
  if (!msg) return;
  if (msg.type === "render") apply(msg);
  if (msg.type === "reveal") {
    const el = document.getElementById(msg.id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

/* ------------------------------------------------------------ scroll spy */

function syncActive() {
  if (!headings.length) return;
  const line = 90; // a heading counts as current once it reaches near the top
  let current = headings[0];
  for (const h of headings) {
    if (h.getBoundingClientRect().top <= line) current = h;
    else break;
  }
  for (const a of tocEl.querySelectorAll("a")) {
    a.classList.toggle("active", a.dataset.id === current.id);
  }
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { syncActive(); ticking = false; });
}, { passive: true });

/* ----------------------------------------------------------------- links */

tocEl.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  e.preventDefault();
  const el = document.getElementById(a.dataset.id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
});

doc.addEventListener("click", (e) => {
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

/* ------------------------------------------------------------------ find */

const findBar = document.getElementById("find");
const findInput = document.getElementById("find-input");
const findCount = document.getElementById("find-count");
let matches = [];
let cursor = 0;

function clearFind() {
  for (const m of doc.querySelectorAll("mark.find")) {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  }
  matches = [];
  cursor = 0;
}

function runFind(term) {
  clearFind();
  if (!term) { findCount.textContent = ""; return; }
  const lower = term.toLowerCase();
  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
  const targets = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.toLowerCase().includes(lower)) targets.push(node);
  }
  for (const t of targets) {
    const frag = document.createDocumentFragment();
    let rest = t.nodeValue;
    let i;
    while ((i = rest.toLowerCase().indexOf(lower)) !== -1) {
      if (i) frag.appendChild(document.createTextNode(rest.slice(0, i)));
      const mark = document.createElement("mark");
      mark.className = "find";
      mark.textContent = rest.slice(i, i + term.length);
      frag.appendChild(mark);
      rest = rest.slice(i + term.length);
    }
    if (rest) frag.appendChild(document.createTextNode(rest));
    t.parentNode.replaceChild(frag, t);
  }
  matches = [...doc.querySelectorAll("mark.find")];
  cursor = 0;
  focusMatch();
}

function focusMatch() {
  matches.forEach((m, i) => m.classList.toggle("current", i === cursor));
  findCount.textContent = matches.length ? cursor + 1 + " / " + matches.length : "no results";
  if (matches[cursor]) matches[cursor].scrollIntoView({ block: "center" });
}

function step(delta) {
  if (!matches.length) return;
  cursor = (cursor + delta + matches.length) % matches.length;
  focusMatch();
}

window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "f") {
    e.preventDefault();
    findBar.classList.add("open");
    findInput.select();
    findInput.focus();
    return;
  }
  if (e.key === "Escape" && findBar.classList.contains("open")) {
    findBar.classList.remove("open");
    clearFind();
    findCount.textContent = "";
  }
});

findInput.addEventListener("input", () => runFind(findInput.value));
findInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); step(e.shiftKey ? -1 : 1); }
});
document.getElementById("find-prev").addEventListener("click", () => step(-1));
document.getElementById("find-next").addEventListener("click", () => step(1));
document.getElementById("find-close").addEventListener("click", () => {
  findBar.classList.remove("open");
  clearFind();
  findCount.textContent = "";
});

const prev = vscodeApi.getState();
if (prev && prev.scroll) window.addEventListener("load", () => window.scrollTo(0, prev.scroll));
`;

function page(nonce, cspSource) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; img-src ${cspSource} https: data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>${STYLE}</style></head>
<body>
<div id="find">
  <input id="find-input" type="text" placeholder="Find in document" spellcheck="false">
  <span class="count" id="find-count"></span>
  <button id="find-prev" title="Previous (Shift+Enter)">↑</button>
  <button id="find-next" title="Next (Enter)">↓</button>
  <button id="find-close" title="Close (Esc)">✕</button>
</div>
<div class="layout">
  <nav id="toc" class="hidden"></nav>
  <main><div class="doc" id="doc"></div></main>
</div>
<script nonce="${nonce}">${CLIENT}</script>
</body></html>`;
}

module.exports = { page };
