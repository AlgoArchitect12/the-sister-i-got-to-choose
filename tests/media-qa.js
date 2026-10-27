// Playwright browser-tool entry point; no test media is saved in the gift.
async (page) => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const base = "http://127.0.0.1:8000/";
  const summary = [];
  const sourceConfig = await page.evaluate(() => JSON.stringify(window.BIRTHDAY_CONFIG));
  const silence = Buffer.alloc(32044);
  silence.write("RIFF", 0);
  silence.writeUInt32LE(silence.length - 8, 4);
  silence.write("WAVEfmt ", 8);
  silence.writeUInt32LE(16, 16);
  silence.writeUInt16LE(1, 20);
  silence.writeUInt16LE(1, 22);
  silence.writeUInt32LE(8000, 24);
  silence.writeUInt32LE(16000, 28);
  silence.writeUInt16LE(2, 32);
  silence.writeUInt16LE(16, 34);
  silence.write("data", 36);
  silence.writeUInt32LE(32000, 40);

  for (const mode of ["valid", "missing", "policy"]) {
    const qa = await page.context().newPage();
    const errors = [];
    let audioRequests = 0;
    const remoteRequests = [];
    qa.on("pageerror", (error) => errors.push(error.message));
    qa.on("request", (request) => {
      if (!request.url().startsWith(base)) remoteRequests.push(request.url());
    });
    try {
      await qa.setViewportSize({ width: 390, height: 844 });
      await qa.emulateMedia({ reducedMotion: "reduce" });
      await qa.addInitScript((mode) => {
        window.__audioCount = 0;
        window.Audio = new Proxy(window.Audio, {
          construct(Target, args) {
            const audio = new Target(...args);
            window.__audio = audio;
            window.__audioCount += 1;
            return audio;
          }
        });
        if (mode === "policy") {
          window.__attempts = 0;
          HTMLMediaElement.prototype.play = function () {
            window.__attempts += 1;
            return Promise.reject(new DOMException("QA policy refusal", "NotAllowedError"));
          };
        }
      }, mode);
      const images = mode === "valid" ? Array.from({ length: 12 }, (_, index) => ({
        src: `assets/images/photos/qa-${index}.svg`, alt: `QA illustration ${index}`,
        caption: `QA caption ${index}`, label: `QA label ${index}`,
        layout: ["polaroid", "film", "editorial"][index % 3], featured: index === 11
      })) : [{ src: "assets/images/photos/qa-missing.svg" }];
      if (mode === "valid") images.push(
        { src: "assets/images/photos/qa-missing.svg" },
        { src: "https://example.com/never-request.svg" },
        { src: "assets/images/../never-request.svg" }
      );
      await qa.route("**/scripts/config.js", async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response, body: await response.text() + "\nObject.assign(window.BIRTHDAY_CONFIG," + JSON.stringify({
          siteTitle: "A custom birthday keepsake", recipientName: "A wonderfully long birthday name",
          images, audio: { enabled: true, src: "assets/audio/qa-silence.wav", volume: .25, fadeDuration: 100, loop: true }
        }) + ");" });
      });
      await qa.route("**/assets/images/photos/qa-*.svg", (route) => route.request().url().includes("missing")
        ? route.fulfill({ status: 404, body: "Intentional QA missing photograph" })
        : route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#ded5b8"/><circle cx="150" cy="150" r="70" fill="#bd8593"/></svg>' }));
      await qa.route("**/assets/audio/qa-silence.wav", (route) => {
        audioRequests += 1;
        return mode === "missing"
          ? route.fulfill({ status: 404, body: "Intentional QA missing soundtrack" })
          : route.fulfill({ contentType: "audio/wav", body: silence });
      });
      await qa.goto(base);
      check(await qa.evaluate(() => window.__audioCount) === 0, "No Audio instance before interaction");
      check(audioRequests === 0, "No soundtrack request before interaction");
      check(await qa.title() === "A custom birthday keepsake · A Birthday Keepsake", "Custom title reaches browser title");
      check(await qa.locator("#cover-title").textContent() === "A custom birthday keepsake", "Custom cover title");
      check(await qa.locator("#music-toggle").isVisible(), "Configured music control stays visible");
      if (mode === "valid") {
        await qa.locator("#finale-photo img").waitFor({ state: "attached" });
        check((await qa.locator("#finale-photo img").getAttribute("src")).endsWith("qa-11.svg"), "Late featured image is loaded before visiting the gallery");
      }
      await qa.locator("#skip-intro").click();
      check((await qa.locator(".story-line").first().textContent()).includes("A wonderfully long birthday name"), "Letter name placeholder");
      check(await qa.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), "Custom title and name do not overflow mobile");

      if (mode === "valid") {
        await qa.waitForFunction(() => document.querySelector("#music-toggle").getAttribute("aria-pressed") === "true");
        await qa.waitForTimeout(150);
        check(await qa.evaluate(() => !window.__audio.paused && window.__audio.volume > 0), "Native playback and volume fade");
        await qa.locator('.chapter-nav a[href="#letters"]').click();
        check(await qa.evaluate(() => !window.__audio.paused), "Music survives chapter navigation");
        for (let index = 0; index < 12; index += 1) {
          await qa.locator(".photo-card").nth(index).scrollIntoViewIfNeeded();
          await qa.waitForFunction((index) => !document.querySelectorAll(".photo-card")[index]?.disabled, index);
        }
        await qa.locator(".photo-card").last().scrollIntoViewIfNeeded();
        await qa.waitForFunction(() => document.querySelectorAll(".photo-card").length === 12);
        await qa.locator(".photo-card").first().click();
        check(await qa.locator("#lightbox-count").textContent() === "Photo 1 of 13", "Lightbox retains the complete configured set");
        await qa.keyboard.press("ArrowLeft");
        check(await qa.locator("#lightbox-count").textContent() === "Photo 13 of 13", "Previous wraps to the missing-file entry");
        check((await qa.locator("#photo-view-status").textContent()).includes("qa-missing.svg"), "Missing-file entry is reported explicitly");
        await qa.locator("#photo-next").click();
        check(await qa.locator("#lightbox-count").textContent() === "Photo 1 of 13", "Next wraps");
        await qa.keyboard.press("Escape");
        check(await qa.locator(".photo-card").first().evaluate((node) => node === document.activeElement), "Gallery focus restored");
        await qa.locator("#music-toggle").click();
        check(await qa.locator("#music-toggle").getAttribute("aria-pressed") === "false", "Music pauses");
        await qa.locator("#music-toggle").click();
        await qa.waitForFunction(() => document.querySelector("#music-toggle").getAttribute("aria-pressed") === "true");
      } else if (mode === "missing") {
        await qa.locator("#music-status").waitFor({ state: "visible" });
        await qa.locator("#scrapbook-empty").waitFor({ state: "visible" });
        check(await qa.locator("#music-toggle").isVisible(), "Missing audio does not hide the control");
        check(await qa.locator("#music-toggle").getAttribute("aria-pressed") === "false", "Missing audio never claims playback");
        await qa.locator("#music-toggle").click();
        check(audioRequests === 1, "Missing audio is not requested again by its control");
      } else {
        await qa.waitForFunction(() => !document.querySelector("#music-toggle").disabled);
        check(await qa.locator("#music-toggle").getAttribute("aria-pressed") === "false", "Autoplay refusal shows off");
        await qa.locator("#music-toggle").click();
        check(await qa.evaluate(() => window.__attempts) === 2, "Policy refusal permits an explicit retry");
      }
      await qa.locator("#replay-button").click();
      if (mode === "valid") check(await qa.evaluate(() => window.__audio.paused && window.__audio.currentTime === 0), "Replay resets soundtrack");
      await qa.locator("#skip-intro").click();
      if (mode === "valid") {
        await qa.waitForFunction(() => document.querySelector("#music-toggle").getAttribute("aria-pressed") === "true");
        check(await qa.evaluate(() => window.__audioCount) === 1, "Replay uses one Audio instance");
      }
      if (mode === "missing") check(audioRequests === 1, "Missing audio is not requested again on replay");
      check(errors.length === 0, `${mode}: ${errors.join("; ")}`);
      check(remoteRequests.length === 0, "Remote photo URLs must not be requested");
      summary.push({ mode, passed: true, audioRequests, errors });
    } finally {
      await qa.close();
    }
  }
  check(await page.evaluate(() => JSON.stringify(window.BIRTHDAY_CONFIG)) === sourceConfig, "Test fixtures must not alter the actual gift configuration");
  return summary;
}
