const homeScreen = document.getElementById('homeScreen');

let homeSortBy = 'ovr';
let homeSortAscending = false;

function getPrimaryStat(glad) {
    switch (glad.class) {
        case 'Warrior':
            return glad.stats.str;
        case 'Paladin':
            return glad.stats.con || 25;
        case 'Rogue':
        case 'Hunter':
            return glad.stats.dex;
        case 'Mage':
            return glad.stats.int;
        case 'Cleric':
            return glad.stats.wis;
        default:
            return Math.max(glad.stats.str, glad.stats.dex, glad.stats.int, glad.stats.wis);
    }
}

function renderRoster() {
    const tbody = document.getElementById('homeRosterBody');
    const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));

    if (!saveContext || !saveContext.roster || !tbody) return;

    // Update header stats and team name
    const homeTitle = document.querySelector('.home-title');
    if (homeTitle && saveContext.teamName) {
        homeTitle.innerHTML = `<span class="team-header-container"><img src="${saveContext.teamLogo}" class="team-logo-small" alt="${saveContext.teamName} Logo"> ${saveContext.teamName}</span>`;
    }

    const goldDisplay = document.getElementById('goldDisplay');
    const fameDisplay = document.getElementById('fameDisplay');
    const recordDisplay = document.getElementById('recordDisplay');
    if (goldDisplay) goldDisplay.innerHTML = `<span class="stat-icon">💰</span> ${saveContext.gold} G`;
    if (fameDisplay) fameDisplay.innerHTML = `<span class="stat-icon">🏆</span> Fame: ${saveContext.fame}`;

    // Compute and display player W/L record
    const matchResults = saveContext.matchResults || [];
    const wins = matchResults.filter(r => r.won).length;
    const losses = matchResults.filter(r => !r.won).length;
    if (recordDisplay) recordDisplay.innerHTML = `<span class="stat-icon">⚔️</span> ${wins}W - ${losses}L`;

    tbody.innerHTML = ''; // Clear current table body

    // Clone array so we don't permute the save data order, just visual
    let sortedRoster = [...saveContext.roster];

    sortedRoster.sort((a, b) => {
        let valA, valB;
        switch (homeSortBy) {
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

        if (valA < valB) return homeSortAscending ? -1 : 1;
        if (valA > valB) return homeSortAscending ? 1 : -1;
        // tie breaker: name
        if (homeSortBy !== 'name') {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
        }
        return 0;
    });

    // Update header visual indicators to show current sort
    const homeTableHeaders = document.querySelectorAll('#homeRosterTable th[data-sort]');
    homeTableHeaders.forEach(th => {
        const sortKey = th.getAttribute('data-sort');
        if (sortKey === homeSortBy) {
            th.innerHTML = `${th.textContent.replace(/ [↓↑]/, '')} ${homeSortAscending ? '↑' : '↓'}`;
        } else {
            th.innerHTML = th.textContent.replace(/ [↓↑]/, '');
        }
    });

    sortedRoster.forEach(glad => {
        const row = document.createElement('tr');
        row.className = 'roster-row';

        const portraitHtml = glad.portrait
            ? `<div class="glad-portrait-small" style="position:relative; width:40px; height:40px;"><img src="${glad.portrait}" alt="${glad.name}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;" />${glad.battles > 0 ? `<div class="battles-badge-small" style="position:absolute; bottom:-5px; right:-5px; background:var(--color-accent-danger); border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center;">${glad.battles}</div>` : ''}</div>`
            : `<div class="glad-portrait-small blank" style="position:relative; width:40px; height:40px; background:#333; border-radius:4px;">${glad.battles > 0 ? `<div class="battles-badge-small" style="position:absolute; bottom:-5px; right:-5px; background:var(--color-accent-danger); border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center;">${glad.battles}</div>` : ''}</div>`;

        const displayMaxHp = glad.maxHp || (50 + (glad.stats.str * 5));
        const displayHp = glad.hp !== undefined ? glad.hp : displayMaxHp;
        const hpPercent = Math.max(0, Math.floor((displayHp / displayMaxHp) * 100));

        row.innerHTML = `
            <td style="padding: 0.5rem; font-weight: bold; color: var(--color-gold);">${getPrimaryStat(glad)}</td>
            <td style="padding: 0.5rem;"><span class="glad-class ${glad.class.toLowerCase()}">${glad.class}</span></td>
            <td style="padding: 0.5rem;">${portraitHtml}</td>
            <td style="padding: 0.5rem; font-weight: bold;">${glad.name} <span style="font-weight:normal; font-size:0.8rem;">${glad.surname}</span></td>
            <td style="padding: 0.5rem; width: 120px;">
                <div class="hp-bar-container" style="height: 12px; width: 100%;">
                    <div class="hp-fill" style="width: ${hpPercent}%"></div>
                    <div class="hp-text" style="font-size: 0.7rem;">${displayHp} / ${displayMaxHp}</div>
                </div>
            </td>
            <td style="padding: 0.5rem;">${glad.stats.con || 25}</td>
            <td style="padding: 0.5rem;">${glad.stats.str}</td>
            <td style="padding: 0.5rem;">${glad.stats.dex}</td>
            <td style="padding: 0.5rem;">${glad.stats.int}</td>
            <td style="padding: 0.5rem;">${glad.stats.wis}</td>
        `;

        // Row click event to show context menu
        row.addEventListener('click', (e) => {
            // Prevent event from bubbling up and instantly triggering the document close listener
            e.stopPropagation();

            const menu = document.getElementById('gladiatorContextMenu');
            const menuHeader = document.getElementById('contextMenuHeader');
            const sellBtn = document.getElementById('contextSellBtn');

            if (menu && menuHeader && sellBtn) {
                menuHeader.textContent = glad.name;

                // Position menu near cursor
                menu.style.left = `${e.clientX}px`;
                menu.style.top = `${e.clientY}px`;
                menu.classList.remove('hidden');

                // Bind sell logic
                sellBtn.onclick = () => {
                    const rosterIndex = saveContext.roster.findIndex(g => g.id === glad.id);
                    if (rosterIndex !== -1) {
                        saveContext.roster.splice(rosterIndex, 1);
                        saveContext.gold += 250;
                        localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
                        renderRoster(); // re-render UI immediately

                        // Refresh advance time button closure
                        if (typeof setupAdvanceTimeBtn === 'function') {
                            setupAdvanceTimeBtn();
                        }
                    }
                    menu.classList.add('hidden');
                };
            }
        });

        tbody.appendChild(row);
    });

    // Close context menu if clicking anywhere else
    const closeContextBtn = document.getElementById('closeContextBtn');
    if (closeContextBtn) {
        closeContextBtn.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('gladiatorContextMenu').classList.add('hidden');
        };
    }

    document.addEventListener('click', (e) => {
        const menu = document.getElementById('gladiatorContextMenu');
        if (menu && !menu.classList.contains('hidden')) {
            // Only close if we didn't click inside the menu
            if (!menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        }
    });

    // Recruit logic now handled by external button

    renderCalendar(saveContext);
    renderStandings(saveContext);
}

