// Kirundi Contribution App - JavaScript Logic
// Global variables
let phrasesToTranslate = [];
let userTranslations = [];
let userNewSentences = [];
let userHardSentences = [];
let progress = 0;
let mediumProgress = 0;
const batchSize = 20;

// Language toggle variables
let currentLanguage = "fr"; // Default to English

// Medium Level variables
let frenchPrompts = [];
let existingKirundiPhrases = new Set();
let userMediumTranslations = [];

// LocalStorage keys
const SUBMITTED_PHRASES_KEY = "mySubmittedPhrases";
const SUBMITTED_FRENCH_PHRASES_KEY = "submittedFrenchPhrases";

// LocalStorage helper functions
function getSubmittedPhrases() {
  try {
    const stored = localStorage.getItem(SUBMITTED_PHRASES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading submitted phrases from localStorage:", error);
    return [];
  }
}

function saveSubmittedPhrases(newPhrases) {
  try {
    const existingPhrases = getSubmittedPhrases();
    const allPhrases = [...existingPhrases];
    newPhrases.forEach((phrase) => {
      if (!allPhrases.includes(phrase)) {
        allPhrases.push(phrase);
      }
    });
    localStorage.setItem(SUBMITTED_PHRASES_KEY, JSON.stringify(allPhrases));
    console.log(
      `Saved ${newPhrases.length} new phrases to localStorage. Total: ${allPhrases.length}`
    );
    return allPhrases;
  } catch (error) {
    console.error("Error saving submitted phrases to localStorage:", error);
    return [];
  }
}

function getSubmittedFrenchPhrases() {
  try {
    const stored = localStorage.getItem(SUBMITTED_FRENCH_PHRASES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(
      "Error loading submitted French phrases from localStorage:",
      error
    );
    return [];
  }
}

function saveSubmittedFrenchPhrases(newFrenchPhrases) {
  try {
    const existingPhrases = getSubmittedFrenchPhrases();
    const allPhrases = [...existingPhrases];
    newFrenchPhrases.forEach((phrase) => {
      if (!allPhrases.includes(phrase)) {
        allPhrases.push(phrase);
      }
    });
    localStorage.setItem(
      SUBMITTED_FRENCH_PHRASES_KEY,
      JSON.stringify(allPhrases)
    );
    console.log(
      `Saved ${newFrenchPhrases.length} new French phrases to localStorage. Total: ${allPhrases.length}`
    );
    return allPhrases;
  } catch (error) {
    console.error(
      "Error saving submitted French phrases to localStorage:",
      error
    );
    return [];
  }
}

function getSubmittedPhrasesCount() {
  return getSubmittedPhrases().length;
}

// Utility function to show/hide elements
function showElement(id) {
  document.getElementById(id).classList.remove("hidden");
}

function hideElement(id) {
  document.getElementById(id).classList.add("hidden");
}

// --- Support Popup Logic ---
(function () {
  function toggleSupportPopup(show) {
    const modal = document.getElementById("support-chat-modal");
    if (!modal) return;
    if (show) {
      modal.classList.remove("hidden");
    } else {
      modal.classList.add("hidden");
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    const supportBtn = document.getElementById("support-chat-btn");
    const supportModal = document.getElementById("support-chat-modal");
    const closeBtn = document.getElementById("close-support-chat");
    if (supportBtn && supportModal && closeBtn) {
      supportBtn.addEventListener("click", function () {
        toggleSupportPopup(true);
      });
      closeBtn.addEventListener("click", function () {
        toggleSupportPopup(false);
      });
      document.addEventListener("mousedown", function (e) {
        if (
          !supportModal.classList.contains("hidden") &&
          !supportModal.contains(e.target) &&
          e.target !== supportBtn
        ) {
          toggleSupportPopup(false);
        }
      });
      document.addEventListener("keydown", function (e) {
        if (!supportModal.classList.contains("hidden") && e.key === "Escape") {
          toggleSupportPopup(false);
        }
      });
    }
  });

  // Add support popup translation keys to translateInterface
  // Note: Translation is now handled by the main translateInterface function
  // which processes all elements with data-translate attributes
})();

// Main menu functions
function showComingSoon() {
  alert("Hard Level is coming soon! Turiko turabitegura.");
}

function hideAllModes() {
  hideElement("main-menu");
  hideElement("easy-mode");
  hideElement("medium-mode");
  hideElement("hard-mode");
}

function backToMainMenu() {
  hideElement("easy-mode");
  hideElement("medium-mode");
  hideElement("hard-mode");
  showElement("main-menu");
  resetEasyMode();
  resetMediumMode();
  resetHardMode();
}

// Easy Mode Functions
async function initEasyMode() {
  hideAllModes();
  showElement("easy-mode");
  showElement("loading-easy");
  hideElement("game-ui");
  hideElement("completion-ui");
  hideElement("easy-error");

  try {
    const submittedCount = getSubmittedPhrasesCount();
    if (submittedCount > 0) {
      console.log(
        `Welcome back! You have already submitted ${submittedCount} phrases.`
      );
    }
    await loadTranslationData();
    progress = 0;
    userTranslations = [];
    hideElement("loading-easy");
    showElement("game-ui");
    showNextEasyPhrase();
  } catch (error) {
    console.error("Error loading data:", error);
    // Show dedicated error UI
    hideElement("loading-easy");
    const easyError = document.getElementById("easy-error");
    if (easyError) {
      easyError.classList.remove("hidden");
    } else {
      alert(
        "Error loading live translation data from Hugging Face. Please check your internet connection and try again."
      );
      backToMainMenu();
    }
  }
}

async function loadTranslationData() {
  try {
    const huggingFaceUrl =
      "https://huggingface.co/datasets/Ijwi-ry-Ikirundi-AI/Kirundi_Open_Speech_Dataset/raw/main/metadata.csv";
    console.log("Fetching live data from Hugging Face...");
    const response = await fetch(huggingFaceUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }
    const csvText = await response.text();
    console.log("Successfully fetched live dataset");
    phrasesToTranslate = parseUntranslatedRows(csvText);
    const submittedPhrases = getSubmittedPhrases();
    const originalCount = phrasesToTranslate.length;
    phrasesToTranslate = phrasesToTranslate.filter(
      // The filter now checks the .kirundi string inside the object against the submitted list.
      (phraseObj) => !submittedPhrases.includes(phraseObj.kirundi)
    );
    console.log(
      `Found ${originalCount} untranslated phrases, ${
        originalCount - phrasesToTranslate.length
      } already submitted`
    );
    console.log(
      `${phrasesToTranslate.length} new phrases available for translation`
    );

    shuffleArray(phrasesToTranslate);

    // --- FINAL FIX: FORCE RANDOM SELECTION FROM SHORTEST POOL ---

    // Step 1: Create a pool of the shortest available sentences (e.g., top 100 shortest)
    // First, sort ALL available phrases by length (shortest first)
    phrasesToTranslate.sort((a, b) => a.kirundi.length - b.kirundi.length);

    // Step 2: Take the 100 shortest phrases available as the "starting pool"
    const shortestPhrasesPool = phrasesToTranslate.slice(0, 100);

    // Step 3: SHUFFLE the starting pool (guaranteed randomness for the first 20)
    shuffleArray(shortestPhrasesPool);

    // Step 4: Use the first 20 phrases from this randomly shuffled, shortest pool
    phrasesToTranslate = shortestPhrasesPool.slice(0, batchSize);

    // --- END OF FINAL FIX ---

    if (phrasesToTranslate.length === 0) {
      throw new Error(
        "No new untranslated phrases found - you have already submitted all available phrases!"
      );
    }
  } catch (error) {
    console.error("Error loading live data:", error);
    phrasesToTranslate = []; // Ensure it's empty on failure
    throw error; // Re-throw the error to be caught by initEasyMode
  }
}

function parseUntranslatedRows(csvText) {
  const lines = csvText.split("\n");
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const kirundiIndex = headers.findIndex(
    (h) =>
      h.trim().toLowerCase().includes("kirundi") &&
      h.trim().toLowerCase().includes("transcription")
  );
  const frenchIndex = headers.findIndex(
    (h) =>
      h.trim().toLowerCase().includes("french") &&
      h.trim().toLowerCase().includes("translation")
  );
  const suggestionIndex = headers.findIndex((h) =>
    h.trim().toLowerCase().includes("machine_suggestion")
  );
  if (kirundiIndex === -1) {
    console.error("Could not find kirundi_transcription column");
    return [];
  }
  if (frenchIndex === -1) {
    console.error("Could not find french_translation column");
    return [];
  }
  const untranslatedPhrases = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const columns = parseCSVLine(line);
    if (columns.length <= Math.max(kirundiIndex, frenchIndex, suggestionIndex))
      continue;
    const kirundiText = columns[kirundiIndex]?.trim();
    const frenchText = columns[frenchIndex]?.trim();
    const suggestionText =
      suggestionIndex !== -1 ? columns[suggestionIndex]?.trim() || "" : "";
    if (
      kirundiText &&
      kirundiText.length > 0 &&
      (!frenchText || frenchText.length === 0)
    ) {
      untranslatedPhrases.push({
        kirundi: kirundiText,
        suggestion: suggestionText,
      });
    }
  }
  return untranslatedPhrases;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Seeded Random Number Generator (for consistent shuffling)
function seededRandom(seed) {
  const m = 0x80000000; // 2^31
  let a = 1103515245;
  let c = 12345;
  // We use the unique user ID as the initial seed value
  let state = seed || Math.floor(Math.random() * (m - 1));

  return function () {
    state = (a * state + c) % m;
    return state / m;
  };
}

// Function to generate a simple non-persistent random shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showNextEasyPhrase() {
  const aiSuggestionMsg = document.getElementById("ai-suggestion-msg");
  const validationUi = document.getElementById("validation-ui");
  const frenchInputContainer = document.getElementById(
    "french-input-container"
  );

  // Infinite mode: only stop if we run out of phrases
  if (progress >= phrasesToTranslate.length) {
    showCompletion();
    return;
  }
  updateProgress();
  const phraseObj = phrasesToTranslate[progress];
  document.getElementById("kirundi-phrase").textContent = phraseObj.kirundi;
  document.getElementById("french-input").value = ""; // Always clear input first

  if (phraseObj.suggestion && phraseObj.suggestion.length > 0) {
    // Show Validation UI (Approve/Edit)
    if (validationUi) validationUi.classList.remove("hidden");
    if (frenchInputContainer) frenchInputContainer.classList.add("hidden");

    if (aiSuggestionMsg) {
      // Set the label
      const labelElement = document.getElementById("ai-suggestion-label");
      if (labelElement) {
        labelElement.textContent =
          currentLanguage === "fr" ? "Suggestion IA" : "AI Suggestion";
      }

      // Set the suggestion text
      const textElement = document.getElementById("ai-suggestion-text");
      if (textElement) {
        textElement.textContent = phraseObj.suggestion;
      }

      aiSuggestionMsg.classList.remove("hidden");
    }
  } else {
    // No suggestion -> Show manual input directly
    if (validationUi) validationUi.classList.add("hidden");
    if (frenchInputContainer) frenchInputContainer.classList.remove("hidden");
    if (aiSuggestionMsg) aiSuggestionMsg.classList.add("hidden");
  }
  hideElement("error-message");
  resetCorrectionBox();
}

function approveEasySuggestion() {
  const phraseObj = phrasesToTranslate[progress];
  const suggestion = phraseObj.suggestion;

  // Get correction if any (though usually hidden in this view, we check for safety)
  const correctionBox = document.getElementById("correction-box");
  const correctedKirundiText = correctionBox.value.trim() || phraseObj.kirundi;

  userTranslations.push({
    original_kirundi: phraseObj.kirundi,
    corrected_kirundi: correctedKirundiText,
    french_translation: suggestion,
  });

  progress++;
  showNextEasyPhrase();
  // Call updateProgress again after showing next phrase to ensure button is visible
  updateProgress();
}

function startManualEdit() {
  const validationUi = document.getElementById("validation-ui");
  const frenchInputContainer = document.getElementById(
    "french-input-container"
  );
  const frenchInput = document.getElementById("french-input");
  const phraseObj = phrasesToTranslate[progress];

  if (validationUi) validationUi.classList.add("hidden");
  if (frenchInputContainer) frenchInputContainer.classList.remove("hidden");

  // Pre-fill with suggestion
  if (phraseObj.suggestion) {
    frenchInput.value = phraseObj.suggestion;
  }
  frenchInput.focus();
}

function updateProgress() {
  // Infinite mode: just show the count
  document.getElementById("progress-text").textContent = progress;

  // Update the Save & Submit button badge and visibility
  const badge = document.getElementById("easy-count-badge");
  const container = document.getElementById("easy-submit-container");
  const count = userTranslations.length;

  if (badge) {
    badge.textContent = count;
  }

  // Show button only if there are translations to submit
  if (container) {
    if (count > 0) {
      container.classList.remove("hidden");
    } else {
      container.classList.add("hidden");
    }
  }
}

// function nextEasyPhrase() {
//   const frenchInput = document.getElementById("french-input").value.trim();
//   if (!frenchInput) {
//     showElement("error-message");
//     return;
//   }
//   const originalKirundi = phrasesToTranslate[progress];
//   const correctionBox = document.getElementById("correction-box");
//   const correctedKirundi = correctionBox.value.trim() || originalKirundi;
//   userTranslations.push({
//     original_kirundi: originalKirundi,
//     corrected_kirundi: correctedKirundi,
//     french_translation: frenchInput,
//   });
//   progress++;
//   showNextEasyPhrase();
// }

function nextEasyPhrase() {
  const frenchInput = document.getElementById("french-input").value.trim();

  if (!frenchInput) {
    showElement("error-message");
    return;
  }

  // 1. Get the current phrase OBJECT (it looks like {kirundi: 'text', suggestion: 'text'})
  const currentPhraseObj = phrasesToTranslate[progress];

  // --- FIX STARTS HERE ---
  // 2. Extract the actual Kirundi TEXT string from the object
  const originalKirundiText = currentPhraseObj.kirundi;

  // 3. Get the correction (or use the original text if no correction was made)
  const correctionBox = document.getElementById("correction-box");
  const correctedKirundiText =
    correctionBox.value.trim() || originalKirundiText;

  // 4. Add the CLEAN strings to the array
  userTranslations.push({
    // Now it's sending only the text string: "Ewe Bayaga urabazagiza"
    original_kirundi: originalKirundiText,
    corrected_kirundi: correctedKirundiText,
    french_translation: frenchInput,
  });
  // --- FIX ENDS HERE ---

  progress++;
  showNextEasyPhrase();
}

function skipEasyPhrase() {
  progress++;
  showNextEasyPhrase();
  hideElement("error-message");
  console.log(`Skipped phrase: "${phrasesToTranslate[progress - 1]}"`);
}

function showCompletion() {
  hideElement("game-ui");
  hideElement("easy-submit-container");
  showElement("completion-ui");
  // Reset submit button text
  const submitButton = document.getElementById("submit-easy-button");
  submitButton.textContent =
    currentLanguage === "fr"
      ? "Soumettre les traductions"
      : "Submit Translations";
  submitButton.disabled = false;
}

function resetEasyMode() {
  progress = 0;
  userTranslations = [];
  phrasesToTranslate = [];
  hideElement("error-message");
  hideElement("completion-ui");
  document.getElementById("french-input").value = "";
  resetCorrectionBox();
}

function toggleCorrectionBox() {
  const correctionContainer = document.getElementById("correction-container");
  const correctionBox = document.getElementById("correction-box");
  const currentPhrase = document.getElementById("kirundi-phrase").textContent;
  if (correctionContainer.classList.contains("hidden")) {
    correctionContainer.classList.remove("hidden");
    correctionBox.value = currentPhrase;
    correctionBox.focus();
    const reportText = document.getElementById("report-problem-text");
    reportText.textContent =
      currentLanguage === "fr" ? "Annuler la correction" : "Cancel correction";
  } else {
    correctionContainer.classList.add("hidden");
    const reportText = document.getElementById("report-problem-text");
    reportText.textContent =
      currentLanguage === "fr" ? "Signaler un problème" : "Report a problem";
  }
}

function resetCorrectionBox() {
  const correctionContainer = document.getElementById("correction-container");
  const correctionBox = document.getElementById("correction-box");
  const reportText = document.getElementById("report-problem-text");
  correctionContainer.classList.add("hidden");
  correctionBox.value = "";
  reportText.textContent =
    currentLanguage === "fr" ? "Signaler un problème" : "Report a problem";
}

// Medium Mode Functions
async function initMediumMode() {
  console.log("initMediumMode called");
  hideAllModes();
  showElement("medium-mode");
  console.log("Shown medium-mode");
  showElement("loading-medium");
  console.log("Shown loading-medium");
  hideElement("medium-game-ui");
  hideElement("medium-completion-ui");
  hideElement("medium-error");

  try {
    const submittedFrenchCount = getSubmittedFrenchPhrases().length;
    if (submittedFrenchCount > 0) {
      console.log(
        `Welcome back! You have already submitted ${submittedFrenchCount} French translations.`
      );
    }
    await loadMediumData();
    mediumProgress = 0;
    userMediumTranslations = [];
    hideElement("loading-medium");
    showElement("medium-game-ui");
    showNextFrenchSentence();
  } catch (error) {
    console.error("Error initializing Medium Mode:", error);
    hideElement("loading-medium");
    const mediumError = document.getElementById("medium-error");
    if (mediumError) {
      mediumError.classList.remove("hidden");
    } else {
      const isFrench =
        typeof currentLanguage !== "undefined" && currentLanguage === "fr";
      const message = isFrench
        ? "Erreur de chargement du mode Moyen. Nous n'avons pas pu charger les phrases françaises. Veuillez vérifier votre connexion Internet, puis revenir au menu principal pour réessayer."
        : "Unable to load Medium Mode. We could not load the French prompts. Please check your internet connection, then return to the main menu and try again.";
      alert(message);
    }
  }
}

async function loadMediumData() {
  try {
    let frenchPromptsLoaded = false;
    try {
      const frenchResponse = await fetch(
        "https://www.samandari.dev/kirundi-contribution-app/french_prompts.txt"
      );
      if (frenchResponse.ok) {
        const frenchText = await frenchResponse.text();
        frenchPrompts = frenchText
          .split("\n")
          .filter((line) => line.trim() !== "");
        console.log(`Loaded ${frenchPrompts.length} French prompts from file`);
        frenchPromptsLoaded = true;
      }
    } catch (fileError) {
      console.warn(
        "Could not load french_prompts.txt (CORS/file access issue), using fallback data"
      );
    }
    if (!frenchPromptsLoaded) {
      // Fallback if local file fails
      frenchPrompts = [
        "Bonjour, comment allez-vous?",
        "Je vous aime beaucoup.",
        "Quel mois sommes-nous?",
        "Je veux manger de la nourriture.",
        "Il va pleuvoir demain.",
        "Allons au marché.",
        "Nous sommes en avril.",
        "Je veux de l'eau.",
        "Cette journée est belle.",
        "Je vais au travail.",
        "Quelle heure est-il?",
        "Je veux dormir.",
        "Allons à l'école.",
        "Quelle est la date?",
        "Je veux parler avec l'étudiant.",
        "Cette année est belle.",
        "Je vais à l'hôpital.",
        "Allons dans la chambre.",
        "Quand nous reverrons-nous?",
        "Je veux apprendre le français.",
      ];
      console.log(`Using ${frenchPrompts.length} fallback French prompts`);
    }

    // Load remote Kirundi data for duplicate checking
    try {
      const metadataResponse = await fetch(
        "https://huggingface.co/datasets/Ijwi-ry-Ikirundi-AI/Kirundi_Open_Speech_Dataset/raw/main/metadata.csv"
      );
      if (metadataResponse.ok) {
        const csvText = await metadataResponse.text();
        existingKirundiPhrases = new Set();
        const lines = csvText.split("\n");
        if (lines.length > 1) {
          const headers = parseCSVLine(lines[0]);
          const kirundiIndex = headers.findIndex(
            (h) =>
              h.toLowerCase().includes("kirundi") &&
              h.toLowerCase().includes("transcription")
          );
          if (kirundiIndex !== -1) {
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const row = parseCSVLine(lines[i]);
                if (row[kirundiIndex] && row[kirundiIndex].trim()) {
                  existingKirundiPhrases.add(row[kirundiIndex].trim());
                }
              }
            }
          }
        }
        console.log(
          `Loaded ${existingKirundiPhrases.size} existing Kirundi phrases for duplicate checking`
        );
      } else {
        throw new Error(`Failed to fetch metadata: ${metadataResponse.status}`);
      }
    } catch (metadataError) {
      console.warn(
        "Could not load remote Kirundi data for duplicate checking:",
        metadataError
      );
      console.warn("Duplicate checking will be disabled for this session");
      existingKirundiPhrases = new Set();
    }

    const submittedFrenchPhrases = getSubmittedFrenchPhrases();
    const originalCount = frenchPrompts.length;
    frenchPrompts = frenchPrompts.filter(
      (phrase) => !submittedFrenchPhrases.includes(phrase)
    );
    console.log(
      `French prompts: ${originalCount} total, ${
        originalCount - frenchPrompts.length
      } already submitted`
    );
    console.log(
      `${frenchPrompts.length} new French prompts available for translation`
    );
    shuffleArray(frenchPrompts);
    if (frenchPrompts.length === 0) {
      throw new Error(
        "No new French prompts available - you have already submitted all available phrases!"
      );
    }
  } catch (error) {
    console.error("Error loading Medium Mode data:", error);
    throw error;
  }
}

