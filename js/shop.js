// js/shop.js

// 10 Points = 1 Spark
const EXCHANGE_RATE = 10;

export function calculateSparks(score) {
    // Prevent errors if score is weird
    if (!score || score < 0) return 0;
    return Math.floor(score / EXCHANGE_RATE);
}

// Placeholder for future buying logic
export function buyItem(itemId, cost) {
    return false; 
}