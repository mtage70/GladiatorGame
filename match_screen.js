// Match Screen Logic

let currentMatchState = {
    saveContext: null,
    opponentTeam: null,
    playerFormation: [null, null, null, null, null],
    opponentFormation: [null, null, null, null, null],
    selectedGladiatorId: null,
    highlightedSlotIndex: -1,
    sortBy: 'ovr',
    sortAscending: false
};

function initializeMatchScreen(saveContext) {
    // Force a fresh pull from localStorage to ensure any recently recruited gladiators are included.
    const freshContext = JSON.parse(localStorage.getItem('gladiatorSaveContext')) || saveContext;

    currentMatchState.saveContext = freshContext;
    currentMatchState.opponentFormation = [null, null, null, null, null];
    currentMatchState.selectedGladiatorId = null;

    // Restore saved formation, leaving slots blank if gladiator is dead/missing
    if (freshContext.savedFormation && freshContext.savedFormation.length === 5) {
        currentMatchState.playerFormation = freshContext.savedFormation.map(id => {
            if (!id) return null;
            return freshContext.roster.find(g => g.id === id) || null;
        });
    } else {
        currentMatchState.playerFormation = [null, null, null, null, null];
    }

    currentMatchState.highlightedSlotIndex = currentMatchState.playerFormation.findIndex(g => g === null);

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

    const isHome = myMatch.home === saveContext.teamId;
    document.getElementById('matchupTitle').innerHTML = `
        <span class="team-header-container">
            <img src="${isHome ? saveContext.teamLogo : opponentTeamInfo.logo}" class="team-logo-small" alt="${isHome ? saveContext.teamName : opponentTeamInfo.name} Logo">
            ${isHome ? saveContext.teamName : opponentTeamInfo.name}
        </span>
        <span style="margin: 0 15px;">vs</span>
        <span class="team-header-container">
            <img src="${!isHome ? saveContext.teamLogo : opponentTeamInfo.logo}" class="team-logo-small" alt="${!isHome ? saveContext.teamName : opponentTeamInfo.name} Logo">
            ${!isHome ? saveContext.teamName : opponentTeamInfo.name}
        </span>
    `;

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

        // Opponent Formation (right side — player attacks them from the left):
        // Slot 1 (left col)  = Frontline  → tanks go here
        // Slot 2 (right col) = Backline   → squishies go here
        // Slots 0, 3, 4     = Midline

        // 1. Assign Frontline — slot 1
        if (tanks.length > 0) currentMatchState.opponentFormation[1] = tanks.shift();
        else if (flexible.length > 0) currentMatchState.opponentFormation[1] = flexible.shift();
        else currentMatchState.opponentFormation[1] = squishies.shift();

        // 2. Assign Backline — slot 2
        if (squishies.length > 0) currentMatchState.opponentFormation[2] = squishies.shift();
        else if (flexible.length > 0) currentMatchState.opponentFormation[2] = flexible.shift();
        else currentMatchState.opponentFormation[2] = tanks.shift();

        // 3. Assign Midline — slots 0, 3, 4
        let remaining = [...tanks, ...flexible, ...squishies];
        currentMatchState.opponentFormation[0] = remaining.shift() || null;
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

    // Table Sorting Event Listeners for Match Prep Moved to DOMContentLoaded

    // Roster Modal Close buttons
    const closeRosterBtn = document.getElementById('closeRosterModalBtn');
    if (closeRosterBtn) {
        closeRosterBtn.onclick = () => {
            document.getElementById('rosterSelectionModal').classList.add('hidden');
        };
    }
}

function renderOpponentFormation() {
    const slots = document.getElementById('opponentFormation').querySelectorAll('.formation-slot');
    slots.forEach((slot, index) => {
        const glad = currentMatchState.opponentFormation[index];
        slot.innerHTML = glad ? buildGladiatorCardSmall(glad) : 'Empty';
    });
}

function updateNextSlotHighlight() {
    const slots = document.getElementById('playerFormation').querySelectorAll('.formation-slot');

    // Safety check: if highlighted index is out of bounds or filled, reset to first empty
    if (currentMatchState.highlightedSlotIndex < 0 ||
        currentMatchState.highlightedSlotIndex >= 5 ||
        currentMatchState.playerFormation[currentMatchState.highlightedSlotIndex] !== null) {

        currentMatchState.highlightedSlotIndex = currentMatchState.playerFormation.findIndex(g => g === null);
    }

    const highlightIndex = currentMatchState.highlightedSlotIndex;

    slots.forEach((slot, i) => {
        slot.classList.toggle('next-slot-highlight', i === highlightIndex && highlightIndex !== -1);
    });
}

