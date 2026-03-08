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
    const recordDisplay = document.getElementById('recordDisplay');
    if (goldDisplay) goldDisplay.innerHTML = `<span class="stat-icon">💰</span> ${saveContext.gold} G`;

    // Compute and display player W/L record
    const matchResults = saveContext.matchResults || [];
    const wins = matchResults.filter(r => r.won).length;
    const losses = matchResults.filter(r => !r.won).length;
    if (recordDisplay) recordDisplay.innerHTML = `<span class="stat-icon">⚔️</span> ${wins}W - ${losses}L`;

    tbody.innerHTML = ''; // Clear current table body

    const rosterCountDisplay = document.getElementById('rosterCountDisplay');
    if (rosterCountDisplay) {
        const livingCount = saveContext.roster.filter(g => g.hp === undefined || g.hp > 0).length;
        rosterCountDisplay.textContent = `(${livingCount}/10)`;
    }

    // Clone array so we don't permute the save data order, just visual
    let sortedRoster = [...saveContext.roster];

    sortedRoster.sort((a, b) => {
        let valA, valB;
        switch (homeSortBy) {
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

        const displayMaxHp = glad.maxHp || calculateMaxHp(glad);
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
            <td style="padding: 0.5rem 0.2rem;">${glad.stats.con || 25}</td>
            <td style="padding: 0.5rem 0.2rem;">${glad.stats.str}</td>
            <td style="padding: 0.5rem 0.2rem;">${glad.stats.dex}</td>
            <td style="padding: 0.5rem 0.2rem;">${glad.stats.int}</td>
            <td style="padding: 0.5rem 0.2rem;">${glad.stats.wis}</td>
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

                menu.classList.remove('hidden');

                const rect = menu.getBoundingClientRect();
                let leftPos = e.clientX;
                let topPos = e.clientY;

                if (leftPos + rect.width > window.innerWidth) {
                    leftPos = window.innerWidth - rect.width - 10;
                }
                if (topPos + rect.height > window.innerHeight) {
                    topPos = window.innerHeight - rect.height - 10;
                }

                menu.style.left = `${leftPos}px`;
                menu.style.top = `${Math.max(10, topPos)}px`;

                // Bind View Details
                const viewDetailsBtn = document.getElementById('contextViewDetailsBtn');
                if (viewDetailsBtn) {
                    viewDetailsBtn.onclick = () => {
                        menu.classList.add('hidden');
                        openGladiatorDetails(glad);
                    };
                }

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

    // Update Recruit Button Text based on team size
    const recruitBtn = document.getElementById('recruitBtn');
    if (recruitBtn) {
        if (saveContext.roster.length >= 10) {
            recruitBtn.textContent = "Full Team";
            // Optional styling cues to show it's disabled.
            recruitBtn.style.opacity = '0.5';
            recruitBtn.style.cursor = 'not-allowed';
        } else {
            recruitBtn.textContent = "Recruit (500 G)";
            recruitBtn.style.opacity = '1';
            recruitBtn.style.cursor = 'pointer';
        }
    }

    renderCalendar(saveContext);
    renderStandings(saveContext);
}

function openGladiatorDetails(glad) {
    const modal = document.getElementById('gladiatorDetailsModal');
    if (!modal) return;

    // Portrait
    const portraitEl = document.getElementById('detailsPortrait');
    if (portraitEl) {
        portraitEl.innerHTML = glad.portrait
            ? `<img src="${glad.portrait}" alt="${glad.name}" />`
            : `<div style="width:100%;height:100%;background:#333;display:flex;align-items:center;justify-content:center;color:#666;font-size:2rem;">?</div>`;
    }

    // Class badge
    const classEl = document.getElementById('detailsClass');
    if (classEl) {
        classEl.textContent = glad.class;
        classEl.className = `glad-class ${glad.class.toLowerCase()}`;
    }

    // Name, Surname & OVR
    document.getElementById('detailsName').textContent = glad.name;
    document.getElementById('detailsSurname').textContent = glad.surname || '';

    const ovrEl = document.getElementById('detailsOvr');
    if (ovrEl) {
        ovrEl.textContent = getPrimaryStat(glad);
    }

    // HP Bar
    const maxHp = glad.maxHp || calculateMaxHp(glad);
    const currentHp = glad.hp !== undefined ? glad.hp : maxHp;
    const hpPercent = Math.max(0, Math.floor((currentHp / maxHp) * 100));
    document.getElementById('detailsHpFill').style.width = `${hpPercent}%`;
    document.getElementById('detailsHpText').textContent = `${currentHp} / ${maxHp}`;

    // Battles
    const battlesEl = document.getElementById('detailsBattles');
    if (battlesEl) {
        battlesEl.textContent = glad.battles > 0 ? `⚔️ ${glad.battles} battle${glad.battles !== 1 ? 's' : ''} fought` : '🛡️ No battles yet';
    }

    // Stats with animated bars
    const statsContainer = document.getElementById('detailsStats');
    const stats = [
        { key: 'str', label: 'STR', value: glad.stats.str },
        { key: 'dex', label: 'DEX', value: glad.stats.dex },
        { key: 'int', label: 'INT', value: glad.stats.int },
        { key: 'wis', label: 'WIS', value: glad.stats.wis },
        { key: 'con', label: 'CON', value: glad.stats.con || 25 }
    ];

    statsContainer.innerHTML = stats.map(s => `
        <div class="stat-bar-row">
            <span class="stat-bar-label">${s.label}</span>
            <div class="stat-bar-track">
                <div class="stat-bar-fill ${s.key}" style="width: 0%" data-target="${s.value}"></div>
            </div>
            <span class="stat-bar-value">${s.value}</span>
        </div>
    `).join('');

    // Show modal
    modal.classList.remove('hidden');

    // Animate stat bars after a tiny delay so the CSS transition fires
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            statsContainer.querySelectorAll('.stat-bar-fill').forEach(bar => {
                bar.style.width = `${bar.getAttribute('data-target')}%`;
            });
        });
    });

    // Close handlers
    const detailsSellBtn = document.getElementById('detailsSellBtn');
    if (detailsSellBtn) {
        detailsSellBtn.onclick = () => {
            const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));
            const rosterIndex = saveContext.roster.findIndex(g => g.id === glad.id);
            if (rosterIndex !== -1) {
                saveContext.roster.splice(rosterIndex, 1);
                saveContext.gold += 250;
                localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
                renderRoster(); // re-render UI immediately

                if (typeof setupAdvanceTimeBtn === 'function') {
                    setupAdvanceTimeBtn();
                }
            }
            modal.classList.add('hidden');
        };
    }

    document.getElementById('closeDetailsBtn').onclick = () => modal.classList.add('hidden');
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    };
}

