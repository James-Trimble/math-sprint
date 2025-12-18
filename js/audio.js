import { beginBtn } from './ui.js';
import { settings, setTensionLoop } from './state.js';

// --- Global Audio Nodes ---
const reverb = new Tone.Reverb(0.4).toDestination();

// --- Audio Loading State ---
let audioLoadedCount = 0;
// We allow the game to start early (after 3 files), but we handle late files gracefully now.
const MIN_LOAD_THRESHOLD = 3; 

const onAudioLoaded = () => {
  audioLoadedCount++;
  console.log(`Audio Loaded: ${audioLoadedCount}`);
  if (beginBtn && audioLoadedCount >= MIN_LOAD_THRESHOLD) { 
    beginBtn.disabled = false;
    beginBtn.textContent = "Click to Begin";
  }
};

// --- Music Players ---

export const backgroundMusicMainMenu = new Tone.Player({
  url: "./music/mathsprintmainmenu.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
}).toDestination();

export const backgroundMusicSprint = new Tone.Player({
  url: "./music/mathsprintsprintmode.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
}).toDestination();

export const backgroundMusicEndless = new Tone.Player({
  url: "./music/mathsprintendlessmode.mp3",
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
}).toDestination();

export const backgroundMusicSurvival = new Tone.Player({
  url: "./music/mathsprintsurvivalmode.mp3", 
  loop: true,
  volume: -2,
  onload: onAudioLoaded,
}).toDestination();

export const gameOverMusicPlayer = new Tone.Player({
  url: "./music/mathsprintgameover.mp3",
  loop: true,
  loopEnd: 44,
  onload: onAudioLoaded,
}).toDestination();

export const gameOverMusicSurvival = new Tone.Player({
  url: "./music/mathsprintgameoversurvival.mp3", 
  loop: false,
  onload: onAudioLoaded,
}).toDestination();

export const highScoreMusicSprint = new Tone.Player({
  url: "./music/mathsprinthighscoresprint.mp3",
  loop: true,
  loopEnd: 48,
  onload: onAudioLoaded,
}).toDestination();

export const highScoreMusicEndless = new Tone.Player({
  url: "./music/mathsprinthighscoreendless.mp3",
  loop: true,
  onload: onAudioLoaded,
}).toDestination();

export const highScoreMusicSurvival = new Tone.Player({
  url: "./music/mathsprinthighscoresurvival.mp3", 
  loop: true,
  onload: onAudioLoaded,
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

// --- Audio Logos ---
const logoSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth" }, 
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 }
}).connect(reverb);

const holidaySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    volume: -5, 
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 }
}).toDestination();


// --- Functions ---

export function playMainMenuMusic() {
    if (settings.musicVolume <= 0) return;

    // CHECK 1: Is it already playing?
    if (backgroundMusicMainMenu.state === "started") return;

    // CHECK 2: Is the file actually loaded yet?
    if (backgroundMusicMainMenu.loaded) {
        console.log("Starting Main Menu Music...");
        backgroundMusicMainMenu.start();
    } else {
        console.warn("Main Menu Music not loaded yet. Retrying in 1s...");
        // RETRY LOGIC: Wait 1 second and try again
        setTimeout(() => {
             if (backgroundMusicMainMenu.loaded) {
                 backgroundMusicMainMenu.start();
             } else {
                 console.error("Main Menu Music still failed to load.");
             }
        }, 1000);
    }
}

export function playAudioLogo(isChristmas) {
  const now = Tone.now();
  if (isChristmas) {
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
  } else {
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
  // IMPORTANT: Stop everything
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

// SFX Exports
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