/**
 * Achievements System
 * Manages achievement definitions, unlock conditions, and persistence
 */

const achievementsModule = (() => {
  // Achievement definitions
  const achievements = {
    // Onboarding & Tutorial
    onboardingComplete: {
      id: 'onboardingComplete',
      title: 'Welcome Aboard',
      description: 'Completed the onboarding experience',
      reward: null, // No extra reward for onboarding itself
      category: 'milestone'
    },
    tutorialComplete: {
      id: 'tutorialComplete',
      title: 'Tutorial Master',
      description: 'Completed the interactive tutorial',
      reward: 25, // 25 sparks
      category: 'milestone'
    },

    // High Scores (per mode)
    highScoreSprint: {
      id: 'highScoreSprint',
      title: 'Sprint Champion',
      description: 'Achieved a high score in Sprint Mode',
      reward: null,
      category: 'score',
      threshold: 100 // High score ≥100 points
    },
    highScoreEndless: {
      id: 'highScoreEndless',
      title: 'Endless Warrior',
      description: 'Achieved a high score in Endless Mode',
      reward: null,
      category: 'score',
      threshold: 150
    },
    highScoreSurvival: {
      id: 'highScoreSurvival',
      title: 'Survival Expert',
      description: 'Achieved a high score in Survival Mode',
      reward: null,
      category: 'score',
      threshold: 200
    },

    // Game-overs (first completion per mode)
    firstGameOverSprint: {
      id: 'firstGameOverSprint',
      title: 'Sprint Starter',
      description: 'Completed your first Sprint Mode game',
      reward: 10,
      category: 'milestone'
    },
    firstGameOverEndless: {
      id: 'firstGameOverEndless',
      title: 'Endless Beginner',
      description: 'Completed your first Endless Mode game',
      reward: 10,
      category: 'milestone'
    },
    firstGameOverSurvival: {
      id: 'firstGameOverSurvival',
      title: 'Survival Initiate',
      description: 'Completed your first Survival Mode game',
      reward: 10,
      category: 'milestone'
    },

    // Quick game-over (game ends in under 30 seconds)
    quickGameOver: {
      id: 'quickGameOver',
      title: 'Oops!',
      description: 'Finished a game in under 30 seconds',
      reward: 5,
      category: 'amusing'
    },

    // Streak achievements
    tenStreak: {
      id: 'tenStreak',
      title: 'On Fire',
      description: 'Achieved a 10-question streak',
      reward: 15,
      category: 'gameplay'
    },
    twentyStreak: {
      id: 'twentyStreak',
      title: 'Unstoppable',
      description: 'Achieved a 20-question streak',
      reward: 25,
      category: 'gameplay'
    },

    // Overdrive achievements
    firstOverdrive: {
      id: 'firstOverdrive',
      title: 'Charged Up',
      description: 'Activated Overdrive for the first time',
      reward: 10,
      category: 'gameplay'
    },

    // Item-related achievements
    firstItemUsed: {
      id: 'firstItemUsed',
      title: 'Shop Smart',
      description: 'Purchased and used your first item',
      reward: 10,
      category: 'gameplay'
    },

    // Amusing achievements
    noPerfectGame: {
      id: 'noPerfectGame',
      title: 'Human After All',
      description: 'Made a mistake while having perfect accuracy',
      reward: 5,
      category: 'amusing'
    },
    multipleGameOvers: {
      id: 'multipleGameOvers',
      title: 'Resilient',
      description: 'Completed 10 games',
      reward: null,
      category: 'gameplay',
      threshold: 10
    },

    // Daily Challenge achievements
    firstDailyChallenge: {
      id: 'firstDailyChallenge',
      title: 'Daily Devotee',
      description: 'Completed your first Daily Challenge',
      reward: 15,
      category: 'milestone'
    },
    dailyChallenge7Day: {
      id: 'dailyChallenge7Day',
      title: 'Week Warrior',
      description: 'Completed Daily Challenges for 7 consecutive days',
      reward: 50,
      category: 'milestone'
    },
    dailyChallenge30Day: {
      id: 'dailyChallenge30Day',
      title: 'Monthly Master',
      description: 'Completed Daily Challenges for 30 consecutive days',
      reward: 200,
      category: 'milestone'
    },
    dailyChallengePersonalBest: {
      id: 'dailyChallengePersonalBest',
      title: 'Personal Record',
      description: 'Set a new personal best in Daily Challenge',
      reward: 10,
      category: 'score'
    },
    dailyChallengeHighScore: {
      id: 'dailyChallengeHighScore',
      title: 'Daily Dominator',
      description: 'Achieved a high score in Daily Challenge Mode',
      reward: null,
      category: 'score',
      threshold: 150
    },

    // Shop achievements
    firstPurchase: {
      id: 'firstPurchase',
      title: 'Window Shopper No More',
      description: 'Made your first shop purchase',
      reward: 10,
      category: 'milestone'
    },
    bigSpender: {
      id: 'bigSpender',
      title: 'Big Spender',
      description: 'Spent 500 sparks in the shop',
      reward: 25,
      category: 'milestone'
    },
    shopAddict: {
      id: 'shopAddict',
      title: 'Shop Addict',
      description: 'Spent 2000 sparks in the shop',
      reward: 100,
      category: 'milestone'
    },
    itemCollector: {
      id: 'itemCollector',
      title: 'Item Collector',
      description: 'Purchased at least one of every item type',
      reward: 50,
      category: 'milestone'
    },
    itemHoarder: {
      id: 'itemHoarder',
      title: 'Item Hoarder',
      description: 'Have 50 or more total items in inventory',
      reward: 25,
      category: 'milestone'
    },
    jsCodebase: {
      id: 'jsCodebase',
      title: 'JS === Sparks',
      description: 'Our JavaScript has 6,363 lines of code, and you have 6,363 sparks! That\'s worth celebrating!',
      reward: 100,
      category: 'milestone',
      threshold: 6363
    },

    // Hidden/Fun Easter Eggs
    answerIs42: {
      id: 'answerIs42',
      title: 'Don\'t Panic',
      description: 'The answer to life, the universe, and everything',
      reward: 42,
      category: 'hidden'
    },
    perfectTiming: {
      id: 'perfectTiming',
      title: 'Down to the Wire',
      description: 'Finished a Sprint mode game with exactly 0 seconds left',
      reward: 25,
      category: 'hidden'
    },
    nightOwl: {
      id: 'nightOwl',
      title: 'Night Owl',
      description: 'Played between 2am and 4am',
      reward: 15,
      category: 'hidden'
    },
    speedDemon: {
      id: 'speedDemon',
      title: 'Speed Demon',
      description: 'Answered 3 problems in under 5 seconds total',
      reward: 20,
      category: 'hidden'
    },
    calculatorBrain: {
      id: 'calculatorBrain',
      title: 'Calculator Brain',
      description: 'Correctly solved 3 triple-digit problems in a row',
      reward: 30,
      category: 'hidden'
    },
    comebackKid: {
      id: 'comebackKid',
      title: 'Comeback Kid',
      description: 'Recovered from 1 life remaining to win with all 3 lives',
      reward: 25,
      category: 'hidden'
    }
  };

  /**
   * Load achievements from localStorage
   * @returns {Object} Achievements object {achievementId: true, ...}
   */
  function loadAchievements() {
    const stored = localStorage.getItem('mathSprintAchievements');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save achievements to localStorage
   * @param {Object} achieved - Achievements object
   */
  function saveAchievements(achieved) {
    localStorage.setItem('mathSprintAchievements', JSON.stringify(achieved));
  }

  /**
   * Check if an achievement is already unlocked
   * @param {string} achievementId - Achievement ID
   * @returns {boolean}
   */
  function isUnlocked(achievementId) {
    const achieved = loadAchievements();
    return achieved[achievementId] === true;
  }

  /**
   * Unlock an achievement
   * @param {string} achievementId - Achievement ID
   * @returns {boolean} True if newly unlocked, false if already unlocked
   */
  function unlock(achievementId) {
    if (!achievements[achievementId]) {
      console.warn(`Achievement not found: ${achievementId}`);
      return false;
    }

    const achieved = loadAchievements();
    if (achieved[achievementId]) {
      return false; // Already unlocked
    }

    achieved[achievementId] = true;
    saveAchievements(achieved);
    return true; // Newly unlocked
  }

  /**
   * Get achievement details
   * @param {string} achievementId - Achievement ID
   * @returns {Object|null} Achievement object or null
   */
  function getAchievement(achievementId) {
    return achievements[achievementId] || null;
  }

  /**
   * Get all unlocked achievements
   * @returns {Array} Array of achievement objects
   */
  function getUnlocked() {
    const achieved = loadAchievements();
    return Object.keys(achieved)
      .filter(id => achieved[id] === true)
      .map(id => ({ ...achievements[id], unlockedAt: new Date().toISOString() }))
      .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt));
  }

  /**
   * Get all achievements (locked and unlocked)
   * @returns {Array} Array of all achievement objects
   */
  function getAll() {
    return Object.values(achievements);
  }

  /**
   * Get locked achievements (for "See All Achievements" feature)
   * @returns {Array} Array of locked achievement objects
   */
  function getLocked() {
    const achieved = loadAchievements();
    return Object.keys(achievements)
      .filter(id => achieved[id] !== true)
      .map(id => achievements[id]);
  }

  /**
   * Get total achievement count
   * @returns {number}
   */
  function getTotalCount() {
    return Object.keys(achievements).length;
  }

  /**
   * Get unlocked achievement count
   * @returns {number}
   */
  function getUnlockedCount() {
    return Object.keys(loadAchievements()).length;
  }

  return {
    achievements,
    loadAchievements,
    saveAchievements,
    isUnlocked,
    unlock,
    getAchievement,
    getUnlocked,
    getAll,
    getLocked,
    getTotalCount,
    getUnlockedCount
  };
})();

// Make available globally
window.achievementsModule = achievementsModule;
