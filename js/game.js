import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';

// --- Navigation & Cleanup ---

export function goToMainMenu() {
  audio.stopAllMusic(state.tensionLoop);
  
  // Stop the cat animation
  ui.setGabrielState('idle');

  // Reset Game Over title to default if it was changed
  const gameOverHeading = document.getElementById("game-over-heading");
  if (gameOverHeading) {
    gameOverHeading.textContent = "Time's Up!";
  }

  ui.showScreen("main-menu");
}

// --- Game Initialization ---

export function startGame(mode = 'sprint') {
  audio.stopAllMusic(state.tensionLoop);
  
  // 1. Reset Global State
  state.setGameMode(mode);
  state.setScore(0);
  state.setStreak(0);
  state.setProblemsAnswered(0);
  state.setCorrectAnswers(0);
  
  // 2. Configure UI based on Mode
  ui.configureGameUI(mode);
  
  // 3. Mode Specific Setup
  if (mode === 'sprint') {
    state.setTimeLeft(state.GAME_DURATION);
    ui.updateTimerDisplay(state.GAME_DURATION);
  } else {
    // Endless Mode Setup
    state.setLives(state.STARTING_LIVES);
    ui.updateLivesDisplay(state.STARTING_LIVES);
  }

  // 4. UI Reset
  ui.updateScoreDisplay(0);
  ui.updateFeedbackDisplay("", "green");
  ui.submitBtn.disabled = false;
  ui.answerEl.disabled = false;
  ui.answerEl.value = "";
  
  // 5. Wake up Gabriel
  ui.setGabrielState('running');

  // 6. Switch to Game Screen Immediately
  ui.showScreen("game-screen");

  // 7. Handle Countdown Logic
  if (state.settings.disableCountdown) {
    ui.countdownOverlay.classList.add("hidden");
    ui.countdownOverlay.setAttribute("aria-hidden", "true");
    ui.countdownOverlay.inert = true;
    startRound(); 
  } else {
    startCountdown(); 
  }
}

function startCountdown() {
  ui.countdownOverlay.classList.remove("hidden");
  ui.countdownOverlay.setAttribute("aria-hidden", "false"); 
  ui.countdownOverlay.inert = false;
  
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
      ui.countdownText.textContent = "SPRINT!";
      audio.playCountdownGoBeep();
      
      setTimeout(() => {
        ui.countdownOverlay.classList.add("hidden");
        ui.countdownOverlay.setAttribute("aria-hidden", "true");
        ui.countdownOverlay.inert = true;
        startRound();
      }, 500); 
    }
  }, 1000);
}

function startRound() {
  if (state.settings.musicVolume > 0) {
    if (state.gameMode === 'sprint') {
        audio.backgroundMusicSprint.start();
    } else {
        audio.backgroundMusicEndless.start();
    }
  }
  
  ui.answerEl.focus(); 
  generateProblem();
  
  if (state.gameMode === 'sprint') {
      state.setTimerInterval(setInterval(gameTick, 1000));
  }
}

// --- Game Logic Loop ---

function gameTick() {
  state.setTimeLeft(state.timeLeft - 1);
  ui.updateTimerDisplay(state.timeLeft);

  if (state.timeLeft === 10 && state.settings.sfxVolume > 0) {
    Tone.Transport.start();
    state.tensionLoop.start(0);
  }
  
  if (state.timeLeft <= 0) {
    gameOver();
  }
}

function gameOver() {
  clearInterval(state.timerInterval);
  ui.submitBtn.disabled = true;
  ui.answerEl.disabled = true;
  ui.setGabrielState('idle'); 

  audio.stopAllMusic(state.tensionLoop); 

  const currentHighScore = state.getHighScore();

  if (state.score > currentHighScore) {
    state.setHighScore(state.score);
    ui.newHighScoreEl.textContent = state.score;
    ui.showScreen("high-score-screen");
    audio.playNewHighScoreSFX(); 
    
    if (state.settings.musicVolume > 0) {
       if (state.gameMode === 'sprint') audio.highScoreMusicSprint.start(); 
       else audio.highScoreMusicEndless.start();
    }
    
    if (window.confetti) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
  } else {
    ui.finalScoreEl.textContent = state.score;
    ui.displayScoreBreakdown(state.problemsAnswered, state.correctAnswers); 
    
    const heading = document.getElementById("game-over-heading");
    if (state.gameMode === 'endless') {
        heading.textContent = "Out of Lives!";
    } else {
        heading.textContent = "Time's Up!";
    }

    ui.showScreen("game-over-screen");
    audio.playGameOverSFX(); 
    if (state.settings.musicVolume > 0) {
      audio.gameOverMusicPlayer.start(); 
    }
  }
}

