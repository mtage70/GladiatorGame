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

    const ovr = (typeof getPrimaryStat === 'function') ? getPrimaryStat(glad) : '?';

    return `
        ${portraitImg}
        <div class="card-ovr-badge ${glad.class.toLowerCase()}">${ovr}</div>
        ${battlesBadge}
        
        <!-- Target & Buff Icons (Hidden by default) -->
        <div id="${prefix}target-icon-${glad.id}" class="combat-target-icon" style="display: none; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); color: #ff4444; font-size: 1.5rem; text-shadow: 0 0 5px black; z-index: 10;">
            <span class="material-icons">my_location</span>
        </div>
        <div id="${prefix}buff-icon-${glad.id}" class="combat-buff-icon" style="display: none; position: absolute; top: 0; right: 0; color: #4caf50; font-size: 1.2rem; text-shadow: 0 0 5px black; z-index: 10;">
            <span class="material-icons" style="font-size: 1.2rem;">shield</span>
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

// Card markup for deceased gladiators
function buildDeceasedGladiatorCard(glad) {
    let portraitImg = glad.portrait ? `<img src="${glad.portrait}" alt="portrait" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:4px; filter: grayscale(100%);" />` : `<div style="width:100%;height:100%;background:#222;border-radius:4px; display:flex; align-items:center; justify-content:center; color:#555;">RIP</div>`;
    const battlesBadge = (glad.battles > 0) ? `<div class="battles-badge" style="background: #555; color: #ccc;">${glad.battles}</div>` : '';
    const ovr = (typeof getPrimaryStat === 'function') ? getPrimaryStat(glad) : '?';

    return `
        <div class="combatant-card full-slot" style="border-color: #333; filter: grayscale(100%); opacity: 0.8; width: 100px; height: 100px; flex-shrink: 0;">
            ${portraitImg}
            <div class="card-ovr-badge ${glad.class.toLowerCase()}">${ovr}</div>
            ${battlesBadge}
            <div class="combat-card-overlay">
                <div class="combat-card-name" style="font-size: 0.7rem;">${glad.name}</div>
                <div style="font-size: 0.6rem; color: #aaa; text-align: center;">RIP</div>
            </div>
        </div>
    `;
}
