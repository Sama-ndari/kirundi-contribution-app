/* Browser storage: progress, pending submissions and preferences. Never throws to the caller. */
/* exported readText, writeText, readJson, writeJson, getSubmittedKirundi, recordSubmittedKirundi,
   getSubmittedFrench, recordSubmittedFrench, getClientId, newId */
"use strict";

function readText(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logger.warn(`Cannot read "${key}" from localStorage`, error);
    return null;
  }
}

/** Store `value`; returns false when the browser refuses (private mode, full quota). */
function writeText(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    logger.error(`Cannot save "${key}" to localStorage`, error);
    return false;
  }
}

function readJson(key, fallback) {
  const raw = readText(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    logger.warn(`Ignoring unreadable "${key}" in localStorage`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  return writeText(key, JSON.stringify(value));
}

function addUnique(key, items) {
  const known = new Set(readJson(key, []));
  items.forEach((item) => known.add(item));
  writeJson(key, [...known]);
}

/** Kirundi sentences this browser already translated (Easy mode). */
function getSubmittedKirundi() {
  return readJson(CONFIG.storageKeys.submittedKirundi, []);
}

function recordSubmittedKirundi(sentences) {
  addUnique(CONFIG.storageKeys.submittedKirundi, sentences);
}

/** French prompts this browser already translated (Medium mode). */
function getSubmittedFrench() {
  return readJson(CONFIG.storageKeys.submittedFrench, []);
}

function recordSubmittedFrench(sentences) {
  addUnique(CONFIG.storageKeys.submittedFrench, sentences);
}

/** Random id; crypto.randomUUID only exists on https and localhost. */
function newId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Anonymous id of this browser, used by the server to rate-limit and de-duplicate. */
function getClientId() {
  let id = readText(CONFIG.storageKeys.clientId);
  if (!id) {
    id = newId();
    writeText(CONFIG.storageKeys.clientId, id);
  }
  return id;
}