function showNextFrenchSentence() {
  // Infinite mode: only stop if we run out of prompts
  if (mediumProgress >= frenchPrompts.length) {
    completeMediumMode();
    return;
  }
  const currentFrench = frenchPrompts[mediumProgress];
  document.getElementById("french-sentence").textContent = currentFrench;
  document.getElementById("kirundi-translation").value = "";
  updateMediumProgress();
  hideElement("medium-error-message");
  hideElement("medium-success-message");
}

function submitMediumTranslation() {
  const kirundiTranslation = document
    .getElementById("kirundi-translation")
    .value.trim();
  if (!kirundiTranslation) {
    const errorMessage =
      currentLanguage === "fr"
        ? "Veuillez entrer une traduction kirundi."
        : "Please enter a Kirundi translation.";
    showMediumError(errorMessage);
    return;
  }
  if (
    existingKirundiPhrases.size > 0 &&
    existingKirundiPhrases.has(kirundiTranslation)
  ) {
    const errorMessage =
      currentLanguage === "fr"
        ? "Cette traduction kirundi est déjà dans notre base de données! Merci!"
        : "This Kirundi translation is already in our database! Thank you!";
    showMediumError(errorMessage);
    return;
  }
  const currentFrench = frenchPrompts[mediumProgress];
  userMediumTranslations.push({
    french: currentFrench,
    kirundi: kirundiTranslation,
  });
  showElement("medium-success-message");
  setTimeout(() => hideElement("medium-success-message"), 1500);
  mediumProgress++;
  setTimeout(() => showNextFrenchSentence(), 1000);
}