function renderGraveyard() {
    const graveyardGrid = document.getElementById('graveyardGrid');
    if (!graveyardGrid) return;

    const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));
    graveyardGrid.innerHTML = '';

    if (saveContext && saveContext.graveyard && saveContext.graveyard.length > 0) {
        saveContext.graveyard.forEach(glad => {
            const slot = document.createElement('div');
            slot.className = 'roster-slot filled';
            slot.style.filter = 'grayscale(100%)';

            const portraitHtml = glad.portrait
                ? `<div class="glad-portrait"><img src="${glad.portrait}" alt="${glad.name}" /></div>`
                : `<div class="glad-portrait blank"></div>`;

            const battlesCount = glad.battles || 0;
            slot.innerHTML = `
                <div class="glad-info" style="opacity: 0.8;">
                    ${portraitHtml}
                    <span class="glad-class ${glad.class.toLowerCase()}">${glad.class}</span>
                    <span class="glad-name" title="${glad.name}">${glad.name} <br/> <span style="font-size:0.75rem;">(RIP)</span></span>
                    <span style="font-size:0.8rem; color:var(--color-text-muted); margin-top:2px;">Battles: ${battlesCount}</span>
                </div>
            `;
            graveyardGrid.appendChild(slot);
        });
    } else {
        graveyardGrid.innerHTML = '<div style="color:var(--color-text-muted); width:100%; text-align:center; margin-top: 2rem;">No gladiators have perished yet.</div>';
    }
}

