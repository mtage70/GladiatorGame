// Season & Schedule Logic

function generateSeasonSchedule(playerTeamId) {
    const allTeamIds = TEAMS.map(t => t.id);
    const playerIdx = allTeamIds.indexOf(playerTeamId);
    if (playerIdx !== -1) {
        allTeamIds.splice(playerIdx, 1);
        allTeamIds.unshift(playerTeamId);
    }

    const teamIds = allTeamIds;
    const numTeams = teamIds.length;
    const numDays = numTeams - 1;
    const halfSize = numTeams / 2;
    let firstHalf = [];
    let teams = [...teamIds];
    const fixedTeam = teams.shift();

    for (let day = 0; day < numDays; day++) {
        const weekMatches = [];
        const rotatedTeams = [...teams.slice(day % numDays), ...teams.slice(0, day % numDays)];

        if (day % 2 === 0) {
            weekMatches.push({ home: fixedTeam, away: rotatedTeams[0] });
        } else {
            weekMatches.push({ home: rotatedTeams[0], away: fixedTeam });
        }

        for (let idx = 1; idx < halfSize; idx++) {
            const first = rotatedTeams[idx];
            const second = rotatedTeams[numDays - idx];
            if ((day + idx) % 2 === 0) {
                weekMatches.push({ home: first, away: second });
            } else {
                weekMatches.push({ home: second, away: first });
            }
        }
        firstHalf.push({ matches: weekMatches, simulated: false });
    }

    const secondHalf = firstHalf.map(week => ({
        matches: week.matches.map(match => ({
            home: match.away,
            away: match.home
        })),
        simulated: false
    }));

    return firstHalf.concat(secondHalf);
}

/**
 * Headless combat simulation that replicates all mechanics from combat-screen.js.
 * Returns { winningSide: 'A' | 'B', combatants: [...] }
 */
