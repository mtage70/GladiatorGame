// Shared UI component builders

// Utility function to build the square formation widget (used in Combat and Match Prep)
function buildSquareGladiatorCard(glad, prefix = '') {
    let portraitImg = glad.portrait ? `<img src="${glad.portrait}" alt="portrait" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:4px;" />` : `<div style="width:100%;height:100%;background:#333;border-radius:4px;"></div>`;
    const battlesBadge = (glad.battles > 0) ? `<div class="battles-badge">${glad.battles}</div>` : '';

    const hasHp = glad.hp !== undefined && glad.maxHp !== undefined;
    const hpPercent = hasHp ? Math.max(0, Math.floor((glad.hp / glad.maxHp) * 100)) : 100;

    const hpHtml = hasHp
        ? `<div class="hp-text" id="${prefix}hp-text-${glad.id}">${glad.hp} / ${glad.maxHp}</div>`
        : ``;

    return `
        ${portraitImg}
        ${battlesBadge}
        <div class="combat-card-hover-stats">
            <div>STR: ${glad.stats.str}</div>
            <div>DEX: ${glad.stats.dex}</div>
            <div>INT: ${glad.stats.int}</div>
            <div>WIS: ${glad.stats.wis}</div>
            <div>CON: ${glad.stats.con || 25}</div>
        </div>
        <div class="combat-card-overlay">
            <div class="combat-card-name">${glad.name}</div>
            <div class="hp-bar-container" style="height: 12px;">
                <div class="hp-fill" id="${prefix}hp-fill-${glad.id}" style="width: ${hpPercent}%"></div>
                ${hpHtml}
            </div>
        </div>
    `;
}

function buildGladiatorCardSmall(glad, side = 'player') {
    let innerContent = buildSquareGladiatorCard(glad, 'match-');
    const borderColor = side === 'opponent' ? currentMatchState.opponentTeam.primaryColor : 'var(--team-primary)';
    return `<div class="combatant-card full-slot" style="border-color: ${borderColor};">${innerContent}</div>`;
}

// Standard card markup for formation selection
function buildGladiatorCardMarkup(glad) {
    let portraitImg = '';
    if (glad.portrait) {
        portraitImg = `<img src="${glad.portrait}" class="gladiator-portrait" />`;
    }
    return `
        ${portraitImg}
        <span class="glad-class ${glad.class.toLowerCase()}" style="font-size: 0.8rem; margin: 4px auto;">${glad.class}</span>
        <div class="gladiator-name">${glad.name}</div>
        <div class="gladiator-name" style="font-size:0.8rem">${glad.surname}</div>
        <div class="gladiator-stats">
            <span>💪 ${glad.stats.str}</span>
            <span>🏃 ${glad.stats.dex}</span>
            <span>🧠 ${glad.stats.int}</span>
            <span>✨ ${glad.stats.wis}</span>
        </div>
                `;
}
