import { Whiteboard } from '@/components/Whiteboard';
import '@/styles/main.css';

class CacheStickyApp {
  private whiteboard: Whiteboard;

  constructor() {
    this.whiteboard = new Whiteboard();
  }

  async initialize(): Promise<void> {
    try {
      // Mount the application to the DOM
      const appContainer = document.getElementById('app');
      if (appContainer) {
        appContainer.replaceWith(this.whiteboard.getElement());
      } else {
        document.body.appendChild(this.whiteboard.getElement());
      }

      // Initialize the whiteboard with existing notes
      await this.whiteboard.initialize();

      // Add global error handler
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

      console.log('Cache Sticky application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showFallbackUI();
    }
  }

  private handleGlobalError(event: ErrorEvent): void {
    console.error('Global error:', event.error);
    this.showErrorMessage('An unexpected error occurred. Please refresh the page.');
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    console.error('Unhandled promise rejection:', event.reason);
    this.showErrorMessage('An error occurred while processing your request.');
  }

  private showErrorMessage(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'global-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h2>⚠️ Error</h2>
        <p>${message}</p>
        <button onclick="location.reload()">Refresh Page</button>
      </div>
    `;

    // Add to top of body
    document.body.insertBefore(errorDiv, document.body.firstChild);

    // Remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 10000);
  }

  private showFallbackUI(): void {
    const fallbackHTML = `
      <div id="fallback-app">
        <h1>Cache Sticky</h1>
        <div class="fallback-message">
          <h2>⚠️ Application failed to load</h2>
          <p>This could be due to:</p>
          <ul>
            <li>JavaScript disabled in your browser</li>
            <li>Unsupported browser version</li>
            <li>Network connectivity issues</li>
          </ul>
          <p>Please try:</p>
          <ul>
            <li>Refreshing the page</li>
            <li>Enabling JavaScript</li>
            <li>Using a modern browser (Chrome 40+, Firefox 41+, Safari 11.1+)</li>
          </ul>
          <button onclick="location.reload()">Refresh Page</button>
        </div>
      </div>
    `;

    document.body.innerHTML = fallbackHTML;
  }
}

// Initialize the application when DOM is ready
async function initializeApp() {
  try {
    console.log('Starting Cache Sticky application...');
    const app = new CacheStickyApp();
    await app.initialize();
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Show fallback UI
    document.body.innerHTML = `
      <div id="fallback-app">
        <h1>Cache Sticky</h1>
        <div class="fallback-message">
          <h2>⚠️ Application failed to load</h2>
          <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="location.reload()">Refresh Page</button>
        </div>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  // DOM not ready yet, wait for it
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already ready
  initializeApp();
}