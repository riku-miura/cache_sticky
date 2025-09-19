export class CacheQuotaExceededError extends Error {
  constructor() {
    super('Browser cache quota exceeded');
    this.name = 'CacheQuotaExceededError';
  }
}

export class CacheUnavailableError extends Error {
  constructor() {
    super('Cache API is not available in this browser');
    this.name = 'CacheUnavailableError';
  }
}

export class InvalidNoteDataError extends Error {
  constructor(message: string) {
    super(`Invalid note data: ${message}`);
    this.name = 'InvalidNoteDataError';
  }
}

export class CacheOperationError extends Error {
  constructor(operation: string, cause?: string) {
    super(`Cache operation '${operation}' failed${cause ? `: ${cause}` : ''}`);
    this.name = 'CacheOperationError';
  }
}