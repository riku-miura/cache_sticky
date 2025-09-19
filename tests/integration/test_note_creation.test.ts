import { CacheService } from '@/services/CacheService';
import { WhiteboardService } from '@/services/WhiteboardService';

describe('Note Creation Integration', () => {
  let cacheService: CacheService;
  let whiteboardService: WhiteboardService;

  beforeEach(() => {
    cacheService = new CacheService();
    whiteboardService = new WhiteboardService();
    document.body.innerHTML = `
      <div id="app">
        <button id="new-note-btn">New Note</button>
        <div id="whiteboard"></div>
      </div>
    `;
  });

  it('should create new note when button is clicked', async () => {
    const newNoteBtn = document.getElementById('new-note-btn') as HTMLButtonElement;
    const whiteboard = document.getElementById('whiteboard') as HTMLDivElement;

    // Simulate button click
    newNoteBtn.click();

    // Should create a new note element
    const noteElements = whiteboard.querySelectorAll('.sticky-note');
    expect(noteElements.length).toBe(1);

    const noteElement = noteElements[0] as HTMLElement;
    expect(noteElement.classList.contains('editing')).toBe(true);
  });

  it('should make existing notes non-editable when creating new note', async () => {
    const newNoteBtn = document.getElementById('new-note-btn') as HTMLButtonElement;
    const whiteboard = document.getElementById('whiteboard') as HTMLDivElement;

    // Create first note
    newNoteBtn.click();
    const firstNote = whiteboard.querySelector('.sticky-note') as HTMLElement;

    // Save first note
    const textarea = firstNote.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'First note';
    textarea.dispatchEvent(new Event('blur'));

    // Verify first note is no longer editing
    expect(firstNote.classList.contains('editing')).toBe(false);

    // Create second note
    newNoteBtn.click();

    // Verify first note remains non-editable
    expect(firstNote.classList.contains('editing')).toBe(false);

    // Verify second note is editing
    const secondNote = whiteboard.querySelectorAll('.sticky-note')[1] as HTMLElement;
    expect(secondNote.classList.contains('editing')).toBe(true);
  });

  it('should position new notes to avoid overlap', async () => {
    const newNoteBtn = document.getElementById('new-note-btn') as HTMLButtonElement;
    const whiteboard = document.getElementById('whiteboard') as HTMLDivElement;

    // Create multiple notes
    newNoteBtn.click();
    newNoteBtn.click();
    newNoteBtn.click();

    const noteElements = whiteboard.querySelectorAll('.sticky-note');
    expect(noteElements.length).toBe(3);

    // Check that notes have different positions
    const positions = Array.from(noteElements).map(note => {
      const style = (note as HTMLElement).style;
      return {
        left: parseInt(style.left || '0'),
        top: parseInt(style.top || '0')
      };
    });

    // All positions should be different
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`));
    expect(uniquePositions.size).toBe(3);
  });

  it('should focus textarea when new note is created', async () => {
    const newNoteBtn = document.getElementById('new-note-btn') as HTMLButtonElement;
    const whiteboard = document.getElementById('whiteboard') as HTMLDivElement;

    newNoteBtn.click();

    const textarea = whiteboard.querySelector('textarea') as HTMLTextAreaElement;
    expect(document.activeElement).toBe(textarea);
  });

  it('should enforce 200 character limit during input', async () => {
    const newNoteBtn = document.getElementById('new-note-btn') as HTMLButtonElement;
    const whiteboard = document.getElementById('whiteboard') as HTMLDivElement;

    newNoteBtn.click();

    const textarea = whiteboard.querySelector('textarea') as HTMLTextAreaElement;
    const longText = 'a'.repeat(250);

    // Simulate user input
    textarea.value = longText;
    textarea.dispatchEvent(new Event('input'));

    // Should be truncated to 200 characters
    expect(textarea.value.length).toBeLessThanOrEqual(200);
  });
});