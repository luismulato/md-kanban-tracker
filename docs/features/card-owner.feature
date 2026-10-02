Feature: Card owner (author) visible, editable and logged
  As a person or an AI agent working the board
  I want each card to show and carry its owner
  So that I know who did what, and the time log says whose time it was

  Background:
    Given a board with a "To Do" column

  Scenario: A card with an owner shows it as a chip
    Given a card "Fix login" with owner "Claude"
    Then the card shows the owner chip "Claude"

  Scenario: A card without an owner shows no chip
    Given a card "Fix login" with no owner
    Then the card shows no owner chip

  Scenario: Editing the owner in the card modal
    Given the edit modal of the card "Fix login"
    When I type "Claude" in the "Owner" field and leave it
    Then the card is updated with owner "Claude"

  Scenario: Clearing the owner removes the property
    Given the edit modal of a card whose owner is "Claude"
    When I empty the "Owner" field and leave it
    Then the card has no owner
    And the markdown no longer has the "- owner:" line

  Scenario: Setting the owner when creating a card
    Given the create modal
    When I type "Claude" in the "Owner" field and create the card
    Then the new card has owner "Claude"

  Scenario: The timelog records the owner
    Given the card "Fix login" with owner "Claude" was in WIP with a running timer
    When the timer stops
    Then the new timelog line ends with "@Claude"

  Scenario: The timelog falls back to the default owner
    Given the card "Fix login" has no owner and a running timer
    When the timer stops
    Then the new timelog line ends with "@Luis"