// --- Math Logic ---

function generateProblem(feedbackPrefix = "") {
  const availableOps = [];
  if (state.settings.operations.addition) availableOps.push("+");
  if (state.settings.operations.subtraction) availableOps.push("-");
  if (state.settings.operations.multiplication) availableOps.push("×");
  if (state.settings.operations.division) availableOps.push("÷");
  
  if (availableOps.length === 0) {
    ui.updateProblemDisplay("Select an operation in settings!");
    ui.submitBtn.disabled = true;
    return;
  }
  
  const op = availableOps[Math.floor(Math.random() * availableOps.length)];
  let a, b, answer, problemString;

  // --- DIFFICULTY SETTINGS ---
  let maxNum = 12; // Default Sprint Mode Cap

  // Endless Mode Scaling
  if (state.gameMode === 'endless') {
      if (state.score < 40) maxNum = 10;
      else if (state.score < 100) maxNum = 20;
      else maxNum = 50;
  }

  // --- GENERATION ---
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
      const multMax = (maxNum > 12) ? 12 : maxNum; 
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
  ui.updateProblemDisplay(feedbackPrefix + problemString);
  ui.answerEl.value = "";
  ui.answerEl.focus();
}

function updateScore(points) {
  const oldScore = state.score;
  const newScore = state.score + points;
  
  if(points > 0) state.setScore(newScore);
  ui.updateScoreDisplay(state.score);

  // --- 1UP MECHANIC (Endless Only) ---
  // Every 100 points, get a life back
  if (state.gameMode === 'endless') {
      if (Math.floor(newScore / 100) > Math.floor(oldScore / 100)) {
          state.setLives(state.lives + 1);
          ui.updateLivesDisplay(state.lives);
          // We rely on the "Ding" for now, but the visual counter updates
      }
  }
  
  // Update Gabriel's speed
  if (state.score > 100) ui.setGabrielState('fast');
  else ui.setGabrielState('running');
}

export function handleAnswerSubmit() {
  const userAnswerStr = ui.answerEl.value.trim();
  if (userAnswerStr === '') return; 

  const userAnswer = parseInt(userAnswerStr);
  state.setProblemsAnswered(state.problemsAnswered + 1);

  if (userAnswer === state.currentAnswer) {
    // --- CORRECT ---
    state.setStreak(state.streak + 1);
    state.setCorrectAnswers(state.correctAnswers + 1);
    ui.updateFeedbackDisplay("✅ Correct!", "green");

    if (state.streak > 0 && state.streak % 3 === 0) {
      updateScore(15);
      audio.playStreakTone();
      audio.playGabrielHappy(); 
      ui.glowScore();
    } else {
      updateScore(10);
      audio.playCorrectTone();
    }
    
    // Check if we got a 1UP to change feedback? 
    // For now, keep it simple so screen reader isn't overwhelmed.
    generateProblem("Correct! ");

  } else {
    // --- INCORRECT ---
    state.setStreak(0);
    audio.playIncorrectTone();
    
    if (state.gameMode === 'endless') {
        state.setLives(state.lives - 1);
        ui.updateLivesDisplay(state.lives);
        audio.playGabrielSassy(); 
        
        // --- ACCESSIBILITY FIX ---
        // Explicitly state how many lives are left
        if (state.lives > 0) {
            ui.updateFeedbackDisplay(`❌ Incorrect! ${state.lives} Lives left.`, "red");
        } else {
            ui.updateFeedbackDisplay("❌ Incorrect! Out of Lives.", "red");
            gameOver();
            return;
        }
    } else {
        ui.updateFeedbackDisplay("❌ Incorrect!", "red");
    }
    
    ui.updateProblemDisplay("Incorrect! " + state.currentProblemString);
    ui.answerEl.value = "";
    ui.answerEl.focus();
  }
}