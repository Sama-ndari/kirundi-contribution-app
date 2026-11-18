/* Shared screen helpers: visibility, timed messages, result overlay, theme, support popup, shortcuts. */
/* exported showElement, hideElement, isShown, showMessage, setBusyButton, showResultOverlay,
   closeSuccessOverlay, toggleDarkMode, initializeDarkMode, initSupportPopup, initShortcuts,
   setCurrentYear, hideAllModes, backToMainMenu */
"use strict";

const MODE_SCREENS = ["easy-mode", "medium-mode", "hard-mode"];
const messageTimers = new Map();

function showElement(id) {
  document.getElementById(id).classList.remove("hidden");
}

function hideElement(id) {
  document.getElementById(id).classList.add("hidden");
}

function isShown(id) {
  return !document.getElementById(id).classList.contains("hidden");
}

/** Show message `key` in element `id`; hide it again after `hideAfterMs` (0 = keep). */
function showMessage(id, key, hideAfterMs = CONFIG.messageHideMs) {
  const element = document.getElementById(id);
  setI18n(element.querySelector("[data-message]") || element, key);
  element.classList.remove("hidden");
  clearTimeout(messageTimers.get(id));
  if (hideAfterMs) messageTimers.set(id, setTimeout(() => element.classList.add("hidden"), hideAfterMs));
}

/** Disable a submit button and show "submitting", or restore its label `key`. */
function setBusyButton(id, isBusy, key) {
  const button = document.getElementById(id);
  if (!button) return;
  button.disabled = isBusy;
  setI18n(button, isBusy ? "submitting" : key);
}

/** Overlay after a submission: "sent" celebrates, "queued" reassures, "rejected" explains. */
function showResultOverlay(status, sentMessageKey) {
  const texts = {
    sent: ["thanksTitle", sentMessageKey],
    queued: ["queuedTitle", "queuedMessage"],
    rejected: ["rejectedTitle", "rejectedMessage"],
  }[status];
  setI18n(document.getElementById("success-title"), texts[0]);
  setI18n(document.getElementById("success-message"), texts[1]);
  showElement("success-overlay");
  if (status === "sent" && typeof confetti !== "undefined") {
    // Burundian flag colours: green, red, white.
    confetti({ particleCount: 48, spread: 55, origin: { y: 0.65 }, colors: ["#1b7a45", "#c41e3a", "#f3f0e8"], disableForReducedMotion: true });
  }
}

function closeSuccessOverlay() {
  hideElement("success-overlay");
  updateGamification();
  backToMainMenu();
}

function hideAllModes() {
  hideElement("main-menu");
  MODE_SCREENS.forEach(hideElement);
}

function backToMainMenu() {
  MODE_SCREENS.forEach(hideElement);
  showElement("main-menu");
  resetEasyMode();
  resetMediumMode();
  resetHardMode();
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle("dark");
  writeText(CONFIG.storageKeys.darkMode, String(isDark));
}

/** Dark mode only when the visitor chose it; the default is light. */
function initializeDarkMode() {
  document.documentElement.classList.toggle("dark", readText(CONFIG.storageKeys.darkMode) === "true");
}

function setCurrentYear() {
  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
}

function initSupportPopup() {
  const button = document.getElementById("support-chat-btn");
  const modal = document.getElementById("support-chat-modal");
  const close = document.getElementById("close-support-chat");
  if (!button || !modal || !close) return;
  const setOpen = (isOpen) => modal.classList.toggle("hidden", !isOpen);
  button.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("mousedown", (event) => {
    if (!modal.contains(event.target) && !button.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

/** Ctrl+Enter submits and Escape skips, in the mode that is on screen. */
function initShortcuts() {
  // Resolved on key press, so start-up never depends on every mode script being loaded.
  const actions = {
    "easy-mode": { submit: () => nextEasyPhrase(), skip: () => skipEasyPhrase() },
    "medium-mode": { submit: () => submitMediumTranslation(), skip: () => skipMediumSentence() },
    "hard-mode": { submit: () => addHardSentence() },
  };
  document.addEventListener("keydown", (event) => {
    const screen = MODE_SCREENS.find(isShown);
    const action = screen && actions[screen];
    if (!action || isShown("success-overlay")) return;
    if (event.key === "Enter" && event.ctrlKey) action.submit();
    else if (event.key === "Escape" && action.skip) action.skip();
  });
}
