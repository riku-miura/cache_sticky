import { StickyNote, StickyNoteValidator } from '@/models/StickyNote';
import {
  CacheQuotaExceededError,
  CacheUnavailableError,
  InvalidNoteDataError,
  CacheOperationError,
} from '@/models/CacheErrors';

export class CacheService {
  private readonly CACHE_NAME = 'cache-sticky';
  private readonly URL_PREFIX = 'https://cache-sticky.local/notes/';

  isCacheAvailable(): boolean {
    return typeof window !== 'undefined' && 'caches' in window;
  }

  private getRequestUrl(noteId: string): string {
    return `${this.URL_PREFIX}${noteId}`;
  }

  private createRequest(noteId: string): Request {
    return new Request(this.getRequestUrl(noteId));
  }

  private createResponse(note: StickyNote): Response {
    return new Response(JSON.stringify(note), {
      headers: {
        'Content-Type': 'application/json',
        'X-Created-At': note.createdAt.toString(),
      },
    });
  }

  async storeNote(note: StickyNote): Promise<void> {
    if (!this.isCacheAvailable()) {
      console.warn('Cache API not available, note will not persist');
      return; // Graceful fallback - just continue without storing
    }

    const validation = StickyNoteValidator.validateNote(note);
    if (!validation.isValid) {
      throw new InvalidNoteDataError(validation.error || 'Unknown validation error');
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const request = this.createRequest(note.id);
      const response = this.createResponse(note);

      await cache.put(request, response);
      console.log(`Note ${note.id} stored successfully`);
    } catch (error) {
      console.warn(`Failed to store note ${note.id}:`, error);

      if (error instanceof Error) {
        if (error.message.includes('quota') || error.name === 'QuotaExceededError') {
          throw new CacheQuotaExceededError();
        }
        // Cache操作エラーの場合は警告を出すが例外は投げない
        console.warn('Note storage failed but continuing without persistence');
        return;
      }
    }
  }

  async getNote(noteId: string): Promise<StickyNote | null> {
    if (!this.isCacheAvailable()) {
      console.warn('Cache API not available, returning null');
      return null;
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const request = this.createRequest(noteId);
      const response = await cache.match(request);

      if (!response) {
        return null;
      }

      const noteData = await response.json();
      const validation = StickyNoteValidator.validateNote(noteData);

      if (!validation.isValid) {
        console.warn(`Invalid note data for ${noteId}: ${validation.error}`);
        return null;
      }

      return noteData as StickyNote;
    } catch (error) {
      console.warn(`Failed to get note ${noteId}:`, error);
      // Cache操作エラーの場合はnullを返す（graceful fallback）
      return null;
    }
  }

  async getAllNotes(): Promise<StickyNote[]> {
    if (!this.isCacheAvailable()) {
      return []; // Graceful fallback for unavailable cache
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const keys = await cache.keys();

      const notePromises = keys
        .filter((request) => request.url.startsWith(this.URL_PREFIX))
        .map(async (request) => {
          try {
            const response = await cache.match(request);
            if (!response) return null;

            const noteData = await response.json();
            const validation = StickyNoteValidator.validateNote(noteData);

            if (!validation.isValid) {
              console.warn(`Skipping corrupted note: ${validation.error}`);
              return null;
            }

            return noteData as StickyNote;
          } catch (error) {
            console.warn(`Failed to load note from ${request.url}:`, error);
            return null;
          }
        });

      const notes = await Promise.all(notePromises);
      return notes.filter((note): note is StickyNote => note !== null);
    } catch (error) {
      console.warn('Cache API is not available or encountered an error, using memory-only mode:', error);
      return []; // Graceful fallback
    }
  }

  async clearAllNotes(): Promise<void> {
    if (!this.isCacheAvailable()) {
      throw new CacheUnavailableError();
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const keys = await cache.keys();

      const deletePromises = keys
        .filter((request) => request.url.startsWith(this.URL_PREFIX))
        .map((request) => cache.delete(request));

      await Promise.all(deletePromises);
    } catch (error) {
      if (error instanceof Error) {
        throw new CacheOperationError('clearAllNotes', error.message);
      }
      throw new CacheOperationError('clearAllNotes', 'Unknown error');
    }
  }
}