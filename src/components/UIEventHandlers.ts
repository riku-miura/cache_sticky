export class UIEventHandlers {
  private isCreatingNote = false;

  onNewNoteClick(): void {
    if (this.isCreatingNote) {
      return;
    }

    this.isCreatingNote = true;

    // Create new sticky note element
    const whiteboard = document.getElementById('whiteboard');
    if (!whiteboard) return;

    // Make existing notes non-editable
    const existingEditingNotes = whiteboard.querySelectorAll('.sticky-note.editing');
    existingEditingNotes.forEach(note => {
      note.classList.remove('editing');
    });

    // Create new note
    const noteElement = document.createElement('div');
    noteElement.className = 'sticky-note editing';
    noteElement.style.left = '50px';
    noteElement.style.top = '50px';

    const textarea = document.createElement('textarea');
    textarea.className = 'note-textarea';
    textarea.placeholder = 'Enter your note (max 200 characters)';
    textarea.maxLength = 200;

    noteElement.appendChild(textarea);
    whiteboard.appendChild(noteElement);

    // Focus the textarea
    setTimeout(() => textarea.focus(), 0);
  }

  onNoteTextInput(noteId: string, text: string): void {
    // Find the note element
    const noteElement = document.getElementById(`note-${noteId}`);
    if (!noteElement) return;

    const textarea = noteElement.querySelector('textarea');
    if (!textarea) return;

    // Enforce character limit
    if (text.length > 200) {
      textarea.value = text.substring(0, 200);
    } else {
      textarea.value = text;
    }
  }

  onNoteSave(noteId: string): void {
    const noteElement = document.getElementById(`note-${noteId}`);
    if (!noteElement) return;

    const textarea = noteElement.querySelector('textarea');
    if (!textarea) return;

    const text = textarea.value.trim();
    if (text.length === 0) {
      return; // Don't save empty notes
    }

    // Convert to static note
    noteElement.classList.remove('editing');
    noteElement.innerHTML = `
      <div class="note-text">${text}</div>
      <div class="note-timestamp">${new Date().toLocaleString()}</div>
    `;

    this.isCreatingNote = false;
  }

  onNoteCancel(noteId: string): void {
    const noteElement = document.getElementById(`note-${noteId}`);
    if (noteElement) {
      noteElement.remove();
    }

    this.isCreatingNote = false;
  }

  // Setup global event listeners
  setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;

      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        const noteElement = activeElement.closest('.sticky-note');
        if (!noteElement) return;

        const noteId = noteElement.id.replace('note-', '');

        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.onNoteSave(noteId);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.onNoteCancel(noteId);
        }
      }
    });

    // Handle textarea blur events
    document.addEventListener('blur', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'TEXTAREA' && target.classList.contains('note-textarea')) {
        const noteElement = target.closest('.sticky-note');
        if (noteElement) {
          const noteId = noteElement.id.replace('note-', '');
          this.onNoteSave(noteId);
        }
      }
    }, true);
  }
}