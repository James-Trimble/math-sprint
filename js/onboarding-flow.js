/**
 * Onboarding Flow Module
 * 3-step flow: name → operations/volume → tutorial choice
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as tutorialUI from './tutorial-ui.js';

let onboardingCompleting = false;

export function startOnboardingFlow() {
  if (typeof window.onboardingModule === 'undefined') {
    ui.showScreen('main-menu');
    return;
  }
  window.onboardingModule.start();
  audio.playOnboardingMusic();
  
  const currentStep = window.onboardingModule.getCurrentStep();
  switch (currentStep) {
    case 1:
      showOnboardingStep1();
      break;
    case 2:
      showOnboardingStep2();
      break;
    case 3:
      showOnboardingStep3();
      break;
    default:
      // Fallback to step 1 if something goes wrong
      showOnboardingStep1();
      break;
  }
}

export function showOnboardingStep1() {
  ui.showScreen('onboarding-step1', true);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile && ui.onboardingNameInput) ui.onboardingNameInput.focus();

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const name = ui.onboardingNameInput.value.trim();
    if (!name) {
      ui.onboardingNameError.textContent = 'Please enter your name';
      ui.onboardingNameError.style.display = 'block';
      ui.onboardingNameInput.setAttribute('aria-invalid', 'true');
      return;
    }
    ui.onboardingNameError.style.display = 'none';
    ui.onboardingNameInput.removeAttribute('aria-invalid');
    window.onboardingModule.saveName(name);
    ui.onboardingNameForm.removeEventListener('submit', handleStep1Submit);
    showOnboardingStep2();
  };

  ui.onboardingNameForm.addEventListener('submit', handleStep1Submit);
  ui.onboardingNameInput.addEventListener('input', () => {
    if (ui.onboardingNameInput.value.trim()) {
      ui.onboardingNameError.style.display = 'none';
      ui.onboardingNameInput.removeAttribute('aria-invalid');
    }
  });
}

export function showOnboardingStep2() {
  ui.showScreen('onboarding-step2', true);

  const step2BackBtn = document.getElementById('onboarding-step2-back');
  const step2NextBtn = document.getElementById('onboarding-step2-next');

  const handleStep2Back = () => {
    step2BackBtn.removeEventListener('click', handleStep2Back);
    step2NextBtn.removeEventListener('click', handleStep2Next);
    const omv = document.getElementById('onboarding-master-volume');
    const omuv = document.getElementById('onboarding-music-volume');
    const osv = document.getElementById('onboarding-sfx-volume');
    if (omv) omv.removeEventListener('input', handleMasterVolume);
    if (omuv) omuv.removeEventListener('input', handleMusicVolume);
    if (osv) osv.removeEventListener('input', handleSfxVolume);
    ui.onboardingNameForm.reset();
    showOnboardingStep1();
  };

  const handleStep2Next = () => {
    const selectedOps = [
      ui.onboardingOpAddition?.checked,
      ui.onboardingOpSubtraction?.checked,
      ui.onboardingOpMultiplication?.checked,
      ui.onboardingOpDivision?.checked,
    ].filter(Boolean);
    if (selectedOps.length === 0) {
      alert('Please select at least one operation');
      return;
    }

    const settings = {
      allowAddition: ui.onboardingOpAddition?.checked || false,
      allowSubtraction: ui.onboardingOpSubtraction?.checked || false,
      allowMultiplication: ui.onboardingOpMultiplication?.checked || false,
      allowDivision: ui.onboardingOpDivision?.checked || false,
    };
    window.onboardingModule.saveSettings(settings);

    const omv = document.getElementById('onboarding-master-volume');
    const omuv = document.getElementById('onboarding-music-volume');
    const osv = document.getElementById('onboarding-sfx-volume');
    if (omv) omv.removeEventListener('input', handleMasterVolume);
    if (omuv) omuv.removeEventListener('input', handleMusicVolume);
    if (osv) osv.removeEventListener('input', handleSfxVolume);

    step2BackBtn.removeEventListener('click', handleStep2Back);
    step2NextBtn.removeEventListener('click', handleStep2Next);
    showOnboardingStep3();
  };

  step2BackBtn.addEventListener('click', handleStep2Back);
  step2NextBtn.addEventListener('click', handleStep2Next);

  const omv = document.getElementById('onboarding-master-volume');
  const omuv = document.getElementById('onboarding-music-volume');
  const osv = document.getElementById('onboarding-sfx-volume');

  function handleMasterVolume(e) {
    const v = Number(e.target.value);
    state.settings.masterVolume = v;
    audio.applyVolumeSettings();
    state.saveSettings();
  }

  function handleMusicVolume(e) {
    const v = Number(e.target.value);
    state.settings.musicVolume = v;
    audio.applyVolumeSettings();
    state.saveSettings();
  }

  function handleSfxVolume(e) {
    const v = Number(e.target.value);
    state.settings.sfxVolume = v;
    audio.applyVolumeSettings();
    audio.playVolumeAdjustSFX();
    state.saveSettings();
  }

  if (omv) {
    omv.value = state.settings.masterVolume || 100;
    omv.addEventListener('input', handleMasterVolume);
  }
  if (omuv) {
    omuv.value = state.settings.musicVolume || 100;
    omuv.addEventListener('input', handleMusicVolume);
  }
  if (osv) {
    osv.value = state.settings.sfxVolume || 100;
    osv.addEventListener('input', handleSfxVolume);
  }
}

export function showOnboardingStep3() {
  ui.showScreen('onboarding-step3', true);

  const step3SkipBtn = document.getElementById('onboarding-skip-tutorial');
  const step3StartTutorialBtn = document.getElementById('onboarding-start-tutorial');
  if (!step3SkipBtn || !step3StartTutorialBtn) {
    console.warn('Onboarding step 3 buttons not found in DOM');
    return;
  }

  console.log('Onboarding step 3: buttons found and setting up listeners');

  const handleStep3Skip = () => {
    console.log('Skip button clicked');
    step3SkipBtn.removeEventListener('click', handleStep3Skip);
    step3StartTutorialBtn.removeEventListener('click', handleStep3StartTutorial);
    completeOnboarding({ goToMainMenu: true });
  };

  const handleStep3StartTutorial = () => {
    console.log('Start tutorial button clicked');
    step3SkipBtn.removeEventListener('click', handleStep3Skip);
    step3StartTutorialBtn.removeEventListener('click', handleStep3StartTutorial);
    completeOnboarding({ goToMainMenu: false });
    setTimeout(() => {
      console.log('Starting tutorial...');
      if (typeof window.tutorialModule !== 'undefined') {
        window.tutorialModule.reset();
        window.tutorialModule.start();
        setTimeout(() => {
          audio.playTutorialMusic();
        }, 550);
        const phase = window.tutorialModule.getCurrentPhase();
        const progress = window.tutorialModule.getProgress();
        tutorialUI.displayTutorialPhase(phase, window.tutorialModule.getPhaseIndex(), progress.total);
        ui.showScreen('tutorial-screen');
      }
    }, 600);
  };

  step3SkipBtn.addEventListener('click', handleStep3Skip);
  step3StartTutorialBtn.addEventListener('click', handleStep3StartTutorial);
  console.log('Onboarding step 3: event listeners attached');
}

export function completeOnboarding(options = {}) {
  const { goToMainMenu = true } = options;
  console.log('completeOnboarding called', { goToMainMenu });
  if (onboardingCompleting) {
    console.warn('completeOnboarding already in progress, returning early');
    return;
  }
  onboardingCompleting = true;

  // Fade out onboarding music
  audio.fadeOutOnboarding();

  // Mark onboarding as complete
  try {
    if (window.onboardingModule) {
      window.onboardingModule.complete();
      console.log('onboardingModule.complete() called');
    }
  } catch (e) {
    console.error('Error calling onboardingModule.complete():', e);
  }

  // Unlock achievement
  try {
    if (typeof window.gameModule !== 'undefined' && typeof window.achievementsModule !== 'undefined') {
      window.achievementsModule.unlock('onboardingComplete');
      console.log('onboardingComplete achievement unlocked');
    }
  } catch (e) {
    console.error('Error unlocking achievement:', e);
  }

  // Wait for fade to complete before transitioning
  setTimeout(() => {
    audio.stopAllMusic(state.tensionLoop);
    onboardingCompleting = false;
    if (goToMainMenu) {
      try { audio.playMainMenuMusic(); } catch (e) { console.error('Error playing main menu music:', e); }
      try { ui.showScreen('main-menu'); } catch (e) { console.error('Error showing main menu:', e); }
    }
  }, 550);
}
