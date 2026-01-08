import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as items from './items.js';
import * as inventory from './inventory.js';
import * as shop from './shop.js';
import * as itemEffects from './item-effects.js';
import { startGame, goToMainMenu } from './game.js';
import { handleAnswerSubmit } from './game-input.js';
import { initializeListeners } from './main-listeners.js';
import { VERSION_INFO } from './whatsnew.js';
import { populateWhatsNew } from './whatsnew-ui.js';
import { updateWelcomeMessage } from './welcome-ui.js';
import { initMOTD } from './motd.js';
import './achievements.js';
import './onboarding.js';
import { startOnboardingFlow, showOnboardingStep1, showOnboardingStep2, showOnboardingStep3, completeOnboarding } from './onboarding-flow.js';
import './tutorial.js';
import * as tutorialUI from './tutorial-ui.js';
import './daily-challenge.js';

// --- INITIALIZATION ---
window.addEventListener("load", () => {
  ui.copyrightYearEl.textContent = new Date().getFullYear();
  ui.versionNumberEl.textContent = state.GAME_VERSION; 
  ui.beginBtn.disabled = true;
  ui.beginBtn.textContent = "Loading Audio...";

  state.loadSettings();
  
  // v0.9.2 Update: Compensate players for cipher key reset
  const lastVersion = localStorage.getItem("mathSprintLastVersion");
  if (lastVersion !== state.GAME_VERSION) {
    if (!localStorage.getItem("v092CipherResetBonus")) {
      state.addSparks(500);
      localStorage.setItem("v092CipherResetBonus", "true");
      ui.walletBalanceEl.textContent = state.sparksWallet;
      ui.showScreen("bonus-modal", true);
    }
  }

  // Make modules available globally for cross-module communication
  window.achievementsModule = window.achievementsModule || (typeof achievementsModule !== 'undefined' ? achievementsModule : null);
  window.onboardingModule = window.onboardingModule || (typeof onboardingModule !== 'undefined' ? onboardingModule : null);
  window.tutorialModule = window.tutorialModule || (typeof tutorialModule !== 'undefined' ? tutorialModule : null);
  window.dailyChallengeModule = window.dailyChallengeModule || (typeof dailyChallengeModule !== 'undefined' ? dailyChallengeModule : null);

  audio.initializeTensionLoop();
  audio.applyVolumeSettings();
  ui.applySettingsToUI(state.settings);
  ui.validateOperationToggles(); 
  ui.walletBalanceEl.textContent = state.sparksWallet;

  // SEASONAL CHECK
  const now = new Date();
  const month = now.getMonth(); 
  const date = now.getDate();
  const isWinter = (month === 11 || month === 0 || month === 1);
  const isChristmas = (month === 11 && date <= 25);
  
  ui.applySeasonalVisuals(isWinter, isChristmas);
  window.isChristmasMode = isChristmas;

  ui.showScreen("ready-screen");
  
  // Start the audio loading timeout
  audio.startAudioLoadTimeout();

  // --- AUDIO START BUTTON LISTENER ---
  // Attach this inside the window load event to ensure DOM is ready
  if (ui.beginBtn) {
    ui.beginBtn.addEventListener("click", () => {
      ui.beginBtn.disabled = true; 
      
      Tone.start().then(() => {
        // 1. Play the correct logo
        audio.playAudioLogo(window.isChristmasMode);
        
        // 2. Calculate how long to wait
        // Christmas Logo = ~3.5s total duration including decay. 
        // We want a 0.5s gap. So we wait 4000ms total.
        const logoWaitTime = window.isChristmasMode ? 4000 : 1500;
        
        setTimeout(() => {
          const lastSeenVersion = localStorage.getItem("mathSprintLastVersion");
          
          // Handle alpha testers and new players
          handlePostLogo(lastSeenVersion, audio);
          
          // 3. Start Music (only if audio is ready and we're on main menu)
          // Note: handlePostLogo may have already started onboarding or other music
          // Only play main menu music if the main menu is actually being shown
          if (document.getElementById("main-menu") && !document.getElementById("main-menu").classList.contains("hidden")) {
            if (audio.canPlayMainMenuMusic()) {
              audio.playMainMenuMusic();
            }
          }
          
        }, logoWaitTime); 
      });
    });
  }
});

// Bonus modal close
if (ui.bonusModalCloseBtn) {
  ui.bonusModalCloseBtn.addEventListener("click", () => {
    audio.playUIClickSound();
    ui.showScreen("ready-screen");
  });
}


/**
 * Handle post-logo flow: alpha tester detection, onboarding, or menu
 */
function handlePostLogo(lastSeenVersion, audio) {
  // Check for audio fallback first
  if (audio.isAudioTimeoutTriggered() && !localStorage.getItem("audioFeatureNotificationShown")) {
    localStorage.setItem("audioFeatureNotificationShown", "true");
    ui.showScreen("audio-feature-popup", true);
    return;
  }

  // Detect alpha testers
  if (typeof window.onboardingModule !== 'undefined' && window.onboardingModule.detectAlphaTester()) {
    // Alpha tester detected
    showAlphaTesterFlow(lastSeenVersion);
  } else if (!window.onboardingModule?.isOnboardingComplete()) {
    // New player - start onboarding
    startOnboardingFlow();
  } else {
    // Returning player with onboarding complete - show menu or what's new
    if (lastSeenVersion !== state.GAME_VERSION) {
      populateWhatsNew();
      ui.showScreen("whats-new-popup", true);
    } else {
      updateWelcomeMessage();
      ui.showScreen("main-menu");
    }
  }
}

