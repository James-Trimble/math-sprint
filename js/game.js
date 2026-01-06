import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import * as shop from './shop.js'; 
import * as inventory from './inventory.js';
import * as itemEffects from './item-effects.js';
import { getQuickUseList } from './item-effects.js';

// --- Anti-cheat: Answer Hashing ---
function hashAnswer(answer) {
  return (answer * 7919) % 999983;
}

function verifyAnswer(userAnswer, hashedAnswer) {
  return hashAnswer(userAnswer) === hashedAnswer;
}

// --- Navigation ---

export function goToMainMenu() {
  audio.stopAllMusic(state.tensionLoop);
  ui.setGabrielState('idle');
  ui.toggleOverdriveVisuals(false);

  // Cash Out Check
  if (state.sessionSparks > 0) {
      ui.cashOutSparks.textContent = `+${state.sessionSparks} SPARKS`;
      ui.showScreen("cash-out-popup", true);
      audio.playCashOutSFX();
      state.clearSessionSparks();
      // (Music will trigger when popup closes)
  } else {
      ui.showScreen("main-menu");
      // Start Menu Music Immediately
      audio.playMainMenuMusic();
  }
}

// --- Game Start ---

export function startGame(mode = 'sprint') {
  // Ensure menu music stops before game music starts
  audio.stopAllMusic(state.tensionLoop);
  ui.toggleOverdriveVisuals(false);
  itemEffects.resetEffects();
  
  state.setGameMode(mode);
  state.setScore(0);
  state.setStreak(0);
  state.setConsecutiveMistakes(0); // Reset consecutive mistakes counter
  state.setOverdriveActive(false);
  state.setOverdriveTimer(0);
  state.setProblemsAnswered(0);
  state.setCorrectAnswers(0);
  
  // Anti-cheat: Track timing data
  window.gameStartTime = performance.now();
  window.lastSubmissionTime = performance.now();
  
  ui.configureGameUI(mode);
  ui.updateConsecutiveMistakesDisplay(0); // Hide consecutive mistakes display
  
  if (mode === 'sprint') {
    state.setTimeLeft(state.GAME_DURATION);
    ui.updateTimerDisplay(state.GAME_DURATION);
  } else if (mode === 'survival') {
    state.setTimeLeft(state.SURVIVAL_START_TIME);
    ui.updateTimerDisplay(state.SURVIVAL_START_TIME);
  } else {
    state.setLives(state.STARTING_LIVES);
    ui.updateLivesDisplay(state.STARTING_LIVES);
  }

  ui.updateScoreDisplay(0);
  ui.updateFeedbackDisplay("", "green");
  ui.submitBtn.disabled = false;
  ui.answerEl.disabled = false;
  ui.answerEl.value = "";

  ui.renderQuickUseButtons(
    getQuickUseList(),
    (id) => inventory.getItemCount(id),
    (id) => handleQuickUse(id)
  );
  
  ui.setGabrielState('running');
  ui.showScreen("game-screen");

  if (state.settings.disableCountdown) {
    ui.countdownOverlay.classList.add("hidden");
    startRound(); 
  } else {
    startCountdown(); 
  }
}

function startCountdown() {
  ui.countdownOverlay.classList.remove("hidden");
  let count = 3;
  ui.countdownText.textContent = count;
  audio.playCountdownBeep();

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      ui.countdownText.textContent = count;
      audio.playCountdownBeep();
    } else {
      clearInterval(countdownInterval);
      ui.countdownText.textContent = "GO!";
      audio.playCountdownGoBeep();
      setTimeout(() => {
        ui.countdownOverlay.classList.add("hidden");
        startRound();
      }, 500); 
    }
  }, 1000);
}

function startRound() {
  // Resume audio context before starting music (required for browser autoplay policies)
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }
  
  if (state.settings.musicVolume > 0) {
    if (state.gameMode === 'sprint' && audio.backgroundMusicSprint.loaded) {
      audio.backgroundMusicSprint.start();
    } else if (state.gameMode === 'survival' && audio.backgroundMusicSurvival.loaded) {
      audio.backgroundMusicSurvival.start();
    } else if (state.gameMode === 'endless' && audio.backgroundMusicEndless.loaded) {
      audio.backgroundMusicEndless.start();
    }
  }
  
  ui.answerEl.focus(); 
  generateProblem();
  
  if (state.gameMode !== 'endless') {
      state.setTimerInterval(setInterval(gameTick, 1000));
  }
}

