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
      li.textContent = note;
      listContainer.appendChild(li);
    });
  }
}
