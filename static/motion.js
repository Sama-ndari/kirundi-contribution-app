/* ==========================================================================
   Motion behaviours - Ijwi ry'Ikirundi AI (2026)
   The two things the motion system needs that CSS cannot express on its own:
   counting a number up to its new value, and replaying an entrance when the
   app swaps fresh text into a node that was already on screen.

   The swap animations are wired with MutationObserver rather than by calling
   into script.js at every write site: the phrase and counter nodes are
   written from a dozen places, and observing them keeps the animation out of
   the game logic entirely. The keyframes live in motion.css.

   Everything here is a no-op under prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

  /** Elements whose text is replaced with a new phrase to translate. */
  const SWAP_TARGET_IDS = ["kirundi-phrase", "french-sentence"];

  /** Session counters that tick up as the user submits. */
  const COUNTER_TARGET_IDS = ["progress-text", "medium-progress-text"];

  function prefersReducedMotion() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  }

  /**
   * Animate `element`'s text from the number it shows to `target`.
   * Falls back to a plain write when motion is reduced or nothing changed.
   */
  function countUp(element, target) {
    if (!element) return;

    const to = Number(target) || 0;
    const from = Number(String(element.textContent).replace(/[^\d-]/g, "")) || 0;

    if (prefersReducedMotion() || from === to) {
      element.textContent = String(to);
      return;
    }

    const durationMs = 620;
    const startedAt = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /**
   * Restart `className`'s animation on `element`. Removing and re-adding in
   * the same frame is coalesced by the browser, so the reflow read between
   * them is what actually makes the animation play again.
   */
  function replayAnimation(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  /** Play `className` on `element` whenever its text content changes. */
  function animateOnTextChange(element, className) {
    if (!element) return;

    const observer = new MutationObserver(function () {
      if (prefersReducedMotion()) return;
      replayAnimation(element, className);
    });

    observer.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  function bindSwapAnimations() {
    SWAP_TARGET_IDS.forEach(function (id) {
      animateOnTextChange(document.getElementById(id), "is-swapping");
    });
    COUNTER_TARGET_IDS.forEach(function (id) {
      animateOnTextChange(document.getElementById(id), "is-counting");
    });
  }

  document.addEventListener("DOMContentLoaded", bindSwapAnimations);

  // Consumed by updateGamification() in script.js.
  window.motion = { countUp: countUp };
})();
