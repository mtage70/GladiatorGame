// Match Screen Logic

let currentMatchState = {
    saveContext: null,
    opponentTeam: null,
    playerFormation: [null, null, null, null, null],
    opponentFormation: [null, null, null, null, null],
    selectedGladiatorId: null,
    highlightedSlotIndex: -1,
    sortBy: 'ovr',
    sortAscending: false,
    isHome: false,
    isCup: false
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
    const matchScreen = document.getElementById('matchScreen');
    matchScreen.classList.remove('hidden');

    // Determine opponent
    const totalDaysElapsed = ((saveContext.year - 1) * MONTHS_PER_YEAR * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
    const currentWeekIndex = Math.floor(totalDaysElapsed / 7) % (MONTHS_PER_YEAR * 4);

    let opponentId;
    let isCup = false;
    let myMatch = null;

    if (currentWeekIndex < saveContext.schedule.length) {
        const weekObj = saveContext.schedule[currentWeekIndex];
        const weekMatches = (weekObj && weekObj.matches) ? weekObj.matches : (Array.isArray(weekObj) ? weekObj : []);
        myMatch = weekMatches.find ? weekMatches.find(m => m.home === saveContext.teamId || m.away === saveContext.teamId) : null;
        opponentId = myMatch.home === saveContext.teamId ? myMatch.away : myMatch.home;
    } else if (currentWeekIndex === 19) {
        // Aowan Cup
        isCup = true;
        const standings = typeof getStandings === 'function' ? getStandings(saveContext) : [];
        const topTwo = standings.slice(0, 2);
        const opponentEntry = topTwo.find(t => !t.isPlayer);
        opponentId = opponentEntry ? opponentEntry.team.id : null;
    }

    const isHome = isCup ? false : (myMatch && myMatch.home === saveContext.teamId);
    currentMatchState.isHome = isHome;
    currentMatchState.isCup = isCup;
    const arenaTeamId = isHome ? saveContext.teamId : opponentId;
    const opponentTeamInfo = TEAMS.find(t => t.id === opponentId);
    currentMatchState.opponentTeam = opponentTeamInfo;

    // Set dynamic match background
    if (isCup) {
        matchScreen.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('assets/ui/colosseum.png')`;
    } else {
        matchScreen.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('assets/arenas/arena_${arenaTeamId}.png')`;
    }
    matchScreen.style.backgroundSize = 'cover';
    matchScreen.style.backgroundPosition = 'center bottom';

    const typeLabel = document.getElementById('matchTypeLabel');
    if (typeLabel) {
        if (isCup) {
            typeLabel.innerHTML = 'THE<br>AOWAN<br>CUP';
            typeLabel.className = 'cup-title-special'; // Apply special CSS class
            typeLabel.style.top = '1rem';
        } else {
            typeLabel.textContent = isHome ? 'HOME MATCH' : 'AWAY MATCH';
            typeLabel.className = ''; // Reset class
            typeLabel.style.color = isHome ? 'var(--color-accent-success)' : 'var(--color-gold-light)';
            typeLabel.style.fontSize = '1.1rem';
            typeLabel.style.lineHeight = 'normal';
            typeLabel.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            typeLabel.style.letterSpacing = '2px';
            typeLabel.style.top = '2rem';
        }

        // Shared positioning
        typeLabel.style.position = 'absolute';
        typeLabel.style.left = '50%';
        typeLabel.style.transform = 'translateX(-50%)';
        typeLabel.style.width = '100%';
        typeLabel.style.textAlign = 'center';
        typeLabel.style.zIndex = '10';
    }
    document.getElementById('matchPlayerHeader').innerHTML = `
        <div class="team-header-vertical" style="color: var(--team-primary); text-shadow: 0 0 10px rgba(0,0,0,0.8);">
            <img src="${saveContext.teamLogo}" class="team-logo-large" alt="${saveContext.teamName} Logo">
            <span style="background-color: ${getContrastColor('var(--team-primary)')};">${saveContext.teamName}</span>
        </div>
    `;

    document.getElementById('matchOpponentHeader').innerHTML = `
        <div class="team-header-vertical" style="color: ${opponentTeamInfo.primaryColor}; text-shadow: 0 0 10px rgba(0,0,0,0.8);">
            <img src="${opponentTeamInfo.logo}" class="team-logo-large" alt="${opponentTeamInfo.name} Logo">
            <span style="background-color: ${getContrastColor(opponentTeamInfo.primaryColor)};">${opponentTeamInfo.name}</span>
        </div>
    `;

    const oppTeamData = saveContext.opposingRosters[opponentId];
    // Fallback for pre-patch saves that still use raw arrays
    const oppRoster = oppTeamData ? (oppTeamData.roster || oppTeamData) : [];
    if (oppRoster && oppRoster.length > 0) {
        // Sort roster by suitability for frontline (highest HP first)
        let sortedRoster = oppRoster.slice().sort((a, b) => {
            const maxHpA = a.maxHp || calculateMaxHp(a);
            const maxHpB = b.maxHp || calculateMaxHp(b);
            const hpA = a.hp !== undefined ? a.hp : maxHpA;
            const hpB = b.hp !== undefined ? b.hp : maxHpB;

            const scoreA = getPrimaryStat(a) * (hpA / maxHpA);
            const scoreB = getPrimaryStat(b) * (hpB / maxHpB);

            return scoreB - scoreA;
        });

        // Pick a diverse top 5 gladiators
        let activeFighters = [];
        let pool = [...sortedRoster];

        // Define roles to ensure variety
        const roles = [
            ['Warrior', 'Paladin'], // Tanks
            ['Mage', 'Cleric'],    // Support/Backline
            ['Rogue', 'Hunter']    // Damage
        ];

        // 1. Try to pick the best of each role first
        roles.forEach(roleClasses => {
            const bestInRoleIdx = pool.findIndex(g => roleClasses.includes(g.class));
            if (bestInRoleIdx !== -1 && bestInRoleIdx < 6) { // Only if reasonably good
                activeFighters.push(pool.splice(bestInRoleIdx, 1)[0]);
            }
        });

        // 2. Try to pick the best of any class not already represented
        pool.forEach((g, index) => {
            if (activeFighters.length < 5) {
                const alreadyHasClass = activeFighters.some(af => af.class === g.class);
                if (!alreadyHasClass) {
                    activeFighters.push(pool.splice(index, 1)[0]);
                }
            }
        });

        // 3. Fill remaining with best available
        while (activeFighters.length < 5 && pool.length > 0) {
            activeFighters.push(pool.shift());
        }

        // Separate by formation role
        // Paladins are the best frontline due to Divine Shield.
        // Warriors are secondary frontline/midline tanks.
        // Clerics belong in backline to maximize healing uptime.
        // Mages, Rogues, Hunters are flexible midline.
        let paladins = [];
        let warriors = [];
        let clerics = [];
        let midliners = []; // Mages, Rogues, Hunters

        activeFighters.forEach(g => {
            if (g.class === 'Paladin') paladins.push(g);
            else if (g.class === 'Warrior') warriors.push(g);
            else if (g.class === 'Cleric') clerics.push(g);
            else midliners.push(g);
        });

        // Sort each group by HP descending (healthiest first)
        const hpSort = (a, b) => (b.hp !== undefined ? b.hp : (b.maxHp || 0)) - (a.hp !== undefined ? a.hp : (a.maxHp || 0));
        paladins.sort(hpSort);
        warriors.sort(hpSort);
        clerics.sort(hpSort);
        midliners.sort(hpSort);

        // Opponent Formation (right side — player attacks them from the left):
        // Slot 1 (left col)  = Frontline  → Paladins first, then Warriors
        // Slot 2 (right col) = Backline   → Clerics first
        // Slots 0, 3, 4     = Midline

        // 1. Assign Frontline — slot 1 (Paladin > Warrior > flexible > anyone)
        if (paladins.length > 0) currentMatchState.opponentFormation[1] = paladins.shift();
        else if (warriors.length > 0) currentMatchState.opponentFormation[1] = warriors.shift();
        else if (midliners.length > 0) currentMatchState.opponentFormation[1] = midliners.shift();
        else currentMatchState.opponentFormation[1] = clerics.shift();

        // 2. Assign Backline — slot 2 (Cleric > Mage/ranged > anyone)
        if (clerics.length > 0) currentMatchState.opponentFormation[2] = clerics.shift();
        else if (midliners.length > 0) currentMatchState.opponentFormation[2] = midliners.shift();
        else if (warriors.length > 0) currentMatchState.opponentFormation[2] = warriors.shift();
        else currentMatchState.opponentFormation[2] = paladins.shift();

        // 3. Assign Midline — slots 0, 3, 4
        let remaining = [...warriors, ...paladins, ...midliners, ...clerics];
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

    const forfeitBtn = document.getElementById('forfeitBtn');
    if (forfeitBtn) {
        forfeitBtn.onclick = forfeitMatch;
    }

    const autoFillBtn = document.getElementById('autoFillBtn');
    if (autoFillBtn) {
        autoFillBtn.onclick = autoFillPlayerFormation;
    }

    // Table Sorting Event Listeners for Match Prep Moved to DOMContentLoaded

    // Roster Modal Close buttons
    const closeRosterBtn = document.getElementById('closeRosterModalBtn');
    if (closeRosterBtn) {
        closeRosterBtn.onclick = () => {
            document.getElementById('rosterSelectionModal').classList.add('hidden');
        };
    }
}

function autoFillPlayerFormation() {
    // Clear current formation
    currentMatchState.playerFormation = [null, null, null, null, null];

    // Get living roster members
    let availableRoster = currentMatchState.saveContext.roster.filter(g => g.hp > 0);

    if (availableRoster.length === 0) {
        alert("You have no living gladiators able to fight!");
        return;
    }

    // Sort logic heavily mirroring the AI
    let sortedRoster = availableRoster.slice().sort((a, b) => {
        const maxHpA = a.maxHp || calculateMaxHp(a);
        const maxHpB = b.maxHp || calculateMaxHp(b);
        const hpA = a.hp !== undefined ? a.hp : maxHpA;
        const hpB = b.hp !== undefined ? b.hp : maxHpB;

        const scoreA = getPrimaryStat(a) * (hpA / maxHpA);
        const scoreB = getPrimaryStat(b) * (hpB / maxHpB);

        return scoreB - scoreA;
    });

    // Pick a diverse top 5 gladiators (mirroring the improved AI logic)
    let activeFighters = [];
    let pool = [...sortedRoster];

    // Define roles to ensure variety
    const roles = [
        ['Warrior', 'Paladin'], // Tanks
        ['Mage', 'Cleric'],    // Support/Backline
        ['Rogue', 'Hunter']    // Damage
    ];

    // 1. Try to pick the best of each role first (if reasonably strong)
    roles.forEach(roleClasses => {
        const bestInRoleIdx = pool.findIndex(g => roleClasses.includes(g.class));
        if (bestInRoleIdx !== -1 && bestInRoleIdx < 6) {
            activeFighters.push(pool.splice(bestInRoleIdx, 1)[0]);
        }
    });

    // 2. Try to pick the best of any class not already represented
    pool.forEach((g, index) => {
        if (activeFighters.length < 5) {
            const alreadyHasClass = activeFighters.some(af => af.class === g.class);
            if (!alreadyHasClass) {
                const found = pool.splice(index, 1)[0];
                if (found) activeFighters.push(found);
            }
        }
    });

    // 3. Fill remaining with best available
    while (activeFighters.length < 5 && pool.length > 0) {
        activeFighters.push(pool.shift());
    }

    let paladins = [];
    let warriors = [];
    let clerics = [];
    let midliners = [];

    activeFighters.forEach(g => {
        if (g.class === 'Paladin') paladins.push(g);
        else if (g.class === 'Warrior') warriors.push(g);
        else if (g.class === 'Cleric') clerics.push(g);
        else midliners.push(g);
    });

    const hpSort = (a, b) => (b.hp !== undefined ? b.hp : (b.maxHp || 0)) - (a.hp !== undefined ? a.hp : (a.maxHp || 0));
    paladins.sort(hpSort);
    warriors.sort(hpSort);
    clerics.sort(hpSort);
    midliners.sort(hpSort);

    // Player Formation Indices (Left attacking Right):
    // Slot 2 (right col) = Frontline
    // Slot 1 (left col)  = Backline
    // Slots 0, 3, 4     = Midline

    // 1. Assign Frontline — slot 2 (Paladin > Warrior > flexible > anyone)
    if (paladins.length > 0) currentMatchState.playerFormation[2] = paladins.shift();
    else if (warriors.length > 0) currentMatchState.playerFormation[2] = warriors.shift();
    else if (midliners.length > 0) currentMatchState.playerFormation[2] = midliners.shift();
    else currentMatchState.playerFormation[2] = clerics.shift();

    // 2. Assign Backline — slot 1 (Cleric > Mage/ranged > anyone)
    if (clerics.length > 0) currentMatchState.playerFormation[1] = clerics.shift();
    else if (midliners.length > 0) currentMatchState.playerFormation[1] = midliners.shift();
    else if (warriors.length > 0) currentMatchState.playerFormation[1] = warriors.shift();
    else currentMatchState.playerFormation[1] = paladins.shift();

    // 3. Assign Midline
    let remaining = [...warriors, ...paladins, ...midliners, ...clerics];
    currentMatchState.playerFormation[0] = remaining.shift() || null;
    currentMatchState.playerFormation[3] = remaining.shift() || null;
    currentMatchState.playerFormation[4] = remaining.shift() || null;

    currentMatchState.highlightedSlotIndex = currentMatchState.playerFormation.findIndex(g => g === null);

    renderPlayerFormation();
    renderMatchRoster(); // disable assigned ones in the roster UI below
}

function renderOpponentFormation() {
    const slots = document.getElementById('opponentFormation').querySelectorAll('.formation-slot');
    slots.forEach((slot, index) => {
        const glad = currentMatchState.opponentFormation[index];
        slot.innerHTML = glad ? buildGladiatorCardSmall(glad, 'opponent') : '<img src="assets/ui/empty_slot.png" alt="Empty Slot" style="width:100%;height:100%;object-fit:cover;border-radius:4px;opacity:0.6;">';

        if (glad) {
            slot.style.cursor = 'pointer';
            slot.onclick = () => {
                if (typeof openGladiatorDetails === 'function') {
                    openGladiatorDetails(glad);
                }
            };
        } else {
            slot.style.cursor = 'default';
            slot.onclick = null;
        }
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
        slot.innerHTML = glad ? buildGladiatorCardSmall(glad, 'player') : '<img src="assets/ui/empty_slot.png" alt="Empty Slot" style="width:100%;height:100%;object-fit:cover;border-radius:4px;opacity:0.6;">';

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
                valA = a.hp !== undefined ? a.hp : (a.maxHp || calculateMaxHp(a));
                valB = b.hp !== undefined ? b.hp : (b.maxHp || calculateMaxHp(b));
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

        const maxHp = glad.maxHp || calculateMaxHp(glad);
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

// buildGladiatorCardSmall and buildGladiatorCardMarkup moved to js/ui/components.js

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

    // Start battle music
    if (typeof stopBackgroundMusic === 'function') stopBackgroundMusic();
    if (typeof playBattleMusic === 'function') playBattleMusic();

    // Call global initializeCombat
    initializeCombat(
        pForm,
        oForm,
        currentMatchState.saveContext,
        currentMatchState.opponentTeam,
        currentMatchState.isHome
    );
}

function retreatFromMatch() {
    document.getElementById('matchScreen').classList.add('hidden');
    document.getElementById('homeScreen').classList.remove('hidden');

    // We didn't actually fight, so technically we should advance past the match day or handle consequences.
    // For now, we'll just go back.
}

function forfeitMatch() {
    document.getElementById('forfeitModal').classList.remove('hidden');
}

function confirmForfeitMatch() {
    document.getElementById('forfeitModal').classList.add('hidden');

    // Record the loss
    if (!currentMatchState.saveContext.matchResults) {
        currentMatchState.saveContext.matchResults = [];
    }
    currentMatchState.saveContext.matchResults.push({
        won: false,
        day: currentMatchState.saveContext.day,
        month: currentMatchState.saveContext.month,
        year: currentMatchState.saveContext.year
    });

    // Update opponent stats
    const oppId = currentMatchState.opponentTeam.id;
    const oppData = currentMatchState.saveContext.opposingRosters && currentMatchState.saveContext.opposingRosters[oppId];
    if (oppData) {
        oppData.wins = (oppData.wins || 0) + 1;
        oppData.gold = (oppData.gold || 0) + 1000;
    }

    // Grant player the loser gold
    currentMatchState.saveContext.gold = (currentMatchState.saveContext.gold || 0) + 500;

    // Add news item
    const newsList = document.getElementById('newsList');
    if (newsList) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';

        // Apply player team color
        if (typeof TEAMS !== 'undefined' && currentMatchState.saveContext.teamId) {
            const playerTeam = TEAMS.find(t => t.id === currentMatchState.saveContext.teamId);
            if (playerTeam && playerTeam.primaryColor) {
                newsItem.style.borderLeftColor = playerTeam.primaryColor;
            }
        }

        newsItem.innerHTML = `<p><strong>Match Result</strong>: Your team forfeited the match. You earned <span style="color:var(--color-gold-primary);">500 G</span>.</p>`;

        if (newsList.firstChild) {
            newsList.insertBefore(newsItem, newsList.firstChild);
        } else {
            newsList.appendChild(newsItem);
        }
    }

    // Simulate other matches
    if (typeof simulateLeagueMatches === 'function') {
        const totalDaysElapsed = ((currentMatchState.saveContext.year - 1) * MONTHS_PER_YEAR * 28) + ((currentMatchState.saveContext.month - 1) * 28) + (currentMatchState.saveContext.day - 1);
        const currentWeekIndex = Math.floor(totalDaysElapsed / 7) % (MONTHS_PER_YEAR * 4);
        simulateLeagueMatches(currentMatchState.saveContext, currentWeekIndex);
    }

    // Advance Day
    currentMatchState.saveContext.day += 1;
    if (currentMatchState.saveContext.day > 28) {
        currentMatchState.saveContext.day = 1;
        currentMatchState.saveContext.month += 1;
        if (currentMatchState.saveContext.month > MONTHS_PER_YEAR) {
            currentMatchState.saveContext.month = 1;
            currentMatchState.saveContext.year += 1;
            if (typeof recalculateSeasonData === 'function') {
                recalculateSeasonData(currentMatchState.saveContext);
            }
        }
    }

    // Save and return to home
    localStorage.setItem('gladiatorSaveContext', JSON.stringify(currentMatchState.saveContext));
    document.getElementById('matchScreen').classList.add('hidden');
    document.getElementById('homeScreen').classList.remove('hidden');

    // Re-render UI
    if (typeof renderRoster === 'function') renderRoster();
    if (typeof renderCalendar === 'function') renderCalendar(currentMatchState.saveContext);
    if (typeof setupAdvanceTimeBtn === 'function') setupAdvanceTimeBtn();
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

    const cancelForfeitBtn = document.getElementById('cancelForfeitBtn');
    if (cancelForfeitBtn) {
        cancelForfeitBtn.addEventListener('click', () => {
            document.getElementById('forfeitModal').classList.add('hidden');
        });
    }

    const confirmForfeitBtn = document.getElementById('confirmForfeitBtn');
    if (confirmForfeitBtn) {
        confirmForfeitBtn.addEventListener('click', confirmForfeitMatch);
    }
});
