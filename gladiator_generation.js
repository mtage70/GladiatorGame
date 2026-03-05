// Normal distribution helper (Box-Muller transform)
function randomNormal(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randomNormal(mean, stdDev); // resample between 0 and 1
    return Math.floor(mean + (num - 0.5) * stdDev * 4); // Spread standard deviation
}

function generateStat(mean) {
    // Clamp between 0 and 99
    let stat = randomNormal(mean, 10);
    return Math.max(0, Math.min(99, stat));
}

function generateGladiator() {
    const charClass = GLADIATOR_CLASSES[Math.floor(Math.random() * GLADIATOR_CLASSES.length)];
    const gender = Math.random() < 0.5 ? 'm' : 'f';
    const firstNameList = gender === 'm' ? MALE_NAMES : FEMALE_NAMES;
    const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)];
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const name = firstName;
    const portrait = PORTRAITS[`${charClass}_${gender}`] || null;

    let str = generateStat(20), dex = generateStat(20), int = generateStat(20), wis = generateStat(20), con = generateStat(25);

    switch (charClass) {
        case 'Warrior':
            str = generateStat(75);
            con = generateStat(50);
            dex = generateStat(50);
            break;
        case 'Paladin':
            con = generateStat(75);
            str = generateStat(50);
            wis = generateStat(50);
            break;
        case 'Rogue':
            dex = generateStat(75);
            str = generateStat(50);
            break;
        case 'Hunter':
            dex = generateStat(75);
            int = generateStat(50);
            break;
        case 'Mage':
            int = generateStat(75);
            wis = generateStat(50);
            break;
        case 'Cleric':
            wis = generateStat(75);
            int = generateStat(50);
            con = generateStat(25);
            break;
    }
    const maxHp = calculateMaxHp({ class: charClass, stats: { con } });

    return {
        id: 'glad_' + Math.random().toString(36).substr(2, 9),
        name: name,
        surname: surname,
        gender: gender,
        class: charClass,
        portrait: portrait,
        stats: { str, dex, int, wis, con },
        baseStats: { str, dex, int, wis, con },
        battles: 0,
        maxHp: maxHp,
        hp: maxHp
    };
}

function generateInitialRoster() {
    const roster = [];
    for (let i = 0; i < 5; i++) {
        roster.push(generateGladiator());
    }
    return roster;
}

function generateOpposingRosters(playerTeamId) {
    const opposingRosters = {};
    TEAMS.forEach(team => {
        if (team.id !== playerTeamId) {
            const roster = [];
            for (let i = 0; i < 10; i++) {
                roster.push(generateGladiator());
            }
            opposingRosters[team.id] = {
                roster: roster,
                gold: 5000 // Initial AI startup cash
            };
        }
    });
    return opposingRosters;
}

function generateSeasonSchedule(playerTeamId) {
    // Generate a double round-robin schedule for all teams
    const allTeamIds = TEAMS.map(t => t.id);

    // Move player's team to the first position so it's the "fixed" anchor 
    // in the circle algorithm, ensuring perfectly alternating Home/Away Games.
    const playerIdx = allTeamIds.indexOf(playerTeamId);
    if (playerIdx !== -1) {
        allTeamIds.splice(playerIdx, 1);
        allTeamIds.unshift(playerTeamId);
    }

    const teamIds = allTeamIds;
    const numTeams = teamIds.length;
    const numDays = numTeams - 1; // 9 weeks for single round-robin
    const halfSize = numTeams / 2;

    let firstHalf = [];

    let teams = [...teamIds];
    const fixedTeam = teams.shift(); // Keep player team fixed for round-robin rotation

    // Generation of First Half
    for (let day = 0; day < numDays; day++) {
        const weekMatches = [];

        // Rotation logic for other teams
        const rotatedTeams = [...teams.slice(day % numDays), ...teams.slice(0, day % numDays)];

        // Match 1: Fixed team vs one of the rotated teams
        // Alternate home/away for the fixed team each week
        if (day % 2 === 0) {
            weekMatches.push({ home: fixedTeam, away: rotatedTeams[0] });
        } else {
            weekMatches.push({ home: rotatedTeams[0], away: fixedTeam });
        }

        // Other matches
        for (let idx = 1; idx < halfSize; idx++) {
            const first = rotatedTeams[idx];
            const second = rotatedTeams[numDays - idx];
            // Stagger these too based on index to keep balance
            if ((day + idx) % 2 === 0) {
                weekMatches.push({ home: first, away: second });
            } else {
                weekMatches.push({ home: second, away: first });
            }
        }
        firstHalf.push(weekMatches);
    }

    // Generation of Second Half (Reversed)
    const secondHalf = firstHalf.map(week => week.map(match => ({
        home: match.away,
        away: match.home
    })));

    // Return the full 18-week schedule
    return firstHalf.concat(secondHalf);
}
