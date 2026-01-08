/**
 * Game Flow Module
 * Handles game initialization, countdown, main game loop, and game over logic
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as itemEffects from './item-effects.js';
import * as inventory from './inventory.js';
import * as shop from './shop.js';
import { generateProblem, updateScore } from './game-problems.js';
import { checkAndUnlockAchievement } from './game-achievements.js';
import { displayNextAchievementPopup } from './game-achievements.js';
import { handleQuickUse } from './game-items.js';
import { getQuickUseList } from './item-effects.js';

/**
 * Start a new game with specified mode
 */
export function startGame(mode = 'sprint') {
  audio.stopAllMusic(state.tensionLoop);
  ui.toggleOverdriveVisuals(false);
  itemEffects.resetEffects();
  
  state.setGameMode(mode);
  
  // Handle tutorial mode - set easier difficulty
  if (mode === 'sprint' && typeof window.tutorialModule !== 'undefined' && window.tutorialModule.isActive()) {
    state.settings.maxNum = 10;
    state.settings.allowAddition = true;
    state.settings.allowSubtraction = false;
    state.settings.allowMultiplication = false;
    state.settings.allowDivision = false;
  }
  
  // Handle daily challenge mode
  if (mode === 'daily-challenge') {
    if (typeof window.dailyChallengeModule !== 'undefined') {
      window.dailyChallengeModule.start();
      mode = 'sprint';
    }
  }

  // Reset game state
  state.setScore(0);
  state.setStreak(0);
  state.setConsecutiveMistakes(0);
  state.setOverdriveActive(false);
  state.setOverdriveTimer(0);
  state.setProblemsAnswered(0);
  state.setCorrectAnswers(0);
  
  // Anti-cheat: Track timing data
  window.gameStartTime = performance.now();
  window.lastSubmissionTime = performance.now();
  
  ui.configureGameUI(mode);
  ui.updateConsecutiveMistakesDisplay(0);
  
  // Initialize timers/lives based on mode
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

  // Daily Challenge: longer timer than sprint for a fuller run
  if (state.gameMode === 'daily-challenge') {
    const DAILY_TIME = 90;
    state.setTimeLeft(DAILY_TIME);
    ui.updateTimerDisplay(DAILY_TIME);
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

/**
 * Display countdown before game starts
 */
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

/**
 * Start the game round with music and first problem
 */
function startRound() {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }
  
  if (state.settings.musicVolume > 0) {
    if (state.gameMode === 'daily-challenge' && audio.backgroundMusicDailyChallenge?.loaded) {
      audio.backgroundMusicDailyChallenge.start();
    } else if (state.gameMode === 'sprint' && audio.backgroundMusicSprint?.loaded) {
      audio.backgroundMusicSprint.start();
    } else if (state.gameMode === 'survival' && audio.backgroundMusicSurvival?.loaded) {
      audio.backgroundMusicSurvival.start();
    } else if (state.gameMode === 'endless' && audio.backgroundMusicEndless?.loaded) {
      audio.backgroundMusicEndless.start();
    }
  }
  
  ui.answerEl.focus(); 
  generateProblem();
  
  if (state.gameMode !== 'endless') {
    state.setTimerInterval(setInterval(gameTick, 1000));
  }
}

/**
 * Main game loop - runs every second
 */
function gameTick() {
  itemEffects.handleTick();
  const timeDelta = itemEffects.getTimeDelta();
  
  if (state.gameMode !== 'endless') {
    state.setTimeLeft(state.timeLeft - timeDelta);
    ui.updateTimerDisplay(Math.ceil(state.timeLeft));
  }

  // Overdrive decay
  if (state.overdriveActive) {
    state.setOverdriveTimer(state.overdriveTimer - 1);
    if (state.overdriveTimer <= 0) {
      state.setOverdriveActive(false);
      ui.toggleOverdriveVisuals(false);
      ui.updateFeedbackDisplay("Overdrive Depleted", "orange");
    }
  }

  // Tension loop alert (final 10 seconds)
  if (state.gameMode !== 'endless' && state.timeLeft <= 10 && state.timeLeft > 0 && state.settings.sfxVolume > 0) {
    Tone.Transport.start();
    state.tensionLoop.start(0);
  }
  
  // Check for game over
  if (state.gameMode !== 'endless' && state.timeLeft <= 0) {
    if (!itemEffects.handleSecondChanceIfReady()) {
      gameOver();
    }
  }
}

/**
 * End the game and display results
 */
export function gameOver() {
  clearInterval(state.timerInterval);
  ui.submitBtn.disabled = true;
  ui.answerEl.disabled = true;
  ui.setGabrielState('idle'); 
  ui.toggleOverdriveVisuals(false);

  audio.stopAllMusic(state.tensionLoop);

  // Check for quick game-over achievement (finished < 30 seconds)
  const gameSessionTime = (performance.now() - window.gameStartTime) / 1000;
  if (gameSessionTime < 30) {
    checkAndUnlockAchievement('quickGameOver');
  }

  // Check for perfect timing achievement (Sprint mode with exactly 0 seconds)
  if (state.gameMode === 'sprint' && state.timeLeft === 0) {
    checkAndUnlockAchievement('perfectTiming');
  }

  // Check for night owl achievement (played between 2am-4am)
  const currentHour = new Date().getHours();
  if (currentHour >= 2 && currentHour < 4) {
    checkAndUnlockAchievement('nightOwl');
  }

  // Check for comeback kid achievement (endless mode)
  if (state.gameMode === 'endless' && window.hadOneLiveLeft && state.lives === 3) {
    checkAndUnlockAchievement('comebackKid');
  }

  // Check for first-game-over achievements per mode
  if (state.gameMode !== 'daily-challenge') {
    const firstGameOverAchievementId = `firstGameOver${state.gameMode.charAt(0).toUpperCase() + state.gameMode.slice(1)}`;
    checkAndUnlockAchievement(firstGameOverAchievementId);
  }

  // Check for streak achievements
  if (state.streak >= 10) {
    checkAndUnlockAchievement('tenStreak');
  }
  if (state.streak >= 20) {
    checkAndUnlockAchievement('twentyStreak');
  }

  // Calculate and award sparks
  const currentHighScore = state.getHighScore();
  const sparksEarned = shop.calculateSparks(state.score);
  state.addSparks(sparksEarned);

  // Save daily challenge personal best and check achievements
  if (state.gameMode === 'daily-challenge' && typeof window.dailyChallengeModule !== 'undefined') {
    const isNewBest = window.dailyChallengeModule.savePersonalBest(state.score);
    
    // Track daily challenge completion
    const completedToday = localStorage.getItem('mathSprintDailyChallengeToday');
    const today = new Date().toDateString();
    if (completedToday !== today) {
      localStorage.setItem('mathSprintDailyChallengeToday', today);
      
      // First daily challenge achievement
      const totalDailyCompletions = parseInt(localStorage.getItem('mathSprintDailyChallengeCount') || '0') + 1;
      localStorage.setItem('mathSprintDailyChallengeCount', totalDailyCompletions.toString());
      if (totalDailyCompletions === 1) {
        checkAndUnlockAchievement('firstDailyChallenge');
      }
      
      // Track streak
      const lastCompleted = localStorage.getItem('mathSprintDailyChallengeLastDate');
      let streak = parseInt(localStorage.getItem('mathSprintDailyChallengeStreak') || '0');
      
      if (lastCompleted) {
        const lastDate = new Date(lastCompleted);
        const todayDate = new Date(today);
        const dayDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          streak++;
        } else if (dayDiff > 1) {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      
      localStorage.setItem('mathSprintDailyChallengeStreak', streak.toString());
      localStorage.setItem('mathSprintDailyChallengeLastDate', today);
      
      // Check streak achievements
      if (streak >= 7) {
        checkAndUnlockAchievement('dailyChallenge7Day');
      }
      if (streak >= 30) {
        checkAndUnlockAchievement('dailyChallenge30Day');
      }
    }
    
    // Check personal best achievement
    if (isNewBest) {
      checkAndUnlockAchievement('dailyChallengePersonalBest');
    }
    
    // Check high score achievement
    if (state.score >= 150) {
      checkAndUnlockAchievement('dailyChallengeHighScore');
    }
  }

  // Handle high score
  if (state.score > currentHighScore) {
    state.setHighScore(state.score);
    
    // Check high score achievement thresholds
    if (state.gameMode === 'sprint' && state.score >= 100) {
      checkAndUnlockAchievement('highScoreSprint');
    }
    if (state.gameMode === 'endless' && state.score >= 150) {
      checkAndUnlockAchievement('highScoreEndless');
    }
    if (state.gameMode === 'survival' && state.score >= 200) {
      checkAndUnlockAchievement('highScoreSurvival');
    }

    ui.newHighScoreEl.textContent = state.score;
    
    // Display player name on high score screen
    state.loadSettings();
    const playerNameEl = document.getElementById("high-score-player-name");
    if (playerNameEl && state.settings.playerName) {
      playerNameEl.textContent = `Congratulations, ${state.settings.playerName}!`;
    }
    
    ui.showScreen("high-score-screen");
    audio.playNewHighScoreSFX(); 
    
    if (state.settings.musicVolume > 0) {
      if (state.gameMode === 'sprint') audio.highScoreMusicSprint.start();
      else if (state.gameMode === 'survival') audio.highScoreMusicSurvival.start();
      else if (state.gameMode === 'daily-challenge') audio.highScoreMusicDailyChallenge.start();
      else audio.highScoreMusicEndless.start();
    }
    
    if (window.confetti) confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  } else {
    ui.finalScoreEl.textContent = state.score;
    ui.displayScoreBreakdown(state.problemsAnswered, state.correctAnswers); 
    
    const heading = document.getElementById("game-over-heading");
    if (heading) {
      heading.textContent = state.gameMode === 'endless' ? "Out of Lives!" : "Time's Up!";
    }

    // Display player name on game over screen
    state.loadSettings();
    const playerNameEl = document.getElementById("game-over-player-name");
    if (playerNameEl && state.settings.playerName) {
      playerNameEl.textContent = `Great game, ${state.settings.playerName}!`;
    }

    ui.showScreen("game-over-screen");
    audio.playGameOverSFX();
    
    if (state.settings.musicVolume > 0) {
      if (state.gameMode === 'sprint') audio.gameOverMusicSprint.start();
      else if (state.gameMode === 'endless') audio.gameOverMusicEndless.start();
      else if (state.gameMode === 'survival') audio.gameOverMusicSurvival.start();
    }
  }

  // Hide play again button for daily challenge mode
  if (state.gameMode === 'daily-challenge') {
    const playAgainBtn = document.getElementById('play-again-btn');
    const playAgainHighScoreBtn = document.getElementById('play-again-high-score-btn');
    if (playAgainBtn) playAgainBtn.style.display = 'none';
    if (playAgainHighScoreBtn) playAgainHighScoreBtn.style.display = 'none';
  } else {
    // Show play again button for other modes
    const playAgainBtn = document.getElementById('play-again-btn');
    const playAgainHighScoreBtn = document.getElementById('play-again-high-score-btn');
    if (playAgainBtn) playAgainBtn.style.display = '';
    if (playAgainHighScoreBtn) playAgainHighScoreBtn.style.display = '';
  }

  // Show achievement button if any pending
  const { pendingAchievements } = window;
  if (pendingAchievements && pendingAchievements.length > 0) {
    const achievementBtn = document.getElementById('view-achievements-game-over-btn') || document.getElementById('view-achievements-high-score-btn');
    if (achievementBtn) {
      achievementBtn.classList.remove('hidden');
      achievementBtn.textContent = `🏆 View ${pendingAchievements.length} Achievement${pendingAchievements.length > 1 ? 's' : ''}`;
    }
  }

  // Feedback popup logic
  setTimeout(() => {
    checkAndShowFeedbackPopup();
  }, 1500);
}

/**
 * Check if should show feedback prompt
 */
function checkAndShowFeedbackPopup() {
  // Testing flag: force feedback popup after every game
  const forceFeedback = window.FORCE_FEEDBACK_POPUP === true || localStorage.getItem('mathSprintForceFeedback') === 'true';
  
  if (forceFeedback) {
    ui.showScreen('feedback-popup', true);
    return;
  }

  const feedbackPromptsEnabled = localStorage.getItem('mathSprintFeedbackPromptsEnabled') !== 'false';
  const feedbackDismissed = localStorage.getItem('mathSprintFeedbackPromptDismissed') === 'true';
  
  if (!feedbackPromptsEnabled || feedbackDismissed) {
    return;
  }

  const gamesCompleted = parseInt(localStorage.getItem('mathSprintGamesCompleted') || '0') + 1;
  localStorage.setItem('mathSprintGamesCompleted', gamesCompleted.toString());

  const lastPromptTime = parseInt(localStorage.getItem('mathSprintLastFeedbackPrompt') || '0');
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  if (gamesCompleted % 5 === 0 && (now - lastPromptTime) > tenMinutes) {
    localStorage.setItem('mathSprintLastFeedbackPrompt', now.toString());
    ui.showScreen('feedback-popup', true);
  }
}

/**
 * Return to main menu from game
 */
export function goToMainMenu() {
  audio.stopAllMusic(state.tensionLoop);
  ui.setGabrielState('idle');
  ui.toggleOverdriveVisuals(false);

  if (state.sessionSparks > 0) {
    ui.cashOutSparks.textContent = `+${state.sessionSparks} SPARKS`;
    ui.showScreen("cash-out-popup", true);
    audio.playCashOutSFX();
    state.clearSessionSparks();
  } else {
    if (typeof window.updateWelcomeMessage === 'function') {
      window.updateWelcomeMessage();
    }
    ui.showScreen("main-menu");
    audio.playMainMenuMusic();
  }
}
