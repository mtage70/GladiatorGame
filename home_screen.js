const homeScreen = document.getElementById('homeScreen');

function renderRoster() {
    const grid = document.querySelector('.roster-grid');
    const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));

    if (!saveContext || !saveContext.roster || !grid) return;

    // Update header stats and team name
    const homeTitle = document.querySelector('.home-title');
    if (homeTitle && saveContext.teamName) {
        homeTitle.textContent = saveContext.teamName;
    }

    const goldDisplay = document.getElementById('goldDisplay');
    const fameDisplay = document.getElementById('fameDisplay');
    if (goldDisplay) goldDisplay.innerHTML = `<span class="stat-icon">💰</span> ${saveContext.gold} G`;
    if (fameDisplay) fameDisplay.innerHTML = `<span class="stat-icon">🏆</span> Fame: ${saveContext.fame}`;

    grid.innerHTML = ''; // Clear current grid

    saveContext.roster.forEach(glad => {
        const slot = document.createElement('div');
        slot.className = 'roster-slot filled';
        const portraitHtml = glad.portrait
            ? `<div class="glad-portrait"><img src="${glad.portrait}" alt="${glad.name}" /></div>`
            : `<div class="glad-portrait blank"></div>`;
        slot.innerHTML = `
            <div class="glad-info">
                ${portraitHtml}
                <span class="glad-class ${glad.class.toLowerCase()}">${glad.class}</span>
                <span class="glad-name" title="${glad.name}">${glad.name} ${glad.surname}</span>
                <div class="glad-stats-mini">
                    <span title="Strength">💪${glad.stats.str}</span>
                    <span title="Dexterity">🏃${glad.stats.dex}</span>
                    <span title="Intelligence">🧠${glad.stats.int}</span>
                    <span title="Wisdom">✨${glad.stats.wis}</span>
                </div>
            </div>
        `;
        grid.appendChild(slot);
    });

    // Add recruit slot
    const recruitSlot = document.createElement('div');
    recruitSlot.className = 'roster-slot empty';
    recruitSlot.innerHTML = `<span>+ Recruit (500 G)</span>`;
    recruitSlot.addEventListener('click', () => {
        if (saveContext.gold >= 500) {
            // Play a brief sound if implemented, else just deduct
            saveContext.gold -= 500;
            saveContext.roster.push(generateGladiator());
            localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
            renderRoster();
        } else {
            // Make the slot shake or visually indicate failure
            recruitSlot.style.animation = 'shake 0.5s';
            setTimeout(() => recruitSlot.style.animation = '', 500);
        }
    });
    grid.appendChild(recruitSlot);

    renderCalendar(saveContext);
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
                eventDisplay.innerHTML = `<strong style="color:var(--color-accent-danger)">MATCH TODAY:</strong> ${vsText} ${opponentTeam.name}`;
            } else {
                eventDisplay.textContent = `Next Match in ${daysUntilMatch} days: ${vsText} ${opponentTeam.name}`;
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

    // Show home screen
    homeScreen.classList.remove('hidden');
}

// Initialize Widget Toggles
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.toggle('hidden');
                btn.classList.toggle('active');
            }
        });
    });
});
