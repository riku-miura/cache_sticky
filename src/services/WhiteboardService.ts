import { v4 as uuidv4 } from 'uuid';
import { StickyNote, StickyNoteValidator } from '@/models/StickyNote';
import { CacheService } from '@/services/CacheService';

export class WhiteboardService {
  private cacheService: CacheService;
  private nextPosition = { x: 50, y: 50 };
  private readonly POSITION_OFFSET = 20;

  constructor() {
    this.cacheService = new CacheService();
  }

  createNewNote(position?: { x: number; y: number }): StickyNote {
    const notePosition = position || this.getNextPosition();

    const note: StickyNote = {
      id: uuidv4(),
      text: '',
      createdAt: Date.now(),
      position: notePosition,
      isEditing: true,
    };

    return note;
  }

  private getNextPosition(): { x: number; y: number } {
    const position = { ...this.nextPosition };

    // Update next position to avoid overlap
    this.nextPosition.x += this.POSITION_OFFSET;
    this.nextPosition.y += this.POSITION_OFFSET;

    // Reset position if it goes off screen (simple wrap-around)
    if (this.nextPosition.x > 800) {
      this.nextPosition.x = 50;
    }
    if (this.nextPosition.y > 600) {
      this.nextPosition.y = 50;
    }

    return position;
  }

  async saveNote(noteId: string, text: string): Promise<void> {
    const validation = this.validateNoteText(text);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // For this implementation, we need to construct the full note
    // In a real app, this would likely get the existing note first
    const sanitizedText = StickyNoteValidator.sanitizeText(text);

    const note: StickyNote = {
      id: noteId,
      text: sanitizedText,
      createdAt: Date.now(),
      position: this.getNextPosition(), // In real implementation, use existing position
      isEditing: false,
    };

    await this.cacheService.storeNote(note);
  }

  cancelNoteEdit(noteId: string): void {
    // For new notes, this would remove them from the DOM
    // For existing notes, this would revert changes
    // Implementation depends on UI integration
    console.log(`Cancelling edit for note: ${noteId}`);
  }

  async loadAllNotes(): Promise<StickyNote[]> {
    return await this.cacheService.getAllNotes();
  }

  validateNoteText(text: string): { isValid: boolean; error?: string } {
    return StickyNoteValidator.validateText(text);
  }

  // Helper method to update next position based on existing notes
  private updateNextPositionFromNotes(notes: StickyNote[]): void {
    if (notes.length === 0) {
      this.nextPosition = { x: 50, y: 50 };
      return;
    }

    // Find the rightmost and bottommost positions
    const maxX = Math.max(...notes.map(note => note.position.x));
    const maxY = Math.max(...notes.map(note => note.position.y));

    this.nextPosition = {
      x: maxX + this.POSITION_OFFSET,
      y: maxY + this.POSITION_OFFSET,
    };

    // Apply wrap-around logic
    if (this.nextPosition.x > 800) {
      this.nextPosition.x = 50;
      this.nextPosition.y = maxY + this.POSITION_OFFSET * 2;
    }
    if (this.nextPosition.y > 600) {
      this.nextPosition.y = 50;
    }
  }

  // Initialize the service with existing notes
  async initialize(): Promise<void> {
    const existingNotes = await this.loadAllNotes();
    this.updateNextPositionFromNotes(existingNotes);
  }
}