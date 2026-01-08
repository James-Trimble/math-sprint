// Item activation and effect handling
import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as inventory from './inventory.js';
import { getItemById, getItemsList, ITEM_CATEGORIES } from './items.js';

const nowMs = () => Date.now();

function setActiveFlag(itemId, active) {
  ui.setQuickUseActive(itemId, active);
}

function expireIfNeeded(itemId, effect) {
  if (effect && effect.expiresAt && nowMs() >= effect.expiresAt) {
    inventory.deactivateEffect(itemId);
    setActiveFlag(itemId, false);
    return true;
  }
  return false;
}

export function handleTick() {
  const entries = inventory.getAllActiveEffects();
  entries.forEach(([id, effect]) => expireIfNeeded(id, effect));
}

export function getTimeDelta() {
  const freeze = inventory.getActiveEffect('timeFreeze');
  if (freeze && !expireIfNeeded('timeFreeze', freeze)) return 0;

  const slow = inventory.getActiveEffect('slowMotion');
  if (slow && !expireIfNeeded('slowMotion', slow)) {
    return slow.slowFactor ?? 1;
  }
  return 1;
}

export function getScoreMultiplier() {
  const dp = inventory.getActiveEffect('doublePoints');
  if (dp && !expireIfNeeded('doublePoints', dp)) return dp.multiplier ?? 1;
  return 1;
}

export function shouldBlockPenalty() {
  const shield = inventory.getActiveEffect('shield');
  if (shield && shield.charges > 0) {
    shield.charges -= 1;
    if (shield.charges <= 0) {
      inventory.deactivateEffect('shield');
      setActiveFlag('shield', false);
    }
    ui.announceItem('Shield blocked a penalty');
    ui.showItemToast('Shield blocked a penalty');
    audio.playShieldBlockSFX();
    return true;
  }
  return false;
}

export function handleSecondChanceIfReady() {
  const effect = inventory.getActiveEffect('secondChance');
  if (!effect) return false;
  if (state.timeLeft <= 0) {
    inventory.deactivateEffect('secondChance');
    setActiveFlag('secondChance', false);
    const reviveTime = effect.reviveTime ?? 30;
    state.setTimeLeft(reviveTime);
    ui.updateTimerDisplay(Math.ceil(reviveTime));
    ui.announceItem('Second Chance activated');
    ui.showItemToast('Second Chance activated');
    audio.playItemActivationSFX('revive');
    return true;
  }
  return false;
}

export function getForcedOps() {
  const easy = inventory.getActiveEffect('easyMode');
  if (easy && !expireIfNeeded('easyMode', easy)) return easy.forcedOps;
  return null;
}

export function getDisabledOps() {
  const noSub = inventory.getActiveEffect('noSubtraction');
  if (noSub && !expireIfNeeded('noSubtraction', noSub)) return noSub.disabledOps;
  return [];
}

export function resetEffects() {
  inventory.clearActiveEffects();
}

export function activateItem(itemId) {
  const item = getItemById(itemId);
  if (!item) return { success: false, message: 'Item not found' };

  // Mode restrictions
  if (item.modeRestriction && state.gameMode !== item.modeRestriction) {
    return { success: false, message: `Works only in ${item.modeRestriction}` };
  }
  if (item.allowedModes && !item.allowedModes.includes(state.gameMode)) {
    return { success: false, message: `Unavailable in ${state.gameMode}` };
  }

  if (!inventory.consumeItem(itemId)) {
    return { success: false, message: 'You do not own this item' };
  }

  const result = applyEffect(itemId, item);
  if (result.success) {
    audio.playItemActivationSFX(item.soundType);
    ui.announceItem(result.message);
    ui.showItemToast(result.message);
    if (inventory.getActiveEffect(itemId)) {
      setActiveFlag(itemId, true);
    }
  } else {
    // Refund on failure
    inventory.addItemToInventory(itemId, 1);
  }
  return result;
}

function applyEffect(itemId, item) {
  const expiresAt = item.durationMs ? nowMs() + item.durationMs : null;

  switch (item.category) {
    case ITEM_CATEGORIES.TIME:
      if (itemId === 'timeFreeze') {
        inventory.activateEffect(itemId, { expiresAt });
        return { success: true, message: 'Time frozen for 10 seconds' };
      }
      if (itemId === 'timeRewind') {
        const newTime = state.timeLeft + (item.bonusTime || 0);
        state.setTimeLeft(newTime);
        ui.updateTimerDisplay(Math.ceil(newTime));
        return { success: true, message: `+${item.bonusTime || 0}s added` };
      }
      if (itemId === 'slowMotion') {
        inventory.activateEffect(itemId, { expiresAt, slowFactor: item.slowFactor || 0.5 });
        return { success: true, message: 'Slow Motion active' };
      }
      break;
    case ITEM_CATEGORIES.SCORE:
      if (itemId === 'doublePoints') {
        inventory.activateEffect(itemId, { expiresAt, multiplier: item.multiplier || 2 });
        return { success: true, message: 'Double Points active' };
      }
      if (itemId === 'megaBonus') {
        const gain = item.instantPoints || 0;
        state.setScore(state.score + gain);
        ui.updateScoreDisplay(state.score);
        ui.glowScore();
        return { success: true, message: `+${gain} points` };
      }
      break;
    case ITEM_CATEGORIES.SURVIVAL:
      if (itemId === 'shield') {
        inventory.activateEffect(itemId, { charges: item.charges || 1 });
        return { success: true, message: 'Shield ready' };
      }
      if (itemId === 'extraLife') {
        const newLives = state.lives + (item.livesBonus || 1);
        state.setLives(newLives);
        ui.updateLivesDisplay(newLives);
        return { success: true, message: 'Extra life added' };
      }
      if (itemId === 'secondChance') {
        inventory.activateEffect(itemId, { reviveTime: item.reviveTime || 30 });
        return { success: true, message: 'Second Chance primed' };
      }
      break;
    case ITEM_CATEGORIES.CHALLENGE:
      if (itemId === 'noSubtraction') {
        inventory.activateEffect(itemId, { expiresAt, disabledOps: item.disabledOps || ['-'] });
        return { success: true, message: 'Subtraction disabled' };
      }
      if (itemId === 'easyMode') {
        inventory.activateEffect(itemId, { expiresAt, forcedOps: item.forcedOps || ['+'] });
        return { success: true, message: 'Easy Mode active' };
      }
      break;
  }

  return { success: false, message: 'No effect applied' };
}

export function getQuickUseList() {
  return getItemsList();
}
