import { describe, it, expect } from 'vitest';
import { decideExternalChange } from '../../automation/externalChange';

const base = {
  isSaving: false,
  isModalOpen: false,
  lastKnownText: '## To Do\n',
  diskText: '## To Do\n\n### New card\n',
};

describe('decideExternalChange', () => {
  it('reloads when the file changed on disk and nothing is in the way', () => {
    expect(decideExternalChange(base)).toBe('reload');
  });

  it('ignores the echo of our own save', () => {
    expect(decideExternalChange({ ...base, isSaving: true })).toBe('ignore');
  });

  it('ignores a change event whose content equals what the panel already has', () => {
    expect(decideExternalChange({ ...base, diskText: base.lastKnownText })).toBe('ignore');
  });

  it('defers while a card modal is open, so the edit in progress is not clobbered', () => {
    expect(decideExternalChange({ ...base, isModalOpen: true })).toBe('defer');
  });

  it('still ignores identical content even if the modal is open', () => {
    expect(
      decideExternalChange({ ...base, isModalOpen: true, diskText: base.lastKnownText })
    ).toBe('ignore');
  });

  it('reloads when the panel has no known text yet', () => {
    expect(decideExternalChange({ ...base, lastKnownText: undefined })).toBe('reload');
  });
});
