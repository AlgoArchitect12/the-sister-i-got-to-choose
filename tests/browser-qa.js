// Playwright browser-tool entry function; pass this file to browser_run_code_unsafe.
// It uses the supplied page and the real site, with no added project dependencies.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  const failedResponses = [];
  const failedRequests = [];
  const mediaRequests = [];
  const onError = (error) => errors.push(error.message);
  const onResponse = (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  };
  const onFailedRequest = (request) => failedRequests.push(request.url());
  const onRequest = (request) => {
    if (/\/assets\/(?:audio|images)\//.test(request.url())) mediaRequests.push(request.url());
  };
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://127.0.0.1:8000");
  page.on("pageerror", onError);
  page.on("response", onResponse);
  page.on("requestfailed", onFailedRequest);
  page.on("request", onRequest);
  try {
    await page.reload();
    const content = await page.evaluate(() => ({
      title: window.BIRTHDAY_CONFIG.siteTitle,
      notes: window.BIRTHDAY_CONFIG.appreciation.notes.length,
      letterLines: window.BIRTHDAY_CONFIG.letter.lines.length,
      letters: window.BIRTHDAY_CONFIG.openWhen.length,
      questions: window.BIRTHDAY_CONFIG.quiz.questions.length,
      imageURLs: window.BIRTHDAY_CONFIG.images.map((photo) => new URL(photo.src, document.baseURI).href),
      audioEnabled: window.BIRTHDAY_CONFIG.audio.enabled,
      lastAnswerScore: window.BIRTHDAY_CONFIG.quiz.questions.filter((q) => q.correctIndex === q.answers.length - 1).length,
      eggs: window.BIRTHDAY_CONFIG.easterEggs.map((egg) => ({ id: egg.id, title: egg.title }))
    }));
    assert((await page.title()).includes(content.title), "Editable site title did not reach the document title");
    if (!content.audioEnabled) assert(await page.locator("#music-toggle").isHidden(), "The photo-only gift should hide its unused music control");
    assert(await page.locator("#music-toggle").getAttribute("aria-pressed") === "false", "Music falsely reports playback");
    assert(mediaRequests.every((url) => content.imageURLs.includes(url)), "The gift requested audio or an unconfigured image");

    await page.locator("#open-intro").click();
    await page.locator("#experience").waitFor({ state: "visible" });
    assert(await page.locator("#intro").isHidden(), "Opening did not transition into the book");
    assert(await page.locator(".confetti-piece").count() > 0, "Opening celebration did not produce confetti");
    await page.locator("#replay-button").click();
    await page.locator("#open-intro").click();
    await page.locator("#skip-intro").click();
    await page.locator("#replay-button").click();
    await page.waitForTimeout(3400);
    assert(await page.locator("#intro").isVisible(), "An old intro timer reopened the book after replay");
    assert(await page.locator("#experience").isHidden(), "Replay did not hide the chapters");
    assert(await page.locator(".confetti-piece").count() === 0, "Replay left old celebration particles");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#skip-intro").click();
    const order = await page.locator(".chapter").evaluateAll((nodes) => nodes.map((node) => node.id));
    assert(order.join(",") === "birthday,heart,memories,appreciation,chaos,letters,finale", `Incorrect chapter order: ${order}`);
    assert(await page.locator(".appreciation-note").count() === content.notes, "Appreciation notes differ from configuration");
    assert(await page.locator("#scrapbook-empty").isHidden(), "Real photographs should replace the illustrated fallback");
    assert(await page.locator("#photo-gallery").isVisible(), "Configured photograph gallery is missing");
    assert(await page.locator(".photo-card").count() === content.imageURLs.length, "The gallery omitted or duplicated a configured photograph");
    const decodedPhotos = [];
    for (let i = 0; i < content.imageURLs.length; i += 1) {
      const card = page.locator(".photo-card").nth(i);
      await card.scrollIntoViewIfNeeded();
      await page.waitForFunction((index) => {
        const image = document.querySelectorAll(".photo-card img")[index];
        return image?.complete && image.naturalWidth > 0;
      }, i);
      const source = await card.locator("img").getAttribute("src");
      decodedPhotos.push(new URL(source, page.url()).href);
    }
    assert(decodedPhotos.join("\n") === content.imageURLs.join("\n"), "Decoded gallery images differ from the full manifest");
    assert(new Set(decodedPhotos).size === decodedPhotos.length, "The gallery displays a photograph twice");
    await page.locator(".photo-card").first().click();
    assert(await page.locator("#lightbox-count").textContent() === `Photo 1 of ${content.imageURLs.length}`, "Lightbox did not report the full collection size");
    await page.keyboard.press("Escape");
    assert(await page.locator(".photo-card").first().evaluate((node) => node === document.activeElement), "Gallery lightbox did not restore focus");

    for (let i = 1; i < content.letterLines; i += 1) await page.locator("#letter-continue").click();
    assert(await page.locator(".story-line").count() === content.letterLines, "Personal letter lost configured paragraphs");
    assert(await page.locator("#letter-signoff").isVisible(), "Personal letter signature did not appear");
    await page.locator("#cake-button").click();
    assert(await page.locator("#cake-result").isVisible(), "Cake interaction did not reveal its wish");
    assert(await page.locator("#cake-button").isDisabled(), "Cake should not blow out twice");
    await page.locator("#wish-button").click();
    assert(await page.locator("#wish-message").isVisible(), "Wish button did not reveal its configured message");
    for (const card of await page.locator(".friendship-card").all()) {
      await card.click();
      assert(await card.getAttribute("aria-pressed") === "true", "Personality card did not reveal");
      await card.click();
      assert(await card.getAttribute("aria-pressed") === "false", "Personality card did not turn back");
    }
    const notes = await page.locator(".note-envelope").all();
    assert(notes.length === content.letters, "Open When collection differs from configuration");
    for (let i = 0; i < notes.length; i += 1) {
      await notes[i].click();
      assert(await page.locator("#note-dialog").isVisible(), `Letter ${i + 1} did not open`);
      assert((await page.locator("#note-body").textContent()).trim().length > 0, `Letter ${i + 1} has no message`);
      if (i === 0) {
        for (let tab = 0; tab < 4; tab += 1) {
          await page.keyboard.press("Tab");
          assert(await page.evaluate(() => document.activeElement.closest("dialog")?.id === "note-dialog"), "Keyboard focus escaped the modal letter");
        }
      }
      await page.keyboard.press("Escape");
      assert(await notes[i].evaluate((node) => node === document.activeElement), `Letter ${i + 1} did not restore focus`);
    }
    for (let i = 0; i < content.questions; i += 1) {
      assert(await page.locator("#quiz-next").isDisabled(), `Question ${i + 1} allowed advancing without an answer`);
      await page.locator(".quiz-answer").first().click();
      await page.locator(".quiz-answer").last().click();
      assert((await page.locator("#quiz-feedback").textContent()).trim().length > 0, "Selected quiz answer has no feedback");
      await page.locator("#quiz-next").click();
    }
    assert((await page.locator("#quiz-score").textContent()).startsWith(`${content.lastAnswerScore} / ${content.questions}`), "Quiz result counted changed answers incorrectly");
    await page.locator("#quiz-reset").click();
    assert(await page.locator("#quiz-next").isDisabled(), "Quiz reset left a selected answer");

    assert((await page.locator("#discovery-count").textContent()).trim() === `0 / ${content.eggs.length}`, "Discovery count did not begin empty");
    for (let i = 0; i < content.eggs.length; i += 1) {
      const egg = content.eggs[i];
      const sticker = page.locator(`[data-egg="${egg.id}"]`);
      await page.locator("#discovery-toggle").click();
      await page.locator(".clue-link").nth(i).click();
      assert(await page.locator("#discovery-dialog").isHidden(), "Clue link did not close its dialog");
      assert(await sticker.evaluate((node) => node === document.activeElement), `Clue did not focus sticker ${egg.id}`);
      assert(await page.locator("#note-dialog").isHidden(), "An undiscovered clue opened its reward automatically");
      await sticker.click();
      assert(await page.locator("#note-title").textContent() === egg.title, `Wrong discovery message for ${egg.id}`);
      await page.keyboard.press("Escape");
      assert(await sticker.getAttribute("aria-pressed") === "true", `Sticker ${egg.id} was not marked found`);
      await page.locator("#discovery-toggle").click();
      await page.locator(".clue-link").nth(i).click();
      assert(await page.locator("#note-dialog").isVisible(), "Found clue did not reopen its keepsake");
      await page.keyboard.press("Escape");
      assert((await page.locator("#discovery-count").textContent()).trim() === `${i + 1} / ${content.eggs.length}`, "Repeat discovery increased the count");
    }
    const navigation = await page.locator(".chapter-nav a").all();
    assert(navigation.length === 7, "The book needs seven chapter navigation links");
    for (const link of navigation) {
      const target = await link.getAttribute("href");
      await link.click();
      assert(await page.evaluate(() => location.hash) === target, `Navigation failed for ${target}`);
    }
    await page.locator("#celebrate-button").click();
    assert(await page.locator(".confetti-piece").count() === 0, "Reduced-motion celebration created particles");
    const widths = [320, 375, 390, 768, 1024, 1440];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      assert(size.scroll <= size.client + 1, `Horizontal overflow at ${width}px: ${JSON.stringify(size)}`);
    }
    await page.locator("#replay-button").click();
    assert(await page.locator("#intro").isVisible(), "Final replay did not return to the cover");
    assert(await page.locator(".story-line").count() === 1, "Replay did not reset the personal letter");
    assert(await page.locator(".is-discovered").count() === 0, "Replay left discovered stickers selected");
    assert((await page.locator("#discovery-count").textContent()).trim() === `0 / ${content.eggs.length}`, "Replay did not reset discovery count");
    assert(await page.locator("#cake-button").isEnabled(), "Replay did not restore the cake");
    assert(mediaRequests.every((url) => content.imageURLs.includes(url)), `Unexpected image or audio request: ${mediaRequests.filter((url) => !content.imageURLs.includes(url)).join(", ")}`);
    assert(errors.length === 0, `Browser JavaScript errors: ${errors.join("; ")}`);
    assert(failedResponses.length === 0 && failedRequests.length === 0, `Network failures: ${[...failedResponses, ...failedRequests].join("; ")}`);
    return { passed: true, chapters: order.length, photographsDecoded: decodedPhotos.length, appreciationNotes: content.notes, letterParagraphs: content.letterLines, letters: notes.length, quizQuestions: content.questions, discoveries: content.eggs.length, navigationLinks: navigation.length, responsiveWidths: widths, pageErrors: errors, failedResponses, failedRequests, mediaRequests };
  } finally {
    page.off("pageerror", onError);
    page.off("response", onResponse);
    page.off("requestfailed", onFailedRequest);
    page.off("request", onRequest);
  }
}
