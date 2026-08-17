const MarkdownIt = require("markdown-it");
const hljs = require("highlight.js/lib/common");

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

/**
 * YAML front matter is not markdown; left alone, markdown-it renders the
 * opening `---` as a horizontal rule and dumps the keys as a paragraph.
 */
function splitFrontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { front: null, body: src };
  return { front: m[1], body: src.slice(m[0].length) };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function frontMatterHtml(front) {
  const rows = front
    .split(/\r?\n/)
    .map((line) => /^\s*([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(line))
    .filter(Boolean)
    .map(([, k, v]) => `<div class="fm-k">${escapeHtml(k)}</div><div>${escapeHtml(v)}</div>`)
    .join("");
  if (!rows) return "";
  return `<div class="frontmatter">${rows}</div>`;
}

function createRenderer(resolveImage) {
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

  // Relative image paths must be rewritten or they render broken in a webview.
  const baseImage =
    md.renderer.rules.image ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const i = token.attrIndex("src");
    if (i >= 0) {
      const src = token.attrs[i][1];
      if (!/^(https?:|data:|vscode-)/i.test(src)) token.attrs[i][1] = resolveImage(src);
    }
    return baseImage(tokens, idx, options, env, self);
  };

  // Heading ids + a table of contents collected in document order.
  md.core.ruler.push("mdview_headings", (state) => {
    const used = new Map();
    const toc = (state.env.toc = []);
    const toks = state.tokens;
    for (let i = 0; i < toks.length; i++) {
      if (toks[i].type !== "heading_open") continue;
      const inline = toks[i + 1];
      if (!inline || inline.type !== "inline") continue;
      const id = slugify(inline.content, used);
      toks[i].attrSet("id", id);
      toc.push({ level: Number(toks[i].tag.slice(1)), text: inline.content, id });
    }
  });

  // `- [ ]` / `- [x]` become real (disabled) checkboxes rather than literal text.
  const baseInline =
    md.renderer.rules.text || ((tokens, idx) => escapeHtml(tokens[idx].content));
  md.renderer.rules.text = (tokens, idx, options, env, self) => {
    const t = tokens[idx];
    const m = /^\[([ xX])\]\s+/.exec(t.content);
    if (m && idx === 0) {
      const checked = m[1].toLowerCase() === "x";
      const rest = escapeHtml(t.content.slice(m[0].length));
      return `<input type="checkbox" disabled${checked ? " checked" : ""}> ${rest}`;
    }
    return baseInline(tokens, idx, options, env, self);
  };

  return md;
}

/** Render markdown to { html, toc }. */
function render(md, source) {
  const { front, body } = splitFrontMatter(source);
  const env = {};
  const html = md.render(body, env);
  return {
    html: (front ? frontMatterHtml(front) : "") + html,
    toc: env.toc || [],
  };
}

module.exports = { createRenderer, render, escapeHtml };