// --- Loop ---

function gameTick() {
  itemEffects.handleTick();
  const timeDelta = itemEffects.getTimeDelta();
  if (state.gameMode !== 'endless') {
    state.setTimeLeft(state.timeLeft - timeDelta);
    ui.updateTimerDisplay(Math.ceil(state.timeLeft));
  }

  // Overdrive Decay
  if (state.overdriveActive) {
      state.setOverdriveTimer(state.overdriveTimer - 1);
      if (state.overdriveTimer <= 0) {
          state.setOverdriveActive(false);
          ui.toggleOverdriveVisuals(false);
          ui.updateFeedbackDisplay("Overdrive Depleted", "orange");
      }
  }

  // Tension Loop
  if (state.gameMode !== 'endless' && state.timeLeft <= 10 && state.timeLeft > 0 && state.settings.sfxVolume > 0) {
    Tone.Transport.start();
    state.tensionLoop.start(0);
  }
  
  if (state.gameMode !== 'endless' && state.timeLeft <= 0) {
    if (!itemEffects.handleSecondChanceIfReady()) {
      gameOver();
    }
  }
}

function gameOver() {
  clearInterval(state.timerInterval);
  ui.submitBtn.disabled = true;
  ui.answerEl.disabled = true;
  ui.setGabrielState('idle'); 
  ui.toggleOverdriveVisuals(false);

  audio.stopAllMusic(state.tensionLoop); 

  const currentHighScore = state.getHighScore();
  const sparksEarned = shop.calculateSparks(state.score);
  state.addSparks(sparksEarned);

  if (state.score > currentHighScore) {
    state.setHighScore(state.score);
    ui.newHighScoreEl.textContent = state.score;
    ui.showScreen("high-score-screen");
    audio.playNewHighScoreSFX(); 
    
    if (state.settings.musicVolume > 0) {
       if (state.gameMode === 'sprint') audio.highScoreMusicSprint.start();
       else if (state.gameMode === 'survival') audio.highScoreMusicSurvival.start();
       else audio.highScoreMusicEndless.start();
    }
    
    if (window.confetti) confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  } else {
    ui.finalScoreEl.textContent = state.score;
    ui.displayScoreBreakdown(state.problemsAnswered, state.correctAnswers); 
    
    const heading = document.getElementById("game-over-heading");
    if (heading) {
        if (state.gameMode === 'endless') heading.textContent = "Out of Lives!";
        else heading.textContent = "Time's Up!";
    }

    ui.showScreen("game-over-screen");
    
    if (state.gameMode === 'survival') audio.gameOverMusicSurvival.start();
    else audio.playGameOverSFX(); 
    
    if (state.settings.musicVolume > 0 && state.gameMode !== 'survival') {
      audio.gameOverMusicPlayer.start(); 
    }
  }

  // Feedback popup logic - show after 1-2 second delay
  setTimeout(() => {
    checkAndShowFeedbackPopup();
  }, 1500);
}

function checkAndShowFeedbackPopup() {
  // Check if feedback prompts are enabled
  const feedbackPromptsEnabled = localStorage.getItem('mathSprintFeedbackPromptsEnabled') !== 'false';
  
  // Check if user has dismissed with "Don't Ask Again"
  const feedbackDismissed = localStorage.getItem('mathSprintFeedbackPromptDismissed') === 'true';
  
  if (!feedbackPromptsEnabled || feedbackDismissed) {
    return;
  }

  // Get or initialize games completed counter
  const gamesCompleted = parseInt(localStorage.getItem('mathSprintGamesCompleted') || '0') + 1;
  localStorage.setItem('mathSprintGamesCompleted', gamesCompleted.toString());

  // Get last feedback prompt timestamp
  const lastPromptTime = parseInt(localStorage.getItem('mathSprintLastFeedbackPrompt') || '0');
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  // Show popup every 5 games AND more than 10 minutes since last prompt
  if (gamesCompleted % 5 === 0 && (now - lastPromptTime) > tenMinutes) {
    localStorage.setItem('mathSprintLastFeedbackPrompt', now.toString());
    ui.showScreen('feedback-popup', true);
  }
}

