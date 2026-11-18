/* Start-up: language, theme, rank card, support popup, shortcuts and pending submissions. */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initializeDarkMode();
  setCurrentYear();
  updateGamification();
  initSupportPopup();
  initShortcuts();
  startOutboxRetry();
  document.addEventListener("languagechange", updateGamification);
  document.addEventListener("contributionsdelivered", updateGamification);
});