function renderCalendar(saveContext) {
    const dateDisplay = document.getElementById('currentDateDisplay');
    const eventDisplay = document.getElementById('upcomingEventDisplay');

    if (!dateDisplay || !eventDisplay) return;

    dateDisplay.textContent = `Year ${saveContext.year}, Month ${saveContext.month}, Day ${saveContext.day}`;

    // Calculate which "week" of the season schedule we are in
    // There are 28 days a month. Seasons last 18 weeks (126 days). So assuming the season runs continuously:
    // This is a simple calculation. For now, we take total elapsed weeks since start of game.
    const totalDaysElapsed = ((saveContext.year - 1) * MONTHS_PER_YEAR * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
    const currentWeekIndex = Math.floor(totalDaysElapsed / 7) % (MONTHS_PER_YEAR * 4);

    // If we're past week 18, we can say off-season, or just wrap around for simplicity
    const schedule = saveContext.schedule;

    if (!schedule || schedule.length === 0) {
        eventDisplay.textContent = "No Schedule Available";
        return;
    }

    if (currentWeekIndex < schedule.length) {
        // Migration check: if schedule[0] is an array, convert old format to new
        if (Array.isArray(schedule[0])) {
            console.log("Migrating old schedule format to new...");
            saveContext.schedule = schedule.map(week => ({ matches: week, simulated: false }));
            localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
        }

        // Find our team's match this week
        const myTeamId = saveContext.teamId;
        const weekObj = saveContext.schedule[currentWeekIndex];
        const weekMatches = (weekObj && weekObj.matches) ? weekObj.matches : (Array.isArray(weekObj) ? weekObj : []);

        const myMatch = weekMatches.find ? weekMatches.find(m => m.home === myTeamId || m.away === myTeamId) : null;

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
    } else if (currentWeekIndex === 18) {
        eventDisplay.innerHTML = `<strong style="color:var(--color-accent-success)">AOWAN CUP PREP:</strong> The top two teams prepare for the grand finale.`;
    } else if (currentWeekIndex === 19) {
        // Aowan Cup Week
        const standings = getStandings(saveContext);
        const topTwo = standings.slice(0, 2);
        const playerInCup = topTwo.some(t => t.isPlayer);

        if (playerInCup) {
            const opponent = topTwo.find(t => !t.isPlayer);
            const dayOfWeek = saveContext.day % 7;
            const daysUntilMatch = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

            if (daysUntilMatch === 0) {
                eventDisplay.innerHTML = `<strong style="color:var(--color-accent-danger)">AOWAN CUP TODAY:</strong> vs. <img src="${opponent.team.logo}" class="team-logo-tiny" alt="${opponent.team.name} Logo"> ${opponent.team.name}`;
            } else {
                eventDisplay.innerHTML = `Aowan Cup in ${daysUntilMatch} days: vs. <img src="${opponent.team.logo}" class="team-logo-tiny" alt="${opponent.team.name} Logo"> ${opponent.team.name}`;
            }
        } else {
            eventDisplay.innerHTML = `<strong style="color:var(--color-gold-light)">AOWAN CUP:</strong> <img src="${topTwo[0].team.logo}" class="team-logo-tiny"> ${topTwo[0].team.name} vs. <img src="${topTwo[1].team.logo}" class="team-logo-tiny"> ${topTwo[1].team.name}`;
        }
    } else {
        eventDisplay.textContent = "Off-Season";
    }

    // Render calendar grid
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) {
        calendarGrid.innerHTML = '';

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

            // Matches
            if (i % 7 === 0) {
                const totalWeeksBeforeThisMonth = ((saveContext.year - 1) * MONTHS_PER_YEAR * 4) + ((saveContext.month - 1) * 4);
                const globalWeekIndexForDay = (totalWeeksBeforeThisMonth + Math.floor((i - 1) / 7)) % (MONTHS_PER_YEAR * 4);

                if (schedule && globalWeekIndexForDay < schedule.length) {
                    const weekObj = schedule[globalWeekIndexForDay];
                    const weekMatches = (weekObj && weekObj.matches) ? weekObj.matches : (Array.isArray(weekObj) ? weekObj : []);
                    const myMatch = weekMatches.find ? weekMatches.find(m => m.home === saveContext.teamId || m.away === saveContext.teamId) : null;

                    if (myMatch) {
                        const isHome = myMatch.home === saveContext.teamId;
                        const opponentId = isHome ? myMatch.away : myMatch.home;
                        const opponentTeam = TEAMS.find(t => t.id === opponentId);

                        const icon = document.createElement('img');
                        icon.src = opponentTeam.logo;
                        icon.className = 'match-icon';
                        icon.title = `Match ${isHome ? 'vs.' : '@'} ${opponentTeam.name}`;
                        dayDiv.appendChild(icon);
                    }
                } else if (globalWeekIndexForDay === 19) {
                    // Aowan Cup Icon
                    const stands = getStandings(saveContext);
                    const top2 = stands.slice(0, 2);
                    const inCup = top2.some(t => t.isPlayer);

                    const cupIcon = document.createElement('span');
                    cupIcon.innerHTML = '🏆';
                    cupIcon.className = 'match-icon';
                    cupIcon.style.fontSize = '1.2rem';
                    cupIcon.title = inCup ? "Aowan Cup (Participating)" : "Aowan Cup (Finals)";
                    dayDiv.appendChild(cupIcon);
                }
            }
            calendarGrid.appendChild(dayDiv);
        }
    }
}