function generateProblem(feedbackPrefix = "") {
  let availableOps = [];
  const forcedOps = itemEffects.getForcedOps();
  const disabledOps = itemEffects.getDisabledOps();
  
  if (forcedOps && forcedOps.length > 0) {
    availableOps = [...forcedOps];
  } else {
  if (state.gameMode === 'survival') {
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
  
  const op = availableOps[Math.floor(Math.random() * availableOps.length)];
  let a, b, answer, problemString;
  let maxNum = 12;

  if (state.gameMode === 'endless' || state.gameMode === 'survival') {
      if (state.score < 40) maxNum = 10;
      else if (state.score < 100) maxNum = 20;
      else maxNum = 100;  // Increased from 50 to 100 for higher difficulty
  }

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      answer = a + b;
      problemString = `${a} + ${b} = ?`;
      break;
    case "-":
      a = Math.floor(Math.random() * maxNum) + 2; 
      b = Math.floor(Math.random() * a) + 1; 
      answer = a - b;
      problemString = `${a} - ${b} = ?`;
      break;
    case "×":
      // Increase multiplication cap from 12 to 15 at high scores for more challenge
      let multMax;
      if (maxNum >= 100) {
        multMax = 15;  // At highest difficulty, allow up to 15×15=225
      } else if (maxNum >= 20) {
        multMax = 12;  // At mid difficulty, keep 12×12=144
      } else {
        multMax = Math.min(maxNum, 12);  // At low difficulty, cap at maxNum or 12
      }
      a = Math.floor(Math.random() * multMax) + 1;
      b = Math.floor(Math.random() * multMax) + 1;
      answer = a * b;
      problemString = `${a} × ${b} = ?`;
      break;
    case "÷":
      const divMax = (maxNum > 12) ? 12 : maxNum;
      b = Math.floor(Math.random() * divMax) + 2; 
      answer = Math.floor(Math.random() * divMax) + 2; 
      a = b * answer; 
      problemString = `${a} ÷ ${b} = ?`;
      break;
  }

  state.setCurrentAnswer(answer);
  state.setCurrentProblemString(problemString);
  
  // Anti-cheat: Store hashed answer, not plaintext
  window.currentAnswerHash = hashAnswer(answer);
  
  ui.updateProblemDisplay(feedbackPrefix + problemString);
  ui.answerEl.value = "";
  ui.answerEl.focus();
}

function updateScore(points) {
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

export function handleAnswerSubmit() {
  const userAnswerStr = ui.answerEl.value.trim();
  if (userAnswerStr === '') return; 
  const userAnswer = parseInt(userAnswerStr);
  state.setProblemsAnswered(state.problemsAnswered + 1);

  // Anti-cheat: Check submission timing
  const now = performance.now();
  const timeSinceLastSubmission = now - window.lastSubmissionTime;
  window.lastSubmissionTime = now;
  
  // Allow submissions as fast as 100ms (increased from 200ms for faster players)
  if (timeSinceLastSubmission < 100) {
    state.invalidateSession("Submission too fast (< 100ms) - impossible to solve in that time");
    return;
  }

  // Anti-cheat: Check theoretical max score
  const elapsedMs = now - window.gameStartTime;
  const elapsedSeconds = elapsedMs / 1000;
  const theoreticalMaxScore = elapsedSeconds * 15; // 15 points per second max
  const allowedScore = theoreticalMaxScore * 2.0; // 100% buffer for streaks (was 50%)
  
  if (state.score > allowedScore) {
    state.invalidateSession(`Score impossible (${state.score} > theoretical max ${Math.floor(allowedScore)})`);
    return;
  }

  // Anti-cheat: Check average time per problem
  const avgTimePerProblem = elapsedMs / state.problemsAnswered;
  // Reduced from 400ms to 250ms to allow faster players (was too restrictive)
  if (avgTimePerProblem < 250) {
    state.invalidateSession(`Average solve time too fast (${Math.floor(avgTimePerProblem)}ms < 250ms minimum)`);
    return;
  }

  // Anti-cheat: Validate answer is in reasonable range based on operation
  const problemStr = state.currentProblemString.toLowerCase();
  let isValidRange = false;
  if (problemStr.includes("+") || problemStr.includes("-")) {
    // Addition/subtraction can reach up to 200 (100+100) at high difficulty
    isValidRange = userAnswer >= -100 && userAnswer <= 200;
  } else if (problemStr.includes("×")) {
    // Multiplication at high difficulty: 15×15 = 225, with margin allow up to 250
    isValidRange = userAnswer >= 1 && userAnswer <= 250;
  } else if (problemStr.includes("÷")) {
    // Division: divisor up to 12, quotient up to 12, so max around 12
    isValidRange = userAnswer >= 1 && userAnswer <= 20;
  }
  
  if (!isValidRange && state.gameMode !== 'undefined') {
    state.invalidateSession(`Invalid answer range: ${userAnswer} is impossible for this problem`);
    return;
  }

  if (userAnswer === state.currentAnswer) {
    state.setStreak(state.streak + 1);
    state.setCorrectAnswers(state.correctAnswers + 1);
    state.setConsecutiveMistakes(0); // Reset consecutive mistakes on correct answer
    ui.updateConsecutiveMistakesDisplay(0); // Hide the display
    
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

  } else {
    state.setStreak(0);
    state.setOverdriveActive(false);
    state.setOverdriveTimer(0);
    ui.toggleOverdriveVisuals(false);
    audio.playIncorrectTone();
    
    // Track consecutive mistakes
    state.setConsecutiveMistakes(state.consecutiveMistakes + 1);
    ui.updateConsecutiveMistakesDisplay(state.consecutiveMistakes);
    
    // Trigger red flash warning at 2 consecutive mistakes
    if (state.consecutiveMistakes === 2) {
      ui.triggerRedFlash();
    }

    if (itemEffects.shouldBlockPenalty()) {
        ui.updateFeedbackDisplay("🛡️ Shield blocked it", "blue");
        generateProblem("Shield active. ");
        return;
    }
    
    if (state.gameMode === 'survival') {
        // Add 10 second penalty for 3 consecutive mistakes in Sprint mode
        if (state.consecutiveMistakes >= 3) {
            state.setTimeLeft(state.timeLeft - 10);
            ui.updateTimerDisplay(state.timeLeft);
            state.setConsecutiveMistakes(0); // Reset mistake counter after penalty
            ui.updateConsecutiveMistakesDisplay(0); // Hide the display
            ui.updateFeedbackDisplay("⏱️ 10s penalty for 3 mistakes!", "orange");
        } else {
            state.setTimeLeft(state.timeLeft - 10);
            ui.updateTimerDisplay(state.timeLeft);
        }
        if (state.timeLeft <= 0) {
            gameOver();
            return;
        }
    }
    
    if (state.gameMode === 'endless') {
        // Lose 1 life for every 3 consecutive mistakes in Endless mode
        if (state.consecutiveMistakes >= 3) {
            state.setLives(state.lives - 1);
            ui.updateLivesDisplay(state.lives);
            audio.playGabrielSassy();
            state.setConsecutiveMistakes(0); // Reset mistake counter after penalty
            ui.updateConsecutiveMistakesDisplay(0); // Hide the display
            ui.updateFeedbackDisplay("💔 Lost a life! (3 consecutive mistakes)", "orange");
            if (state.lives <= 0) {
                gameOver();
                return;
            }
        }
    }
    
    // For Sprint mode (not survival), also apply the time penalty separately
    if (state.gameMode === 'sprint') {
        if (state.consecutiveMistakes >= 3) {
            state.setTimeLeft(state.timeLeft - 10);
            ui.updateTimerDisplay(state.timeLeft);
            state.setConsecutiveMistakes(0); // Reset mistake counter after penalty
            ui.updateConsecutiveMistakesDisplay(0); // Hide the display
            ui.updateFeedbackDisplay("⏱️ 10s penalty for 3 mistakes!", "orange");
            if (state.timeLeft <= 0) {
                gameOver();
                return;
            }
        }
    }
    
    ui.updateFeedbackDisplay("❌ Incorrect!", "red");
    ui.updateProblemDisplay("Incorrect! " + state.currentProblemString);
    ui.answerEl.value = "";
    ui.answerEl.focus();
  }
}

function handleQuickUse(itemId) {
  const result = itemEffects.activateItem(itemId);
  const count = inventory.getItemCount(itemId);
  ui.updateQuickUseCount(itemId, count);
  if (!result.success) {
    audio.playUIErrorSound();
    ui.updateFeedbackDisplay(result.message, "red");
  }
}