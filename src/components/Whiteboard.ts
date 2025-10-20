import { StickyNote } from '@/models/StickyNote';
import { WhiteboardService } from '@/services/WhiteboardService';
import { CacheService } from '@/services/CacheService';
import { StickyNoteComponent } from '@/components/StickyNote';
import { NewNoteButton } from '@/components/NewNoteButton';

export class Whiteboard {
  private element: HTMLDivElement;
  private whiteboardService: WhiteboardService;
  // private cacheService: CacheService; // 使用していないためコメントアウト
  private newNoteButton: NewNoteButton;
  private noteComponents: Map<string, StickyNoteComponent> = new Map();
  private isCreatingNote = false;

  constructor() {
    this.whiteboardService = new WhiteboardService();
    // this.cacheService = new CacheService(); // 使用していないためコメントアウト
    this.newNoteButton = new NewNoteButton(() => this.handleNewNoteClick());
    this.element = this.createElement();
  }

  private createElement(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'app';
    container.className = 'whiteboard-container';

    // ヘッダーエリアを完全に削除

    // Main whiteboard area
    const whiteboard = document.createElement('div');
    whiteboard.id = 'whiteboard';
    whiteboard.className = 'whiteboard';

    // 使い方エリアを削除（ふせん形式に変更するため）

    // 新しいふせんボタンもふせん形式に変更するため、ここでは作成しない

    container.appendChild(whiteboard);

    return container;
  }

  // updateCacheStatusメソッドを削除（不要になったため）

  private async handleNewNoteClick(): Promise<void> {
    if (this.isCreatingNote) {
      this.showMessage('現在編集中の付箋を先に完了してください', 'warning');
      return;
    }

    try {
      this.isCreatingNote = true;
      this.newNoteButton.setEnabled(false);

      // Make all existing notes non-editable
      this.setAllNotesNonEditable();

      // Create new note
      const newNote = await this.whiteboardService.createNewNote();
      this.addNoteToDOM(newNote);

      this.showMessage('新しい付箋が作成されました - 入力してください！', 'info');
    } catch (error) {
      console.error('Failed to create new note:', error);
      this.showMessage('新しい付箋の作成に失敗しました', 'error');
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
      // Get the actual position from the DOM element
      const noteComponent = this.noteComponents.get(noteId);
      const element = noteComponent?.getElement();
      const currentPosition = element ? {
        x: parseInt(element.style.left) || 0,
        y: parseInt(element.style.top) || 0
      } : { x: 0, y: 0 };

      const savedNote: StickyNote = {
        id: noteId,
        text,
        createdAt: Date.now(),
        position: currentPosition,
        isEditing: false,
      };

      if (noteComponent) {
        noteComponent.updateNote(savedNote);
      }

      this.isCreatingNote = false;
      this.newNoteButton.setEnabled(true);
      this.showMessage('付箋が正常に保存されました！', 'success');
    } catch (error) {
      console.error('Failed to save note:', error);
      this.showMessage(`付箋の保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`, 'error');
    }
  }

  private handleNoteCancel(noteId: string): void {
    const component = this.noteComponents.get(noteId);
    if (component) {
      component.remove();
      this.noteComponents.delete(noteId);
    }

    // WhiteboardServiceからもインメモリノートを削除
    this.whiteboardService.cancelNoteEdit(noteId);

    this.isCreatingNote = false;
    this.newNoteButton.setEnabled(true);
    this.showMessage('付箋の作成がキャンセルされました', 'info');
  }

  private showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    // Remove existing messages
    const existingMessages = this.element.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;

    // ホワイトボードの最上部に表示
    const whiteboard = this.element.querySelector('#whiteboard') as HTMLDivElement;
    if (whiteboard) {
      whiteboard.insertBefore(messageElement, whiteboard.firstChild);
    } else {
      // フォールバック: コンテナの最上部に追加
      this.element.insertBefore(messageElement, this.element.firstChild);
    }

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
        this.showMessage(`キャッシュから${notes.length}個の付箋を読み込みました`, 'success');
      }
    } catch (error) {
      console.error('Failed to load existing notes:', error);
      this.showMessage('既存の付箋の読み込みに失敗しました', 'error');
    }
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  async initialize(): Promise<void> {
    await this.createInstructionNotes();
    await this.loadExistingNotes();
  }

  private async createInstructionNotes(): Promise<void> {
    try {
      // 使い方の3つの項目をふせんとして作成
      const instructionTexts = [
        '「＋新しいふせん」でふせんを追加',
        'メッセージを入力（最大200文字）',
        'ブラウザキャッシュを削除（開発者ツール → Application → Storage）すると、ふせんが消えます'
      ];

      for (let i = 0; i < instructionTexts.length; i++) {
        const instructionNote: StickyNote = {
          id: `instruction-${i + 1}`,
          text: instructionTexts[i],
          createdAt: Date.now(),
          position: { x: 20 + (i * 220), y: 20 }, // 最初の行に配置
          isEditing: false,
        };

        this.addInstructionNoteToDOM(instructionNote);
      }

      // 新しいふせんボタンを次の行に配置
      this.createNewNoteButton();
    } catch (error) {
      console.error('Failed to create instruction notes:', error);
    }
  }

  private addInstructionNoteToDOM(note: StickyNote): void {
    const noteElement = document.createElement('div');
    noteElement.className = 'sticky-note instruction-note';
    noteElement.id = `note-${note.id}`;
    noteElement.style.left = `${note.position.x}px`;
    noteElement.style.top = `${note.position.y}px`;

    const textElement = document.createElement('div');
    textElement.className = 'note-text';
    textElement.textContent = note.text;

    noteElement.appendChild(textElement);

    const whiteboard = this.element.querySelector('#whiteboard') as HTMLDivElement;
    whiteboard.appendChild(noteElement);
  }

  private createNewNoteButton(): void {
    const buttonElement = document.createElement('div');
    buttonElement.className = 'sticky-note new-note-sticky';
    buttonElement.style.left = '20px';
    buttonElement.style.top = '190px'; // 次の行
    buttonElement.style.cursor = 'pointer';

    const plusElement = document.createElement('div');
    plusElement.className = 'plus-icon';
    plusElement.textContent = '+';

    const labelElement = document.createElement('div');
    labelElement.className = 'new-note-label';
    labelElement.textContent = '新しいふせん';

    buttonElement.appendChild(plusElement);
    buttonElement.appendChild(labelElement);

    buttonElement.addEventListener('click', () => this.handleNewNoteClick());

    const whiteboard = this.element.querySelector('#whiteboard') as HTMLDivElement;
    whiteboard.appendChild(buttonElement);
  }
}