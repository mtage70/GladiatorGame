// Utility functions shared across the game

// Calculate contrast background color for team names
function getContrastColor(hexColor) {
    if (!hexColor) return 'rgba(0, 0, 0, 0.6)';
    // Remove hash
    hexColor = hexColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return dark background for light colors, light background for dark colors
    return luminance > 0.5 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)';
}

function calculateMaxHp(glad) {
    let baseHp = Math.floor(100 + ((glad.stats.con || 25) * 2));
    if (glad.class === 'Warrior') baseHp += 25;
    if (glad.class === 'Paladin') baseHp += 50;
    return baseHp;
}