/**
 * Handle alpha tester flow: bonus popup, optional confirm flow
 */
function showAlphaTesterFlow(lastSeenVersion) {
  if (typeof window.onboardingModule === 'undefined') {
    updateWelcomeMessage();
    ui.showScreen("main-menu");
    return;
  }

  // Award one-time alpha tester bonus
  const bonusRedeemed = localStorage.getItem("mathSprintAlphaTesterBonusRedeemed");
  if (!bonusRedeemed) {
    state.addSparks(100);
    localStorage.setItem("mathSprintAlphaTesterBonusRedeemed", "true");
    ui.walletBalanceEl.textContent = state.sparksWallet;

    // Show thank you popup
    const popup = document.createElement("div");
    popup.id = "alpha-tester-popup";
    popup.className = "popup-overlay";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");
    popup.innerHTML = `
      <div class="popup-content">
        <h2>🙏 Thank You for Testing!</h2>
        <p>Thank you for being part of the MathSprint alpha testing community!</p>
        <p>You've earned <strong>100 Sparks</strong> as our token of appreciation.</p>
        <button id="alpha-tester-close-btn" class="primary-btn">Continue to Game</button>
      </div>
    `;
    document.body.appendChild(popup);

    document.getElementById("alpha-tester-close-btn").addEventListener("click", () => {
      popup.remove();
      // Proceed with confirm flow or go to menu
      proceedAfterAlphaTesterBonus(lastSeenVersion);
    });
  } else {
    proceedAfterAlphaTesterBonus(lastSeenVersion);
  }
}

/**
 * After alpha tester bonus, proceed to confirm flow or main menu
 */
function proceedAfterAlphaTesterBonus(lastSeenVersion) {
  if (typeof window.onboardingModule === 'undefined') {
    ui.showScreen("main-menu");
    return;
  }

  // Check if alpha tester has already set a name
  state.loadSettings();
  if (!state.settings.playerName) {
    // Show simplified onboarding: just name entry (Step 1), then go to menu or what's new
    audio.playOnboardingMusic();
    showAlphaTesterNameEntry(lastSeenVersion);
  } else {
    // Already has a name, check for version changes
    if (lastSeenVersion !== state.GAME_VERSION) {
      populateWhatsNew();
      ui.showScreen("whats-new-popup", true);
    } else {
      audio.playMainMenuMusic();
      ui.showScreen("main-menu");
    }
  }
}

/**
 * Show name entry for alpha testers (simplified onboarding)
 */
function showAlphaTesterNameEntry(lastSeenVersion) {
  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.innerHTML = `
    <div class="popup-content onboarding-content">
      <h2 style="color: #4ecdc4; margin-top: 0;">Welcome Back! 👋</h2>
      <p>We'd like to get your name for future leaderboards:</p>
      
      <form id="alpha-tester-name-form">
        <div style="margin-bottom: 1.5rem;">
          <label for="alpha-tester-name-input" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Your Name
          </label>
          <input 
            id="alpha-tester-name-input" 
            type="text" 
            placeholder="Enter your name" 
            required
            aria-describedby="alpha-tester-name-help"
            style="width: 100%; padding: 0.75rem; border: 2px solid #4ecdc4; border-radius: 8px; font-size: 1rem; background: #222; color: #fff; box-sizing: border-box;"
          />
          <small id="alpha-tester-name-help" style="display: block; margin-top: 0.5rem; color: #999;">
            Your name is required for future leaderboards!
          </small>
          <div id="alpha-tester-name-error" style="color: #ff6b6b; margin-top: 0.5rem; display: none;" role="alert"></div>
        </div>
        
        <div class="popup-buttons">
          <button type="submit" class="popup-button primary" style="width: 100%;">Continue →</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(popup);

  const form = document.getElementById("alpha-tester-name-form");
  const input = document.getElementById("alpha-tester-name-input");
  const errorEl = document.getElementById("alpha-tester-name-error");

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = input.value.trim();

    if (!name) {
      errorEl.textContent = "Please enter your name";
      errorEl.style.display = "block";
      input.setAttribute("aria-invalid", "true");
      return;
    }

    errorEl.style.display = "none";
    input.removeAttribute("aria-invalid");

    // Save name
    window.onboardingModule.saveName(name);
    popup.remove();

    // Proceed to what's new or menu based on version
    if (lastSeenVersion !== state.GAME_VERSION) {
      populateWhatsNew();
      ui.showScreen("whats-new-popup", true);
    } else {
      audio.playMainMenuMusic();
      ui.showScreen("main-menu");
    }
  };

  form.addEventListener("submit", handleSubmit);

  input.addEventListener("input", () => {
    if (input.value.trim()) {
      errorEl.style.display = "none";
      input.removeAttribute("aria-invalid");
    }
  });

  input.focus();
}

/**
 * Start full onboarding flow for new players
 */
// moved to onboarding-flow.js

/**
 * Display Step 1 of onboarding: Name Entry
 */
// moved to onboarding-flow.js

/**
 * Display Step 2 of onboarding: Operation Selection
 */
// moved to onboarding-flow.js

/**
 * Display Step 3 of onboarding: Tutorial Incentive
 */
// moved to onboarding-flow.js

/**
 * Complete onboarding flow and reward player
 */
// moved to onboarding-flow.js

// Initialize all event listeners
initializeListeners();

// Make updateWelcomeMessage globally accessible for game-flow module
window.updateWelcomeMessage = updateWelcomeMessage;

// Initialize MOTD system (will display after reaching main menu)
setTimeout(() => {
  initMOTD();
}, 1000); // Delay to ensure main menu is fully loaded