export function renderAchievementsScreen() {
  if (typeof window.achievementsModule === 'undefined') return;

  const trophySvg = `
    <svg viewBox="0 0 24 24" role="presentation" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 21h8" />
      <path d="M12 17a4 4 0 0 1-4-4V5h8v8a4 4 0 0 1-4 4Z" />
      <path d="M12 17v4" />
      <path d="M7 5H5a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4" />
      <path d="M17 5h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4" />
    </svg>
  `;

  const unlockedAchievements = window.achievementsModule.getUnlocked();
  const totalCount = window.achievementsModule.getTotalCount();
  const unlockedCount = window.achievementsModule.getUnlockedCount();

  // Update stats
  const unlockedCountEl = document.getElementById('achievements-unlocked-count');
  const totalCountEl = document.getElementById('achievements-total-count');
  if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;
  if (totalCountEl) totalCountEl.textContent = totalCount;

  // Also update main Achievements button (display unlocked/total)
  const achievementsBtn = document.getElementById('achievements-btn');
  if (achievementsBtn) {
    achievementsBtn.textContent = `Achievements (${unlockedCount}/${totalCount})`;
  }

  // Render achievement cards
  const container = document.getElementById('achievements-container');
  if (!container) {
    // Update marketing labels even if container not present
    updateMarketingAchievementLabels(totalCount);
    return;
  }

  container.innerHTML = '';
  unlockedAchievements.forEach(achievement => {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.setAttribute('role', 'article');

    let rewardHTML = '';
    if (achievement.reward) {
      rewardHTML = `<div class="achievement-reward">+${achievement.reward} Sparks</div>`;
    }

    card.innerHTML = `
      <div class="achievement-icon" aria-hidden="true">${trophySvg}</div>
      <h3>${achievement.title}</h3>
      <p class="achievement-description">${achievement.description}</p>
      ${rewardHTML}
    `;
    container.appendChild(card);
  });

  if (unlockedAchievements.length === 0) {
    container.innerHTML = '<p>No achievements unlocked yet. Keep playing!</p>';
  }

  // Update marketing labels (e.g., "40+" -> "50+" when thresholds hit)
  updateMarketingAchievementLabels(totalCount);
}

/**
 * Compute marketing label based on total achievement count and update UI strings
 */
export function updateMarketingAchievementLabels(totalCountOverride) {
  if (typeof window.achievementsModule === 'undefined' && typeof totalCountOverride === 'undefined') return;
  const total = typeof totalCountOverride !== 'undefined' ? totalCountOverride : window.achievementsModule.getTotalCount();

  // Define marketing thresholds (ascending)
  const thresholds = [40, 50, 60, 75, 100, 200, 500];
  let label = '40+'; // default
  for (let i = 0; i < thresholds.length; i++) {
    if (total >= thresholds[i]) label = `${thresholds[i]}+`;
  }

  // Update all marked elements
  const els = document.querySelectorAll('.marketing-achievements');
  els.forEach(el => el.textContent = label);

  // Update meta description if present (replace any N+ pattern)
  const meta = document.querySelector('meta[property="og:description"]');
  if (meta && meta.content) {
    if (!meta.dataset.original) meta.dataset.original = meta.content;
    meta.content = meta.dataset.original.replace(/\d+\+/, label);
  }
}

