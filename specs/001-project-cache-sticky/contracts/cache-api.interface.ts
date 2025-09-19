// Cache API Interface Contract for Cache Sticky Application

export interface StickyNote {
  id: string;
  text: string;
  createdAt: number;
  position: { x: number; y: number };
  isEditing: boolean;
}

export interface CacheService {
  // Store a note in browser cache
  storeNote(note: StickyNote): Promise<void>;

  // Retrieve a specific note by ID
  getNote(noteId: string): Promise<StickyNote | null>;

  // Retrieve all notes from cache
  getAllNotes(): Promise<StickyNote[]>;

  // Check if Cache API is available
  isCacheAvailable(): boolean;

  // Clear all notes (for testing - browser controls actual clearing)
  clearAllNotes(): Promise<void>;
}

export interface WhiteboardService {
  // Create a new note in editing mode
  createNewNote(position?: { x: number; y: number }): StickyNote;

  // Save note content and exit editing mode
  saveNote(noteId: string, text: string): Promise<void>;

  // Cancel note editing (for new notes only)
  cancelNoteEdit(noteId: string): void;

  // Load all notes from cache on app start
  loadAllNotes(): Promise<StickyNote[]>;

  // Validate note text content
  validateNoteText(text: string): { isValid: boolean; error?: string };
}

export interface UIEventHandlers {
  // Handle new note button click
  onNewNoteClick(): void;

  // Handle note text input
  onNoteTextInput(noteId: string, text: string): void;

  // Handle note save (blur, enter key)
  onNoteSave(noteId: string): void;

  // Handle note edit cancel (escape key)
  onNoteCancel(noteId: string): void;
}

// Error types for cache operations
export class CacheQuotaExceededError extends Error {
  constructor() {
    super('Browser cache quota exceeded');
    this.name = 'CacheQuotaExceededError';
  }
}

export class CacheUnavailableError extends Error {
  constructor() {
    super('Cache API is not available in this browser');
    this.name = 'CacheUnavailableError';
  }
}

export class InvalidNoteDataError extends Error {
  constructor(message: string) {
    super(`Invalid note data: ${message}`);
    this.name = 'InvalidNoteDataError';
  }
}