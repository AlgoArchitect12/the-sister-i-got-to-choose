(() => {
  "use strict";

  const config = window.BIRTHDAY_CONFIG;
  if (!config) return;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const name = config.petName?.trim() || config.recipientName?.trim();
  const recipient = name && name !== "[HER NAME]" ? name : "birthday girl";
  const personalize = (text) => String(text).replaceAll("{recipient}", recipient).replaceAll("{sender}", config.senderName);
  const timers = new Set();
  let opening = false;
  let finaleCelebrated = false;
  let letterIndex = 0;
  let quizIndex = 0;
  let quizSelection = null;
  let quizScore = 0;
  let confettiTimer;

  function later(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = personalize(text);
    return node;
  }

  function paragraphs(target, lines, className = "") {
    target.replaceChildren(...lines.map((line) => element("p", className, line)));
  }

  // Only use files inside this gift's asset folders, including on file:// previews.
  function localAsset(value, folder) {
    if (typeof value !== "string" || !value.startsWith(`assets/${folder}/`) || /[\\\u0000-\u001f?#]/.test(value)) return null;
    try {
      const url = new URL(value, document.baseURI);
      const base = new URL(`assets/${folder}/`, document.baseURI);
      return url.href.startsWith(base.href) ? value : null;
    } catch {
      return null;
    }
  }

  $(".recipient-name").forEach((node) => { node.textContent = recipient; });
  const realNameLabel = $("#recipient-real-name");
  if (realNameLabel) {
    realNameLabel.textContent = config.realName || "";
    const realNameWrap = realNameLabel.closest(".recipient-real-name-wrap");
    if (realNameWrap) realNameWrap.hidden = !config.realName;
  }
  $(".sender-name").forEach((node) => { node.textContent = config.senderName; });
  $("#sender-signature").textContent = config.senderSignature;
  $("[data-config='greeting']").textContent = config.greeting;
  $("#ending-heading").textContent = config.ending.heading;
  $(".cover-dedication span:last-child").textContent = `For you, my ${config.nickname}.`;
  paragraphs($("#birthday-description"), config.reveal.description);
  paragraphs($("#finale-messages"), config.ending.messages);
  if (config.letter.heading !== "A friend. A sister. My chosen family.") $("#heart-title").textContent = config.letter.heading;
  $("#quiz-title").setAttribute("aria-label", config.quiz.title);
  if (config.quiz.title !== "The officially unofficial brother exam") $("#quiz-title").textContent = config.quiz.title;
  $("#quiz-subtitle").textContent = config.quiz.subtitle;
  $("#quiz-result-message").textContent = config.quiz.result;
  $("#wish-message").textContent = config.reveal.wish;
  const siteTitle = config.siteTitle?.trim() || "The Sister I Got to Choose";
  document.title = `${siteTitle} · A Birthday Keepsake`;
  const coverTitle = $("#cover-title");
  if (Array.isArray(config.coverTitleLines) && config.coverTitleLines.length) {
    coverTitle.classList.add("cover-title-custom");
    coverTitle.replaceChildren(...config.coverTitleLines.map((line) => {
      const text = typeof line === "string" ? line : line.text;
      const titleLine = element("span", "", text);
      if (typeof line !== "string" && line.emphasis) {
        titleLine.replaceChildren(element("em", "", text));
      }
      return titleLine;
    }));
  } else if (siteTitle !== "The Sister I Got to Choose") {
    coverTitle.textContent = siteTitle;
  }
  $("#site-title-footer").textContent = siteTitle;
  $("#cover-message").textContent = personalize(config.intro.coverMessage);
  if (config.appreciation.heading !== "Things that make you, you.") $("#appreciation-title").textContent = config.appreciation.heading;
  $("#appreciation-intro").textContent = personalize(config.appreciation.intro);
  config.appreciation.notes.forEach((note, index) => {
    const paper = element("article", "appreciation-note");
    const symbol = element("span", "appreciation-symbol", ["✳", "✧", "♡", "↗"][index % 4]);
    symbol.setAttribute("aria-hidden", "true");
    paper.append(element("span", "note-index", `A LITTLE REMINDER / ${String(index + 1).padStart(2, "0")}`), symbol, element("h3", "", note.title), element("p", "", note.message));
    $("#appreciation-notes").append(paper);
  });
  if (config.sisterhood.heading !== "Sister by heart.") $("#sisterhood-title").textContent = config.sisterhood.heading;
  $("#sisterhood-subtitle").textContent = personalize(config.sisterhood.subtitle);
  paragraphs($("#sisterhood-lines"), config.sisterhood.lines);

  function celebrate() {
    if (motion.matches) return;
    const layer = $("#confetti-layer");
    clearTimeout(confettiTimer);
    layer.replaceChildren();
    const colors = ["#ad596a", "#cfad68", "#b0a2ce", "#e6b7a0", "#859b82"];
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 45; i += 1) {
      const piece = element("i", "confetti-piece");
      piece.style.setProperty("--x", `${Math.random() * 100}vw`);
      piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 260}px`);
      piece.style.setProperty("--rotation", `${Math.random() * 900 - 450}deg`);
      piece.style.setProperty("--delay", `${Math.random() * 450}ms`);
      piece.style.setProperty("--color", colors[i % colors.length]);
      fragment.append(piece);
    }
    layer.append(fragment);
    confettiTimer = window.setTimeout(() => layer.replaceChildren(), 3500);
  }

  /* A single optional Audio instance is created only after a genuine click. */
  let audio = null;
  let musicPending = false;
  let musicUnavailable = false;
  let desiredMusic = false;
  let musicGeneration = 0;
  let fadeFrame = 0;
  const audioSettings = config.audio;
  const audioPath = audioSettings.enabled && localAsset(audioSettings.src, "audio");
  const musicButton = $("#music-toggle");
  musicButton.hidden = !audioSettings.enabled;
  const musicStatus = $("#music-status");
  function quietMusic() {
    musicStatus.textContent = "A quiet little celebration for now. ♡";
    musicStatus.hidden = false;
  }

  function musicState(playing) {
    musicButton.setAttribute("aria-pressed", String(playing));
    musicButton.setAttribute("aria-label", playing ? "Pause birthday music" : audioPath && !musicUnavailable ? "Play birthday music" : "Music: a quiet celebration for now");
    $("#music-label").textContent = playing ? "Music on" : audioPath && !musicUnavailable ? "Music off" : "Music";
  }

  function unavailableMusic() {
    musicUnavailable = true;
    desiredMusic = false;
    musicPending = false;
    cancelAnimationFrame(fadeFrame);
    if (audio) audio.pause();
    musicState(false);
    quietMusic();
    $("#audio-status").textContent = "Enjoy your little surprise without music.";
  }

  function fadeMusic() {
    cancelAnimationFrame(fadeFrame);
    const volume = Number.isFinite(audioSettings.volume) ? Math.min(1, Math.max(0, audioSettings.volume)) : 0.35;
    const duration = motion.matches ? 0 : Math.max(0, Number(audioSettings.fadeDuration) || 0);
    const start = performance.now();
    const tick = (now) => {
      if (!desiredMusic || audio.paused) return;
      const progress = duration ? Math.min(1, (now - start) / duration) : 1;
      audio.volume = volume * progress;
      if (progress < 1) fadeFrame = requestAnimationFrame(tick);
    };
    fadeFrame = requestAnimationFrame(tick);
  }

  async function startMusic() {
    if (!audioPath || musicUnavailable || musicPending || (audio && !audio.paused)) return;
    if (!audio) {
      audio = new Audio(audioPath);
      audio.preload = "none";
      audio.loop = Boolean(audioSettings.loop);
      audio.addEventListener("error", unavailableMusic);
      audio.addEventListener("pause", () => musicState(false));
      audio.addEventListener("ended", () => { desiredMusic = false; musicState(false); });
    }
    desiredMusic = true;
    musicPending = true;
    musicButton.disabled = true;
    audio.volume = 0;
    const generation = ++musicGeneration;
    try {
      await audio.play();
      if (generation !== musicGeneration) return;
      if (!desiredMusic) { audio.pause(); return; }
      musicState(true);
      musicStatus.hidden = true;
      $("#audio-status").textContent = "Birthday music is playing.";
      fadeMusic();
    } catch (error) {
      if (generation !== musicGeneration) return;
      musicState(false);
      if (error.name === "NotAllowedError" || error.name === "AbortError") {
        desiredMusic = false;
        $("#audio-status").textContent = "Music is paused. Use the music button to play it.";
      } else unavailableMusic();
    } finally {
      if (generation === musicGeneration) {
        musicPending = false;
        musicButton.disabled = false;
      }
    }
  }

  musicButton.addEventListener("click", () => {
    if (!audioPath || musicUnavailable) quietMusic();
    else if (audio && !audio.paused) {
      desiredMusic = false;
      cancelAnimationFrame(fadeFrame);
      audio.pause();
      musicState(false);
    } else void startMusic();
  });
  musicState(false);

  function enterExperience() {
    timers.forEach(clearTimeout);
    timers.clear();
    $("#intro").hidden = true;
    $("#experience").hidden = false;
    $(".chapter-nav").hidden = false;
    $(".header-note").hidden = true;
    document.body.classList.remove("intro-active");
    window.scrollTo({ top: 0, behavior: "instant" });
    $("#birthday-title").setAttribute("tabindex", "-1");
    $("#birthday-title").focus({ preventScroll: true });
    celebrate();
  }

  $("#open-intro").addEventListener("click", () => {
    if (opening) return;
    opening = true;
    void startMusic();
    $("#intro-envelope").classList.add("is-opening");
    $("#open-intro").disabled = true;
    $("#intro-message").hidden = false;
    $("#intro-line").textContent = config.intro.lines[0] || "A little surprise, just for you.";
    later(() => { $("#intro-line").textContent = config.intro.lines[1] || config.intro.lines[0]; }, motion.matches ? 250 : 1000);
    later(() => { $("#intro-name").textContent = `For you, ${recipient}. ♡`; }, motion.matches ? 500 : 1800);
    later(enterExperience, motion.matches ? 900 : 3200);
  });
  $("#skip-intro").addEventListener("click", () => { void startMusic(); enterExperience(); });

  $("#cake-button").addEventListener("click", () => {
    $("#cake-button").classList.add("is-blown");
    $("#cake-button").setAttribute("aria-label", "Birthday candles blown out. Wish made!");
    $("#cake-button").disabled = true;
    $("#cake-instruction").hidden = true;
    $("#cake-result").hidden = false;
    celebrate();
  });
  $("#wish-button").addEventListener("click", () => {
    $("#wish-message").hidden = false;
    $("#wish-button").setAttribute("aria-expanded", "true");
    celebrate();
  });
  $("#wish-button").setAttribute("aria-controls", "wish-message");
  $("#wish-button").setAttribute("aria-expanded", "false");

  config.friendshipCards.forEach((card, index) => {
    const button = element("button", "friendship-card");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `Reveal ${card.label}`);
    const inner = element("span", "card-inner");
    const front = element("span", "card-front");
    front.append(element("span", "case-number", `CASE FILE / 0${index + 1}`), element("span", "card-icon", card.icon), element("span", "card-label", card.label), element("span", "card-title", card.title), element("span", "card-hint", "Tap to investigate ↗"));
    const back = element("span", "card-back");
    back.setAttribute("aria-hidden", "true");
    back.append(element("span", "card-icon", card.icon), element("span", "card-message", card.message), element("span", "card-hint", "Case closed. Tap to turn back ↻"));
    inner.append(front, back);
    button.append(inner);
    button.addEventListener("click", () => {
      const flipped = button.classList.toggle("is-flipped");
      button.setAttribute("aria-pressed", String(flipped));
      button.setAttribute("aria-label", flipped ? `${card.label}: ${card.message}. Turn card back.` : `Reveal ${card.label}`);
      front.setAttribute("aria-hidden", String(flipped));
      back.setAttribute("aria-hidden", String(!flipped));
    });
    $("#friendship-cards").append(button);
  });
  const extraMessages = [...config.insideJokes, ...config.friendshipMessages];
  if (extraMessages.length) {
    $("#extra-friendship").hidden = false;
    paragraphs($("#extra-friendship"), extraMessages);
  }

  function closeDialog(dialog) { if (dialog.open) dialog.close(); }
  function showDialog(dialog) {
    $$("dialog[open]").forEach(closeDialog);
    dialog.showModal();
  }
  function openNote(title, message, icon, eyebrow = "A LITTLE NOTE, JUST FOR YOU") {
    $("#note-title").textContent = personalize(title);
    $("#note-body").textContent = personalize(message);
    $("#note-icon").textContent = icon;
    $("#note-eyebrow").textContent = eyebrow;
    showDialog($("#note-dialog"));
    document.body.classList.add("dialog-open");
  }
  $$("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => closeDialog(button.closest("dialog"))));
  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")].filter((node) => node.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (first && ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    });
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      $$(".note-envelope.is-opening").forEach((node) => node.classList.remove("is-opening"));
    });
  });
  config.openWhen.forEach((note, index) => {
    const button = element("button", "note-envelope");
    button.type = "button";
    button.setAttribute("aria-label", `Open when ${note.title}`);
    button.setAttribute("aria-haspopup", "dialog");
    button.append(element("span", "note-flap"), element("span", "note-number", `0${index + 1}`), element("span", "note-icon", note.icon), element("span", "note-label", "Open when"), element("strong", "", note.title), element("span", "note-arrow", "↗"));
    button.addEventListener("click", () => {
      button.classList.add("is-opening");
      openNote(`When ${note.title}…`, note.message, note.icon);
    });
    $("#open-when-grid").append(button);
  });

  const discoveries = new Set();
  const eggs = config.easterEggs.filter((egg) => $$('[data-egg]').some((button) => button.dataset.egg === egg.id));
  function updateDiscoveries() {
    $("#discovery-count").textContent = `${discoveries.size} / ${eggs.length}`;
    $("#discovery-summary").textContent = discoveries.size === eggs.length
      ? "You found every little keepsake. Every one is yours to keep. ♡"
      : `${eggs.length} tiny keepsakes are tucked between these pages. Have you found them?`;
    $("#discovery-list").replaceChildren(...eggs.map((egg) => {
      const found = discoveries.has(egg.id);
      const clue = element("li", `discovery-clue${found ? " is-found" : ""}`);
      const mark = element("span", "discovery-mark", found ? "✓" : "✧");
      mark.setAttribute("aria-hidden", "true");
      clue.append(mark, element("h3", "", found ? egg.title : "A little keepsake to find"), element("p", "", found ? "Found. Yours to open again whenever you like." : egg.hint));
      const link = element("button", "clue-link text-button", found ? "Open it again ↗" : "Take a look →");
      link.type = "button";
      link.addEventListener("click", () => {
        closeDialog($("#discovery-dialog"));
        const sticker = $$('[data-egg]').find((button) => button.dataset.egg === egg.id);
        sticker.scrollIntoView({ block: "center", behavior: motion.matches ? "instant" : "smooth" });
        sticker.focus({ preventScroll: true });
        if (found) sticker.click();
      });
      clue.append(link);
      return clue;
    }));
    $$('[data-egg]').forEach((button) => {
      const found = discoveries.has(button.dataset.egg);
      button.classList.toggle("is-discovered", found);
      button.setAttribute("aria-pressed", String(found));
      button.hidden = !eggs.some((egg) => egg.id === button.dataset.egg);
    });
    $("#discovery-toggle").hidden = !eggs.length;
    $("#discovery-summary").hidden = !eggs.length;
  }
  $$('[data-egg]').forEach((button) => button.addEventListener("click", () => {
    const egg = eggs.find((entry) => entry.id === button.dataset.egg);
    if (!egg) return;
    discoveries.add(egg.id);
    updateDiscoveries();
    openNote(egg.title, egg.message, "✧", "A LITTLE DISCOVERY, JUST FOR YOU");
  }));
  $("#discovery-toggle").addEventListener("click", () => showDialog($("#discovery-dialog")));
  updateDiscoveries();

  // Configuration is trusted as text, never as markup or a remote media URL.
  const photos = config.images.map((photo) => ({ ...photo, src: localAsset(photo.src, "images"), loaded: false, failed: false })).filter((photo) => photo.src);
  const preferredPhoto = photos.find((photo) => photo.featured) || photos[0];
  let photoIndex = 0;
  const photoFilename = (photo) => photo.src.split("/").pop();
  function reportPhotoFailure(photo) {
    photo.failed = true;
    photo.button?.remove();
    $("#gallery-errors").hidden = false;
    $("#gallery-errors").textContent = `The browser couldn't read: ${photos.filter((item) => item.failed).map(photoFilename).join(", ")}. Please check the original image files.`;
    if (photos.every((item) => item.failed)) {
      $("#photo-gallery").hidden = true;
      $("#scrapbook-empty").hidden = false;
    }
    updateFinalePhoto();
  }
  function updateFinalePhoto() {
    const available = photos.filter((photo) => photo.loaded && !photo.failed);
    const featured = available.find((photo) => photo.featured) || available[0];
    const target = $("#finale-photo");
    if (!featured) { target.hidden = true; target.replaceChildren(); return; }
    if (target.dataset.src === featured.src) return;
    const image = element("img");
    image.src = featured.src;
    image.alt = featured.alt || featured.caption || "A photograph from our scrapbook";
    image.style.objectPosition = featured.position || "center center";
    image.addEventListener("error", () => { target.hidden = true; }, { once: true });
    target.replaceChildren(image);
    target.dataset.src = featured.src;
    target.hidden = false;
  }
  function showPhoto(index) {
    if (!photos.length) return;
    photoIndex = (index + photos.length) % photos.length;
    const photo = photos[photoIndex];
    $("#lightbox-image").hidden = photo.failed;
    $("#lightbox-image").style.opacity = "0";
    $("#photo-view-status").hidden = false;
    $("#photo-view-status").textContent = photo.failed ? `The browser couldn't read ${photoFilename(photo)}. Please check its image file.` : "Opening photograph…";
    $(".lightbox-picture").setAttribute("aria-busy", String(!photo.failed));
    if (!photo.failed) {
      $("#lightbox-image").src = photo.src;
      if ($("#lightbox-image").complete && $("#lightbox-image").naturalWidth) finishPhotoLoad();
    }
    $("#lightbox-image").alt = photo.alt || photo.caption || "A photograph from our scrapbook";
    $("#lightbox-caption").textContent = [photo.label, photo.caption].filter(Boolean).join(" · ");
    $("#lightbox-count").textContent = `Photo ${photoIndex + 1} of ${photos.length}`;
    $("#photo-prev").disabled = photos.length < 2;
    $("#photo-next").disabled = photos.length < 2;
  }
  photos.forEach((photo, index) => {
    const layout = ["polaroid", "film", "editorial"].includes(photo.layout) ? photo.layout : ["polaroid", "film", "editorial"][index % 3];
    const button = element("button", `photo-card layout-${layout} is-loading`);
    photo.button = button;
    button.type = "button";
    button.disabled = true;
    button.setAttribute("aria-label", `Open photo ${index + 1} of ${photos.length}${photo.caption ? `: ${photo.caption}` : ""}`);
    button.setAttribute("aria-haspopup", "dialog");
    const image = element("img");
    image.alt = photo.alt || photo.caption || `Scrapbook photograph ${index + 1}`;
    image.loading = photo === preferredPhoto ? "eager" : "lazy";
    image.decoding = "async";
    if (Number.isInteger(photo.width) && photo.width > 0 && Number.isInteger(photo.height) && photo.height > 0) {
      image.width = photo.width;
      image.height = photo.height;
    }
    image.style.objectPosition = photo.position || "center center";
    image.style.opacity = "0";
    image.addEventListener("load", () => {
      photo.loaded = true;
      image.style.opacity = "1";
      button.classList.remove("is-loading");
      button.disabled = false;
      updateFinalePhoto();
    }, { once: true });
    image.addEventListener("error", () => {
      reportPhotoFailure(photo);
    }, { once: true });
    image.src = photo.src;
    button.append(image);
    const caption = element("span", "photo-caption");
    caption.append(element("span", "photo-number", `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`));
    if (photo.label) caption.append(element("span", "photo-label", photo.label));
    if (photo.caption) caption.append(element("span", "", photo.caption));
    button.append(caption);
    button.addEventListener("click", () => {
      showPhoto(index);
      showDialog($("#lightbox"));
      document.body.classList.add("dialog-open");
    });
    $("#photo-gallery").append(button);
  });
  if (photos.length) {
    $("#photo-gallery").hidden = false;
    $("#scrapbook-empty").hidden = true;
    $("#gallery-status").hidden = false;
    $("#gallery-status").textContent = `${photos.length} photographs in this collection. Tap any frame to take a closer look.`;
  }
  $("#photo-prev").addEventListener("click", () => showPhoto(photoIndex - 1));
  $("#photo-next").addEventListener("click", () => showPhoto(photoIndex + 1));
  $("#lightbox").addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  function finishPhotoLoad() {
    $("#lightbox-image").style.opacity = "1";
    $("#photo-view-status").hidden = true;
    $(".lightbox-picture").setAttribute("aria-busy", "false");
  }
  $("#lightbox-image").addEventListener("load", finishPhotoLoad);
  $("#lightbox-image").addEventListener("error", () => {
    const photo = photos[photoIndex];
    if (!photo) return;
    reportPhotoFailure(photo);
    $("#lightbox-image").hidden = true;
    $("#photo-view-status").hidden = false;
    $("#photo-view-status").textContent = `The browser couldn't read ${photoFilename(photo)}. Please check its image file.`;
    $(".lightbox-picture").setAttribute("aria-busy", "false");
  });

  const questions = config.quiz.questions.filter((question) => question.question && Array.isArray(question.answers) && question.answers.length > 1);
  function renderQuiz(focus = false) {
    quizSelection = null;
    $("#quiz-playing").hidden = !questions.length;
    $("#quiz-results").hidden = Boolean(questions.length);
    $("#quiz-reset").hidden = !questions.length;
    if (!questions.length) return;
    const question = questions[quizIndex];
    $("#quiz-progress").textContent = `QUESTION ${String(quizIndex + 1).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}`;
    $("#quiz-progress-bar").style.width = `${((quizIndex + 1) / questions.length) * 100}%`;
    $("#quiz-question").textContent = question.question;
    $("#quiz-feedback").textContent = "Pick the answer that feels right.";
    $("#quiz-next").disabled = true;
    $("#quiz-next").textContent = quizIndex === questions.length - 1 ? "The final verdict →" : "Next question →";
    $("#quiz-answers").replaceChildren();
    question.answers.forEach((answer, index) => {
      const button = element("button", "quiz-answer");
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.append(element("span", "answer-letter", String.fromCharCode(65 + index)), element("span", "", answer.text));
      button.addEventListener("click", () => {
        quizSelection = index;
        $$(".quiz-answer").forEach((option, optionIndex) => {
          option.classList.toggle("is-selected", optionIndex === index);
          option.setAttribute("aria-pressed", String(optionIndex === index));
        });
        $("#quiz-feedback").textContent = answer.response || "Answer noted. Your bestie status is looking excellent.";
        $("#quiz-next").disabled = false;
      });
      $("#quiz-answers").append(button);
    });
    if (focus) $("#quiz-question").focus({ preventScroll: true });
  }
  $("#quiz-next").addEventListener("click", () => {
    if (quizSelection === null) return;
    if (quizSelection === questions[quizIndex].correctIndex) quizScore += 1;
    quizIndex += 1;
    if (quizIndex < questions.length) renderQuiz(true);
    else {
      $("#quiz-playing").hidden = true;
      $("#quiz-results").hidden = false;
      $("#quiz-score").textContent = `${quizScore} / ${questions.length} example answers matched. 100% bestie material.`;
      $("#quiz-results h3").setAttribute("tabindex", "-1");
      $("#quiz-results h3").focus({ preventScroll: true });
      celebrate();
    }
  });
  function resetQuiz(focus = false) { quizIndex = 0; quizScore = 0; renderQuiz(focus); }
  $("#quiz-reset").addEventListener("click", () => resetQuiz(true));
  resetQuiz();

  function nextLetterLine() {
    const line = config.letter.lines[letterIndex];
    if (line === undefined) return;
    const paragraph = element("p", "story-line", line);
    $("#letter-story").append(paragraph);
    letterIndex += 1;
    $("#letter-continue").hidden = letterIndex >= config.letter.lines.length;
    $("#letter-signoff").hidden = letterIndex < config.letter.lines.length;
  }
  $("#letter-continue").addEventListener("click", () => {
    nextLetterLine();
    // Keep the next control visible as the letter grows, without moving keyboard focus.
    const target = $("#letter-continue").hidden ? $("#letter-signoff") : $("#letter-continue");
    if (target.getBoundingClientRect().bottom > window.innerHeight - 30) target.scrollIntoView({ block: "center", behavior: motion.matches ? "instant" : "smooth" });
    if ($("#letter-continue").hidden) {
      $("#letter-signoff").setAttribute("tabindex", "-1");
      $("#letter-signoff").focus({ preventScroll: true });
    }
  });
  nextLetterLine();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if ($("#experience").hidden) return;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        if (entry.target.id === "finale" && !finaleCelebrated) { finaleCelebrated = true; celebrate(); }
        if (entry.target.id) $$(".chapter-nav a").forEach((link) => {
          const active = link.hash === `#${entry.target.id}`;
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { threshold: 0.12 });
    $$(".chapter").forEach((chapter) => observer.observe(chapter));
  }
  $("#celebrate-button").addEventListener("click", celebrate);
  $("#replay-button").addEventListener("click", () => {
    timers.forEach(clearTimeout);
    timers.clear();
    clearTimeout(confettiTimer);
    $("#confetti-layer").replaceChildren();
    cancelAnimationFrame(fadeFrame);
    musicGeneration += 1;
    desiredMusic = false;
    musicPending = false;
    musicButton.disabled = false;
    if (audio) {
      audio.pause();
      if (audio.readyState > 0) audio.currentTime = 0;
    }
    musicState(false);
    musicStatus.hidden = true;
    $("#audio-status").textContent = "";
    discoveries.clear();
    updateDiscoveries();
    $$("dialog[open]").forEach(closeDialog);
    opening = false;
    finaleCelebrated = false;
    $("#intro-envelope").classList.remove("is-opening");
    $("#open-intro").disabled = false;
    $("#intro-message").hidden = true;
    $("#intro-line").textContent = "";
    $("#intro-name").textContent = "";
    $("#cake-button").classList.remove("is-blown");
    $("#cake-button").disabled = false;
    $("#cake-button").setAttribute("aria-label", "Blow out the birthday candles");
    $("#cake-instruction").hidden = false;
    $("#cake-result").hidden = true;
    $("#wish-message").hidden = true;
    $("#wish-button").setAttribute("aria-expanded", "false");
    $$(".friendship-card.is-flipped").forEach((button) => button.click());
    resetQuiz();
    letterIndex = 0;
    $("#letter-story").replaceChildren();
    nextLetterLine();
    $("#experience").hidden = true;
    $("#intro").hidden = false;
    $(".chapter-nav").hidden = true;
    $(".header-note").hidden = false;
    document.body.classList.add("intro-active");
    $$(".chapter.in-view").forEach((chapter) => chapter.classList.remove("in-view"));
    $$(".chapter-nav a").forEach((link) => link.removeAttribute("aria-current"));
    window.scrollTo({ top: 0, behavior: "instant" });
    $("#open-intro").focus({ preventScroll: true });
  });
})();
