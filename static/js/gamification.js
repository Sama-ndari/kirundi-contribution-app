/* Rank card: contributions confirmed by the server on this browser → rank, next rank, progress. */
/* exported updateGamification */
"use strict";

const RANKS = Object.freeze([
  { min: 0, icon: "🌱", key: "rankInyuka" },
  { min: 10, icon: "🔨", key: "rankUmukozi" },
  { min: 50, icon: "🚀", key: "rankUmumenyi" },
  { min: 100, icon: "⭐", key: "rankInararibonye" },
  { min: 500, icon: "👑", key: "rankIntwari" },
  { min: 1000, icon: "🦁", key: "rankIntare" },
]);

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function showNextRank(total, current, next) {
  const bar = document.getElementById("rank-progress-bar");
  if (!next) {
    setI18n(document.getElementById("next-rank-title"), "maxRank");
    setText("contributions-left", "0");
    setText("progress-percentage", "100%");
    if (bar) bar.style.width = "100%";
    return;
  }
  const percentage = Math.min(100, Math.max(0, ((total - current.min) / (next.min - current.min)) * 100));
  const nextTitle = document.getElementById("next-rank-title");
  if (nextTitle) {
    delete nextTitle.dataset.i18n;
    // Only the Kirundi name, to keep it short.
    nextTitle.textContent = t(next.key).split(" (")[0];
  }
  setText("contributions-left", String(next.min - total));
  setText("progress-percentage", `${Math.round(percentage)}%`);
  if (bar) bar.style.width = `${percentage}%`;
}

function updateTimeline(total, current) {
  document.querySelectorAll(".rank-step").forEach((step) => {
    const min = parseInt(step.getAttribute("data-min"), 10);
    step.classList.remove("is-active", "is-done", "is-locked");
    if (total < min) step.classList.add("is-locked");
    else step.classList.add(min === current.min ? "is-active" : "is-done");
  });
}

/** Redraw the rank card from the confirmed contribution counts. */
function updateGamification() {
  const total = getSubmittedKirundi().length + getSubmittedFrench().length;
  const count = document.getElementById("total-contribution-count");
  if (count && window.motion && window.motion.countUp) window.motion.countUp(count, total);
  else if (count) count.textContent = String(total);

  const index = RANKS.reduce((found, rank, i) => (total >= rank.min ? i : found), 0);
  const current = RANKS[index];
  setText("user-rank-icon", current.icon);
  setI18n(document.getElementById("user-rank-title"), current.key);
  showNextRank(total, current, RANKS[index + 1]);
  updateTimeline(total, current);
}
