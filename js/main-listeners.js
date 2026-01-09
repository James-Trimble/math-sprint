/**
 * Main Menu & Gameplay Event Listeners
 * Handles all button clicks and form submissions outside of core game logic
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as shop from './shop.js';
import * as tutorialUI from './tutorial-ui.js';
import { startGame, goToMainMenu } from './game-flow.js';
import { handleAnswerSubmit } from './game-input.js';
import { displayNextAchievementPopup } from './game-achievements.js';
import { populateWhatsNew } from './whatsnew-ui.js';
import { renderAchievementsScreen } from './achievements-ui.js';

/**
 * Initialize all event listeners
 */
export function initializeListeners() {
  setupMainMenuListeners();
  setupGameplayListeners();
  setupSettingsListeners();
  setupPopupListeners();

  // Ensure achievements button and marketing labels show current counts on load
  renderAchievementsScreen();
  updateMarketingAchievementLabels();
}

/**
 * Main menu navigation buttons
 */
function setupMainMenuListeners() {
  // Play Now button - opens mode selection modal
  const playNowBtn = document.getElementById("play-now-btn");
  const modeSelectionScreen = document.getElementById("mode-selection-screen");
  const modeSelectionClose = document.getElementById("mode-selection-close");
  
  if (playNowBtn && modeSelectionScreen) {
    playNowBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      modeSelectionScreen.showModal();
      // Focus the first mode button for accessibility
      const firstModeBtn = modeSelectionScreen.querySelector(".mode-button");
      if (firstModeBtn) firstModeBtn.focus();
    });
  }
  
  // Mode selection close button and backdrop
  if (modeSelectionClose && modeSelectionScreen) {
    modeSelectionClose.addEventListener("click", () => {
      audio.playUIClickSound();
      modeSelectionScreen.close();
    });
  }
  
  // Close modal when clicking backdrop (outside the dialog content)
  if (modeSelectionScreen) {
    modeSelectionScreen.addEventListener("click", (e) => {
      if (e.target === modeSelectionScreen) {
        audio.playUIClickSound();
        modeSelectionScreen.close();
      }
    });
  }
  
  // Game mode buttons (now inside the modal)
  ui.sprintModeBtn.addEventListener("click", () => {
    audio.playUIClickSound();
    modeSelectionScreen?.close();
    startGame('sprint');
  });
  ui.endlessModeBtn.addEventListener("click", () => {
    audio.playUIClickSound();
    modeSelectionScreen?.close();
    startGame('endless');
  });
  ui.survivalModeBtn.addEventListener("click", () => {
    audio.playUIClickSound();
    modeSelectionScreen?.close();
    startGame('survival');
  });

  // Daily Challenge
  const dailyChallengeBtn = document.getElementById("daily-challenge-btn");
  if (dailyChallengeBtn) {
    // Update button text on menu show
    const updateDailyChallengeButton = () => {
      if (typeof window.dailyChallengeModule !== 'undefined' && window.dailyChallengeModule.hasPlayedToday()) {
        const timeUntil = window.dailyChallengeModule.getTimeUntilNext();
        dailyChallengeBtn.innerHTML = `Daily Challenge<span class="mode-subtitle">Next in ${timeUntil}</span>`;
      } else {
        dailyChallengeBtn.innerHTML = `Daily Challenge<span class="mode-subtitle">New challenge every day</span>`;
      }
    };
    
    // Update on load
    updateDailyChallengeButton();
    
    // Update every minute
    setInterval(updateDailyChallengeButton, 60000);
    
    dailyChallengeBtn.addEventListener("click", () => {
      if (typeof window.dailyChallengeModule !== 'undefined') {
        const today = window.dailyChallengeModule.getTodaysDateFormatted();
        const lastPlayed = localStorage.getItem('mathSprintDailyChallengeLastPlayed');
        
        if (lastPlayed === today) {
          const timeUntil = window.dailyChallengeModule.getTimeUntilNext();
          alert(`You've already played today's Daily Challenge! Come back in ${timeUntil} for a new challenge.`);
          return;
        }
        
        window.dailyChallengeModule.start();
        localStorage.setItem('mathSprintDailyChallengeLastPlayed', today);
      }
      audio.playUIClickSound();
      modeSelectionScreen?.close();
      startGame('daily-challenge');
    });
  }

  // Tutorial
  const tutorialBtn = document.getElementById("tutorial-btn");
  if (tutorialBtn) {
    tutorialBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      if (typeof window.tutorialModule !== 'undefined') {
        window.tutorialModule.reset();
        window.tutorialModule.start();
        
        // Stop main menu music first
        if (audio.backgroundMusicMainMenu?.state === 'started') {
          audio.backgroundMusicMainMenu.stop();
        }
        audio.playTutorialMusic();
        
        // Show first tutorial phase
        const phase = window.tutorialModule.getCurrentPhase();
        const progress = window.tutorialModule.getProgress();
        tutorialUI.displayTutorialPhase(phase, window.tutorialModule.getPhaseIndex(), progress.total);
        tutorialUI.showTutorialScreen();
      }
    });
  }
  
  // Tutorial navigation
  const tutorialNextBtn = document.getElementById("tutorial-next-btn");
  const tutorialPrevBtn = document.getElementById("tutorial-prev-btn");
  const tutorialSkipBtn = document.getElementById("tutorial-skip-btn");
  
  if (tutorialNextBtn && typeof window.tutorialModule !== 'undefined') {
    tutorialNextBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      const currentIndex = window.tutorialModule.getPhaseIndex();
      const progress = window.tutorialModule.getProgress();
      
      if (currentIndex === progress.total - 1) {
        // Last phase - start game
        window.tutorialModule.complete();
        tutorialUI.hideTutorialScreen();
        // Stop tutorial music before starting game
        if (audio.backgroundMusicTutorial?.state === 'started') {
          audio.backgroundMusicTutorial.stop();
        }
        startGame('sprint');
      } else {
        // Next phase
        window.tutorialModule.nextPhase();
        const phase = window.tutorialModule.getCurrentPhase();
        const newProgress = window.tutorialModule.getProgress();
        tutorialUI.displayTutorialPhase(phase, window.tutorialModule.getPhaseIndex(), newProgress.total);
      }
    });
  }
  
  if (tutorialPrevBtn && typeof window.tutorialModule !== 'undefined') {
    tutorialPrevBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      window.tutorialModule.prevPhase();
      const phase = window.tutorialModule.getCurrentPhase();
      const progress = window.tutorialModule.getProgress();
      tutorialUI.displayTutorialPhase(phase, window.tutorialModule.getPhaseIndex(), progress.total);
    });
  }
  
  if (tutorialSkipBtn) {
    tutorialSkipBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      if (typeof window.tutorialModule !== 'undefined') {
        window.tutorialModule.complete();
      }
      tutorialUI.hideTutorialScreen();
      // Stop tutorial music and play main menu music
      if (audio.backgroundMusicTutorial?.state === 'started') {
        audio.backgroundMusicTutorial.stop();
      }
      audio.playMainMenuMusic();
      ui.showScreen("main-menu");
    });
  }

  // Achievements
  const achievementsBtn = document.getElementById("achievements-btn");
  if (achievementsBtn) {
    achievementsBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      renderAchievementsScreen();
      ui.showScreen("achievements-screen", true);
    });
  }

  const backToMenuAchievementsBtn = document.getElementById("back-to-menu-achievements-btn");
  if (backToMenuAchievementsBtn) {
    backToMenuAchievementsBtn.addEventListener("click", () => {
      audio.playUIBackSound();
      ui.showScreen("main-menu");
    });
  }

  // Settings
  ui.settingsBtn.addEventListener("click", () => {
    audio.playUIClickSound(); 
    ui.showScreen("settings-screen", true);
  });

  // Shop
  ui.shopBtn.addEventListener("click", () => {
    audio.playUIClickSound();
    if (audio.canPlayShopMusic()) {
      audio.stopAllMusic(state.tensionLoop);
      audio.playShopMusic();
    }
    ui.walletBalanceEl.textContent = state.sparksWallet;
    shop.initializeShop();
    ui.showScreen("shop-screen", true);
  });

  ui.backToMenuShopBtn.addEventListener("click", () => {
    audio.playUIBackSound();
    audio.stopAllMusic(state.tensionLoop);
    ui.showScreen("main-menu");
    audio.playMainMenuMusic();
  });
}

