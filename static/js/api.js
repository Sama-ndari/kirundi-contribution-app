/* Contribution delivery. Every batch is saved in the browser first, then sent; it is only marked
   as done once the server confirms it. Unconfirmed batches are retried automatically. */
/* exported submitContribution, flushOutbox, pendingItems, startOutboxRetry */
"use strict";

// invalid_mode: the app may be online before the Apps Script that knows a new mode; keep and retry.
const RETRYABLE_CODES = new Set(["busy", "rate_limited", "server_error", "network", "bad_reply", "invalid_mode"]);
const outcomes = new Map();
let flushChain = Promise.resolve();
/** Fallback when the browser refuses localStorage writes (private mode, full quota). */
let memoryOutbox = null;

class SubmitError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.isRetryable = RETRYABLE_CODES.has(code);
  }
}

function readOutbox() {
  return memoryOutbox ?? readJson(CONFIG.storageKeys.outbox, []);
}

function writeOutbox(batches) {
  if (memoryOutbox === null && writeJson(CONFIG.storageKeys.outbox, batches)) return;
  memoryOutbox = batches;
}

function removeFromOutbox(batchId) {
  writeOutbox(readOutbox().filter((batch) => batch.batch_id !== batchId));
}

function chunk(items, size) {
  const parts = [];
  for (let i = 0; i < items.length; i += size) parts.push(items.slice(i, i + size));
  return parts;
}

/** `kind` (easy / medium / hard) stays local; `mode` is what the server stores it as. */
function makeBatches(kind, mode, rows) {
  const clientId = getClientId();
  return chunk(rows, CONFIG.maxRowsPerRequest).map((data) => ({
    kind,
    mode,
    batch_id: newId(),
    client_id: clientId,
    data,
  }));
}

/** POST one batch (contract: README, "Submission endpoint"); resolves only on a "success" reply. */
async function postBatch(batch) {
  const { mode, batch_id, client_id, data } = batch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);
  try {
    const response = await fetch(CONFIG.submitUrl, {
      method: "POST",
      // text/plain keeps this a "simple" request: Apps Script cannot answer a CORS preflight.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ mode, batch_id, client_id, data }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({ status: "error", code: "bad_reply" }));
    if (body.status !== "success") {
      throw new SubmitError(body.code || "bad_reply", `Batch ${batch_id} refused: ${body.code} ${body.message || ""}`);
    }
    return body;
  } catch (error) {
    if (error instanceof SubmitError) throw error;
    throw new SubmitError("network", `Batch ${batch_id} not sent: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }
}

function recordDelivered(batch) {
  if (batch.kind === "easy") recordSubmittedKirundi(batch.data.map((row) => row.original_kirundi));
  if (batch.kind === "medium") recordSubmittedFrench(batch.data.map((row) => row.french));
}

async function deliver(batch) {
  try {
    await postBatch(batch);
    removeFromOutbox(batch.batch_id);
    recordDelivered(batch);
    return "sent";
  } catch (error) {
    if (!(error instanceof SubmitError) || error.isRetryable) {
      logger.warn(`Batch ${batch.batch_id} kept for a later retry`, error);
      return "pending";
    }
    logger.error(`Batch ${batch.batch_id} (${batch.kind}, ${batch.data.length} rows) refused, dropped`, error);
    removeFromOutbox(batch.batch_id);
    return "rejected";
  }
}

async function runFlush() {
  let sent = 0;
  for (const batch of readOutbox()) {
    const outcome = await deliver(batch);
    outcomes.set(batch.batch_id, outcome);
    if (outcome === "pending") break; // the server is unreachable or busy: keep the order
    if (outcome === "sent") sent++;
  }
  if (sent) document.dispatchEvent(new CustomEvent("contributionsdelivered"));
}

/** Send every pending batch, oldest first. Calls are queued, never run in parallel. */
function flushOutbox() {
  flushChain = flushChain.then(runFlush, runFlush);
  return flushChain;
}

/**
 * Save then send `rows`. Resolves to "sent" (all confirmed), "queued" (kept, retried later)
 * or "rejected" (the server refused the format).
 */
async function submitContribution(kind, mode, rows) {
  const batches = makeBatches(kind, mode, rows);
  writeOutbox([...readOutbox(), ...batches]);
  await flushOutbox();
  const results = batches.map((batch) => outcomes.get(batch.batch_id) || "pending");
  if (results.includes("rejected")) return "rejected";
  return results.every((result) => result === "sent") ? "sent" : "queued";
}

/** Values of `field` in batches of `kind` still waiting to be delivered. */
function pendingItems(kind, field) {
  return readOutbox()
    .filter((batch) => batch.kind === kind)
    .flatMap((batch) => batch.data.map((row) => row[field]));
}

function startOutboxRetry() {
  const retry = () => {
    if (readOutbox().length) flushOutbox();
  };
  retry();
  window.addEventListener("online", retry);
  setInterval(retry, CONFIG.outboxRetryMs);
}
