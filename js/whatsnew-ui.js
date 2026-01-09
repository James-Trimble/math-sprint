import { VERSION_INFO } from './whatsnew.js';

export function populateWhatsNew() {
  const headingEl = document.getElementById('whats-new-heading');
  if (headingEl) headingEl.textContent = VERSION_INFO.heading;

  const contentP = document.querySelector('#whats-new-popup .popup-content p');
  if (contentP) contentP.textContent = VERSION_INFO.tagline;

  const listContainer = document.querySelector('#whats-new-popup ul');
  if (listContainer) {
    listContainer.innerHTML = '';
    VERSION_INFO.notes.forEach(note => {
      const li = document.createElement('li');
      // Replace default '40+' token in notes with dynamic marketing label
      const label = (window.achievementsModule && typeof window.achievementsModule.getTotalCount === 'function') ?
        (() => {
          const total = window.achievementsModule.getTotalCount();
          const thresholds = [40,50,60,75,100,200,500];
          let l = '40+';
          for (let i = 0; i < thresholds.length; i++) { if (total >= thresholds[i]) l = `${thresholds[i]}+`; }
          return l;
        })() : '40+';
      li.textContent = note.replace(/40\+/, label);
      listContainer.appendChild(li);
    });
  }
}
