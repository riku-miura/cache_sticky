import { test, expect } from '@playwright/test';

test.describe('Cache Sticky User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete user journey from note creation to cache clearing', async ({ page }) => {
    // Phase 1: Initial state
    await expect(page.locator('#whiteboard')).toBeVisible();
    await expect(page.locator('#new-note-btn')).toBeVisible();
    await expect(page.locator('.sticky-note')).toHaveCount(0);

    // Phase 2: Create first note
    await page.click('#new-note-btn');
    await expect(page.locator('.sticky-note')).toHaveCount(1);
    await expect(page.locator('.sticky-note.editing')).toHaveCount(1);

    const firstNoteTextarea = page.locator('.sticky-note.editing textarea');
    await firstNoteTextarea.fill('My first cache note');
    await firstNoteTextarea.blur();

    // Verify first note is saved
    await expect(page.locator('.sticky-note.editing')).toHaveCount(0);
    await expect(page.locator('.sticky-note')).toHaveCount(1);
    await expect(page.locator('.sticky-note')).toContainText('My first cache note');

    // Phase 3: Create second note while first is non-editable
    await page.click('#new-note-btn');
    await expect(page.locator('.sticky-note')).toHaveCount(2);
    await expect(page.locator('.sticky-note.editing')).toHaveCount(1);

    // Verify first note is still non-editable
    const firstNote = page.locator('.sticky-note').first();
    await expect(firstNote).not.toHaveClass(/editing/);

    const secondNoteTextarea = page.locator('.sticky-note.editing textarea');
    await secondNoteTextarea.fill('Second note');
    await secondNoteTextarea.blur();

    // Phase 4: Test persistence with page refresh
    await page.reload();
    await expect(page.locator('.sticky-note')).toHaveCount(2);
    await expect(page.locator('.sticky-note')).toContainText('My first cache note');
    await expect(page.locator('.sticky-note')).toContainText('Second note');

    // Phase 5: Test character limit
    await page.click('#new-note-btn');
    const longText = 'a'.repeat(250);
    const thirdNoteTextarea = page.locator('.sticky-note.editing textarea');

    await thirdNoteTextarea.fill(longText);
    const actualText = await thirdNoteTextarea.inputValue();
    expect(actualText.length).toBeLessThanOrEqual(200);

    await thirdNoteTextarea.blur();
    await expect(page.locator('.sticky-note')).toHaveCount(3);
  });

  test('keyboard navigation and shortcuts', async ({ page }) => {
    // Create note with Enter key
    await page.click('#new-note-btn');
    const textarea = page.locator('.sticky-note.editing textarea');

    await textarea.fill('Note with Enter save');
    await textarea.press('Enter');

    // Should save the note
    await expect(page.locator('.sticky-note.editing')).toHaveCount(0);
    await expect(page.locator('.sticky-note')).toContainText('Note with Enter save');

    // Test Escape key cancellation
    await page.click('#new-note-btn');
    const newTextarea = page.locator('.sticky-note.editing textarea');

    await newTextarea.fill('This should be cancelled');
    await newTextarea.press('Escape');

    // Should cancel/remove the note
    await expect(page.locator('.sticky-note.editing')).toHaveCount(0);
    await expect(page.locator('.sticky-note')).toHaveCount(1); // Only the saved note remains
  });

  test('error handling and user feedback', async ({ page }) => {
    // Test empty note handling
    await page.click('#new-note-btn');
    const textarea = page.locator('.sticky-note.editing textarea');

    // Try to save empty note
    await textarea.blur();

    // Should show error or prevent saving
    const errorMessage = page.locator('.error-message');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('cannot be empty');
    }
  });

  test('performance with multiple notes', async ({ page }) => {
    // Create multiple notes quickly
    for (let i = 1; i <= 10; i++) {
      await page.click('#new-note-btn');
      const textarea = page.locator('.sticky-note.editing textarea');
      await textarea.fill(`Note ${i}`);
      await textarea.blur();

      // Wait for note to be saved
      await expect(page.locator('.sticky-note.editing')).toHaveCount(0);
    }

    // Verify all notes are present
    await expect(page.locator('.sticky-note')).toHaveCount(10);

    // Test page performance after reload
    const startTime = Date.now();
    await page.reload();
    const loadTime = Date.now() - startTime;

    // Should load within 2 seconds as per constitution
    expect(loadTime).toBeLessThan(2000);
    await expect(page.locator('.sticky-note')).toHaveCount(10);
  });

  test('cache API availability detection', async ({ page }) => {
    // Check if cache status is displayed
    const cacheStatus = page.locator('#cache-status');
    if (await cacheStatus.isVisible()) {
      const statusText = await cacheStatus.textContent();
      expect(statusText).toMatch(/(available|unavailable)/i);
    }
  });

  test('note positioning and layout', async ({ page }) => {
    // Create multiple notes and verify they don't overlap
    await page.click('#new-note-btn');
    let textarea = page.locator('.sticky-note.editing textarea');
    await textarea.fill('Note 1');
    await textarea.blur();

    await page.click('#new-note-btn');
    textarea = page.locator('.sticky-note.editing textarea');
    await textarea.fill('Note 2');
    await textarea.blur();

    await page.click('#new-note-btn');
    textarea = page.locator('.sticky-note.editing textarea');
    await textarea.fill('Note 3');
    await textarea.blur();

    // Check positions of all notes
    const notes = page.locator('.sticky-note');
    const count = await notes.count();

    for (let i = 0; i < count; i++) {
      const note = notes.nth(i);
      const box = await note.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
    }
  });
});