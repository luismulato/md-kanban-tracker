Feature: Move a card up from the card itself, on hover
  As a user of the kanban board
  I want to move a card up within its column straight from the card
  So that I can reorder priorities without the context menu or dragging

  Background:
    Given a "To Do" column with the cards "First", "Second" and "Third" in that order

  Scenario: The move controls are hidden while the card is not hovered
    When the pointer is not over the "Second" card
    Then the "Move up" control of that card is not shown
    And the "Move to top" control of that card is not shown

  Scenario: Hovering a card reveals the move controls
    When the pointer enters the "Second" card
    Then the "Move up" control of that card is shown
    And the "Move to top" control of that card is shown

  Scenario: Leaving the card hides the controls again
    Given the pointer is over the "Second" card
    When the pointer leaves the "Second" card
    Then the "Move up" control of that card is not shown

  Scenario: Moving a card one position up
    Given the pointer is over the "Second" card
    When I click its "Move up" control
    Then the column order is "Second", "First", "Third"
    And the new order is persisted to the markdown board

  Scenario: Moving a card to the top of its column
    Given the pointer is over the "Third" card
    When I click its "Move to top" control
    Then the column order is "Third", "First", "Second"
    And the new order is persisted to the markdown board

  Scenario: The controls are disabled for the first card of the column
    Given the pointer is over the "First" card
    Then its "Move up" control is disabled
    And its "Move to top" control is disabled
    And clicking them leaves the column order unchanged

  Scenario: Clicking a move control does not open the card
    Given the pointer is over the "Second" card
    When I click its "Move up" control
    Then the task modal is not opened
