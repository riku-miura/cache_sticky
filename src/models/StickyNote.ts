export interface StickyNote {
  id: string;
  text: string;
  createdAt: number;
  position: { x: number; y: number };
  isEditing: boolean;
}

export class StickyNoteValidator {
  static readonly MAX_TEXT_LENGTH = 200;

  static validateText(text: string): { isValid: boolean; error?: string } {
    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      return {
        isValid: false,
        error: 'Note text cannot be empty',
      };
    }

    if (trimmedText.length > this.MAX_TEXT_LENGTH) {
      return {
        isValid: false,
        error: `Note text cannot exceed ${this.MAX_TEXT_LENGTH} characters`,
      };
    }

    return { isValid: true };
  }

  static validateNote(note: StickyNote): { isValid: boolean; error?: string } {
    if (!note.id || typeof note.id !== 'string') {
      return {
        isValid: false,
        error: 'Note must have a valid ID',
      };
    }

    if (typeof note.createdAt !== 'number' || note.createdAt <= 0) {
      return {
        isValid: false,
        error: 'Note must have a valid creation timestamp',
      };
    }

    if (
      !note.position ||
      typeof note.position.x !== 'number' ||
      typeof note.position.y !== 'number' ||
      note.position.x < 0 ||
      note.position.y < 0
    ) {
      return {
        isValid: false,
        error: 'Note must have a valid position with non-negative coordinates',
      };
    }

    if (typeof note.isEditing !== 'boolean') {
      return {
        isValid: false,
        error: 'Note editing state must be a boolean',
      };
    }

    return this.validateText(note.text);
  }

  static sanitizeText(text: string): string {
    // Remove HTML tags and encode special characters
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .trim()
      .substring(0, this.MAX_TEXT_LENGTH);
  }
}