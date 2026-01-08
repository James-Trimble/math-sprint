/**
 * Message of the Day (MOTD) System
 * Displays important announcements to players on app load
 */

const STORAGE_KEY = 'mathSprintDismissedMOTDs';
const MAX_DISMISSED_HISTORY = 50;

/**
 * Fetch MOTD from server
 * @returns {Promise<Object|null>} MOTD data or null if unavailable
 */
async function fetchMOTD() {
  try {
    // Cache-busting to ensure fresh content
    const response = await fetch(`/motd.json?t=${Date.now()}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch MOTD:', error);
    return null;
  }
}

/**
 * Check if MOTD has been dismissed
 * @param {string} id - MOTD identifier
 * @returns {boolean} True if already dismissed
 */
function isDismissed(id) {
  try {
    const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return dismissed.includes(id);
  } catch (error) {
    return false;
  }
}

/**
 * Mark MOTD as dismissed
 * @param {string} id - MOTD identifier
 */
function markDismissed(id) {
  try {
    let dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    dismissed.push(id);
    
    // Keep only the last N dismissed IDs to avoid storage bloat
    if (dismissed.length > MAX_DISMISSED_HISTORY) {
      dismissed = dismissed.slice(-MAX_DISMISSED_HISTORY);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  } catch (error) {
    console.warn('Failed to save dismissed MOTD:', error);
  }
}

/**
 * Check if MOTD is currently valid based on date range
 * @param {Object} motd - MOTD data
 * @returns {boolean} True if within valid date range
 */
function isValidDate(motd) {
  const now = new Date();
  
  if (motd.startDate) {
    const start = new Date(motd.startDate);
    if (now < start) return false;
  }
  
  if (motd.endDate) {
    const end = new Date(motd.endDate);
    if (now > end) return false;
  }
  
  return true;
}

/**
 * Format message text with basic markdown-style formatting
 * @param {string} text - Raw message text
 * @returns {string} HTML-formatted text
 */
function formatMessage(text) {
  if (!text) return '';
  
  // Escape HTML first
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Apply basic formatting
  return escaped
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #4ecdc4; text-decoration: underline; font-weight: 600;">$1</a>') // [text](url) links
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/\n/g, '<br>'); // Line breaks
}

/**
 * Create and display MOTD modal
 * @param {Object} motd - MOTD data
 */
function displayMOTD(motd) {
  const dialog = document.getElementById('motd-dialog');
  if (!dialog) return;
  
  const titleEl = document.getElementById('motd-title');
  const messageEl = document.getElementById('motd-message');
  const closeBtn = document.getElementById('motd-close-btn');
  const dismissBtn = document.getElementById('motd-dismiss-btn');
  
  // Set content
  if (titleEl) titleEl.textContent = motd.title || 'Announcement';
  if (messageEl) messageEl.innerHTML = formatMessage(motd.message);
  
  // Show modal with slight delay for smooth UX
  setTimeout(() => {
    dialog.showModal();
    
    // Focus the dismiss button for keyboard accessibility
    if (dismissBtn) dismissBtn.focus();
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Announcement: ${motd.title}`;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }, 500);
  
  // Handle dismiss
  const handleDismiss = () => {
    markDismissed(motd.id);
    dialog.close();
  };
  
  // Event listeners
  if (closeBtn) {
    closeBtn.addEventListener('click', handleDismiss, { once: true });
  }
  if (dismissBtn) {
    dismissBtn.addEventListener('click', handleDismiss, { once: true });
  }
  
  // Escape key handler (dialog handles this natively, but we'll track dismissal)
  dialog.addEventListener('close', () => {
    if (!isDismissed(motd.id)) {
      markDismissed(motd.id);
    }
  }, { once: true });
}

/**
 * Initialize MOTD system
 * Fetches and displays MOTD if applicable
 */
export async function initMOTD() {
  const motd = await fetchMOTD();
  
  if (!motd || !motd.id) {
    return; // No MOTD available
  }
  
  // Check if already dismissed
  if (isDismissed(motd.id)) {
    return;
  }
  
  // Check date validity
  if (!isValidDate(motd)) {
    return;
  }
  
  // Check dismissible flag
  if (motd.dismissible === false) {
    // Force display even if dismissed (use sparingly)
  }
  
  // Display the MOTD
  displayMOTD(motd);
}

// Make available globally for manual testing
window.motdModule = { initMOTD, fetchMOTD };
