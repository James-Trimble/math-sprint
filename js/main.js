import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import { startGame, goToMainMenu, handleAnswerSubmit } from './game.js';
import { getModalFocusableElements } from './ui.js'; 
import { VERSION_INFO } from './whatsnew.js'; // Ensure this matches your filename

// --- Event Listeners ---

// 1. Ready Screen (Click to Init Audio context)
ui.beginBtn.addEventListener("click", () => {
  ui.beginBtn.disabled = true; 

  // Initialize Tone.js
  Tone.start().then(() => {
    audio.playAudioLogo();
    
    // Artificial delay to let the logo play out
    setTimeout(() => {
      const lastSeenVersion = localStorage.getItem("mathSprintLastVersion");
      
      // Check if this is a new update
      if (lastSeenVersion !== state.GAME_VERSION) {
        
        // Populate Heading
        const headingEl = document.getElementById("whats-new-heading");
        if(headingEl) headingEl.textContent = VERSION_INFO.heading;

        // Populate Tagline (Optional, assumes you have a <p> in the popup)
        const contentP = document.querySelector("#whats-new-popup .popup-content p");
        if(contentP) contentP.textContent = VERSION_INFO.tagline;
        
        // Populate List
        const listContainer = document.querySelector("#whats-new-popup ul");
        if (listContainer) {
            listContainer.innerHTML = ""; // Clear old items
            VERSION_INFO.notes.forEach(note => {
                const li = document.createElement("li");
                li.textContent = note;
                listContainer.appendChild(li);
            });
        }

        ui.showScreen("whats-new-popup", true);
      } else {
        // No update, go straight to menu
        ui.showScreen("main-menu");
      }
    }, 1200); 
  });
});

// 2. "What's New" Popup Close
ui.closePopupBtn.addEventListener("click", () => {
  localStorage.setItem("mathSprintLastVersion", state.GAME_VERSION);
  ui.showScreen("main-menu");
});

// 3. Main Menu Navigation
ui.sprintModeBtn.addEventListener("click", () => startGame('sprint'));
ui.endlessModeBtn.addEventListener("click", () => startGame('endless'));

ui.settingsBtn.addEventListener("click", () => {
  audio.playUIClickSound(); 
  ui.showScreen("settings-screen", true);
});

// 4. Gameplay Form
ui.gameForm.addEventListener("submit", (e) => {
  e.preventDefault(); 
  if (!ui.submitBtn.disabled) {
    handleAnswerSubmit();
  }
});

// 5. Game Over & High Score Actions
ui.playAgainBtn.addEventListener("click", () => startGame(state.gameMode));
ui.mainMenuGameOverBtn.addEventListener("click", goToMainMenu);

ui.playAgainHighScoreBtn.addEventListener("click", () => startGame(state.gameMode));
ui.mainMenuHighScoreBtn.addEventListener("click", goToMainMenu);

ui.scoreBreakdownBtn.addEventListener("click", () => {
  const gameOverHeading = document.getElementById("game-over-heading");
  if (gameOverHeading) {
    gameOverHeading.textContent = "Score Breakdown";
  }
  ui.finalScoreEl.textContent = state.score; 
  ui.displayScoreBreakdown(state.problemsAnswered, state.correctAnswers);
  ui.showScreen("game-over-screen");
});

// --- Settings Dialog Listeners ---

ui.backToMenuBtn.addEventListener("click", () => {
  audio.playUIBackSound();
  goToMainMenu();
});

// Tab switching
ui.tabs.forEach(tab => {
  tab.addEventListener("click", (e) => {
    audio.playUIClickSound();
    
    ui.tabPanels.forEach(panel => {
      panel.classList.add("hidden");
    });
    ui.tabs.forEach(t => {
      t.setAttribute("aria-selected", "false");
    });

    const targetPanelId = e.target.getAttribute("aria-controls");
    document.getElementById(targetPanelId).classList.remove("hidden");
    e.target.setAttribute("aria-selected", "true");
  });
});

// Volume Controls
ui.masterVolumeSlider.addEventListener("input", (e) => {
  state.settings.masterVolume = parseInt(e.target.value, 10);
  // audio.playUIToggleOnSound(); // Optional: Removed to reduce spam while sliding
  audio.applyVolumeSettings();
  state.saveSettings();
});

ui.musicVolumeSlider.addEventListener("input", (e) => {
  state.settings.musicVolume = parseInt(e.target.value, 10);
  audio.applyVolumeSettings();
  state.saveSettings();
});

ui.sfxVolumeSlider.addEventListener("input", (e) => {
  state.settings.sfxVolume = parseInt(e.target.value, 10);
  audio.applyVolumeSettings();
  state.saveSettings();
});

// Operation Toggles
ui.operationCheckboxes.forEach(checkbox => {
  checkbox.addEventListener("change", (e) => {
    const checkedCount = ui.operationCheckboxes.filter(cb => cb.checked).length;
    if (checkedCount === 0) {
      audio.playUIErrorSound();
      checkbox.checked = true; // Force re-check
    } else {
      if (e.target.checked) audio.playUIToggleOnSound();
      else audio.playUIToggleOffSound();
      
      state.settings.operations.addition = ui.opAddition.checked;
      state.settings.operations.subtraction = ui.opSubtraction.checked;
      state.settings.operations.multiplication = ui.opMultiplication.checked;
      state.settings.operations.division = ui.opDivision.checked;
      state.saveSettings();
    }
    ui.validateOperationToggles();
  });
});

// Misc Settings
ui.disableCountdownToggle.addEventListener("change", (e) => {
  if (e.target.checked) audio.playUIToggleOnSound();
  else audio.playUIToggleOffSound();
  
  state.settings.disableCountdown = e.target.checked;
  state.saveSettings();
});

ui.contrastBtn.addEventListener("click", () => {
  if (document.body.classList.contains("high-contrast")) {
    audio.playUIToggleOffSound(); 
  } else {
    audio.playUIToggleOnSound(); 
  }
  
  document.body.classList.toggle("high-contrast");
  localStorage.setItem(
    "mathSprintHighContrast",
    document.body.classList.contains("high-contrast")
  );
});

// --- Initial Setup ---
window.addEventListener("load", () => {
  ui.copyrightYearEl.textContent = new Date().getFullYear();
  ui.versionNumberEl.textContent = state.GAME_VERSION; 
  
  ui.beginBtn.disabled = true;
  ui.beginBtn.textContent = "Loading Audio...";

  state.loadSettings();
  audio.initializeTensionLoop();
  audio.applyVolumeSettings();
  
  ui.applySettingsToUI(state.settings);
  ui.validateOperationToggles(); 
  
  ui.showScreen("ready-screen"); 
});

// --- Modal Focus Management ---
function handleModalKeydown(e) {
  if (!state.currentModalId) return; // Not in a modal

  if (e.key === 'Escape') {
    audio.playUIBackSound();
    goToMainMenu();
    return;
  }

  if (e.key !== 'Tab') return;

  const focusableElements = getModalFocusableElements(state.currentModalId);
  if (focusableElements.length === 0) return;

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (document.activeElement === last && !e.shiftKey) {
    // On last, pressing Tab: go to first
    e.preventDefault();
    first.focus();
  } else if (document.activeElement === first && e.shiftKey) {
    // On first, pressing Shift+Tab: go to last
    e.preventDefault();
    last.focus();
  }
}

document.addEventListener('keydown', handleModalKeydown);