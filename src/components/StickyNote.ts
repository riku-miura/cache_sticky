import { StickyNote } from '@/models/StickyNote';

export class StickyNoteComponent {
  private element: HTMLDivElement;
  private note: StickyNote;
  private onSave?: (noteId: string, text: string) => void;
  private onCancel?: (noteId: string) => void;

  constructor(
    note: StickyNote,
    onSave?: (noteId: string, text: string) => void,
    onCancel?: (noteId: string) => void
  ) {
    this.note = note;
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.element = this.createElement();
  }

  private createElement(): HTMLDivElement {
    const noteElement = document.createElement('div');
    noteElement.className = `sticky-note ${this.note.isEditing ? 'editing' : ''}`;
    noteElement.id = `note-${this.note.id}`;
    noteElement.style.left = `${this.note.position.x}px`;
    noteElement.style.top = `${this.note.position.y}px`;

    if (this.note.isEditing) {
      this.createEditingView(noteElement);
    } else {
      this.createStaticView(noteElement);
    }

    return noteElement;
  }

  private createEditingView(noteElement: HTMLDivElement): void {
    const textarea = document.createElement('textarea');
    textarea.className = 'note-textarea';
    textarea.value = this.note.text;
    textarea.maxLength = 200;
    textarea.placeholder = 'メッセージを入力してください（最大200文字）';

    const charCount = document.createElement('div');
    charCount.className = 'char-count';
    this.updateCharCount(charCount, textarea.value.length);

    // Event listeners
    textarea.addEventListener('input', (e) => {
      const target = e.target as HTMLTextAreaElement;
      this.updateCharCount(charCount, target.value.length);

      // Enforce character limit
      if (target.value.length > 200) {
        target.value = target.value.substring(0, 200);
        this.updateCharCount(charCount, 200);
      }
    });

    textarea.addEventListener('blur', () => {
      this.handleSave(textarea.value);
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSave(textarea.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.handleCancel();
      }
    });

    noteElement.appendChild(textarea);
    noteElement.appendChild(charCount);

    // Auto-focus the textarea
    setTimeout(() => textarea.focus(), 0);
  }

  private createStaticView(noteElement: HTMLDivElement): void {
    const textElement = document.createElement('div');
    textElement.className = 'note-text';
    textElement.textContent = this.note.text;

    const timestamp = document.createElement('div');
    timestamp.className = 'note-timestamp';
    timestamp.textContent = new Date(this.note.createdAt).toLocaleString();

    noteElement.appendChild(textElement);
    noteElement.appendChild(timestamp);
  }

  private updateCharCount(charCountElement: HTMLDivElement, count: number): void {
    const remaining = 200 - count;
    charCountElement.textContent = `残り${remaining}文字`;
    charCountElement.className = `char-count ${remaining < 20 ? 'warning' : ''}`;
  }

  private handleSave(text: string): void {
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      this.showError('メッセージが空です');
      return;
    }

    if (this.onSave) {
      this.onSave(this.note.id, trimmedText);
    }
  }

  private handleCancel(): void {
    if (this.onCancel) {
      this.onCancel(this.note.id);
    }
  }

  private showError(message: string): void {
    // Remove existing error message
    const existingError = this.element.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    this.element.appendChild(errorElement);

    // Remove error after 3 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 3000);
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  updateNote(note: StickyNote): void {
    this.note = note;
    // Recreate the element with updated note
    const parent = this.element.parentNode;
    const newElement = this.createElement();

    if (parent) {
      parent.replaceChild(newElement, this.element);
    }

    this.element = newElement;
  }

  remove(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}