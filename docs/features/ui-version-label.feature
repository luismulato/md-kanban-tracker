Feature: Plugin version visible in the UI
  As a person using the kanban board
  I want to see the plugin version in the top-right corner
  So that I know which version is installed without opening the extensions panel

  Background:
    Given the board is open

  Scenario: The version is shown in the top-right corner
    Then I see "v" followed by the version from package.json
    And it sits in the top-right corner of the board

  Scenario: The label is discreet
    Then the label uses a small font
    And a muted, low-contrast color

  Scenario: The label does not get in the way
    Then the label does not capture clicks
    And the board and its controls are not covered or shifted

  Scenario: The label follows the plugin version
    Given the plugin version is bumped in package.json
    When the webview is rebuilt
    Then the label shows the new version
