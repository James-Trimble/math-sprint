/**
 * Interactive Tutorial System
 * Guides new players through game mechanics with comprehensive examples
 */

import * as state from './state.js';

const tutorialModule = (() => {
  let tutorialActive = false;
  let tutorialPhase = 0; // 0: intro, 1-5: mechanics, 6: complete
  const tutorialPhases = [
    {
      id: 'intro',
      title: 'Welcome to MathSprint',
      description: 'Learn the basics of how to play and master the mechanics',
      callout: 'You will answer math problems as quickly as you can. Ready?',
      allowGameStart: false
    },
    {
      id: 'basics',
      title: 'Basic Problem-Solving',
      description: 'Answer problems correctly to earn points',
      callout: 'Answer each problem correctly. You get 10 points per correct answer.',
      allowGameStart: true,
      targetCorrect: 3,
      operation: 'addition'
    },
    {
      id: 'streak',
      title: 'Building a Streak',
      description: 'Answer consecutive questions correctly to activate Overdrive',
      callout: 'Get 3 questions right in a row to activate Overdrive for a 2x multiplier!',
      allowGameStart: true,
      targetCorrect: 3,
      operation: 'addition'
    },
    {
      id: 'penalties',
      title: 'Watch Your Mistakes',
      description: 'Learn about the penalty system',
      callout: 'Make 3 mistakes in a row and you get a 10-second penalty. Be careful!',
      allowGameStart: true,
      targetCorrect: 5,
      operation: 'addition'
    },
    {
      id: 'items',
      title: 'Using Items',
      description: 'Items can help you in tough situations',
      callout: 'Visit the shop to purchase items with Sparks (earned from gameplay). Use them strategically!',
      allowGameStart: false
    },
    {
      id: 'modes',
      title: 'Game Modes',
      description: 'Choose your challenge',
      callout: 'Sprint: 60 seconds | Endless: 3 lives | Survival: Expanding timer with difficulty scaling',
      allowGameStart: false
    },
    {
      id: 'complete',
      title: 'Ready to Play!',
      description: 'You are now ready to start playing MathSprint',
      callout: 'Good luck! You have earned the Tutorial Master achievement and 25 Sparks!',
      allowGameStart: false
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
        const unlocked = window.achievementsModule.unlock('tutorialComplete');
        const ach = window.achievementsModule.getAchievement('tutorialComplete');
        const reward = ach && ach.reward ? ach.reward : 0;
        if (reward) state.addSparks(reward);
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
