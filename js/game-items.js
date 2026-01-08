/**
 * Game Items Module
 * Handles quick item usage during gameplay
 */

import * as ui from './ui.js';
import * as audio from './audio.js';
import * as itemEffects from './item-effects.js';
import * as inventory from './inventory.js';

/**
 * Handle quick use of an item during gameplay
 */
export function handleQuickUse(itemId) {
  const result = itemEffects.activateItem(itemId);
  const count = inventory.getItemCount(itemId);
  ui.updateQuickUseCount(itemId, count);
  
  if (!result.success) {
    audio.playUIErrorSound();
    ui.updateFeedbackDisplay(result.message, "red");
  }
}
