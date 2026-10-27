# The sister I got to choose 💗

A birthday keepsake for a friend who feels like a sister. Built on the existing HTML, CSS, and vanilla JavaScript site; no installation, build step, account, or backend is needed.

## Preview

Open `index.html` directly in a modern browser. All site paths are relative, so it also works in a GitHub Pages project subdirectory.

For a local HTTP preview, open a terminal in `Birthday` and run:

```sh
python -m http.server 8000
```

Visit `http://localhost:8000`. Stop the server with Ctrl+C. No files are uploaded by this command.

## Files

```text
Birthday/
├── index.html
├── README.md
├── styles/main.css
├── scripts/
│   ├── config.js         # All editable personal content
│   └── main.js           # Interactions, gallery, discoveries, and quiz
├── assets/
│   ├── images/
│   │   ├── photos/      # All 14 supplied original photographs
│   │   ├── decorations/ # Optional local decorative artwork
│   │   └── placeholders/# Optional replacement artwork; CSS art works without it
│   ├── audio/           # Retained unused folder; no soundtrack in this gift
│   └── icons/.gitkeep
└── tests/
    ├── check.mjs        # Dependency-free project checks
    ├── browser-qa.js    # Core Playwright browser-tool assertions
    ├── photo-qa.js      # Full-set photograph/lightbox browser assertions
    ├── media-qa.js      # Retained historical photo/audio test; outside this scope
    └── QA.md            # Browser verification record and limits
```

The seven chapters are the opening surprise and cake, a letter from me, our memory book, appreciation notes, sister by heart, Open When letters, and the birthday finale. The existing quiz and playful personality cards remain in the sisterhood chapter. Existing chapter links such as `#birthday`, `#heart`, `#memories`, `#chaos`, `#quiz`, `#letters`, and `#finale` remain available.

## Personalize the gift

Edit **`scripts/config.js`** in a text editor. Keep the JavaScript quotes, commas, and brackets intact, then refresh the browser.

- Set `siteTitle` to change the website title and cover wording.
- Set `recipientName` to her name. `[HER NAME]` is deliberately unconfigured; the page uses a friendly fallback until you change it.
- Set `senderName`, `senderSignature`, and `nickname` as desired.
- Change `intro.coverMessage`, `intro.lines`, `greeting`, `reveal.description`, and `reveal.wish` for the opening and birthday chapter.
- Edit `friendshipCards`, `openWhen`, and `letter.lines` for the jokes, five notes, and personal letter.
- Edit `appreciation.heading`, `appreciation.intro`, and `appreciation.notes` for the appreciation collection. Each note has a `title` and `message`.
- Edit `sisterhood.heading`, `sisterhood.subtitle`, and `sisterhood.lines` for the sister-by-heart chapter.
- Edit each entry's `title`, `message`, and `hint` in `easterEggs` for the three discoveries. Keep their `id` values so the stickers keep working.
- Add strings to `insideJokes` or `friendshipMessages` if you want extra personal notes. Both lists start empty.
- Edit `ending.heading` and `ending.messages` for the finale.

The supplied jokes and quiz scenarios are editable examples. No real shared memories, private jokes, photographs, or dates have been invented.

Use `{recipient}` and `{sender}` in letter paragraphs to insert the configured names automatically. They are displayed as plain text.

### Little discoveries

Three tappable keepsakes hide small notes: the pressed flower in the memory book, the sisterhood seal, and the finale's lucky star. Use the discovery control to see hints and your progress. The controls work by keyboard as well as touch. Finding the same keepsake again does not increase the count; Replay resets discoveries for a fresh visit. Progress stays in the current page session and is not sent anywhere.

### Quiz

Edit `quiz.questions`. Each question has `question`, an `answers` list, and `correctIndex`. Each answer has `text` and its own playful `response`. Indices begin at zero: `correctIndex: 3` means the fourth answer. Add or remove questions as needed. The result stays friendly regardless of the score; edit `quiz.result` to change it.

Answers stay in the current page session and are not sent to a service. Reset Quiz starts again; Replay Experience resets the whole gift.

## The 14 photographs

All supplied originals are in **`assets/images/photos/`**. The complete inventory is:

| Photographs 1–7 | Photographs 8–14 |
| --- | --- |
| `photo-01.jpg` | `photo-08.jpg` |
| `photo-02.jpg` | `photo-09.jpg` |
| `photo-03.jpg` | `photo-10.jpg` |
| `photo-04.jpg` | `photo-11.jpg` |
| `photo-05.jpg` | `photo-12.jpg` |
| `photo-06.jpg` | `photo-13.jpg` |
| `photo-07.jpg` | `photo-14.jpg` |

