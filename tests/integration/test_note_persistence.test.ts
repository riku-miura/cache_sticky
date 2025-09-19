import { CacheService } from '@/services/CacheService';
import { WhiteboardService } from '@/services/WhiteboardService';

describe('Note Persistence Integration', () => {
  let cacheService: CacheService;
  let whiteboardService: WhiteboardService;

  beforeEach(async () => {
    cacheService = new CacheService();
    whiteboardService = new WhiteboardService();

    // Clear cache before each test
    await cacheService.clearAllNotes();

    document.body.innerHTML = `
      <div id="app">
        <button id="new-note-btn">New Note</button>
        <div id="whiteboard"></div>
      </div>
    `;
  });

  it('should save note to cache when editing is completed', async () => {
    const note = whiteboardService.createNewNote();
    const noteText = 'Test note content';

    // Save note
    await whiteboardService.saveNote(note.id, noteText);

    // Verify note is in cache
    const cachedNote = await cacheService.getNote(note.id);
    expect(cachedNote).not.toBeNull();
    expect(cachedNote?.text).toBe(noteText);
    expect(cachedNote?.isEditing).toBe(false);
  });

  it('should restore notes from cache on page load', async () => {
    // Create and save multiple notes
    const note1 = whiteboardService.createNewNote({ x: 100, y: 100 });
    const note2 = whiteboardService.createNewNote({ x: 200, y: 200 });

    await whiteboardService.saveNote(note1.id, 'First note');
    await whiteboardService.saveNote(note2.id, 'Second note');

    // Simulate page reload by loading all notes
    const restoredNotes = await whiteboardService.loadAllNotes();

    expect(restoredNotes).toHaveLength(2);
    expect(restoredNotes.find(n => n.text === 'First note')).toBeDefined();
    expect(restoredNotes.find(n => n.text === 'Second note')).toBeDefined();

    // All restored notes should not be in editing mode
    restoredNotes.forEach(note => {
      expect(note.isEditing).toBe(false);
    });
  });

  it('should maintain note positions after page reload', async () => {
    const originalPosition = { x: 150, y: 250 };
    const note = whiteboardService.createNewNote(originalPosition);

    await whiteboardService.saveNote(note.id, 'Positioned note');

    // Reload notes
    const restoredNotes = await whiteboardService.loadAllNotes();
    const restoredNote = restoredNotes[0];

    expect(restoredNote.position).toEqual(originalPosition);
  });

  it('should preserve creation timestamps', async () => {
    const beforeTime = Date.now();
    const note = whiteboardService.createNewNote();
    const afterTime = Date.now();

    await whiteboardService.saveNote(note.id, 'Timestamped note');

    const cachedNote = await cacheService.getNote(note.id);
    expect(cachedNote?.createdAt).toBeGreaterThanOrEqual(beforeTime);
    expect(cachedNote?.createdAt).toBeLessThanOrEqual(afterTime);
  });

  it('should handle cache storage errors gracefully', async () => {
    // Mock cache put to throw quota exceeded error
    const mockCache = await window.caches.open('cache-sticky');
    (mockCache.put as jest.Mock).mockRejectedValue(
      new Error('QuotaExceededError')
    );

    const note = whiteboardService.createNewNote();

    await expect(
      whiteboardService.saveNote(note.id, 'This should fail')
    ).rejects.toThrow('Browser cache quota exceeded');
  });

  it('should not save notes with invalid content', async () => {
    const note = whiteboardService.createNewNote();

    // Try to save empty note
    await expect(
      whiteboardService.saveNote(note.id, '')
    ).rejects.toThrow();

    // Try to save note with too much content
    const longText = 'a'.repeat(201);
    await expect(
      whiteboardService.saveNote(note.id, longText)
    ).rejects.toThrow();

    // Verify nothing was saved to cache
    const cachedNote = await cacheService.getNote(note.id);
    expect(cachedNote).toBeNull();
  });

  it('should handle concurrent note saves', async () => {
    const notes = [
      whiteboardService.createNewNote(),
      whiteboardService.createNewNote(),
      whiteboardService.createNewNote()
    ];

    // Save all notes concurrently
    await Promise.all([
      whiteboardService.saveNote(notes[0].id, 'Note 1'),
      whiteboardService.saveNote(notes[1].id, 'Note 2'),
      whiteboardService.saveNote(notes[2].id, 'Note 3')
    ]);

    // Verify all notes were saved
    const allNotes = await cacheService.getAllNotes();
    expect(allNotes).toHaveLength(3);
  });
});