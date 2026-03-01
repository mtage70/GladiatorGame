// Match Screen Logic

let currentMatchState = {
    saveContext: null,
    opponentTeam: null,
    playerFormation: [null, null, null, null, null],
    opponentFormation: [null, null, null, null, null],
    selectedGladiatorId: null
};

function initializeMatchScreen(saveContext) {
    currentMatchState.saveContext = saveContext;
    currentMatchState.playerFormation = [null, null, null, null, null];
    currentMatchState.opponentFormation = [null, null, null, null, null];
    currentMatchState.selectedGladiatorId = null;

    // Hide home screen, show match screen
    document.getElementById('homeScreen').classList.add('hidden');
    document.getElementById('matchScreen').classList.remove('hidden');

    // Determine opponent
    const totalDaysElapsed = ((saveContext.year - 1) * 12 * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
    const currentWeekIndex = Math.floor(totalDaysElapsed / 7);
    const weekMatches = saveContext.schedule[currentWeekIndex];
    const myMatch = weekMatches.find(m => m.home === saveContext.teamId || m.away === saveContext.teamId);

    const opponentId = myMatch.home === saveContext.teamId ? myMatch.away : myMatch.home;
    const opponentTeamInfo = TEAMS.find(t => t.id === opponentId);
    currentMatchState.opponentTeam = opponentTeamInfo;

    document.getElementById('matchupTitle').textContent = `${saveContext.teamName} vs ${opponentTeamInfo.name}`;

    // Auto-fill opponent formation
    // Opponent roster was generated at new game creation
    const oppRoster = saveContext.opposingRosters[opponentId];
    if (oppRoster && oppRoster.length > 0) {
        // Pick top 5 (or random 5)
        for (let i = 0; i < 5; i++) {
            if (oppRoster[i]) {
                currentMatchState.opponentFormation[i] = oppRoster[i];
            }
        }
    }
    renderOpponentFormation();

    // Render player roster for selection
    renderMatchRoster();
    renderPlayerFormation();

    // Setup action buttons
    document.getElementById('startCombatBtn').onclick = startCombat;
    document.getElementById('retreatBtn').onclick = retreatFromMatch;
}

function renderOpponentFormation() {
    const slots = document.getElementById('opponentFormation').querySelectorAll('.formation-slot');
    slots.forEach((slot, index) => {
        const glad = currentMatchState.opponentFormation[index];
        slot.innerHTML = glad ? buildGladiatorCardSmall(glad) : 'Empty';
    });
}

function renderPlayerFormation() {
    const slots = document.getElementById('playerFormation').querySelectorAll('.formation-slot');
    slots.forEach((slot, index) => {
        const glad = currentMatchState.playerFormation[index];
        slot.innerHTML = glad ? buildGladiatorCardSmall(glad) : 'Click Roster to Assign';

        slot.onclick = () => {
            // Remove from formation
            if (currentMatchState.playerFormation[index]) {
                currentMatchState.playerFormation[index] = null;
                renderPlayerFormation();
                renderMatchRoster(); // re-enable in roster
            }
        };
    });
}

function renderMatchRoster() {
    const list = document.getElementById('matchRosterList');
    if (!list) return; // just in case
    list.innerHTML = '';

    // Sort or filter roster if needed. For now, show all.
    currentMatchState.saveContext.roster.forEach(glad => {
        // Check if already in formation
        const inFormation = currentMatchState.playerFormation.find(g => g && g.id === glad.id);

        const card = document.createElement('div');
        card.className = `gladiator-card-horizontal ${inFormation ? 'assigned' : ''}`;

        let portraitImg = glad.portrait ? `<img src="${glad.portrait}" alt="portrait" />` : `<div style="width:48px;height:48px;background:#333;border-radius:4px;"></div>`;

        card.innerHTML = `
            ${portraitImg}
            <div class="info">
                <div style="font-weight:bold">${glad.name} <span style="font-size:0.8rem;font-weight:normal;">${glad.surname}</span></div>
                <div style="color: var(--color-class-${glad.class.toLowerCase()}); font-size: 0.9rem;">${glad.class}</div>
                <div class="stats">
                    <span title="Strength">💪 ${glad.stats.str}</span>
                    <span title="Dexterity">🏃 ${glad.stats.dex}</span>
                    <span title="Intelligence">🧠 ${glad.stats.int}</span>
                    <span title="Wisdom">✨ ${glad.stats.wis}</span>
                </div>
            </div>
        `;

        if (!inFormation) {
            card.onclick = () => {
                // Assign to first empty slot
                const emptySlotIndex = currentMatchState.playerFormation.findIndex(g => g === null);
                if (emptySlotIndex !== -1) {
                    currentMatchState.playerFormation[emptySlotIndex] = glad;
                    renderPlayerFormation();
                    renderMatchRoster();
                } else {
                    alert("Formation is full! Click a slot to remove a gladiator first.");
                }
            };
        }

        list.appendChild(card);
    });
}

function buildGladiatorCardSmall(glad) {
    // A compacted version of the card for the formation slots
    let portraitImg = '';
    if (glad.portrait) {
        portraitImg = `<img src="${glad.portrait}" style="width: 48px; border-radius: 4px; margin-bottom: 5px;" />`;
    }
    return `
        <div style="text-align: center; font-size: 0.8rem;">
            ${portraitImg}
            <div style="font-weight: bold; color: var(--color-class-${glad.class.toLowerCase()})">${glad.class.substring(0, 3).toUpperCase()}</div>
            <div>${glad.name.substring(0, 10)}</div>
        </div>
    `;
}

// Ensure the standard card function is available or duplicated here temporarily if not globally accessible
function buildGladiatorCardMarkup(glad) {
    let portraitImg = '';
    if (glad.portrait) {
        portraitImg = `<img src="${glad.portrait}" class="gladiator-portrait" />`;
    }
    return `
        ${portraitImg}
        <div class="gladiator-class class-${glad.class.toLowerCase()}">${glad.class}</div>
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

function startCombat() {
    // Validate formation
    const count = currentMatchState.playerFormation.filter(g => g !== null).length;
    if (count === 0) {
        alert("You must assign at least one gladiator to your formation!");
        return;
    }
    alert("Combat logic not yet implemented! Returning to home.");
    retreatFromMatch(); // temporary route back
}

function retreatFromMatch() {
    document.getElementById('matchScreen').classList.add('hidden');
    document.getElementById('homeScreen').classList.remove('hidden');

    // We didn't actually fight, so technically we should advance past the match day or handle consequences.
    // For now, we'll just go back.
}
