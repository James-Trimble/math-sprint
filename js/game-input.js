/**
 * Game Input Module
 * Handles player answer submission with anti-cheat validation and response logic
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as itemEffects from './item-effects.js';
import { generateProblem, updateScore } from './game-problems.js';
import { checkAndUnlockAchievement, displayTutorialCompletion } from './game-achievements.js';
import { gameOver } from './game-flow.js';

/**
 * Handle player answer submission
 */
export function handleAnswerSubmit() {
  const userAnswerStr = ui.answerEl.value.trim();
  if (userAnswerStr === '') return; 
  const userAnswer = parseInt(userAnswerStr);
  state.setProblemsAnswered(state.problemsAnswered + 1);

  // === Anti-cheat Validation ===
  
  // Check submission timing
  const now = performance.now();
  const timeSinceLastSubmission = now - window.lastSubmissionTime;
  window.lastSubmissionTime = now;
  
  if (timeSinceLastSubmission < 100) {
    state.invalidateSession("Submission too fast (< 100ms) - impossible to solve in that time");
    return;
  }

  // Check theoretical max score
  const elapsedMs = now - window.gameStartTime;
  const elapsedSeconds = elapsedMs / 1000;
  const theoreticalMaxScore = elapsedSeconds * 15;
  const allowedScore = theoreticalMaxScore * 2.0;
  
  if (state.score > allowedScore) {
    state.invalidateSession(`Score impossible (${state.score} > theoretical max ${Math.floor(allowedScore)})`);
    return;
  }

  // Check average time per problem
  const avgTimePerProblem = elapsedMs / state.problemsAnswered;
  if (avgTimePerProblem < 250) {
    state.invalidateSession(`Average solve time too fast (${Math.floor(avgTimePerProblem)}ms < 250ms minimum)`);
    return;
  }

  // Validate answer range
  const problemStr = state.currentProblemString.toLowerCase();
  let isValidRange = false;
  if (problemStr.includes("+") || problemStr.includes("-")) {
    isValidRange = userAnswer >= -100 && userAnswer <= 200;
  } else if (problemStr.includes("×")) {
    isValidRange = userAnswer >= 1 && userAnswer <= 250;
  } else if (problemStr.includes("÷")) {
    isValidRange = userAnswer >= 1 && userAnswer <= 20;
  }
  
  if (!isValidRange && state.gameMode !== 'undefined') {
    state.invalidateSession(`Invalid answer range: ${userAnswer} is impossible for this problem`);
    return;
  }

  // === Answer Processing ===
  
  // Easter egg: Answer is 42
  if (userAnswer === 42 && state.currentAnswer === 42) {
    checkAndUnlockAchievement('answerIs42');
  }
  
  if (userAnswer === state.currentAnswer) {
    handleCorrectAnswer();
  } else {
    handleIncorrectAnswer();
  }

  // Check tutorial phase progression
  checkTutorialProgress();
}

/**
 * Handle correct answer
 */
function handleCorrectAnswer() {
  state.setStreak(state.streak + 1);
  state.setCorrectAnswers(state.correctAnswers + 1);
  state.setConsecutiveMistakes(0);
  ui.updateConsecutiveMistakesDisplay(0);
  
  // Track timing for speed demon achievement
  if (!window.speedDemonTimer) {
    window.speedDemonTimer = performance.now();
    window.speedDemonCount = 0;
  }
  window.speedDemonCount++;
  
  const speedDemonElapsed = (performance.now() - window.speedDemonTimer) / 1000;
  if (window.speedDemonCount >= 3 && speedDemonElapsed < 5) {
    checkAndUnlockAchievement('speedDemon');
  }
  if (window.speedDemonCount >= 3) {
    window.speedDemonTimer = performance.now();
    window.speedDemonCount = 0;
  }
  
  // Track triple-digit problems for calculator brain
  const problemContainsTripleDigit = /\d{3}/.test(state.currentProblemString);
  if (problemContainsTripleDigit) {
    window.tripleDigitStreak = (window.tripleDigitStreak || 0) + 1;
    if (window.tripleDigitStreak >= 3) {
      checkAndUnlockAchievement('calculatorBrain');
    }
  } else {
    window.tripleDigitStreak = 0;
  }
  
  if (state.gameMode === 'survival') {
    state.setTimeLeft(state.timeLeft + 5);
    ui.updateTimerDisplay(state.timeLeft);
  }

  if (state.streak >= 3) {
    if (!state.overdriveActive) {
      state.setOverdriveActive(true);
      ui.toggleOverdriveVisuals(true);
    }
    state.setOverdriveTimer(10); 
    ui.updateFeedbackDisplay("🔥 OVERDRIVE! (2x Points)", "red");
  } else {
    ui.updateFeedbackDisplay("✅ Correct!", "green");
  }

  if (state.streak > 0 && state.streak % 3 === 0) {
    updateScore(15);
    audio.playStreakTone();
    audio.playGabrielHappy(); 
    ui.glowScore();
  } else {
    updateScore(10);
    audio.playCorrectTone();
  }
  
  generateProblem(state.overdriveActive ? "🔥 " : "Correct! ");
}

