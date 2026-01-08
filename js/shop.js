import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio-hub.js';
import * as inventory from './inventory.js';
import { getItemsList, getItemById, ITEM_CATEGORIES } from './items.js';
import { checkAndUnlockAchievement } from './game-achievements.js';

// 10 Points = 1 Spark
const EXCHANGE_RATE = 10;

let activeTab = ITEM_CATEGORIES.TIME; // Default to TIME tab

export function calculateSparks(score) {
    if (!score || score < 0) return 0;
    return Math.floor(score / EXCHANGE_RATE);
}

export function canAfford(itemId) {
    const item = getItemById(itemId);
    if (!item) return false;
    return state.sparksWallet >= item.cost;
}

export function purchaseItem(itemId) {
    const item = getItemById(itemId);
    if (!item) {
        ui.announceShop('Item not found');
        audio.playUIErrorSound();
        return { success: false, message: 'Item not found' };
    }

    if (!canAfford(itemId)) {
        const message = `Not enough Sparks for ${item.name}`;
        ui.announceShop(message);
        audio.playPurchaseFailSFX();
        return { success: false, message };
    }

    if (!state.deductSparks(item.cost)) {
        const message = `Failed to deduct Sparks`;
        ui.announceShop(message);
        audio.playUIErrorSound();
        return { success: false, message };
    }
    
    // Track achievement progress
    const totalSpent = parseInt(localStorage.getItem('mathSprintTotalSpent') || '0') + item.cost;
    localStorage.setItem('mathSprintTotalSpent', totalSpent.toString());
    
    // Check first purchase achievement
    if (totalSpent === item.cost) {
        checkAndUnlockAchievement('firstPurchase');
    }
    
    // Check spending thresholds
    if (totalSpent >= 500) {
        checkAndUnlockAchievement('bigSpender');
    }
    if (totalSpent >= 2000) {
        checkAndUnlockAchievement('shopAddict');
    }
    
    // Check item collector achievement (at least one of each category)
    const purchasedCategories = new Set();
    const allItems = getItemsList();
    allItems.forEach(itm => {
        if (inventory.getItemCount(itm.id) > 0) {
            purchasedCategories.add(itm.category);
        }
    });
    if (purchasedCategories.size >= Object.keys(ITEM_CATEGORIES).length) {
        checkAndUnlockAchievement('itemCollector');
    }
    
    const newCount = inventory.addItemToInventory(itemId, 1);
    
    // Check item hoarder achievement
    const totalItems = allItems.reduce((sum, itm) => sum + (inventory.getItemCount(itm.id) || 0), 0);
    if (totalItems >= 50) {
        checkAndUnlockAchievement('itemHoarder');
    }
    
    ui.walletBalanceEl.textContent = state.sparksWallet;
    ui.announceShop(`Purchased ${item.name}`);
    audio.playPurchaseSuccessSFX(item.category);
    return { success: true, message: `Purchased ${item.name}`, owned: newCount };
}

export function getActiveTab() {
    return activeTab;
}

export function setActiveTab(category) {
    activeTab = category;
    renderShopItems();
}

export function renderShopTabs() {
    if (!ui.shopTabsEl) return;
    ui.shopTabsEl.innerHTML = '';

    const tabs = [ITEM_CATEGORIES.TIME, ITEM_CATEGORIES.SCORE, ITEM_CATEGORIES.SURVIVAL, ITEM_CATEGORIES.CHALLENGE];
    const tabLabels = {
        [ITEM_CATEGORIES.TIME]: 'Time',
        [ITEM_CATEGORIES.SCORE]: 'Score',
        [ITEM_CATEGORIES.SURVIVAL]: 'Survival',
        [ITEM_CATEGORIES.CHALLENGE]: 'Challenge'
    };

    tabs.forEach(category => {
        const isActive = activeTab === category;
        const tabBtn = document.createElement('button');
        tabBtn.className = `shop-tab-btn ${isActive ? 'active' : ''}`;
        tabBtn.textContent = tabLabels[category];
        tabBtn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tabBtn.setAttribute('data-tab', category);
        tabBtn.setAttribute('role', 'tab');
        tabBtn.addEventListener('click', () => {
            setActiveTab(category);
            // Update all tabs' aria-selected
            ui.shopTabsEl.querySelectorAll('[role="tab"]').forEach(t => {
                t.setAttribute('aria-selected', t.getAttribute('data-tab') === category ? 'true' : 'false');
                t.classList.toggle('active', t.getAttribute('data-tab') === category);
            });
        });

        // Keyboard navigation support
        tabBtn.addEventListener('keydown', (e) => {
            const allTabs = Array.from(ui.shopTabsEl.querySelectorAll('[role="tab"]'));
            const currentIndex = allTabs.indexOf(tabBtn);

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextTab = allTabs[(currentIndex + 1) % allTabs.length];
                const nextCategory = nextTab.getAttribute('data-tab');
                setActiveTab(nextCategory);
                nextTab.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevTab = allTabs[(currentIndex - 1 + allTabs.length) % allTabs.length];
                const prevCategory = prevTab.getAttribute('data-tab');
                setActiveTab(prevCategory);
                prevTab.focus();
            }
        });

        ui.shopTabsEl.appendChild(tabBtn);
    });
}

export function renderShopItems() {
    if (!ui.shopGridEl) return;
    const items = getItemsList().filter(item => item.category === activeTab);
    ui.shopGridEl.innerHTML = '';

    if (items.length === 0) {
        ui.shopGridEl.innerHTML = '<p>No items in this category</p>';
        return;
    }

    items.forEach(item => {
        const owned = inventory.getItemCount(item.id);
        const affordable = canAfford(item.id);
        const card = document.createElement('div');
        card.className = 'shop-item';
        card.setAttribute('role', 'article');
        card.innerHTML = `
            <div class="item-icon" aria-hidden="true">${item.icon}</div>
            <strong>${item.name}</strong>
            <p class="item-description">${item.description}</p>
            <div class="item-footer">
                <span class="item-cost">⚡ ${item.cost}</span>
                <button class="buy-btn" data-item-id="${item.id}" ${affordable ? '' : 'disabled'} aria-label="Buy ${item.name}">Buy</button>
            </div>
            <span class="item-owned">Owned: ${owned}</span>
        `;
        ui.shopGridEl.appendChild(card);
    });

    ui.shopGridEl.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-item-id');
            const result = purchaseItem(itemId);
            if (result.success) {
                renderShopItems(); // Re-render to update owned count and affordability
            }
        });
    });
}

export function initializeShop() {
    renderShopTabs();
    renderShopItems();
}