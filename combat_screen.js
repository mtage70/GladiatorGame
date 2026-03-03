// Combat Screen Logic

let combatState = {
    combatants: [],
    turnIndex: 0,
    saveContext: null,
    isCombatActive: false,
    opponentTeamId: null
};

function initializeCombat(playerFormation, opponentFormation, saveContext, opponentTeamInfo) {
    combatState.saveContext = saveContext;
    combatState.combatants = [];
    combatState.turnIndex = 0;
    combatState.isCombatActive = true;
    combatState.opponentTeamId = opponentTeamInfo.id;

    // Hide Match Screen, Show Combat Screen
    document.getElementById('matchScreen').classList.add('hidden');
    const combatScreen = document.getElementById('combatScreen');
    combatScreen.classList.remove('hidden');

    // Set dynamic combat background based on opponent team
    combatScreen.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('arenas/arena_${opponentTeamInfo.id}.png')`;
    combatScreen.style.backgroundSize = 'cover';
    combatScreen.style.backgroundPosition = 'center';

    document.getElementById('combatPlayerHeader').innerHTML = `
        <div class="team-header-vertical">
            <img src="${saveContext.teamLogo}" class="team-logo-large" alt="${saveContext.teamName} Logo">
            <span>${saveContext.teamName}</span>
        </div>
    `;

    document.getElementById('combatOpponentHeader').innerHTML = `
        <div class="team-header-vertical" style="color: var(--color-accent-danger);">
            <img src="${opponentTeamInfo.logo}" class="team-logo-large" alt="${opponentTeamInfo.name} Logo">
            <span>${opponentTeamInfo.name}</span>
        </div>
    `;
    document.getElementById('combatLog').innerHTML = ''; // clear previous logs

    document.getElementById('finishCombatBtn').classList.add('hidden');
    document.getElementById('finishCombatBtn').onclick = finishCombatTransition;

    // Process Player Team
    playerFormation.forEach(glad => {
        if (glad) {
            setupCombatant(glad, 'player');
            combatState.combatants.push(glad);
        }
    });

    // Process Opponent Team
    opponentFormation.forEach(glad => {
        if (glad) {
            setupCombatant(glad, 'opponent');
            combatState.combatants.push(glad);
        }
    });

    // Sort by Dexterity descending for turn order
    combatState.combatants.sort((a, b) => b.stats.dex - a.stats.dex);

    renderCombatSide('player');
    renderCombatSide('opponent');

    logCombat('The battle begins!', 'critical');
    setTimeout(executeTurn, 1000);
}

function setupCombatant(glad, side) {
    glad.side = side;

    if (glad.maxHp === undefined) {
        // Fallback for older saves
        glad.maxHp = Math.floor(50 + ((glad.stats.con || 25) * 2));
        glad.hp = glad.maxHp;
    }

    glad.isDead = glad.hp <= 0;

    // Determine base damage scaled by primary stat
    // Warrior/Paladin: STR, Rogue/Hunter: DEX, Mage: INT, Cleric: WIS
    let primaryStat = 10;
    switch (glad.class) {
        case 'Warrior':
        case 'Paladin':
            primaryStat = glad.stats.str;
            break;
        case 'Rogue':
        case 'Hunter':
            primaryStat = glad.stats.dex;
            break;
        case 'Mage':
            primaryStat = glad.stats.int;
            break;
        case 'Cleric':
            primaryStat = glad.stats.wis;
            break;
    }

    // Base damage scaling factor reduced for longer fights
    // Paladins deal less damage to enforce their role as pure tanks
    // Rogues deal slightly less base damage but can crit
    // Hunters deal less damage to offset their free targeting ability
    const damageScale = (glad.class === 'Paladin' || glad.class === 'Rogue') ? 0.7 : 1.0;
    glad.baseDamage = Math.floor(primaryStat * damageScale);
}

// Utility function to build the square formation widget (used here and in Match Prep)
function buildSquareGladiatorCard(glad, prefix = '') {
    let portraitImg = glad.portrait ? `<img src="${glad.portrait}" alt="portrait" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:4px;" />` : `<div style="width:100%;height:100%;background:#333;border-radius:4px;"></div>`;
    const battlesBadge = (glad.battles > 0) ? `<div class="battles-badge">${glad.battles}</div>` : '';

    // We only need maxHp if it's already calculated, otherwise just show stats.
    const hasHp = glad.hp !== undefined && glad.maxHp !== undefined;
    const hpPercent = hasHp ? Math.max(0, Math.floor((glad.hp / glad.maxHp) * 100)) : 100;

    // Only show HP text if we're actually in combat and tracking HP
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

function renderCombatSide(side) {
    const container = document.getElementById(side === 'player' ? 'combatPlayerTeam' : 'combatOpponentTeam');

    // Clear all slots first (set to empty slot graphic)
    const slots = container.querySelectorAll('.formation-slot');
    slots.forEach(slot => slot.innerHTML = '<img src="empty_slot.png" alt="Empty Slot" style="width:100%;height:100%;object-fit:cover;border-radius:4px;opacity:0.6;">');

    // Get characters for this side
    const sideCombatants = combatState.combatants.filter(c => c.side === side);

    sideCombatants.forEach(glad => {
        // Find the slot this gladiator should be in
        const slotDiv = Array.from(slots).find(s => parseInt(s.getAttribute('data-slot')) === glad.formationIndex);
        if (!slotDiv) return; // Failsafe if something goes wrong with indexing

        // Overwrite the 'empty slot' graphic since a gladiator lives here
        slotDiv.innerHTML = '';

        const card = document.createElement('div');
        card.id = `combatant-${glad.id}`;
        card.className = `combatant-card full-slot ${glad.isDead ? 'dead' : ''}`;

        // Use the shared square widget builder
        card.innerHTML = buildSquareGladiatorCard(glad, 'combat-');

        slotDiv.appendChild(card);
    });
}

function updateCombatantUI(glad) {
    const card = document.getElementById(`combatant-${glad.id}`);
    if (!card) return;

    if (glad.isDead) {
        card.classList.add('dead');
    }

    const hpFill = document.getElementById(`combat-hp-fill-${glad.id}`);
    const hpText = document.getElementById(`combat-hp-text-${glad.id}`);

    if (hpFill && hpText) {
        const hpPercent = Math.max(0, Math.floor((glad.hp / glad.maxHp) * 100));
        hpFill.style.width = `${hpPercent}%`;
        hpText.textContent = `${glad.hp} / ${glad.maxHp}`;
    }
}

function setCardActiveState(gladId, isActive) {
    document.querySelectorAll('.combatant-card').forEach(card => card.classList.remove('active-turn'));
    if (isActive && gladId) {
        const card = document.getElementById(`combatant-${gladId}`);
        if (card) {
            // Only add active glow if not dead
            const glad = combatState.combatants.find(c => c.id === gladId);
            if (glad && !glad.isDead) {
                card.classList.add('active-turn');
            }
        }
    }
}

function logCombat(message, type = 'normal') {
    const logContainer = document.getElementById('combatLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = message;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Frontline -> Midline -> Backline Priority Logic
function getValidTargets(attacker, allCombatants) {
    const enemies = allCombatants.filter(c => c.side !== attacker.side && !c.isDead);
    if (enemies.length === 0) return [];

    const isTargetingRightSide = (attacker.side === 'player' || attacker.side === 'A');

    // Right Side (Opponent/B): col 1 (Slot 1) is Frontline, col 3 (Slot 2) is Backline
    // Left Side (Player/A): col 3 (Slot 2) is Frontline, col 1 (Slot 1) is Backline
    const frontIndex = isTargetingRightSide ? 1 : 2;
    const midIndices = [0, 3, 4];
    const backIndex = isTargetingRightSide ? 2 : 1;

    let frontTargets = enemies.filter(c => c.formationIndex === frontIndex);
    if (frontTargets.length > 0) return frontTargets;

    let midTargets = enemies.filter(c => midIndices.includes(c.formationIndex));
    if (midTargets.length > 0) return midTargets;

    let backTargets = enemies.filter(c => c.formationIndex === backIndex);
    if (backTargets.length > 0) return backTargets;

    return enemies; // Fallback if formationIndex isn't assigned
}

function executeTurn() {
    if (!combatState.isCombatActive) return;

    const attacker = combatState.combatants[combatState.turnIndex];

    // Cycle turn index for next time
    combatState.turnIndex = (combatState.turnIndex + 1) % combatState.combatants.length;

    // Skip turn if actor is dead
    if (attacker.isDead) {
        executeTurn(); // immediately go to next turn
        return;
    }

    setCardActiveState(attacker.id, true);

    // Find all enemies to verify if the combat should end
    const targetSide = attacker.side === 'player' ? 'opponent' : 'player';
    const allEnemies = combatState.combatants.filter(c => c.side === targetSide && !c.isDead);

    if (allEnemies.length === 0) {
        // Team wipe detected
        const winner = attacker.side === 'player' ? 'Player Team' : 'Opponent Team';
        logCombat(`The battle is over! ${winner} is victorious!`, 'critical');
        endCombat(attacker.side);
        return;
    }

    // Apply structured targeting priority for attack
    // Hunters and Mages can target any living enemy (bypass frontline priority)
    const validTargets = (attacker.class === 'Hunter' || attacker.class === 'Mage')
        ? combatState.combatants.filter(c => c.side === targetSide && !c.isDead)
        : getValidTargets(attacker, combatState.combatants);

    // Determine Action
    let actionType = 'attack';
    let target = null;
    let effectAmount = 0;

    if (attacker.class === 'Cleric') {
        const friendlies = combatState.combatants.filter(c => c.side === attacker.side && !c.isDead && c.hp < c.maxHp);
        if (friendlies.length > 0) {
            target = friendlies.reduce((lowest, current) => {
                const currentPct = current.hp / current.maxHp;
                const lowestPct = lowest.hp / lowest.maxHp;
                return currentPct < lowestPct ? current : lowest;
            });
            actionType = 'heal';
            const variance = (0.8 + (Math.random() * 0.4));
            effectAmount = Math.floor(attacker.baseDamage * 1.0 * variance); // Heals equivalent to base damage
        }
    }

    if (actionType === 'attack') {
        target = validTargets[Math.floor(Math.random() * validTargets.length)];
        const variance = (0.8 + (Math.random() * 0.4));
        effectAmount = Math.floor(attacker.baseDamage * variance);
        if (effectAmount < 1) effectAmount = 1;

        // Rogue: Critical chance scales with DEX (up to 50%)
        const critChance = Math.min(0.5, attacker.stats.dex * 0.004);
        if (attacker.class === 'Rogue' && Math.random() < critChance) {
            effectAmount *= 2;
            actionType = 'rogue_crit';
        }

        // Mage unique mechanical override: Splash damage across adjacent formation slots
        if (attacker.class === 'Mage') {
            actionType = 'fireball';
        }
    }

    // Trigger visual attack/cast animation
    const attackerCard = document.getElementById(`combatant-${attacker.id}`);
    if (attackerCard) attackerCard.classList.add('attacking');

    // Wait a brief moment for the 'swing/cast', then process effect
    setTimeout(() => {
        if (attackerCard) attackerCard.classList.remove('attacking');

        const targetCard = document.getElementById(`combatant-${target.id}`);

        if (actionType === 'heal') {
            if (targetCard) targetCard.classList.add('receiving-heal');

            target.hp += effectAmount;
            if (target.hp > target.maxHp) target.hp = target.maxHp;

            logCombat(`<strong>${attacker.name}</strong> casts Heal on <strong>${target.name}</strong> for <span style="color:#4caf50">${effectAmount} HP</span>!`);
            updateCombatantUI(target);

            setTimeout(() => {
                if (targetCard) targetCard.classList.remove('receiving-heal');
                setCardActiveState(null, false);
                setTimeout(executeTurn, 800);
            }, 400);

        } else {
            // Check for Dodge against physical attacks
            let isPhysicalAttack = ['Warrior', 'Paladin', 'Rogue', 'Hunter'].includes(attacker.class);
            let targetDodged = false;

            if (isPhysicalAttack) {
                // Calculate dodge chance. target's dex vs attacker's primary stat.
                // Cap dodge at 40% maximum to ensure stats don't break the game.
                let dodgeChance = (target.stats.dex - attacker.baseDamage) * 0.01;
                if (dodgeChance < 0) dodgeChance = 0;
                if (dodgeChance > 0.40) dodgeChance = 0.40;

                if (Math.random() < dodgeChance) {
                    targetDodged = true;
                }
            }

            if (targetDodged) {
                logCombat(`<strong>${attacker.name}</strong> attacks <strong>${target.name}</strong>, but they <em>dodged</em> the blow!`, 'normal');

                // Allow card state to reset
                setTimeout(() => {
                    setCardActiveState(null, false);
                    setTimeout(executeTurn, 800);
                }, 400);

            } else if (actionType === 'fireball') {
                // Determine adjacent slots.
                // Slots: 0 (Front), 1 (Back), 2 (Mid-Top), 3 (Mid-Center), 4 (Mid-Bottom)
                // Actually, wait - let's define "adjacent" based on the numerical grid layout in style.css.
                // Slot 0 (Frontline) has no lateral adjacencies, only depth.
                // A true splash in a 5-man cross formation: 
                // Front(1) - Mid(3) - Back(1)
                // Let's splash based on the "Midline" vertical column (indices 2, 3, 4). 
                // If targeting Midline, hit adjacent midline slots. If targeting Front/Back, hit the center Mid slot (3) behind it.
                let adjacentIndices = [];
                const tIdx = target.formationIndex;
                if (tIdx === 0) adjacentIndices = [4]; // Front splashes to Mid-Center
                else if (tIdx === 1) adjacentIndices = [4]; // Back splashes to Mid-Center
                else if (tIdx === 2) adjacentIndices = [4]; // Mid-Top splashes to Mid-Center
                else if (tIdx === 3) adjacentIndices = [4]; // Mid-Bottom splashes to Mid-Center
                else if (tIdx === 4) adjacentIndices = [0, 1, 2, 3]; // Mid-Center splashes EVERYWHERE

                // Find living targets in those slots
                const splashTargets = combatState.combatants.filter(c => c.side === target.side && !c.isDead && adjacentIndices.includes(c.formationIndex));

                // Determine divided damage
                const totalTargetsCaught = 1 + splashTargets.length;
                const splitDamage = Math.max(1, Math.floor(effectAmount / totalTargetsCaught));

                logCombat(`<strong>${attacker.name}</strong> hurls a <span style="color:#ff8800">Fireball</span> at <strong>${target.name}</strong>, scorching ${totalTargetsCaught} enemies for ${splitDamage} damage each!`);

                // Apply damage to primary
                if (targetCard) targetCard.classList.add('taking-damage');
                target.hp -= splitDamage;
                if (target.hp <= 0) {
                    target.hp = 0;
                    target.isDead = true;
                    logCombat(`--> <strong>${target.name}</strong> was burned to ashes!`, 'death');
                }
                updateCombatantUI(target);

                // Apply damage to secondary targets
                splashTargets.forEach(st => {
                    const stCard = document.getElementById(`combatant-${st.id}`);
                    if (stCard) stCard.classList.add('taking-damage');
                    st.hp -= splitDamage;
                    if (st.hp <= 0) {
                        st.hp = 0;
                        st.isDead = true;
                        logCombat(`--> <strong>${st.name}</strong> was caught in the blast and died!`, 'death');
                    }
                    updateCombatantUI(st);

                    setTimeout(() => {
                        if (stCard) stCard.classList.remove('taking-damage');
                    }, 400);
                });

                setTimeout(() => {
                    if (targetCard) targetCard.classList.remove('taking-damage');
                    setCardActiveState(null, false);
                    setTimeout(executeTurn, 800);
                }, 400);

            } else if (attacker.class === 'Warrior') {
                // Warrior: Cleave damage vertically across primary target and neighbors
                let adjacentIndices = [];
                const tIdx = target.formationIndex;
                if (tIdx === 0) adjacentIndices = [4];
                else if (tIdx === 1) adjacentIndices = [];
                else if (tIdx === 2) adjacentIndices = [];
                else if (tIdx === 3) adjacentIndices = [4];
                else if (tIdx === 4) adjacentIndices = [0, 3];

                const cleaveTargets = combatState.combatants.filter(c => c.side === target.side && !c.isDead && adjacentIndices.includes(c.formationIndex));
                const totalTargetsCaught = 1 + cleaveTargets.length;
                const splitDamage = Math.max(1, Math.floor(effectAmount / totalTargetsCaught));

                if (cleaveTargets.length > 0) {
                    logCombat(`<strong>${attacker.name}</strong> <span style="color:#d32f2f">CLEAVES</span> <strong>${target.name}</strong>, striking ${totalTargetsCaught} enemies for ${splitDamage} damage each!`);
                } else {
                    logCombat(`<strong>${attacker.name}</strong> attacks <strong>${target.name}</strong> for ${splitDamage} damage!`);
                }

                // Apply damage to primary
                if (targetCard) targetCard.classList.add('taking-damage');
                target.hp -= splitDamage;
                if (target.hp <= 0) {
                    target.hp = 0;
                    target.isDead = true;
                    logCombat(`--> <strong>${target.name}</strong> has been struck down!`, 'death');
                }
                updateCombatantUI(target);

                // Apply damage to secondary targets
                cleaveTargets.forEach(ct => {
                    const ctCard = document.getElementById(`combatant-${ct.id}`);
                    if (ctCard) ctCard.classList.add('taking-damage');
                    ct.hp -= splitDamage;
                    if (ct.hp <= 0) {
                        ct.hp = 0;
                        ct.isDead = true;
                        logCombat(`--> <strong>${ct.name}</strong> was caught in the cleave and died!`, 'death');
                    }
                    updateCombatantUI(ct);

                    setTimeout(() => {
                        if (ctCard) ctCard.classList.remove('taking-damage');
                    }, 400);
                });

                setTimeout(() => {
                    if (targetCard) targetCard.classList.remove('taking-damage');
                    setCardActiveState(null, false);
                    setTimeout(executeTurn, 800);
                }, 400);

            } else {
                if (targetCard) targetCard.classList.add('taking-damage');

                target.hp -= effectAmount;
                if (actionType === 'rogue_crit') {
                    logCombat(`<strong>${attacker.name}</strong> <span style="color:#ffd700">CRITICAL STRIKES</span> <strong>${target.name}</strong> for <span style="color:#ff6666">${effectAmount} damage</span>!`, 'critical');
                } else {
                    logCombat(`<strong>${attacker.name}</strong> attacks <strong>${target.name}</strong> for ${effectAmount} damage!`);
                }

                if (target.hp <= 0) {
                    target.hp = 0;
                    target.isDead = true;
                    logCombat(`--> <strong>${target.name}</strong> has been struck down!`, 'death');
                }

                updateCombatantUI(target);

                // Remove damage reaction after a moment and prep next turn
                setTimeout(() => {
                    if (targetCard) targetCard.classList.remove('taking-damage');
                    setCardActiveState(null, false);
                    setTimeout(executeTurn, 800); // reduced delay between turn handoffs since animations eat up time
                }, 400); // Time for the hit wiggle
            }
        }
    }, 400); // Time for attack/cast wiggle
}

function endCombat(winningSide) {
    combatState.isCombatActive = false;
    setCardActiveState(null, false);
    document.getElementById('finishCombatBtn').classList.remove('hidden');

    // Add match result to save context (for later season ranking systems)
    if (!combatState.saveContext.matchResults) {
        combatState.saveContext.matchResults = [];
    }
    combatState.saveContext.matchResults.push({
        won: winningSide === 'player',
        day: combatState.saveContext.day,
        month: combatState.saveContext.month,
        year: combatState.saveContext.year
    });
}

function finishCombatTransition() {
    document.getElementById('combatScreen').classList.add('hidden');

    // Create a news log about the combat
    const newsList = document.getElementById('newsList');
    if (newsList) {
        const lastResult = combatState.saveContext.matchResults[combatState.saveContext.matchResults.length - 1];

        // Grant match rewards
        const reward = lastResult.won ? 1000 : 500;
        combatState.saveContext.gold = (combatState.saveContext.gold || 0) + reward;

        // Update opponent team record
        const oppId = combatState.opponentTeamId;
        const oppData = combatState.saveContext.opposingRosters && combatState.saveContext.opposingRosters[oppId];
        if (oppData) {
            if (lastResult.won) {
                oppData.losses = (oppData.losses || 0) + 1;
                oppData.gold = (oppData.gold || 0) + 500;
            } else {
                oppData.wins = (oppData.wins || 0) + 1;
                oppData.gold = (oppData.gold || 0) + 1000;
            }
        }

        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `<p><strong>Match Result</strong>: Your team ${lastResult.won ? 'won' : 'lost'} the match! You earned <span style="color:var(--color-gold-primary);">${reward} G</span>.</p>`;

        // Find insert before first child
        if (newsList.firstChild) {
            newsList.insertBefore(newsItem, newsList.firstChild);
        } else {
            newsList.appendChild(newsItem);
        }
    }

    // Process Permadeath for Player Team
    const deadPlayerCombatants = combatState.combatants.filter(c => c.side === 'player' && c.isDead);
    const permadeaths = [];

    if (!combatState.saveContext.graveyard) {
        combatState.saveContext.graveyard = [];
    }

    deadPlayerCombatants.forEach(combatant => {
        // Find the gladiator in the current roster
        const rosterIndex = combatState.saveContext.roster.findIndex(g => g.id === combatant.id);
        if (rosterIndex !== -1) {
            // Base 60% chance of permadeath at 25 CON. Paladins (75 CON) drop to 20%.
            const deathChance = Math.max(0.10, 0.80 - ((combatant.stats.con || 25) * 0.008));
            if (Math.random() < deathChance) {
                const fallenGlad = combatState.saveContext.roster.splice(rosterIndex, 1)[0];
                combatState.saveContext.graveyard.push(fallenGlad);
                permadeaths.push(fallenGlad);

                // Add a newsfeed entry for the tragedy
                if (newsList) {
                    const deathEntry = document.createElement('div');
                    deathEntry.className = 'news-item';
                    deathEntry.style.borderLeftColor = '#ff4444';
                    deathEntry.innerHTML = `<p><strong>Tragedy</strong>: ${fallenGlad.name} ${fallenGlad.surname} was slain in the arena and did not survive.</p>`;
                    if (newsList.firstChild) {
                        newsList.insertBefore(deathEntry, newsList.firstChild);
                    } else {
                        newsList.appendChild(deathEntry);
                    }
                }
            } else {
                // If they survive, set their HP to 1 so they aren't dead next time
                combatState.saveContext.roster[rosterIndex].hp = 1;
            }
        }
    });

    // Award Battle XP to all player gladiators who survived (still in roster)
    const participantIds = new Set(combatState.combatants.filter(c => c.side === 'player').map(c => c.id));
    combatState.saveContext.roster.forEach(glad => {
        if (!participantIds.has(glad.id)) return; // didn't fight
        // Ensure baseStats exists for legacy gladiators
        if (!glad.baseStats) {
            glad.baseStats = { str: glad.stats.str, dex: glad.stats.dex, int: glad.stats.int, wis: glad.stats.wis, con: glad.stats.con || 25 };
        }
        if (glad.baseStats.con === undefined) glad.baseStats.con = glad.stats.con || 25;

        glad.battles = (glad.battles || 0) + 1;
        // Recalculate stats: baseStats + battles bonus
        const b = glad.battles;
        glad.stats = {
            str: glad.baseStats.str + b,
            dex: glad.baseStats.dex + b,
            int: glad.baseStats.int + b,
            wis: glad.baseStats.wis + b,
            con: glad.baseStats.con + b
        };
        // Recalculate maxHP from new CON
        glad.maxHp = Math.floor(50 + (glad.stats.con * 2));
    });

    // Display Casualties Modal if present
    if (permadeaths.length > 0) {
        const casualtiesModal = document.getElementById('casualtiesModal');
        const casualtiesList = document.getElementById('casualtiesList');
        if (casualtiesModal && casualtiesList) {
            casualtiesList.innerHTML = '';
            permadeaths.forEach(g => {
                const d = document.createElement('div');
                d.style.color = 'var(--color-accent-danger)';
                d.style.marginBottom = '0.5rem';
                d.textContent = `- ${g.name} ${g.surname} (${g.class})`;
                casualtiesList.appendChild(d);
            });
            casualtiesModal.classList.remove('hidden');
        }
    }

    // Advance past the match day automatically so we aren't stuck on it
    simulateLeagueMatches(combatState.saveContext);

    combatState.saveContext.day += 1;
    if (combatState.saveContext.day > 28) {
        combatState.saveContext.day = 1;
        combatState.saveContext.month += 1;
        if (combatState.saveContext.month > 12) {
            combatState.saveContext.month = 1;
            combatState.saveContext.year += 1;
        }
    }

    localStorage.setItem('gladiatorSaveContext', JSON.stringify(combatState.saveContext));

    // Go back to Home Screen
    const homeScreen = document.getElementById('homeScreen');
    if (homeScreen) homeScreen.classList.remove('hidden');

    // Re-render UI
    if (typeof renderRoster === 'function') renderRoster();
    if (typeof renderCalendar === 'function') renderCalendar(combatState.saveContext);
    if (typeof setupAdvanceTimeBtn === 'function') setupAdvanceTimeBtn();
}

function simulateLeagueMatches(saveContext) {
    const totalDaysElapsed = ((saveContext.year - 1) * 12 * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
    const currentWeekIndex = Math.floor(totalDaysElapsed / 7);
    if (!saveContext.schedule || currentWeekIndex >= saveContext.schedule.length) return;

    const weekMatches = saveContext.schedule[currentWeekIndex];
    const aiMatches = weekMatches.filter(m => m.home !== saveContext.teamId && m.away !== saveContext.teamId);

    aiMatches.forEach(match => {
        simulateAIMatch(match.home, match.away, saveContext);
    });
}

function simulateAIMatch(teamAId, teamBId, saveContext) {
    const teamAData = saveContext.opposingRosters[teamAId];
    const rosterA = teamAData ? (teamAData.roster || teamAData) : [];

    const teamBData = saveContext.opposingRosters[teamBId];
    const rosterB = teamBData ? (teamBData.roster || teamBData) : [];

    if (rosterA.length === 0 || rosterB.length === 0) return;

    const selectSmartFormation = (roster, side) => {
        let sortedRoster = roster.slice().sort((a, b) => {
            const hpA = a.hp !== undefined ? a.hp : (a.maxHp || (30 + a.stats.str * 2));
            const hpB = b.hp !== undefined ? b.hp : (b.maxHp || (30 + b.stats.str * 2));
            const maxHpA = a.maxHp || (30 + a.stats.str * 2);
            const maxHpB = b.maxHp || (30 + b.stats.str * 2);

            const scoreA = getPrimaryStat(a) * (hpA / maxHpA);
            const scoreB = getPrimaryStat(b) * (hpB / maxHpB);

            return scoreB - scoreA;
        });

        let activeFighters = sortedRoster.slice(0, 5);
        let tanks = [], squishies = [], flexible = [];

        activeFighters.forEach(g => {
            if (g.class === 'Mage' || g.class === 'Cleric') squishies.push(g);
            else if (g.class === 'Warrior' || g.class === 'Paladin') tanks.push(g);
            else flexible.push(g);
        });

        tanks.sort((a, b) => (b.hp !== undefined ? b.hp : (b.maxHp || 0)) - (a.hp !== undefined ? a.hp : (a.maxHp || 0)));
        squishies.sort((a, b) => (a.hp !== undefined ? a.hp : (a.maxHp || 0)) - (b.hp !== undefined ? b.hp : (b.maxHp || 0)));

        let formation = [null, null, null, null, null];

        // Side 'B' (right side): player/A attacks slot 1 first → tank in slot 1, squishy in slot 2
        // Side 'A' (left side): opponent/B attacks slot 2 first → tank in slot 2, squishy in slot 1
        const frontSlot = (side === 'B') ? 1 : 2;
        const backSlot = (side === 'B') ? 2 : 1;

        if (tanks.length > 0) formation[frontSlot] = tanks.shift();
        else if (flexible.length > 0) formation[frontSlot] = flexible.shift();
        else formation[frontSlot] = squishies.shift();

        if (squishies.length > 0) formation[backSlot] = squishies.shift();
        else if (flexible.length > 0) formation[backSlot] = flexible.shift();
        else formation[backSlot] = tanks.shift();

        // Midline: slots 0, 3, 4
        let remaining = [...tanks, ...flexible, ...squishies];
        formation[0] = remaining.shift() || null;
        formation[3] = remaining.shift() || null;
        formation[4] = remaining.shift() || null;

        return formation;
    };

    const formationA = selectSmartFormation(rosterA, 'A');
    const formationB = selectSmartFormation(rosterB, 'B');

    let combatants = [];
    formationA.forEach((glad, i) => {
        if (glad) {
            setupCombatant(glad, 'A');
            glad.formationIndex = i;
            combatants.push(glad);
        }
    });
    formationB.forEach((glad, i) => {
        if (glad) {
            setupCombatant(glad, 'B');
            glad.formationIndex = i;
            combatants.push(glad);
        }
    });

    // Fast-forward combat until one side is dead or 100 turns limit
    let turns = 0;
    while (turns < 100) {
        let aliveA = combatants.filter(c => c.side === 'A' && !c.isDead);
        let aliveB = combatants.filter(c => c.side === 'B' && !c.isDead);

        if (aliveA.length === 0 || aliveB.length === 0) break;

        combatants.sort((a, b) => b.stats.dex - a.stats.dex); // Highest dex first

        for (let attacker of combatants) {
            if (attacker.isDead) continue;

            // Hunters and Mages can target any living enemy
            let opponents = (attacker.class === 'Hunter' || attacker.class === 'Mage')
                ? combatants.filter(c => c.side !== attacker.side && !c.isDead)
                : getValidTargets(attacker, combatants);
            if (opponents.length === 0) break;

            let target = opponents[Math.floor(Math.random() * opponents.length)];
            let isPhysicalAttack = ['Warrior', 'Paladin', 'Rogue', 'Hunter'].includes(attacker.class);
            let targetDodged = false;

            if (isPhysicalAttack) {
                let dodgeChance = (target.stats.dex - attacker.baseDamage) * 0.01;
                if (dodgeChance < 0) dodgeChance = 0;
                if (dodgeChance > 0.40) dodgeChance = 0.40;
                if (Math.random() < dodgeChance) targetDodged = true;
            }

            if (!targetDodged || attacker.class === 'Mage') {
                const variance = (0.8 + (Math.random() * 0.4));
                let effectAmount = Math.floor(attacker.baseDamage * variance);
                if (effectAmount < 1) effectAmount = 1;

                // Rogue: Critical chance scales with DEX (up to 50%)
                const critChance = Math.min(0.5, attacker.stats.dex * 0.004);
                if (attacker.class === 'Rogue' && Math.random() < critChance) {
                    effectAmount *= 2;
                }

                if (attacker.class === 'Cleric') {
                    if (Math.random() < 0.5) {
                        let allies = attacker.side === 'A' ? combatants.filter(c => c.side === 'A' && !c.isDead && c.hp < c.maxHp) : combatants.filter(c => c.side === 'B' && !c.isDead && c.hp < c.maxHp);
                        if (allies.length > 0) {
                            let healTarget = allies[0];
                            healTarget.hp += Math.floor(attacker.baseDamage * 0.5 * variance);
                            if (healTarget.hp > healTarget.maxHp) healTarget.hp = healTarget.maxHp;
                            continue; // skip attack
                        }
                    }
                }

                if (attacker.class === 'Mage') {
                    let adjacentIndices = [];
                    const tIdx = target.formationIndex;
                    if (tIdx === 0) adjacentIndices = [4];
                    else if (tIdx === 1) adjacentIndices = [4];
                    else if (tIdx === 2) adjacentIndices = [4];
                    else if (tIdx === 3) adjacentIndices = [4];
                    else if (tIdx === 4) adjacentIndices = [0, 1, 2, 3];

                    const splashTargets = combatants.filter(c => c.side === target.side && !c.isDead && adjacentIndices.includes(c.formationIndex));
                    const totalTargetsCaught = 1 + splashTargets.length;
                    const splitDamage = Math.max(1, Math.floor(effectAmount / totalTargetsCaught));

                    target.hp -= splitDamage;
                    if (target.hp <= 0) { target.hp = 0; target.isDead = true; }

                    splashTargets.forEach(st => {
                        st.hp -= splitDamage;
                        if (st.hp <= 0) { st.hp = 0; st.isDead = true; }
                    });
                } else {
                    target.hp -= effectAmount;
                    if (target.hp <= 0) {
                        target.hp = 0;
                        target.isDead = true;
                    }
                }
            }
        }
        turns++;
    }
    // Award Battle XP to all AI participants
    const participantIds = new Set(combatants.map(c => c.id));
    rosterA.forEach(glad => {
        if (!participantIds.has(glad.id)) return;
        if (!glad.baseStats) {
            glad.baseStats = { str: glad.stats.str, dex: glad.stats.dex, int: glad.stats.int, wis: glad.stats.wis, con: glad.stats.con || 25 };
        }
        if (glad.baseStats.con === undefined) glad.baseStats.con = glad.stats.con || 25;
        glad.battles = (glad.battles || 0) + 1;
        const b = glad.battles;
        glad.stats = {
            str: glad.baseStats.str + b,
            dex: glad.baseStats.dex + b,
            int: glad.baseStats.int + b,
            wis: glad.baseStats.wis + b,
            con: glad.baseStats.con + b
        };
        glad.maxHp = Math.floor(50 + (glad.stats.con * 2));
    });
    rosterB.forEach(glad => {
        if (!participantIds.has(glad.id)) return;
        if (!glad.baseStats) {
            glad.baseStats = { str: glad.stats.str, dex: glad.stats.dex, int: glad.stats.int, wis: glad.stats.wis, con: glad.stats.con || 25 };
        }
        if (glad.baseStats.con === undefined) glad.baseStats.con = glad.stats.con || 25;
        glad.battles = (glad.battles || 0) + 1;
        const b = glad.battles;
        glad.stats = {
            str: glad.baseStats.str + b,
            dex: glad.baseStats.dex + b,
            int: glad.baseStats.int + b,
            wis: glad.baseStats.wis + b,
            con: glad.baseStats.con + b
        };
        glad.maxHp = Math.floor(50 + (glad.stats.con * 2));
    });

    // Process deaths
    const deadA = combatants.filter(c => c.side === 'A' && c.isDead);
    const deadB = combatants.filter(c => c.side === 'B' && c.isDead);

    deadA.forEach(deadGlad => {
        if (Math.random() < 0.5) {
            const rIndex = rosterA.findIndex(g => g.id === deadGlad.id);
            if (rIndex !== -1) rosterA.splice(rIndex, 1);
        } else {
            deadGlad.hp = 1;
        }
    });

    deadB.forEach(deadGlad => {
        if (Math.random() < 0.5) {
            const rIndex = rosterB.findIndex(g => g.id === deadGlad.id);
            if (rIndex !== -1) rosterB.splice(rIndex, 1);
        } else {
            deadGlad.hp = 1;
        }
    });

    // Handle AI Rewards and Track Wins/Losses
    if (teamAData && teamAData.gold !== undefined && teamBData && teamBData.gold !== undefined) {
        // Did teamA wipe?
        let aliveA = combatants.filter(c => c.side === 'A' && !c.isDead).length;
        if (aliveA > 0) {
            // Team A Won
            teamAData.gold += 1000;
            teamBData.gold += 500;
            teamAData.wins = (teamAData.wins || 0) + 1;
            teamBData.losses = (teamBData.losses || 0) + 1;
        } else {
            // Team B Won
            teamBData.gold += 1000;
            teamAData.gold += 500;
            teamBData.wins = (teamBData.wins || 0) + 1;
            teamAData.losses = (teamAData.losses || 0) + 1;
        }
    }
}
