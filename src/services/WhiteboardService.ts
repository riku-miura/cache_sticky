import { v4 as uuidv4 } from 'uuid';
import { StickyNote, StickyNoteValidator } from '@/models/StickyNote';
import { CacheService } from '@/services/CacheService';

export class WhiteboardService {
  private cacheService: CacheService;
  private readonly NOTE_WIDTH = 200;  // ふせんの幅
  private readonly NOTE_HEIGHT = 150; // ふせんの高さ
  private readonly GRID_SPACING = 20;  // グリッド間隔
  private readonly START_X = 20;       // 開始位置X
  private readonly START_Y = 20;       // 開始位置Y
  private readonly CONTAINER_WIDTH = 800; // コンテナ幅
  private inMemoryNotes: Map<string, StickyNote> = new Map(); // インメモリ管理

  constructor() {
    this.cacheService = new CacheService();
  }

  async createNewNote(position?: { x: number; y: number }): Promise<StickyNote> {
    const notePosition = position || await this.getNextPosition();

    const note: StickyNote = {
      id: uuidv4(),
      text: '',
      createdAt: Date.now(),
      position: notePosition,
      isEditing: true,
    };

    // インメモリに即座に追加して位置の衝突を防ぐ
    this.inMemoryNotes.set(note.id, note);

    return note;
  }

  private async getNextPosition(): Promise<{ x: number; y: number }> {
    // 既存のふせんの位置を取得（Cache API + インメモリ）
    const cachedNotes = await this.cacheService.getAllNotes();
    const inMemoryNotes = Array.from(this.inMemoryNotes.values());
    const allNotes = [...cachedNotes, ...inMemoryNotes];


    // 重複を除去（IDベース）
    const uniqueNotes = allNotes.reduce((acc, note) => {
      acc.set(note.id, note);
      return acc;
    }, new Map<string, StickyNote>());

    const occupiedPositions = new Set(
      Array.from(uniqueNotes.values()).map(note => `${note.position.x},${note.position.y}`)
    );


    // 固定ふせんの位置を追加（説明ふせんと新しいふせんボタン）
    const fixedPositions = [
      '20,20',   // 説明ふ1
      '240,20',  // 説明ふ2
      '460,20',  // 説明ふ3
      '20,190'   // 新しいふせんボタン
    ];

    fixedPositions.forEach(pos => occupiedPositions.add(pos));

    // グリッドで配置していく（新しいふせんボタンの下の行から開始）
    let currentX = this.START_X;
    let currentY = 190 + this.NOTE_HEIGHT + this.GRID_SPACING; // 新しいふせんボタン(190px) + ふせんの高さ(150px) + 間隔(20px) = 360px

    while (true) {
      const positionKey = `${currentX},${currentY}`;

      // この位置が空いているかチェック
      if (!occupiedPositions.has(positionKey)) {
        return { x: currentX, y: currentY };
      }

      // 次の位置へ移動
      currentX += this.NOTE_WIDTH + this.GRID_SPACING;

      // 行の終わりに達したら次の行へ
      if (currentX + this.NOTE_WIDTH > this.CONTAINER_WIDTH) {
        currentX = this.START_X;
        currentY += this.NOTE_HEIGHT + this.GRID_SPACING;
      }
    }
  }

  async saveNote(noteId: string, text: string): Promise<void> {
    const validation = this.validateNoteText(text);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // For this implementation, we need to construct the full note
    // In a real app, this would likely get the existing note first
    const sanitizedText = StickyNoteValidator.sanitizeText(text);

    // 既存のノートの位置を保持するため、インメモリまたはキャッシュから取得
    const inMemoryNote = this.inMemoryNotes.get(noteId);
    const cachedNote = await this.cacheService.getNote(noteId);
    const position = inMemoryNote?.position || cachedNote?.position || await this.getNextPosition();

    const note: StickyNote = {
      id: noteId,
      text: sanitizedText,
      createdAt: inMemoryNote?.createdAt || cachedNote?.createdAt || Date.now(),
      position: position,
      isEditing: false,
    };

    // インメモリにも保存（位置管理のため）
    this.inMemoryNotes.set(noteId, note);

    try {
      await this.cacheService.storeNote(note);
      console.log(`Note ${noteId} stored successfully in cache`);
    } catch (error) {
      console.warn(`Save operation completed with warnings for note ${noteId}:`, error);
      // Continue execution even if cache storage fails
    }
  }

  cancelNoteEdit(noteId: string): void {
    // インメモリからノートを削除
    this.inMemoryNotes.delete(noteId);
    console.log(`Cancelling edit for note: ${noteId}`);
  }

  async loadAllNotes(): Promise<StickyNote[]> {
    return await this.cacheService.getAllNotes();
  }

  validateNoteText(text: string): { isValid: boolean; error?: string } {
    return StickyNoteValidator.validateText(text);
  }

  // updateNextPositionFromNotesメソッドは不要（グリッドベースのため）

  // Initialize the service with existing notes
  async initialize(): Promise<void> {
    // グリッドベースのため初期化不要
  }
}