function renderCalendar(saveContext) {
    const dateDisplay = document.getElementById('currentDateDisplay');
    const eventDisplay = document.getElementById('upcomingEventDisplay');

    if (!dateDisplay || !eventDisplay) return;

    dateDisplay.textContent = `Year ${saveContext.year}, Month ${saveContext.month}, Day ${saveContext.day}`;

    // Calculate which "week" of the season schedule we are in
    // There are 28 days a month. Seasons last 18 weeks (126 days). So assuming the season runs continuously:
    // This is a simple calculation. For now, we take total elapsed weeks since start of game.
    const totalDaysElapsed = ((saveContext.year - 1) * 12 * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
    const currentWeekIndex = Math.floor(totalDaysElapsed / 7);

    // If we're past week 18, we can say off-season, or just wrap around for simplicity
    const schedule = saveContext.schedule;

    if (!schedule || schedule.length === 0) {
        eventDisplay.textContent = "No Schedule Available";
        return;
    }

    if (currentWeekIndex < schedule.length) {
        // Find our team's match this week
        const myTeamId = saveContext.teamId;
        const weekMatches = schedule[currentWeekIndex];

        const myMatch = weekMatches.find(m => m.home === myTeamId || m.away === myTeamId);

        if (myMatch) {
            const isHome = myMatch.home === myTeamId;
            const opponentId = isHome ? myMatch.away : myMatch.home;
            const opponentTeam = TEAMS.find(t => t.id === opponentId);
            const vsText = isHome ? 'vs.' : '@';

            // Days until Sunday (match day is day 7, 14, 21, 28)
            const dayOfWeek = saveContext.day % 7; // 1-7, where 0 is 7 (Sunday)
            const daysUntilMatch = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

            if (daysUntilMatch === 0) {
                eventDisplay.innerHTML = `<strong style="color:var(--color-accent-danger)">MATCH TODAY:</strong> ${vsText} <img src="${opponentTeam.logo}" class="team-logo-tiny" alt="${opponentTeam.name} Logo"> ${opponentTeam.name}`;
            } else {
                eventDisplay.innerHTML = `Next Match in ${daysUntilMatch} days: ${vsText} <img src="${opponentTeam.logo}" class="team-logo-tiny" alt="${opponentTeam.name} Logo"> ${opponentTeam.name}`;
            }
        } else {
            eventDisplay.textContent = "Bye Week - Rest and Train";
        }
    } else {
        eventDisplay.textContent = "Off-Season";
    }

    // Render calendar grid
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) {
        calendarGrid.innerHTML = '';

        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        daysOfWeek.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header-day';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        for (let i = 1; i <= 28; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            if (i === saveContext.day) {
                dayDiv.classList.add('current');
            }

            const numSpan = document.createElement('span');
            numSpan.className = 'day-number';
            numSpan.textContent = i;
            dayDiv.appendChild(numSpan);

            // Matches are on Sundays (7, 14, 21, 28)
            if (i % 7 === 0) {
                const totalWeeksBeforeThisMonth = ((saveContext.year - 1) * 12 * 4) + ((saveContext.month - 1) * 4);
                const globalWeekIndexForDay = totalWeeksBeforeThisMonth + Math.floor((i - 1) / 7);

                if (schedule && globalWeekIndexForDay < schedule.length) {
                    const weekMatches = schedule[globalWeekIndexForDay];
                    const myMatch = weekMatches.find(m => m.home === saveContext.teamId || m.away === saveContext.teamId);

                    if (myMatch) {
                        const icon = document.createElement('img');
                        icon.src = 'crossed_swords.png';
                        icon.className = 'match-icon';

                        const isHome = myMatch.home === saveContext.teamId;
                        const opponentId = isHome ? myMatch.away : myMatch.home;
                        const opponentTeam = TEAMS.find(t => t.id === opponentId);

                        icon.title = `Match ${isHome ? 'vs.' : '@'} ${opponentTeam.name}`;
                        dayDiv.appendChild(icon);
                    }
                }
            }
            calendarGrid.appendChild(dayDiv);
        }
    }
}

