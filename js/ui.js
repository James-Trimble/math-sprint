// js/ui.js
import { setCurrentModalId } from './state.js';
import { getItemIconSvg } from './items.js';

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
export const welcomeMessage = document.getElementById("welcome-message");
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
export const shopTabsEl = document.getElementById("shop-tabs");
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

// Onboarding Elements
export const onboardingStep1Screen = document.getElementById("onboarding-step1");
export const onboardingStep2Screen = document.getElementById("onboarding-step2");
export const onboardingStep3Screen = document.getElementById("onboarding-step3");
export const onboardingNameForm = document.getElementById("onboarding-name-form");
export const onboardingNameInput = document.getElementById("onboarding-name-input");
export const onboardingNameError = document.getElementById("onboarding-name-error");
export const onboardingOpAddition = document.getElementById("onboarding-op-addition");
export const onboardingOpSubtraction = document.getElementById("onboarding-op-subtraction");
export const onboardingOpMultiplication = document.getElementById("onboarding-op-multiplication");
export const onboardingOpDivision = document.getElementById("onboarding-op-division");

// --- UI Functions ---

export function showScreen(screenId, isModal = false) {
  // Blur any focused element to avoid aria-hidden warnings (skip on mobile to prevent keyboard suppression)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile && document.activeElement && typeof document.activeElement.blur === 'function') {
    try { document.activeElement.blur(); } catch {}
  }

  allScreens.forEach(screen => {
    screen.classList.add("hidden");
    screen.setAttribute("aria-hidden", "true");
    // Ensure inert is applied as an attribute for consistent behavior
    try { screen.setAttribute("inert", ""); } catch {}
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove("hidden");
    targetScreen.setAttribute("aria-hidden", "false");
    // Remove inert attribute explicitly to restore interactivity
    try { targetScreen.removeAttribute("inert"); } catch {}

    // Focus first focusable element for accessibility
    const focusable = targetScreen.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && typeof focusable.focus === 'function') {
      try { focusable.focus(); } catch {}
    }
  }

  if (isModal) {
    document.body.classList.add("modal-open");
    if(mainMenuScreen) {
      try { mainMenuScreen.setAttribute("inert", ""); } catch {}
    }
    if(gameScreen) {
      try { gameScreen.setAttribute("inert", ""); } catch {}
    }
  } else {
    document.body.classList.remove("modal-open");
    if(mainMenuScreen) {
      try { mainMenuScreen.removeAttribute("inert"); } catch {}
    }
    if(gameScreen) {
      try { gameScreen.removeAttribute("inert"); } catch {}
    }
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

/**
 * Show audio error banner on main menu if audio tracks failed to load
 * Auto-dismisses after 8 seconds with manual close option
 */
export function showAudioErrorBanner() {
  const banner = document.getElementById("audio-error-banner");
  const closeBtn = document.getElementById("audio-error-close");
  
  if (!banner) return;
  
  // Show the banner
  banner.classList.add("visible");
  
  // Auto-dismiss after 8 seconds
  const autoDismissTimer = setTimeout(() => {
    hiddenAudioErrorBanner();
  }, 8000);
  
  // Manual close button
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      clearTimeout(autoDismissTimer);
      hiddenAudioErrorBanner();
    }, { once: true });
  }
}

export function hiddenAudioErrorBanner() {
  const banner = document.getElementById("audio-error-banner");
  if (banner) {
    banner.classList.remove("visible");
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
    consecutiveMistakesEl.textContent = `Consecutive: ${current}/${max}`;
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
    // Hide buttons for items with 0 count instead of showing disabled
    if (count === 0) return;
    
    const btn = document.createElement("button");
    btn.className = "item-button";
    btn.dataset.itemId = item.id;
    btn.type = "button";
    btn.setAttribute("aria-label", `${item.name}, ${count} available`);
    btn.innerHTML = `<span class="item-badge" aria-hidden="true">${getItemIconSvg(item)}</span><span class="label">${item.name}</span><span class="count">(${count})</span>`;
    btn.addEventListener("click", () => onClick && onClick(item.id));
    quickUseBar.appendChild(btn);
  });
}

