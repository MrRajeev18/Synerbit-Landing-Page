// Procedural Cyber Sound Synthesizer using Web Audio API
export function createCyberAudio() {
  let audioCtx = null;
  let isPlaying = false;
  let droneOsc = null;
  let droneGain = null;

  function initContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play subtle high-tech futuristic click / chirp
  function playClick() {
    try {
      initContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  // Play resonant quantum pulse shockwave sound
  function playPulseSound() {
    try {
      initContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {}
  }

  // Toggle ambient cyber drone
  function toggleDrone() {
    initContext();
    if (isPlaying) {
      if (droneGain) {
        droneGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        setTimeout(() => {
          if (droneOsc) droneOsc.stop();
          droneOsc = null;
        }, 500);
      }
      isPlaying = false;
    } else {
      droneOsc = audioCtx.createOscillator();
      droneGain = audioCtx.createGain();

      droneOsc.type = 'sawtooth';
      droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A

      // Soft low-pass filter
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, audioCtx.currentTime);

      droneGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 1.0);

      droneOsc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(audioCtx.destination);

      droneOsc.start();
      isPlaying = true;
    }
    return isPlaying;
  }

  return {
    playClick,
    playPulseSound,
    toggleDrone,
    isPlaying: () => isPlaying
  };
}