function renderStandings(saveContext) {
    const tbody = document.getElementById('standingsBody');
    if (!tbody) return;

    // Build records for all teams
    const allTeams = TEAMS.map(team => {
        let wins = 0, losses = 0;

        if (team.id === saveContext.teamId) {
            // Player team: use matchResults
            const results = saveContext.matchResults || [];
            wins = results.filter(r => r.won).length;
            losses = results.filter(r => !r.won).length;
        } else {
            // AI team: derive from schedule results stored in opposingRosters
            const aiData = saveContext.opposingRosters && saveContext.opposingRosters[team.id];
            wins = (aiData && aiData.wins) || 0;
            losses = (aiData && aiData.losses) || 0;
        }

        const played = wins + losses;
        const pct = played > 0 ? (wins / played) : 0;
        return { team, wins, losses, played, pct, isPlayer: team.id === saveContext.teamId };
    });

    // Sort: most wins first, then fewest losses
    allTeams.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

    tbody.innerHTML = '';
    allTeams.forEach((entry, i) => {
        const tr = document.createElement('tr');
        if (entry.isPlayer) tr.classList.add('standings-player-row');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td><span class="team-header-container"><img src="${entry.team.logo}" class="team-logo-tiny" alt="${entry.team.name} Logo"> ${entry.team.name}</span>${entry.isPlayer ? ' <span class="standings-you">(You)</span>' : ''}</td>
            <td>${entry.wins}</td>
            <td>${entry.losses}</td>
            <td>${entry.played > 0 ? (entry.pct * 100).toFixed(0) + '%' : '—'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function transitionToHome() {
    const mainContainer = document.getElementById('mainContainer');
    const panBackground = document.getElementById('panBackground');

    // Hide main menu and animation background
    mainContainer.classList.remove('show-menu');
    mainContainer.style.display = 'none';
    panBackground.style.display = 'none';

    // Ensure BGM is playing if they click before fanfare ends
    if (typeof playBackgroundMusic === 'function') playBackgroundMusic();

    // Render roster based on save
    renderRoster();

    // Reset tabs: Show Lineup, hide others
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));

    // Default active tab
    const lineupBtn = document.querySelector('.tab-btn[data-target="tab-lineup"]');
    if (lineupBtn) lineupBtn.classList.add('active');

    const lineupTab = document.getElementById('tab-lineup');
    if (lineupTab) lineupTab.classList.remove('hidden');

    // Show home screen
    homeScreen.classList.remove('hidden');

    // Setup advance button and render calendar payload based on save
    setupAdvanceTimeBtn();
}

// Initialize Tab Buttons
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state from all buttons & hide all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));

            // Activate clicked button & show target tab
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });

    // Recruit Button
    const recruitBtn = document.getElementById('recruitBtn');
    if (recruitBtn) {
        recruitBtn.addEventListener('click', () => {
            const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));
            if (!saveContext) return;

            if (saveContext.roster.length >= 10) {
                recruitBtn.textContent = "Roster Full";
                setTimeout(() => recruitBtn.textContent = "Recruit (500 G)", 1500);
                return;
            }

            if (saveContext.gold >= 500) {
                saveContext.gold -= 500;
                saveContext.roster.push(generateGladiator());
                localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));

                // Update gold display and re-render roster
                document.getElementById('goldDisplay').innerHTML = `<span class="stat-icon">💰</span> ${saveContext.gold} G`;
                renderRoster();

                if (typeof setupAdvanceTimeBtn === 'function') {
                    setupAdvanceTimeBtn();
                }
            } else {
                recruitBtn.style.animation = 'shake 0.5s';
                setTimeout(() => recruitBtn.style.animation = '', 500);
            }
        });
    }

    // Modal Events
    const viewGraveyardBtn = document.getElementById('viewGraveyardBtn');
    if (viewGraveyardBtn) {
        viewGraveyardBtn.addEventListener('click', () => {
            const graveyardModal = document.getElementById('graveyardModal');
            const graveyardGrid = document.getElementById('graveyardGrid');
            const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));

            if (graveyardGrid) {
                graveyardGrid.innerHTML = '';
                if (saveContext && saveContext.graveyard && saveContext.graveyard.length > 0) {
                    saveContext.graveyard.forEach(glad => {
                        const slot = document.createElement('div');
                        slot.className = 'roster-slot filled';
                        slot.style.filter = 'grayscale(100%)';

                        const portraitHtml = glad.portrait
                            ? `<div class="glad-portrait"><img src="${glad.portrait}" alt="${glad.name}" /></div>`
                            : `<div class="glad-portrait blank"></div>`;

                        slot.innerHTML = `
                            <div class="glad-info" style="opacity: 0.8;">
                                ${portraitHtml}
                                <span class="glad-class ${glad.class.toLowerCase()}">${glad.class}</span>
                                <span class="glad-name" title="${glad.name}">${glad.name} <br/> <span style="font-size:0.75rem;">(RIP)</span></span>
                            </div>
                        `;
                        graveyardGrid.appendChild(slot);
                    });
                } else {
                    graveyardGrid.innerHTML = '<div style="color:var(--color-text-muted); width:100%; text-align:center; margin-top: 2rem;">No gladiators have perished yet.</div>';
                }
            }
            if (graveyardModal) graveyardModal.classList.remove('hidden');
        });
    }

    const closeGraveyardBtn = document.getElementById('closeGraveyardBtn');
    if (closeGraveyardBtn) {
        closeGraveyardBtn.addEventListener('click', () => {
            document.getElementById('graveyardModal').classList.add('hidden');
        });
    }

    const closeCasualtiesBtn = document.getElementById('closeCasualtiesBtn');
    if (closeCasualtiesBtn) {
        closeCasualtiesBtn.addEventListener('click', () => {
            document.getElementById('casualtiesModal').classList.add('hidden');
        });
    }

    // Table Sorting Event Listeners for Home Roster
    const homeTableHeaders = document.querySelectorAll('#homeRosterTable th[data-sort]');
    homeTableHeaders.forEach(th => {
        th.addEventListener('click', () => {
            const sortKey = th.getAttribute('data-sort');
            if (homeSortBy === sortKey) {
                // Toggle order if clicking same header
                homeSortAscending = !homeSortAscending;
            } else {
                // Set new sort key, default to descending for stats/hp, ascending for text
                homeSortBy = sortKey;
                homeSortAscending = (sortKey === 'name' || sortKey === 'class');
            }
            renderRoster();
        });
    });

    setupAdvanceTimeBtn();
});

