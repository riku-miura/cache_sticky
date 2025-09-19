export class NewNoteButton {
  private element: HTMLButtonElement;
  private onClick?: () => void;

  constructor(onClick?: () => void) {
    this.onClick = onClick;
    this.element = this.createElement();
  }

  private createElement(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'new-note-btn';
    button.className = 'new-note-button';
    button.textContent = 'New Note';
    button.title = 'Create a new sticky note';

    button.addEventListener('click', () => {
      if (this.onClick) {
        this.onClick();
      }
    });

    return button;
  }

  getElement(): HTMLButtonElement {
    return this.element;
  }

  setEnabled(enabled: boolean): void {
    this.element.disabled = !enabled;
    if (enabled) {
      this.element.classList.remove('disabled');
    } else {
      this.element.classList.add('disabled');
    }
  }

  updateText(text: string): void {
    this.element.textContent = text;
  }
}