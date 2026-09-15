import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { buildWebviewHtml } from '../../webviewHtml';

const distCss = path.resolve(__dirname, '../../../dist/webview/assets/index.css');
const hasBuild = fs.existsSync(distCss);

const WEBVIEW_URI = 'https://file%2B.vscode-resource.vscode-cdn.net/ext/dist/webview';

describe('webview asset paths', () => {
  // a root-absolute url() inside the stylesheet resolves against the webview
  // origin, not the extension folder, so the codicon font 404s and every
  // glyph renders blank. A relative base keeps it next to the stylesheet.
  it.skipIf(!hasBuild)('keeps the codicon font url relative to the stylesheet', () => {
    const css = fs.readFileSync(distCss, 'utf8');

    expect(css).toMatch(/url\(\.?\/?codicon\.ttf/);
    expect(css).not.toMatch(/url\(\/assets\//);
  });

  it('rewrites relative asset references to the webview uri', () => {
    const html = '<script type="module" crossorigin src="./assets/index.js"></script>';

    const out = buildWebviewHtml(html, { webviewUri: WEBVIEW_URI, cspSource: 'csp:', nonce: 'abc' });

    expect(out).toContain(`src="${WEBVIEW_URI}/assets/index.js"`);
    expect(out).not.toContain('"./assets/');
  });

  it('rewrites relative stylesheet references too', () => {
    const html = '<link rel="stylesheet" crossorigin href="./assets/index.css">';

    const out = buildWebviewHtml(html, { webviewUri: WEBVIEW_URI, cspSource: 'csp:', nonce: 'abc' });

    expect(out).toContain(`href="${WEBVIEW_URI}/assets/index.css"`);
  });

  it('still rewrites root-absolute references', () => {
    const html = '<script src="/assets/index.js"></script><link href="/assets/index.css">';

    const out = buildWebviewHtml(html, { webviewUri: WEBVIEW_URI, cspSource: 'csp:', nonce: 'abc' });

    expect(out).toContain(`src="${WEBVIEW_URI}/assets/index.js"`);
    expect(out).toContain(`href="${WEBVIEW_URI}/assets/index.css"`);
  });

  it('fills in the csp source and the script nonce', () => {
    const html =
      '<meta http-equiv="Content-Security-Policy" content="font-src {{cspSource}}; script-src \'nonce-{{nonce}}\';">' +
      '<script src="./assets/index.js"></script>';

    const out = buildWebviewHtml(html, { webviewUri: WEBVIEW_URI, cspSource: 'csp:', nonce: 'abc' });

    expect(out).toContain('font-src csp:');
    expect(out).toContain("script-src 'nonce-abc'");
    expect(out).toContain('<script nonce="abc"');
    expect(out).not.toContain('{{');
  });
});
