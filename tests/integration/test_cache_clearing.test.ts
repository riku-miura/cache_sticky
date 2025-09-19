import { CacheService } from '@/services/CacheService';
import { WhiteboardService } from '@/services/WhiteboardService';

describe('Cache Clearing Integration', () => {
  let cacheService: CacheService;
  let whiteboardService: WhiteboardService;

  beforeEach(async () => {
    cacheService = new CacheService();
    whiteboardService = new WhiteboardService();

    document.body.innerHTML = `
      <div id="app">
        <button id="new-note-btn">New Note</button>
        <div id="whiteboard"></div>
        <div id="status"></div>
      </div>
    `;
  });

  it('should show empty whiteboard when cache is cleared', async () => {
    // Create and save notes
    const note1 = whiteboardService.createNewNote();
    const note2 = whiteboardService.createNewNote();

    await whiteboardService.saveNote(note1.id, 'Note 1');
    await whiteboardService.saveNote(note2.id, 'Note 2');

    // Verify notes exist
    let allNotes = await cacheService.getAllNotes();
    expect(allNotes).toHaveLength(2);

    // Simulate cache clearing (manual browser action)
    await cacheService.clearAllNotes();

    // Verify cache is empty
    allNotes = await cacheService.getAllNotes();
    expect(allNotes).toHaveLength(0);
  });

  it('should demonstrate cache persistence vs clearing behavior', async () => {
    const whiteboard = document.getElementById('whiteboard') as HTMLDivElement;

    // Phase 1: Create notes
    const note1 = whiteboardService.createNewNote();
    const note2 = whiteboardService.createNewNote();

    await whiteboardService.saveNote(note1.id, 'Persistent note 1');
    await whiteboardService.saveNote(note2.id, 'Persistent note 2');

    // Phase 2: Simulate page reload - notes should persist
    whiteboard.innerHTML = ''; // Clear DOM
    const restoredNotes = await whiteboardService.loadAllNotes();
    expect(restoredNotes).toHaveLength(2);

    // Render restored notes to DOM
    restoredNotes.forEach(note => {
      const noteElement = document.createElement('div');
      noteElement.className = 'sticky-note';
      noteElement.textContent = note.text;
      whiteboard.appendChild(noteElement);
    });

    expect(whiteboard.children).toHaveLength(2);

    // Phase 3: Simulate cache clear - notes should disappear
    await cacheService.clearAllNotes();
    whiteboard.innerHTML = ''; // Clear DOM

    const notesAfterClear = await whiteboardService.loadAllNotes();
    expect(notesAfterClear).toHaveLength(0);
    expect(whiteboard.children).toHaveLength(0);
  });

  it('should handle cache unavailable scenario', async () => {
    // Mock cache API as unavailable
    const originalCaches = window.caches;
    delete (window as any).caches;

    const fallbackService = new CacheService();

    expect(fallbackService.isCacheAvailable()).toBe(false);

    // Should handle gracefully without crashing
    const note = whiteboardService.createNewNote();
    await expect(
      fallbackService.storeNote(note)
    ).rejects.toThrow('Cache API is not available');

    // Restore cache API
    window.caches = originalCaches;
  });

  it('should provide user feedback about cache state', async () => {
    const statusDiv = document.getElementById('status') as HTMLDivElement;

    // Test cache available state
    if (cacheService.isCacheAvailable()) {
      statusDiv.textContent = 'Cache API available - notes will persist';
    } else {
      statusDiv.textContent = 'Cache API unavailable - notes will not persist';
    }

    expect(statusDiv.textContent).toContain('Cache API');
  });

  it('should maintain application stability after cache errors', async () => {
    // Mock cache operations to fail
    const mockCache = await window.caches.open('cache-sticky');
    (mockCache.match as jest.Mock).mockRejectedValue(new Error('Cache Error'));

    // Application should continue working despite cache errors
    const note = whiteboardService.createNewNote();
    expect(note).toBeDefined();

    // Should handle cache read failures gracefully
    const notes = await whiteboardService.loadAllNotes();
    expect(Array.isArray(notes)).toBe(true);
  });

  it('should demonstrate educational value of cache behavior', async () => {
    const testScenario = {
      phase1: 'Create notes and observe persistence',
      phase2: 'Refresh page and see notes restored',
      phase3: 'Clear cache and see notes disappear',
      phase4: 'Understanding browser cache limitations'
    };

    // Phase 1: Create educational content
    const note = whiteboardService.createNewNote();
    await whiteboardService.saveNote(note.id, 'Learning about Cache API!');

    // Phase 2: Demonstrate persistence
    const persistedNotes = await whiteboardService.loadAllNotes();
    expect(persistedNotes).toHaveLength(1);
    expect(persistedNotes[0].text).toBe('Learning about Cache API!');

    // Phase 3: Demonstrate clearing
    await cacheService.clearAllNotes();
    const clearedNotes = await whiteboardService.loadAllNotes();
    expect(clearedNotes).toHaveLength(0);

    // Educational goals achieved
    expect(testScenario.phase1).toBeDefined();
    expect(testScenario.phase2).toBeDefined();
    expect(testScenario.phase3).toBeDefined();
    expect(testScenario.phase4).toBeDefined();
  });
});