function skipMediumSentence() {
  mediumProgress++;
  showNextFrenchSentence();
}

function updateMediumProgress() {
  // Infinite mode: just show the count
  document.getElementById("medium-progress-text").textContent = mediumProgress;

  // Update the Save & Submit button badge and visibility
  const badge = document.getElementById("medium-count-badge");
  const container = document.getElementById("medium-submit-container");
  const count = userMediumTranslations.length;

  if (badge) {
    badge.textContent = count;
  }

  // Show button only if there are translations to submit
  if (container) {
    if (count > 0) {
      container.classList.remove("hidden");
    } else {
      container.classList.add("hidden");
    }
  }
}

function completeMediumMode() {
  hideElement("medium-game-ui");
  hideElement("medium-submit-container");
  showElement("medium-completion-ui");
  // Reset submit button text
  const submitButton = document.getElementById("submit-medium-button");
  submitButton.textContent =
    currentLanguage === "fr"
      ? "Soumettre les traductions"
      : "Submit Translations";
  submitButton.disabled = false;
}

function showMediumError(message) {
  const errorElement = document.getElementById("medium-error-message");
  errorElement.textContent = message;
  showElement("medium-error-message");
  setTimeout(() => hideElement("medium-error-message"), 5000);
}

function resetMediumMode() {
  mediumProgress = 0;
  userMediumTranslations = [];
  frenchPrompts = [];
  existingKirundiPhrases = new Set();
  hideElement("medium-error-message");
  hideElement("medium-success-message");
  hideElement("medium-completion-ui");
  document.getElementById("kirundi-translation").value = "";
}

// --- API Submission Functions ---

function showSuccessOverlay(message) {
  document.getElementById("success-title").textContent =
    currentLanguage === "fr"
      ? "Merci🙏🏾 pour votre contribution!"
      : "Thank you🙏🏾 for your contribution!";
  document.getElementById("success-message").textContent =
    message ||
    (currentLanguage === "fr"
      ? "Vos données ont été soumises avec succès. Murakoze cane🙏🏾!"
      : "Your data has been submitted successfully. Murakoze cane🙏🏾!");
  document.getElementById("success-main-menu-btn").textContent =
    currentLanguage === "fr" ? "Retour au Menu Principal" : "Back to Main Menu";
  document.getElementById("success-overlay").classList.remove("hidden");

  // Confetti celebration with Burundian flag colors (Green, Red, White)
  if (typeof confetti !== "undefined") {
    confetti({
      particleCount: 48,
      spread: 55,
      origin: { y: 0.65 },
      colors: ["#1b7a45", "#c41e3a", "#f3f0e8"],
      disableForReducedMotion: true,
    });
  }
}

function closeSuccessOverlay() {
  document.getElementById("success-overlay").classList.add("hidden");
  updateGamification(); // Update rank after submission
  backToMainMenu();
}

async function submitEasyTranslations() {
  const submitButton = document.getElementById("submit-easy-button");
  if (submitButton) submitButton.disabled = true;
  submitButton.textContent =
    currentLanguage === "fr"
      ? "Soumission... veuillez patienter..."
      : "Submitting... please wait...";

  const payload = {
    mode: "easy",
    data: userTranslations,
  };

  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbznLwjbFfbf0UXxino2uA_i34YU629FgkY7CBsvgY9agJJbgzA3-8kbnEpTk52d9a-V/exec",
      {
        method: "POST",
        mode: "no-cors", // This is correct
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }
    );
    const submittedKirundiPhrases = userTranslations.map(
      (translation) => translation.original_kirundi
    );
    saveSubmittedPhrases(submittedKirundiPhrases);
    showSuccessOverlay(
      currentLanguage === "fr"
        ? "Vos traductions ont été soumises. Murakoze cane🙏🏾!"
        : "Your translations have been submitted. Murakoze cane🙏🏾!"
    );
  } catch (e) {
    console.error("Submission failed:", e);
    alert(
      currentLanguage === "fr"
        ? "Échec de la soumission! Veuillez réessayer."
        : "Submission failed! Please try again."
    );
    submitButton.textContent =
      currentLanguage === "fr"
        ? "Soumettre les traductions"
        : "Submit Translations";
    submitButton.disabled = false;
  }
}

