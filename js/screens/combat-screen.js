// Combat Screen Logic

const toggleLogBtn = document.getElementById('toggleCombatLogBtn');
if (toggleLogBtn) {
    toggleLogBtn.addEventListener('click', () => {
        const panel = document.getElementById('combatCenterPanel');
        if (panel) {
            if (panel.style.visibility === 'hidden') {
                panel.style.visibility = 'visible';
                toggleLogBtn.textContent = 'Hide Combat Log';
            } else {
                panel.style.visibility = 'hidden';
                toggleLogBtn.textContent = 'Show Combat Log';
            }
        }
    });
}



let combatState = {
    combatants: [],
    turnIndex: 0,
    saveContext: null,
    isCombatActive: false,
    opponentTeamId: null,
    healingDampener: 100,
    timeMultiplier: 1,
    isPaused: false
};

// Initialize Combat Controls
function setupCombatControls() {
    const pauseBtn = document.getElementById('combatPauseBtn');
    const ffBtn = document.getElementById('combatFastForwardBtn');

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            combatState.isPaused = !combatState.isPaused;
            pauseBtn.innerHTML = combatState.isPaused
                ? '<span class="material-icons">play_arrow</span>'
                : '<span class="material-icons">pause</span>';
            pauseBtn.classList.toggle('paused', combatState.isPaused);
            if (!combatState.isPaused) {
                // If we were waiting for a turn, trigger it check
                // (Though the wait function handles the loop)
            }
        });
    }

    if (ffBtn) {
        ffBtn.addEventListener('click', () => {
            const combatScreen = document.getElementById('combatScreen');
            if (combatState.timeMultiplier === 1) {
                combatState.timeMultiplier = 5;
                ffBtn.innerHTML = '<span class="material-icons">fast_forward</span><span style="font-size: 0.6rem; margin-left: 2px;">5X</span>';
                ffBtn.classList.add('active');
                if (combatScreen) combatScreen.style.setProperty('--combat-speed', '5');
            } else {
                combatState.timeMultiplier = 1;
                ffBtn.innerHTML = '<span class="material-icons">fast_forward</span>';
                ffBtn.classList.remove('active');
                if (combatScreen) combatScreen.style.setProperty('--combat-speed', '1');
            }
        });
    }
}
setupCombatControls();

const wait = ms => new Promise(res => {
    let remaining = ms;
    const check = () => {
        if (!combatState.isCombatActive) return res(); // Cleanup if combat ends
        if (!combatState.isPaused) {
            remaining -= 50 * combatState.timeMultiplier;
            if (remaining <= 0) return res();
        }
        setTimeout(check, 50);
    };
    check();
});

