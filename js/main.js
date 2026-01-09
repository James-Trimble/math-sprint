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
  
  // Apply accessibility settings on load
  if (state.settings.highContrast) document.body.classList.add('high-contrast');
  if (state.settings.reducedMotion) document.body.classList.add('reduced-motion');
  if (state.settings.largerText) document.body.classList.add('larger-text');
  
  // Load player name into settings input
  const playerNameInput = document.getElementById('player-name-display');
  if (playerNameInput) {
    const savedName = localStorage.getItem('mathSprintPlayerName') || '';
    playerNameInput.value = savedName;
  }
  
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
        
        setTimeout(async () => {
          const lastSeenVersion = localStorage.getItem("mathSprintLastVersion");
          
          // Show MOTD as modal gate first
          await initMOTD();
          
          // Then route to onboarding or main menu
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
 * Handle post-logo flow: onboarding or menu
 */
function handlePostLogo(lastSeenVersion, audio) {
  // Check for audio fallback first
  if (audio.isAudioTimeoutTriggered() && !localStorage.getItem("audioFeatureNotificationShown")) {
    localStorage.setItem("audioFeatureNotificationShown", "true");
    ui.showScreen("audio-feature-popup", true);
    return;
  }

  // Route based on onboarding completion
  if (!window.onboardingModule?.isOnboardingComplete()) {
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
      
      // Show audio error banner if any tracks failed to load
      if (typeof audio.hasAudioErrors === 'function' && audio.hasAudioErrors()) {
        setTimeout(() => {
          ui.showAudioErrorBanner();
        }, 500);
      }
    }
  }
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