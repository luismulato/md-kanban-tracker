interface WebviewHtmlOptions {
  webviewUri: string;
  cspSource: string;
  nonce: string;
}

/**
 * Turns the built index.html into the html the panel serves: asset
 * references pointed at the extension's webview uri, CSP placeholders
 * filled in, and a nonce on every script tag.
 *
 * Asset references are relative (vite `base: './'`) so that urls *inside*
 * the stylesheet — the codicon font, above all — resolve next to the
 * stylesheet instead of at the webview origin root, where they 404 and
 * leave every icon blank.
 */
export function buildWebviewHtml(html: string, { webviewUri, cspSource, nonce }: WebviewHtmlOptions): string {
  return html
    .replace(/{{cspSource}}/g, cspSource)
    .replace(/{{nonce}}/g, nonce)
    .replace(/(src|href)="\.?\/assets\//g, `$1="${webviewUri}/assets/`)
    .replace(/<script/g, `<script nonce="${nonce}"`);
}
