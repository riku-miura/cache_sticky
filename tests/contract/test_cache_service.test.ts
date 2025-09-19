import { CacheService } from '@/services/CacheService';
import { StickyNote } from '@/models/StickyNote';

describe('CacheService Contract', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  describe('storeNote', () => {
    it('should store a note in browser cache', async () => {
      const note: StickyNote = {
        id: 'test-id',
        text: 'Test note',
        createdAt: Date.now(),
        position: { x: 100, y: 200 },
        isEditing: false,
      };

      await expect(cacheService.storeNote(note)).resolves.toBeUndefined();
    });

    it('should throw CacheQuotaExceededError when quota exceeded', async () => {
      const note: StickyNote = {
        id: 'test-id',
        text: 'Test note',
        createdAt: Date.now(),
        position: { x: 100, y: 200 },
        isEditing: false,
      };

      // Mock quota exceeded
      const mockCache = await window.caches.open('cache-sticky');
      (mockCache.put as jest.Mock).mockRejectedValue(
        new Error('QuotaExceededError')
      );

      await expect(cacheService.storeNote(note)).rejects.toThrow(
        'Browser cache quota exceeded'
      );
    });
  });

  describe('getNote', () => {
    it('should retrieve a note by ID', async () => {
      const noteId = 'test-id';
      const result = await cacheService.getNote(noteId);
      expect(result).toBeNull(); // Should be null initially
    });

    it('should return null for non-existent note', async () => {
      const result = await cacheService.getNote('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getAllNotes', () => {
    it('should retrieve all notes from cache', async () => {
      const notes = await cacheService.getAllNotes();
      expect(Array.isArray(notes)).toBe(true);
      expect(notes).toHaveLength(0); // Initially empty
    });
  });

  describe('isCacheAvailable', () => {
    it('should return true when Cache API is available', () => {
      expect(cacheService.isCacheAvailable()).toBe(true);
    });

    it('should return false when Cache API is not available', () => {
      // Mock caches undefined
      const originalCaches = window.caches;
      delete (window as any).caches;

      const service = new CacheService();
      expect(service.isCacheAvailable()).toBe(false);

      window.caches = originalCaches;
    });
  });

  describe('clearAllNotes', () => {
    it('should clear all notes from cache', async () => {
      await expect(cacheService.clearAllNotes()).resolves.toBeUndefined();
    });
  });
});