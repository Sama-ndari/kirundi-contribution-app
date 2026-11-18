/* Translation engine: elements declare their text with data-i18n* attributes, never by content. */
/* exported t, setI18n, toggleLanguage, initLanguage */
"use strict";

const SUPPORTED_LANGUAGES = Object.keys(MESSAGES);
const DEFAULT_LANGUAGE = "fr";
let currentLanguage = DEFAULT_LANGUAGE;

/** Text for `key` in the current language, with {name} placeholders filled from `params`. */
function t(key, params = {}) {
  const text = MESSAGES[currentLanguage][key] ?? MESSAGES[DEFAULT_LANGUAGE][key];
  if (text === undefined) {
    logger.warn(`Missing translation key "${key}"`);
    return key;
  }
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

/** Give `element` a translated text that follows later language switches. */
function setI18n(element, key, params) {
  if (!element) return;
  element.dataset.i18n = key;
  if (params) {
    element.dataset.i18nParams = JSON.stringify(params);
  } else {
    delete element.dataset.i18nParams;
  }
  element.textContent = t(key, params);
}

function readParams(element) {
  try {
    return element.dataset.i18nParams ? JSON.parse(element.dataset.i18nParams) : undefined;
  } catch (error) {
    logger.warn(`Invalid data-i18n-params on #${element.id || element.tagName}`, error);
    return undefined;
  }
}

function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n, readParams(element));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  document.documentElement.lang = currentLanguage;
  const toggleText = document.getElementById("language-text");
  // The button shows the language you can switch TO.
  if (toggleText) toggleText.textContent = currentLanguage === "fr" ? "EN" : "FR";
}

function setLanguage(language) {
  currentLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
  writeText(CONFIG.storageKeys.language, currentLanguage);
  applyTranslations();
  document.dispatchEvent(new CustomEvent("languagechange", { detail: currentLanguage }));
}

function toggleLanguage() {
  setLanguage(currentLanguage === "fr" ? "en" : "fr");
}

function initLanguage() {
  setLanguage(readText(CONFIG.storageKeys.language) || DEFAULT_LANGUAGE);
}
