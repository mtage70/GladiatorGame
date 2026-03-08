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

function simulateLeagueMatches(saveContext, weekIndex) {
    if (!saveContext.schedule || weekIndex < 0 || weekIndex >= saveContext.schedule.length) return;

    const weekObj = saveContext.schedule[weekIndex];
    if (weekObj.simulated) return;

    const weekMatches = (weekObj && weekObj.matches) ? weekObj.matches : (Array.isArray(weekObj) ? weekObj : []);
    weekMatches.forEach(match => {
        if (match.home === saveContext.teamId || match.away === saveContext.teamId) return;

        const homeWins = Math.random() < 0.55;
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
    });

    weekObj.simulated = true;

    const newsList = document.getElementById('newsList');
    if (newsList) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.style.borderLeftColor = 'var(--color-accent-warning)';
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
