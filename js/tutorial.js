/**
 * Interactive Tutorial System
 * Guides new players through game mechanics with comprehensive examples
 */

import * as state from './state.js';

const tutorialModule = (() => {
  let tutorialActive = false;
  let tutorialPhase = 0;
  const tutorialPhases = [
    {
      id: 'welcome',
      title: 'Welcome to MathSprint!',
      description: 'An interactive guided tour',
      callout: 'This tutorial will walk you through the game step-by-step. Let\'s start with a quick math practice!',
      allowGameStart: false,
      type: 'info'
    },
    {
      id: 'practice-basics',
      title: 'Try It: Answer 3 Problems',
      description: 'Get hands-on experience',
      callout: 'Answer 3 math problems to learn the basics. Don\'t worry - this is just practice!',
      allowGameStart: true,
      targetCorrect: 3,
      operation: 'addition',
      type: 'practice',
      modeOverride: 'sprint'
    },
    {
      id: 'modes-sprint',
      title: 'Game Mode: Sprint (60s)',
      description: 'Race against the clock',
      callout: 'Sprint Mode: Answer as many problems as you can in 60 seconds. Perfect for quick sessions!',
      allowGameStart: false,
      type: 'mode-demo',
      mode: 'sprint'
    },
    {
      id: 'modes-endless',
      title: 'Game Mode: Endless (3 Lives)',
      description: 'Test your accuracy',
      callout: 'Endless Mode: No timer, but 3 mistakes in a row costs you a life. How long can you survive?',
      allowGameStart: false,
      type: 'mode-demo',
      mode: 'endless'
    },
    {
      id: 'modes-survival',
      title: 'Game Mode: Survival (Dynamic)',
      description: 'The ultimate challenge',
      callout: 'Survival Mode: Start with 30 seconds. Each correct answer adds time, mistakes subtract time. Intense!',
      allowGameStart: false,
      type: 'mode-demo',
      mode: 'survival'
    },
    {
      id: 'modes-daily',
      title: 'Game Mode: Daily Challenge',
      description: 'Compete globally',
      callout: 'Daily Challenge: Everyone worldwide gets the same problems each day. Beat your personal best!',
      allowGameStart: false,
      type: 'mode-demo',
      mode: 'daily-challenge'
    },
    {
      id: 'shop-tour',
      title: 'The Shop: Power-Ups & Items',
      description: 'Strategic advantages',
      callout: 'Earn Sparks from gameplay to buy items. Time Freeze, Score Multipliers, Extra Lives, and more!',
      allowGameStart: false,
      type: 'shop-demo'
    },
    {
      id: 'achievements-tour',
      title: 'Achievements System',
      description: 'Track your progress',
      callout: 'Unlock 30+ achievements by playing, reaching milestones, and discovering hidden secrets!',
      allowGameStart: false,
      type: 'achievements-demo'
    },
    {
      id: 'overdrive-explained',
      title: 'Pro Tip: Overdrive Mode',
      description: 'Double your points',
      callout: 'Get 3 correct answers in a row to activate Overdrive and earn 2x points. Keep the streak alive!',
      allowGameStart: false,
      type: 'info'
    },
    {
      id: 'complete',
      title: 'You\'re Ready!',
      description: 'Tutorial complete',
      callout: 'You\'ve earned the Tutorial Master achievement and 25 Sparks! Time to play for real!',
      allowGameStart: false,
      type: 'completion'
    }
  ];

  /**
   * Start tutorial
   */
  function start() {
    tutorialActive = true;
    tutorialPhase = 0;
  }

  /**
   * Advance to next phase
   */
  function nextPhase() {
    if (tutorialPhase < tutorialPhases.length - 1) {
      tutorialPhase++;
    }
  }

  /**
   * Go to previous phase
   */
  function prevPhase() {
    if (tutorialPhase > 0) {
      tutorialPhase--;
    }
  }

  /**
   * Get current phase info
   * @returns {Object} Phase object
   */
  function getCurrentPhase() {
    return tutorialPhases[tutorialPhase] || null;
  }

  /**
   * Get tutorial phase index
   * @returns {number}
   */
  function getPhaseIndex() {
    return tutorialPhase;
  }

  /**
   * Check if tutorial is active
   * @returns {boolean}
   */
  function isActive() {
    return tutorialActive;
  }

  /**
   * Check if tutorial is complete
   * @returns {boolean}
   */
  function isComplete() {
    return tutorialPhase >= tutorialPhases.length - 1;
  }

  /**
   * Complete tutorial
   */
  function complete() {
    tutorialActive = false;
    tutorialPhase = tutorialPhases.length - 1;

    // Unlock tutorial achievement and award sparks via state
    try {
      if (typeof window.achievementsModule !== 'undefined') {
        // Suppress the generic achievement popup here; we'll show the tutorial-specific popup instead
        window.achievementsModule.unlock('tutorialComplete', { suppressPopup: true });
      }
    } catch (e) {
      // Fail-safe: do not block flow on achievement errors
      console.warn('Tutorial completion reward error:', e);
    }
  }

  /**
   * Reset tutorial for replay
   */
  function reset() {
    tutorialActive = false;
    tutorialPhase = 0;
  }

  /**
   * Check if tutorial has been completed before
   * @returns {boolean}
   */
  function hasBeenCompleted() {
    return achievementsModule.isUnlocked('tutorialComplete');
  }

  /**
   * Get tutorial progress (current phase / total phases)
   * @returns {Object} {current, total}
   */
  function getProgress() {
    return {
      current: tutorialPhase + 1,
      total: tutorialPhases.length
    };
  }

  return {
    start,
    nextPhase,
    prevPhase,
    getCurrentPhase,
    getPhaseIndex,
    isActive,
    isComplete,
    complete,
    reset,
    hasBeenCompleted,
    getProgress,
    tutorialPhases
  };
})();

// Make available globally
window.tutorialModule = tutorialModule;
