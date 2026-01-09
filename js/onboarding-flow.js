/**
 * Onboarding Flow Module
 * Extracted from main.js to reduce complexity and improve maintainability
 */

import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as inventory from './inventory.js';
import * as tutorialUI from './tutorial-ui.js';

export function startOnboardingFlow() {
  if (typeof window.onboardingModule === 'undefined') {
    ui.showScreen('main-menu');
    return;
  }

  window.onboardingModule.start();
  audio.playOnboardingMusic();
  showOnboardingStep1();
}

export function showOnboardingStep1() {
  ui.showScreen('onboarding-step1', true);
  // Skip auto-focus on mobile; let user tap the input to trigger keyboard (prevents focus policy conflicts)
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

    step2BackBtn.removeEventListener('click', handleStep2Back);
    step2NextBtn.removeEventListener('click', handleStep2Next);
    showOnboardingStep3();
  };

  step2BackBtn.addEventListener('click', handleStep2Back);
  step2NextBtn.addEventListener('click', handleStep2Next);
}

export function showOnboardingStep3() {
  ui.showScreen('onboarding-step3', true);

  const step3SkipBtn = document.getElementById('onboarding-skip-tutorial');
  const step3StartTutorialBtn = document.getElementById('onboarding-start-tutorial');

  const handleStep3Skip = () => {
    completeOnboarding();
  };

  const handleStep3StartTutorial = () => {
    completeOnboarding();
    setTimeout(() => {
      // Fade out onboarding/main menu music before starting tutorial
      audio.fadeOutOnboarding();
      if (audio.backgroundMusicMainMenu?.state === 'started') {
        audio.backgroundMusicMainMenu.stop();
      }
      if (typeof window.tutorialModule !== 'undefined') {
        window.tutorialModule.reset();
        window.tutorialModule.start();
        // Wait briefly for fade to complete before starting tutorial music
        setTimeout(() => {
          audio.playTutorialMusic();
        }, 550);
        const phase = window.tutorialModule.getCurrentPhase();
        const progress = window.tutorialModule.getProgress();
        tutorialUI.displayTutorialPhase(phase, window.tutorialModule.getPhaseIndex(), progress.total);
        ui.showScreen('tutorial-screen');
      }
    }, 300);
  };

  step3SkipBtn.addEventListener('click', handleStep3Skip);
  step3StartTutorialBtn.addEventListener('click', handleStep3StartTutorial);
}

export function completeOnboarding() {
  // Fade out onboarding music before stopping all music
  audio.fadeOutOnboarding();
  
  // Stop other music after a brief delay to let fade complete
  setTimeout(() => {
    audio.stopAllMusic(state.tensionLoop);
  }, 550);

  window.onboardingModule.complete();

  if (typeof window.gameModule !== 'undefined' && typeof window.achievementsModule !== 'undefined') {
    window.achievementsModule.unlock('onboardingComplete');
  }

  const timeFreezeFreeGiven = localStorage.getItem('timeFreezeFreeGiven');
  if (!timeFreezeFreeGiven) {
    inventory.addItemToInventory(0, 1);
    localStorage.setItem('timeFreezeFreeGiven', 'true');

    const popup = document.createElement('div');
    popup.className = 'popup-overlay';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.innerHTML = `
      <div class="popup-content">
        <h2>🎁 Welcome Gift!</h2>
        <p>You've received a <strong>Time Freeze</strong> item to try out!</p>
        <button id="onboarding-gift-close-btn" class="popup-button primary">Let's Play!</button>
      </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('onboarding-gift-close-btn').addEventListener('click', () => {
      popup.remove();
      audio.playMainMenuMusic();
      ui.showScreen('main-menu');
    });
  } else {
    audio.playMainMenuMusic();
    ui.showScreen('main-menu');
  }
}
