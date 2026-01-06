import { beginBtn } from './ui.js';
import { settings, setTensionLoop } from './state.js';

// --- Global Audio Nodes ---
const reverb = new Tone.Reverb(0.4).toDestination();

// --- Audio Loading State ---
let audioLoadedCount = 0;
const MIN_LOAD_THRESHOLD = 9;
const AUDIO_LOAD_TIMEOUT = 10000; // 10 seconds
let audioTimeoutTriggered = false;
let audioLoadError = false;
let audioLoadTimeoutId = null;

const onAudioLoaded = () => {
  audioLoadedCount++;
  if (beginBtn && audioLoadedCount >= MIN_LOAD_THRESHOLD) { 
    clearTimeout(audioLoadTimeoutId);
    audioTimeoutTriggered = false;
    beginBtn.disabled = false;
    beginBtn.textContent = "Click to Begin";
    hideAudioLoadingIndicator();
  }
};

const onAudioError = () => {
  audioLoadError = true;
  audioLoadedCount++;
  if (audioLoadedCount >= MIN_LOAD_THRESHOLD) {
    clearTimeout(audioLoadTimeoutId);
    if (beginBtn) {
      beginBtn.disabled = false;
      beginBtn.textContent = "Click to Begin";
    }
    hideAudioLoadingIndicator();
  }
};

const enableButtonOnTimeout = () => {
  audioTimeoutTriggered = true;
  if (beginBtn) {
    beginBtn.disabled = false;
    beginBtn.textContent = "Click to Begin";
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

function showAudioLoadingFallback() {
  const banner = document.getElementById('audio-loading-banner');
  if (banner) {
    banner.classList.remove('hidden');
    // Mark that we've shown this notification
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
  url: "./music/mathsprintmainmenu.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicSprint = new Tone.Player({
  url: "./music/mathsprintsprintmode.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicEndless = new Tone.Player({
  url: "./music/mathsprintendlessmode.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const backgroundMusicSurvival = new Tone.Player({
  url: "./music/mathsprintsurvivalmode.mp3", 
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const gameOverMusicPlayer = new Tone.Player({
  url: "./music/mathsprintgameover.mp3",
  loop: true,
  loopEnd: 44,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const gameOverMusicSurvival = new Tone.Player({
  url: "./music/mathsprintgameoversurvival.mp3", 
  loop: false,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const highScoreMusicSprint = new Tone.Player({
  url: "./music/mathsprinthighscoresprint.mp3",
  loop: true,
  loopEnd: 48,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const highScoreMusicEndless = new Tone.Player({
  url: "./music/mathsprinthighscoreendless.mp3",
  loop: true,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

export const highScoreMusicSurvival = new Tone.Player({
  url: "./music/mathsprinthighscoresurvival.mp3", 
  loop: true,
  onload: onAudioLoaded,
  onerror: onAudioError,
}).toDestination();

// --- SFX Synths ---
const synthEnvelope = { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.4 };
const gameSynth = new Tone.Synth({ envelope: synthEnvelope }).toDestination();
const streakSynth = new Tone.Synth({ envelope: synthEnvelope }).toDestination();
const uiClickSynth = new Tone.Synth({ oscillator: {type: 'sine'}, envelope: synthEnvelope }).toDestination();
const uiBackSynth = new Tone.Synth({ oscillator: {type: 'triangle'}, envelope: synthEnvelope }).toDestination();
const uiToggleOnSynth = new Tone.Synth({ oscillator: {type: 'square'}, envelope: { attack: 0.01, release: 0.05} }).toDestination();
const uiToggleOffSynth = new Tone.Synth({ oscillator: {type: 'square'}, envelope: { attack: 0.01, release: 0.05} }).toDestination();
const uiErrorSynth = new Tone.Synth({ oscillator: {type: 'sawtooth'}, envelope: synthEnvelope }).toDestination();
const countdownSynth = new Tone.Synth({ envelope: { attack: 0.01, release: 0.2 } }).toDestination();
const gameOverSFX = new Tone.Synth({ oscillator: { type: "sawtooth" }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.1, release: 0.5 } }).toDestination();
const newHighScoreSFX = new Tone.PolySynth(Tone.Synth, { envelope: synthEnvelope }).toDestination();
const cashOutSynth = new Tone.PolySynth(Tone.Synth, { envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 } }).toDestination();

const gabrielSynth = new Tone.DuoSynth({
    vibratoAmount: 0.5, vibratoRate: 5, harmonicity: 1.5,
    voice0: { oscillator: { type: "triangle" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } },
    voice1: { oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } }
}).connect(reverb);

const purchaseSuccessSynth = new Tone.PolySynth(Tone.Synth, {
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.8 }
}).toDestination();

const purchaseFailSynth = new Tone.Synth({
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 }
}).toDestination();

const itemActivationSynth = new Tone.PolySynth(Tone.Synth, {
  maxPolyphony: 8,
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 }
}).toDestination();

// --- AUDIO LOGOS ---

const logoSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth" }, 
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 }
}).connect(reverb);

// HOLIDAY LOGO (Updated Volume)
const holidaySynth = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 6, 
    voice: {
        harmonicity: 3.01,
        modulationIndex: 10,
        oscillator: { type: "sine" },
        modulation: { type: "square" },
        envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 1 },
        modulationEnvelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.5 }
    },
    volume: 0 // <--- MAX VOLUME (Was -6)
}).connect(reverb);