/**
 * Handle incorrect answer
 */
function handleIncorrectAnswer() {
  state.setStreak(0);
  state.setOverdriveActive(false);
  state.setOverdriveTimer(0);
  ui.toggleOverdriveVisuals(false);
  audio.playIncorrectTone();
  
  state.setConsecutiveMistakes(state.consecutiveMistakes + 1);
  ui.updateConsecutiveMistakesDisplay(state.consecutiveMistakes);
  
  if (state.consecutiveMistakes === 2) {
    ui.triggerRedFlash();
  }

  if (itemEffects.shouldBlockPenalty()) {
    ui.updateFeedbackDisplay("🛡️ Shield blocked it", "blue");
    generateProblem("Shield active. ");
    return;
  }
  
  // Handle mode-specific penalties
  if (state.gameMode === 'survival') {
    handleSurvivalPenalty();
  } else if (state.gameMode === 'endless') {
    handleEndlessPenalty();
  } else if (state.gameMode === 'sprint') {
    handleSprintPenalty();
  }
  
  ui.updateFeedbackDisplay("❌ Incorrect!", "red");
  ui.updateProblemDisplay("Incorrect! " + state.currentProblemString);
  ui.answerEl.value = "";
  ui.answerEl.focus();
}

/**
 * Handle survival mode penalty (10s per 3 mistakes)
 */
function handleSurvivalPenalty() {
  if (state.consecutiveMistakes >= 3) {
    state.setTimeLeft(state.timeLeft - 10);
    ui.updateTimerDisplay(state.timeLeft);
    state.setConsecutiveMistakes(0);
    ui.updateConsecutiveMistakesDisplay(0);
    ui.updateFeedbackDisplay("⏱️ 10s penalty for 3 mistakes!", "orange");
  } else {
    state.setTimeLeft(state.timeLeft - 10);
    ui.updateTimerDisplay(state.timeLeft);
  }
  
  if (state.timeLeft <= 0) {
    gameOver();
  }
}

/**
 * Handle endless mode penalty (1 life per 3 mistakes)
 */
function handleEndlessPenalty() {
  if (state.consecutiveMistakes >= 3) {
    state.setLives(state.lives - 1);
    ui.updateLivesDisplay(state.lives);
    audio.playGabrielSassy();
    state.setConsecutiveMistakes(0);
    ui.updateConsecutiveMistakesDisplay(0);
    
    // Track for comeback kid achievement
    if (state.lives === 1) {
      window.hadOneLiveLeft = true;
    }
    
    if (state.lives <= 0) {
      ui.updateFeedbackDisplay("💔 Game Over! No lives remaining", "red");
      gameOver();
    } else {
      ui.updateFeedbackDisplay("💔 Lost a life! (3 consecutive mistakes)", "orange");
    }
  }
}

/**
 * Handle sprint mode penalty (10s per 3 mistakes)
 */
function handleSprintPenalty() {
  if (state.consecutiveMistakes >= 3) {
    state.setTimeLeft(state.timeLeft - 10);
    ui.updateTimerDisplay(state.timeLeft);
    state.setConsecutiveMistakes(0);
    ui.updateConsecutiveMistakesDisplay(0);
    ui.updateFeedbackDisplay("⏱️ 10s penalty for 3 mistakes!", "orange");
    
    if (state.timeLeft <= 0) {
      const { gameOver } = window;
      if (gameOver) gameOver();
    }
  }
}

/**
 * Check tutorial phase progression
 */
function checkTutorialProgress() {
  if (typeof window.tutorialModule === 'undefined' || !window.tutorialModule.isActive()) {
    return;
  }

  const currentPhase = window.tutorialModule.getCurrentPhase();
  if (currentPhase && currentPhase.targetCorrect && state.correctAnswers >= currentPhase.targetCorrect) {
    window.tutorialModule.nextPhase();
    const nextPhase = window.tutorialModule.getCurrentPhase();
    
    if (nextPhase && nextPhase.callout) {
      ui.displayTutorialPhaseCallout(nextPhase);
    }
    
    if (tutorialModule.isComplete()) {
      setTimeout(() => {
        displayTutorialCompletion();
      }, 1000);
    }
  }
}
