/* Hard mode: contributors write their own Kirundi + French sentence pairs. */
/* exported initHardMode, addHardSentence, resetHardMode, submitHardSentences */
"use strict";

const PAIR_ADDED_SHOWN_MS = 3000;
const hard = { sentences: [], known: new Set() };

async function initHardMode() {
  hideAllModes();
  showElement("hard-mode");
  resetHardMode();
  showElement("loading-hard");
  hideElement("hard-game-ui");
  const { known, isAvailable } = await loadKnownKirundi();
  hard.known = known;
  hideElement("loading-hard");
  showElement("hard-game-ui");
  if (!isAvailable) showMessage("hard-error-message", "duplicateCheckOff", 0);
}

function addHardSentence() {
  const kirundiInput = document.getElementById("hard-new-kirundi");
  const frenchInput = document.getElementById("hard-new-french");
  const kirundi = kirundiInput.value.trim();
  const french = frenchInput.value.trim();
  if (!kirundi || !french) {
    showMessage("hard-error-message", "bothFieldsRequired");
    return;
  }
  if (hard.known.has(kirundi)) {
    showMessage("hard-error-message", "alreadyInDatabase");
    return;
  }
  hard.sentences.push({ kirundi, french });
  kirundiInput.value = "";
  frenchInput.value = "";
  updateHardSentenceCounter();
  document.getElementById("submit-hard-button").disabled = false;
  hideElement("hard-error-message");
  showMessage("hard-success-message", "sentencePairAdded", PAIR_ADDED_SHOWN_MS);
}

function updateHardSentenceCounter() {
  const count = hard.sentences.length;
  setI18n(document.getElementById("sentence-counter"), count === 1 ? "sentenceCounterOne" : "sentenceCounterMany", {
    count,
  });
}

function resetHardMode() {
  hard.sentences = [];
  document.getElementById("hard-new-kirundi").value = "";
  document.getElementById("hard-new-french").value = "";
  updateHardSentenceCounter();
  hideElement("hard-error-message");
  hideElement("hard-success-message");
  setBusyButton("submit-hard-button", false, "submitSentences");
  // Nothing to send until a pair is added.
  document.getElementById("submit-hard-button").disabled = true;
}

async function submitHardSentences() {
  setBusyButton("submit-hard-button", true);
  const status = await submitContribution("hard", "hard", hard.sentences);
  showResultOverlay(status, "sentencesSubmitted");
  resetHardMode();
}
