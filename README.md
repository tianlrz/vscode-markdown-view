# Markdown View

Opens `.md` files directly as a rendered, single-pane reading view — **the file tab *is*
the preview**. No second panel, no split, no `Cmd+K V`.

VS Code treats Markdown as plain text, so it opens in the text editor and any preview has
to live in a separate webview pane beside it. Notebooks feel different because `.ipynb`
uses the custom-editor API — a document type with its own renderer. This extension gives
Markdown the same treatment.

## What it does

- **Single pane.** Registers a custom editor for `*.md` and `*.markdown` at `default`
  priority, so opening a Markdown file lands straight in the rendered view.
- **Outline sidebar.** A sticky table of contents with scroll-spy highlighting the section
  you are in. VS Code's built-in Outline view follows the *active text editor*, so it is
  always empty for a custom editor — the outline has to live inside the view.
- **Follows your theme.** Every colour comes from VS Code CSS variables, so a dark editor
  gets a dark document. Nothing is hardcoded to a light background.
- **Live re-render** while you edit the source side by side, debounced, and it keeps your
  scroll position across updates.
- **Find in document** with `Cmd/Ctrl+F`, `Enter` / `Shift+Enter` to step through matches.
- **Copy button** on every code block.
- Syntax-highlighted code blocks, tables, task list checkboxes, YAML front matter rendered
  as a metadata block, relative-path images, and heading anchors that work with non-ASCII
  headings (duplicate headings get suffixed ids, so the outline never mis-navigates).
- Links behave: external ones open in the browser, relative `.md` links open in the
  editor, `#anchors` scroll in place.
- No telemetry, no network access at runtime, no paid tier. ~300 KB installed.

## What it deliberately does not do

**It is a reader, not a WYSIWYG editor.** Round-tripping a `contenteditable` DOM back into
Markdown is where that class of extension silently mangles files, and documents that serve
as a project's source of truth are a bad thing to gamble. Editing stays in the text
editor, one click away:

| Action | How |
| --- | --- |
| Rendered view → source | `</>` button in the editor title bar, or **Markdown View: Edit Source** |
| Source → rendered view | book button in the title bar, or **Markdown View: Open Rendered View** |
| Permanently prefer the text editor | right-click the file → **Open With…** → set **Text Editor** as default |

## Install

From a marketplace:

```
code --install-extension tianlrz.markdown-view
```

From source:

```bash
git clone https://github.com/tianlrz/vscode-markdown-view.git
cd vscode-markdown-view
npm install
npm run build
npx vsce package --no-dependencies
code --install-extension markdown-view-*.vsix
```

## Development

```bash
npm install
npm run build      # esbuild bundle -> out/extension.js
```

`src/extension.js` holds everything: the markdown-it setup, the webview CSS (a `STYLE`
template string), and the small client script that handles link clicks and scroll
restoration.

## License

MIT
