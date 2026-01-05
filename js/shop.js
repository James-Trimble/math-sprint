import * as state from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import * as inventory from './inventory.js';
import { getItemsList, getItemById } from './items.js';

// 10 Points = 1 Spark
const EXCHANGE_RATE = 10;

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
    const newCount = inventory.addItemToInventory(itemId, 1);
    ui.walletBalanceEl.textContent = state.sparksWallet;
    ui.announceShop(`Purchased ${item.name}`);
    audio.playPurchaseSuccessSFX(item.category);
    return { success: true, message: `Purchased ${item.name}`, owned: newCount };
}

export function renderShopItems() {
    if (!ui.shopGridEl) return;
    const items = getItemsList();
    ui.shopGridEl.innerHTML = '';

    items.forEach(item => {
        const owned = inventory.getItemCount(item.id);
        const affordable = canAfford(item.id);
        const card = document.createElement('div');
        card.className = 'shop-item';
        card.innerHTML = `
            <div class="item-icon" aria-hidden="true">${item.icon}</div>
            <strong>${item.name}</strong>
            <p class="item-description">${item.description}</p>
            <div class="item-footer">
                <span class="item-cost">⚡ ${item.cost}</span>
                <button class="buy-btn" data-item-id="${item.id}" ${affordable ? '' : 'disabled'}>Buy</button>
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
                renderShopItems();
            }
        });
    });
}