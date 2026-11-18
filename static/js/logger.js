/* Minimal logger: warnings and errors always reach the console, debug only with ?debug=1. */
"use strict";

const logger = (() => {
  const isDebug = new URLSearchParams(window.location.search).has("debug");
  const prefix = "[ijwi]";
  return Object.freeze({
    debug: (...args) => {
      if (isDebug) console.debug(prefix, ...args);
    },
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args),
  });
})();
