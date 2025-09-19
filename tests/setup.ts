// Jest setup file for browser environment mocking

// Mock Cache API for testing
const mockCache = {
  match: jest.fn(),
  put: jest.fn(),
  keys: jest.fn(),
  delete: jest.fn(),
};

const mockCaches = {
  open: jest.fn().mockResolvedValue(mockCache),
  delete: jest.fn(),
  keys: jest.fn(),
  has: jest.fn(),
};

Object.defineProperty(window, 'caches', {
  value: mockCaches,
  writable: true,
});

// Mock UUID for consistent testing
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

// Setup DOM environment
document.body.innerHTML = '<div id="app"></div>';

beforeEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '<div id="app"></div>';
});