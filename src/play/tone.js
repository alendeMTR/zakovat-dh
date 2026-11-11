// The tone at zero (D14), made with Web Audio: no sound file to load.
// Browsers start audio only after a user gesture, so `primeAudio` runs on the Start click.

let context = null;

export function primeAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context ??= new AudioContext();
    if (context.state === "suspended") context.resume();
  } catch {
    context = null; // no audio on this device; the timer still turns red
  }
}

/** Two short beeps, about one second in all. */
export function playTone() {
  if (!context) primeAudio();
  if (!context) return;
  const start = context.currentTime + 0.02;
  for (const offset of [0, 0.45]) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.35, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.35);
    osc.connect(gain).connect(context.destination);
    osc.start(start + offset);
    osc.stop(start + offset + 0.4);
  }
}
