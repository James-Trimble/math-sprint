// js/state.js

// --- Constants ---
export const GAME_DURATION = 60; 
export const SURVIVAL_START_TIME = 30; 
export const STARTING_LIVES = 3; 
export const GAME_VERSION = "v0.7.1-fix"; // Bump version

// --- Game Variables ---
export let gameMode = 'sprint'; 
export let score = 0;
export let timeLeft = 60;
export let lives = 3;
export let streak = 0;

// OVERDRIVE STATE
export let overdriveActive = false; 
export let overdriveTimer = 0; // NEW: Counts down overdrive duration

// --- Session Earnings ---
export let sessionSparks = 0;

// --- Current Problem ---
export let currentAnswer = 0;
export let currentProblemString = "";

// --- Timers ---
export let timerInterval;
export let tensionLoop;

// --- High Scores ---
export let highScoreSprint = parseInt(localStorage.getItem("mathSprintHighScore")) || 0;
export let highScoreEndless = parseInt(localStorage.getItem("mathSprintHighScoreEndless")) || 0;
export let highScoreSurvival = parseInt(localStorage.getItem("mathSprintHighScoreSurvival")) || 0;

// --- Wallet ---
export let sparksWallet = parseInt(localStorage.getItem("mathSprintSparks")) || 0;

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

// Setters
export function setGameMode(mode) { gameMode = mode; }
export function setScore(newScore) { score = newScore; }
export function setTimeLeft(newTime) { timeLeft = newTime; }
export function setLives(count) { lives = count; }
export function setCurrentAnswer(newAnswer) { currentAnswer = newAnswer; }
export function setCurrentProblemString(newString) { currentProblemString = newString; }
export function setStreak(newStreak) { streak = newStreak; }
export function setTimerInterval(newInterval) { timerInterval = newInterval; }
export function setTensionLoop(newLoop) { tensionLoop = newLoop; }

// Overdrive Setters
export function setOverdriveActive(isActive) { overdriveActive = isActive; }
export function setOverdriveTimer(time) { overdriveTimer = time; }

export function setHighScore(newHighScore) {
  if (gameMode === 'sprint') {
    highScoreSprint = newHighScore;
    localStorage.setItem("mathSprintHighScore", highScoreSprint);
  } else if (gameMode === 'endless') {
    highScoreEndless = newHighScore;
    localStorage.setItem("mathSprintHighScoreEndless", highScoreEndless);
  } else {
    highScoreSurvival = newHighScore;
    localStorage.setItem("mathSprintHighScoreSurvival", highScoreSurvival);
  }
}

export function getHighScore() {
  if (gameMode === 'sprint') return highScoreSprint;
  if (gameMode === 'endless') return highScoreEndless;
  return highScoreSurvival;
}

export function addSparks(amount) {
    if (!amount || amount <= 0) return;
    sparksWallet += amount;
    sessionSparks += amount; 
    localStorage.setItem("mathSprintSparks", sparksWallet);
}

export function clearSessionSparks() { sessionSparks = 0; }
export function setProblemsAnswered(count) { problemsAnswered = count; }
export function setCorrectAnswers(count) { correctAnswers = count; }