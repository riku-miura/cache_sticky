# Cache Sticky 📝

A minimal, frontend-only web application to visualize browser Cache API behavior through interactive sticky notes ("fusen") on a digital whiteboard.

## 🎯 Purpose

Cache Sticky is an educational tool that demonstrates how the browser Cache API works by creating persistent sticky notes. Users can:

- Create unlimited sticky notes (200 characters max each)
- See notes persist across page refreshes via Cache API
- Observe notes disappear when browser cache is cleared
- Learn about browser storage limitations and behavior

## ✨ Features

- **📝 Interactive Sticky Notes**: Create, edit, and save text notes
- **🔄 Cache Persistence**: Notes persist using browser Cache API
- **🎨 Minimal UI**: Clean, distraction-free interface
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔒 Client-Side Only**: No backend required, pure frontend application
- **⚡ Fast Performance**: Optimized for smooth interactions even with many notes
- **🧪 Educational Value**: Perfect for learning Cache API concepts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with Cache API support:
  - Chrome 40+
  - Firefox 41+
  - Safari 11.1+
  - Edge 79+

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/cache_sticky.git
cd cache_sticky

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 How to Use

### Basic Usage

1. **Create a Note**: Click the "New Note" button
2. **Write Content**: Type your message (max 200 characters)
3. **Save**: Press Enter or click outside the note
4. **Test Persistence**: Refresh the page - notes should reappear
5. **Clear Cache**: Use browser dev tools to clear cache and see notes disappear

### Keyboard Shortcuts

- **Enter**: Save the current note
- **Escape**: Cancel note creation/editing
- **Tab**: Navigate between UI elements

### Cache Clearing Demo

To demonstrate the Cache API behavior:

1. Create several notes with different content
2. Refresh the page to confirm notes persist
3. Open Developer Tools (F12)
4. Go to Application/Storage → Cache Storage
5. Delete the cache entries or clear all browsing data
6. Refresh the page - all notes will disappear

## 🛠️ Development

### Project Structure

```
cache_sticky/
├── src/
│   ├── components/     # UI components (StickyNote, Whiteboard, etc.)
│   ├── models/         # Data models and validation
│   ├── services/       # Business logic (CacheService, WhiteboardService)
│   ├── styles/         # CSS styles
│   ├── types/          # TypeScript type definitions
│   └── main.ts         # Application entry point
├── tests/
│   ├── contract/       # Contract/interface tests
│   ├── integration/    # Integration tests
│   ├── unit/           # Unit tests
│   └── e2e/            # End-to-end tests (Playwright)
├── public/             # Static assets
└── specs/              # Feature specifications and documentation
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests (Jest)
npm run test:e2e     # Run end-to-end tests (Playwright)
npm run test:coverage # Generate test coverage report

# Code Quality
npm run lint         # Check code quality (ESLint)
npm run format       # Format code (Prettier)
npm run type-check   # TypeScript validation
```

### Technical Stack

- **Framework**: Vanilla TypeScript + Vite
- **Storage**: Browser Cache API
- **Testing**: Jest (unit) + Playwright (e2e)
- **Code Quality**: ESLint + Prettier
- **Build Tool**: Vite
- **Styling**: CSS3 with responsive design

## 🧪 Testing

The project follows Test-Driven Development (TDD) with 90%+ test coverage:

### Running Tests

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run specific test file
npm run test tests/contract/test_cache_service.test.ts
```

### Test Categories

- **Contract Tests**: Verify service interfaces work as expected
- **Integration Tests**: Test component interactions and user flows
- **End-to-End Tests**: Full browser automation testing
- **Unit Tests**: Individual function and class testing

## 🎓 Learning Objectives

After using Cache Sticky, you'll understand:

### Cache API Fundamentals
- How Cache API differs from localStorage/sessionStorage
- Request/Response pattern for storing data
- Cache key management and retrieval
- Browser-controlled cache clearing behavior

### Frontend Architecture
- TypeScript interface design and implementation
- Service layer pattern for business logic
- Component-based UI architecture
- Error handling and user feedback

### Performance Considerations
- Memory management with unlimited data
- Efficient DOM manipulation
- Browser compatibility strategies
- Progressive enhancement

## 📖 Architecture & Design

### Core Services

- **CacheService**: Handles all Cache API operations
- **WhiteboardService**: Manages note creation and validation
- **StickyNoteComponent**: Individual note UI management
- **Whiteboard**: Main application orchestration

### Design Patterns

- **Service Layer**: Separation of business logic from UI
- **Component Pattern**: Reusable UI components
- **Observer Pattern**: Event-driven interactions
- **Error Boundary**: Graceful error handling

### Security Features

- **Input Sanitization**: XSS prevention for note content
- **Content Security Policy**: Restricted script execution
- **Type Safety**: TypeScript for runtime safety
- **Validation**: Client-side input validation

## 🔧 Configuration

### Browser Compatibility

The application automatically detects Cache API availability and provides fallback behavior:

- **Cache Available**: Full functionality with persistence
- **Cache Unavailable**: Memory-only mode with warnings

### Performance Settings

- **Character Limit**: 200 characters per note (configurable)
- **Position Management**: Automatic note positioning to prevent overlap
- **Memory Cleanup**: Proper event listener cleanup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Add tests for new functionality
5. Ensure all tests pass (`npm run test`)
6. Run linting (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Maintain 90%+ test coverage
- Use TDD approach for new features
- Follow existing naming conventions
- Add JSDoc comments for public APIs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for educational purposes
- Inspired by the need to understand browser storage APIs
- Thanks to the web development community for Cache API documentation

## 🐛 Known Issues & Limitations

- Cache API not supported in all browsers (graceful fallback provided)
- Cache quota limits vary by browser and available storage
- Notes are stored per origin (domain + protocol + port)
- Cache clearing is controlled by browser, not the application

## 📞 Support

If you encounter issues or have questions:

1. Check the [GitHub Issues](https://github.com/your-username/cache_sticky/issues)
2. Review the browser console for error messages
3. Ensure your browser supports Cache API
4. Try clearing your browser cache and reloading

---

**Happy Caching!** 🎉