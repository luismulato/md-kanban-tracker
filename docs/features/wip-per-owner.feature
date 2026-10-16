Feature: One WIP card per owner
  As a person working the board together with AI agents
  I want the WIP column to hold one card per owner
  So that each of us can work in parallel without being demoted

  Background:
    Given a board with "To Do" and "WIP" columns

  Scenario: Cards of different owners coexist in WIP
    Given a card "Mia" with owner "Luis" in WIP
    When a card "Suya" with owner "Claude" enters WIP
    Then both cards stay in WIP

  Scenario: A second card of the same owner is demoted
    Given a card "Vieja" with owner "Claude" in WIP
    When a card "Nueva" with owner "Claude" enters WIP
    Then "Nueva" stays in WIP
    And "Vieja" goes to the top of "To Do"

  Scenario: A card with no owner counts as the default owner
    Given a card "Sin owner" with no owner in WIP
    When a card "Con Luis" with owner "Luis" enters WIP
    Then only one of them stays in WIP

  Scenario: Each owner's conflict is resolved independently
    Given two cards of "Luis" and two cards of "Claude" in WIP
    When the board is reconciled
    Then each owner keeps exactly one card in WIP
