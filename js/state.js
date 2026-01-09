// js/state.js

import { checkAndUnlockAchievement } from './game-achievements.js';

// --- Constants ---
export const GAME_DURATION = 60; 
export const SURVIVAL_START_TIME = 30; 
export const STARTING_LIVES = 3; 
export const GAME_VERSION = "v1.0"; 
export const CODEBASE_LINES = 8403; // Number of lines across the counted repository (JS/HTML/CSS/JSON/MD/TXT) (updated)


// --- Session Validation ---
export let isSessionValid = true;

// --- Game Variables ---
export let gameMode = 'sprint'; 
export let score = 0;
export let timeLeft = 60;
export let lives = 3;
export let streak = 0;

// OVERDRIVE STATE
export let overdriveActive = false; 
export let overdriveTimer = 0; // NEW: Counts down overdrive duration

// --- Mistakes Tracking ---
export let consecutiveMistakes = 0;

// --- Session Earnings ---
export let sessionSparks = 0;

// --- Current Problem ---
export let currentAnswer = 0;
export let currentProblemString = "";

// --- Timers ---
export let timerInterval;
export let tensionLoop;

// --- High Scores ---
export let highScoreSprint = decodeHighScore("mathSprintHighScore") || 0;
export let highScoreEndless = decodeHighScore("mathSprintHighScoreEndless") || 0;
export let highScoreSurvival = decodeHighScore("mathSprintHighScoreSurvival") || 0;
export let highScoreDailyChallenge = decodeHighScore("mathSprintHighScoreDailyChallenge") || 0;

function decodeHighScore(key) {
  const val = localStorage.getItem(key);
  if (!val) return 0;
  // Try new encrypted format first
  let decoded = decodeValue(val);
  if (decoded !== null) {
    const num = parseInt(decoded);
    return isNaN(num) || num > 20000 ? 0 : num;
  }
  // Fall back to old format (will be re-encrypted on save)
  const num = parseInt(val);
  return isNaN(num) || num > 20000 ? 0 : num;
}

// --- Wallet ---
export let sparksWallet = decodeSparksWallet() || 0;

function decodeSparksWallet() {
  const val = localStorage.getItem("mathSprintSparks");
  if (!val) return 0;
  // Try new encrypted format first
  let decoded = decodeValue(val);
  if (decoded !== null) {
    const num = parseInt(decoded);
    return isNaN(num) || num > 500000 ? 0 : num;
  }
  // Fall back to old format (will be re-encrypted on save)
  const num = parseInt(val);
  return isNaN(num) || num > 500000 ? 0 : num;
}

// --- Stats ---
export let problemsAnswered = 0;
export let correctAnswers = 0;

// --- Modal State ---
export let currentModalId = null;
export function setCurrentModalId(id) { currentModalId = id; }

// --- Settings ---
export let settings = {
  masterVolume: 100,
  musicVolume: 100,
  sfxVolume: 100,
  operations: {
    addition: true,
    subtraction: false,
    multiplication: false,
    division: false
  },
  disableCountdown: false
};

// --- State Functions ---

export function invalidateSession(reason = "Unknown tampering detected") {
  isSessionValid = false;
  console.error("⚠️ SESSION INVALIDATED:", reason);
  alert("⚠️ Session Invalid: Tampering Detected.\n\nReason: " + reason + "\n\nThe page will now reload.");
  location.reload();
}

export function saveSettings() {
  localStorage.setItem("mathSprintSettings", JSON.stringify(settings));
}

export function loadSettings() {
  const savedSettings = localStorage.getItem("mathSprintSettings");
  if (savedSettings) {
    const loadedSettings = JSON.parse(savedSettings);
    settings = { ...settings, ...loadedSettings };
    if (loadedSettings.operations) {
      settings.operations = { ...settings.operations, ...loadedSettings.operations };
    }
  }
}

// Setters with validation
export function setGameMode(mode) { gameMode = mode; }
export function setScore(newScore) { 
  if (newScore > 100000) {
    invalidateSession("Score exceeds maximum possible value (>100000)");
    return;
  }
  score = newScore; 
}
export function setTimeLeft(newTime) { 
  if (newTime > 3600) {
    invalidateSession("Time exceeds maximum possible value (>3600s)");
    return;
  }
  timeLeft = newTime; 
}
export function setLives(count) { 
  if (count > 15) {
    invalidateSession("Lives exceed maximum possible value (>15)");
    return;
  }
  lives = count; 
}
export function setCurrentAnswer(newAnswer) { currentAnswer = newAnswer; }
export function setCurrentProblemString(newString) { currentProblemString = newString; }
export function setStreak(newStreak) { streak = newStreak; }
export function setConsecutiveMistakes(count) { 
  if (count > 20) {
    invalidateSession("Consecutive mistakes exceeds maximum possible value (>20)");
    return;
  }
  consecutiveMistakes = count; 
}
export function setTimerInterval(newInterval) { timerInterval = newInterval; }
export function setTensionLoop(newLoop) { tensionLoop = newLoop; }

