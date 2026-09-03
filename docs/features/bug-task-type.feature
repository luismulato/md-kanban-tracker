Feature: "bug" is a first-class task type
  As a user of the kanban board
  I want a "bug" task type alongside epic, story, task and spike
  So that defect cards read as bugs at a glance and round-trip through the markdown

  Background:
    Given the task types epic, story, task and spike already exist

  Scenario: The type cycle includes bug after spike
    When I click the type badge of a "spike" card
    Then its type becomes "bug"
    When I click the type badge of a "bug" card
    Then its type is cleared

  Scenario: A bug card renders a "Bug" badge
    Given a card with type "bug"
    Then the card shows a "Bug" badge with the error colour

  Scenario: The markdown parser accepts "- type: bug"
    Given a task with the property "- type: bug"
    Then the parsed task type is "bug"
    And regenerating the markdown keeps "- type: bug"
