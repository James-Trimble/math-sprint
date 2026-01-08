import * as state from './state.js';
import * as ui from './ui.js';

export function updateWelcomeMessage() {
  if (!ui.welcomeMessage) return;
  state.loadSettings();
  const playerName = state.settings.playerName;
  if (playerName) {
    ui.welcomeMessage.textContent = `Welcome back, ${playerName}! 👋`;
  } else {
    ui.welcomeMessage.textContent = '';
  }
}

// Expose globally for modules that call it without import
window.updateWelcomeMessage = updateWelcomeMessage;
