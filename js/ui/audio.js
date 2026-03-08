// Background Music

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
