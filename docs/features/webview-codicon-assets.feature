Feature: Codicon glyphs actually render inside the webview
  As a user of the kanban board
  I want the icon buttons on cards to show their glyph
  So that the hover and timer controls are visible, not blank squares

  Background:
    Given the webview bundle is built by vite and loaded from dist/webview
    And its stylesheet pulls the codicon font through @vscode/codicons

  Scenario: The font URL inside the stylesheet resolves next to the stylesheet
    Given the webview is served through a vscode-webview URI
    When the stylesheet requests the codicon font
    Then the request is relative to the stylesheet's own URL
    And not root-absolute ("/assets/codicon.ttf"), which resolves outside
      the extension and silently 404s, leaving every codicon blank

  Scenario: The panel rewrites relative asset references in the HTML
    Given a built index.html that references "./assets/index.js"
    When the panel builds the webview HTML
    Then the reference points at the extension's webview URI
    And the same holds for the stylesheet reference

  Scenario: Legacy root-absolute references keep working
    Given an index.html that references "/assets/index.js"
    When the panel builds the webview HTML
    Then that reference is rewritten to the extension's webview URI too

  Scenario: CSP placeholders and script nonce are filled in
    When the panel builds the webview HTML
    Then "{{cspSource}}" is replaced by the webview CSP source
    And every script tag carries the generated nonce
