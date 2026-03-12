// js/engine/iap.js

const PREMIUM_SKU = 'premium_upgrade';
let isPremiumUser = false;

// Basic mocked Digital Goods service for local testing
const mockDigitalGoodsService = {
    getDetails: async (skus) => [
        {
            itemId: PREMIUM_SKU,
            title: "Remove Ads & Premium Upgrade",
            description: "Permanently removes ads from the Gladiator arena.",
            price: { value: "1.99", currency: "USD" }
        }
    ]
};

async function checkPremiumStatus() {
    isPremiumUser = localStorage.getItem('isPremium') === 'true';
    applyPremiumUI();

    // If not premium locally, verify with Play Billing if available
    if (!isPremiumUser && 'getDigitalGoodsService' in window) {
        try {
            const service = await window.getDigitalGoodsService("https://play.google.com/billing");
            if (service) {
                const purchases = await service.listPurchases();
                for (const p of purchases) {
                    if (p.itemId === PREMIUM_SKU && p.purchaseState === 'purchased') {
                        consumePurchase(service, p.purchaseToken);
                        grantPremium();
                        return;
                    }
                }
            }
        } catch (error) {
            console.error("Digital Goods API check failed:", error);
        }
    }
}

async function consumePurchase(service, purchaseToken) {
    try {
        await service.acknowledge(purchaseToken, "onetime");
    } catch (error) {
        console.error("Failed to acknowledge purchase:", error);
    }
}

function applyPremiumUI() {
    const removeAdsBtnMainMenu = document.getElementById('removeAdsBtnMainMenu');
    const removeAdsBtnHome = document.getElementById('removeAdsBtnHome');

    if (isPremiumUser) {
        if (removeAdsBtnMainMenu) removeAdsBtnMainMenu.style.display = 'none';
        if (removeAdsBtnHome) removeAdsBtnHome.style.display = 'none';
    } else {
        if (removeAdsBtnMainMenu) removeAdsBtnMainMenu.style.display = 'block';
        if (removeAdsBtnHome) removeAdsBtnHome.style.display = 'flex';
    }
}

function showInterstitialAd() {
    return new Promise((resolve) => {
        if (isPremiumUser) {
            resolve();
            return;
        }

        // Only show ad every 2 matches
        let matchesSinceLastAd = parseInt(localStorage.getItem('matchesSinceLastAd') || '0', 10);
        matchesSinceLastAd++;

        if (matchesSinceLastAd < 2) {
            localStorage.setItem('matchesSinceLastAd', matchesSinceLastAd);
            resolve();
            return;
        }

        // Reset the counter
        localStorage.setItem('matchesSinceLastAd', '0');

        const adModal = document.getElementById('interstitialAdModal');
        const skipBtn = document.getElementById('skipAdBtn');
        const countdownTimer = document.getElementById('adCountdown');

        if (!adModal || !skipBtn || !countdownTimer) {
            resolve(); // Safety fallback
            return;
        }

        const adTextContainer = countdownTimer.parentNode;

        adModal.classList.remove('hidden');
        skipBtn.style.opacity = '0.5';
        skipBtn.style.pointerEvents = 'none';
        skipBtn.textContent = 'Skip Ad';

        let timeLeft = 3;
        countdownTimer.textContent = timeLeft;

        const interval = setInterval(() => {
            timeLeft--;
            if (countdownTimer && countdownTimer.parentNode) {
                countdownTimer.textContent = timeLeft;
            }

            if (timeLeft <= 0) {
                clearInterval(interval);
                if (adTextContainer) {
                    adTextContainer.innerHTML = "You can now skip.";
                }
                skipBtn.style.opacity = '1';
                skipBtn.style.pointerEvents = 'auto';
            }
        }, 1000);

        skipBtn.onclick = () => {
            clearInterval(interval);
            adModal.classList.add('hidden');
            // Reset for next time
            if (adTextContainer) {
                adTextContainer.innerHTML = 'Video returning in <span id="adCountdown">3</span>...';
            }
            resolve();
        };
    });
}

function grantPremium() {
    isPremiumUser = true;
    localStorage.setItem('isPremium', 'true');
    applyPremiumUI();
    alert("Premium Unlocked! Ads have been removed.");
}

async function purchasePremium() {
    if (isPremiumUser) {
        alert("You already own the Premium upgrade!");
        return;
    }

    try {
        // 1. Digital Goods API (for Android TWA)
        if ('getDigitalGoodsService' in window) {
            const service = await window.getDigitalGoodsService("https://play.google.com/billing");
            if (service) {
                const details = await service.getDetails([PREMIUM_SKU]);
                if (details.length === 0) {
                    throw new Error("Product details not found. Make sure the SKU is created in Play Console.");
                }

                const request = new PaymentRequest([{
                    supportedMethods: "https://play.google.com/billing",
                    data: { sku: PREMIUM_SKU }
                }]);

                const response = await request.show();
                await response.complete('success');

                await consumePurchase(service, response.details.purchaseToken);
                grantPremium();
                return;
            }
        }

        // 2. Fallback Mock for Local Testing
        console.log("Play Billing not available. Using local mock purchase...");
        const confirmed = confirm(`[Mock Purchase]\n\nBuy "Remove Ads" for $1.99?\n\n(This is a test prompt because you are not running inside the Android TWA)`);
        if (confirmed) {
            grantPremium();
        }

    } catch (error) {
        console.error("Purchase failed:", error);
        alert("Purchase flow was cancelled or failed.");
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkPremiumStatus();
});
