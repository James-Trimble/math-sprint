/**
 * Game Achievements Module
 * Handles achievement unlocking, queuing, and display logic
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as inventory from './inventory.js';

// Achievement queue to display after game ends
let pendingAchievements = [];
window.pendingAchievements = pendingAchievements;

/**
 * Check if an achievement should be unlocked and queue it
 */
export function checkAndUnlockAchievement(achievementId) {
  if (!window.achievementsModule) return;

  const isNewUnlock = window.achievementsModule.unlock(achievementId);
  if (isNewUnlock) {
    const achievement = window.achievementsModule.getAchievement(achievementId);
    if (achievement) {
      pendingAchievements.push(achievement);
      window.pendingAchievements = pendingAchievements;
      
      // Do not play sound immediately; sound will play when user views popups

      // Announce via screen reader
      if (state.gameMode) {
        ui.announceAchievementDuringGameplay(`Achievement unlocked: ${achievement.title}`);
      }

      // Award sparks
        if (achievement.reward) {
          state.addSparks(achievement.reward);
      }
    }
  }
}

/**
 * Display the next pending achievement popup
 */
export function displayNextAchievementPopup() {
  if (!pendingAchievements || pendingAchievements.length === 0) return;

  const achievement = pendingAchievements.shift();
  window.pendingAchievements = pendingAchievements;
  
  // Play sound when showing the popup or on dismissal trigger
  audio.playAchievementUnlockSFX();
  ui.showAchievementPopup(achievement, () => {
    // Play sound upon closing each modal
    audio.playAchievementUnlockSFX();
    if (pendingAchievements.length > 0) {
      displayNextAchievementPopup();
    }
  });
}

/**
 * Display tutorial completion screen
 */
export function displayTutorialCompletion() {
  audio.stopAllMusic(state.tensionLoop);

  const tutorialFreezeFreeGiven = localStorage.getItem('tutorialFreezeFreeGiven');
  let includeItemMessage = '';
    if (!tutorialFreezeFreeGiven) {
      inventory.addItemToInventory(0, 1);
    localStorage.setItem('tutorialFreezeFreeGiven', 'true');
    includeItemMessage = '<p style="color: #4ecdc4; font-weight: 600;">🎁 You\'ve also received a <strong>Time Freeze</strong> item!</p>';
  }
  
  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.innerHTML = `
    <div class="popup-content">
      <h2>🎓 Tutorial Complete!</h2>
      <p>You've earned the <strong>Tutorial Master</strong> achievement!</p>
      <p><strong>+25 Sparks</strong> added to your wallet.</p>
      ${includeItemMessage}
      <button id="tutorial-complete-btn" class="popup-button primary">Return to Menu</button>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("tutorial-complete-btn").addEventListener("click", () => {
    popup.remove();
    tutorialModule.complete();
    audio.playMainMenuMusic();
    ui.showScreen("main-menu");
  });
}

// Expose to window for external access
window.displayNextAchievementPopup = displayNextAchievementPopup;
