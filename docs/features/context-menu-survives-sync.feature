Feature: The card context menu survives a background board sync
  As a user right-clicking a card in the kanban view
  I want the "Move to top" / "Delete card" menu to stay open
  Even when the extension re-sends the board (file touched, focus change, timer)

  Background:
    Given a board loaded from a .kanban.md file
    And the same file is re-parsed and pushed to the webview periodically

  Scenario: Re-parsing identical markdown yields identical ids
    When the parser parses the same markdown text twice
    Then every column id and task id is identical between the two parses
    And the board fingerprint is unchanged

  Scenario: An unrelated sync does not replace the board
    Given the board is loaded
    When the extension pushes a freshly re-parsed board with no content change
    Then the store keeps the existing board instance (fingerprint match, early return)

  Scenario: An open context menu is not torn down by a background sync
    Given the user has right-clicked a card and the context menu is open
    When the extension pushes a freshly re-parsed board with no content change
    Then the context menu is still open

  Scenario: Distinct cards still get distinct ids
    When two cards share a title inside the same column
    Then they still get different ids
    And editing one card's title does not change the other cards' ids
