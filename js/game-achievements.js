/**
 * Game Achievements Module
 * Handles achievement unlocking, queuing, and display logic
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as inventory from './inventory.js';
import { renderAchievementsScreen } from './achievements-ui.js';

// Achievement queue to display after game ends
let pendingAchievements = [];
window.pendingAchievements = pendingAchievements;

/**
 * Check if an achievement should be unlocked and queue it
 */
export function checkAndUnlockAchievement(achievementId) {
  if (!window.achievementsModule) return;

  // Rely on the achievements module to dispatch an event when unlocking.
  // The global event listener will handle queuing, announcing, rewarding, and UI updates.
  return window.achievementsModule.unlock(achievementId);
}

// Global listener for achievement unlocks (handles direct unlocks too)
window.document.addEventListener('mathSprintAchievementUnlocked', (e) => {
  const { achievementId, options = {} } = e.detail || {};
  if (!achievementId || !window.achievementsModule) return;

  const achievement = window.achievementsModule.getAchievement(achievementId);
  if (!achievement) return;

  // If another path already queued this achievement, avoid duplicate
  if (pendingAchievements.find(a => a.id === achievementId)) {
    if (typeof renderAchievementsScreen === 'function') renderAchievementsScreen();
    return;
  }

  const suppressPopup = !!options.suppressPopup;

  // Announce via screen reader unless suppressed
  if (!suppressPopup && state.gameMode) {
    ui.announceAchievementDuringGameplay(`Achievement unlocked: ${achievement.title}`);
  }

  // Award sparks (state.addSparks is idempotent enough for our use)
  if (achievement.reward) {
    state.addSparks(achievement.reward);
  }

  // Queue for display unless suppressed
  if (!suppressPopup) {
    pendingAchievements.push(achievement);
    window.pendingAchievements = pendingAchievements;
  }

  // Update achievements UI
  if (typeof renderAchievementsScreen === 'function') renderAchievementsScreen();
  // Update marketing labels (homepage/stat elements) in case the total achievement count changed
  if (typeof updateMarketingAchievementLabels === 'function') updateMarketingAchievementLabels();
});

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
    includeItemMessage = '<p style="color: #4ecdc4; font-weight: 600;">You\'ve also received a <strong>Time Freeze</strong> item!</p>';
  }
  
  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.innerHTML = `
    <div class="popup-content">
      <h2>Tutorial Complete!</h2>
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