function initializeCombat(playerFormation, opponentFormation, saveContext, opponentTeamInfo, isHome) {
    combatState.saveContext = saveContext;
    combatState.combatants = [];
    combatState.turnIndex = 0;
    combatState.isCombatActive = true;
    combatState.opponentTeamId = opponentTeamInfo.id;
    combatState.healingDampener = 100;
    combatState.timeMultiplier = 1;
    combatState.isPaused = false;

    // Reset Controls UI
    const pauseBtn = document.getElementById('combatPauseBtn');
    const ffBtn = document.getElementById('combatFastForwardBtn');
    if (pauseBtn) {
        pauseBtn.innerHTML = '<span class="material-icons">pause</span>';
        pauseBtn.classList.remove('paused');
    }
    if (ffBtn) {
        ffBtn.innerHTML = '<span class="material-icons">fast_forward</span>';
        ffBtn.classList.remove('active');
    }

    // Reset Dampener UI
    const dampenerDisplay = document.getElementById('healingDampenerDisplay');
    if (dampenerDisplay) {
        dampenerDisplay.innerHTML = 'Healing<br>100%';
        dampenerDisplay.style.color = 'var(--color-accent-success)';
    }

    // Show Match Screen, Show Combat Screen
    document.getElementById('matchScreen').classList.add('hidden');
    const combatScreen = document.getElementById('combatScreen');
    combatScreen.classList.remove('hidden');
    combatScreen.style.setProperty('--combat-speed', '1');

    // Determine if this is the Aowan Cup
    const totalDaysElapsed = ((saveContext.year - 1) * MONTHS_PER_YEAR * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
    const currentWeekIndex = Math.floor(totalDaysElapsed / 7) % (MONTHS_PER_YEAR * 4);
    const isCup = currentWeekIndex === 19;

    // Set dynamic combat background
    if (isCup) {
        combatScreen.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('assets/ui/colosseum.png')`;
    } else {
        const arenaId = isHome ? saveContext.teamId : opponentTeamInfo.id;
        combatScreen.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('assets/arenas/arena_${arenaId}.png')`;
    }
    combatScreen.style.backgroundSize = 'cover';
    combatScreen.style.backgroundPosition = 'center bottom';

    document.getElementById('combatPlayerHeader').innerHTML = `
        <div class="team-header-vertical" style="color: var(--team-primary); text-shadow: 0 0 10px rgba(0,0,0,0.8);">
            <img src="${saveContext.teamLogo}" class="team-logo-large" alt="${saveContext.teamName} Logo">
            <span style="background-color: ${getContrastColor('var(--team-primary)')};">${saveContext.teamName}</span>
        </div>
    `;

    document.getElementById('combatOpponentHeader').innerHTML = `
        <div class="team-header-vertical" style="color: ${opponentTeamInfo.primaryColor}; text-shadow: 0 0 10px rgba(0,0,0,0.8);">
            <img src="${opponentTeamInfo.logo}" class="team-logo-large" alt="${opponentTeamInfo.name} Logo">
            <span style="background-color: ${getContrastColor(opponentTeamInfo.primaryColor)};">${opponentTeamInfo.name}</span>
        </div>
    `;
    document.getElementById('combatLog').innerHTML = ''; // clear previous logs

    const combatCenterPanel = document.getElementById('combatCenterPanel');
    if (combatCenterPanel) {
        combatCenterPanel.style.visibility = 'hidden';
    }
    const toggleCombatLogBtn = document.getElementById('toggleCombatLogBtn');
    if (toggleCombatLogBtn) {
        toggleCombatLogBtn.textContent = 'Show Combat Log';
    }

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
    wait(1000).then(executeTurn);
}

function setupCombatant(glad, side) {
    glad.side = side;

    if (glad.maxHp === undefined) {
        // Fallback for older saves
        glad.maxHp = calculateMaxHp(glad);
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

    const damageScale = 1.0;
    glad.baseDamage = Math.floor(primaryStat * damageScale);

    // Paladin Divine Shield state
    glad.divineShieldAvailable = (glad.class === 'Paladin');
    glad.divineShieldActive = false;
}

/**
 * Checks if a target should die or if Divine Shield saves them.
 * Call after reducing target.hp. Returns true if the target died.
 */
function applyLethalCheck(target) {
    if (target.hp <= 0) {
        // Check for Paladin Divine Shield activation
        if (target.class === 'Paladin' && target.divineShieldAvailable) {
            target.hp = 1;
            target.divineShieldActive = true;
            target.divineShieldAvailable = false;
            showFloatingText(target.id, 'Divine Shield!', 'divine');
            logCombat(`<strong>${target.name}</strong> calls upon <span style="color:#ffd700">Divine Shield</span>! Death is denied until their next turn!`, 'critical');
            const card = document.getElementById(`combatant-${target.id}`);
            if (card) card.classList.add('divine-shield');
            return false; // Not dead
        }
        // Check if Divine Shield is already active (absorbs subsequent lethal hits)
        if (target.divineShieldActive) {
            target.hp = 1;
            showFloatingText(target.id, 'Shielded!', 'divine');
            return false;
        }
        target.hp = 0;
        target.isDead = true;
        return true; // Died
    }
    return false; // Didn't reach 0 HP
}

// buildSquareGladiatorCard moved to js/ui/components.js

function renderCombatSide(side) {
    const container = document.getElementById(side === 'player' ? 'combatPlayerTeam' : 'combatOpponentTeam');

    // Clear all slots first (set to empty slot graphic)
    const slots = container.querySelectorAll('.formation-slot');
    slots.forEach(slot => slot.innerHTML = '<img src="assets/ui/empty_slot.png" alt="Empty Slot" style="width:100%;height:100%;object-fit:cover;border-radius:4px;opacity:0.6;">');

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

        let borderColor = 'var(--team-primary)';
        if (side === 'opponent') {
            const oppTeamInfo = TEAMS.find(t => t.id === combatState.opponentTeamId);
            if (oppTeamInfo) borderColor = oppTeamInfo.primaryColor;
        }
        card.style.borderColor = borderColor;

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

function showFloatingText(gladId, text, type) {
    const card = document.getElementById(`combatant-${gladId}`);
    if (!card) return;

    const floating = document.createElement('div');
    floating.className = `floating-text ${type}`;
    floating.textContent = text;

    card.appendChild(floating);

    card.appendChild(floating);

    wait(1500).then(() => {
        if (floating.parentNode === card) {
            floating.remove();
        }
    });
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

async function executeTurn() {
    if (!combatState.isCombatActive) return;

    const attacker = combatState.combatants[combatState.turnIndex];

    // Cycle turn index for next time
    combatState.turnIndex = (combatState.turnIndex + 1) % combatState.combatants.length;

    // Skip turn if actor is dead
    if (attacker.isDead) {
        executeTurn(); // immediately go to next turn
        return;
    }

    // Consume Divine Shield at the start of the Paladin's turn
    if (attacker.divineShieldActive) {
        attacker.divineShieldActive = false;
        const card = document.getElementById(`combatant-${attacker.id}`);
        if (card) card.classList.remove('divine-shield');
        showFloatingText(attacker.id, 'Shield Faded', 'divine-fade');
        logCombat(`<strong>${attacker.name}</strong>'s <span style="color:#aaa">Divine Shield</span> fades away.`);
    }

    setCardActiveState(attacker.id, true);

    function animateProjectile(startElem, endElem, imageUrl, duration = 400) {
        const scaledDuration = duration / combatState.timeMultiplier;
        return new Promise(resolve => {
            if (!startElem || !endElem) {
                resolve();
                return;
            }

            const startRect = startElem.getBoundingClientRect();
            const endRect = endElem.getBoundingClientRect();

            const projectile = document.createElement('img');
            projectile.src = imageUrl;
            projectile.className = 'projectile';
            projectile.style.transition = `left ${scaledDuration}ms linear, top ${scaledDuration}ms linear`;

            // Adjust dimensions based on the sprite
            if (imageUrl === 'assets/ui/arrow.png') {
                projectile.style.width = '60px';
                projectile.style.height = '60px';
            } else {
                projectile.style.width = '120px';
                projectile.style.height = '120px';
            }

            projectile.style.left = `${startRect.left + startRect.width / 2}px`;
            projectile.style.top = `${startRect.top + startRect.height / 2}px`;

            // Calculate rotation to face the target
            const dx = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
            const dy = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);
            const angle = (Math.atan2(dy, dx) * 180 / Math.PI) + 180;

            projectile.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

            document.body.appendChild(projectile);

            // Trigger animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    projectile.style.left = `${endRect.left + endRect.width / 2}px`;
                    projectile.style.top = `${endRect.top + endRect.height / 2}px`;
                });
            });

            wait(duration).then(() => {
                projectile.remove();
                resolve();
            });
        });
    }

    function animateMeleeBump(attackerElem, targetElems, duration = 400) {
        const scaledDuration = duration / combatState.timeMultiplier;
        return new Promise(resolve => {
            if (!attackerElem || !targetElems) {
                resolve(() => Promise.resolve());
                return;
            }

            const targets = Array.isArray(targetElems) ? targetElems : [targetElems];
            if (targets.length === 0) {
                resolve(() => Promise.resolve());
                return;
            }

            // Calculate the average center position of all targets
            let avgTargetX = 0;
            let avgTargetY = 0;
            let validTargetCount = 0;

            targets.forEach(el => {
                if (el) {
                    const rect = el.getBoundingClientRect();
                    avgTargetX += rect.left + rect.width / 2;
                    avgTargetY += rect.top + rect.height / 2;
                    validTargetCount++;
                }
            });

            if (validTargetCount === 0) {
                resolve(() => Promise.resolve());
                return;
            }

            avgTargetX /= validTargetCount;
            avgTargetY /= validTargetCount;

            const attackerRect = attackerElem.getBoundingClientRect();
            const attackerCenterX = attackerRect.left + attackerRect.width / 2;
            const attackerCenterY = attackerRect.top + attackerRect.height / 2;

            // Total distance to target midpoint
            const dx = avgTargetX - attackerCenterX;
            const dy = avgTargetY - attackerCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // We want to stop within half a character card's width of the target center
            // Card width is attackerRect.width
            const stopGap = attackerRect.width / 2;
            const lungeDist = Math.max(0, dist - stopGap);

            // Normalize direction and scale by lungeDist
            const lungeX = (dx / dist) * lungeDist;
            const lungeY = (dy / dist) * lungeDist;

            attackerElem.style.transition = `transform ${scaledDuration / 3}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
            attackerElem.style.zIndex = "1000";
            attackerElem.style.transform = `translate(${lungeX}px, ${lungeY}px) scale(1.05)`;

            const returnToOrigin = () => {
                return new Promise(res => {
                    attackerElem.style.transition = `transform ${scaledDuration / 2}ms ease-in`;
                    attackerElem.style.transform = "";
                    wait(duration / 2).then(() => {
                        attackerElem.style.transition = "";
                        attackerElem.style.zIndex = "";
                        res();
                    });
                });
            };

            // Resolve Phase 1 after the lunge transition
            wait(duration / 3).then(() => {
                resolve(returnToOrigin);
            });
        });
    }

    // Process Actions
    await wait(400); // Initial delay

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

    if (attacker.class === 'Cleric' && combatState.healingDampener > 0) {
        const allAliveFriendlies = combatState.combatants.filter(c => c.side === attacker.side && !c.isDead);

        // Only attempt to heal if the Cleric is not the last person alive on their team
        if (allAliveFriendlies.length > 1) {
            const friendliesNeedingHeal = allAliveFriendlies.filter(c => c.hp < c.maxHp);
            if (friendliesNeedingHeal.length > 0) {
                target = friendliesNeedingHeal.reduce((lowest, current) => {
                    const currentPct = current.hp / current.maxHp;
                    const lowestPct = lowest.hp / lowest.maxHp;
                    return currentPct < lowestPct ? current : lowest;
                });
                actionType = 'heal';
                const variance = (0.8 + (Math.random() * 0.4));
                effectAmount = Math.floor(attacker.baseDamage * 1.5 * variance); // Heals equivalent to base damage
            }
        }
    }

    if (actionType === 'attack') {
        target = validTargets[Math.floor(Math.random() * validTargets.length)];
        const variance = (0.8 + (Math.random() * 0.4));

        // If a Cleric is attacking, override baseDamage to use STR instead of WIS
        let attackDamage = attacker.baseDamage;
        if (attacker.class === 'Cleric') {
            attackDamage = attacker.stats.str * 1.5;
        }

        effectAmount = Math.floor(attackDamage * variance);
        if (effectAmount < 1) effectAmount = 1;

        // Rogue: Critical chance scales with DEX (up to 50%)
        const critChance = Math.min(0.5, attacker.stats.dex * 0.004);
        if (attacker.class === 'Rogue' && Math.random() < critChance) {
            effectAmount *= 2;
            actionType = 'rogue_crit';
        }

        // Hunter unique mechanical override: Animate arrow
        if (attacker.class === 'Hunter') {
            actionType = 'arrow';
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
    await wait(400);
    if (attackerCard) attackerCard.classList.remove('attacking');

    const targetCard = document.getElementById(`combatant-${target.id}`);

    if (actionType === 'heal') {
        if (targetCard) targetCard.classList.add('receiving-heal');

        // Apply dampener
        effectAmount = Math.max(1, Math.floor(effectAmount * (combatState.healingDampener / 100)));

        target.hp += effectAmount;
        if (target.hp > target.maxHp) target.hp = target.maxHp;

        showFloatingText(target.id, `+${effectAmount}`, 'heal');
        logCombat(`<strong>${attacker.name}</strong> casts Heal on <strong>${target.name}</strong> for <span style="color:#4caf50">${effectAmount} HP</span>!`);
        updateCombatantUI(target);

        // Reduce dampener
        combatState.healingDampener = Math.max(0, combatState.healingDampener - 5);
        const dampenerDisplay = document.getElementById('healingDampenerDisplay');
        if (dampenerDisplay) {
            dampenerDisplay.innerHTML = `Healing<br>${combatState.healingDampener}%`;
            if (combatState.healingDampener === 0) {
                dampenerDisplay.style.color = 'var(--color-accent-danger)';
            } else if (combatState.healingDampener <= 50) {
                dampenerDisplay.style.color = 'var(--color-gold-light)';
            } else {
                dampenerDisplay.style.color = 'var(--color-accent-success)';
            }
        }

        await wait(400);
        if (targetCard) targetCard.classList.remove('receiving-heal');
        setCardActiveState(null, false);
        await wait(800);
        executeTurn();
    } else {
        // Check for Dodge against physical attacks
        let isPhysicalAttack = ['Warrior', 'Paladin', 'Rogue', 'Hunter'].includes(attacker.class);
        let targetDodged = false;

        if (isPhysicalAttack) {
            // Calculate dodge chance
            let dex = target.stats.dex;
            let dodgeChance = ((17 / 2376) * Math.pow(dex, 2)) - ((161 / 792) * dex);
            dodgeChance = dodgeChance / 100;

            if (dodgeChance < 0) dodgeChance = 0;
            if (dodgeChance > 0.50) dodgeChance = 0.50;

            if (Math.random() < dodgeChance) {
                targetDodged = true;
            }
        }

        if (actionType === 'fireball') {
            // Mage unique mechanical override: Splash damage
            const variance = (0.8 + (Math.random() * 0.4));
            effectAmount = Math.floor(attacker.baseDamage * 1.5 * variance);

            let adjacentIndices = [];
            const tIdx = target.formationIndex;
            if (tIdx === 0) adjacentIndices = [4];
            else if (tIdx === 1) adjacentIndices = [4];
            else if (tIdx === 2) adjacentIndices = [4];
            else if (tIdx === 3) adjacentIndices = [4];
            else if (tIdx === 4) adjacentIndices = [0, 1, 2, 3];

            const splashTargets = combatState.combatants.filter(c => c.side === target.side && !c.isDead && adjacentIndices.includes(c.formationIndex));
            const totalTargetsCaught = 1 + splashTargets.length;
            const splitDamage = Math.max(1, Math.floor(effectAmount / totalTargetsCaught));

            logCombat(`<strong>${attacker.name}</strong> hurls a <span style="color:#ff8800">Fireball</span> at <strong>${target.name}</strong>, scorching ${totalTargetsCaught} enemies for ${splitDamage} damage each!`);

            await animateProjectile(attackerCard, targetCard, 'assets/ui/fireball.png', 400);

            if (targetCard) targetCard.classList.add('taking-damage');
            target.hp -= splitDamage;
            showFloatingText(target.id, `-${splitDamage}`, 'damage');
            if (applyLethalCheck(target)) {
                logCombat(`--> <strong>${target.name}</strong> was burned to ashes!`, 'death');
            }
            updateCombatantUI(target);

            if (splashTargets.length > 0) {
                const splashAnimations = splashTargets.map(st => {
                    const stCard = document.getElementById(`combatant-${st.id}`);
                    return animateProjectile(targetCard, stCard, 'assets/ui/fireball.png', 250);
                });
                await Promise.all(splashAnimations);
            }

            splashTargets.forEach(st => {
                const stCard = document.getElementById(`combatant-${st.id}`);
                if (stCard) stCard.classList.add('taking-damage');
                st.hp -= splitDamage;
                showFloatingText(st.id, `-${splitDamage}`, 'damage');
                if (applyLethalCheck(st)) {
                    logCombat(`--> <strong>${st.name}</strong> was caught in the blast and died!`, 'death');
                }
                updateCombatantUI(st);
            });

            await wait(500);
            if (targetCard) targetCard.classList.remove('taking-damage');
            splashTargets.forEach(st => {
                const stCard = document.getElementById(`combatant-${st.id}`);
                if (stCard) stCard.classList.remove('taking-damage');
            });

            await wait(400);
            setCardActiveState(null, false);
            await wait(400);
            executeTurn();

        } else if (actionType === 'arrow') {
            await animateProjectile(attackerCard, targetCard, 'assets/ui/arrow.png', 300);

            if (targetDodged) {
                showFloatingText(target.id, 'Dodge!', 'dodge');
                logCombat(`<strong>${attacker.name}</strong> shoots an arrow at <strong>${target.name}</strong>, but they <em>dodged</em> it!`, 'normal');
            } else {
                if (targetCard) targetCard.classList.add('taking-damage');
                target.hp -= effectAmount;
                showFloatingText(target.id, `-${effectAmount}`, 'damage');
                logCombat(`<strong>${attacker.name}</strong> shoots an arrow at <strong>${target.name}</strong> for ${effectAmount} damage!`);

                if (applyLethalCheck(target)) {
                    logCombat(`--> <strong>${target.name}</strong> was shot down!`, 'death');
                }
                updateCombatantUI(target);
            }

            await wait(500);
            if (targetCard) targetCard.classList.remove('taking-damage');
            setCardActiveState(null, false);
            await wait(400);
            executeTurn();

        } else if (attacker.class === 'Warrior') {
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

            const targetCards = [targetCard];
            cleaveTargets.forEach(ct => {
                const ctCard = document.getElementById(`combatant-${ct.id}`);
                if (ctCard) targetCards.push(ctCard);
            });
            const returnToOrigin = await animateMeleeBump(attackerCard, targetCards);

            if (cleaveTargets.length > 0) {
                logCombat(`<strong>${attacker.name}</strong> <span style="color:#d32f2f">CLEAVES</span> <strong>${target.name}</strong>, striking ${totalTargetsCaught} enemies for ${splitDamage} damage each!`);
            } else {
                logCombat(`<strong>${attacker.name}</strong> attacks <strong>${target.name}</strong> for ${splitDamage} damage!`);
            }

            if (targetDodged) {
                showFloatingText(target.id, 'Dodge!', 'dodge');
                logCombat(`<strong>${attacker.name}</strong> attacks <strong>${target.name}</strong>, but they <em>dodged</em> the blow!`, 'normal');
            } else {
                if (targetCard) targetCard.classList.add('taking-damage');
                target.hp -= splitDamage;
                showFloatingText(target.id, `-${splitDamage}`, 'damage');
                if (applyLethalCheck(target)) {
                    logCombat(`--> <strong>${target.name}</strong> has been struck down!`, 'death');
                }
                updateCombatantUI(target);
            }

            cleaveTargets.forEach(ct => {
                const ctCard = document.getElementById(`combatant-${ct.id}`);
                if (ctCard) ctCard.classList.add('taking-damage');
                ct.hp -= splitDamage;
                showFloatingText(ct.id, `-${splitDamage}`, 'damage');
                if (applyLethalCheck(ct)) {
                    logCombat(`--> <strong>${ct.name}</strong> was caught in the cleave and died!`, 'death');
                }
                updateCombatantUI(ct);
            });

            await returnToOrigin();
            await wait(200);

            if (targetCard) targetCard.classList.remove('taking-damage');
            cleaveTargets.forEach(ct => {
                const ctCard = document.getElementById(`combatant-${ct.id}`);
                if (ctCard) ctCard.classList.remove('taking-damage');
            });

            setCardActiveState(null, false);
            await wait(400);
            executeTurn();

        } else {
            const returnToOrigin = await animateMeleeBump(attackerCard, targetCard);

            if (targetDodged) {
                showFloatingText(target.id, 'Dodge!', 'dodge');
                logCombat(`<strong>${attacker.name}</strong> attacks <strong>${target.name}</strong>, but they <em>dodged</em> the blow!`, 'normal');
            } else {
                if (targetCard) targetCard.classList.add('taking-damage');

                target.hp -= effectAmount;
                let dmgType = actionType === 'rogue_crit' ? 'crit' : 'damage';
                showFloatingText(target.id, `-${effectAmount}`, dmgType);
                if (actionType === 'rogue_crit') {
                    logCombat(`<strong>${attacker.name}</strong> <span style="color:#ffd700">CRITICAL STRIKES</span> <strong>${target.name}</strong> for <span style="color:#ff6666">${effectAmount} damage</span>!`, 'critical');
                } else {
                    logCombat(`<strong>${attacker.name}</strong> attacks <strong>${target.name}</strong> for ${effectAmount} damage!`);
                }

                if (applyLethalCheck(target)) {
                    logCombat(`--> <strong>${target.name}</strong> has been struck down!`, 'death');
                }

                updateCombatantUI(target);
            }

            await returnToOrigin();
            await wait(200);
            if (targetCard) targetCard.classList.remove('taking-damage');
            setCardActiveState(null, false);
            await wait(400);
            executeTurn();
        }
    }
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

        // Determine if this was the Aowan Cup
        const totalDaysElapsed = ((combatState.saveContext.year - 1) * MONTHS_PER_YEAR * 28) + ((combatState.saveContext.month - 1) * 28) + (combatState.saveContext.day - 1);
        const currentWeekIndex = Math.floor(totalDaysElapsed / 7) % (MONTHS_PER_YEAR * 4);
        const isCup = currentWeekIndex === 19;

        // Grant match rewards
        let reward = lastResult.won ? 1000 : 500;
        if (isCup && lastResult.won) {
            reward = 3000; // Grand Prize
            combatState.saveContext.fame = (combatState.saveContext.fame || 0) + 500;
            if (!combatState.saveContext.achievements) combatState.saveContext.achievements = [];
            if (!combatState.saveContext.achievements.includes('Aowan Cup Champion')) {
                combatState.saveContext.achievements.push('Aowan Cup Champion');
            }
        }

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

        // Find player team color
        const playerTeam = TEAMS.find(t => t.id === combatState.saveContext.teamId);
        if (playerTeam && playerTeam.primaryColor) {
            newsItem.style.borderLeftColor = playerTeam.primaryColor;
        }

        if (isCup && lastResult.won) {
            newsItem.style.borderLeft = '4px solid gold';
            newsItem.style.background = 'rgba(255, 215, 0, 0.1)';
            newsItem.innerHTML = `<p><strong style="color:gold;">🏆 AOWAN CUP CHAMPION!</strong> Your team defeated the top seed to claim the Grand Trophy and <span style="color:var(--color-gold-primary);">3000 G</span>! Glory to the arena!</p>`;
        } else {
            newsItem.innerHTML = `<p><strong>Match Result</strong>: Your team ${lastResult.won ? 'won' : 'lost'} the match! You earned <span style="color:var(--color-gold-primary);">${reward} G</span>.</p>`;
        }

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
            // Base 30% chance of permadeath at 25 CON. Decreases to 15% at 75 CON.
            // Formula: 0.30 - ((CON - 25) * 0.003)
            let deathChance = 0.30 - (((combatant.stats.con || 25) - 25) * 0.003);
            if (deathChance < 0.10) deathChance = 0.10; // floor at 10%

            if (Math.random() < deathChance) {
                const fallenGlad = combatState.saveContext.roster.splice(rosterIndex, 1)[0];
                fallenGlad.battles = (fallenGlad.battles || 0) + 1;
                combatState.saveContext.graveyard.push(fallenGlad);
                permadeaths.push(fallenGlad);

                // Add a newsfeed entry for the tragedy
                if (newsList) {
                    const deathEntry = document.createElement('div');
                    deathEntry.className = 'news-item';

                    // Apply player team color to tragedy
                    const playerTeam = TEAMS.find(t => t.id === combatState.saveContext.teamId);
                    if (playerTeam && playerTeam.primaryColor) {
                        deathEntry.style.borderLeftColor = playerTeam.primaryColor;
                    } else {
                        deathEntry.style.borderLeftColor = '#ff4444';
                    }

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
            str: Math.min(99, glad.baseStats.str + b),
            dex: Math.min(99, glad.baseStats.dex + b),
            int: Math.min(99, glad.baseStats.int + b),
            wis: Math.min(99, glad.baseStats.wis + b),
            con: Math.min(99, glad.baseStats.con + b)
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
    if (typeof simulateLeagueMatches === 'function') {
        const saveContext = combatState.saveContext;
        const totalDaysElapsed = ((saveContext.year - 1) * MONTHS_PER_YEAR * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
        const currentWeekIndex = Math.floor(totalDaysElapsed / 7) % (MONTHS_PER_YEAR * 4);
        simulateLeagueMatches(saveContext, currentWeekIndex);
    }

    combatState.saveContext.day += 1;
    if (combatState.saveContext.day > 28) {
        combatState.saveContext.day = 1;
        combatState.saveContext.month += 1;
        if (combatState.saveContext.month > MONTHS_PER_YEAR) {
            combatState.saveContext.month = 1;
            combatState.saveContext.year += 1;
            if (typeof recalculateSeasonData === 'function') {
                recalculateSeasonData(combatState.saveContext);
            }
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


