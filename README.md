# Notepad

A minimalist Chrome notepad extension with multi-chapter, multi-page, auto-save, and local storage support.

## Features

- **Multi-chapter management**
  - Add, rename, and delete chapters
  - Confirmation prompt before deleting a chapter to prevent accidental deletion

- **Multi-page support**
  - Each chapter can contain multiple pages
  - Quickly switch between previous and next pages

- **Auto save**
  - Automatically saves to Chrome local storage while typing
  - Manual save available with Ctrl+S / Cmd+S

- **Undo & Redo**
  - Supports Ctrl+Z / Cmd+Z undo and Ctrl+Y / Ctrl+Shift+Z / Cmd+Shift+Z redo
  - Each page keeps its own last 100 editing records

- **Statistics**
  - Real-time display of character, word, and line counts

- **UI settings**
  - Auto-save toggle
  - Chinese / English language switch

## Installation

1. Download or clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top-right corner.
4. Click "Load unpacked" and select the project folder.
5. Click the extension icon in the toolbar to use it.

## Technical Notes

- Uses `chrome.storage.local` for persistent storage; content is retained after the extension closes.
- Pure native HTML / CSS / JavaScript with no external dependencies.

## License

[MIT](LICENSE)
