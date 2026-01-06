import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import * as shop from './shop.js';
import { startGame, goToMainMenu, handleAnswerSubmit } from './game.js';
import { VERSION_INFO } from './whatsnew.js';

// --- INITIALIZATION ---
window.addEventListener("load", () => {
  ui.copyrightYearEl.textContent = new Date().getFullYear();
  ui.versionNumberEl.textContent = state.GAME_VERSION; 
  ui.beginBtn.disabled = true;
  ui.beginBtn.textContent = "Loading Audio...";

  state.loadSettings();
  
  // 0.9.0 Update: Give bonus sparks and mark feature as seen
  const lastVersion = localStorage.getItem("mathSprintLastVersion");
  if (lastVersion !== state.GAME_VERSION) {
    if (!localStorage.getItem("securityUpdateBonusGiven")) {
      state.addSparks(300);
      localStorage.setItem("securityUpdateBonusGiven", "true");
    }
  }
  audio.initializeTensionLoop();
  audio.applyVolumeSettings();
  ui.applySettingsToUI(state.settings);
  ui.validateOperationToggles(); 
  ui.walletBalanceEl.textContent = state.sparksWallet;

  // SEASONAL CHECK
  const now = new Date();
  const month = now.getMonth(); 
  const date = now.getDate();
  const isWinter = (month === 11 || month === 0 || month === 1);
  const isChristmas = (month === 11 && date <= 25);
  
  ui.applySeasonalVisuals(isWinter, isChristmas);
  window.isChristmasMode = isChristmas;

  ui.showScreen("ready-screen");
  
  // Start the audio loading timeout
  audio.startAudioLoadTimeout();
});

// --- AUDIO START ---
ui.beginBtn.addEventListener("click", () => {
  ui.beginBtn.disabled = true; 
  
  Tone.start().then(() => {
    // 1. Play the correct logo
    audio.playAudioLogo(window.isChristmasMode);
    
    // 2. Calculate how long to wait
    // Christmas Logo = ~3.5s total duration including decay. 
    // We want a 0.5s gap. So we wait 4000ms total.
    const logoWaitTime = window.isChristmasMode ? 4000 : 1500;
    
    setTimeout(() => {
      const lastSeenVersion = localStorage.getItem("mathSprintLastVersion");
      
      // Show audio feature notification if audio is in fallback mode and not shown before
      if (audio.isAudioTimeoutTriggered() && !localStorage.getItem("audioFeatureNotificationShown")) {
        localStorage.setItem("audioFeatureNotificationShown", "true");
        ui.showScreen("audio-feature-popup", true);
      } else if (lastSeenVersion !== state.GAME_VERSION) {
        populateWhatsNew();
        ui.showScreen("whats-new-popup", true);
      } else {
        ui.showScreen("main-menu");
      }
      
      // 3. Start Music (only if audio is ready)
      if (audio.canPlayMainMenuMusic()) {
        audio.playMainMenuMusic();
      }
      
    }, logoWaitTime); 
  });
});

function populateWhatsNew() {
    const headingEl = document.getElementById("whats-new-heading");
    if(headingEl) headingEl.textContent = VERSION_INFO.heading;
    
    const contentP = document.querySelector("#whats-new-popup .popup-content p");
    if(contentP) contentP.textContent = VERSION_INFO.tagline;
    
    const listContainer = document.querySelector("#whats-new-popup ul");
    if (listContainer) {
        listContainer.innerHTML = "";
        VERSION_INFO.notes.forEach(note => {
            const li = document.createElement("li");
            li.textContent = note;
            listContainer.appendChild(li);
        });
    }
}

// --- MAIN MENU LISTENERS ---
ui.sprintModeBtn.addEventListener("click", () => startGame('sprint'));
ui.endlessModeBtn.addEventListener("click", () => startGame('endless'));
ui.survivalModeBtn.addEventListener("click", () => startGame('survival')); 

ui.settingsBtn.addEventListener("click", () => {
  audio.playUIClickSound(); 
  ui.showScreen("settings-screen", true);
});

