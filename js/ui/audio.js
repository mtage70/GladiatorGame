// Background Music
let bgmOscillator;
let bgmInterval;
let cachedAudioCtx;
let masterGainNode;
let currentTrack = null;

function getAudioContext() {
    if (cachedAudioCtx) return cachedAudioCtx;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    cachedAudioCtx = new AudioContext();

    // Create a master gain node that all tracks connect to instead of the destination directly
    masterGainNode = cachedAudioCtx.createGain();
    masterGainNode.connect(cachedAudioCtx.destination);

    return cachedAudioCtx;
}

function stopBackgroundMusic(fadeOutTime = 0) {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
    currentTrack = null;

    if (fadeOutTime > 0) {
        const time = audioCtx.currentTime;
        masterGainNode.gain.cancelScheduledValues(time);
        masterGainNode.gain.setValueAtTime(masterGainNode.gain.value, time);
        masterGainNode.gain.linearRampToValueAtTime(0, time + fadeOutTime);
    } else {
        masterGainNode.gain.value = 0;
    }
}

function playTrack(trackName, bpm, melody, oscillatorType, gainPeak, attackTime, releaseRatio) {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    // If we are already playing this exact track, do nothing (don't restart)
    if (currentTrack === trackName && bgmInterval !== null) {
        return;
    }

    // Completely stop previous track cleanly, but don't reset the master volume instantly
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }

    currentTrack = trackName;

    // Fade the master volume up for the new track
    const time = audioCtx.currentTime;
    masterGainNode.gain.cancelScheduledValues(time);
    // Start from whatever current volume is (it might be fading down from previous)
    masterGainNode.gain.setValueAtTime(masterGainNode.gain.value, time);
    // Ramp up to full volume over 2 seconds
    masterGainNode.gain.linearRampToValueAtTime(1.0, time + 2.0);

    const beatLen = 60 / bpm;
    let noteIndex = 0;

    function scheduleNote() {
        const time = audioCtx.currentTime;
        bgmOscillator = audioCtx.createOscillator();
        const noteGainNode = audioCtx.createGain();

        bgmOscillator.type = oscillatorType;
        bgmOscillator.frequency.value = melody[noteIndex];

        // Individual note envelope
        noteGainNode.gain.setValueAtTime(0, time);
        noteGainNode.gain.linearRampToValueAtTime(gainPeak, time + attackTime);
        noteGainNode.gain.linearRampToValueAtTime(0, time + beatLen * releaseRatio);

        // Connect the note's gain to the master gain, rather than destination directly
        bgmOscillator.connect(noteGainNode);
        noteGainNode.connect(masterGainNode);

        bgmOscillator.start(time);
        bgmOscillator.stop(time + beatLen);

        noteIndex = (noteIndex + 1) % melody.length;
    }

    // Kickstart the interval scheduler loop
    scheduleNote();
    bgmInterval = setInterval(scheduleNote, beatLen * 1000);
}

function playBackgroundMusic() {
    // Upbeat FF-style adventurer loop
    const melody = [261.63, 293.66, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66];
    playTrack('menu', 140, melody, 'triangle', 0.1, 0.05, 0.8);
}

function playBattleMusic() {
    // Intense driving minor melody loop: A3, E4, A3, F4, A3, E4, D4, C4
    const melody = [220.00, 329.63, 220.00, 349.23, 220.00, 329.63, 293.66, 261.63];
    playTrack('battle', 180, melody, 'triangle', 0.1, 0.05, 0.8);
}
