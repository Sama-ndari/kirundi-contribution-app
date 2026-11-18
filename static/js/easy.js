/* Easy mode: translate Kirundi sentences of the public dataset into French. */
/* exported initEasyMode, approveEasySuggestion, startManualEdit, nextEasyPhrase, skipEasyPhrase,
   showCompletion, resetEasyMode, toggleCorrectionBox, submitEasyTranslations */
"use strict";

const easy = { phrases: [], index: 0, translations: [] };

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** A random batch among the shortest untranslated sentences this browser has not sent yet. */
async function loadEasyPhrases() {
  const done = new Set([...getSubmittedKirundi(), ...pendingItems("easy", "original_kirundi")]);
  const available = (await loadPublicRows()).filter((row) => !row.french && !done.has(row.kirundi));
  shuffle(available).sort((a, b) => a.kirundi.length - b.kirundi.length);
  return shuffle(available.slice(0, CONFIG.easyShortestPool)).slice(0, CONFIG.easyBatchSize);
}

async function initEasyMode() {
  hideAllModes();
  ["easy-mode", "loading-easy"].forEach(showElement);
  ["game-ui", "completion-ui", "easy-error", "easy-submit-container"].forEach(hideElement);
  try {
    easy.phrases = await loadEasyPhrases();
  } catch (error) {
    logger.error("Easy mode: public dataset could not be loaded", error);
    showEasyError("easyLoadError");
    return;
  }
  if (easy.phrases.length === 0) {
    showEasyError("easyNothingLeft");
    return;
  }
  easy.index = 0;
  easy.translations = [];
  hideElement("loading-easy");
  showElement("game-ui");
  showNextEasyPhrase();
}

function showEasyError(key) {
  hideElement("loading-easy");
  setI18n(document.getElementById("easy-error-message"), key);
  showElement("easy-error");
}

function showNextEasyPhrase() {
  if (easy.index >= easy.phrases.length) {
    showCompletion();
    return;
  }
  updateEasyProgress();
  const phrase = easy.phrases[easy.index];
  document.getElementById("kirundi-phrase").textContent = phrase.kirundi;
  document.getElementById("french-input").value = "";
  const hasSuggestion = Boolean(phrase.suggestion);
  document.getElementById("ai-suggestion-text").textContent = phrase.suggestion;
  document.getElementById("ai-suggestion-msg").classList.toggle("hidden", !hasSuggestion);
  document.getElementById("validation-ui").classList.toggle("hidden", !hasSuggestion);
  document.getElementById("french-input-container").classList.toggle("hidden", hasSuggestion);
  hideElement("error-message");
  resetCorrectionBox();
}

function updateEasyProgress() {
  document.getElementById("progress-text").textContent = easy.index;
  document.getElementById("easy-count-badge").textContent = easy.translations.length;
  document.getElementById("easy-submit-container").classList.toggle("hidden", easy.translations.length === 0);
}

/** ai_approved / ai_edited / human: lets reviewers and training tell machine text from human text. */
function translationOrigin(phrase, french) {
  if (!phrase.suggestion) return "human";
  const compact = (text) => text.split(/\s+/).join(" ").trim();
  return compact(french) === compact(phrase.suggestion) ? "ai_approved" : "ai_edited";
}

function recordEasyTranslation(french) {
  const phrase = easy.phrases[easy.index];
  easy.translations.push({
    original_kirundi: phrase.kirundi,
    corrected_kirundi: document.getElementById("correction-box").value.trim() || phrase.kirundi,
    french_translation: french,
    origin: translationOrigin(phrase, french),
  });
  easy.index++;
  showNextEasyPhrase();
  updateEasyProgress();
}

function approveEasySuggestion() {
  recordEasyTranslation(easy.phrases[easy.index].suggestion);
}

function startManualEdit() {
  const input = document.getElementById("french-input");
  hideElement("validation-ui");
  showElement("french-input-container");
  input.value = easy.phrases[easy.index].suggestion || "";
  input.focus();
}

function nextEasyPhrase() {
  const french = document.getElementById("french-input").value.trim();
  if (!french) {
    showMessage("error-message", "translationRequired", 0);
    return;
  }
  recordEasyTranslation(french);
}

function skipEasyPhrase() {
  easy.index++;
  showNextEasyPhrase();
}

function showCompletion() {
  hideElement("game-ui");
  hideElement("easy-submit-container");
  showElement("completion-ui");
  setBusyButton("submit-easy-button", false, "submitTranslations");
}

function resetEasyMode() {
  easy.index = 0;
  easy.translations = [];
  easy.phrases = [];
  ["error-message", "completion-ui", "easy-submit-container"].forEach(hideElement);
  document.getElementById("french-input").value = "";
  resetCorrectionBox();
}

function toggleCorrectionBox() {
  const container = document.getElementById("correction-container");
  const isOpening = container.classList.contains("hidden");
  container.classList.toggle("hidden", !isOpening);
  setI18n(document.getElementById("report-problem-text"), isOpening ? "cancelCorrection" : "reportProblem");
  if (!isOpening) return;
  const box = document.getElementById("correction-box");
  box.value = document.getElementById("kirundi-phrase").textContent;
  box.focus();
}

function resetCorrectionBox() {
  hideElement("correction-container");
  document.getElementById("correction-box").value = "";
  setI18n(document.getElementById("report-problem-text"), "reportProblem");
}

async function submitEasyTranslations() {
  setBusyButton("submit-easy-button", true);
  const status = await submitContribution("easy", "easy", easy.translations);
  showResultOverlay(status, "translationsSubmitted");
  setBusyButton("submit-easy-button", false, "submitTranslations");
}