// Overdrive Setters
export function setOverdriveActive(isActive) { overdriveActive = isActive; }
export function setOverdriveTimer(time) { overdriveTimer = time; }

export function setHighScore(newHighScore) {
  if (newHighScore > 20000) {
    console.warn("High score seems impossible, may indicate tampering:", newHighScore);
  }
  if (gameMode === 'sprint') {
    highScoreSprint = newHighScore;
    localStorage.setItem("mathSprintHighScore", encodeValue(highScoreSprint.toString()));
  } else if (gameMode === 'endless') {
    highScoreEndless = newHighScore;
    localStorage.setItem("mathSprintHighScoreEndless", encodeValue(highScoreEndless.toString()));
  } else if (gameMode === 'daily-challenge') {
    highScoreDailyChallenge = newHighScore;
    localStorage.setItem("mathSprintHighScoreDailyChallenge", encodeValue(highScoreDailyChallenge.toString()));
  } else {
    highScoreSurvival = newHighScore;
    localStorage.setItem("mathSprintHighScoreSurvival", encodeValue(highScoreSurvival.toString()));
  }
}

export function getHighScore() {
  if (gameMode === 'sprint') return highScoreSprint;
  if (gameMode === 'endless') return highScoreEndless;
  if (gameMode === 'daily-challenge') return highScoreDailyChallenge;
  return highScoreSurvival;
}

/**
 * Check and unlock achievements based on current sparks wallet value
 */
export function checkSparkAchievements() {
  // Exact matches
  if (sparksWallet === 314) checkAndUnlockAchievement('piSparks314');
  if (sparksWallet === CODEBASE_LINES) checkAndUnlockAchievement('sparksEqualsCodebase');

  // Threshold achievements (>=)
  if (sparksWallet >= 1000) checkAndUnlockAchievement('sparks1000');
  if (sparksWallet >= 5435) checkAndUnlockAchievement('jsCodebase');
  if (sparksWallet >= 5000) checkAndUnlockAchievement('sparks5000');
  if (sparksWallet >= 10000) checkAndUnlockAchievement('sparks10000');
}

export function addSparks(amount) {
    if (!amount || amount <= 0) return;
    if (amount > 10000) {
      invalidateSession("Spark transaction too large (>10000 sparks in one operation)");
      return;
    }
    sparksWallet += amount;
    sessionSparks += amount; 
    localStorage.setItem("mathSprintSparks", encodeValue(sparksWallet.toString()));

    // Run spark-based achievement checks
    checkSparkAchievements();

    // Small chance to unlock a random hidden achievement (0.5% per call)
    if (Math.random() < 0.005) {
      const randomIds = ['luckyStrike', 'cosmicCoincidence', 'glitchInTheMatrix'];
      const chosen = randomIds[Math.floor(Math.random() * randomIds.length)];
      checkAndUnlockAchievement(chosen);
    }
}

export function deductSparks(amount) {
    if (!amount || amount <= 0) return false;
    if (sparksWallet < amount) return false;
    sparksWallet -= amount;
    localStorage.setItem("mathSprintSparks", encodeValue(sparksWallet.toString()));

    // Run spark-based achievement checks (spending may hit thresholds or parity)
    checkSparkAchievements();

    // Small chance to unlock a random hidden achievement (0.5% per call)
    if (Math.random() < 0.005) {
      const randomIds = ['luckyStrike', 'cosmicCoincidence', 'glitchInTheMatrix'];
      const chosen = randomIds[Math.floor(Math.random() * randomIds.length)];
      checkAndUnlockAchievement(chosen);
    }

    return true;
}

// --- Encryption Helpers ---
const CIPHER_KEY = "mathSprintSecure2026";

export function encodeValue(val) {
  // Simple Base64 encoding with XOR cipher
  const encoded = btoa(val);
  let result = "";
  for (let i = 0; i < encoded.length; i++) {
    result += String.fromCharCode(encoded.charCodeAt(i) ^ CIPHER_KEY.charCodeAt(i % CIPHER_KEY.length));
  }
  return btoa(result);
}

export function decodeValue(val) {
  try {
    let decoded = atob(val);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ CIPHER_KEY.charCodeAt(i % CIPHER_KEY.length));
    }
    return atob(result);
  } catch (e) {
    return null;
  }
}

export function validateStoredValue(val, maxValue) {
  if (!val) return null;
  const decoded = decodeValue(val);
  if (decoded === null) return null;
  const num = parseInt(decoded);
  if (isNaN(num) || num > maxValue) return null;
  return num;
}

export function clearCorruptedData() {
  localStorage.removeItem("mathSprintHighScore");
  localStorage.removeItem("mathSprintHighScoreEndless");
  localStorage.removeItem("mathSprintHighScoreSurvival");
  localStorage.removeItem("mathSprintSparks");
}

export function clearSessionSparks() { sessionSparks = 0; }
export function setProblemsAnswered(count) { problemsAnswered = count; }
export function setCorrectAnswers(count) { correctAnswers = count; }