async function submitMediumTranslations() {
  const submitButton = document.getElementById("submit-medium-button");
  if (submitButton) submitButton.disabled = true;
  submitButton.textContent =
    currentLanguage === "fr"
      ? "Soumission... veuillez patienter..."
      : "Submitting... please wait...";

  const payload = {
    mode: "medium",
    data: userMediumTranslations,
  };
  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbznLwjbFfbf0UXxino2uA_i34YU629FgkY7CBsvgY9agJJbgzA3-8kbnEpTk52d9a-V/exec",
      {
        method: "POST",
        mode: "no-cors", // This is correct
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }
    );
    const submittedFrenchPhrases = userMediumTranslations.map(
      (translation) => translation.french
    );
    saveSubmittedFrenchPhrases(submittedFrenchPhrases);
    showSuccessOverlay(
      currentLanguage === "fr"
        ? "Vos nouvelles phrases ont été soumises. Murakoze cane🙏🏾!"
        : "Your new sentences have been submitted. Murakoze cane🙏🏾!"
    );
  } catch (e) {
    console.error("Submission failed:", e);
    alert(
      currentLanguage === "fr"
        ? "Échec de la soumission! Veuillez réessayer."
        : "Submission failed! Please try again."
    );
    submitButton.textContent =
      currentLanguage === "fr"
        ? "Soumettre les traductions"
        : "Submit Translations";
    submitButton.disabled = false;
  }
}

// Hard Level Submission - NOW FIXED
async function initHardMode() {
  hideAllModes();
  showElement("hard-mode");
  resetHardMode();

  // --- We must load the existing Kirundi phrases to check for duplicates ---
  showElement("loading-hard"); // Assumes you have a "loading-hard" div
  hideElement("hard-game-ui"); // Assumes your game UI is in a "hard-game-ui" div

  try {
    // Fetch live data from Hugging Face dataset
    const huggingFaceUrl =
      "https://huggingface.co/datasets/Ijwi-ry-Ikirundi-AI/Kirundi_Open_Speech_Dataset/raw/main/metadata.csv";
    console.log("Hard Mode: Fetching live data for duplicate check...");

    const response = await fetch(huggingFaceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const csvText = await response.text();
    existingKirundiPhrases = new Set(); // Reset the global set for this mode
    const lines = csvText.split("\n");

    if (lines.length > 1) {
      const headers = parseCSVLine(lines[0]);
      const kirundiIndex = headers.findIndex(
        (h) =>
          h.toLowerCase().includes("kirundi") &&
          h.toLowerCase().includes("transcription")
      );

      if (kirundiIndex !== -1) {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const row = parseCSVLine(lines[i]);
            if (row[kirundiIndex] && row[kirundiIndex].trim()) {
              existingKirundiPhrases.add(row[kirundiIndex].trim());
            }
          }
        }
      }
    }
    console.log(
      `Hard Mode: Loaded ${existingKirundiPhrases.size} existing Kirundi phrases for duplicate checking.`
    );

    hideElement("loading-hard");
    showElement("hard-game-ui");
  } catch (error) {
    console.error("Error initializing Hard Mode:", error);

    // Show Hard Level Error UI if it exists
    const hardError = document.getElementById("hard-error");
    if (hardError) {
      hardError.classList.remove("hidden");
    } else {
      alert(
        currentLanguage === "fr"
          ? "Erreur de chargement de la base de données. Le contrôle des doublons est désactivé."
          : "Error loading database. Duplicate checking will be disabled."
      );
    }

    // Still show the game, but warn.
    hideElement("loading-hard");
    showElement("hard-game-ui");
    existingKirundiPhrases = new Set(); // Allow submission, but log a warning
  }
}

function addHardSentence() {
  const kirundiText = document.getElementById("hard-new-kirundi").value.trim();
  const frenchText = document.getElementById("hard-new-french").value.trim();

  // Validation
  if (!kirundiText || !frenchText) {
    const errorMessage =
      currentLanguage === "fr"
        ? "Les champs Kirundi et Français doivent être remplis."
        : "Both Kirundi and French fields must be filled.";
    showHardError(errorMessage);
    return;
  }

  // --- ADDED THIS VALIDATION ---
  // Critical: Check for duplicates
  if (
    existingKirundiPhrases.size > 0 &&
    existingKirundiPhrases.has(kirundiText)
  ) {
    const errorMessage =
      currentLanguage === "fr"
        ? "Cette traduction kirundi est déjà dans notre base de données! Merci!"
        : "This Kirundi translation is already in our database! Thank you!";
    showHardError(errorMessage);
    return;
  }
  // --- END OF VALIDATION ---

  // Add to array
  userHardSentences.push({
    kirundi: kirundiText,
    french: frenchText,
  });

  // Clear inputs
  document.getElementById("hard-new-kirundi").value = "";
  document.getElementById("hard-new-french").value = "";

  // Update UI
  updateHardSentenceCounter();

  // --- ADDED THIS LINE ---
  document.getElementById("submit-hard-button").disabled = false; // Enable submit button

  // Show success message
  showElement("hard-success-message");
  setTimeout(() => hideElement("hard-success-message"), 3000);

  // Hide error message if visible
  hideElement("hard-error-message");
}

async function submitHardSentences() {
  const submitButton = document.getElementById("submit-hard-button");
  if (submitButton) submitButton.disabled = true;
  submitButton.textContent =
    currentLanguage === "fr"
      ? "Soumission... veuillez patienter..."
      : "Submitting... please wait...";

  // --- THIS IS THE FIX ---
  // 1. Format the data from userHardSentences
  const formattedData = userHardSentences.map((sentence) => ({
    kirundi: sentence.kirundi,
    french: sentence.french,
  }));

  // 2. Create the payload with the correct data
  const payload = {
    mode: "medium", // We re-use the "medium" mode logic in the Google Sheet
    data: formattedData, // We send the user's *real* data
  };
  // --- END OF FIX ---

  console.log("Sending hard level payload:", JSON.stringify(payload, null, 2));

  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbznLwjbFfbf0UXxino2uA_i34YU629FgkY7CBsvgY9agJJbgzA3-8kbnEpTk52d9a-V/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }
    );

    console.log("Hard level request sent (cannot verify response due to CORS)");

    // We assume success because of 'no-cors'
    const message =
      currentLanguage === "fr"
        ? "Vos nouvelles phrases ont été soumises. Murakoze cane🙏🏾!"
        : "Your new sentences have been submitted. Murakoze cane🙏🏾!";
    showSuccessOverlay(message);

    resetHardMode();
  } catch (e) {
    console.error("Submission failed:", e);

    alert(
      currentLanguage === "fr"
        ? "Échec de la soumission! Veuillez réessayer."
        : "Submission failed! Please try again."
    );

    // Re-enable the button
    if (submitButton) {
      submitButton.textContent =
        currentLanguage === "fr" ? "Soumettre les phrases" : "Submit Sentences";
      submitButton.disabled = false;
    }
  }
}
// --- END OF HARD LEVEL SUBMISSION ---

// Download Functions
function downloadCSV(dataArray, filename) {
  if (dataArray.length === 0) {
    alert("No data to download!");
    return;
  }
  let csvContent = "Kirundi_Transcription,French_Translation\n";
  dataArray.forEach((item) => {
    const kirundi = `"${item.kirundi.replace(/"/g, '""')}"`;
    const french = `"${item.french.replace(/"/g, '""')}"`;
    csvContent += `${kirundi},${french}\n`;
  });
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function downloadTranslations() {
  if (userTranslations.length === 0) {
    alert("No data to download!");
    return;
  }
  let csvContent = "Original_Kirundi,Corrected_Kirundi,French_Translation\n";
  userTranslations.forEach((item) => {
    const originalKirundi = `"${item.original_kirundi.replace(/"/g, '""')}"`;
    const correctedKirundi = `"${item.corrected_kirundi.replace(/"/g, '""')}"`;
    const frenchTranslation = `"${item.french_translation.replace(
      /"/g,
      '""'
    )}"`;
    csvContent += `${originalKirundi},${correctedKirundi},${frenchTranslation}\n`;
  });
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "Kirundi_To_French.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  const submittedKirundiPhrases = userTranslations.map(
    (translation) => translation.original_kirundi
  );
  saveSubmittedPhrases(submittedKirundiPhrases);
}

function downloadMediumTranslations() {
  if (userMediumTranslations.length === 0) {
    alert("No translations to download!");
    return;
  }
  let csvContent = "Kirundi_Transcription,French_Translation\n";
  userMediumTranslations.forEach((item) => {
    const kirundi = `"${item.kirundi.replace(/"/g, '""')}"`;
    const french = `"${item.french.replace(/"/g, '""')}"`;
    csvContent += `${kirundi},${french}\n`;
  });
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "French_To_Kirundi.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  const submittedFrenchPhrases = userMediumTranslations.map(
    (translation) => translation.french
  );
  saveSubmittedFrenchPhrases(submittedFrenchPhrases);
}

