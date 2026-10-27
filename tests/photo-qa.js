// Playwright browser-tool entry function. Uses the 14 real files; never alters them.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const base = "http://127.0.0.1:8000/";
  const errors = [];
  const networkFailures = [];
  const audioRequests = [];
  const onError = (error) => errors.push(error.message);
  const onResponse = (response) => {
    if (response.status() >= 400) networkFailures.push(`${response.status()} ${response.url()}`);
  };
  const onRequest = (request) => {
    if (request.url().includes("/assets/audio/")) audioRequests.push(request.url());
  };
  page.on("pageerror", onError);
  page.on("response", onResponse);
  page.on("request", onRequest);
  try {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base);
    const photos = await page.evaluate(() => window.BIRTHDAY_CONFIG.images);
    assert(photos.length === 14, "Expected all 14 supplied photographs in the manifest");
    assert(new Set(photos.map((photo) => photo.src)).size === 14, "Duplicate manifest photograph");
    assert(await page.locator("#music-toggle").isHidden(), "Photo-only gift should not show a music control");
    await page.locator("#skip-intro").click();
    assert(await page.locator(".photo-card").count() === 14, "Gallery omitted a configured photograph");
    assert(await page.locator("#scrapbook-empty").isHidden(), "Real photographs were replaced with placeholders");

    // Open the full collection before scrolling through the lazy thumbnails.
    await page.locator(".photo-card").first().click();
    for (let index = 0; index < photos.length; index += 1) {
      await page.waitForFunction((src) => {
        const image = document.querySelector("#lightbox-image");
        return image.getAttribute("src") === src && image.complete && image.naturalWidth > 0;
      }, photos[index].src);
      assert(await page.locator("#lightbox-count").textContent() === `Photo ${index + 1} of 14`, `Incorrect position for ${photos[index].src}`);
      const image = await page.locator("#lightbox-image").evaluate((node) => ({
        width: node.naturalWidth, height: node.naturalHeight, fit: getComputedStyle(node).objectFit
      }));
      assert(image.width === photos[index].width && image.height === photos[index].height, `Unexpected decoded dimensions: ${photos[index].src}`);
      assert(image.fit === "contain", `Lightbox crops ${photos[index].src}`);
      await page.locator("#photo-next").click();
    }
    assert(await page.locator("#lightbox-count").textContent() === "Photo 1 of 14", "Next did not wrap after the last photograph");
    await page.keyboard.press("ArrowLeft");
    assert(await page.locator("#lightbox-count").textContent() === "Photo 14 of 14", "Previous did not wrap to the final photograph");
    await page.keyboard.press("ArrowRight");
    assert(await page.locator("#lightbox-count").textContent() === "Photo 1 of 14", "Arrow navigation failed");
    await page.keyboard.press("Escape");
    assert(await page.locator(".photo-card").first().evaluate((node) => node === document.activeElement), "Lightbox did not restore gallery focus");

    const visited = [];
    for (let index = 0; index < photos.length; index += 1) {
      const card = page.locator(".photo-card").nth(index);
      await card.scrollIntoViewIfNeeded();
      await page.waitForFunction((src) => {
        const image = [...document.querySelectorAll(".photo-card img")].find((node) => node.getAttribute("src") === src);
        return image?.complete && image.naturalWidth > 0;
      }, photos[index].src);
      await card.click();
      assert(await page.locator("#lightbox-image").getAttribute("src") === photos[index].src, `Wrong gallery-to-viewer mapping: ${photos[index].src}`);
      await page.keyboard.press("Escape");
      visited.push(photos[index].src.split("/").pop());
    }
    const ratios = await page.locator(".photo-card img").evaluateAll((images) => images.map((image) => ({
      src: image.getAttribute("src"), natural: image.naturalWidth / image.naturalHeight,
      displayed: image.clientWidth / image.clientHeight, fit: getComputedStyle(image).objectFit
    })));
    ratios.forEach((image) => assert(Math.abs(image.displayed - image.natural) < .015 && image.fit === "contain", `Thumbnail distorted or cropped: ${image.src}`));
    const featured = photos.find((photo) => photo.featured);
    assert(await page.locator("#finale-photo img").getAttribute("src") === featured.src, "Configured finale photograph missing");
    assert(await page.locator("#gallery-errors").isHidden(), "A real photograph failed to load");

    const widths = [320, 390, 768, 1440];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `Horizontal overflow at ${width}px`);
    }
    await page.locator("#replay-button").click();
    await page.locator("#skip-intro").click();
    assert(await page.locator(".photo-card").count() === 14, "Replay changed the gallery count");
    await page.locator(".photo-card").last().click();
    assert(await page.locator("#lightbox-count").textContent() === "Photo 14 of 14", "Last photo became unreachable after replay");
    await page.keyboard.press("Escape");
    assert(errors.length === 0, `JavaScript errors: ${errors.join("; ")}`);
    assert(networkFailures.length === 0, `Photo path failures: ${networkFailures.join("; ")}`);
    assert(audioRequests.length === 0, "The photo-only gift requested audio");

    // Deliberate missing and unreadable-file responses test reporting without touching originals.
    for (const mode of ["missing", "unreadable", "empty"]) {
      const qa = await page.context().newPage();
      const fixtureErrors = [];
      qa.on("pageerror", (error) => fixtureErrors.push(error.message));
      try {
        await qa.emulateMedia({ reducedMotion: "reduce" });
        await qa.route("**/scripts/config.js", async (route) => {
          const response = await route.fetch();
          await route.fulfill({ response, body: await response.text() + (mode === "empty" ? "\nwindow.BIRTHDAY_CONFIG.images = [];" : "") });
        });
        if (mode !== "empty") await qa.route("**/assets/images/photos/photo-01.jpg", (route) => route.fulfill({
          status: mode === "missing" ? 404 : 200,
          contentType: "image/jpeg", body: "Intentional QA unreadable photograph response"
        }));
        await qa.goto(base);
        await qa.locator("#skip-intro").click();
        if (mode === "empty") {
          assert(await qa.locator("#scrapbook-empty").isVisible(), "Zero-image fallback broken");
          assert(await qa.locator("#photo-gallery").isHidden(), "Empty image grid should be hidden");
        } else {
          await qa.locator("#memories").scrollIntoViewIfNeeded();
          await qa.locator("#gallery-errors").waitFor({ state: "visible" });
          assert((await qa.locator("#gallery-errors").textContent()).includes("photo-01.jpg"), `${mode} filename not reported`);
          await qa.getByRole("button", { name: "Open photo 2 of 14", exact: true }).click();
          await qa.keyboard.press("ArrowLeft");
          assert((await qa.locator("#photo-view-status").textContent()).includes("photo-01.jpg"), "Viewer concealed the failed file");
          await qa.locator("#photo-next").click();
          assert(await qa.locator("#lightbox-count").textContent() === "Photo 2 of 14", "Failed image trapped navigation");
        }
        assert(fixtureErrors.length === 0, `${mode} fixture caused JavaScript errors`);
      } finally { await qa.close(); }
    }
    return { passed: true, registered: photos.length, individuallyViewed: visited, responsiveWidths: widths, failureCases: ["missing", "unreadable", "empty"], errors, networkFailures, audioRequests };
  } finally {
    page.off("pageerror", onError);
    page.off("response", onResponse);
    page.off("request", onRequest);
  }
}
