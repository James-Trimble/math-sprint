import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import * as shop from './shop.js'; 

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
  
  state.setGameMode(mode);
  state.setScore(0);
  state.setStreak(0);
  state.setOverdriveActive(false);
  state.setOverdriveTimer(0);
  state.setProblemsAnswered(0);
  state.setCorrectAnswers(0);
  
  ui.configureGameUI(mode);
  
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
  if (state.settings.musicVolume > 0) {
    if (state.gameMode === 'sprint') audio.backgroundMusicSprint.start();
    else if (state.gameMode === 'survival') audio.backgroundMusicSurvival.start();
    else audio.backgroundMusicEndless.start();
  }
  
  ui.answerEl.focus(); 
  generateProblem();
  
  if (state.gameMode !== 'endless') {
      state.setTimerInterval(setInterval(gameTick, 1000));
  }
}

// --- Loop ---

function gameTick() {
  state.setTimeLeft(state.timeLeft - 1);
  ui.updateTimerDisplay(state.timeLeft);

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
}

function generateProblem(feedbackPrefix = "") {
  let availableOps = [];
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
  
  if (availableOps.length === 0) availableOps.push("+");
  
  const op = availableOps[Math.floor(Math.random() * availableOps.length)];
  let a, b, answer, problemString;
  let maxNum = 12;

  if (state.gameMode === 'endless' || state.gameMode === 'survival') {
      if (state.score < 40) maxNum = 10;
      else if (state.score < 100) maxNum = 20;
      else maxNum = 50;
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
  const multiplier = state.overdriveActive ? 2 : 1;
  const finalPoints = points * multiplier;
  
  const oldScore = state.score;
  state.setScore(state.score + finalPoints);
  ui.updateScoreDisplay(state.score);

  if (state.gameMode === 'endless') {
      if (Math.floor(state.score / 100) > Math.floor(oldScore / 100)) {
          state.setLives(state.lives + 1);
          ui.updateLivesDisplay(state.lives);
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

  if (userAnswer === state.currentAnswer) {
    state.setStreak(state.streak + 1);
    state.setCorrectAnswers(state.correctAnswers + 1);
    
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
    
    if (state.gameMode === 'survival') {
        state.setTimeLeft(state.timeLeft - 10);
        ui.updateTimerDisplay(state.timeLeft);
        if (state.timeLeft <= 0) {
            gameOver();
            return;
        }
    }
    
    if (state.gameMode === 'endless') {
        state.setLives(state.lives - 1);
        ui.updateLivesDisplay(state.lives);
        audio.playGabrielSassy(); 
        if (state.lives <= 0) {
            gameOver();
            return;
        }
    }
    
    ui.updateFeedbackDisplay("❌ Incorrect!", "red");
    ui.updateProblemDisplay("Incorrect! " + state.currentProblemString);
    ui.answerEl.value = "";
    ui.answerEl.focus();
  }
}