function setupAdvanceTimeBtn() {
    const advanceBtn = document.getElementById('advanceTimeBtn');
    if (!advanceBtn) return;

    const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));
    if (!saveContext || !saveContext.schedule) return;

    // Ensure the calendar's initial state is correctly rendered and highlighted
    renderCalendar(saveContext);

    const dayOfWeek = saveContext.day % 7;
    const totalDaysElapsed = ((saveContext.year - 1) * 12 * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
    const currentWeekIndex = Math.floor(totalDaysElapsed / 7);

    let isMatchDay = false;
    let matchObj = null;

    if (dayOfWeek === 0 && currentWeekIndex < saveContext.schedule.length) {
        const weekMatches = saveContext.schedule[currentWeekIndex];
        matchObj = weekMatches.find(m => m.home === saveContext.teamId || m.away === saveContext.teamId);
        isMatchDay = !!matchObj;
    }

    if (isMatchDay) {
        // Resolve opponent formatting
        const isHome = matchObj.home === saveContext.teamId;
        const opponentId = isHome ? matchObj.away : matchObj.home;
        const opponentTeam = TEAMS.find(t => t.id === opponentId);
        const opponentName = opponentTeam ? opponentTeam.name : "Unknown Opponent";

        advanceBtn.textContent = "Vs " + opponentName;
        advanceBtn.style.background = "linear-gradient(to bottom, #4a2f32 0%, #2a1a1d 100%)";
        advanceBtn.style.borderColor = "#70474b";
        advanceBtn.onclick = () => {
            if (typeof initializeMatchScreen === 'function') {
                initializeMatchScreen(saveContext);
            } else {
                alert("Match system script not loaded properly!");
            }
        };
    } else {
        advanceBtn.textContent = "Advance Time";
        advanceBtn.style.background = ""; // Reset to CSS default class
        advanceBtn.style.borderColor = "";
        advanceBtn.onclick = () => advanceTime(saveContext);
    }
}