function renderPlayerFormation() {
    const slots = document.getElementById('playerFormation').querySelectorAll('.formation-slot');
    slots.forEach((slot, index) => {
        const glad = currentMatchState.playerFormation[index];
        slot.innerHTML = glad ? buildGladiatorCardSmall(glad) : 'Drag or Click to Assign';

        slot.onclick = () => {
            if (currentMatchState.playerFormation[index]) {
                // Remove from formation
                currentMatchState.playerFormation[index] = null;
                // Since this slot is now empty, make it the explicitly highlighted slot
                currentMatchState.highlightedSlotIndex = index;
                renderPlayerFormation();
                renderMatchRoster(); // re-enable in roster
            } else {
                // Manually select an empty slot and open the modal
                currentMatchState.highlightedSlotIndex = index;
                renderPlayerFormation();
                document.getElementById('rosterSelectionModal').classList.remove('hidden');
            }
        };

    });

    updateNextSlotHighlight();
}

function renderMatchRoster() {
    const list = document.getElementById('matchRosterBody');
    if (!list) return; // just in case
    list.innerHTML = '';

    // Clone array so we don't permute the save data order, just visual
    let sortedRoster = [...currentMatchState.saveContext.roster];

    sortedRoster.sort((a, b) => {
        let valA, valB;
        switch (currentMatchState.sortBy) {
            case 'hp':
                valA = a.hp !== undefined ? a.hp : (a.maxHp || Math.floor(50 + ((a.stats.con || 25) * 2)));
                valB = b.hp !== undefined ? b.hp : (b.maxHp || Math.floor(50 + ((b.stats.con || 25) * 2)));
                break;
            case 'ovr':
                valA = getPrimaryStat(a);
                valB = getPrimaryStat(b);
                break;
            case 'con': valA = a.stats.con || 25; valB = b.stats.con || 25; break;
            case 'str': valA = a.stats.str; valB = b.stats.str; break;
            case 'dex': valA = a.stats.dex; valB = b.stats.dex; break;
            case 'int': valA = a.stats.int; valB = b.stats.int; break;
            case 'wis': valA = a.stats.wis; valB = b.stats.wis; break;
            case 'class': valA = a.class; valB = b.class; break;
            case 'name':
            default:
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
                break;
        }

        if (valA < valB) return currentMatchState.sortAscending ? -1 : 1;
        if (valA > valB) return currentMatchState.sortAscending ? 1 : -1;
        // tie breaker: name
        if (currentMatchState.sortBy !== 'name') {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
        }
        return 0;
    });

    // Update header visual indicators to show current sort
    const matchTableHeaders = document.querySelectorAll('#matchRosterTable th[data-sort]');
    matchTableHeaders.forEach(th => {
        const sortKey = th.getAttribute('data-sort');
        if (sortKey === currentMatchState.sortBy) {
            th.innerHTML = `${th.textContent.replace(/ [↓↑]/, '')} ${currentMatchState.sortAscending ? '↑' : '↓'}`;
        } else {
            th.innerHTML = th.textContent.replace(/ [↓↑]/, '');
        }
    });

    sortedRoster.forEach(glad => {
        // Check if already in formation
        const inFormation = currentMatchState.playerFormation.find(g => g && g.id === glad.id);

        const row = document.createElement('tr');
        row.className = `roster-row ${inFormation ? 'assigned' : ''}`;
        row.style.cursor = inFormation ? 'default' : 'pointer';

        let portraitImg = glad.portrait
            ? `<div style="position:relative;width:32px;height:32px;flex-shrink:0;overflow:hidden;border-radius:4px;"><img src="${glad.portrait}" alt="portrait" style="width:100%;height:100%;object-fit:cover;display:block;" />${glad.battles > 0 ? `<div class="battles-badge-small" style="position:absolute; bottom:-4px; right:-4px; background:var(--color-accent-danger); border-radius:50%; width:14px; height:14px; font-size:9px; display:flex; align-items:center; justify-content:center;">${glad.battles}</div>` : ''}</div>`
            : `<div style="position:relative;width:32px;height:32px;background:#333;border-radius:4px;flex-shrink:0;">${glad.battles > 0 ? `<div class="battles-badge-small" style="position:absolute; bottom:-4px; right:-4px; background:var(--color-accent-danger); border-radius:50%; width:14px; height:14px; font-size:9px; display:flex; align-items:center; justify-content:center;">${glad.battles}</div>` : ''}</div>`;

        const maxHp = glad.maxHp || (30 + (glad.stats.str * 2));
        const currentHp = glad.hp !== undefined ? glad.hp : maxHp;
        const hpPercent = Math.max(0, Math.floor((currentHp / maxHp) * 100));

        row.innerHTML = `
            <td style="padding: 0.25rem; font-weight:bold; color: var(--color-gold); font-size: 0.85rem;">${getPrimaryStat(glad)}</td>
            <td style="padding: 0.25rem;"><span class="glad-class ${glad.class.toLowerCase()}" style="font-size:0.65rem;">${glad.class.substring(0, 3).toUpperCase()}</span></td>
            <td style="padding: 0.25rem;">${portraitImg}</td>
            <td style="padding: 0.25rem; font-weight:bold; font-size:0.85rem;">${glad.name.substring(0, 10)}</td>
            <td style="padding: 0.25rem;">
                <div class="hp-bar-container" style="height: 10px; width: 100%; min-width: 50px;">
                    <div class="hp-fill" style="width: ${hpPercent}%"></div>
                    <div class="hp-text" style="font-size: 0.65rem; line-height: 10px;">${currentHp}/${maxHp}</div>
                </div>
            </td>
            <td style="padding: 0.25rem; font-size:0.85rem;">${glad.stats.con || 25}</td>
            <td style="padding: 0.25rem; font-size:0.85rem;">${glad.stats.str}</td>
            <td style="padding: 0.25rem; font-size:0.85rem;">${glad.stats.dex}</td>
            <td style="padding: 0.25rem; font-size:0.85rem;">${glad.stats.int}</td>
            <td style="padding: 0.25rem; font-size:0.85rem;">${glad.stats.wis}</td>
        `;

        if (!inFormation) {
            row.onclick = () => {
                // Ensure a valid highlighted slot exists
                if (currentMatchState.highlightedSlotIndex !== -1) {
                    const targetIndex = currentMatchState.highlightedSlotIndex;

                    // Assign to the currently highlighted slot
                    currentMatchState.playerFormation[targetIndex] = glad;

                    // Advance to next available empty slot
                    currentMatchState.highlightedSlotIndex = currentMatchState.playerFormation.findIndex(g => g === null);

                    renderPlayerFormation();
                    renderMatchRoster();

                    // Close modal after selection
                    document.getElementById('rosterSelectionModal').classList.add('hidden');
                } else {
                    alert("Formation is full! Click a slot to remove a gladiator first or explicitly click an empty slot.");
                }
            };
        }

        list.appendChild(row);
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
            const battlesBadge = (glad.battles > 0) ? `<div class="battles-badge-small" style="position:absolute; bottom:-4px; right:-4px; background:var(--color-accent-danger); border-radius:50%; width:14px; height:14px; font-size:9px; display:flex; align-items:center; justify-content:center;">${glad.battles}</div>` : '';
            portraitImg = `<div style="position:relative;display:inline-block;"><img src="${glad.portrait}" style="width: 48px; border-radius: 4px; margin-bottom: 5px; display:block;" />${battlesBadge}</div>`;
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

    // Save formation (as IDs) to persist for next match
    currentMatchState.saveContext.savedFormation = currentMatchState.playerFormation.map(g => g ? g.id : null);
    localStorage.setItem('gladiatorSaveContext', JSON.stringify(currentMatchState.saveContext));

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

document.addEventListener('DOMContentLoaded', () => {
    // Table Sorting Event Listeners for Match Prep
    const matchTableHeaders = document.querySelectorAll('#matchRosterTable th[data-sort]');
    matchTableHeaders.forEach(th => {
        th.addEventListener('click', () => {
            const sortKey = th.getAttribute('data-sort');
            if (currentMatchState.sortBy === sortKey) {
                // Toggle order if clicking same header
                currentMatchState.sortAscending = !currentMatchState.sortAscending;
            } else {
                // Set new sort key, default to descending for stats/hp, ascending for text
                currentMatchState.sortBy = sortKey;
                currentMatchState.sortAscending = (sortKey === 'name' || sortKey === 'class');
            }
            renderMatchRoster();
        });
    });
});