/**
 * Gameplay form and result screen buttons
 */
function setupGameplayListeners() {
  // Game form submission
  ui.gameForm.addEventListener("submit", (e) => {
    e.preventDefault(); 
    if (!ui.submitBtn.disabled) handleAnswerSubmit();
  });

  // Play again buttons
  ui.playAgainBtn.addEventListener("click", () => {
    if (state.gameMode === 'daily-challenge') {
      alert("You've already played today's Daily Challenge! Come back tomorrow for a new challenge.");
      goToMainMenu();
      return;
    }
    startGame(state.gameMode);
  });

  ui.playAgainHighScoreBtn.addEventListener("click", () => {
    if (state.gameMode === 'daily-challenge') {
      alert("You've already played today's Daily Challenge! Come back tomorrow for a new challenge.");
      goToMainMenu();
      return;
    }
    startGame(state.gameMode);
  });

  // Return to menu from results
  ui.mainMenuGameOverBtn.addEventListener("click", goToMainMenu);
  ui.mainMenuHighScoreBtn.addEventListener("click", goToMainMenu);

  // Achievement viewing
  const viewAchievementsGameOverBtn = document.getElementById('view-achievements-game-over-btn');
  if (viewAchievementsGameOverBtn) {
    viewAchievementsGameOverBtn.addEventListener("click", () => {
      viewAchievementsGameOverBtn.classList.add('hidden');
      if (window.pendingAchievements && window.pendingAchievements.length > 0) {
        // Play sound on starting the achievement view flow
        audio.playAchievementUnlockSFX();
        displayNextAchievementPopup();
      }
    });
  }

  const viewAchievementsHighScoreBtn = document.getElementById('view-achievements-high-score-btn');
  if (viewAchievementsHighScoreBtn) {
    viewAchievementsHighScoreBtn.addEventListener("click", () => {
      viewAchievementsHighScoreBtn.classList.add('hidden');
      if (window.pendingAchievements && window.pendingAchievements.length > 0) {
        // Play sound on starting the achievement view flow
        audio.playAchievementUnlockSFX();
        displayNextAchievementPopup();
      }
    });
  }

  // Score breakdown
  ui.scoreBreakdownBtn.addEventListener("click", () => {
    ui.finalScoreEl.textContent = state.score; 
    ui.displayScoreBreakdown(state.problemsAnswered, state.correctAnswers);
    ui.showScreen("game-over-screen");
  });
}

