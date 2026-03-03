document.addEventListener('DOMContentLoaded', () => {
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

    if (startOverlay) {
        startOverlay.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate skip trigger

            // Hide overlay
            startOverlay.classList.add('hidden');
            isIntroPlaying = true;

            // Play triumphant fanfare, triggering BGM when done
            playTrumpetFanfare(() => {
                playBackgroundMusic();
            });

            // Start pan animation
            panBackground.classList.add('animate-pan');

            // Show main menu after a delay to match pan
            introTimeout = setTimeout(() => {
                if (isIntroPlaying) {
                    isIntroPlaying = false;
                    mainContainer.classList.add('show-menu');
                }
            }, 6500);
        });
    }

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
                    schedule: generateSeasonSchedule(),
                    opposingRosters: generateOpposingRosters(team.id)
                }));
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

function playTrumpetFanfare(onComplete) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    // Resume context if suspended (browser auto-play policies)
    const audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    function playNote(frequency, startTime, duration, type = 'square') {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        // Envelope for brassy attack
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05); // quick attack
        gainNode.gain.setValueAtTime(0.2, startTime + duration - 0.1); // sustain
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // release

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    const t = audioCtx.currentTime;

    // Triumphant fanfare (C Major arpeggio)
    // C4, C4, C4, G4, E4, G4, C5
    const bpm = 120;
    const quarterNote = 60 / bpm; // 0.5s
    const eighthNote = quarterNote / 2; // 0.25s
    const triplet = quarterNote / 3; // 0.166s

    // Intro triplets
    playNote(261.63, t, triplet); // C4
    playNote(261.63, t + triplet, triplet);
    playNote(261.63, t + 2 * triplet, triplet);

    // Long G4
    playNote(392.00, t + quarterNote, quarterNote * 1.5);

    // E4, G4 fast
    playNote(329.63, t + quarterNote * 2.5, eighthNote); // E4
    playNote(392.00, t + quarterNote * 2.5 + eighthNote, eighthNote); // G4

    // Final triumphant C5
    playNote(523.25, t + quarterNote * 3, quarterNote * 2.5);

    // Call next function when done
    if (onComplete) {
        setTimeout(onComplete, (quarterNote * 5.5) * 1000);
    }
}

let bgmOscillator;
let bgmInterval;

function playBackgroundMusic() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();

    // Prevent overlapping streams if spammed
    if (bgmInterval) return;

    // Upbeat FF-style adventurer loop
    const bpm = 140;
    const beatLen = 60 / bpm;

    // Simple joyous loop: C4, D4, E4, G4, C5, G4, E4, D4...
    const melody = [261.63, 293.66, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66];
    let noteIndex = 0;

    function scheduleNote() {
        const time = audioCtx.currentTime;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'triangle'; // Flutey retro sound
        oscillator.frequency.value = melody[noteIndex];

        // Gentle plump envelope
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.1, time + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, time + beatLen * 0.8);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(time);
        oscillator.stop(time + beatLen);

        noteIndex = (noteIndex + 1) % melody.length;
    }

    // Kickstart the interval scheduler loop
    scheduleNote();
    bgmInterval = setInterval(scheduleNote, beatLen * 1000);
}
