// Item definitions for the Math Sprint shop

export const ITEM_CATEGORIES = {
  TIME: "time",
  SCORE: "score",
  SURVIVAL: "survival",
  CHALLENGE: "challenge"
};

const ITEM_CATEGORY_SVGS = {
  time: `
    <svg viewBox="0 0 24 24" role="presentation" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v4l2 2" />
      <path d="M12 2v2" />
      <path d="m4.9 4.9 1.4 1.4" />
      <path d="m19.1 4.9-1.4 1.4" />
    </svg>
  `,
  score: `
    <svg viewBox="0 0 24 24" role="presentation" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M12 3v3" />
      <path d="m19.5 12-3 0" />
      <path d="M12 18v3" />
      <path d="m4.5 12 3 0" />
    </svg>
  `,
  survival: `
    <svg viewBox="0 0 24 24" role="presentation" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2 5 5v6c0 4.4 3 8.4 7 9 4-0.6 7-4.6 7-9V5l-7-3Z" />
      <path d="M9.5 12.5 12 15l2.5-2.5" />
    </svg>
  `,
  challenge: `
    <svg viewBox="0 0 24 24" role="presentation" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 3h6" />
      <path d="m8 8 1.5 1.5" />
      <path d="m16 8-1.5 1.5" />
      <path d="M9 21h6" />
      <rect x="4" y="10" width="16" height="9" rx="2" />
      <path d="M12 6v4" />
    </svg>
  `,
  default: `
    <svg viewBox="0 0 24 24" role="presentation" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2 3 7l9 5 9-5-9-5Z" />
      <path d="M3 17l9 5 9-5" />
      <path d="M3 12l9 5 9-5" />
    </svg>
  `
};

export const ITEMS = [
  {
    id: "timeFreeze",
    name: "Time Freeze",
    category: ITEM_CATEGORIES.TIME,
    cost: 50,
    description: "Pause the timer for 10 seconds",
    durationMs: 10000,
    soundType: "freeze"
  },
  {
    id: "timeRewind",
    name: "+15 Seconds",
    category: ITEM_CATEGORIES.TIME,
    cost: 75,
    description: "Add 15 seconds to the clock",
    bonusTime: 15,
    soundType: "rewind"
  },
  {
    id: "slowMotion",
    name: "Slow Motion",
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
    category: ITEM_CATEGORIES.SCORE,
    cost: 120,
    description: "+250 points instantly",
    instantPoints: 250,
    soundType: "bonus"
  },
  {
    id: "shield",
    name: "Shield",
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 80,
    description: "Block the next wrong-answer penalty",
    charges: 1,
    soundType: "shield"
  },
  {
    id: "extraLife",
    name: "Extra Life",
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
    category: ITEM_CATEGORIES.TIME,
    cost: 85,
    description: "Add 25 seconds to the clock",
    bonusTime: 25,
    soundType: "rewind"
  },
  {
    id: "quickReflex",
    name: "Quick Reflex",
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
    category: ITEM_CATEGORIES.SCORE,
    cost: 130,
    description: "+500 points instantly (use wisely!)",
    instantPoints: 500,
    soundType: "bonus"
  },
  {
    id: "lifeVest",
    name: "Life Vest",
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
    category: ITEM_CATEGORIES.SURVIVAL,
    cost: 95,
    description: "Block 2 wrong-answer penalties",
    charges: 2,
    soundType: "shield"
  },
  {
    id: "focusMode",
    name: "Focus Mode",
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

export function getItemIconSvg(item) {
  if (!item) return ITEM_CATEGORY_SVGS.default;
  return ITEM_CATEGORY_SVGS[item.category] || ITEM_CATEGORY_SVGS.default;
}
