/**
 * Audio Music Module
 * Handles all background music tracks
 */

import { settings, setTensionLoop } from './state.js';

// --- Audio Loading State ---
let audioLoadedCount = 0;
const MIN_LOAD_THRESHOLD = 10;
const AUDIO_LOAD_TIMEOUT = 10000; // 10 seconds (removed: timeout fallback)
let audioTimeoutTriggered = false;
let audioLoadError = false;
let audioLoadTimeoutId = null;
let audioFailedCount = 0;

export const onAudioLoaded = () => {
  audioLoadedCount++;
  console.log(`Audio loaded: ${audioLoadedCount}/${MIN_LOAD_THRESHOLD}`);
  if (audioLoadedCount >= MIN_LOAD_THRESHOLD) { 
    clearTimeout(audioLoadTimeoutId);
    audioTimeoutTriggered = false;
    const btn = document.getElementById("begin-btn");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Click to Begin";
      console.log("Button enabled by audio load");
    } else {
      console.error("beginBtn not found!");
    }
    hideAudioLoadingIndicator();
  }
};

export const onAudioError = () => {
  audioLoadError = true;
  audioFailedCount++;
  audioLoadedCount++;
  console.log(`Audio error: ${audioLoadedCount}/${MIN_LOAD_THRESHOLD}, Failed: ${audioFailedCount}`);
  if (audioLoadedCount >= MIN_LOAD_THRESHOLD) {
    clearTimeout(audioLoadTimeoutId);
    const btn = document.getElementById("begin-btn");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Click to Begin";
      console.log("Button enabled by audio threshold");
    } else {
      console.error("beginBtn not found!");
    }
    hideAudioLoadingIndicator();
  }
};

const enableButtonOnTimeout = () => {
  audioTimeoutTriggered = true;
  const btn = document.getElementById("begin-btn");
  if (btn) {
    btn.disabled = false;
    btn.textContent = "Click to Begin";
    console.log("Button enabled by timeout");
  } else {
    console.error("beginBtn not found in timeout!");
  }
  showAudioLoadingFallback();
};

export function startAudioLoadTimeout() {
  audioLoadTimeoutId = setTimeout(enableButtonOnTimeout, AUDIO_LOAD_TIMEOUT);
}

export function isAudioReady() {
  return audioLoadedCount >= MIN_LOAD_THRESHOLD;
}

export function isAudioTimeoutTriggered() {
  return audioTimeoutTriggered;
}

export function hasAudioErrors() {
  return audioFailedCount > 0;
}

function showAudioLoadingFallback() {
  const banner = document.getElementById('audio-loading-banner');
  if (banner) {
    banner.classList.remove('hidden');
    if (!localStorage.getItem('audioLoadingFallbackShown')) {
      localStorage.setItem('audioLoadingFallbackShown', 'true');
    }
  }
}

function hideAudioLoadingIndicator() {
  const spinner = document.getElementById('audio-loading-spinner');
  if (spinner) {
    spinner.classList.add('hidden');
  }
}

