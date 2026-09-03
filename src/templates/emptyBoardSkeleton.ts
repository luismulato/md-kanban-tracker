// skeleton written into a blank .kanban.md the first time it is opened,
// so the user lands on a real board instead of an empty panel.

/** Title of the single placeholder card seeded in To Do. */
export const DEFAULT_CARD_TITLE = 'My first task';

/** Empty board: the five standard columns plus one default card in To Do. */
export const EMPTY_BOARD_SKELETON = `# New Kanban Board

## Backlog

## To Do

### ${DEFAULT_CARD_TITLE}

## WIP

## Done

## Done Done
`;

/** True when a .kanban.md has no meaningful content yet (empty / whitespace). */
export function isBlankBoardContent(content: string): boolean {
  return content.trim() === '';
}
