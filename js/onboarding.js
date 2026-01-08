/**
 * Onboarding System
 * Manages first-run experience for new players and confirm flow for alpha testers
 */

import * as state from './state.js';

const onboardingModule = (() => {
  let currentStep = 1; // 1, 2, 3 for new players; 'confirm' for alpha testers
  let isAlphaTester = false;
  let onboardingData = {
    playerName: '',
    settings: {}
  };

  /**
   * Check if player is an alpha tester (has any mathSprint data)
   * @returns {boolean}
   */
  function detectAlphaTester() {
    const alphaTesterKeys = [
      'mathSprintHighScore',
      'mathSprintHighScoreEndless',
      'mathSprintHighScoreSurvival',
      'mathSprintSparks',
      'mathSprintInventoryV1',
      'mathSprintSettings',
      'mathSprintGamesCompleted'
    ];
    return alphaTesterKeys.some(key => localStorage.getItem(key));
  }

  /**
   * Check if onboarding has been completed
   * @returns {boolean}
   */
  function isOnboardingComplete() {
    return localStorage.getItem('mathSprintOnboardingComplete') === 'true';
  }

  /**
   * Mark onboarding as complete
   */
  function markOnboardingComplete() {
    localStorage.setItem('mathSprintOnboardingComplete', 'true');
  }

  /**
   * Start onboarding flow
   * For new players: full 3-step flow
   * For alpha testers: simplified confirm flow
   */
  function start() {
    isAlphaTester = detectAlphaTester();
    
    if (isAlphaTester) {
      currentStep = 'confirm';
      // Pre-populate name if available
      state.loadSettings();
      onboardingData.playerName = state.settings.playerName || '';
    } else {
      currentStep = 1;
      onboardingData.playerName = '';
    }
  }

  /**
   * Advance to next step
   */
  function nextStep() {
    if (isAlphaTester && currentStep === 'confirm') {
      currentStep = 'complete';
      return;
    }

    if (currentStep < 3) {
      currentStep++;
    } else if (currentStep === 3) {
      currentStep = 'complete';
    }
  }

  /**
   * Get current step
   * @returns {number|string} 1, 2, 3, 'confirm', or 'complete'
   */
  function getCurrentStep() {
    return currentStep;
  }

  /**
   * Check if currently in onboarding
   * @returns {boolean}
   */
  function isActive() {
    return currentStep !== 'complete';
  }

  /**
   * Update onboarding data
   * @param {Object} data - Data to merge
   */
  function updateData(data) {
    onboardingData = { ...onboardingData, ...data };
  }

  /**
   * Get onboarding data
   * @returns {Object}
   */
  function getData() {
    return { ...onboardingData };
  }

  /**
   * Save settings from onboarding to persistent storage
   * @param {Object} settings - Settings object from Step 2
   */
  function saveSettings(settings) {
    onboardingData.settings = settings;
    state.saveSettings(settings);
  }

  /**
   * Save player name
   * @param {string} name - Player name
   */
  function saveName(name) {
    onboardingData.playerName = name;
    state.loadSettings();
    state.settings.playerName = name;
    state.saveSettings(state.settings);
  }

  /**
   * Complete onboarding and mark flag
   */
  function complete() {
    markOnboardingComplete();
    currentStep = 'complete';
  }

  /**
   * Check if alpha tester (used to determine flow)
   * @returns {boolean}
   */
  function getIsAlphaTester() {
    return isAlphaTester;
  }

  return {
    detectAlphaTester,
    isOnboardingComplete,
    markOnboardingComplete,
    start,
    nextStep,
    getCurrentStep,
    isActive,
    updateData,
    getData,
    saveSettings,
    saveName,
    complete,
    getIsAlphaTester
  };
})();

// Make available globally
window.onboardingModule = onboardingModule;
