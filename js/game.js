/**
 * Game Module (Main Orchestrator)
 * Re-exports modularized game functions for backward compatibility
 */

export { startGame, goToMainMenu } from './game-flow.js';
export { handleAnswerSubmit } from './game-input.js';
export { generateProblem, updateScore } from './game-problems.js';
export { checkAndUnlockAchievement, displayNextAchievementPopup, displayTutorialCompletion } from './game-achievements.js';
export { handleQuickUse } from './game-items.js';
