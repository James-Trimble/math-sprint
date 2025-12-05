// js/state.js

// --- Constants & Global State ---
export const GAME_DURATION = 60; // For Sprint Mode
export const STARTING_LIVES = 3; // For Endless Mode
export const GAME_VERSION = "v0.6.0-alpha";

// Game Variables
export let gameMode = 'sprint'; // 'sprint' or 'endless'
export let score = 0;
export let timeLeft = 60;
export let lives = 3; 
export let difficultyLevel = 1; // 1 = Easy, 2 = Medium, 3 = Hard
export let streak = 0;

// Current Problem Data
export let currentAnswer = 0;
export let currentProblemString = "";

// Timers & Loops
export let timerInterval;
export let tensionLoop;

// High Scores
// We need separate high scores for separate modes now
export let highScoreSprint = parseInt(localStorage.getItem("mathSprintHighScore")) || 0;
export let highScoreEndless = parseInt(localStorage.getItem("mathSprintHighScoreEndless")) || 0;

// Game stats (Analytics)
export let problemsAnswered = 0;
export let correctAnswers = 0;

// Modal Focus Trapping
export let currentModalId = null;
export function setCurrentModalId(id) { currentModalId = id; }

// --- Settings State ---
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

// --- State Management Functions ---

export function saveSettings() {
  localStorage.setItem("mathSprintSettings", JSON.stringify(settings));
}

export function loadSettings() {
  const savedSettings = localStorage.getItem("mathSprintSettings");
  if (savedSettings) {
    const loadedSettings = JSON.parse(savedSettings);
    // Merge loaded settings into the default settings object to prevent crashes if we add new keys later
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
export function setDifficultyLevel(level) { difficultyLevel = level; }
export function setCurrentAnswer(newAnswer) { currentAnswer = newAnswer; }
export function setCurrentProblemString(newString) { currentProblemString = newString; }
export function setStreak(newStreak) { streak = newStreak; }
export function setTimerInterval(newInterval) { timerInterval = newInterval; }
export function setTensionLoop(newLoop) { tensionLoop = newLoop; }

export function setHighScore(newHighScore) {
  if (gameMode === 'sprint') {
    highScoreSprint = newHighScore;
    localStorage.setItem("mathSprintHighScore", highScoreSprint);
  } else {
    highScoreEndless = newHighScore;
    localStorage.setItem("mathSprintHighScoreEndless", highScoreEndless);
  }
}

export function getHighScore() {
  return gameMode === 'sprint' ? highScoreSprint : highScoreEndless;
}

export function setProblemsAnswered(count) { problemsAnswered = count; }
export function setCorrectAnswers(count) { correctAnswers = count; }