// Item definitions for the Math Sprint shop

export const ITEM_CATEGORIES = {
  TIME: "time",
  SCORE: "score",
  SURVIVAL: "survival",
  CHALLENGE: "challenge"
};

export const ITEMS = [
  {
    id: "timeFreeze",
    name: "Time Freeze",
    icon: "⏸️",
    category: ITEM_CATEGORIES.TIME,
    cost: 50,
    description: "Pause the timer for 10 seconds",
    durationMs: 10000,
    soundType: "freeze"
  },
  {
    id: "timeRewind",
    name: "+15 Seconds",
    icon: "⏪",
    category: ITEM_CATEGORIES.TIME,
    cost: 75,
    description: "Add 15 seconds to the clock",
    bonusTime: 15,
    soundType: "rewind"
  },
  {
    id: "slowMotion",
    name: "Slow Motion",
    icon: "🐌",
    category: ITEM_CATEGORIES.TIME,
    cost: 100,
    description: "Timer ticks at half speed for 20 seconds",
    durationMs: 20000,
    slowFactor: 0.5,
    soundType: "slow"
  },
  {
    id: "doublePoints",
    name: "Double Points",
    icon: "💰",
    category: ITEM_CATEGORIES.SCORE,
    cost: 60,
    description: "2x points for 15 seconds",
    durationMs: 15000,
    multiplier: 2,
    soundType: "boost"
  },
  {
    id: "megaBonus",
    name: "Mega Bonus",
    icon: "🎁",
    category: ITEM_CATEGORIES.SCORE,
    cost: 120,
    description: "+250 points instantly",
    instantPoints: 250,
    soundType: "bonus"
  },
  {
    id: "shield",
    name: "Shield",
    icon: "🛡️",
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 80,
    description: "Block the next wrong-answer penalty",
    charges: 1,
    soundType: "shield"
  },
  {
    id: "extraLife",
    name: "Extra Life",
    icon: "❤️",
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 90,
    description: "+1 life (Endless only)",
    livesBonus: 1,
    modeRestriction: "endless",
    soundType: "life"
  },
  {
    id: "secondChance",
    name: "Second Chance",
    icon: "🔄",
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 150,
    description: "Auto-revive with +30s when time runs out",
    reviveTime: 30,
    allowedModes: ["sprint", "survival"],
    soundType: "revive"
  },
  {
    id: "noSubtraction",
    name: "No Subtraction",
    icon: "➖🚫",
    category: ITEM_CATEGORIES.CHALLENGE,
    cost: 40,
    description: "Disable subtraction for 30 seconds",
    disabledOps: ["-"],
    durationMs: 30000,
    soundType: "modify"
  },
  {
    id: "easyMode",
    name: "Easy Mode",
    icon: "😊",
    category: ITEM_CATEGORIES.CHALLENGE,
    cost: 100,
    description: "Addition-only problems for 30 seconds",
    forcedOps: ["+"],
    durationMs: 30000,
    soundType: "easy"
  }
];

export function getItemById(id) {
  return ITEMS.find(item => item.id === id);
}

export function getItemsList() {
  return [...ITEMS];
}