// --- Functions ---

export function playMainMenuMusic() {
    if (settings.musicVolume <= 0) return;
    if (backgroundMusicMainMenu.state === "started") return;

    if (backgroundMusicMainMenu.loaded) {
        backgroundMusicMainMenu.start();
    } else {
        setTimeout(() => {
             if (backgroundMusicMainMenu.loaded) backgroundMusicMainMenu.start();
        }, 1000);
    }
}

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

export function canPlayGameOverMusic() {
  return gameOverMusicPlayer.loaded || audioTimeoutTriggered;
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

export function playAudioLogo(isChristmas) {
  const now = Tone.now();
  if (isChristmas) {
      // JINGLE BELLS
      holidaySynth.triggerAttackRelease("E5", "8n", now);
      holidaySynth.triggerAttackRelease("E5", "8n", now + 0.2);
      holidaySynth.triggerAttackRelease("E5", "4n", now + 0.4);
      
      holidaySynth.triggerAttackRelease("E5", "8n", now + 0.8);
      holidaySynth.triggerAttackRelease("E5", "8n", now + 1.0);
      holidaySynth.triggerAttackRelease("E5", "4n", now + 1.2);
      
      holidaySynth.triggerAttackRelease("E5", "8n", now + 1.6);
      holidaySynth.triggerAttackRelease("G5", "8n", now + 1.8);
      holidaySynth.triggerAttackRelease("C5", "8n", now + 2.0);
      holidaySynth.triggerAttackRelease("D5", "8n", now + 2.2);
      holidaySynth.triggerAttackRelease("E5", "2n", now + 2.4);
      
      // Bass Note
      holidaySynth.triggerAttackRelease("C4", "1n", now + 1.6);
  } else {
      // STANDARD
      logoSynth.triggerAttackRelease("G4", "16n", now);       
      logoSynth.triggerAttackRelease("C5", "16n", now + 0.1); 
      logoSynth.triggerAttackRelease("E5", "16n", now + 0.2); 
      logoSynth.triggerAttackRelease(["G5", "B5", "D6", "G6"], "2n", now + 0.3);
  }
}

export function initializeTensionLoop() {
    const loop = new Tone.Loop((time) => {
        countdownSynth.triggerAttackRelease("A4", "16n", time);
    }, "2n");
    setTensionLoop(loop);
}

export function stopAllMusic(tensionLoop) {
  if(backgroundMusicMainMenu.state === "started") backgroundMusicMainMenu.stop();
  if(backgroundMusicSprint.state === "started") backgroundMusicSprint.stop();
  if(backgroundMusicEndless.state === "started") backgroundMusicEndless.stop();
  if(backgroundMusicSurvival.state === "started") backgroundMusicSurvival.stop();
  
  gameOverMusicPlayer.stop();
  gameOverMusicSurvival.stop();
  highScoreMusicSprint.stop();
  highScoreMusicEndless.stop();
  highScoreMusicSurvival.stop();

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
  gameOverMusicPlayer.volume.value = musicDb;
  gameOverMusicSurvival.volume.value = musicDb;
  highScoreMusicSprint.volume.value = musicDb;
  highScoreMusicEndless.volume.value = musicDb;
  highScoreMusicSurvival.volume.value = musicDb;
}

export function playCorrectTone() { if (settings.sfxVolume > 0) gameSynth.triggerAttackRelease("E5", "8n"); }
export function playIncorrectTone() { if (settings.sfxVolume > 0) gameSynth.triggerAttackRelease("C4", "8n"); }
export function playStreakTone() { if (settings.sfxVolume > 0) streakSynth.triggerAttackRelease("G5", "8n", "+0.1"); }
export function playCashOutSFX() { if (settings.sfxVolume > 0) cashOutSynth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "8n"); }
export function playGameOverSFX() { if (settings.sfxVolume > 0) gameOverSFX.triggerAttackRelease("A2", "1n"); }
export function playNewHighScoreSFX() { if (settings.sfxVolume > 0) newHighScoreSFX.triggerAttackRelease(["C4", "E4", "G4", "C5"], "1n"); }
export function playUIClickSound() { if (settings.sfxVolume > 0) uiClickSynth.triggerAttackRelease("C5", "32n"); }
export function playUIBackSound() { if (settings.sfxVolume > 0) uiBackSynth.triggerAttackRelease("A4", "32n"); }
export function playUIToggleOnSound() { if (settings.sfxVolume > 0) uiToggleOnSynth.triggerAttackRelease("C6", "64n"); }
export function playUIToggleOffSound() { if (settings.sfxVolume > 0) uiToggleOffSynth.triggerAttackRelease("G5", "64n"); }
export function playUIErrorSound() { if (settings.sfxVolume > 0) uiErrorSynth.triggerAttackRelease("G#2", "16n"); }
export function playCountdownBeep() { if (settings.sfxVolume > 0) countdownSynth.triggerAttackRelease("G4", "16n"); }
export function playCountdownGoBeep() { if (settings.sfxVolume > 0) countdownSynth.triggerAttackRelease("C5", "8n"); }
export function playGabrielHappy() { if (settings.sfxVolume > 0) gabrielSynth.triggerAttackRelease("C6", "16n"); }
export function playGabrielSassy() { if (settings.sfxVolume > 0) gabrielSynth.triggerAttackRelease("G3", "8n"); }

