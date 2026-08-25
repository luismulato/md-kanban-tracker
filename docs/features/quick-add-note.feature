Feature: Quick add a note by clicking an empty column area
  As a user of the kanban board
  I want to click on an empty area of a column
  So that I can create a new note without hunting for the "Add card" button

  Background:
    Given a kanban board with a column "To Do" that has some tasks
    And the board is rendered with no modal open

  Scenario: Clicking empty space in a column opens the note editor
    When I click on an empty area of the "To Do" column, below its tasks
    Then the note editor modal opens in create mode
    And the title field is pre-filled with "New note"
    And the modal exposes the same fields as editing an existing note
      (title, due date, description, priority, workload, subtasks)

  Scenario: Clicking an existing task does not open the quick-add editor
    When I click on an existing task card inside the "To Do" column
    Then the note editor modal opens in edit mode for that task
    And no new note is created

  Scenario: The "Add card" button opens the same editor with the same default
    When I click the "Add card" button at the bottom of the "To Do" column
    Then the note editor modal opens in create mode
    And the title field is pre-filled with "New note"

  Scenario: Creating a note keeps the default title if the user does not change it
    Given the note editor is open in create mode with the default title "New note"
    When I click "Create" without editing the title
    Then a new task titled "New note" is added to the "To Do" column
    And the modal closes

  Scenario: The user can overwrite the default title before creating
    Given the note editor is open in create mode with the default title "New note"
    When I type "Buy groceries" into the title field
    And I click "Create"
    Then a new task titled "Buy groceries" is added to the "To Do" column

  Scenario: Cancelling the quick-add editor creates nothing
    Given the note editor is open in create mode with the default title "New note"
    When I click "Cancel"
    Then the modal closes
    And no task is added to the "To Do" column