function downloadHardSentences() {
  downloadCSV(userHardSentences, "my_new_sentences.csv");
}

// Hard Mode Functions (Add New Sentences)
// function initHardMode() {
//   hideElement("main-menu");
//   showElement("hard-mode");
//   resetHardMode();
// }

function addHardSentence() {
  const kirundiText = document.getElementById("hard-new-kirundi").value.trim();
  const frenchText = document.getElementById("hard-new-french").value.trim();

  // Validation
  if (!kirundiText || !frenchText) {
    const errorMessage =
      currentLanguage === "fr"
        ? "Les champs Kirundi et Français doivent être remplis."
        : "Both Kirundi and French fields must be filled.";
    showHardError(errorMessage);
    return;
  }

  // --- ADDED THIS VALIDATION ---
  // Critical: Check for duplicates
  if (
    existingKirundiPhrases.size > 0 &&
    existingKirundiPhrases.has(kirundiText)
  ) {
    const errorMessage =
      currentLanguage === "fr"
        ? "Cette traduction kirundi est déjà dans notre base de données! Merci!"
        : "This Kirundi translation is already in our database! Thank you!";
    showHardError(errorMessage);
    return;
  }
  // --- END OF VALIDATION ---

  // Add to array
  userHardSentences.push({
    kirundi: kirundiText,
    french: frenchText,
  });

  // Clear inputs
  document.getElementById("hard-new-kirundi").value = "";
  document.getElementById("hard-new-french").value = "";

  // Update UI
  updateHardSentenceCounter();

  // --- ADDED THIS LINE ---
  document.getElementById("submit-hard-button").disabled = false; // Enable submit button

  // Show success message
  showElement("hard-success-message");
  setTimeout(() => hideElement("hard-success-message"), 3000);

  // Hide error message if visible
  hideElement("hard-error-message");
}

function showHardError(message) {
  const errorElement = document.getElementById("hard-error-message");
  errorElement.textContent = message;
  showElement("hard-error-message");

  // Hide after 5 seconds
  setTimeout(() => hideElement("hard-error-message"), 5000);
}

function updateHardSentenceCounter() {
  const counterElement = document.getElementById("sentence-counter");
  if (currentLanguage === "fr") {
    counterElement.textContent = `Vous avez ajouté ${
      userHardSentences.length
    } phrase${userHardSentences.length !== 1 ? "s" : ""}.`;
  } else {
    counterElement.textContent = `You have added ${
      userHardSentences.length
    } sentence${userHardSentences.length !== 1 ? "s" : ""}.`;
  }
}

function resetHardMode() {
  userHardSentences = [];
  document.getElementById("hard-new-kirundi").value = "";
  document.getElementById("hard-new-french").value = "";
  updateHardSentenceCounter();
  hideElement("hard-error-message");
  hideElement("hard-success-message");

  // --- THIS IS THE FIX ---
  // Make sure the submit button is reset correctly
  const submitButton = document.getElementById("submit-hard-button");
  if (submitButton) {
    // You should disable it until a user adds a sentence
    submitButton.disabled = true;
    submitButton.textContent =
      currentLanguage === "fr" ? "Soumettre les phrases" : "Submit Sentences";
  }
  // --- END OF FIX ---
}

// Keyboard shortcuts
document.addEventListener("keydown", function (event) {
  // Easy mode shortcuts
  if (!document.getElementById("easy-mode").classList.contains("hidden")) {
    if (event.key === "Enter" && event.ctrlKey) {
      nextEasyPhrase();
    } else if (event.key === "Escape") {
      skipEasyPhrase();
    }
  }

  // Medium mode shortcuts (French to Kirundi)
  if (!document.getElementById("medium-mode").classList.contains("hidden")) {
    if (event.key === "Enter" && event.ctrlKey) {
      submitMediumTranslation();
    } else if (event.key === "Escape") {
      skipMediumSentence();
    }
  }

  // Hard mode shortcuts (Add new sentences)
  if (!document.getElementById("hard-mode").classList.contains("hidden")) {
    if (event.key === "Enter" && event.ctrlKey) {
      addHardSentence();
    }
  }
});

// Language Toggle Function
function toggleLanguage() {
  try {
    console.log("Language toggle clicked. Current language:", currentLanguage);

    currentLanguage = currentLanguage === "en" ? "fr" : "en";
    console.log("New language:", currentLanguage);

    updateLanguageUI();
    translateInterface();
    updateGamification(); // Update rank title translation

    console.log("Language toggle completed successfully");
  } catch (error) {
    console.error("Error in toggleLanguage:", error);
  }
}

function updateLanguageUI() {
  const textElement = document.getElementById("language-text");
  if (!textElement) return;

  // Button shows the language you can switch TO
  textElement.textContent = currentLanguage === "fr" ? "EN" : "FR";
}

