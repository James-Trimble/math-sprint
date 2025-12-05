import { setCurrentModalId } from './state.js';

// --- HTML Element References ---
export const allScreens = document.querySelectorAll(".screen");
export const readyScreen = document.getElementById("ready-screen");
export const mainMenuScreen = document.getElementById("main-menu");
export const gameScreen = document.getElementById("game-screen");
export const gameOverScreen = document.getElementById("game-over-screen");
export const highScoreScreen = document.getElementById("high-score-screen");
export const settingsScreen = document.getElementById("settings-screen");
export const whatsNewPopup = document.getElementById("whats-new-popup");

// Buttons & Inputs
export const beginBtn = document.getElementById("begin-btn");
export const sprintModeBtn = document.getElementById("sprint-mode-btn");
export const endlessModeBtn = document.getElementById("endless-mode-btn"); // NEW
export const settingsBtn = document.getElementById("settings-btn");
export const gameForm = document.getElementById("game-form");
export const problemEl = document.getElementById("problem");
export const answerEl = document.getElementById("answer");
export const submitBtn = document.getElementById("submit");
export const feedbackEl = document.getElementById("feedback");

// Stats & Visuals
export const scoreEl = document.getElementById("score");
export const timerEl = document.getElementById("timer");
export const livesEl = document.getElementById("lives"); // NEW
export const gabrielContainer = document.getElementById("gabriel-container"); // NEW
export const gabrielSprite = document.getElementById("gabriel-sprite"); // NEW

// Overlays
export const countdownOverlay = document.getElementById("countdown-overlay");
export const countdownText = document.getElementById("countdown-text");

// End Game Elements
export const finalScoreEl = document.getElementById("final-score");
export const playAgainBtn = document.getElementById("play-again-btn");
export const mainMenuGameOverBtn = document.getElementById("main-menu-game-over-btn");
export const problemsAnsweredEl = document.getElementById("problems-answered");
export const correctAnswersEl = document.getElementById("correct-answers");
export const accuracyEl = document.getElementById("accuracy");
export const newHighScoreEl = document.getElementById("new-high-score");
export const playAgainHighScoreBtn = document.getElementById("play-again-high-score-btn");
export const mainMenuHighScoreBtn = document.getElementById("main-menu-high-score-btn");
export const scoreBreakdownBtn = document.getElementById("score-breakdown-btn");

// Settings Elements
export const backToMenuBtn = document.getElementById("back-to-menu-btn");
export const tabs = document.querySelectorAll("[role='tab']");
export const tabPanels = document.querySelectorAll("[role='tabpanel']");
export const masterVolumeSlider = document.getElementById("master-volume");
export const musicVolumeSlider = document.getElementById("music-volume");
export const sfxVolumeSlider = document.getElementById("sfx-volume");
export const opAddition = document.getElementById("op-addition");
export const opSubtraction = document.getElementById("op-subtraction");
export const opMultiplication = document.getElementById("op-multiplication");
export const opDivision = document.getElementById("op-division");
export const operationCheckboxes = [opAddition, opSubtraction, opMultiplication, opDivision];
export const disableCountdownToggle = document.getElementById("disable-countdown");
export const contrastBtn = document.getElementById("contrast-toggle-settings");
export const closePopupBtn = document.getElementById("close-popup-btn");
export const copyrightYearEl = document.getElementById("copyright-year");
export const versionNumberEl = document.getElementById("version-number");

// --- UI Functions ---

export function getModalFocusableElements(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return [];
    
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(modal.querySelectorAll(focusableSelector))
        .filter(el => el.offsetParent !== null);
}

export function showScreen(screenId, isModal = false) {
  allScreens.forEach(screen => {
    screen.classList.add("hidden");
    screen.setAttribute("aria-hidden", "true");
    screen.inert = true;
  });

  const targetScreen = document.getElementById(screenId);
  targetScreen.classList.remove("hidden");
  targetScreen.setAttribute("aria-hidden", "false");
  targetScreen.inert = false;

  if (isModal) {
    document.body.classList.add("modal-open");
    mainMenuScreen.inert = true;
    gameScreen.inert = true;
  } else {
    document.body.classList.remove("modal-open");
  }

  setCurrentModalId(isModal ? screenId : null);

  let focusableElement;
  if (screenId === "settings-screen") {
    focusableElement = backToMenuBtn;
  } else if (screenId === "game-screen") {
    focusableElement = answerEl;
  } else if (screenId === "whats-new-popup") {
    focusableElement = closePopupBtn;
  } else {
    focusableElement = targetScreen.querySelector('h1');
    if (!focusableElement) {
      focusableElement = targetScreen.querySelector('button');
    }
  }

  if (focusableElement) {
    setTimeout(() => {
      focusableElement.focus();
    }, 50);
  }
}

// NEW: Toggle UI elements based on Sprint vs Endless
export function configureGameUI(mode) {
    if (mode === 'sprint') {
        timerEl.classList.remove("hidden");
        livesEl.classList.add("hidden");
    } else {
        // Endless
        timerEl.classList.add("hidden");
        livesEl.classList.remove("hidden");
    }
}

export function displayScoreBreakdown(problems, correct) {
  problemsAnsweredEl.textContent = problems;
  correctAnswersEl.textContent = correct;
  const accuracy = problems > 0 ? ((correct / problems) * 100).toFixed(0) : 0;
  accuracyEl.textContent = `${accuracy}%`;
}

export function updateScoreDisplay(newScore) {
  scoreEl.textContent = `Score: ${newScore}`;
}

export function updateTimerDisplay(newTime) {
  timerEl.textContent = `Time left: ${newTime}s`;
}

export function updateLivesDisplay(lives) {
    livesEl.textContent = `Lives: ${lives}`;
}

export function updateProblemDisplay(problemString) {
  problemEl.textContent = problemString;
}

export function updateFeedbackDisplay(text, color) {
  feedbackEl.textContent = text;
  feedbackEl.style.color = color;
}

export function glowScore() {
  scoreEl.classList.add("glow");
  setTimeout(() => scoreEl.classList.remove("glow"), 500);
}

// NEW: Gabriel Animation Control
export function setGabrielState(state) {
    // state can be 'idle', 'running', 'fast'
    gabrielSprite.classList.remove("running", "fast");
    
    if (state === 'running') {
        gabrielSprite.classList.add("running");
    } else if (state === 'fast') {
        gabrielSprite.classList.add("running", "fast");
    }
}

// --- Settings UI ---

export function applySettingsToUI(settings) {
  masterVolumeSlider.value = settings.masterVolume;
  musicVolumeSlider.value = settings.musicVolume;
  sfxVolumeSlider.value = settings.sfxVolume;
  
  opAddition.checked = settings.operations.addition;
  opSubtraction.checked = settings.operations.subtraction;
  opMultiplication.checked = settings.operations.multiplication;
  opDivision.checked = settings.operations.division;
  
  disableCountdownToggle.checked = settings.disableCountdown;
  
  if (localStorage.getItem("mathSprintHighContrast") === "true") {
    document.body.classList.add("high-contrast");
  }
}

export function validateOperationToggles() {
  const checkedCount = operationCheckboxes.filter(cb => cb.checked).length;
  
  if (checkedCount === 1) {
    const onlyChecked = operationCheckboxes.find(cb => cb.checked);
    onlyChecked.disabled = true;
  } else {
    operationCheckboxes.forEach(cb => cb.disabled = false);
  }
}