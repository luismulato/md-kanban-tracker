Feature: Reorder the steps (DoD) of a card with drag and drop
  As a person working the board
  I want to drag the steps of a card into a new order
  So that the checklist reflects the real order of work without retyping steps

  Background:
    Given the edit modal of a card with the steps "A", "B" and "C"

  Scenario: Dragging a step to another position reorders the list
    When I drag the step "A" below the step "C"
    Then the card is updated with the steps in the order "B", "C", "A"

  Scenario: The completed state and the text travel with the step
    Given the step "A" is completed
    When I drag the step "A" below the step "C"
    Then the step "A" is still completed in the new order

  Scenario: Dropping a step on itself changes nothing
    When I drop the step "B" on its own position
    Then the card is not updated

  Scenario: Dropping outside the list changes nothing
    When I drop the step "B" outside the list
    Then the card is not updated

  Scenario: The new order survives the markdown round trip
    Given the card was reordered to "B", "C", "A"
    When the board is serialized to markdown and parsed again
    Then the steps are read in the order "B", "C", "A"
    And each step keeps its completed state
