# Quickstart Guide: Cache Sticky Web Application

## Setup and Run

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with Cache API support (Chrome 40+, Firefox 41+, Safari 11.1+)

### Installation
```bash
# Clone and install dependencies
git clone <repository-url>
cd cache_sticky
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview  # Test production build locally
```

## User Journey Testing

### Basic Note Creation Flow
1. **Open Application**
   - Browser displays blank white whiteboard
   - "New Note" button visible at top

2. **Create First Note**
   - Click "New Note" button
   - Yellow sticky note appears with cursor in text field
   - Type "My first cache note"
   - Press Enter or click outside note
   - Note becomes non-editable and persists

3. **Test Persistence**
   - Refresh browser page (F5 or Ctrl+R)
   - Note should reappear in same position
   - Verify note text is preserved

4. **Create Multiple Notes**
   - Click "New Note" again
   - Add second note with different text
   - Verify first note becomes non-editable during creation
   - Save second note
   - Both notes should persist after refresh

### Cache Clearing Behavior
5. **Demonstrate Cache Clearing**
   - Create 3-5 notes with different text
   - Refresh page to confirm all notes persist
   - Open browser Developer Tools (F12)
   - Go to Application/Storage tab → Cache Storage
   - Find and delete cache entries OR clear all browsing data
   - Refresh page
   - Verify all notes disappear (whiteboard is empty)

### Edge Case Testing
6. **Character Limit Testing**
   - Create new note
   - Type exactly 200 characters (character counter should show 0 remaining)
   - Try to type more characters (should be prevented)
   - Save note successfully

7. **Multiple Notes Performance**
   - Create 20+ notes rapidly
   - Check browser performance (smooth UI)
   - Verify all notes save and reload correctly

8. **Browser Compatibility**
   - Test in Chrome, Firefox, Edge, Safari
   - Verify Cache API availability message if unsupported
   - Test fallback behavior in incognito/private mode

## Development Testing Commands

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Linting and Formatting
```bash
# Check code quality
npm run lint

# Fix formatting
npm run format

# Type checking
npm run type-check
```

## Expected Behaviors

### Success Criteria
- ✅ Notes persist across page refreshes
- ✅ Notes disappear when cache is manually cleared
- ✅ Only one note editable at a time
- ✅ 200 character limit enforced
- ✅ Unlimited number of notes supported
- ✅ Page loads in under 2 seconds
- ✅ Smooth UI interactions even with many notes

### Error Scenarios to Test
- ❌ Cache API not supported → Shows warning message
- ❌ Cache quota exceeded → Shows error message, prevents new notes
- ❌ Invalid characters in note → Input sanitized
- ❌ Network offline → App still works (no network required)

## Learning Objectives Validation

After completing the quickstart, users should understand:

1. **Cache API Behavior**
   - How Cache API differs from localStorage
   - Why cache clearing removes all notes
   - Browser cache management implications

2. **Frontend Architecture**
   - TypeScript interface design
   - DOM manipulation without frameworks
   - Error handling and user feedback

3. **Performance Considerations**
   - Memory management with unlimited notes
   - Efficient DOM updates
   - Browser compatibility strategies