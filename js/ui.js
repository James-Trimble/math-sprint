// js/ui.js
import { setCurrentModalId } from './state.js';

// --- HTML Element References ---
export const allScreens = document.querySelectorAll(".screen");
export const readyScreen = document.getElementById("ready-screen");
export const mainMenuScreen = document.getElementById("main-menu");
export const gameScreen = document.getElementById("game-screen");

// Buttons & Inputs
export const beginBtn = document.getElementById("begin-btn");
export const sprintModeBtn = document.getElementById("sprint-mode-btn");
export const endlessModeBtn = document.getElementById("endless-mode-btn");
export const survivalModeBtn = document.getElementById("survival-mode-btn"); // New
export const settingsBtn = document.getElementById("settings-btn");
export const shopBtn = document.getElementById("shop-btn"); // New
export const gameForm = document.getElementById("game-form");
export const problemEl = document.getElementById("problem");
export const answerEl = document.getElementById("answer");
export const submitBtn = document.getElementById("submit");
export const feedbackEl = document.getElementById("feedback");
export const itemLiveEl = document.getElementById("item-live");
export const quickUseBar = document.getElementById("quick-use-bar");

// Stats & Visuals
export const scoreEl = document.getElementById("score");
export const timerEl = document.getElementById("timer");
export const livesEl = document.getElementById("lives");
export const consecutiveMistakesEl = document.getElementById("consecutive-mistakes");
export const gabrielContainer = document.getElementById("gabriel-container");
export const gabrielSprite = document.getElementById("gabriel-sprite");

// Overlays
export const countdownOverlay = document.getElementById("countdown-overlay");
export const countdownText = document.getElementById("countdown-text");
export const cashOutOverlay = document.getElementById("cash-out-popup"); // New
export const cashOutSparks = document.getElementById("cash-out-sparks");
export const cashOutCloseBtn = document.getElementById("cash-out-close");

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

// Shop Elements
export const walletBalanceEl = document.getElementById("wallet-balance"); 
export const shopGridEl = document.getElementById("shop-grid");
export const shopLiveEl = document.getElementById("shop-live");
export const backToMenuShopBtn = document.getElementById("back-to-menu-shop-btn");

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
export const enableFeedbackPromptsCheckbox = document.getElementById("enable-feedback-prompts");
export const feedbackPopupShareBtn = document.getElementById("feedback-share-btn");
export const feedbackPopupLaterBtn = document.getElementById("feedback-later-btn");
export const feedbackPopupDontAskBtn = document.getElementById("feedback-dont-ask-btn");
export const bonusModalCloseBtn = document.getElementById("bonus-modal-close");
export const closePopupBtn = document.getElementById("close-popup-btn");
export const copyrightYearEl = document.getElementById("copyright-year");
export const versionNumberEl = document.getElementById("version-number");

// --- UI Functions ---

export function showScreen(screenId, isModal = false) {
  allScreens.forEach(screen => {
    screen.classList.add("hidden");
    screen.setAttribute("aria-hidden", "true");
    screen.inert = true;
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove("hidden");
    targetScreen.setAttribute("aria-hidden", "false");
    targetScreen.inert = false;
  }

  if (isModal) {
    document.body.classList.add("modal-open");
    if(mainMenuScreen) mainMenuScreen.inert = true;
    if(gameScreen) gameScreen.inert = true;
  } else {
    document.body.classList.remove("modal-open");
  }

  setCurrentModalId(isModal ? screenId : null);
}

// Seasonal Visuals
export function applySeasonalVisuals(isWinter, isChristmas) {
  if (isWinter) document.body.classList.add("theme-winter");
  else document.body.classList.remove("theme-winter");

  if (gabrielSprite) {
    if (isChristmas) gabrielSprite.classList.add("santa-hat");
    else gabrielSprite.classList.remove("santa-hat");
  }
}

// Overdrive Visuals
export function toggleOverdriveVisuals(isActive) {
    if (isActive) {
        document.body.classList.add("overdrive-active");
        scoreEl.classList.add("overdrive-text");
    } else {
        document.body.classList.remove("overdrive-active");
        scoreEl.classList.remove("overdrive-text");
    }
}

export function configureGameUI(mode) {
    if (mode === 'sprint' || mode === 'survival') {
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
  if (newTime < 10) timerEl.classList.add("danger");
  else timerEl.classList.remove("danger");
}

export function updateLivesDisplay(lives) {
    livesEl.textContent = `Lives: ${lives}`;
}

export function updateConsecutiveMistakesDisplay(current, max = 3) {
  if (current === 0) {
    consecutiveMistakesEl.classList.add("hidden");
  } else {
    consecutiveMistakesEl.classList.remove("hidden");
    consecutiveMistakesEl.textContent = `⚠️ Consecutive: ${current}/${max}`;
  }
}

export function updateProblemDisplay(problemString) {
  problemEl.textContent = problemString;
}

export function updateFeedbackDisplay(text, color) {
  feedbackEl.textContent = text;
  feedbackEl.style.color = color;
}

// --- Item & Shop Announcements ---
export function announceShop(message) {
  if (shopLiveEl) shopLiveEl.textContent = message;
}

export function announceItem(message) {
  if (itemLiveEl) itemLiveEl.textContent = message;
}

export function showItemToast(message) {
  const toast = document.createElement("div");
  toast.className = "item-feedback-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}

// --- Quick Use Buttons ---
export function renderQuickUseButtons(items, inventoryLookup, onClick) {
  if (!quickUseBar) return;
  quickUseBar.innerHTML = "";
  items.forEach(item => {
    const count = inventoryLookup(item.id) || 0;
    const btn = document.createElement("button");
    btn.className = "item-button";
    btn.dataset.itemId = item.id;
    btn.type = "button";
    btn.disabled = count === 0;
    btn.setAttribute("aria-label", `${item.name}, ${count} available`);
    btn.innerHTML = `<span class="icon">${item.icon}</span><span class="label">${item.name}</span><span class="count">(${count})</span>`;
    btn.addEventListener("click", () => onClick && onClick(item.id));
    quickUseBar.appendChild(btn);
  });
}

export function updateQuickUseCount(itemId, count) {
  if (!quickUseBar) return;
  const btn = quickUseBar.querySelector(`[data-item-id="${itemId}"]`);
  if (btn) {
    const countEl = btn.querySelector(".count");
    if (countEl) countEl.textContent = `(${count})`;
    btn.disabled = count === 0;
  }
}

export function setQuickUseActive(itemId, active) {
  if (!quickUseBar) return;
  const btn = quickUseBar.querySelector(`[data-item-id="${itemId}"]`);
  if (btn) {
    btn.classList.toggle("item-active", !!active);
  }
}

export function glowScore() {
  scoreEl.classList.add("glow");
  setTimeout(() => scoreEl.classList.remove("glow"), 500);
}

export function setGabrielState(state) {
    gabrielSprite.classList.remove("running", "fast");
    if (state === 'running') gabrielSprite.classList.add("running");
    else if (state === 'fast') gabrielSprite.classList.add("running", "fast");
}

// Settings UI Updates
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

// Red Flash Warning for Consecutive Mistakes
export function triggerRedFlash() {
  const flash = document.createElement('div');
  flash.className = 'red-flash';
  document.body.appendChild(flash);
  
  // Remove the flash element after animation completes
  setTimeout(() => {
    flash.remove();
  }, 600);
}