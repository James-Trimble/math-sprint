/**
 * Game Achievements Module
 * Handles achievement unlocking, queuing, and display logic
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import { renderAchievementsScreen } from './achievements-ui.js';

// Internal queue and state
let pendingAchievements = [];
let isDisplaying = false;
window.pendingAchievements = pendingAchievements;

/**
 * Check if an achievement should be unlocked and forward to achievementsModule
 */
export function checkAndUnlockAchievement(achievementId) {
  if (!window.achievementsModule) return;
  return window.achievementsModule.unlock(achievementId);
}

/**
 * Queue an achievement for display. Idempotent by achievement id.
 */
export function queueAchievement(achievement) {
  if (!achievement || !achievement.id) return;
  // Avoid duplicates
  if (pendingAchievements.find(a => a.id === achievement.id)) {
    // Ensure UI is refreshed
    if (typeof renderAchievementsScreen === 'function') renderAchievementsScreen();
    return;
  }

  pendingAchievements.push(achievement);
  window.pendingAchievements = pendingAchievements;

  if (!isDisplaying) {
    // Start the display flow
    displayNextAchievementPopup();
  }

  if (typeof renderAchievementsScreen === 'function') renderAchievementsScreen();
}

/**
 * Drain the achievement queue and return a promise resolved when drained
 */
export function drainQueue() {
  return new Promise((resolve) => {
    if (!pendingAchievements || pendingAchievements.length === 0) return resolve();
    const onDrained = () => {
      document.removeEventListener('mathSprintAchievementsDrained', onDrained);
      resolve();
    };
    document.addEventListener('mathSprintAchievementsDrained', onDrained);
    // If not currently displaying, kick off the display
    if (!isDisplaying) displayNextAchievementPopup();
  });
}

// Global listener for achievement unlocks
window.document.addEventListener('mathSprintAchievementUnlocked', (e) => {
  const { achievementId, options = {} } = e.detail || {};
  if (!achievementId || !window.achievementsModule) return;

  const achievement = window.achievementsModule.getAchievement(achievementId);
  if (!achievement) return;

  const suppressPopup = !!options.suppressPopup;

  // Announce via screen reader unless suppressed
  if (!suppressPopup && state.gameMode) {
    ui.announceAchievementDuringGameplay(`Achievement unlocked: ${achievement.title}`);
  }

  // Award reward synchronously
  if (achievement.reward) {
    state.addSparks(achievement.reward);
  }

  // Queue for display unless suppressed
  if (!suppressPopup) {
    queueAchievement(achievement);
  } else {
    if (typeof renderAchievementsScreen === 'function') renderAchievementsScreen();
  }
  // Update marketing labels if available
  if (typeof updateMarketingAchievementLabels === 'function') updateMarketingAchievementLabels();
});

/**
 * Display the next pending achievement popup
 */
export function displayNextAchievementPopup() {
  if (!pendingAchievements || pendingAchievements.length === 0) return;
  if (isDisplaying) return;

  isDisplaying = true;

  const achievement = pendingAchievements.shift();
  window.pendingAchievements = pendingAchievements;

  audio.playAchievementUnlockSFX();
  ui.showAchievementPopup(achievement, () => {
    // Play sound upon closing each modal
    audio.playAchievementUnlockSFX();
    if (pendingAchievements.length > 0) {
      // Delay slightly to allow UX separation
      setTimeout(() => {
        isDisplaying = false;
        displayNextAchievementPopup();
      }, 250);
    } else {
      isDisplaying = false;
      try { document.dispatchEvent(new CustomEvent('mathSprintAchievementsDrained')); } catch (e) {}
    }
  });
}

/**
 * Display tutorial completion screen
 */
export function displayTutorialCompletion() {
  audio.stopAllMusic(state.tensionLoop);

  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.innerHTML = `
    <div class="popup-content">
      <h2>Tutorial Complete!</h2>
      <p>You've earned the <strong>Tutorial Master</strong> achievement!</p>
      <p><strong>+25 Sparks</strong> added to your wallet.</p>
      <button id="tutorial-complete-btn" class="popup-button primary">Return to Menu</button>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("tutorial-complete-btn").addEventListener("click", () => {
    popup.remove();
    if (window.tutorialModule && typeof window.tutorialModule.complete === 'function') window.tutorialModule.complete();
    audio.playMainMenuMusic();
    ui.showScreen("main-menu");
  });
}

// Expose compatibility functions
window.displayNextAchievementPopup = displayNextAchievementPopup;
export { pendingAchievements };
