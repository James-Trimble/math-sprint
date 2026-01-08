/**
 * Audio SFX Module
 * Handles all sound effects and synths
 */

import { settings } from './state.js';

// --- Global Audio Nodes ---
const reverb = new Tone.Reverb(0.4).toDestination();

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

const achievementUnlockSynth = new Tone.PolySynth(Tone.Synth, {
  maxPolyphony: 6,
  envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.5 }
}).toDestination();

// --- Audio Logos ---
const logoSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth" }, 
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 }
}).connect(reverb);

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
    volume: 0
}).connect(reverb);

// --- SFX Functions ---

// Helper: Convert volume (0-100) to dB scale
const volToDb = (vol) => (vol == 0 ? -Infinity : (vol - 100) * 0.4);

export function playCorrectTone() { 
  if (settings.sfxVolume > 0) {
    gameSynth.volume.value = volToDb(settings.sfxVolume);
    gameSynth.triggerAttackRelease("E5", "8n"); 
  }
}

export function playIncorrectTone() { 
  if (settings.sfxVolume > 0) {
    gameSynth.volume.value = volToDb(settings.sfxVolume);
    gameSynth.triggerAttackRelease("C4", "8n"); 
  }
}

export function playStreakTone() { 
  if (settings.sfxVolume > 0) {
    streakSynth.volume.value = volToDb(settings.sfxVolume);
    streakSynth.triggerAttackRelease("G5", "8n", "+0.1"); 
  }
}

export function playCashOutSFX() { 
  if (settings.sfxVolume > 0) {
    cashOutSynth.volume.value = volToDb(settings.sfxVolume);
    cashOutSynth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "8n"); 
  }
}

export function playGameOverSFX() { 
  if (settings.sfxVolume > 0) {
    gameOverSFX.volume.value = volToDb(settings.sfxVolume);
    gameOverSFX.triggerAttackRelease("A2", "1n"); 
  }
}

export function playNewHighScoreSFX() { 
  if (settings.sfxVolume > 0) {
    newHighScoreSFX.volume.value = volToDb(settings.sfxVolume);
    newHighScoreSFX.triggerAttackRelease(["C4", "E4", "G4", "C5"], "1n"); 
  }
}

export function playUIClickSound() { 
  if (settings.sfxVolume > 0) {
    uiClickSynth.volume.value = volToDb(settings.sfxVolume);
    uiClickSynth.triggerAttackRelease("C5", "32n"); 
  }
}

export function playUIBackSound() { 
  if (settings.sfxVolume > 0) {
    uiBackSynth.volume.value = volToDb(settings.sfxVolume);
    uiBackSynth.triggerAttackRelease("A4", "32n"); 
  }
}

export function playUIToggleOnSound() { 
  if (settings.sfxVolume > 0) {
    uiToggleOnSynth.volume.value = volToDb(settings.sfxVolume);
    uiToggleOnSynth.triggerAttackRelease("C6", "64n"); 
  }
}

export function playUIToggleOffSound() { 
  if (settings.sfxVolume > 0) {
    uiToggleOffSynth.volume.value = volToDb(settings.sfxVolume);
    uiToggleOffSynth.triggerAttackRelease("G5", "64n"); 
  }
}

export function playUIErrorSound() { 
  if (settings.sfxVolume > 0) {
    uiErrorSynth.volume.value = volToDb(settings.sfxVolume);
    uiErrorSynth.triggerAttackRelease("G#2", "16n"); 
  }
}

export function playCountdownBeep() { 
  if (settings.sfxVolume > 0) {
    countdownSynth.volume.value = volToDb(settings.sfxVolume);
    countdownSynth.triggerAttackRelease("G4", "16n"); 
  }
}

export function playCountdownGoBeep() { 
  if (settings.sfxVolume > 0) {
    countdownSynth.volume.value = volToDb(settings.sfxVolume);
    countdownSynth.triggerAttackRelease("C5", "8n"); 
  }
}

export function playGabrielHappy() { 
  if (settings.sfxVolume > 0) {
    gabrielSynth.volume.value = volToDb(settings.sfxVolume);
    gabrielSynth.triggerAttackRelease("C6", "16n"); 
  }
}

export function playGabrielSassy() { 
  if (settings.sfxVolume > 0) {
    gabrielSynth.volume.value = volToDb(settings.sfxVolume);
    gabrielSynth.triggerAttackRelease("G3", "8n"); 
  }
}

export function playPurchaseSuccessSFX(category) {
  if (settings.sfxVolume <= 0) return;
  purchaseSuccessSynth.volume.value = volToDb(settings.sfxVolume);
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
  purchaseFailSynth.volume.value = volToDb(settings.sfxVolume);
  const now = Tone.now();
  purchaseFailSynth.triggerAttackRelease("F#2", "8n", now);
  purchaseFailSynth.triggerAttackRelease("F2", "8n", now + 0.1);
}

export function playItemActivationSFX(soundType) {
  if (settings.sfxVolume <= 0) return;
  itemActivationSynth.volume.value = volToDb(settings.sfxVolume);
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
  itemActivationSynth.volume.value = volToDb(settings.sfxVolume);
  const now = Tone.now();
  itemActivationSynth.triggerAttackRelease(["G5", "E5"], "32n", now);
}

export function playAchievementUnlockSFX() {
  if (settings.sfxVolume <= 0) return;
  const now = Tone.now();
  // Combine sfx volume setting with the standard -15 for this synth
  const sfxDb = volToDb(settings.sfxVolume);
  achievementUnlockSynth.volume.value = sfxDb - 15;
  achievementUnlockSynth.triggerAttackRelease(["C5", "E5", "G5"], "32n", now);
  achievementUnlockSynth.triggerAttackRelease(["E5", "G5", "C6"], "32n", now + 0.15);
  achievementUnlockSynth.triggerAttackRelease(["G5", "C6", "E6"], "32n", now + 0.3);
}

export function playVolumeAdjustSFX() {
  if (settings.sfxVolume <= 0) return;
  // Convert volume (0-100) to dB scale
  const volToDb = (vol) => (vol == 0 ? -Infinity : (vol - 100) * 0.4);
  const sfxDb = volToDb(settings.sfxVolume);
  uiClickSynth.volume.value = sfxDb;
  uiClickSynth.triggerAttackRelease("D5", "32n");
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
      
      holidaySynth.triggerAttackRelease("C4", "1n", now + 1.6);
  } else {
      // STANDARD
      logoSynth.triggerAttackRelease("G4", "16n", now);       
      logoSynth.triggerAttackRelease("C5", "16n", now + 0.1); 
      logoSynth.triggerAttackRelease("E5", "16n", now + 0.2); 
      logoSynth.triggerAttackRelease(["G5", "B5", "D6", "G6"], "2n", now + 0.3);
  }
}
