/* Live public dataset (Hugging Face) and the French prompts, fetched once per visit. */
/* exported fetchText, loadPublicRows, loadKnownKirundi */
"use strict";

let publicRowsPromise = null;

/** GET `url` as text, with a timeout; throws with the URL and status on failure. */
async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`${url} answered ${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function parsePublicRows(text) {
  const [headers = [], ...lines] = parseCsv(text.replace(/^﻿/, ""));
  const kirundi = columnIndex(headers, "kirundi", "transcription");
  const french = columnIndex(headers, "french", "translation");
  const suggestion = columnIndex(headers, "machine_suggestion");
  if (kirundi === -1 || french === -1) {
    throw new Error("Public metadata.csv has no Kirundi_Transcription or French_Translation column");
  }
  const cell = (cells, index) => (index === -1 ? "" : (cells[index] || "").trim());
  return lines
    .map((cells) => ({
      kirundi: cell(cells, kirundi),
      french: cell(cells, french),
      suggestion: cell(cells, suggestion),
    }))
    .filter((row) => row.kirundi);
}

/** Rows of the public metadata.csv: { kirundi, french, suggestion }. Retried after a failure. */
function loadPublicRows() {
  if (!publicRowsPromise) {
    publicRowsPromise = fetchText(CONFIG.publicMetadataUrl)
      .then(parsePublicRows)
      .catch((error) => {
        publicRowsPromise = null;
        throw error;
      });
  }
  return publicRowsPromise;
}

/** Kirundi sentences already in the public dataset; empty (check disabled) if it cannot load. */
async function loadKnownKirundi() {
  try {
    const rows = await loadPublicRows();
    return { known: new Set(rows.map((row) => row.kirundi)), isAvailable: true };
  } catch (error) {
    logger.warn("Duplicate check disabled: public dataset unavailable", error);
    return { known: new Set(), isAvailable: false };
  }
}
