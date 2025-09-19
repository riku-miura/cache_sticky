import { WhiteboardService } from '@/services/WhiteboardService';
import { StickyNote } from '@/models/StickyNote';

describe('WhiteboardService Contract', () => {
  let whiteboardService: WhiteboardService;

  beforeEach(() => {
    whiteboardService = new WhiteboardService();
  });

  describe('createNewNote', () => {
    it('should create a new note in editing mode', () => {
      const note = whiteboardService.createNewNote();

      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
      expect(note.text).toBe('');
      expect(note.isEditing).toBe(true);
      expect(note.position).toEqual({ x: expect.any(Number), y: expect.any(Number) });
      expect(note.createdAt).toBeCloseTo(Date.now(), -2);
    });

    it('should create note at specified position', () => {
      const position = { x: 300, y: 400 };
      const note = whiteboardService.createNewNote(position);

      expect(note.position).toEqual(position);
    });

    it('should generate unique IDs for different notes', () => {
      const note1 = whiteboardService.createNewNote();
      const note2 = whiteboardService.createNewNote();

      expect(note1.id).not.toBe(note2.id);
    });
  });

  describe('saveNote', () => {
    it('should save note content and exit editing mode', async () => {
      const noteId = 'test-id';
      const text = 'Saved note content';

      await expect(whiteboardService.saveNote(noteId, text)).resolves.toBeUndefined();
    });

    it('should reject empty text content', async () => {
      const noteId = 'test-id';
      const emptyText = '';

      await expect(whiteboardService.saveNote(noteId, emptyText)).rejects.toThrow();
    });

    it('should reject text exceeding 200 characters', async () => {
      const noteId = 'test-id';
      const longText = 'a'.repeat(201);

      await expect(whiteboardService.saveNote(noteId, longText)).rejects.toThrow();
    });
  });

  describe('cancelNoteEdit', () => {
    it('should cancel note editing for new notes only', () => {
      const noteId = 'test-id';

      expect(() => whiteboardService.cancelNoteEdit(noteId)).not.toThrow();
    });
  });

  describe('loadAllNotes', () => {
    it('should load all notes from cache on app start', async () => {
      const notes = await whiteboardService.loadAllNotes();

      expect(Array.isArray(notes)).toBe(true);
    });
  });

  describe('validateNoteText', () => {
    it('should validate valid text', () => {
      const result = whiteboardService.validateNoteText('Valid note text');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty text', () => {
      const result = whiteboardService.validateNoteText('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject text over 200 characters', () => {
      const longText = 'a'.repeat(201);
      const result = whiteboardService.validateNoteText(longText);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept exactly 200 characters', () => {
      const maxText = 'a'.repeat(200);
      const result = whiteboardService.validateNoteText(maxText);

      expect(result.isValid).toBe(true);
    });
  });
});