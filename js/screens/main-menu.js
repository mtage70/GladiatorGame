document.addEventListener('DOMContentLoaded', () => {
    // Inject team colors globally if save exists
    const saveContext = JSON.parse(localStorage.getItem('gladiatorSaveContext'));
    if (saveContext && saveContext.teamPrimaryColor) {
        document.documentElement.style.setProperty('--team-primary', saveContext.teamPrimaryColor);
        document.documentElement.style.setProperty('--team-secondary', saveContext.teamSecondaryColor);
    }

    const buttons = document.querySelectorAll('.menu-btn');
    const startOverlay = document.getElementById('startOverlay');
    const panBackground = document.getElementById('panBackground');
    const mainContainer = document.getElementById('mainContainer');

    // Check for save data
    const continueBtn = document.querySelector('[data-action="continue"]');
    const newGameBtn = document.querySelector('[data-action="new-game"]');

    const hasSaveData = localStorage.getItem('gladiatorSaveContext') !== null;
    if (!hasSaveData && continueBtn) {
        continueBtn.style.display = 'none';

        // Also remove primary highlight from new game since it's now logically the first option
        if (newGameBtn) newGameBtn.classList.add('primary');
    }

    let introTimeout;
    let isIntroPlaying = false;

    // Execute intro immediately
    isIntroPlaying = true;

    try {
        // Start background music immediately
        playBackgroundMusic();
    } catch (e) {
        console.warn("Audio autoplay blocked by browser until user interacts");
    }

    // Start pan animation
    panBackground.classList.add('animate-pan');

    // Show main menu after a delay to match pan
    introTimeout = setTimeout(() => {
        if (isIntroPlaying) {
            isIntroPlaying = false;
            mainContainer.classList.add('show-menu');
        }
    }, 6500);

    // Skip intro pan animation if clicking anywhere on the document
    document.addEventListener('click', () => {
        if (isIntroPlaying && mainContainer && panBackground) {
            isIntroPlaying = false;
            clearTimeout(introTimeout);

            // Instantly end pan animation
            panBackground.style.animation = 'none';
            panBackground.style.backgroundPosition = 'center 100%';

            // Show menu immediately
            mainContainer.classList.add('show-menu');
        }
    });

    const teamSelectionScreen = document.getElementById('teamSelectionScreen');
    const teamGrid = document.getElementById('teamGrid');
    const cancelTeamSelectBtn = document.getElementById('cancelTeamSelectBtn');

    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            mainContainer.classList.remove('show-menu');
            teamSelectionScreen.classList.remove('hidden');
        });
    }

    if (cancelTeamSelectBtn) {
        cancelTeamSelectBtn.addEventListener('click', () => {
            teamSelectionScreen.classList.add('hidden');
            mainContainer.classList.add('show-menu');
        });
    }

    if (teamGrid && typeof TEAMS !== 'undefined') {
        teamGrid.innerHTML = '';
        TEAMS.forEach(team => {
            const btn = document.createElement('button');
            btn.className = 'team-btn';
            btn.innerHTML = `
                <div class="team-header-container" style="justify-content: center;">
                    <img src="${team.logo}" class="team-logo-small" alt="${team.name} Logo">
                    <h3>${team.name}</h3>
                </div>
                <p>Mascot: ${team.mascot} | ${team.theme}</p>
            `;
            btn.addEventListener('click', () => {
                localStorage.setItem('gladiatorSaveContext', JSON.stringify({
                    gold: 2500,
                    fame: 0,
                    year: 1,
                    month: 1,
                    week: 1,
                    day: 1,
                    roster: generateInitialRoster(),
                    teamId: team.id,
                    teamName: team.name,
                    teamLogo: team.logo,
                    teamPrimaryColor: team.primaryColor,
                    teamSecondaryColor: team.secondaryColor,
                    schedule: generateSeasonSchedule(team.id),
                    opposingRosters: generateOpposingRosters(team.id)
                }));
                // Inject colors immediately
                document.documentElement.style.setProperty('--team-primary', team.primaryColor);
                document.documentElement.style.setProperty('--team-secondary', team.secondaryColor);

                teamSelectionScreen.classList.add('hidden');
                transitionToHome();
            });
            teamGrid.appendChild(btn);
        });
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            transitionToHome();
        });
    }

    // Track mouse position over buttons for dynamic glow effect
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const glow = btn.querySelector('.btn-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(212, 175, 55, 0.3) 0%, transparent 60%)`;
            }
        });

        btn.addEventListener('mouseleave', () => {
            const glow = btn.querySelector('.btn-glow');
            if (glow) {
                // Return to center glow on leave
                glow.style.background = `radial-gradient(circle at center, rgba(212, 175, 55, 0.2) 0%, transparent 60%)`;
            }
        });

        // Click actions
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleMenuAction(action);
        });
    });
});

function handleMenuAction(action) {
    console.log(`Menu action selected: ${action}`);

    // Play a small click sound here (conceptually)

    switch (action) {
        case 'continue':
            // Logic handled by event listener above
            break;
        case 'new-game':
            // Logic handled by event listener above
            break;
        case 'settings':
            alert('Opening settings... (Not implemented yet)');
            break;
        case 'exit':
            if (confirm('Are you sure you want to abandon the arena?')) {
                // In a true desktop wrapper this would close the process
                alert('Game closed. (This would exit the app)');
            }
            break;
        default:
            console.warn('Unknown action:', action);
    }
}


// playBackgroundMusic moved to js/ui/audio.js
