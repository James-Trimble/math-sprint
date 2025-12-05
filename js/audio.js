// js/audio.js
import { beginBtn } from './ui.js';
import { settings, setTensionLoop } from './state.js';

// --- Audio Loading ---
let audioLoadedCount = 0;
// We now have 5 total tracks to load (Sprint, Endless, SprintOver, EndlessOver, HighScore)
// But for now, let's just stick to loading the 3 active ones or lazy load? 
// To keep it simple for Alpha, we'll increment for the core ones. 
// Let's assume we load all of them to prevent lag when switching modes.
const totalAudio = 5; 

const onAudioLoaded = () => {
  audioLoadedCount++;
  // Only enable button if we have loaded the essentials. 
  // If you add more files, remember to update totalAudio
  if (audioLoadedCount >= 3) { 
    beginBtn.disabled = false;
    beginBtn.textContent = "Click to Begin";
  }
};

// --- Music Players ---

export const backgroundMusicSprint = new Tone.Player({
  url: "./music/mathsprintsprintmode.mp3",
  loop: true,
  onload: onAudioLoaded,
}).toDestination();

export const backgroundMusicEndless = new Tone.Player({
  url: "./music/mathsprintendlessmode.mp3", // NEW
  loop: true,
  onload: onAudioLoaded,
}).toDestination();

export const gameOverMusicPlayer = new Tone.Player({
  url: "./music/gameoverscreen.mp3",
  loop: true,
  loopEnd: 44,
  onload: onAudioLoaded,
}).toDestination();

export const highScoreMusicSprint = new Tone.Player({
  url: "./music/mathsprinthighscoresprint.mp3",
  loop: true,
  loopEnd: 48,
  onload: onAudioLoaded,
}).toDestination();

export const highScoreMusicEndless = new Tone.Player({
  url: "./music/mathsprinthighscoreendless.mp3", // NEW
  loop: true,
  onload: onAudioLoaded,
}).toDestination();

// --- Synths (Sound Effects) ---

const synthEnvelope = { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.4 };

// EXISTING SYNTHS
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
const reverb = new Tone.Reverb(0.4).toDestination();

// NEW: Gabriel's "Voice" (Musical Personality)
// A DuoSynth creates a more complex, vocal-like tone without sounding like a broken robot.
const gabrielSynth = new Tone.DuoSynth({
    vibratoAmount: 0.5,
    vibratoRate: 5,
    harmonicity: 1.5,
    voice0: {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 }
    },
    voice1: {
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 }
    }
}).connect(reverb);

const logoSynth = new Tone.PolySynth(Tone.FMSynth, {
  harmonicity: 3,
  modulationIndex: 10,
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 1 },
  modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
}).connect(reverb);


// --- Audio Functions ---

export function initializeTensionLoop() {
    const loop = new Tone.Loop((time) => {
        countdownSynth.triggerAttackRelease("A4", "16n", time);
    }, "2n");
    setTensionLoop(loop);
}

export function stopAllMusic(tensionLoop) {
  backgroundMusicSprint.stop();
  backgroundMusicEndless.stop();
  gameOverMusicPlayer.stop();
  highScoreMusicSprint.stop();
  highScoreMusicEndless.stop();
  
  if (Tone.Transport.state === "started") {
    if (tensionLoop) tensionLoop.stop();
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }
}

export function playAudioLogo() {
  const now = Tone.now();
  logoSynth.triggerAttackRelease("C5", "8n", now);
  logoSynth.triggerAttackRelease("G5", "8n", now + 0.2);
  logoSynth.triggerAttackRelease(["C4", "E5", "C6"], "8n", now + 0.4);
}

// --- SFX Triggers ---

// Update Apply Volume to handle new tracks
export function applyVolumeSettings() {
  const volToDb = (vol) => (vol == 0 ? -Infinity : (vol - 100) * 0.4);

  Tone.Destination.volume.value = volToDb(settings.masterVolume);

  const musicDb = volToDb(settings.musicVolume);
  backgroundMusicSprint.volume.value = musicDb;
  backgroundMusicEndless.volume.value = musicDb;
  gameOverMusicPlayer.volume.value = musicDb;
  highScoreMusicSprint.volume.value = musicDb;
  highScoreMusicEndless.volume.value = musicDb;
  
  const sfxDb = volToDb(settings.sfxVolume);
  gameSynth.volume.value = sfxDb;
  streakSynth.volume.value = sfxDb;
  uiClickSynth.volume.value = sfxDb;
  uiBackSynth.volume.value = sfxDb;
  uiToggleOnSynth.volume.value = sfxDb;
  uiToggleOffSynth.volume.value = sfxDb;
  uiErrorSynth.volume.value = sfxDb;
  countdownSynth.volume.value = sfxDb;
  logoSynth.volume.value = sfxDb;
  newHighScoreSFX.volume.value = sfxDb;
  gameOverSFX.volume.value = sfxDb;
  gabrielSynth.volume.value = sfxDb; // NEW
}

// EXISTING SFX WRAPPERS (Unchanged logic, just ensure they exist)
export function playCorrectTone() { if (settings.sfxVolume > 0) gameSynth.triggerAttackRelease("E5", "8n"); }
export function playIncorrectTone() { if (settings.sfxVolume > 0) gameSynth.triggerAttackRelease("C4", "8n"); }
export function playStreakTone() { if (settings.sfxVolume > 0) streakSynth.triggerAttackRelease("G5", "8n", "+0.1"); }
export function playGameOverSFX() { if (settings.sfxVolume > 0) gameOverSFX.triggerAttackRelease("A2", "1n"); }
export function playNewHighScoreSFX() { if (settings.sfxVolume > 0) newHighScoreSFX.triggerAttackRelease(["C4", "E4", "G4", "C5"], "1n"); }
export function playUIClickSound() { if (settings.sfxVolume > 0) uiClickSynth.triggerAttackRelease("C5", "32n"); }
export function playUIBackSound() { if (settings.sfxVolume > 0) uiBackSynth.triggerAttackRelease("A4", "32n"); }
export function playUIToggleOnSound() { if (settings.sfxVolume > 0) uiToggleOnSynth.triggerAttackRelease("C6", "64n"); }
export function playUIToggleOffSound() { if (settings.sfxVolume > 0) uiToggleOffSynth.triggerAttackRelease("G5", "64n"); }
export function playUIErrorSound() { if (settings.sfxVolume > 0) uiErrorSynth.triggerAttackRelease("G#2", "16n"); }
export function playCountdownBeep() { if (settings.sfxVolume > 0) countdownSynth.triggerAttackRelease("G4", "16n"); }
export function playCountdownGoBeep() { if (settings.sfxVolume > 0) countdownSynth.triggerAttackRelease("C5", "8n"); }

// NEW GABRIEL SOUNDS
export function playGabrielHappy() {
    if (settings.sfxVolume > 0) gabrielSynth.triggerAttackRelease("C6", "16n");
}
export function playGabrielSassy() {
    if (settings.sfxVolume > 0) gabrielSynth.triggerAttackRelease("G3", "8n");
}