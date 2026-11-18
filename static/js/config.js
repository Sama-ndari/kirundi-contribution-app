/* Kirundi Contribution App: endpoints, limits and storage keys shared by every module. */
"use strict";

const CONFIG = Object.freeze({
  /** Google Apps Script web app that stores contributions (contract: README, "Submission endpoint"). */
  submitUrl:
    "https://script.google.com/macros/s/AKfycbznLwjbFfbf0UXxino2uA_i34YU629FgkY7CBsvgY9agJJbgzA3-8kbnEpTk52d9a-V/exec",
  publicMetadataUrl:
    "https://huggingface.co/datasets/Ijwi-ry-Ikirundi-AI/Kirundi_Open_Speech_Dataset/raw/main/metadata.csv",
  /** Relative, so a local run reads the local file instead of the live site. */
  frenchPromptsUrl: "french_prompts.txt",
  easyBatchSize: 20,
  easyShortestPool: 100,
  /** Mirrors the Apps Script limits, so a valid batch is never refused. */
  maxRowsPerRequest: 50,
  maxFieldChars: 500,
  requestTimeoutMs: 20000,
  outboxRetryMs: 60000,
  messageHideMs: 5000,
  storageKeys: Object.freeze({
    submittedKirundi: "mySubmittedPhrases",
    submittedFrench: "submittedFrenchPhrases",
    outbox: "pendingSubmissions",
    clientId: "clientId",
    darkMode: "darkMode",
    language: "language",
  }),
});
