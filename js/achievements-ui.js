export function renderAchievementsScreen() {
  if (typeof window.achievementsModule === 'undefined') return;

  const unlockedAchievements = window.achievementsModule.getUnlocked();
  const totalCount = window.achievementsModule.getTotalCount();
  const unlockedCount = window.achievementsModule.getUnlockedCount();

  // Update stats
  const unlockedCountEl = document.getElementById('achievements-unlocked-count');
  const totalCountEl = document.getElementById('achievements-total-count');
  if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;
  if (totalCountEl) totalCountEl.textContent = totalCount;

  // Render achievement cards
  const container = document.getElementById('achievements-container');
  if (!container) return;

  container.innerHTML = '';
  unlockedAchievements.forEach(achievement => {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.setAttribute('role', 'article');

    let rewardHTML = '';
    if (achievement.reward) {
      rewardHTML = `<div class="achievement-reward">+${achievement.reward} ⚡</div>`;
    }

    card.innerHTML = `
      <div class="achievement-icon">🏆</div>
      <h3>${achievement.title}</h3>
      <p class="achievement-description">${achievement.description}</p>
      ${rewardHTML}
    `;
    container.appendChild(card);
  });

  if (unlockedAchievements.length === 0) {
    container.innerHTML = '<p>No achievements unlocked yet. Keep playing!</p>';
  }
}
