// Global type definitions for Cache Sticky application

// Extend Window interface for Cache API
declare global {
  interface Window {
    caches: CacheStorage;
  }
}

// Cache API type augmentation for better TypeScript support
interface CacheStorage {
  delete(cacheName: string): Promise<boolean>;
  has(cacheName: string): Promise<boolean>;
  keys(): Promise<string[]>;
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
  open(cacheName: string): Promise<Cache>;
}

interface Cache {
  add(request: RequestInfo): Promise<void>;
  addAll(requests: RequestInfo[]): Promise<void>;
  delete(request: RequestInfo, options?: CacheQueryOptions): Promise<boolean>;
  keys(request?: RequestInfo, options?: CacheQueryOptions): Promise<readonly Request[]>;
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
  matchAll(request?: RequestInfo, options?: CacheQueryOptions): Promise<readonly Response[]>;
  put(request: RequestInfo, response: Response): Promise<void>;
}

interface CacheQueryOptions {
  ignoreMethod?: boolean;
  ignoreSearch?: boolean;
  ignoreVary?: boolean;
}

// Module declaration for CSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

// Environment variables
declare const __DEV__: boolean;
declare const __PROD__: boolean;

export {};