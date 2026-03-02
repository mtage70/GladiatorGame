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

    let str = generateStat(20), dex = generateStat(20), int = generateStat(20), wis = generateStat(20);

    switch (charClass) {
        case 'Warrior':
            str = generateStat(75);
            dex = generateStat(50);
            break;
        case 'Paladin':
            str = generateStat(75);
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
            break;
    }
    const baseHp = 30 + (str * 2);
    const maxHp = charClass === 'Warrior' ? Math.floor(baseHp * 0.7)
        : charClass === 'Rogue' ? Math.floor(baseHp * 0.7)
            : baseHp;
    return {
        id: 'glad_' + Math.random().toString(36).substr(2, 9),
        name: name,
        surname: surname,
        gender: gender,
        class: charClass,
        portrait: portrait,
        stats: { str, dex, int, wis },
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

function generateSeasonSchedule() {
    // Generate a double round-robin schedule for all teams
    const teamIds = TEAMS.map(t => t.id);
    const numTeams = teamIds.length;
    const numDays = numTeams - 1; // 9 weeks for single round-robin
    const halfSize = numTeams / 2;

    let schedule = []; // Array of weeks, each week is an array of matchups

    let teams = [...teamIds];
    teams.shift(); // Remove first team to keep it fixed

    // First Half of Season (Weeks 1-9)
    for (let day = 0; day < numDays; day++) {
        const weekMatches = [];
        const teamIdx = day % numDays;

        // Match 1: Fixed team (teamIds[0]) vs current rotated team
        weekMatches.push({
            home: teamIds[0],
            away: teams[teamIdx]
        });

        // Other matches
        for (let idx = 1; idx < halfSize; idx++) {
            const firstTeam = teams[(day + idx) % numDays];
            const secondTeam = teams[(day + numDays - idx) % numDays];
            weekMatches.push({
                home: firstTeam,
                away: secondTeam
            });
        }
        schedule.push(weekMatches);
    }

    // Second Half of Season (Weeks 10-18)
    // Same matchups, but reverse home/away
    const secondHalf = [];
    for (let i = 0; i < schedule.length; i++) {
        const reversedMatches = schedule[i].map(match => ({
            home: match.away,
            away: match.home
        }));
        secondHalf.push(reversedMatches);
    }

    schedule = schedule.concat(secondHalf);
    return schedule;
}
