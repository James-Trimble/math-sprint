/**
 * Daily Challenge System
 * Implements daily challenge mode with date-seeded randomization
 * All players worldwide get the same problems each day (seeded by UTC date)
 */

const dailyChallengeModule = (() => {
  let dailyChallengeActive = false;
  let todaysSeed = '';
  let sessionPersonalBest = 0;
  let seedState = 1;

  /**
   * Get today's UTC date in YYYY-MM-DD format
   * @returns {string}
   */
  function getTodaysDate() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generate a seeded random number based on UTC date
   * This ensures deterministic randomness across all players for a given day
   * @param {number} max - Maximum value (exclusive)
   * @returns {number}
   */
  function reseed() {
    const base = parseInt(getTodaysDate().replace(/-/g, ''), 10);
    seedState = base % 233280;
    if (seedState === 0) seedState = 1; // Avoid zero-state lock
  }

  function getSeededRandom(max) {
    if (!seedState) reseed();
    // Simple LCG for deterministic, per-call variation
    seedState = (seedState * 9301 + 49297) % 233280;
    const rnd = seedState / 233280; // 0..1
    return Math.floor(rnd * max);
  }

  /**
   * Initialize daily challenge
   */
  function start() {
    dailyChallengeActive = true;
    todaysSeed = getTodaysDate();
    reseed();
    sessionPersonalBest = getPersonalBest();
  }

  /**
   * Get today's date
   * @returns {string} YYYY-MM-DD
   */
  function getTodaysDateFormatted() {
    return getTodaysDate();
  }

  /**
   * Check if daily challenge is active
   * @returns {boolean}
   */
  function isActive() {
    return dailyChallengeActive;
  }

  /**
   * End daily challenge
   */
  function end() {
    dailyChallengeActive = false;
  }

  /**
   * Save personal best for today
   * @param {number} score - Score achieved
   */
  function savePersonalBest(score) {
    const bests = getStoredPersonalBests();
    const today = getTodaysDate();
    
    // Only update if new score is better than existing personal best
    if (!bests[today] || score > bests[today]) {
      bests[today] = score;
      localStorage.setItem('mathSprintDailyBests', JSON.stringify(bests));
      return true; // New personal best
    }
    return false; // Not a personal best
  }

  /**
   * Get personal best for today
   * @returns {number}
   */
  function getPersonalBest() {
    const bests = getStoredPersonalBests();
    const today = getTodaysDate();
    return bests[today] || 0;
  }

  /**
   * Get all stored personal bests
   * @returns {Object} {YYYY-MM-DD: score, ...}
   */
  function getStoredPersonalBests() {
    const stored = localStorage.getItem('mathSprintDailyBests');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Get session personal best (before current game)
   * @returns {number}
   */
  function getSessionPersonalBest() {
    return sessionPersonalBest;
  }

  /**
   * Cleanup old personal bests (keep only last 90 days)
   */
  function cleanupOldBests() {
    const bests = getStoredPersonalBests();
    const today = new Date();
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    const cleaned = {};
    Object.entries(bests).forEach(([date, score]) => {
      const dateObj = new Date(date + 'T00:00:00Z');
      if (dateObj >= ninetyDaysAgo) {
        cleaned[date] = score;
      }
    });

    localStorage.setItem('mathSprintDailyBests', JSON.stringify(cleaned));
  }

  /**
   * Initialize module on load
   */
  function init() {
    cleanupOldBests();
  }

  // Call init on module creation
  init();

  return {
    getTodaysDate,
    getSeededRandom,
    start,
    getTodaysDateFormatted,
    isActive,
    end,
    savePersonalBest,
    getPersonalBest,
    getStoredPersonalBests,
    getSessionPersonalBest,
    cleanupOldBests
  };
})();

// Make available globally
window.dailyChallengeModule = dailyChallengeModule;