function simulateAICombat(teamAGlads, teamBGlads) {
    const combatants = [];
    let healingDampener = 100;

    // --- Setup combatants (mirrors setupCombatant) ---
    function setupSim(glad, side, index) {
        const c = {
            id: glad.id,
            name: glad.name,
            class: glad.class,
            stats: { ...glad.stats },
            hp: glad.hp !== undefined ? glad.hp : (glad.maxHp || calculateMaxHp(glad)),
            maxHp: glad.maxHp || calculateMaxHp(glad),
            isDead: false,
            side: side,
            formationIndex: index,
            baseDamage: 0,
            divineShieldAvailable: (glad.class === 'Paladin'),
            divineShieldActive: false,
            sourceGlad: glad // reference to original gladiator object
        };
        c.isDead = c.hp <= 0;

        // Determine base damage scaled by primary stat
        let primaryStat = 10;
        switch (c.class) {
            case 'Warrior': case 'Paladin': primaryStat = c.stats.str; break;
            case 'Rogue': case 'Hunter': primaryStat = c.stats.dex; break;
            case 'Mage': primaryStat = c.stats.int; break;
            case 'Cleric': primaryStat = c.stats.wis; break;
        }
        c.baseDamage = Math.floor(primaryStat * 1.0);
        return c;
    }

    // --- Assign smart formation positions ---
    function assignFormation(glads, side) {
        // For side A (home): frontline=1, backline=2, midline=0,3,4
        // For side B (away): frontline=2, backline=1, midline=0,3,4
        const frontSlot = (side === 'A') ? 1 : 2;
        const backSlot = (side === 'A') ? 2 : 1;
        const midSlots = [0, 3, 4];

        let paladins = [], warriors = [], clerics = [], others = [];
        glads.forEach(g => {
            if (!g) return;
            if (g.class === 'Paladin') paladins.push(g);
            else if (g.class === 'Warrior') warriors.push(g);
            else if (g.class === 'Cleric') clerics.push(g);
            else others.push(g);
        });

        const assigned = [];
        // Frontline: Paladin > Warrior > other > Cleric
        let front = paladins.shift() || warriors.shift() || others.shift() || clerics.shift();
        if (front) { assigned.push(setupSim(front, side, frontSlot)); }
        // Backline: Cleric > other > Warrior > Paladin
        let back = clerics.shift() || others.shift() || warriors.shift() || paladins.shift();
        if (back) { assigned.push(setupSim(back, side, backSlot)); }
        // Midline: fill remaining
        let remaining = [...warriors, ...paladins, ...others, ...clerics];
        let midIdx = 0;
        while (remaining.length > 0 && midIdx < midSlots.length) {
            assigned.push(setupSim(remaining.shift(), side, midSlots[midIdx]));
            midIdx++;
        }
        return assigned;
    }

    combatants.push(...assignFormation(teamAGlads, 'A'));
    combatants.push(...assignFormation(teamBGlads, 'B'));

    // Sort by DEX descending for turn order
    combatants.sort((a, b) => b.stats.dex - a.stats.dex);

    // --- Targeting (mirrors getValidTargets) ---
    function getTargets(attacker) {
        const enemies = combatants.filter(c => c.side !== attacker.side && !c.isDead);
        if (enemies.length === 0) return [];

        const isTargetingRight = (attacker.side === 'A');
        const frontIndex = isTargetingRight ? 1 : 2;
        const midIndices = [0, 3, 4];
        const backIndex = isTargetingRight ? 2 : 1;

        let front = enemies.filter(c => c.formationIndex === frontIndex);
        if (front.length > 0) return front;
        let mid = enemies.filter(c => midIndices.includes(c.formationIndex));
        if (mid.length > 0) return mid;
        let back = enemies.filter(c => c.formationIndex === backIndex);
        if (back.length > 0) return back;
        return enemies;
    }

    // --- Lethal check (mirrors applyLethalCheck) ---
    function lethalCheck(target) {
        if (target.hp <= 0) {
            if (target.class === 'Paladin' && target.divineShieldAvailable) {
                target.hp = 1;
                target.divineShieldActive = true;
                target.divineShieldAvailable = false;
                return false;
            }
            if (target.divineShieldActive) {
                target.hp = 1;
                return false;
            }
            target.hp = 0;
            target.isDead = true;
            return true;
        }
        return false;
    }

    // --- Adjacent indices helpers (mirrors combat-screen.js) ---
    function getFireballAdjacent(tIdx) {
        if (tIdx === 4) return [0, 1, 2, 3];
        return [4];
    }
    function getCleaveAdjacent(tIdx) {
        if (tIdx === 0) return [4];
        if (tIdx === 3) return [4];
        if (tIdx === 4) return [0, 3];
        return [];
    }

    // --- Run combat loop (mirrors executeTurn logic, synchronous) ---
    let turnIndex = 0;
    const MAX_TURNS = 500; // safety cap to prevent infinite loops
    let turns = 0;

    while (turns < MAX_TURNS) {
        turns++;
        const attacker = combatants[turnIndex];
        turnIndex = (turnIndex + 1) % combatants.length;

        if (attacker.isDead) continue;

        // Consume Divine Shield at start of Paladin's turn
        if (attacker.divineShieldActive) {
            attacker.divineShieldActive = false;
        }

        // Check for team wipe
        const targetSide = attacker.side === 'A' ? 'B' : 'A';
        const allEnemies = combatants.filter(c => c.side === targetSide && !c.isDead);
        if (allEnemies.length === 0) break;

        // Targeting: Hunters & Mages bypass frontline
        const validTargets = (attacker.class === 'Hunter' || attacker.class === 'Mage')
            ? combatants.filter(c => c.side === targetSide && !c.isDead)
            : getTargets(attacker);

        if (validTargets.length === 0) break;

        // --- Determine action ---
        let actionType = 'attack';
        let target = null;
        let effectAmount = 0;

        // Cleric heal logic
        if (attacker.class === 'Cleric' && healingDampener > 0) {
            const aliveFriendlies = combatants.filter(c => c.side === attacker.side && !c.isDead);
            if (aliveFriendlies.length > 1) {
                const needHeal = aliveFriendlies.filter(c => c.hp < c.maxHp);
                if (needHeal.length > 0) {
                    target = needHeal.reduce((lo, cur) =>
                        (cur.hp / cur.maxHp) < (lo.hp / lo.maxHp) ? cur : lo
                    );
                    actionType = 'heal';
                    const variance = 0.8 + Math.random() * 0.4;
                    effectAmount = Math.floor(attacker.baseDamage * 1.5 * variance);
                }
            }
        }

        if (actionType === 'attack') {
            target = validTargets[Math.floor(Math.random() * validTargets.length)];
            const variance = 0.8 + Math.random() * 0.4;

            let attackDamage = attacker.baseDamage;
            if (attacker.class === 'Cleric') {
                attackDamage = attacker.stats.str * 1.5;
            }
            effectAmount = Math.floor(attackDamage * variance);
            if (effectAmount < 1) effectAmount = 1;

            // Rogue crit
            if (attacker.class === 'Rogue') {
                const critChance = Math.min(0.5, attacker.stats.dex * 0.004);
                if (Math.random() < critChance) {
                    effectAmount *= 2;
                    actionType = 'rogue_crit';
                }
            }
            if (attacker.class === 'Hunter') actionType = 'arrow';
            if (attacker.class === 'Mage') actionType = 'fireball';
        }

        // --- Apply action ---
        if (actionType === 'heal') {
            effectAmount = Math.max(1, Math.floor(effectAmount * (healingDampener / 100)));
            target.hp += effectAmount;
            if (target.hp > target.maxHp) target.hp = target.maxHp;
            healingDampener = Math.max(0, healingDampener - 5);

        } else {
            // Dodge check for physical attacks
            let dodged = false;
            if (['Warrior', 'Paladin', 'Rogue', 'Hunter'].includes(attacker.class)) {
                let dex = target.stats.dex;
                let dodgeChance = ((17 / 2376) * Math.pow(dex, 2)) - ((161 / 792) * dex);
                dodgeChance = dodgeChance / 100;
                if (dodgeChance < 0) dodgeChance = 0;
                if (dodgeChance > 0.50) dodgeChance = 0.50;
                if (Math.random() < dodgeChance) dodged = true;
            }

            if (actionType === 'fireball') {
                // Mage splash
                const fbVariance = 0.8 + Math.random() * 0.4;
                effectAmount = Math.floor(attacker.baseDamage * 1.5 * fbVariance);
                const adjIndices = getFireballAdjacent(target.formationIndex);
                const splashTargets = combatants.filter(c => c.side === target.side && !c.isDead && adjIndices.includes(c.formationIndex));
                const totalHit = 1 + splashTargets.length;
                const splitDmg = Math.max(1, Math.floor(effectAmount / totalHit));

                target.hp -= splitDmg;
                lethalCheck(target);

                splashTargets.forEach(st => {
                    st.hp -= splitDmg;
                    lethalCheck(st);
                });

            } else if (attacker.class === 'Warrior') {
                // Warrior cleave
                const adjIndices = getCleaveAdjacent(target.formationIndex);
                const cleaveTargets = combatants.filter(c => c.side === target.side && !c.isDead && adjIndices.includes(c.formationIndex));
                const totalHit = 1 + cleaveTargets.length;
                const splitDmg = Math.max(1, Math.floor(effectAmount / totalHit));

                if (!dodged) {
                    target.hp -= splitDmg;
                    lethalCheck(target);
                }
                cleaveTargets.forEach(ct => {
                    ct.hp -= splitDmg;
                    lethalCheck(ct);
                });

            } else {
                // Standard attack (Paladin, Rogue, Hunter, Cleric-attacking)
                if (!dodged) {
                    target.hp -= effectAmount;
                    lethalCheck(target);
                }
            }
        }
    }

    // Determine winner
    const aliveA = combatants.filter(c => c.side === 'A' && !c.isDead).length;
    const aliveB = combatants.filter(c => c.side === 'B' && !c.isDead).length;
    let winningSide;
    if (aliveA > 0 && aliveB === 0) winningSide = 'A';
    else if (aliveB > 0 && aliveA === 0) winningSide = 'B';
    else winningSide = Math.random() < 0.5 ? 'A' : 'B'; // tie-break (timeout or both alive)

    return { winningSide, combatants };
}


