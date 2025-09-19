import { StickyNote } from '@/models/StickyNote';
import { WhiteboardService } from '@/services/WhiteboardService';
import { CacheService } from '@/services/CacheService';
import { StickyNoteComponent } from '@/components/StickyNote';
import { NewNoteButton } from '@/components/NewNoteButton';

export class Whiteboard {
  private element: HTMLDivElement;
  private whiteboardService: WhiteboardService;
  private cacheService: CacheService;
  private newNoteButton: NewNoteButton;
  private noteComponents: Map<string, StickyNoteComponent> = new Map();
  private isCreatingNote = false;

  constructor() {
    this.whiteboardService = new WhiteboardService();
    this.cacheService = new CacheService();
    this.newNoteButton = new NewNoteButton(() => this.handleNewNoteClick());
    this.element = this.createElement();
  }

  private createElement(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'app';
    container.className = 'whiteboard-container';

    // Header with button and status
    const header = document.createElement('div');
    header.className = 'whiteboard-header';

    const title = document.createElement('h1');
    title.textContent = 'Cache Sticky - Browser Cache API Demo';
    title.className = 'app-title';

    const cacheStatus = document.createElement('div');
    cacheStatus.id = 'cache-status';
    cacheStatus.className = 'cache-status';
    this.updateCacheStatus(cacheStatus);

    header.appendChild(title);
    header.appendChild(this.newNoteButton.getElement());
    header.appendChild(cacheStatus);

    // Main whiteboard area
    const whiteboard = document.createElement('div');
    whiteboard.id = 'whiteboard';
    whiteboard.className = 'whiteboard';

    // Instructions
    const instructions = document.createElement('div');
    instructions.className = 'instructions';
    instructions.innerHTML = `
      <p><strong>Instructions:</strong></p>
      <ol>
        <li>Click "New Note" to create a sticky note</li>
        <li>Type your message (max 200 characters)</li>
        <li>Press Enter or click outside to save</li>
        <li>Refresh the page - notes persist via Cache API</li>
        <li>Clear browser cache (Dev Tools → Application → Storage) to see notes disappear</li>
      </ol>
    `;

    container.appendChild(header);
    container.appendChild(instructions);
    container.appendChild(whiteboard);

    return container;
  }

  private updateCacheStatus(statusElement: HTMLDivElement): void {
    if (this.cacheService.isCacheAvailable()) {
      statusElement.textContent = '✅ Cache API available - notes will persist';
      statusElement.className = 'cache-status available';
    } else {
      statusElement.textContent = '❌ Cache API unavailable - notes will not persist';
      statusElement.className = 'cache-status unavailable';
    }
  }

  private async handleNewNoteClick(): Promise<void> {
    if (this.isCreatingNote) {
      this.showMessage('Please finish editing the current note first', 'warning');
      return;
    }

    try {
      this.isCreatingNote = true;
      this.newNoteButton.setEnabled(false);

      // Make all existing notes non-editable
      this.setAllNotesNonEditable();

      // Create new note
      const newNote = this.whiteboardService.createNewNote();
      this.addNoteToDOM(newNote);

      this.showMessage('New note created - start typing!', 'info');
    } catch (error) {
      console.error('Failed to create new note:', error);
      this.showMessage('Failed to create new note', 'error');
      this.isCreatingNote = false;
      this.newNoteButton.setEnabled(true);
    }
  }

  private setAllNotesNonEditable(): void {
    this.noteComponents.forEach((component, noteId) => {
      const element = component.getElement();
      if (element.classList.contains('editing')) {
        // Force save or cancel current editing
        const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea && textarea.value.trim()) {
          this.handleNoteSave(noteId, textarea.value);
        } else {
          this.handleNoteCancel(noteId);
        }
      }
    });
  }

  private addNoteToDOM(note: StickyNote): void {
    const noteComponent = new StickyNoteComponent(
      note,
      (noteId, text) => this.handleNoteSave(noteId, text),
      (noteId) => this.handleNoteCancel(noteId)
    );

    this.noteComponents.set(note.id, noteComponent);

    const whiteboard = this.element.querySelector('#whiteboard') as HTMLDivElement;
    whiteboard.appendChild(noteComponent.getElement());
  }

  private async handleNoteSave(noteId: string, text: string): Promise<void> {
    try {
      await this.whiteboardService.saveNote(noteId, text);

      // Update the note component to non-editing state
      const savedNote: StickyNote = {
        id: noteId,
        text,
        createdAt: Date.now(),
        position: { x: 0, y: 0 }, // Position will be preserved by DOM
        isEditing: false,
      };

      const component = this.noteComponents.get(noteId);
      if (component) {
        component.updateNote(savedNote);
      }

      this.isCreatingNote = false;
      this.newNoteButton.setEnabled(true);
      this.showMessage('Note saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save note:', error);
      this.showMessage(`Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private handleNoteCancel(noteId: string): void {
    const component = this.noteComponents.get(noteId);
    if (component) {
      component.remove();
      this.noteComponents.delete(noteId);
    }

    this.isCreatingNote = false;
    this.newNoteButton.setEnabled(true);
    this.showMessage('Note creation cancelled', 'info');
  }

  private showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    // Remove existing messages
    const existingMessages = this.element.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;

    const header = this.element.querySelector('.whiteboard-header') as HTMLDivElement;
    header.appendChild(messageElement);

    // Auto-remove message after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  }

  async loadExistingNotes(): Promise<void> {
    try {
      await this.whiteboardService.initialize();
      const notes = await this.whiteboardService.loadAllNotes();

      notes.forEach(note => {
        this.addNoteToDOM(note);
      });

      if (notes.length > 0) {
        this.showMessage(`Loaded ${notes.length} note(s) from cache`, 'success');
      }
    } catch (error) {
      console.error('Failed to load existing notes:', error);
      this.showMessage('Failed to load existing notes', 'error');
    }
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  async initialize(): Promise<void> {
    await this.loadExistingNotes();
  }
}