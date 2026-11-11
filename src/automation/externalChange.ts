/**
 * Decides what the panel does when the .kanban.md changes on disk (an agent,
 * git, another editor). Pure on purpose: no `vscode` import, so it is unit
 * testable. The panel and the file watcher in extension.ts call it.
 *
 * - 'ignore': our own save echoing back, or the content is already loaded.
 * - 'defer':  a card modal is open; reloading now would clobber the edit in
 *             progress, so the panel remembers the change and applies it when
 *             the modal closes.
 * - 'reload': reparse the file and repaint the board.
 */
export type ExternalChangeAction = 'ignore' | 'defer' | 'reload';

export interface ExternalChangeInput {
  /** The panel is writing the file itself (webview-initiated save). */
  isSaving: boolean;
  isModalOpen: boolean;
  /** Text the panel last loaded or last wrote; undefined before the first load. */
  lastKnownText: string | undefined;
  /** Current content of the file on disk. */
  diskText: string;
}

export function decideExternalChange(input: ExternalChangeInput): ExternalChangeAction {
  if (input.isSaving) {return 'ignore';}
  if (input.lastKnownText !== undefined && input.diskText === input.lastKnownText) {
    return 'ignore';
  }
  if (input.isModalOpen) {return 'defer';}
  return 'reload';
}