function getStandings(saveContext) {
    return TEAMS.map(team => {
        let wins = 0, losses = 0;

        if (team.id === saveContext.teamId) {
            const results = saveContext.matchResults || [];
            wins = results.filter(r => r.won).length;
            losses = results.filter(r => !r.won).length;
        } else {
            const aiData = saveContext.opposingRosters && saveContext.opposingRosters[team.id];
            wins = (aiData && aiData.wins) || 0;
            losses = (aiData && aiData.losses) || 0;
        }

        const played = wins + losses;
        const pct = played > 0 ? (wins / played) : 0;
        return { team, wins, losses, played, pct, isPlayer: team.id === saveContext.teamId };
    }).sort((a, b) => b.wins - a.wins || a.losses - b.losses);
}

function renderStandings(saveContext) {
    const tbody = document.getElementById('standingsBody');
    if (!tbody) return;

    const allTeams = getStandings(saveContext);

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
    const homeScreen = document.getElementById('homeScreen');

    // Hide main menu and animation background
    mainContainer.classList.remove('show-menu');
    mainContainer.style.display = 'none';
    panBackground.style.display = 'none';

    const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));
    if (saveContext && saveContext.teamId) {
        homeScreen.style.backgroundImage = `url('assets/arenas/arena_${saveContext.teamId}.png')`;
    }

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

            // Populate graveyard when switching to it
            if (targetId === 'tab-graveyard') {
                renderGraveyard();
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
                const newGladiator = generateGladiator();
                saveContext.roster.push(newGladiator);
                localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));

                // Update gold display and re-render roster
                document.getElementById('goldDisplay').innerHTML = `<span class="stat-icon">💰</span> ${saveContext.gold} G`;
                renderRoster();

                if (typeof setupAdvanceTimeBtn === 'function') {
                    setupAdvanceTimeBtn();
                }

                // Show the new recruit's details
                openGladiatorDetails(newGladiator);
            } else {
                recruitBtn.style.animation = 'shake 0.5s';
                setTimeout(() => recruitBtn.style.animation = '', 500);
            }
        });
    }

    // Casualties modal close
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
    const totalDaysElapsed = ((saveContext.year - 1) * MONTHS_PER_YEAR * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
    const currentWeekIndex = Math.floor(totalDaysElapsed / 7) % (MONTHS_PER_YEAR * 4);

    let isMatchDay = false;
    let matchObj = null;

    if (dayOfWeek === 0) {
        if (currentWeekIndex < saveContext.schedule.length) {
            const weekObj = saveContext.schedule[currentWeekIndex];
            const weekMatches = (weekObj && weekObj.matches) ? weekObj.matches : (Array.isArray(weekObj) ? weekObj : []);
            matchObj = weekMatches.find ? weekMatches.find(m => m.home === saveContext.teamId || m.away === saveContext.teamId) : null;
            isMatchDay = !!matchObj;
        } else if (currentWeekIndex === 19) {
            const standings = getStandings(saveContext);
            const topTwo = standings.slice(0, 2);
            const playerEntry = topTwo.find(t => t.isPlayer);
            if (playerEntry) {
                isMatchDay = true;
                const opponent = topTwo.find(t => !t.isPlayer);
                matchObj = { isCup: true, opponent: opponent };
            }
        }
    }

    if (isMatchDay) {
        // Resolve opponent formatting
        let opponentTeam;
        let buttonLabel;

        if (matchObj.isCup) {
            opponentTeam = matchObj.opponent.team;
            buttonLabel = `<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><span style="color: gold; font-weight: bold; text-shadow: 0 0 5px gold;">🏆 CUP</span><img src="${opponentTeam.logo}" alt="${opponentTeam.name}" style="height: 24px; width: 24px; object-fit: contain;"></div>`;
            advanceBtn.style.background = "linear-gradient(to bottom, #7a5f1a 0%, #3a2a0d 100%)";
            advanceBtn.style.borderColor = "gold";
        } else {
            const isHome = matchObj.home === saveContext.teamId;
            const opponentId = isHome ? matchObj.away : matchObj.home;
            opponentTeam = TEAMS.find(t => t.id === opponentId);
            buttonLabel = `<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><span>VS</span><img src="${opponentTeam.logo}" alt="${opponentTeam.name}" style="height: 24px; width: 24px; object-fit: contain;"></div>`;
            advanceBtn.style.background = "linear-gradient(to bottom, #4a2f32 0%, #2a1a1d 100%)";
            advanceBtn.style.borderColor = "#70474b";
        }

        advanceBtn.innerHTML = buttonLabel;
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
        // Safety cap: Advance at most 28 days (one month) at a time
        if (daysAdvanced >= 28) {
            finishAdvancing(saveContext, daysAdvanced);
            return;
        }

        saveContext.day += 1;
        if (saveContext.day > 28) {
            saveContext.day = 1;
            saveContext.month += 1;
            if (saveContext.month > MONTHS_PER_YEAR) {
                saveContext.month = 1;
                saveContext.year += 1;
                startNewSeason(saveContext);

                // EVENT STOP: New Season Day 1
                finishAdvancing(saveContext, daysAdvanced + 1);
                return;
            }
        }
        daysAdvanced++;

        // Process Match Day Logic (Sundays)
        const totalDaysElapsed = ((saveContext.year - 1) * MONTHS_PER_YEAR * 28) + ((saveContext.month - 1) * 28) + (saveContext.day - 1);
        const currentWeekIndex = Math.floor(totalDaysElapsed / 7) % (MONTHS_PER_YEAR * 4);
        const dayOfWeek = saveContext.day % 7;

        if (dayOfWeek === 0) {
            // It is match day (Sunday)
            if (currentWeekIndex < saveContext.schedule.length) {
                if (typeof simulateLeagueMatches === 'function') {
                    simulateLeagueMatches(saveContext, currentWeekIndex);
                }
            } else if (currentWeekIndex === 19) {
                // Aowan Cup Day
                const standings = getStandings(saveContext);
                const topTwo = standings.slice(0, 2);
                const playerInCup = topTwo.some(t => t.isPlayer);

                if (!playerInCup) {
                    // Simulate the cup for AI
                    const winnerIdx = Math.random() < 0.5 ? 0 : 1;
                    const winner = topTwo[winnerIdx];
                    const loser = topTwo[1 - winnerIdx];

                    const newsList = document.getElementById('newsList');
                    if (newsList) {
                        const newsItem = document.createElement('div');
                        newsItem.className = 'news-item';
                        newsItem.style.borderLeft = '4px solid gold';
                        newsItem.innerHTML = `<p><strong>AOWAN CUP RESULT:</strong> <strong>${winner.team.name}</strong> has defeated ${loser.team.name} to claim the Grand Trophy!</p>`;
                        newsList.insertBefore(newsItem, newsList.firstChild);
                    }
                }
            }
        }

        // Process daily healing
        let healedAnyone = false;

        // Heal Player Roster
        saveContext.roster.forEach(glad => {
            const maxHp = glad.maxHp || calculateMaxHp(glad);
            if (glad.hp < maxHp) {
                glad.hp = Math.min(glad.hp + Math.max(1, Math.floor(maxHp * 0.1)), maxHp);
                healedAnyone = true;
            }
        });

        // Heal Opponent Rosters and Process Recruitment
        if (saveContext.opposingRosters) {
            Object.values(saveContext.opposingRosters).forEach(aiTeamData => {
                const roster = aiTeamData.roster || aiTeamData;
                roster.forEach(glad => {
                    const maxHp = glad.maxHp || calculateMaxHp(glad);
                    if (glad.hp < maxHp) {
                        glad.hp = Math.min(glad.hp + Math.max(1, Math.floor(maxHp * 0.1)), maxHp);
                    }
                });

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

        // DETERMINE IF WE SHOULD STOP ADVANCING
        let shouldStop = false;

        // 1. Regular Season Match Day
        if (dayOfWeek === 0 && currentWeekIndex < saveContext.schedule.length) {
            const weekObj = saveContext.schedule[currentWeekIndex];
            const weekMatches = (weekObj && weekObj.matches) ? weekObj.matches : (Array.isArray(weekObj) ? weekObj : []);
            if (weekMatches.find && weekMatches.find(m => m.home === saveContext.teamId || m.away === saveContext.teamId)) {
                shouldStop = true;
            }
        }

        // 2. Aowan Cup Prep Week Start
        if (saveContext.month === 5 && saveContext.day === 15) {
            shouldStop = true;
        }

        // 3. Aowan Cup Match Day (if participating)
        if (dayOfWeek === 0 && currentWeekIndex === 19) {
            const standings = getStandings(saveContext);
            const topTwo = standings.slice(0, 2);
            if (topTwo.some(t => t.isPlayer)) {
                shouldStop = true;
            }
        }

        if (shouldStop) {
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

function startNewSeason(saveContext) {
    if (typeof recalculateSeasonData === 'function') {
        recalculateSeasonData(saveContext);
    }

    // Log the event
    const newsList = document.getElementById('newsList');
    if (newsList) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.style.borderLeft = '4px solid #4CAF50';
        newsItem.innerHTML = `<p><strong>HAPPY NEW YEAR!</strong> Year ${saveContext.year} has begun. A fresh season of glory awaits!</p>`;
        newsList.insertBefore(newsItem, newsList.firstChild);
    }

    // Immediate save
    localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
}

// DEBUG COMMANDS
window.skipToCupPrep = function (wins = 15) {
    const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));
    if (!saveContext) return console.error("No save context found");

    // Reset records
    if (saveContext.opposingRosters) {
        Object.values(saveContext.opposingRosters).forEach(ai => {
            ai.wins = 0;
            ai.losses = 0;
        });
    }

    // Simulate all 18 weeks of regular season
    for (let i = 0; i < 18; i++) {
        simulateLeagueMatches(saveContext, i);
    }

    // Set player's wins (enough to be #1 or #2 usually)
    saveContext.matchResults = [];
    for (let i = 0; i < wins; i++) {
        saveContext.matchResults.push({ won: true, day: 1, month: 1, year: 1 });
    }
    for (let i = 0; i < (18 - wins); i++) {
        saveContext.matchResults.push({ won: false, day: 1, month: 1, year: 1 });
    }

    // Advance to Week 19 (Prep week)
    // Month 5, Day 15 is Week 19 Day 1
    saveContext.month = 5;
    saveContext.day = 15;

    localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
    console.log("Season simulated. Skipping to Week 19 (Aowan Cup Prep)...");
    location.reload();
};
