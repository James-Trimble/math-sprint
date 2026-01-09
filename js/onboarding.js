/**
 * Onboarding System
 * Manages first-run experience for new players
 */

import * as state from './state.js';

const onboardingModule = (() => {
  let currentStep = 1; // 1, 2, or 3 for all players
  let onboardingData = {
    playerName: '',
    settings: {}
  };

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
   * Full 3-step flow for all new players
   */
  function start() {
    currentStep = 1;
    onboardingData.playerName = '';
  }

  /**
   * Advance to next step
   */
  function nextStep() {
    if (currentStep < 3) {
      currentStep++;
    } else if (currentStep === 3) {
      currentStep = 'complete';
    }
  }

  /**
   * Get current step
   * @returns {number|string} 1, 2, 3, or 'complete'
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
    // Merge onboarding settings into persistent state.settings
    state.loadSettings();
    if (settings) {
      state.settings.operations = state.settings.operations || {};
      state.settings.operations.addition = !!settings.allowAddition;
      state.settings.operations.subtraction = !!settings.allowSubtraction;
      state.settings.operations.multiplication = !!settings.allowMultiplication;
      state.settings.operations.division = !!settings.allowDivision;
    }
    state.saveSettings();
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

  return {
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
    complete
  };
})();

// Make available globally
window.onboardingModule = onboardingModule;
