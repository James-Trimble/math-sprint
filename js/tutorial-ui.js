/**
 * Tutorial UI Module
 * Handles displaying tutorial phases and navigation
 */

import * as ui from './ui.js';

export function displayTutorialPhase(phase, phaseIndex, totalPhases) {
  const contentEl = document.getElementById("tutorial-phase-content");
  const progressEl = document.getElementById("tutorial-progress");
  const prevBtn = document.getElementById("tutorial-prev-btn");
  const nextBtn = document.getElementById("tutorial-next-btn");
  
  if (!phase || !contentEl) return;
  
  // Update content
  contentEl.innerHTML = `
    <h2 style="color: #4ecdc4; margin-top: 0;">${phase.title}</h2>
    <p style="font-size: 1.1rem; margin: 1rem 0;">${phase.description}</p>
    <div style="background: #1a1a2e; border-left: 4px solid #4ecdc4; padding: 1rem; margin: 1.5rem 0; border-radius: 4px;">
      <p style="margin: 0; color: #4ecdc4; font-weight: 600;">💡 ${phase.callout}</p>
    </div>
  `;
  
  // Update progress
  progressEl.textContent = `Step ${phaseIndex + 1} of ${totalPhases}`;
  
  // Update button states
  prevBtn.classList.toggle('hidden', phaseIndex === 0);
  nextBtn.textContent = phaseIndex === totalPhases - 1 ? 'Start Playing!' : 'Next →';
}

export function showTutorialScreen() {
  ui.showScreen("tutorial-screen");
}

export function hideTutorialScreen() {
  const tutorialScreen = document.getElementById("tutorial-screen");
  if (tutorialScreen) {
    tutorialScreen.classList.add("hidden");
  }
}