Each file has one entry in the `images` array in **`scripts/config.js`**. This manifest is the source of truth; the browser does not scan your folders. Keep filename case and extensions exactly as supplied.

The existing memory-book gallery displays all 14 photographs in varied Polaroid, film, and editorial frames. Thumbnails load as you approach them, including the lower rows. Open any photo for the full-set lightbox with a position counter, previous/next buttons, arrow keys, and Escape to close. Navigation can reach the whole set even before every thumbnail has loaded. Controls also work by touch.

Images keep their original aspect ratios and orientation without stretching or cropping. `photo-10.jpg` is also used as the featured finale photograph; that deliberate reuse is not a duplicate entry in the gallery. The original files are not modified.

### Replace a photograph or edit its caption

- To replace one photo without editing application logic, replace its file in `assets/images/photos/` using the same exact filename. Keep a backup of the original if you want to retain it.
- To use a different filename, put the new file in that folder and update only the matching entry's `src` in `scripts/config.js`. Remove an old entry only when you intend to remove that photograph from the gift.
- If a replacement has different dimensions, update its `width` and `height` values to the new pixel dimensions. These values reserve space while thumbnails load; the browser displays the complete original image.
- Edit `caption` for the handwritten caption. Captions currently start empty; no events, dates, locations, or personal stories have been invented.
- Edit `alt` to describe what is actually visible for accessibility. `label` is optional for a date or memory label you supply.
- Set `featured: true` on your preferred finale photo and remove that flag from the previous choice.

For example, an individual manifest entry looks like this:

```js
{
  src: "assets/images/photos/photo-01.jpg",
  alt: "Describe what is actually in this photograph",
  caption: "",
  layout: "polaroid"
}
```

Use local relative paths and avoid duplicate `src` entries. The gallery can support a different number later; keep the manifest and the intended photo folder consistent, then rerun the checks.

Keep this gift's photo registrations in `assets/images/photos/` so the inventory check can verify every supplied file. `decorations/` and `placeholders/` are optional asset locations, not folders the browser scans or imports automatically. The fallback scrapbook artwork is made with CSS and does not need image files.

With `images: []`, the original illustrated scrapbook remains available. Missing or unreadable configured photos are reported by filename instead of being silently omitted. Check the reported path and file before publishing; there are no stock substitutes or remote photo requests.

This is a photo-only gift: no soundtrack is added, audio remains disabled, and its unused control is hidden. The existing dormant audio code and folder are retained.

## Personalization checklist

- [ ] Set the title, recipient name, and your signature in `scripts/config.js`.
- [ ] Replace the editable example jokes, quiz answers, letter, and appreciation notes with your own words.
- [x] Place and register all 14 supplied photographs in `assets/images/photos/`.
- [ ] Add your own captions or leave them empty.
- [ ] Preview the gift, check every photo in the lightbox, then publish only when ready.

## Checks

With Node.js available, run the dependency-free checks from the project directory:

```sh
node tests/check.mjs
```

The source check compares the photo manifest with the actual filenames in `assets/images/photos/` and rejects duplicate paths or missing registrations. It also retains the chapter, content, navigation, and asset checks.

Check the actual page in desktop and narrow mobile layouts: view every photograph, navigate the full lightbox set, open and skip the intro, blow out the candles, read the letter, explore appreciation notes, reveal each personality card, find all three keepsakes, open all five notes, finish and reset the quiz, reach the finale, and replay. Reduced-motion preferences are supported.

See [tests/QA.md](tests/QA.md) for the completed browser checks and their limits. Browser-tool screenshots and logs in `.playwright-mcp/` are development artifacts and are excluded by `.gitignore`; they are not needed for hosting.

`tests/browser-qa.js` and `tests/photo-qa.js` are entry functions for an available Playwright browser tool, not standalone Node.js runners. See the QA record for executed results. `tests/media-qa.js` is retained from the earlier audio-capable version and is not part of this photograph-only task. No packages or build tools are added to the gift.

## Publish with GitHub Pages

Publication is a separate manual step; this project has not been committed, pushed, or deployed.

1. Create a GitHub repository for this gift and upload the project files, with `index.html` at the repository root.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select your branch and **/ (root)**, then save.
4. Wait for GitHub's deployment and open the URL shown in Pages settings.

No credentials or environment variables belong in these files. GitHub Pages makes the published site and its assets accessible to visitors; only publish photographs and personal messages you are comfortable sharing. Keep a private local copy if the gift should remain private.
