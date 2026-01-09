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
    icon: "TF",
    category: ITEM_CATEGORIES.TIME,
    cost: 50,
    description: "Pause the timer for 10 seconds",
    durationMs: 10000,
    soundType: "freeze"
  },
  {
    id: "timeRewind",
    name: "+15 Seconds",
    icon: "RW",
    category: ITEM_CATEGORIES.TIME,
    cost: 75,
    description: "Add 15 seconds to the clock",
    bonusTime: 15,
    soundType: "rewind"
  },
  {
    id: "slowMotion",
    name: "Slow Motion",
    icon: "SM",
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
    icon: "DP",
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
    icon: "MB",
    category: ITEM_CATEGORIES.SCORE,
    cost: 120,
    description: "+250 points instantly",
    instantPoints: 250,
    soundType: "bonus"
  },
  {
    id: "shield",
    name: "Shield",
    icon: "SH",
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 80,
    description: "Block the next wrong-answer penalty",
    charges: 1,
    soundType: "shield"
  },
  {
    id: "extraLife",
    name: "Extra Life",
    icon: "LIFE",
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
    icon: "SC",
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
    icon: "NS",
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
    icon: "EASY",
    category: ITEM_CATEGORIES.CHALLENGE,
    cost: 100,
    description: "Addition-only problems for 30 seconds",
    forcedOps: ["+"],
    durationMs: 30000,
    soundType: "easy"
  },
  {
    id: "scoreMultiplier",
    name: "Score Multiplier",
    icon: "X3",
    category: ITEM_CATEGORIES.SCORE,
    cost: 110,
    description: "3x points for 10 seconds",
    durationMs: 10000,
    multiplier: 3,
    soundType: "boost"
  },
  {
    id: "timeLapse",
    name: "Time Lapse",
    icon: "TL",
    category: ITEM_CATEGORIES.TIME,
    cost: 85,
    description: "Add 25 seconds to the clock",
    bonusTime: 25,
    soundType: "rewind"
  },
  {
    id: "quickReflex",
    name: "Quick Reflex",
    icon: "QR",
    category: ITEM_CATEGORIES.CHALLENGE,
    cost: 70,
    description: "Problems become easier for 20 seconds",
    difficulty: -1,
    durationMs: 20000,
    soundType: "modify"
  },
  {
    id: "criticalHit",
    name: "Critical Hit",
    icon: "CH",
    category: ITEM_CATEGORIES.SCORE,
    cost: 130,
    description: "+500 points instantly (use wisely!)",
    instantPoints: 500,
    soundType: "bonus"
  },
  {
    id: "lifeVest",
    name: "Life Vest",
    icon: "LV",
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 85,
    description: "+2 lives (Endless only)",
    livesBonus: 2,
    modeRestriction: "endless",
    soundType: "life"
  },
  {
    id: "safeZone",
    name: "Safe Zone",
    icon: "SZ",
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 95,
    description: "Block 2 wrong-answer penalties",
    charges: 2,
    soundType: "shield"
  },
  {
    id: "focusMode",
    name: "Focus Mode",
    icon: "FOCUS",
    category: ITEM_CATEGORIES.CHALLENGE,
    cost: 65,
    description: "Only addition and subtraction for 25 seconds",
    forcedOps: ["+", "-"],
    durationMs: 25000,
    soundType: "modify"
  },
  {
    id: "resilience",
    name: "Resilience",
    icon: "RES",
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 110,
    description: "Reduce penalty duration by 50%",
    penaltyReduction: 0.5,
    durationMs: 30000,
    soundType: "shield"
  },
  {
    id: "perfectStrike",
    name: "Perfect Strike",
    icon: "PERF",
    category: ITEM_CATEGORIES.SCORE,
    cost: 140,
    description: "10x multiplier for next correct answer only",
    nextAnswerMultiplier: 10,
    soundType: "boost"
  }
];

export function getItemById(id) {
  return ITEMS.find(item => item.id === id);
}

export function getItemsList() {
  return [...ITEMS];
}
