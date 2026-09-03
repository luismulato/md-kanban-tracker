Feature: Seed a skeleton board the first time an empty .kanban.md is opened
  As a user who just created an empty .kanban.md file
  I want the plugin to fill it with a starter board on first open
  So that I land on a usable board instead of an empty panel

  Background:
    Given a file named "project.kanban.md" that is empty

  Scenario: Opening an empty board writes the standard skeleton
    When the plugin loads the file
    Then the file gets the five standard columns "Backlog", "To Do", "WIP", "Done", "Done Done"
    And the "To Do" column has a single default card
    And the seeded content round-trips through the parser unchanged

  Scenario: A whitespace-only file counts as empty
    Given the file contains only blank lines and spaces
    When the plugin loads the file
    Then the same skeleton is written

  Scenario: A file that already has content is left untouched
    Given the file contains "# My board\n\n## To Do\n"
    When the plugin loads the file
    Then the plugin does not seed a skeleton
    And the existing content is parsed as-is
