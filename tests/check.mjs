import assert from "node:assert/strict";
import { readFile, access, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFile(path.join(root, file), "utf8");
const [html, main, configSource, css] = await Promise.all([
  read("index.html"), read("scripts/main.js"), read("scripts/config.js"), read("styles/main.css")
]);
const context = vm.createContext({ window: {} });
new vm.Script(configSource).runInContext(context);
new vm.Script(main);
const config = context.window.BIRTHDAY_CONFIG;
assert.ok(config, "One editable configuration must be present");
assert.equal(config.petName, "Dee", "The recipient pet name must be Dee");
assert.equal(config.recipientName, "Dee", "The visible recipient name must be Dee");
assert.equal(config.realName, "Dhruti Karushkar", "The configured real name must be present");
assert.ok(config.intro.coverMessage.includes("From a stranger to my bestest friend"), "The opening dedication must describe the friendship journey");
assert.ok(Array.isArray(config.coverTitleLines) && config.coverTitleLines.map((line) => typeof line === "string" ? line : line.text).join(" ").includes("bestest friend"), "The expanded cover title must be configured");
for (const key of ["siteTitle", "recipientName", "senderName", "senderSignature", "nickname", "greeting"]) {
  assert.equal(typeof config[key], "string", `${key} must be text`);
}
for (const key of ["insideJokes", "friendshipMessages", "images", "friendshipCards", "openWhen", "easterEggs"]) {
  assert.ok(Array.isArray(config[key]), `${key} must be a list`);
}
assert.equal(config.openWhen.length, 5, "Keep all five care-package letters");
config.openWhen.forEach((note) => assert.ok(note.title && note.message, "Each envelope must contain a real note"));
assert.ok(config.letter.lines.length && config.ending.messages.length, "Letter and finale must contain editable messages");
assert.ok(config.intro.coverMessage && config.appreciation.heading && config.sisterhood.heading, "New chapters need configurable copy");
assert.ok(config.appreciation.notes.length && config.sisterhood.lines.length, "Appreciation and sisterhood must contain editable messages");
config.appreciation.notes.forEach((note) => assert.ok(note.title && note.message, "Every appreciation note needs real content"));
const stickers = [...html.matchAll(/data-egg="([^"]+)"/g)].map((match) => match[1]);
const eggIds = Array.from(config.easterEggs, (egg) => egg.id);
assert.equal(new Set(eggIds).size, eggIds.length, "Easter egg IDs must be unique to count discoveries correctly");
assert.deepEqual([...stickers].sort(), [...eggIds].sort(), "Every configured keepsake must have a real interactive sticker");
config.easterEggs.forEach((egg) => assert.ok(egg.title && egg.message && egg.hint, "Discoveries need a message and an accessible clue"));
const chapters = [...html.matchAll(/<section id="([^"]+)" class="chapter\b/g)].map((match) => match[1]);
assert.deepEqual(chapters, ["birthday", "heart", "memories", "appreciation", "chaos", "letters", "finale"], "Keep the seven requested chapters in their narrative order");
assert.ok(config.quiz.questions.length, "Supply an example quiz");
config.quiz.questions.forEach((question) => {
  assert.ok(question.question && question.answers.length > 1, "Quiz questions need multiple choices");
  assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < question.answers.length, "Quiz answer index must exist");
  question.answers.forEach((answer) => assert.ok(answer.text && answer.response, "Every answer needs its own feedback"));
});
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "HTML IDs must be unique");
for (const match of main.matchAll(/\$\("#([\w-]+)(?:[ "'])/g)) {
  assert.ok(ids.includes(match[1]), `JavaScript target #${match[1]} must exist`);
}
for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
  assert.ok(ids.includes(match[1]), `Navigation target #${match[1]} must exist`);
}
for (const match of html.matchAll(/\b(?:src|href)="((?:scripts|styles)\/[^"]+)"/g)) {
  await access(path.join(root, match[1]));
}
assert.ok(html.indexOf('src="scripts/config.js"') < html.indexOf('src="scripts/main.js"'), "Load configuration before interactions");
assert.ok(!/https?:\/\//.test(html.replace(/data:image\/svg\+xml,[^"]+/g, "")), "The gift must not need remote assets");
assert.ok(!/\b(?:fetch|XMLHttpRequest)\s*\(/.test(main), "Quiz and messages must stay local");
assert.ok(css.includes("prefers-reduced-motion"), "Respect reduced motion");
assert.ok(css.includes("focus-visible"), "Keep keyboard focus visible");
for (const folder of ["images", "audio", "icons"]) await access(path.join(root, "assets", folder, ".gitkeep"));
for (const folder of ["photos", "decorations", "placeholders"]) await access(path.join(root, "assets", "images", folder, ".gitkeep"));
for (const photo of config.images) {
  assert.ok(typeof photo.src === "string" && photo.src.startsWith("assets/images/") && !photo.src.includes(".."), "Photo paths must be local");
  await access(path.join(root, photo.src));
}
const registeredPhotos = Array.from(config.images, (photo) => photo.src);
assert.equal(new Set(registeredPhotos).size, registeredPhotos.length, "Each photograph must have exactly one gallery entry");
const photoFiles = await readdir(path.join(root, "assets", "images", "photos"), { withFileTypes: true });
const suppliedPhotos = photoFiles
  .filter((file) => file.isFile() && /\.(?:jpe?g|png|webp|gif|avif)$/i.test(file.name))
  .map((file) => `assets/images/photos/${file.name}`);
assert.deepEqual([...registeredPhotos].sort(), suppliedPhotos.sort(), "The manifest must include every supplied photograph, with exact filename case and no unrelated assets");
if (config.audio.enabled) {
  assert.ok(config.audio.src.startsWith("assets/audio/") && !config.audio.src.includes(".."), "Soundtrack path must be local");
  await access(path.join(root, config.audio.src));
}
console.log(`PASS: ${registeredPhotos.length} unique photographs match the supplied files; configuration, seven chapters, discoveries, quiz data, content, IDs, navigation, local paths, and accessibility hooks.`);
