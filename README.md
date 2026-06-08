# Note Gallery

A card-based note browser for Obsidian, inspired by UpNote. Displays notes as a list with image thumbnails, category tags, dates, and a text preview — making it easy to visually navigate your vault.

## Features

- **Card view** — each note shows title, category, date, and image thumbnail
- **Folder navigation** — subfolders appear at the top as clickable entries with a breadcrumb trail
- **Live search** — filter notes and folders by title instantly
- **Text preview** — hover over a note to see the first lines of content
- **New note button** — create a note directly in the current folder
- **Delete** — remove notes with a confirmation dialog
- **Note counter** — shows number of notes and subfolders in the toolbar
- **Auto-refresh** — gallery updates automatically when notes are added, modified, or deleted
- **State persistence** — remembers the open folder after restarting Obsidian
- **Mobile compatible** — works on Android and iOS

## Installation

### Via BRAT (recommended for beta)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the Obsidian Community Plugins browser
2. Open BRAT settings → **Add Beta Plugin**
3. Enter: `https://github.com/Sh3llingFord/obsidian-note-gallery`
4. Enable the plugin under **Settings → Community Plugins**

### Manual installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/Sh3llingFord/obsidian-note-gallery/releases/latest)
2. Create a folder `.obsidian/plugins/note-gallery/` in your vault
3. Copy both files into that folder
4. Enable the plugin under **Settings → Community Plugins**

## Usage

1. Right-click any folder in the file explorer
2. Select **"Als Galerie öffnen"** (Open as Gallery)
3. The gallery opens as a new tab called "Note Gallery"

### Navigation

- **Subfolders** appear at the top with a › chevron and bold name — click to navigate into them
- **Breadcrumb** at the top left shows the current path — click any segment to go back
- **Search field** filters notes and folders live by title
- **+ button** creates a new note in the current folder
- **✕ button** (visible on hover) deletes a note after confirmation

## Settings

| Setting | Default | Description |
|---|---|---|
| Thumbnail size | 72px | Width and height of the image preview (40–160px) |
| Files folder | `Files` | Path to the folder containing images, relative to vault root |
| Sort by | Modified date | Modified date / Created date / Name |
| Date format | German (de-DE) | de-DE / en-US / en-GB |
| Wrap title | Off | Allow long titles to wrap instead of being truncated |

## Image support

The plugin extracts the first image from each note and supports both formats:

```
![[Files/image.png]]        (Obsidian wiki-link style)
![](Files/image.png)        (Standard Markdown style)
```

URL-encoded filenames (e.g. `image%20135.png`) are decoded automatically.

## Frontmatter support

The plugin reads the following frontmatter fields:

```yaml
---
date: 2024-10-13 14:57:15
created: 2024-10-13 14:57:07
categories:
  - Photography
---
```

- `date` or `created` → displayed as the note date
- `categories` or `tags` → first value displayed as `#category`

## Building from source

Requirements: Node.js v18+, npm

```bash
git clone https://github.com/Sh3llingFord/obsidian-note-gallery.git
cd obsidian-note-gallery
npm install --save-dev typescript esbuild obsidian@latest
node esbuild.config.mjs
```

## License

MIT