// --- Music Players ---
export const backgroundMusicMainMenu = new Tone.Player({
  url: "../music/mathsprintmainmenu.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicSprint = new Tone.Player({
  url: "../music/mathsprintsprintmode.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicEndless = new Tone.Player({
  url: "../music/mathsprintendlessmode.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicSurvival = new Tone.Player({
  url: "../music/mathsprintsurvivalmode.mp3", 
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const gameOverMusicSprint = new Tone.Player({
  url: "../music/mathsprintgameoversprint.mp3",
  loop: true,
  loopEnd: 44,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const gameOverMusicEndless = new Tone.Player({
  url: "../music/mathsprintgameoverendless.mp3",
  loop: true,
  loopEnd: 44,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const gameOverMusicSurvival = new Tone.Player({
  url: "../music/mathsprintgameoversurvival.mp3", 
  loop: false,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const highScoreMusicSprint = new Tone.Player({
  url: "../music/mathsprinthighscoresprint.mp3",
  loop: true,
  loopEnd: 48,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const highScoreMusicEndless = new Tone.Player({
  url: "../music/mathsprinthighscoreendless.mp3",
  loop: true,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const highScoreMusicSurvival = new Tone.Player({
  url: "../music/mathsprinthighscoresurvival.mp3", 
  loop: true,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const highScoreMusicDailyChallenge = new Tone.Player({
  url: "../music/mathsprintdailychallengehighscore.mp3", 
  loop: true,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicOnboarding = new Tone.Player({
  url: "../music/mathsprintonboarding.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicTutorial = new Tone.Player({
  url: "../music/mathsprinttutorial.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicShop = new Tone.Player({
  url: "../music/mathsprintshop.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicDailyChallenge = new Tone.Player({
  url: "../music/mathsprintdailychallenge.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

// --- Music Control Functions ---

export function playMainMenuMusic() {
    if (settings.musicVolume <= 0) return;
    if (backgroundMusicMainMenu.state === "started") return;

    if (backgroundMusicOnboarding.state === "started") {
        backgroundMusicOnboarding.stop();
    }

    if (backgroundMusicMainMenu.loaded) {
        backgroundMusicMainMenu.start();
    } else {
        setTimeout(() => {
             if (backgroundMusicMainMenu.loaded) backgroundMusicMainMenu.start();
        }, 1000);
    }
}

export function playOnboardingMusic() {
    if (settings.musicVolume <= 0) return;
    if (backgroundMusicOnboarding.state === "started") return;

    if (backgroundMusicMainMenu.state === "started") {
        backgroundMusicMainMenu.stop();
    }

    if (backgroundMusicOnboarding.loaded) {
        backgroundMusicOnboarding.start();
    } else {
        setTimeout(() => {
             if (backgroundMusicOnboarding.loaded) backgroundMusicOnboarding.start();
        }, 1000);
    }
}

/**
 * Fade out onboarding music before transitioning to main menu
 * Prevents overlap and provides smooth audio transition
 */
export function fadeOutOnboarding() {
  if (backgroundMusicOnboarding.state === "started") {
    // Fade out over 500ms
    const volToDb = (vol) => (vol == 0 ? -Infinity : (vol - 100) * 0.4);
    const targetVol = volToDb(0);
    backgroundMusicOnboarding.volume.rampTo(targetVol, 0.5);
    
    // Stop after fade completes
    setTimeout(() => {
      backgroundMusicOnboarding.stop();
    }, 500);
  }
}

export function playTutorialMusic() {
    if (settings.musicVolume <= 0) return;
    if (backgroundMusicTutorial.state === "started") return;

    if (backgroundMusicTutorial.loaded) {
        backgroundMusicTutorial.start();
    } else {
        setTimeout(() => {
             if (backgroundMusicTutorial.loaded) backgroundMusicTutorial.start();
        }, 1000);
    }
}

export function playShopMusic() {
    if (settings.musicVolume <= 0) return;
    if (backgroundMusicShop.state === "started") return;

    if (backgroundMusicShop.loaded) {
        backgroundMusicShop.start();
    } else {
        setTimeout(() => {
             if (backgroundMusicShop.loaded) backgroundMusicShop.start();
        }, 1000);
    }
}

export function playDailyChallengeMusic() {
    if (settings.musicVolume <= 0) return;
    if (backgroundMusicDailyChallenge.state === "started") return;

    if (backgroundMusicDailyChallenge.loaded) {
        backgroundMusicDailyChallenge.start();
    } else {
        setTimeout(() => {
             if (backgroundMusicDailyChallenge.loaded) backgroundMusicDailyChallenge.start();
        }, 1000);
    }
}

export function stopAllMusic(tensionLoop) {
  if(backgroundMusicMainMenu.state === "started") backgroundMusicMainMenu.stop();
  if(backgroundMusicSprint.state === "started") backgroundMusicSprint.stop();
  if(backgroundMusicEndless.state === "started") backgroundMusicEndless.stop();
  if(backgroundMusicSurvival.state === "started") backgroundMusicSurvival.stop();
  if(backgroundMusicOnboarding.state === "started") backgroundMusicOnboarding.stop();
  if(backgroundMusicTutorial.state === "started") backgroundMusicTutorial.stop();
  if(backgroundMusicShop.state === "started") backgroundMusicShop.stop();
  if(backgroundMusicDailyChallenge.state === "started") backgroundMusicDailyChallenge.stop();
  
  gameOverMusicSprint.stop();
  gameOverMusicEndless.stop();
  gameOverMusicSurvival.stop();
  highScoreMusicSprint.stop();
  highScoreMusicEndless.stop();
  highScoreMusicSurvival.stop();
  highScoreMusicDailyChallenge.stop();

  if (Tone.Transport.state === "started") {
    if (tensionLoop) tensionLoop.stop();
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }
}

export function applyVolumeSettings() {
  const volToDb = (vol) => (vol == 0 ? -Infinity : (vol - 100) * 0.4);
  Tone.Destination.volume.value = volToDb(settings.masterVolume);
  const musicDb = volToDb(settings.musicVolume);
  
  backgroundMusicMainMenu.volume.value = musicDb;
  backgroundMusicSprint.volume.value = musicDb;
  backgroundMusicEndless.volume.value = musicDb;
  backgroundMusicSurvival.volume.value = musicDb;
  backgroundMusicOnboarding.volume.value = musicDb;
  backgroundMusicTutorial.volume.value = musicDb;
  backgroundMusicShop.volume.value = musicDb;
  backgroundMusicDailyChallenge.volume.value = musicDb;
  gameOverMusicSprint.volume.value = musicDb;
  gameOverMusicEndless.volume.value = musicDb;
  gameOverMusicSurvival.volume.value = musicDb;
  highScoreMusicSprint.volume.value = musicDb;
  highScoreMusicEndless.volume.value = musicDb;
  highScoreMusicSurvival.volume.value = musicDb;
  highScoreMusicDailyChallenge.volume.value = musicDb;
}

// "Can Play" checks
export function canPlayMainMenuMusic() {
  return backgroundMusicMainMenu.loaded || audioTimeoutTriggered;
}

export function canPlaySprintMusic() {
  return backgroundMusicSprint.loaded || audioTimeoutTriggered;
}

export function canPlayEndlessMusic() {
  return backgroundMusicEndless.loaded || audioTimeoutTriggered;
}

export function canPlaySurvivalMusic() {
  return backgroundMusicSurvival.loaded || audioTimeoutTriggered;
}

export function canPlayGameOverSprintMusic() {
  return gameOverMusicSprint.loaded || audioTimeoutTriggered;
}

export function canPlayGameOverEndlessMusic() {
  return gameOverMusicEndless.loaded || audioTimeoutTriggered;
}

export function canPlayGameOverSurvivalMusic() {
  return gameOverMusicSurvival.loaded || audioTimeoutTriggered;
}

export function canPlayHighScoreSprintMusic() {
  return highScoreMusicSprint.loaded || audioTimeoutTriggered;
}

export function canPlayHighScoreEndlessMusic() {
  return highScoreMusicEndless.loaded || audioTimeoutTriggered;
}

export function canPlayHighScoreSurvivalMusic() {
  return highScoreMusicSurvival.loaded || audioTimeoutTriggered;
}

export function canPlayHighScoreDailyChallengeMusic() {
  return highScoreMusicDailyChallenge.loaded || audioTimeoutTriggered;
}

export function canPlayOnboardingMusic() {
  return backgroundMusicOnboarding.loaded || audioTimeoutTriggered;
}

export function canPlayTutorialMusic() {
  return backgroundMusicTutorial.loaded || audioTimeoutTriggered;
}

export function canPlayShopMusic() {
  return backgroundMusicShop.loaded || audioTimeoutTriggered;
}

export function canPlayDailyChallengeMusic() {
  return backgroundMusicDailyChallenge.loaded || audioTimeoutTriggered;
}

// Tension loop
export function initializeTensionLoop() {
    const countdownSynth = new Tone.Synth({ envelope: { attack: 0.01, release: 0.2 } }).toDestination();
    const loop = new Tone.Loop((time) => {
        countdownSynth.triggerAttackRelease("A4", "16n", time);
    }, "2n");
    setTensionLoop(loop);
}
