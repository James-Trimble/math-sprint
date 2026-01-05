// Inventory persistence and active effect tracking

const INVENTORY_KEY = "mathSprintInventoryV1";
const INVENTORY_VERSION = 1;

function getEmptyInventory() {
  return {};
}

export function loadInventory() {
  const raw = localStorage.getItem(INVENTORY_KEY);
  if (!raw) return getEmptyInventory();
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (parsed.version === INVENTORY_VERSION && parsed.items) {
        return parsed.items;
      }
      if (!parsed.version && parsed.items) {
        return parsed.items; // migrate legacy structure
      }
      if (!parsed.version && typeof parsed === "object") {
        return parsed; // legacy plain object
      }
    }
  } catch (err) {
    console.warn("Inventory load failed, resetting", err);
  }
  return getEmptyInventory();
}

export function saveInventory(items) {
  const payload = { version: INVENTORY_VERSION, items };
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(payload));
}

export function addItemToInventory(itemId, quantity = 1) {
  const items = loadInventory();
  items[itemId] = (items[itemId] || 0) + quantity;
  saveInventory(items);
  return items[itemId];
}

export function consumeItem(itemId) {
  const items = loadInventory();
  if (!items[itemId]) return false;
  items[itemId] = Math.max(0, items[itemId] - 1);
  saveInventory(items);
  return true;
}

export function getItemCount(itemId) {
  const items = loadInventory();
  return items[itemId] || 0;
}

export function getInventoryLookup() {
  const snapshot = loadInventory();
  return (id) => snapshot[id] || 0;
}

// Active effects (session-only)
const activeEffects = new Map();

export function activateEffect(itemId, data) {
  activeEffects.set(itemId, data);
}

export function deactivateEffect(itemId) {
  activeEffects.delete(itemId);
}

export function getActiveEffect(itemId) {
  return activeEffects.get(itemId);
}

export function getAllActiveEffects() {
  return Array.from(activeEffects.entries());
}

export function clearActiveEffects() {
  activeEffects.clear();
}