/**
 * Settings panel listeners
 */
function setupSettingsListeners() {
  // Back button
  ui.backToMenuBtn.addEventListener("click", () => {
    audio.playUIBackSound();
    goToMainMenu();
  });

  // Volume sliders
  ui.masterVolumeSlider.addEventListener("input", (e) => { 
    state.settings.masterVolume = e.target.value; 
    audio.applyVolumeSettings(); 
    state.saveSettings(); 
  });

  ui.musicVolumeSlider.addEventListener("input", (e) => { 
    state.settings.musicVolume = e.target.value; 
    audio.applyVolumeSettings(); 
    state.saveSettings(); 
  });

  ui.sfxVolumeSlider.addEventListener("input", (e) => { 
    state.settings.sfxVolume = e.target.value; 
    audio.applyVolumeSettings();
    audio.playVolumeAdjustSFX();
    state.saveSettings(); 
  });

  // Countdown toggle
  ui.disableCountdownToggle.addEventListener("change", (e) => { 
    state.settings.disableCountdown = e.target.checked; 
    state.saveSettings(); 
  });

  // Operation toggles
  [ui.opAddition, ui.opSubtraction, ui.opMultiplication, ui.opDivision].forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      state.settings.operations.addition = ui.opAddition.checked;
      state.settings.operations.subtraction = ui.opSubtraction.checked;
      state.settings.operations.multiplication = ui.opMultiplication.checked;
      state.settings.operations.division = ui.opDivision.checked;
      ui.validateOperationToggles();
      state.saveSettings();
    });
  });

  // Tab navigation
  ui.tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("aria-controls");
      ui.tabs.forEach(t => {
        t.setAttribute("aria-selected", "false");
        t.classList.remove("active");
      });
      tab.setAttribute("aria-selected", "true");
      tab.classList.add("active");
      ui.tabPanels.forEach(panel => {
        panel.classList.add("hidden");
      });
      document.getElementById(targetId).classList.remove("hidden");
    });
  });
}

/**
 * Popup and modal closers
 */
function setupPopupListeners() {
  // Cash out popup
  ui.cashOutCloseBtn.addEventListener("click", () => {
    audio.playUIClickSound();
    ui.showScreen("main-menu");
    audio.playMainMenuMusic();
  });

  // Audio feature notification
  const audioFeatureCloseBtn = document.getElementById("audio-feature-close-btn");
  if (audioFeatureCloseBtn) {
    audioFeatureCloseBtn.addEventListener("click", () => {
      const lastSeenVersion = localStorage.getItem("mathSprintLastVersion");
      if (lastSeenVersion !== state.GAME_VERSION) {
        populateWhatsNew();
        ui.showScreen("whats-new-popup", true);
      } else {
        ui.showScreen("main-menu");
      }
      audio.playMainMenuMusic();
    });
  }

  // What's new popup
  ui.closePopupBtn.addEventListener("click", () => { 
    localStorage.setItem("mathSprintLastVersion", state.GAME_VERSION); 
    ui.showScreen("main-menu"); 
    audio.playMainMenuMusic();
  });

  // Feedback popup buttons
  if (ui.feedbackPopupShareBtn) {
    ui.feedbackPopupShareBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      window.open("../feedback/", "_blank");
      localStorage.setItem("mathSprintLastFeedbackPrompt", Date.now().toString());
      ui.showScreen("game-over-screen");
    });
  }

  if (ui.feedbackPopupLaterBtn) {
    ui.feedbackPopupLaterBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      localStorage.setItem("mathSprintLastFeedbackPrompt", Date.now().toString());
      ui.showScreen("game-over-screen");
    });
  }

  if (ui.feedbackPopupDontAskBtn) {
    ui.feedbackPopupDontAskBtn.addEventListener("click", () => {
      audio.playUIClickSound();
      localStorage.setItem("mathSprintFeedbackPromptDismissed", "true");
      ui.showScreen("game-over-screen");
    });
  }
}