export function playPurchaseSuccessSFX(category) {
  if (settings.sfxVolume <= 0) return;
  const now = Tone.now();
  switch (category) {
    case 'time':
      purchaseSuccessSynth.triggerAttackRelease(["G5", "E5", "C5"], "16n", now);
      break;
    case 'score':
      purchaseSuccessSynth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "16n", now);
      break;
    case 'survival':
      purchaseSuccessSynth.triggerAttackRelease(["C4", "E4", "G4"], "8n", now);
      break;
    case 'challenge':
    default:
      purchaseSuccessSynth.triggerAttackRelease(["E5", "G5"], "32n", now);
      break;
  }
}

export function playPurchaseFailSFX() {
  if (settings.sfxVolume <= 0) return;
  const now = Tone.now();
  purchaseFailSynth.triggerAttackRelease("F#2", "8n", now);
  purchaseFailSynth.triggerAttackRelease("F2", "8n", now + 0.1);
}

export function playItemActivationSFX(soundType) {
  if (settings.sfxVolume <= 0) return;
  const now = Tone.now();
  switch (soundType) {
    case 'freeze':
      itemActivationSynth.triggerAttackRelease(["C5", "A4", "F4", "C4"], "16n", now);
      break;
    case 'rewind':
      for (let i = 0; i < 6; i++) {
        itemActivationSynth.triggerAttackRelease(Tone.Frequency(76 - i * 2, 'midi'), '64n', now + i * 0.05);
      }
      break;
    case 'slow':
      itemActivationSynth.triggerAttackRelease("C3", "1n", now);
      break;
    case 'boost':
      itemActivationSynth.triggerAttackRelease(["C4", "E4", "G4", "C5"], "16n", now);
      break;
    case 'bonus':
      itemActivationSynth.triggerAttackRelease(["C5", "E5", "G5", "B5", "D6"], "8n", now);
      break;
    case 'shield':
      itemActivationSynth.triggerAttackRelease("C6", "32n", now);
      break;
    case 'life':
      itemActivationSynth.triggerAttackRelease(["C5", "G5", "C6"], "16n", now);
      break;
    case 'revive':
      itemActivationSynth.triggerAttackRelease("A5", "2n", now);
      break;
    case 'easy':
    case 'modify':
    default:
      itemActivationSynth.triggerAttackRelease("E5", "16n", now);
      break;
  }
}

export function playShieldBlockSFX() {
  if (settings.sfxVolume <= 0) return;
  const now = Tone.now();
  itemActivationSynth.triggerAttackRelease(["G5", "E5"], "32n", now);
}