function advanceTime(saveContext) {
    const advanceBtn = document.getElementById('advanceTimeBtn');
    if (advanceBtn) {
        advanceBtn.disabled = true;
        advanceBtn.textContent = "Advancing...";
    }

    let daysAdvanced = 0;

    function tickDay() {
        if (daysAdvanced >= 7) {
            finishAdvancing(saveContext, daysAdvanced);
            return;
        }

        saveContext.day += 1;
        if (saveContext.day > 28) {
            saveContext.day = 1;
            saveContext.month += 1;
            if (saveContext.month > 12) {
                saveContext.month = 1;
                saveContext.year += 1;
            }
        }
        daysAdvanced++;

        // Process daily healing
        let healedAnyone = false;

        // Heal Player Roster
        saveContext.roster.forEach(glad => {
            const maxHp = glad.maxHp || (30 + (glad.stats.str * 2));
            if (glad.hp < maxHp) {
                glad.hp = Math.min(glad.hp + 10, maxHp);
                healedAnyone = true;
            }
        });

        // Heal Opponent Rosters and Process Recruitment
        if (saveContext.opposingRosters) {
            Object.values(saveContext.opposingRosters).forEach(aiTeamData => {
                // Fallback for pre-patch saves
                const roster = aiTeamData.roster || aiTeamData;

                // Healing
                roster.forEach(glad => {
                    const maxHp = glad.maxHp || (30 + (glad.stats.str * 2));
                    if (glad.hp < maxHp) {
                        glad.hp = Math.min(glad.hp + 10, maxHp);
                    }
                });

                // Recruitment
                if (aiTeamData.gold !== undefined) {
                    while (roster.length < 10 && aiTeamData.gold >= 500) {
                        aiTeamData.gold -= 500;
                        if (typeof generateGladiator === 'function') {
                            roster.push(generateGladiator());
                        }
                    }
                }
            });
        }

        // Render UI for current iterative day
        localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
        renderCalendar(saveContext);
        if (healedAnyone) renderRoster();

        // Stop if the new day is a match day for this team
        const dayOfWeek = saveContext.day % 7; // Sunday = 0
        let isMatchDay = false;
        if (dayOfWeek === 0) {
            const totalDaysElapsed = ((saveContext.year - 1) * 12 * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
            const currentWeekIndex = Math.floor(totalDaysElapsed / 7);
            if (saveContext.schedule && currentWeekIndex < saveContext.schedule.length) {
                const weekMatches = saveContext.schedule[currentWeekIndex];
                if (weekMatches.find(m => m.home === saveContext.teamId || m.away === saveContext.teamId)) {
                    isMatchDay = true;
                }
            }
        }

        if (isMatchDay) {
            finishAdvancing(saveContext, daysAdvanced);
            return;
        }

        setTimeout(tickDay, 500);
    }

    tickDay();
}

function finishAdvancing(saveContext, daysAdvanced) {
    const advanceBtn = document.getElementById('advanceTimeBtn');
    if (advanceBtn) advanceBtn.disabled = false;

    // Create a newsfeed event to make time progression feel alive
    const newsList = document.getElementById('newsList');
    if (newsList && daysAdvanced > 0) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.style.borderLeftColor = 'var(--color-text-muted)';
        newsItem.innerHTML = `<p><em>Time passes... Your gladiators trained and rested for ${daysAdvanced} days.</em></p>`;
        newsList.insertBefore(newsItem, newsList.firstChild);
    }

    localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
    renderCalendar(saveContext);
    setupAdvanceTimeBtn();
}