function translateInterface() {
  try {
    // Hide any inappropriate success messages during translation
    const successElements = [
      "hard-success-message",
      "medium-success-message",
      "success-message",
    ];
    successElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.classList.add("hidden");
    });

    console.log("Translation function started for language:", currentLanguage);
  } catch (error) {
    console.error("Error in translateInterface:", error);
    return;
  }

  const translations = {
    en: {
      supportBtn: "Support",
      needHelp: "Need Help?",
      supportDesc:
        "For questions, feedback, or technical support, reach out anytime:",
      whatsappBtn: "WhatsApp",
      emailBtn: "Email",
      // Medium Level - Live data error
      mediumErrorTitle: "Unable to load Medium Mode",
      mediumErrorMessage:
        "We could not load the French prompts for Medium Mode. Please check your internet connection, then return to the main menu and try again.",
      mediumErrorCta: "← Back to main menu",
      title: "Ijwi ry'Ikirundi AI",
      subtitle: "Contribution Hub",
      mission:
        "Help us build the future of Kirundi language AI through community collaboration.",
      preserving: "Preserving Heritage",
      building: "Building Future",
      empowering: "Empowering Community",
      easyLevel: "Easy Level",
      easyDesc: "Translate Kirundi → French",
      mediumLevel: "Medium Level",
      mediumDesc: "Translate French → Kirundi",
      hardLevel: "Hard Level",
      hardDesc: "Add original sentence pairs",
      skipHelp: "Don't know the answer?",
      skipText: 'No problem! Click "Skip" or press',
      skipAction: "to move to the next",
      // Main menu
      chooseLevel: "Choose your level",
      selectType:
        "Three ways to grow the Kirundi dataset. Start at the level that suits you.",
      contributionNotice:
        "Your contributions enrich the Ijwi ry'Ikirundi AI dataset, whose full version is private.",
      // Game interface
      backToMenu: "← Back to Menu",
      skip: "⏭️ Skip",
      submitTranslation: "Submit Translation →",
      progress: "Progress",
      shortcuts: "💡 Shortcuts: Ctrl+Enter to submit • Escape to skip",
      // Easy Level
      easyTitle: "Easy Level: Translation Game",
      kirundiPhrase: "Kirundi Phrase:",
      frenchTranslation: "Your French Translation:",
      aiSuggestionText: "AI suggestion: ",
      // Easy Level - Placeholders
      easyPlaceholder: "Type your French translation here...",
      // Medium Level
      mediumTitle: "Medium Level: Translate French to Kirundi",
      mediumDesc2:
        "Translate French sentences to Kirundi. Your translations will be checked against our database to avoid duplicates.",
      frenchSentence: "French Sentence:",
      kirundiTranslation: "Your Kirundi Translation:",
      // Medium Level - Placeholders
      mediumPlaceholder: "Type your Kirundi translation here...",
      // Hard Level
      hardTitle: "Hard Level: Add New Sentences",
      hardDesc2:
        "Create new Kirundi-French sentence pairs. Make sure your Kirundi sentences are meaningful and contain at least 4 words.",
      sentenceCounter: "You have added 0 sentences.",
      newKirundiSentence: "New Kirundi Sentence:",
      frenchTranslationLabel: "French Translation:",
      addSentence: "Add Sentence",
      downloadMySentences: "Download My Sentences",
      // Hard Level - Placeholders
      kirundiPlaceholder: "Enter a new Kirundi sentence...",
      frenchPlaceholder: "Enter a new French sentence...",
      // Easy Level - Completion
      congratulations: "Congratulations!",
      completedBatch: "You've completed a batch of translations!",
      downloadCsv: "Download Kirundi_To_French.csv",
      // Easy Level - Messages
      easyErrorMessage: "Please enter a translation before continuing.",
      fetchingLiveData: "Fetching live data from Hugging Face...",
      loadingUntranslated:
        "Loading untranslated phrases from the official dataset",
      // WhatsApp Sharing
      sendCsvFile: "📱 Send CSV File",
      whatsappInstructions:
        "Click to open WhatsApp, then attach your CSV file:",
      whatsappWarning:
        "⚠️ You'll need to manually attach the CSV file after WhatsApp opens",
      openWhatsappChat: "💬 Open WhatsApp Chat",
      // Medium Level - Additional
      translationAdded: "Translation added successfully!",
      excellentWork: "Excellent Work!",
      completedFrenchBatch:
        "You've completed a batch of French to Kirundi translations!",
      downloadMediumCsv: "Download French_To_Kirundi.csv",
      // Medium Level - Loading & Messages
      loadingMediumData: "Loading French prompts and checking database...",
      preparingSession: "Preparing your translation session",
      mediumErrorMessage: "Please enter a translation before continuing.",
      // Hard Level - Messages
      sentencePairAdded: "Sentence pair added successfully!",
      hardErrorMessage: "Both Kirundi and French fields must be filled.",
      // Footer
      footerDescription:
        "Preserving and advancing the Kirundi language through artificial intelligence and community collaboration.",
      footerBuilt: "Ikirundi cacu, Ijwi ryacu.",
      poweredBy: "Powered by Ijwi Ry'Ikirundi AI Team",
      footerColProject: "Project",
      footerColContribute: "Contribute",
      footerColContact: "Contact",
      footerEasy: "Easy Level",
      footerMedium: "Medium Level",
      footerHard: "Hard Level",
      footerWhatsappCommunity: "WhatsApp Community",
      // Easy Level - Live data error
      easyErrorTitle: "Unable to load live data",
      easyErrorMessage:
        "We could not load Kirundi sentences from the live Hugging Face dataset. Please check your internet connection, then return to the main menu and try again.",
      // Report Problem Feature
      reportProblem: "Report a problem with this sentence",
      reportHelpText: "Click if you find errors in the Kirundi sentence",
      cancelCorrection: "Cancel correction",
      correctionLabel: "Correct the Kirundi sentence:",
      correctionPlaceholder: "Fix any errors in the Kirundi sentence...",
      correctionHelp: "Help:",
      correctionInstructions:
        "Fix any spelling, grammar, or other errors in the Kirundi sentence above.",
      approveSuggestion: "Approve Suggestion",
      editTranslation: "Edit Translation",
      // Gamification & Infinite Mode
      sessionCounter: "Translations in this session:",
      saveAndSubmit: "Save & Submit",
      submitAnytime: "You can submit anytime, even with just 1 translation!",
      yourRank: "Your Rank / Iteka Ryawe",
      totalContributions: "Total Contributions:",
      // Rank Journey
      nextRank: "Next Rank",
      toGo: "to go",
      contributions: "Contributions",
      communityBadge: "Community-Built AI",
    },
    fr: {
      supportBtn: "Assistance",
      needHelp: "Besoin d’aide ?",
      supportDesc:
        "Pour toute question, suggestion ou assistance technique, contactez-nous :",
      whatsappBtn: "WhatsApp",
      emailBtn: "Email",
      // Medium Level - Live data error
      mediumErrorTitle: "Erreur de chargement du mode Moyen",
      mediumErrorMessage:
        "Nous n'avons pas pu charger les phrases françaises pour le mode Moyen. Veuillez vérifier votre connexion Internet, puis revenir au menu principal pour réessayer.",
      title: "Ijwi ry'Ikirundi AI",
      subtitle: "Hub de Contribution",
      mission:
        "Aidez-nous à construire l'avenir de l'IA en langue Kirundi grâce à la collaboration communautaire.",
      preserving: "Préserver l'Héritage",
      building: "Construire l'Avenir",
      empowering: "Autonomiser la Communauté",
      easyLevel: "Niveau Facile",
      easyDesc: "Traduire Kirundi → Français",
      mediumLevel: "Niveau Moyen",
      mediumDesc: "Traduire Français → Kirundi",
      hardLevel: "Niveau Difficile",
      hardDesc: "Ajouter des paires originales",
      skipHelp: "Vous ne connaissez pas la réponse?",
      skipText: 'Pas de problème! Cliquez sur "Ignorer" ou appuyez sur',
      skipAction: "pour passer à la",
      // Main menu
      chooseLevel: "Choisissez votre niveau",
      selectType:
        "Trois façons d'enrichir le dataset Kirundi. Commencez au niveau qui vous convient.",
      contributionNotice:
        "Vos contributions enrichissent le dataset d'Ijwi ry'Ikirundi AI, dont la version complète est privée.",
      // Game interface
      backToMenu: "← Retour au Menu",
      skip: "⏭️ Ignorer",
      submitTranslation: "Soumettre la Traduction →",
      progress: "Progrès",
      shortcuts:
        "💡 Raccourcis: Ctrl+Entrée pour soumettre • Échap pour ignorer",
      // Easy Level
      easyTitle: "Niveau Facile: Jeu de Traduction",
      kirundiPhrase: "Phrase Kirundi:",
      frenchTranslation: "Votre Traduction Française:",
      aiSuggestionText: "Suggestion IA : ",
      // Easy Level - Placeholders
      easyPlaceholder: "Tapez votre traduction française ici...",
      // Medium Level
      mediumTitle: "Niveau Moyen: Traduire Français vers Kirundi",
      mediumDesc2:
        "Traduisez les phrases françaises en kirundi. Vos traductions seront vérifiées dans notre base de données pour éviter les doublons.",
      frenchSentence: "Phrase Française:",
      kirundiTranslation: "Votre Traduction Kirundi:",
      // Medium Level - Placeholders
      mediumPlaceholder: "Tapez votre traduction en kirundi ici...",
      // Hard Level
      hardTitle: "Niveau Difficile: Ajouter de Nouvelles Phrases",
      hardDesc2:
        "Créez de nouvelles paires de phrases kirundi-français. Assurez-vous que vos phrases kirundi sont significatives et contiennent au moins 4 mots.",
      sentenceCounter: "Vous avez ajouté 0 phrases.",
      newKirundiSentence: "Nouvelle Phrase Kirundi:",
      frenchTranslationLabel: "Traduction Française:",
      addSentence: "Ajouter une Phrase",
      downloadMySentences: "Télécharger Mes Phrases",
      // Hard Level - Placeholders
      kirundiPlaceholder: "Entrez une nouvelle phrase kirundi...",
      frenchPlaceholder: "Entrez une nouvelle phrase française...",
      // Easy Level - Completion
      congratulations: "Félicitations!",
      completedBatch: "Vous avez terminé un lot de traductions!",
      downloadCsv: "Télécharger Kirundi_To_French.csv",
      // Easy Level - Messages
      easyErrorMessage: "Veuillez entrer une traduction avant de continuer.",
      fetchingLiveData:
        "Récupération des données en direct depuis Hugging Face...",
      loadingUntranslated:
        "Chargement des phrases non traduites du jeu de données officiel",
      // WhatsApp Sharing
      sendCsvFile: "📱 Envoyer le Fichier CSV",
      whatsappInstructions:
        "Cliquez pour ouvrir WhatsApp, puis joignez votre fichier CSV:",
      whatsappWarning:
        "⚠️ Vous devrez joindre manuellement le fichier CSV après l'ouverture de WhatsApp",
      openWhatsappChat: "💬 Ouvrir le Chat WhatsApp",
      // Medium Level - Additional
      translationAdded: "Traduction ajoutée avec succès!",
      excellentWork: "Excellent Travail!",
      completedFrenchBatch:
        "Vous avez terminé un lot de traductions français vers kirundi!",
      downloadMediumCsv: "Télécharger French_To_Kirundi.csv",
      // Medium Level - Loading & Messages
      loadingMediumData:
        "Chargement des phrases françaises et vérification de la base de données...",
      preparingSession: "Préparation de votre session de traduction",
      mediumErrorMessage: "Veuillez entrer une traduction avant de continuer.",
      // Hard Level - Messages
      sentencePairAdded: "Paire de phrases ajoutée avec succès!",
      hardErrorMessage: "Les champs Kirundi et Français doivent être remplis.",
      // Footer
      footerDescription:
        "Préserver et faire progresser la langue Kirundi grâce à l'intelligence artificielle et à la collaboration communautaire.",
      footerBuilt: "Ikirundi cacu, Ijwi ryacu.",
      poweredBy: "Propulsé par l'Équipe Ijwi Ry'Ikirundi AI",
      footerColProject: "Projet",
      footerColContribute: "Contribuer",
      footerColContact: "Contact",
      footerEasy: "Niveau Facile",
      footerMedium: "Niveau Moyen",
      footerHard: "Niveau Difficile",
      footerWhatsappCommunity: "Communauté WhatsApp",
      // Easy Level - Live data error
      easyErrorTitle: "Erreur de chargement des données",
      easyErrorMessage:
        "Nous n'avons pas pu charger les phrases kirundi en direct depuis Hugging Face. Veuillez vérifier votre connexion Internet, puis revenir au menu principal pour réessayer.",
      // Report Problem Feature
      reportProblem: "Signaler un problème avec cette phrase",
      reportHelpText:
        "Cliquez si vous trouvez des erreurs dans la phrase kirundi",
      cancelCorrection: "Annuler la correction",
      correctionLabel: "Corriger la phrase kirundi:",
      correctionPlaceholder: "Corrigez les erreurs dans la phrase kirundi...",
      correctionHelp: "Aide:",
      correctionInstructions:
        "Corrigez les fautes d'orthographe, de grammaire ou autres erreurs dans la phrase kirundi ci-dessus.",
      approveSuggestion: "Approuver la Suggestion",
      editTranslation: "Modifier la Traduction",
      // Gamification & Infinite Mode
      sessionCounter: "Traductions dans cette session:",
      saveAndSubmit: "Enregistrer et Soumettre",
      submitAnytime:
        "Vous pouvez soumettre à tout moment, même avec 1 seule traduction!",
      yourRank: "Votre Rang / Iteka Ryawe",
      totalContributions: "Contributions Totales:",
      // Rank Journey
      nextRank: "Prochain Rang",
      toGo: "restants",
      contributions: "Contributions",
      communityBadge: "IA construite par la communauté",
    },
  };

  const t = translations[currentLanguage];

  // Update main interface elements
  const elements = {
    subtitle: t.subtitle,
    "mission-text": t.mission,
    "preserving-text": t.preserving,
    "building-text": t.building,
    "empowering-text": t.empowering,
    "footer-description": t.footerDescription,
    "footer-built": t.footerBuilt,
    "fetching-live-data": t.fetchingLiveData,
    "loading-untranslated": t.loadingUntranslated,
    "loading-medium-data": t.loadingMediumData,
    "preparing-session": t.preparingSession,
    "easy-error-text": t.easyErrorMessage,
    "easy-progress-label": t.progress,
    "medium-progress-label": t.progress,
    "medium-progress-label": t.progress,
    "medium-success-text": t.translationAdded,
    "medium-instructions": t.mediumDesc2,
    "hard-instructions": t.hardDesc2,
    // Easy Level - Error UI
    "easy-error-title": t.easyErrorTitle,
    "easy-error-message": t.easyErrorMessage,
    // NOTE: ai-suggestion-msg-text is handled separately below to preserve the suggestion
    // Medium Level - Error UI
    "medium-error-title": t.mediumErrorTitle,
    "medium-error-message": t.mediumErrorMessage,
    // Report Problem Feature
    "report-problem-text": t.reportProblem,
    "report-help-text": t.reportHelpText,
    "correction-label": t.correctionLabel,
    "correction-help": t.correctionHelp,
    "correction-instructions": t.correctionInstructions,
    "approve-btn-text": t.approveSuggestion,
    "edit-btn-text": t.editTranslation,
    // Hard Level - Success message
    "hard-success-text": t.sentencePairAdded,
  };

  // Special handling for error messages that might be dynamically generated
  const errorElements = {
    "error-message": t.easyErrorMessage,
    "medium-error-message": t.mediumErrorMessage,
    "hard-error-message": t.hardErrorMessage,
  };

  // Update error messages if they exist and contain the expected text
  Object.keys(errorElements).forEach((id) => {
    const element = document.getElementById(id);
    if (element && errorElements[id]) {
      // Check if element contains error text and update accordingly (bidirectional)
      if (
        id === "error-message" &&
        (element.textContent.includes("Please enter a translation") ||
          element.textContent.includes("Veuillez entrer une traduction"))
      ) {
        element.textContent = errorElements[id];
      } else if (
        id === "medium-error-message" &&
        (element.textContent.includes("Please enter a translation") ||
          element.textContent.includes("Veuillez entrer une traduction"))
      ) {
        element.textContent = errorElements[id];
      } else if (
        id === "hard-error-message" &&
        (element.textContent.includes("Both Kirundi and French fields") ||
          element.textContent.includes("Les champs Kirundi et Français"))
      ) {
        element.textContent = errorElements[id];
      }
    }
  });

  // Special handling for "Powered by" element to preserve HTML formatting
  const poweredByElement = document.getElementById("powered-by");
  if (poweredByElement) {
    if (currentLanguage === "fr") {
      poweredByElement.innerHTML =
        'Propulsé par <span class="footer-powered-em">l\'Équipe Ijwi Ry\'Ikirundi AI</span>';
    } else {
      poweredByElement.innerHTML =
        'Powered by <span class="footer-powered-em">Ijwi Ry\'Ikirundi AI Team</span>';
    }
  }

  // Update elements if they exist
  Object.keys(elements).forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = elements[id];
    }
  });

  // Special handling for AI suggestion label (text stays the same, only label changes)
  const aiSuggestionLabel = document.getElementById("ai-suggestion-label");
  if (aiSuggestionLabel) {
    aiSuggestionLabel.textContent =
      currentLanguage === "fr" ? "Suggestion IA" : "AI Suggestion";
  }
  // Note: ai-suggestion-text contains only the suggestion and doesn't need translation

  // Update main menu elements
  const mainMenuElements = document.querySelectorAll("[data-translate]");
  mainMenuElements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (t[key]) {
      element.textContent = t[key];
    }
  });

  // Update buttons and labels by text content - improved bidirectional translation
  const buttonMappings = [
    // Back to Menu buttons
    {
      selector: "button",
      containsEn: "← Back to Menu",
      containsFr: "← Retour au Menu",
      newText: t.backToMenu,
    },
    // Skip buttons
    {
      selector: "button",
      containsEn: "⏭️ Skip",
      containsFr: "⏭️ Ignorer",
      newText: t.skip,
    },
    // Submit buttons
    {
      selector: "button",
      containsEn: "Submit Translation",
      containsFr: "Soumettre la Traduction",
      newText: t.submitTranslation,
    },
    // Add sentence buttons
    {
      selector: "button",
      containsEn: "Add Sentence",
      containsFr: "Ajouter une Phrase",
      newText: t.addSentence,
    },
    // Download buttons
    {
      selector: "button",
      containsEn: "Download My Sentences",
      containsFr: "Télécharger Mes Phrases",
      newText: t.downloadMySentences,
    },
    {
      selector: "button",
      containsEn: "Download Kirundi_To_French.csv",
      containsFr: "Télécharger Kirundi_To_French.csv",
      newText: t.downloadCsv,
    },
    {
      selector: "button",
      containsEn: "Download French_To_Kirundi.csv",
      containsFr: "Télécharger French_To_Kirundi.csv",
      newText: t.downloadMediumCsv,
    },
    {
      selector: "button",
      containsEn: "💬 Open WhatsApp Chat",
      containsFr: "💬 Ouvrir le Chat WhatsApp",
      newText: t.openWhatsappChat,
    },
    // Labels
    {
      selector: "label",
      containsEn: "Kirundi Phrase:",
      containsFr: "Phrase Kirundi:",
      newText: t.kirundiPhrase,
    },
    {
      selector: "label",
      containsEn: "Your French Translation:",
      containsFr: "Votre Traduction Française:",
      newText: t.frenchTranslation,
    },
    {
      selector: "label",
      containsEn: "French Sentence:",
      containsFr: "Phrase Française:",
      newText: t.frenchSentence,
    },
    {
      selector: "label",
      containsEn: "Your Kirundi Translation:",
      containsFr: "Votre Traduction Kirundi:",
      newText: t.kirundiTranslation,
    },
    {
      selector: "label",
      containsEn: "New Kirundi Sentence:",
      containsFr: "Nouvelle Phrase Kirundi:",
      newText: t.newKirundiSentence,
    },
    {
      selector: "label",
      containsEn: "French Translation:",
      containsFr: "Traduction Française:",
      newText: t.frenchTranslationLabel,
    },
    // Headers
    {
      selector: "h2",
      containsEn: "Easy Level: Translation Game",
      containsFr: "Niveau Facile: Jeu de Traduction",
      newText: t.easyTitle,
    },
    {
      selector: "h2",
      containsEn: "Medium Level: Translate French to Kirundi",
      containsFr: "Niveau Moyen: Traduire Français vers Kirundi",
      newText: t.mediumTitle,
    },
    {
      selector: "h2",
      containsEn: "Hard Level: Add New Sentences",
      containsFr: "Niveau Difficile: Ajouter de Nouvelles Phrases",
      newText: t.hardTitle,
    },
    // Completion messages
    {
      selector: "h3",
      containsEn: "Congratulations!",
      containsFr: "Félicitations!",
      newText: t.congratulations,
    },
    {
      selector: "h3",
      containsEn: "Excellent Work!",
      containsFr: "Excellent Travail!",
      newText: t.excellentWork,
    },
    {
      selector: "p",
      containsEn: "You've completed a batch of translations!",
      containsFr: "Vous avez terminé un lot de traductions!",
      newText: t.completedBatch,
    },
    {
      selector: "p",
      containsEn: "You've completed a batch of French to Kirundi translations!",
      containsFr:
        "Vous avez terminé un lot de traductions français vers kirundi!",
      newText: t.completedFrenchBatch,
    },
    // WhatsApp elements
    {
      selector: "h4",
      containsEn: "📱 Send CSV File",
      containsFr: "📱 Envoyer le Fichier CSV",
      newText: t.sendCsvFile,
    },
    {
      selector: "p",
      containsEn: "Click to open WhatsApp, then attach your CSV file:",
      containsFr:
        "Cliquez pour ouvrir WhatsApp, puis joignez votre fichier CSV:",
      newText: t.whatsappInstructions,
    },
    {
      selector: "p",
      containsEn:
        "⚠️ You'll need to manually attach the CSV file after WhatsApp opens",
      containsFr:
        "⚠️ Vous devrez joindre manuellement le fichier CSV après l'ouverture de WhatsApp",
      newText: t.whatsappWarning,
    },
    // Loading messages
    {
      selector: "p",
      containsEn: "Loading French prompts and checking database...",
      containsFr:
        "Chargement des phrases françaises et vérification de la base de données...",
      newText: t.loadingMediumData,
    },
    {
      selector: "p",
      containsEn: "Preparing your translation session",
      containsFr: "Préparation de votre session de traduction",
      newText: t.preparingSession,
    },
  ];

  buttonMappings.forEach((mapping) => {
    const elements = document.querySelectorAll(mapping.selector);
    elements.forEach((element) => {
      // Check if element contains either English or French text
      const containsEnglish =
        mapping.containsEn && element.textContent.includes(mapping.containsEn);
      const containsFrench =
        mapping.containsFr && element.textContent.includes(mapping.containsFr);

      if (containsEnglish || containsFrench) {
        element.textContent = mapping.newText;
      }
    });
  });

  // Update shortcuts text
  const shortcutsElements = document.querySelectorAll(".text-sm.text-gray-600");
  shortcutsElements.forEach((element) => {
    if (
      element.textContent.includes("Shortcuts:") ||
      element.textContent.includes("Raccourcis:")
    ) {
      element.innerHTML = t.shortcuts;
    }
  });

  // Update placeholders
  const placeholderMappings = [
    { id: "french-input", placeholder: t.easyPlaceholder },
    { id: "kirundi-translation", placeholder: t.mediumPlaceholder },
    { id: "hard-new-kirundi", placeholder: t.kirundiPlaceholder },
    { id: "hard-new-french", placeholder: t.frenchPlaceholder },
    { id: "correction-box", placeholder: t.correctionPlaceholder },
  ];

  placeholderMappings.forEach((mapping) => {
    const element = document.getElementById(mapping.id);
    if (element && mapping.placeholder) {
      element.placeholder = mapping.placeholder;
    }
  });

  // Update dynamic sentence counter for Hard Level
  const sentenceCounterElement = document.getElementById("sentence-counter");
  if (sentenceCounterElement && currentLanguage === "fr") {
    const count = sentenceCounterElement.textContent.match(/\d+/);
    if (count) {
      sentenceCounterElement.textContent = `Vous avez ajouté ${
        count[0]
      } phrase${count[0] !== "1" ? "s" : ""}.`;
    }
  } else if (sentenceCounterElement && currentLanguage === "en") {
    const count = sentenceCounterElement.textContent.match(/\d+/);
    if (count) {
      sentenceCounterElement.textContent = `You have added ${
        count[0]
      } sentence${count[0] !== "1" ? "s" : ""}.`;
    }
  }

  // Update button texts
  const buttons = document.querySelectorAll(".level-button-text");
  buttons.forEach((button, index) => {
    if (index === 0) button.textContent = t.easyLevel;
    if (index === 1) button.textContent = t.mediumLevel;
    if (index === 2) button.textContent = t.hardLevel;
  });

  // Update descriptions
  const descriptions = document.querySelectorAll(".level-description");
  descriptions.forEach((desc, index) => {
    if (index === 0) desc.textContent = t.easyDesc;
    if (index === 1) desc.textContent = t.mediumDesc;
    if (index === 2) desc.textContent = t.hardDesc;
  });

  // Update skip help text
  const skipHelps = document.querySelectorAll(".skip-help-text");
  skipHelps.forEach((help) => {
    const parts = help.innerHTML.split("<kbd");
    if (parts.length > 1) {
      help.innerHTML = `<span class="font-medium">💡 ${t.skipHelp}</span> ${
        t.skipText
      } <kbd${parts[1].split("</kbd>")[0]}</kbd> ${t.skipAction} ${
        currentLanguage === "en" ? "phrase." : "phrase suivante."
      }`;
    }
  });
}

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  // App is ready
  console.log("Kirundi Contribution App loaded successfully!");
  updateLanguageUI();

  // Initialize dark mode from localStorage
  initializeDarkMode();
});

