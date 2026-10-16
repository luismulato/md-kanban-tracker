Feature: Delete a card from the card itself, on hover
  As a user of the kanban board
  I want to delete a card straight from the main screen
  So that I don't need the context menu or to edit the markdown

  Background:
    Given a "To Do" column with the cards "First", "Second" and "Third" in that order

  Scenario: The delete control is hidden while the card is not hovered
    When the pointer is not over the "Second" card
    Then the "Delete card" control of that card is not shown

  Scenario: Hovering a card reveals the delete control
    When the pointer enters the "Second" card
    Then the "Delete card" control of that card is shown

  Scenario: Deleting a card after confirming
    Given the pointer is over the "Second" card
    When I click "Delete card" and confirm
    Then the column holds "First" and "Third"

  Scenario: Cancelling the confirmation keeps the card
    Given the pointer is over the "Second" card
    When I click "Delete card" and cancel
    Then the column still holds "First", "Second" and "Third"

  Scenario: Deleting with several cards selected
    Given the cards "First" and "Second" are selected
    And the pointer is over the "Second" card
    When I click "Delete card" and confirm
    Then the column holds only "Third"

  Scenario: Clicking the control does not open the card
    Given the pointer is over the "Second" card
    When I click "Delete card" and confirm
    Then the edit modal is not open
