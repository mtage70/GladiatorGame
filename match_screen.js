// Match Screen Logic

let currentMatchState = {
    saveContext: null,
    opponentTeam: null,
    playerFormation: [null, null, null, null, null],
    opponentFormation: [null, null, null, null, null],
    selectedGladiatorId: null
};

function initializeMatchScreen(saveContext) {
    // Force a fresh pull from localStorage to ensure any recently recruited gladiators are included.
    const freshContext = JSON.parse(localStorage.getItem('gladiatorSaveContext')) || saveContext;

    currentMatchState.saveContext = freshContext;
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

    const oppTeamData = saveContext.opposingRosters[opponentId];
    // Fallback for pre-patch saves that still use raw arrays
    const oppRoster = oppTeamData ? (oppTeamData.roster || oppTeamData) : [];
    if (oppRoster && oppRoster.length > 0) {
        // Sort roster by suitability for frontline (highest HP first)
        let sortedRoster = oppRoster.slice().sort((a, b) => {
            const hpA = a.maxHp || (30 + a.stats.str * 2);
            const hpB = b.maxHp || (30 + b.stats.str * 2);
            return hpB - hpA;
        });

        // Pick top 5 gladiators
        let activeFighters = sortedRoster.slice(0, 5);

        // Separate them into Tanks vs Squishies
        // Clerics and Mages are inherently squishy backliners. Warriors/Paladins are tanks.
        let tanks = [];
        let squishies = [];
        let flexible = [];

        activeFighters.forEach(g => {
            if (g.class === 'Mage' || g.class === 'Cleric') {
                squishies.push(g);
            } else if (g.class === 'Warrior' || g.class === 'Paladin') {
                tanks.push(g);
            } else {
                flexible.push(g);
            }
        });

        // Re-sort to prioritize highest HP tank, lowest HP squishy
        tanks.sort((a, b) => (b.maxHp || 0) - (a.maxHp || 0));
        squishies.sort((a, b) => (a.maxHp || 0) - (b.maxHp || 0));

        // Opponent Formation:
        // Index 0: Frontline
        // Index 1: Backline
        // Index 2, 3, 4: Midline

        // 1. Assign Frontline (highest HP tank, or flexible, or anyone)
        if (tanks.length > 0) currentMatchState.opponentFormation[0] = tanks.shift();
        else if (flexible.length > 0) currentMatchState.opponentFormation[0] = flexible.shift();
        else currentMatchState.opponentFormation[0] = squishies.shift();

        // 2. Assign Backline (lowest HP squishy, or flexible, or anyone)
        if (squishies.length > 0) currentMatchState.opponentFormation[1] = squishies.shift();
        else if (flexible.length > 0) currentMatchState.opponentFormation[1] = flexible.shift();
        else currentMatchState.opponentFormation[1] = tanks.shift();

        // 3. Assign Midline (everyone else)
        let remaining = [...tanks, ...flexible, ...squishies];
        currentMatchState.opponentFormation[2] = remaining.shift() || null;
        currentMatchState.opponentFormation[3] = remaining.shift() || null;
        currentMatchState.opponentFormation[4] = remaining.shift() || null;
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
        slot.innerHTML = glad ? buildGladiatorCardSmall(glad) : 'Drag or Click to Assign';

        slot.onclick = () => {
            // Remove from formation
            if (currentMatchState.playerFormation[index]) {
                currentMatchState.playerFormation[index] = null;
                renderPlayerFormation();
                renderMatchRoster(); // re-enable in roster
            }
        };

        // Drag and Drop Event Listeners
        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow dropping
            slot.style.borderColor = 'var(--color-gold-primary)';
        });

        slot.addEventListener('dragleave', () => {
            slot.style.borderColor = ''; // Reset on leave
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.style.borderColor = ''; // Reset border

            const gladId = e.dataTransfer.getData('text/plain');
            if (gladId) {
                // Find gladiator in context roster
                const contextGlad = currentMatchState.saveContext.roster.find(g => g.id === gladId);

                if (contextGlad) {
                    // Check if already in another slot and remove them from it first
                    const existingIndex = currentMatchState.playerFormation.findIndex(g => g && g.id === gladId);
                    if (existingIndex !== -1) {
                        currentMatchState.playerFormation[existingIndex] = null;
                    }

                    // Assign to this new slot
                    currentMatchState.playerFormation[index] = contextGlad;

                    renderPlayerFormation();
                    renderMatchRoster();
                }
            }
        });
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

        // Enable dragging if not in formation
        if (!inFormation) {
            card.draggable = true;
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', glad.id);
                e.dataTransfer.effectAllowed = 'move';
                card.style.opacity = '0.5'; // Visual feedback while dragging
            });
            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
            });
        }

        let portraitImg = glad.portrait ? `<img src="${glad.portrait}" alt="portrait" />` : `<div style="width:48px;height:48px;background:#333;border-radius:4px;"></div>`;

        const maxHp = glad.maxHp || (30 + (glad.stats.str * 2));
        const currentHp = glad.hp !== undefined ? glad.hp : maxHp;
        const hpPercent = Math.max(0, Math.floor((currentHp / maxHp) * 100));

        card.innerHTML = `
            ${portraitImg}
            <div class="info">
                <div style="font-weight:bold">${glad.name} <span style="font-size:0.8rem;font-weight:normal;">${glad.surname}</span></div>
                <span class="glad-class ${glad.class.toLowerCase()}" style="margin: 4px 0;">${glad.class}</span>
                <div class="hp-bar-container" style="height: 12px; width: 100%; margin-top: 4px;">
                    <div class="hp-fill" style="width: ${hpPercent}%"></div>
                    <div class="hp-text">${currentHp} / ${maxHp}</div>
                </div>
                <div class="stats" style="margin-top: 4px;">
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
    // We now share the same widget builder as the Combat Screen
    let innerContent = '';
    if (typeof buildSquareGladiatorCard === 'function') {
        innerContent = buildSquareGladiatorCard(glad, 'match-');
    } else {
        // Fallback if combat script isn't loaded for some reason
        let portraitImg = '';
        if (glad.portrait) {
            portraitImg = `<img src="${glad.portrait}" style="width: 48px; border-radius: 4px; margin-bottom: 5px;" />`;
        }
        innerContent = `
            <div style="text-align: center; font-size: 0.8rem; height: 100%; display: flex; flex-direction: column; justify-content: center;">
                ${portraitImg}
                <span class="glad-class ${glad.class.toLowerCase()}" style="font-size: 0.7rem; padding: 1px 4px; margin: 4px 0;">${glad.class.substring(0, 3).toUpperCase()}</span>
                <div>${glad.name.substring(0, 10)}</div>
            </div>
        `;
    }

    return `<div class="combatant-card full-slot">${innerContent}</div>`;
}

// Ensure the standard card function is available or duplicated here temporarily if not globally accessible
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

function startCombat() {
    // Validate formation
    const count = currentMatchState.playerFormation.filter(g => g !== null).length;
    if (count === 0) {
        alert("You must assign at least one gladiator to your formation!");
        return;
    }

    if (typeof initializeCombat !== 'function') {
        alert("Combat script not loaded!");
        return;
    }

    // Attach formationIndex to gladiators so combat knows where to place them
    const pForm = currentMatchState.playerFormation.map((g, i) => {
        if (g) g.formationIndex = i;
        return g;
    });
    const oForm = currentMatchState.opponentFormation.map((g, i) => {
        if (g) g.formationIndex = i;
        return g;
    });

    // Call global initializeCombat
    initializeCombat(
        pForm,
        oForm,
        currentMatchState.saveContext,
        currentMatchState.opponentTeam
    );
}

function retreatFromMatch() {
    document.getElementById('matchScreen').classList.add('hidden');
    document.getElementById('homeScreen').classList.remove('hidden');

    // We didn't actually fight, so technically we should advance past the match day or handle consequences.
    // For now, we'll just go back.
}
