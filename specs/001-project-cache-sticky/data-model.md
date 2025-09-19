# Data Model: Cache Sticky Web Application

## Core Entities

### StickyNote
**Purpose**: Represents a user-created note with text content and metadata

**Fields**:
- `id: string` - Unique identifier (UUID v4)
- `text: string` - Note content (max 200 characters)
- `createdAt: number` - Timestamp when note was created
- `position: { x: number, y: number }` - Position on whiteboard (pixels)
- `isEditing: boolean` - Whether note is currently being edited

**Validation Rules**:
- `text` must be non-empty after trimming
- `text` must not exceed 200 characters
- `id` must be unique across all notes
- `position.x` and `position.y` must be non-negative
- Only one note can have `isEditing: true` at a time

**State Transitions**:
1. **Creation**: `isEditing: true` → User input → `isEditing: false`
2. **Persistence**: Save to Cache API when `isEditing` becomes `false`
3. **Immutable**: Once saved, notes cannot be edited or deleted

## Cache Storage Schema

### Cache Key Pattern
```typescript
const cacheKey = `cache-sticky-note-${noteId}`
```

### Cache Entry Structure
**Request URL**: `https://cache-sticky.local/notes/${noteId}`
**Response Body**: JSON serialized StickyNote
**Response Headers**:
- `Content-Type: application/json`
- `X-Created-At: ${timestamp}`

### Cache Management Operations
- **Store Note**: `cache.put(request, response)`
- **Retrieve Note**: `cache.match(request)`
- **List All Notes**: `cache.keys()` then filter by URL pattern
- **Clear All Notes**: Cache cleared by browser (not app-controlled)

## Application State

### WhiteboardState
**Purpose**: Manages overall application state

**Fields**:
- `notes: StickyNote[]` - Array of all notes
- `isCreatingNew: boolean` - Whether user is creating a new note
- `nextPosition: { x: number, y: number }` - Position for next note

**State Management Rules**:
- When `isCreatingNew: true`, all existing notes must have `isEditing: false`
- `nextPosition` increments to avoid note overlap
- `notes` array maintained in creation order

## Error States

### CacheUnavailable
- **Trigger**: Cache API not supported or blocked
- **Fallback**: Memory-only storage with warning message
- **User Impact**: Notes disappear on page refresh

### QuotaExceeded
- **Trigger**: Browser cache storage limit reached
- **Behavior**: Show error message, prevent new notes
- **Recovery**: User must clear cache manually

### InvalidNoteData
- **Trigger**: Corrupted data in cache or validation failure
- **Behavior**: Skip corrupted notes, log warning
- **Recovery**: Continue with valid notes only