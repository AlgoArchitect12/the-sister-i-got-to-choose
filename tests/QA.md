# Public GitHub Pages verification — 27 October 2026

## Current public deployment

- Repository: [AlgoArchitect12/the-sister-i-got-to-choose](https://github.com/AlgoArchitect12/the-sister-i-got-to-choose), verified **PUBLIC**, with `main` as the default branch.
- Website: [The Sister I Got to Choose](https://algoarchitect12.github.io/the-sister-i-got-to-choose/).
- GitHub Pages source: `main`, `/ (root)`, branch-based publishing (`legacy`), with HTTPS enforced and `.nojekyll` for the static files.
- The initial application deployment was verified as **built**, with no build error, at commit `c22d5e01b27e2bbe3406924775e55085c4a0d154`. The subsequent commit updates publication documentation only.

### Publication audit

The Birthday directory had no Git repository, parent repository, remote, or prior Git history. A dedicated repository was initialized inside Birthday, and the preferred repository name was confirmed unused before creation. Its remote was verified before the push. The 32 tracked files include the website, documentation, source tests, `.gitkeep` files, and all 14 intended photographs. Generated `.playwright-mcp/` screenshots/logs were excluded. The public-file audit found no credential-pattern matches or private-key files in the intended upload. `.gitignore` also excludes local environment files, keys, dependencies, and generated test output. Public commits use the authenticated account's GitHub noreply email.

### Live checks actually executed

- `node tests/check.mjs`: **PASS**, including all 14 unique photo registrations matching the real filenames and all existing structural checks.
- GitHub API: repository visibility **public**, default branch **main**, Pages public at the URL above, source **main / (root)**, HTTPS enforced, deployment **built**, and no build error.
- Public HTTP requests: **200** for the homepage, `styles/main.css`, `scripts/config.js`, `scripts/main.js`, and every image from `photo-01.jpg` through `photo-14.jpg`. Image response sizes match all 14 local originals.
- Retained `tests/browser-qa.js` executed against the actual public URL, substituting only the test runner's localhost base: **PASS**. Seven chapters, 14 decoded photographs, four appreciation notes, six letter paragraphs, five letters, three quiz questions, all three discoveries, seven navigation links, opening/skip timers, modal focus handling, cake, confetti, resets, and replay passed. No JavaScript errors, failed responses, failed requests, or unexpected media requests occurred.
- Retained `tests/photo-qa.js` executed against the actual public URL with the same base substitution: **PASS**. All 14 original photographs were individually opened, decoded at their registered dimensions, and reached in full lightbox order with previous/next wraparound, keyboard navigation, close/focus restoration, uncropped aspect ratios, featured finale photograph, lower gallery rows, and replay. No JavaScript errors, image failures, or audio requests occurred.
- Live responsive browser checks passed at 320, 375, 390, 768, 1024, and 1440 pixels. The isolated missing/unreadable/empty-manifest fixtures also passed without altering the deployed files.
- The live HTTPS website was opened in the browser.

### Remaining limits

The recipient name and optional captions remain editable placeholders. Physical devices, Safari, Firefox, and assistive-technology software were not tested. Mobile checks used resized Chromium viewports. The historical audio suite was not executed because this is a photo-only gift.

## Earlier photograph integration record

The following record was written before publication; its statements that nothing had been published describe that earlier stage.

## Current photo-only version

Exactly **14 original files** were found in `assets/images/photos/`: `photo-01.jpg`, `photo-02.jpg`, `photo-03.jpg`, `photo-04.jpg`, `photo-05.jpg`, `photo-06.jpg`, `photo-07.jpg`, `photo-08.jpg`, `photo-09.jpg`, `photo-10.jpg`, `photo-11.jpg`, `photo-12.jpg`, `photo-13.jpg`, and `photo-14.jpg`. No other images were found in that personal-photo folder. All 14 opened successfully in the local image decoder, were visually inspected, and decoded successfully in Chromium. **Failed files: none.**

The originals total 1,936,908 bytes. SHA-256 comparisons against the pre-edit inventory confirm that every original file is unchanged. Filenames, case, extensions, and original orientation were preserved.

### Changes verified

- Registered each actual file once in `scripts/config.js`, with objective alt text, empty editable captions, and measured dimensions. Existing personal messages were left unchanged.
- Retained the existing Polaroid, film, and editorial gallery, with complete natural image proportions in thumbnails, the lightbox, and the finale. The featured finale portrait is `photo-10.jpg`; its deliberate reuse does not create a duplicate gallery entry.
- Fixed the old loaded-thumbnail subset: lightbox navigation now covers the full manifest even before off-screen thumbnails load. The viewer shows `Photo N of 14`, supports both directions and wraparound, and restores gallery focus on close.
- Added a collection count and explicit filename reporting if a future image is missing or unreadable. The original zero-image illustration remains available.
- Hid unused audio controls for the photo-only gift. No soundtrack, playlist, audio dependency, or new audio functionality was added.

### Checks actually executed

- `node tests/check.mjs`: **PASS**, all 14 unique registrations match the actual folder inventory with exact filename case; existing chapter, content, discovery, quiz, navigation, asset, and accessibility checks pass.
- `node --check` for `scripts/main.js`, `scripts/config.js`, `tests/check.mjs`, `tests/browser-qa.js`, `tests/photo-qa.js`, and the retained `tests/media-qa.js`: **PASS**.
- `tests/photo-qa.js` through Playwright against `http://127.0.0.1:8000`: **PASS**. All 14 original photographs were reached in full-set lightbox order, opened individually from their own gallery frame, decoded at their measured dimensions, and checked for uncropped aspect ratios. Next/previous, arrow keys, wraparound, Escape, restored focus, featured finale image, lower gallery rows, and replay passed.
- The same photo suite checked 320, 390, 768, and 1440 pixel viewports without horizontal overflow. Desktop top/lower-gallery, mobile gallery, and photo-14 lightbox screenshots were visually inspected.
- Isolated browser responses simulated a missing file, an unreadable image, and an empty manifest. **PASS**: failed filenames were reported, navigation remained usable, and the zero-photo illustration appeared. No original asset was removed or changed to perform these tests.
- Updated `tests/browser-qa.js`: **PASS**, seven chapters, 14 decoded photographs, four appreciation notes, six letter paragraphs, five envelopes, three quiz questions, all three discoveries, seven navigation links, modal focus handling, opening/skip timers, cake, confetti, quiz reset, and replay. Responsive checks passed at 320, 375, 390, 768, 1024, and 1440 pixels.
- Direct `file://` opening: **PASS**, all 14 original photos decoded and the final photo was reachable as `Photo 14 of 14`.
- Locally simulated GitHub Pages project-subdirectory hosting at `/Birthday/index.html`: **PASS**, all 14 photo URLs resolved under `/Birthday/assets/images/photos/`, decoded, and the last photo remained reachable. This is not a hosted deployment.

The real-photo journeys had **zero JavaScript errors, failed responses, or audio requests**. The missing-file fixture intentionally returned a 404; it caused no uncaught JavaScript error. The historical audio suite was not executed during this photograph-only task; its photo-counter expectations were updated for the full-set viewer.

### Remaining limits

The recipient name remains the neutral placeholder, and captions remain empty for the sender's own words. No songs are planned. Mobile checks used resized Chromium viewports; physical devices, Safari, Firefox, assistive-technology software, and a live GitHub Pages deployment have not been tested. Nothing was committed, pushed, or published.

## Earlier transformation record (historical)

The record below describes the previous version before these 14 photographs were supplied. Its empty-gallery and audio observations are historical, not claims about the current photo-only version.

Tested the transformed existing site in Chromium through Playwright at `http://127.0.0.1:8000`, plus a direct `file://` opening of `index.html`. No packages were installed. Temporary media responses were supplied only inside isolated browser test tabs; no test photos or soundtrack were saved in the gift. The existing cake, cards, quiz, gallery, modal letters, audio instance, and replay were retained.

## Passed

- Open the animated scrapbook/envelope intro, skip it, skip while it is opening, replay, and open it again. Pending intro timers and confetti are cleared.
- Check the seven-chapter narrative order, four configurable appreciation notes, and sisterhood content. The existing quiz is still available inside the sisterhood chapter.
- Tap the cake, extinguish all candles, reveal the wish, and restore the cake and wish on replay.
- Flip all three personality cards in both directions with correct pressed states.
- Open and close all five care-package envelopes. Escape closes the modal and restores focus to its opening button. Keyboard QA exposed a native modal tab-cycle gap; explicit first/last control wrapping now passes the retained regression check.
- Complete all three quiz questions, change a choice before advancing, check per-answer feedback, obtain 3/3, and reset. Next stays disabled until an answer is selected.
- Read all six revised personal-letter paragraphs, reveal the signature, and reset to the first paragraph on replay.
- Navigate through all seven header chapter links and reach the finale, replay, and first-page controls.
- Find all three new keepsakes, use their clues before finding them, reopen found notes from the clue list, verify repeat discoveries do not increase the count, and reset progress on replay. There was no implemented discovery system in the audited baseline; the previous secret decorations were purely decorative.
- Verify the illustrated zero-photo state without image or audio requests.
- Render twelve temporary local image fixtures, all three layouts, captions, labels, a late featured photo, previous/next wraparound, arrow keys, Escape, and restored gallery focus. The featured finale photo loads even before the gallery is visited.
- Omit a failed photo, a remote URL, and a path outside the image folder. Restore the illustrated scrapbook when every configured photo fails.
- Play a temporary valid silent WAV through native browser audio after a real click. Verify volume fade, pause/resume, playback between chapters, replay reset, and exactly one Audio instance and one soundtrack request across replay.
- Keep music visible and honestly off with no configured track. Its quiet fallback produces no media request. An enabled but missing soundtrack keeps that control visible and avoids another request on clicks or replay.
- Simulate an autoplay-policy rejection: show music as off, catch the rejection, and allow a user-initiated retry.
- Check reduced-motion mode: no confetti or CSS animation; all chapters and controls remain usable.
- Test a custom document/cover title, long recipient name, automatic recipient token in the letter, and retained extra friendship messages.
- Verify no horizontal page overflow at 320, 375, 390, 768, 1024, and 1440 pixels for the cover and chapters, including the visible quiet-music status. Visually inspect the desktop cover, letter, appreciation board, sisterhood page, mobile cover, appreciation notes, and clue dialog. The opening button fits fully within a 390 × 844 viewport.
- Direct file opening loads styling, scripts, visible music, and discoveries successfully. A browser route simulating `/Birthday/index.html` confirms scripts and styling resolve within the project subdirectory; this is a local compatibility check, not a hosted deployment.

The completed default site produced no browser JavaScript errors, failed responses, failed requests, or image/audio requests in the core regression suite. The media suite passed valid, missing, and policy-rejected cases: one audio request for valid/missing tracks and zero for the simulated policy refusal. Missing-file fixtures deliberately returned 404 responses without uncaught JavaScript errors. A pause-label timing failure found by the media suite was corrected and the suite rerun successfully.

## Repeatable source checks

Run `node tests/check.mjs` from the project directory. It checks configuration, seven-chapter order, discovery-to-sticker mapping, quiz data, actual configured assets, unique IDs, script targets, navigation targets, required asset folders, local resource references, and accessibility styling hooks. JavaScript syntax was also checked with `node --check` for both source scripts and both browser test files.

`tests/browser-qa.js` and `tests/media-qa.js` retain the executed Playwright assertions as browser-tool entry functions. With the local server running and the site open, pass each file as `filename` to `browser_run_code_unsafe`. They use the supplied Playwright page and require no dependency in this project. The core suite targets the supplied configuration with no photos or audio; the media suite uses isolated transient fixtures and leaves the gift's configuration unchanged.

## Limits

No personal photographs or actual soundtrack were supplied. Retest your own media after adding it. Mobile checks used resized Chromium viewports; physical devices, Safari, Firefox, assistive-technology software, and hosted GitHub Pages have not been tested. Nothing was committed, pushed, or published.