// Dark Mode Toggle Function
function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");

  if (isDark) {
    html.classList.remove("dark");
    localStorage.setItem("darkMode", "false");
  } else {
    html.classList.add("dark");
    localStorage.setItem("darkMode", "true");
  }

  console.log(`Dark mode ${isDark ? "disabled" : "enabled"}`);
}

// Initialize dark mode from localStorage
function initializeDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  const html = document.documentElement;

  // Only enable dark mode if explicitly set by user
  if (darkMode === "true") {
    html.classList.add("dark");
  } else {
    // Default to light mode
    html.classList.remove("dark");
  }
}

// Set current year in footer
function setCurrentYear() {
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Gamification System
function updateGamification() {
  const totalEasy = getSubmittedPhrasesCount();
  const totalMedium = getSubmittedFrenchPhrases().length;
  const totalContributions = totalEasy + totalMedium;

  // Update total count - motion.js counts it up when present
  const countElement = document.getElementById("total-contribution-count");
  if (countElement) {
    if (window.motion && window.motion.countUp) {
      window.motion.countUp(countElement, totalContributions);
    } else {
      countElement.textContent = totalContributions;
    }
  }

  // Rank Tiers Definition
  const ranks = [
    {
      min: 0,
      icon: "🌱",
      titleEn: "Inyuka (Beginner)",
      titleFr: "Inyuka (Débutant)",
    },
    {
      min: 10,
      icon: "🔨",
      titleEn: "Umukozi (Worker)",
      titleFr: "Umukozi (Travailleur)",
    },
    {
      min: 50,
      icon: "🚀",
      titleEn: "Umumenyi (Skilled)",
      titleFr: "Umumenyi (Compétent)",
    },
    {
      min: 100,
      icon: "⭐",
      titleEn: "Inararibonye (Expert)",
      titleFr: "Inararibonye (Expert)",
    },
    {
      min: 500,
      icon: "👑",
      titleEn: "Intwari (Hero)",
      titleFr: "Intwari (Héros)",
    },
    {
      min: 1000,
      icon: "🦁",
      titleEn: "Intare (Legend)",
      titleFr: "Intare (Légende)",
    },
  ];

  // Determine current rank
  let currentRankIndex = 0;
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (totalContributions >= ranks[i].min) {
      currentRankIndex = i;
      break;
    }
  }

  const currentRank = ranks[currentRankIndex];
  const nextRank = ranks[currentRankIndex + 1];

  // Update Current Rank UI
  const iconElement = document.getElementById("user-rank-icon");
  const titleElement = document.getElementById("user-rank-title");

  if (iconElement) iconElement.textContent = currentRank.icon;
  if (titleElement) {
    titleElement.textContent =
      currentLanguage === "fr" ? currentRank.titleFr : currentRank.titleEn;
  }

  // Update Next Rank UI & Progress Bar
  const nextRankTitleElement = document.getElementById("next-rank-title");
  const contributionsLeftElement =
    document.getElementById("contributions-left");
  const progressBar = document.getElementById("rank-progress-bar");
  const progressPercentageText = document.getElementById("progress-percentage");

  if (nextRank) {
    // We have a next rank
    const nextRankMin = nextRank.min;
    const prevRankMin = currentRank.min;
    const toGo = nextRankMin - totalContributions;

    // Calculate percentage within the current tier
    const progressInTier = totalContributions - prevRankMin;
    const tierSpan = nextRankMin - prevRankMin;
    const percentage = Math.min(
      100,
      Math.max(0, (progressInTier / tierSpan) * 100)
    );

    if (nextRankTitleElement) {
      // Extract just the Kirundi name for the "Next Rank" display to keep it short
      const nextTitle =
        currentLanguage === "fr" ? nextRank.titleFr : nextRank.titleEn;
      const shortTitle = nextTitle.split(" (")[0];
      nextRankTitleElement.textContent = shortTitle;
    }
    if (contributionsLeftElement) contributionsLeftElement.textContent = toGo;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressPercentageText)
      progressPercentageText.textContent = `${Math.round(percentage)}%`;
  } else {
    // Max rank reached
    if (nextRankTitleElement) nextRankTitleElement.textContent = "Max Rank";
    if (contributionsLeftElement) contributionsLeftElement.textContent = "0";
    if (progressBar) progressBar.style.width = "100%";
    if (progressPercentageText) progressPercentageText.textContent = "100%";
  }

  // Update Timeline UI
  const timelineSteps = document.querySelectorAll(".rank-step");
  timelineSteps.forEach((step) => {
    const min = parseInt(step.getAttribute("data-min"), 10);
    step.classList.remove("is-active", "is-done", "is-locked");

    if (totalContributions >= min) {
      if (min === currentRank.min) {
        step.classList.add("is-active");
      } else {
        step.classList.add("is-done");
      }
    } else {
      step.classList.add("is-locked");
    }
  });
}

// Call setCurrentYear and updateGamification when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  setCurrentYear();
  updateGamification();
});