ui.shopBtn.addEventListener("click", () => {
    audio.playUIClickSound();
    ui.walletBalanceEl.textContent = state.sparksWallet;
  shop.renderShopItems();
    ui.showScreen("shop-screen", true);
});

ui.backToMenuShopBtn.addEventListener("click", () => {
    audio.playUIBackSound();
    ui.showScreen("main-menu");
});

// --- POPUP CLOSERS ---
ui.cashOutCloseBtn.addEventListener("click", () => {
    audio.playUIClickSound();
    ui.showScreen("main-menu");
    audio.playMainMenuMusic();
});

// Audio feature notification closer
const audioFeatureCloseBtn = document.getElementById("audio-feature-close-btn");
if (audioFeatureCloseBtn) {
  audioFeatureCloseBtn.addEventListener("click", () => {
    const lastSeenVersion = localStorage.getItem("mathSprintLastVersion");
    if (lastSeenVersion !== state.GAME_VERSION) {
      populateWhatsNew();
      ui.showScreen("whats-new-popup", true);
    } else {
      ui.showScreen("main-menu");
    }
    audio.playMainMenuMusic();
  });
}

ui.closePopupBtn.addEventListener("click", () => { 
    localStorage.setItem("mathSprintLastVersion", state.GAME_VERSION); 
    ui.showScreen("main-menu"); 
    audio.playMainMenuMusic();
});

// --- GAMEPLAY LISTENERS ---
ui.gameForm.addEventListener("submit", (e) => {
  e.preventDefault(); 
  if (!ui.submitBtn.disabled) handleAnswerSubmit();
});

ui.playAgainBtn.addEventListener("click", () => startGame(state.gameMode));
ui.mainMenuGameOverBtn.addEventListener("click", goToMainMenu);
ui.playAgainHighScoreBtn.addEventListener("click", () => startGame(state.gameMode));
ui.mainMenuHighScoreBtn.addEventListener("click", goToMainMenu);

ui.scoreBreakdownBtn.addEventListener("click", () => {
  ui.finalScoreEl.textContent = state.score; 
  ui.displayScoreBreakdown(state.problemsAnswered, state.correctAnswers);
  ui.showScreen("game-over-screen");
});

// --- SETTINGS LISTENERS ---
ui.backToMenuBtn.addEventListener("click", () => {
  audio.playUIBackSound();
  goToMainMenu();
});

ui.masterVolumeSlider.addEventListener("input", (e) => { 
    state.settings.masterVolume = e.target.value; 
    audio.applyVolumeSettings(); 
    state.saveSettings(); 
});
ui.musicVolumeSlider.addEventListener("input", (e) => { 
    state.settings.musicVolume = e.target.value; 
    audio.applyVolumeSettings(); 
    state.saveSettings(); 
});
ui.sfxVolumeSlider.addEventListener("input", (e) => { 
    state.settings.sfxVolume = e.target.value; 
    audio.applyVolumeSettings(); 
    state.saveSettings(); 
});

ui.disableCountdownToggle.addEventListener("change", (e) => { 
    state.settings.disableCountdown = e.target.checked; 
    state.saveSettings(); 
});

[ui.opAddition, ui.opSubtraction, ui.opMultiplication, ui.opDivision].forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    state.settings.operations.addition = ui.opAddition.checked;
    state.settings.operations.subtraction = ui.opSubtraction.checked;
    state.settings.operations.multiplication = ui.opMultiplication.checked;
    state.settings.operations.division = ui.opDivision.checked;
    ui.validateOperationToggles();
    state.saveSettings();
  });
});

ui.tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const targetId = tab.getAttribute("aria-controls");
    ui.tabs.forEach(t => {
      t.setAttribute("aria-selected", "false");
      t.classList.remove("active");
    });
    tab.setAttribute("aria-selected", "true");
    tab.classList.add("active");
    ui.tabPanels.forEach(panel => {
      panel.classList.add("hidden");
    });
    document.getElementById(targetId).classList.remove("hidden");
    audio.playUIClickSound();
  });
});

ui.contrastBtn.addEventListener("click", () => { 
    document.body.classList.toggle("high-contrast"); 
    localStorage.setItem("mathSprintHighContrast", document.body.classList.contains("high-contrast")); 
});