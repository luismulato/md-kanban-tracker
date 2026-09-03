Feature: The "+ Add card" button only shows while the column is hovered
  As a user of the kanban board
  I want each column's "+ Add card" button hidden until I hover the column
  So that the board stays visually quiet, Notion-style, until I reach for it

  Background:
    Given a board rendered with a "To Do" column that has some tasks

  Scenario: The button is hidden when the column is not hovered
    When the pointer is not over the "To Do" column
    Then the "+ Add card" button of that column is not shown

  Scenario: Hovering the column reveals the button
    When the pointer enters the "To Do" column
    Then the "+ Add card" button of that column is shown
    And clicking it opens the note editor in create mode, pre-filled with "New note"

  Scenario: Leaving the column hides the button again
    Given the pointer is over the "To Do" column
    When the pointer leaves the "To Do" column
    Then the "+ Add card" button of that column is not shown

  Scenario: The task counter is unaffected by hover
    Then the task count next to the "To Do" title is shown whether or not
      the column is hovered
