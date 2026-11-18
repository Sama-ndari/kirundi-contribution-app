/* Medium mode: translate French prompts (french_prompts.txt) into Kirundi. */
/* exported initMediumMode, submitMediumTranslation, skipMediumSentence, completeMediumMode,
   resetMediumMode, submitMediumTranslations */
"use strict";

const ADVANCE_DELAY_MS = 1000;
const SUCCESS_SHOWN_MS = 1500;
const medium = { prompts: [], index: 0, translations: [], known: new Set(), isAdvancing: false };

async function loadMediumPrompts() {
  const text = await fetchText(CONFIG.frenchPromptsUrl);
  const done = new Set([...getSubmittedFrench(), ...pendingItems("medium", "french")]);
  const prompts = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !done.has(line));
  return shuffle(prompts);
}

async function initMediumMode() {
  hideAllModes();
  ["medium-mode", "loading-medium"].forEach(showElement);
  ["medium-game-ui", "medium-completion-ui", "medium-error", "medium-submit-container"].forEach(hideElement);
  try {
    [medium.prompts, { known: medium.known }] = await Promise.all([loadMediumPrompts(), loadKnownKirundi()]);
  } catch (error) {
    logger.error(`Medium mode: ${CONFIG.frenchPromptsUrl} could not be loaded`, error);
    showMediumError("mediumLoadError");
    return;
  }
  if (medium.prompts.length === 0) {
    showMediumError("mediumNothingLeft");
    return;
  }
  medium.index = 0;
  medium.translations = [];
  hideElement("loading-medium");
  showElement("medium-game-ui");
  showNextFrenchSentence();
}

function showMediumError(key) {
  hideElement("loading-medium");
  setI18n(document.getElementById("medium-error-text"), key);
  showElement("medium-error");
}

function showNextFrenchSentence() {
  medium.isAdvancing = false;
  if (medium.index >= medium.prompts.length) {
    completeMediumMode();
    return;
  }
  document.getElementById("french-sentence").textContent = medium.prompts[medium.index];
  document.getElementById("kirundi-translation").value = "";
  updateMediumProgress();
  hideElement("medium-error-message");
  hideElement("medium-success-message");
}

function submitMediumTranslation() {
  if (medium.isAdvancing) return;
  const kirundi = document.getElementById("kirundi-translation").value.trim();
  if (!kirundi) {
    showMessage("medium-error-message", "kirundiRequired");
    return;
  }
  if (medium.known.has(kirundi)) {
    showMessage("medium-error-message", "alreadyInDatabase");
    return;
  }
  medium.translations.push({ french: medium.prompts[medium.index], kirundi });
  medium.isAdvancing = true;
  medium.index++;
  showMessage("medium-success-message", "translationAdded", SUCCESS_SHOWN_MS);
  setTimeout(showNextFrenchSentence, ADVANCE_DELAY_MS);
}

function skipMediumSentence() {
  if (medium.isAdvancing) return;
  medium.index++;
  showNextFrenchSentence();
}

function updateMediumProgress() {
  document.getElementById("medium-progress-text").textContent = medium.index;
  document.getElementById("medium-count-badge").textContent = medium.translations.length;
  document.getElementById("medium-submit-container").classList.toggle("hidden", medium.translations.length === 0);
}

function completeMediumMode() {
  hideElement("medium-game-ui");
  hideElement("medium-submit-container");
  showElement("medium-completion-ui");
  setBusyButton("submit-medium-button", false, "submitTranslations");
}

function resetMediumMode() {
  Object.assign(medium, { prompts: [], index: 0, translations: [], known: new Set(), isAdvancing: false });
  ["medium-error-message", "medium-success-message", "medium-completion-ui", "medium-submit-container"].forEach(
    hideElement,
  );
  document.getElementById("kirundi-translation").value = "";
}

async function submitMediumTranslations() {
  setBusyButton("submit-medium-button", true);
  const status = await submitContribution("medium", "medium", medium.translations);
  showResultOverlay(status, "sentencesSubmitted");
  setBusyButton("submit-medium-button", false, "submitTranslations");
}
