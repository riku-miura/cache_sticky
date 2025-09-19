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
      throw new CacheUnavailableError();
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
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.name === 'QuotaExceededError') {
          throw new CacheQuotaExceededError();
        }
        throw new CacheOperationError('storeNote', error.message);
      }
      throw new CacheOperationError('storeNote', 'Unknown error');
    }
  }

  async getNote(noteId: string): Promise<StickyNote | null> {
    if (!this.isCacheAvailable()) {
      throw new CacheUnavailableError();
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
        throw new InvalidNoteDataError(validation.error || 'Corrupted note data');
      }

      return noteData as StickyNote;
    } catch (error) {
      if (error instanceof InvalidNoteDataError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CacheOperationError('getNote', error.message);
      }
      throw new CacheOperationError('getNote', 'Unknown error');
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
      console.error('Failed to load notes from cache:', error);
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