function simulateLeagueMatches(saveContext, weekIndex) {
    if (!saveContext.schedule || weekIndex < 0 || weekIndex >= saveContext.schedule.length) return;

    const weekObj = saveContext.schedule[weekIndex];
    if (weekObj.simulated) return;

    const weekMatches = (weekObj && weekObj.matches) ? weekObj.matches : (Array.isArray(weekObj) ? weekObj : []);
    weekMatches.forEach(match => {
        if (match.home === saveContext.teamId || match.away === saveContext.teamId) return;

        const homeData = saveContext.opposingRosters[match.home];
        const awayData = saveContext.opposingRosters[match.away];
        if (!homeData || !homeData.roster || !awayData || !awayData.roster) return;

        // Select up to 5 combatants per team (highest HP first)
        const pickTeam = (roster) => {
            return [...roster]
                .sort((a, b) => {
                    const hpA = a.hp !== undefined ? a.hp : (a.maxHp || 150);
                    const hpB = b.hp !== undefined ? b.hp : (b.maxHp || 150);
                    return hpB - hpA;
                })
                .slice(0, Math.min(5, roster.length));
        };

        const homeTeam = pickTeam(homeData.roster);
        const awayTeam = pickTeam(awayData.roster);

        // Run the actual combat simulation
        const result = simulateAICombat(homeTeam, awayTeam);
        const homeWins = result.winningSide === 'A';

        const winnerId = homeWins ? match.home : match.away;
        const loserId = homeWins ? match.away : match.home;
        const winnerData = saveContext.opposingRosters[winnerId];
        const loserData = saveContext.opposingRosters[loserId];

        if (winnerData) {
            winnerData.wins = (winnerData.wins || 0) + 1;
            winnerData.gold = (winnerData.gold || 0) + 1000;
        }
        if (loserData) {
            loserData.losses = (loserData.losses || 0) + 1;
            loserData.gold = (loserData.gold || 0) + 500;
        }

        // --- Apply post-combat effects to all participating gladiators ---
        result.combatants.forEach(c => {
            const glad = c.sourceGlad; // original gladiator object in the roster

            // Write back HP from simulation
            glad.hp = c.hp;
            if (glad.hp <= 0) glad.hp = 0;

            // Ensure baseStats exists (legacy migration)
            if (!glad.baseStats) {
                glad.baseStats = {
                    str: glad.stats.str, dex: glad.stats.dex,
                    int: glad.stats.int, wis: glad.stats.wis,
                    con: glad.stats.con || 25
                };
            }
            if (glad.baseStats.con === undefined) glad.baseStats.con = glad.stats.con || 25;

            // Increment battles and recalculate stats
            glad.battles = (glad.battles || 0) + 1;
            const b = glad.battles;
            glad.stats = {
                str: Math.min(99, glad.baseStats.str + b),
                dex: Math.min(99, glad.baseStats.dex + b),
                int: Math.min(99, glad.baseStats.int + b),
                wis: Math.min(99, glad.baseStats.wis + b),
                con: Math.min(99, glad.baseStats.con + b)
            };
            glad.maxHp = Math.floor(50 + (glad.stats.con * 2));

            // Survivors get HP set to 1 if they were knocked out
            if (!c.isDead && glad.hp <= 0) {
                glad.hp = 1;
            }
        });

        // Apply permadeath to dead combatants
        [homeData, awayData].forEach(teamData => {
            const teamSide = (teamData === homeData) ? 'A' : 'B';
            const isWinner = (teamSide === result.winningSide);
            const deadCombatants = result.combatants.filter(c => c.side === teamSide && c.isDead);

            // Permadeath roll for each dead gladiator
            const permadeaths = [];
            deadCombatants.forEach(c => {
                const glad = c.sourceGlad;
                let deathChance = 0.30 - (((glad.stats.con || 25) - 25) * 0.003);
                if (deathChance < 0.10) deathChance = 0.10;
                if (Math.random() < deathChance) {
                    permadeaths.push(glad);
                }
            });

            // Guarantee at least one survivor on the winning team
            if (isWinner && permadeaths.length > 0) {
                const teamCombatants = result.combatants.filter(c => c.side === teamSide);
                const aliveCount = teamCombatants.filter(c => !c.isDead).length;
                const survivorsAfterPerma = teamData.roster.length - permadeaths.length;
                if (survivorsAfterPerma <= 0 || (aliveCount === 0 && permadeaths.length === teamCombatants.length)) {
                    // Spare one random gladiator
                    const sparedIdx = Math.floor(Math.random() * permadeaths.length);
                    permadeaths.splice(sparedIdx, 1);
                }
            }

            // Remove permadead gladiators from the roster
            permadeaths.forEach(dead => {
                const idx = teamData.roster.indexOf(dead);
                if (idx !== -1) teamData.roster.splice(idx, 1);
            });

            // Set dead-but-survived gladiators' HP to 1
            deadCombatants.forEach(c => {
                if (!permadeaths.includes(c.sourceGlad)) {
                    c.sourceGlad.hp = 1;
                }
            });
        });
    });

    weekObj.simulated = true;

    const newsList = document.getElementById('newsList');
    if (newsList) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';

        // Apply player team color
        if (typeof TEAMS !== 'undefined' && saveContext.teamId) {
            const playerTeam = TEAMS.find(t => t.id === saveContext.teamId);
            if (playerTeam && playerTeam.primaryColor) {
                newsItem.style.borderLeftColor = playerTeam.primaryColor;
            } else {
                newsItem.style.borderLeftColor = 'var(--color-accent-warning)';
            }
        } else {
            newsItem.style.borderLeftColor = 'var(--color-accent-warning)';
        }

        newsItem.innerHTML = `<p><em>Results for Week ${weekIndex + 1} are in. Check the standings for the latest rankings!</em></p>`;
        newsList.insertBefore(newsItem, newsList.firstChild);
    }
}

function recalculateSeasonData(saveContext) {
    if (typeof generateSeasonSchedule === 'function') {
        saveContext.schedule = generateSeasonSchedule(saveContext.teamId);
    }
    saveContext.matchResults = [];
    if (saveContext.opposingRosters) {
        Object.values(saveContext.opposingRosters).forEach(ai => {
            ai.wins = 0;
            ai.losses = 0;
        });
    }
}