export function updateQuickUseCount(itemId, count) {
  if (!quickUseBar) return;
  const btn = quickUseBar.querySelector(`[data-item-id="${itemId}"]`);
  if (btn) {
    if (count === 0) {
      // Hide button when count reaches 0
      btn.remove();
    } else {
      const countEl = btn.querySelector(".count");
      if (countEl) countEl.textContent = `(${count})`;
    }
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

// --- Achievement Popup System ---

/**
 * Animate Gabriel's celebration when achievement is unlocked
 * Cycles through sprite frames: idle -> running -> fast -> running -> idle
 * Duration: ~500ms per frame × 2 complete cycles = ~5 seconds
 */
export function playGabrielCelebration() {
  if (!gabrielSprite) return;

  const frames = ['idle', 'running', 'fast', 'running'];
  const frameDuration = 500; // ms per frame
  let frameIndex = 0;
  let cycleCount = 0;

  const frameInterval = setInterval(() => {
    gabrielSprite.classList.remove('idle', 'running', 'fast');
    gabrielSprite.classList.add(frames[frameIndex]);

    frameIndex = (frameIndex + 1) % frames.length;

    // After completing both cycles (8 frames), stop
    if (frameIndex === 0) {
      cycleCount++;
      if (cycleCount >= 2) {
        clearInterval(frameInterval);
        gabrielSprite.classList.remove('idle', 'running', 'fast');
        gabrielSprite.classList.add('idle'); // Return to idle
      }
    }
  }, frameDuration);
}

/**
 * Display achievement unlock popup
 * @param {Object} achievement - Achievement object {id, title, description, reward}
 * @param {Function} onClose - Callback when popup is dismissed
 */
export function showAchievementPopup(achievement, onClose = null) {
  const popupId = `achievement-popup-${Date.now()}`;
  
  const popup = document.createElement('div');
  popup.className = 'achievement-popup-overlay';
  popup.id = popupId;
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-label', `Achievement Unlocked: ${achievement.title}`);

  const content = document.createElement('div');
  content.className = 'achievement-popup-content';

  let rewardHTML = '';
  if (achievement.reward) {
    rewardHTML = `<div class="achievement-reward">+${achievement.reward} Sparks</div>`;
  }

  content.innerHTML = `
    <div class="achievement-popup-header">
      <h2>Achievement Unlocked!</h2>
    </div>
    <div class="achievement-popup-body">
      <div class="gabriel-celebration" id="gabriel-celebration"></div>
      <h3>${achievement.title}</h3>
      <p>${achievement.description}</p>
      ${rewardHTML}
    </div>
    <div class="achievement-popup-footer">
      <button class="achievement-close-btn" aria-label="Close achievement popup">Continue</button>
    </div>
  `;

  popup.appendChild(content);
  document.body.appendChild(popup);

  // Play celebration animation
  playGabrielCelebration();

  // Add announcement for screen readers
  const liveRegion = document.getElementById('achievement-live-region') || createLiveRegion();
  liveRegion.textContent = `Achievement unlocked: ${achievement.title}. ${achievement.description}`;
  if (achievement.reward) {
    liveRegion.textContent += ` Earned ${achievement.reward} Sparks.`;
  }

  // Close button handler
  const closeBtn = content.querySelector('.achievement-close-btn');
  const handleClose = () => {
    popup.remove();
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', handleClose);
  closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  });

  // Trap focus within popup (WCAG keyboard accessibility)
  popup.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // Only the close button is focusable, so Tab/Shift+Tab keeps focus on it
      e.preventDefault();
      closeBtn.focus();
    }
  });

  // Auto-close after 5 seconds if not dismissed
  setTimeout(handleClose, 5000);

  closeBtn.focus();
}

/**
 * Display tutorial phase callout/instruction
 * @param {Object} phase - Tutorial phase object
 */
export function displayTutorialPhaseCallout(phase) {
  if (!phase) return;

  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "tutorial-callout-title");
  overlay.style.cssText = "display: flex; align-items: center; justify-content: center; z-index: 1000;";

  overlay.innerHTML = `
    <div class="popup-content" style="max-width: 500px;">
      <h2 id="tutorial-callout-title" style="color: #4ecdc4; margin-top: 0;">${phase.title}</h2>
      <p>${phase.description}</p>
      <div style="background: rgba(78, 205, 196, 0.15); border: 2px solid #4ecdc4; border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
        <p style="margin: 0; font-size: 1.1rem; font-weight: 500;">${phase.callout}</p>
      </div>
      <button id="tutorial-callout-close" class="popup-button primary" style="width: 100%;">Got it!</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = document.getElementById("tutorial-callout-close");
  const handleClose = () => {
    overlay.remove();
  };

  closeBtn.addEventListener("click", handleClose);
  closeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Enter") {
      e.preventDefault();
      handleClose();
    }
  });

  closeBtn.focus();

  // Auto-close after 8 seconds
  setTimeout(handleClose, 8000);
}

/**
 * Create ARIA live region for achievement announcements
 */
export function createLiveRegion() {
  let region = document.getElementById('achievement-live-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'achievement-live-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }
  return region;
}

/**
 * Announce achievement during gameplay via ARIA live region (non-intrusive)
 * @param {string} message - Message to announce
 */
export function announceAchievementDuringGameplay(message) {
  const liveRegion = document.getElementById('achievement-live-region') || createLiveRegion();
  liveRegion.textContent = message;
}