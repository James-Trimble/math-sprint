/**
 * Game Problems Module
 * Handles problem generation and scoring logic
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import * as itemEffects from './item-effects.js';

/**
 * Hash answer for anti-cheat
 */
function hashAnswer(answer) {
  return (answer * 7919) % 999983;
}

/**
 * Generate next problem based on game state
 */
export function generateProblem(feedbackPrefix = "") {
  let availableOps = [];
  const forcedOps = itemEffects.getForcedOps();
  const disabledOps = itemEffects.getDisabledOps();
  
  // Use seeded random for daily challenge
  const getRandom = () => {
    if (state.gameMode === 'daily-challenge' && window.dailyChallengeModule) {
      return window.dailyChallengeModule.getSeededRandom(1000000) / 1000000;
    }
    return Math.random();
  };
  
  if (forcedOps && forcedOps.length > 0) {
    availableOps = [...forcedOps];
  } else {
    if (state.gameMode === 'daily-challenge') {
      // Daily challenge ignores player operation toggles for a consistent, mixed challenge
      availableOps = ["+", "-", "×", "÷"];
    } else if (state.gameMode === 'survival') {
      availableOps.push("+"); 
      if (state.score > 20) availableOps.push("-");
      if (state.score > 50) availableOps.push("×");
      if (state.score > 80) availableOps.push("÷");
    } else {
      if (state.settings.operations.addition) availableOps.push("+");
      if (state.settings.operations.subtraction) availableOps.push("-");
      if (state.settings.operations.multiplication) availableOps.push("×");
      if (state.settings.operations.division) availableOps.push("÷");
    }
  }

  if (disabledOps.length > 0) {
    availableOps = availableOps.filter(op => !disabledOps.includes(op));
  }
  
  if (availableOps.length === 0) availableOps.push("+");
  
  const op = availableOps[Math.floor(getRandom() * availableOps.length)];
  let a, b, answer, problemString;
  let maxNum = 12;

  if (state.gameMode === 'daily-challenge') {
    // Start moderately challenging and ramp up with each problem
    const base = 18;
    const ramp = Math.min(40, state.problemsAnswered * 2); // caps at 58
    maxNum = base + ramp;
  }

  if (state.gameMode === 'endless' || state.gameMode === 'survival') {
    if (state.score < 40) maxNum = 10;
    else if (state.score < 100) maxNum = 20;
    else maxNum = 100;
  }

  switch (op) {
    case "+":
      a = Math.floor(getRandom() * maxNum) + 1;
      b = Math.floor(getRandom() * maxNum) + 1;
      answer = a + b;
      problemString = `${a} + ${b} = ?`;
      break;
    case "-":
      a = Math.floor(getRandom() * maxNum) + 2; 
      b = Math.floor(getRandom() * a) + 1; 
      answer = a - b;
      problemString = `${a} - ${b} = ?`;
      break;
    case "×":
      let multMax;
      if (state.gameMode === 'daily-challenge') {
        multMax = Math.min(15, Math.max(8, Math.floor(maxNum / 2)));
      } else if (maxNum >= 100) {
        multMax = 15;
      } else if (maxNum >= 20) {
        multMax = 12;
      } else {
        multMax = Math.min(maxNum, 12);
      }
      a = Math.floor(getRandom() * multMax) + 1;
      b = Math.floor(getRandom() * multMax) + 1;
      answer = a * b;
      problemString = `${a} × ${b} = ?`;
      break;
    case "÷":
      const divMax = state.gameMode === 'daily-challenge'
        ? Math.min(18, Math.max(6, Math.floor(maxNum / 4)))
        : ((maxNum > 12) ? 12 : maxNum);
      b = Math.floor(getRandom() * divMax) + 2; 
      answer = Math.floor(getRandom() * divMax) + 2; 
      a = b * answer; 
      problemString = `${a} ÷ ${b} = ?`;
      break;
  }

  state.setCurrentAnswer(answer);
  state.setCurrentProblemString(problemString);
  window.currentAnswerHash = hashAnswer(answer);
  
  ui.updateProblemDisplay(feedbackPrefix + problemString);
  ui.answerEl.value = "";
  ui.answerEl.focus();
}

/**
 * Update score with multipliers
 */
export function updateScore(points) {
  const itemMultiplier = itemEffects.getScoreMultiplier();
  const overdriveMultiplier = state.overdriveActive ? 2 : 1;
  const finalPoints = points * itemMultiplier * overdriveMultiplier;
  
  const oldScore = state.score;
  state.setScore(state.score + finalPoints);
  ui.updateScoreDisplay(state.score);

  if (state.gameMode === 'endless') {
    const MAX_LIVES = 10;
    if (Math.floor(state.score / 250) > Math.floor(oldScore / 250) && state.lives < MAX_LIVES) {
      state.setLives(state.lives + 1);
      ui.updateLivesDisplay(state.lives);
      ui.updateFeedbackDisplay(`❤️ Extra Life! (${state.lives}/${MAX_LIVES})`, "pink");
    } else if (state.lives >= MAX_LIVES && Math.floor(state.score / 250) > Math.floor(oldScore / 250)) {
      ui.updateFeedbackDisplay("💪 MAX LIVES! Go for broke - take risks for massive scores!", "purple");
    }
  }
  
  if (state.score > 100) ui.setGabrielState('fast');
  else ui.setGabrielState('running');
}
