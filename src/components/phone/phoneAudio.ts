// Plays a recording so it sounds like it's coming through a telephone, for
// every voice clip in the phone-call sequence. The original file stays clean;
// the effect is applied live in the browser:
//  - a narrow band (about 300-3400 Hz), the range a phone line carries
//  - a bump around 1.8 kHz for the boxy, nasal earpiece sound
//  - light saturation and compression, like a cheap mic and speaker
//  - a faint line hiss underneath

// How hard the signal is driven into the saturation. 0 is clean.
const DISTORTION = 6;
// Volume of the line hiss, relative to full scale.
const HISS = 0.004;

const saturationCurve = (amount: number) => {
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * (1 + amount)) / Math.tanh(1 + amount);
  }
  return curve;
};

export type PhoneVoice = {
  // Stops playback and frees the audio resources.
  stop: () => void;
  // How loud the clean recording is right now, roughly 0 (silent) to 1.
  level: () => number;
};

type Options = {
  // Runs when the clip finishes on its own.
  onEnded?: () => void;
  // Fades the volume up from silence over this many milliseconds.
  fadeInMs?: number;
  // Repeats the clip until stopped.
  loop?: boolean;
};

// Starts playing src through the telephone effect.
export const playThroughPhone = (
  src: string,
  { onEnded, fadeInMs = 0, loop = false }: Options = {}
): PhoneVoice => {
  const audio = new Audio(src);
  audio.loop = loop;
  const ctx = new AudioContext();
  const source = ctx.createMediaElementSource(audio);

  const filter = (type: BiquadFilterType, frequency: number, Q = 0.707, gain = 0) => {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequency;
    f.Q.value = Q;
    f.gain.value = gain;
    return f;
  };

  const chain: AudioNode[] = [
    source,
    filter("highpass", 300),
    filter("highpass", 300),
    filter("lowpass", 3400),
    filter("lowpass", 3400),
    filter("peaking", 1800, 1, 6),
    Object.assign(ctx.createWaveShaper(), {
      curve: saturationCurve(DISTORTION),
      oversample: "2x" as OverSampleType,
    }),
    ctx.createDynamicsCompressor(),
    ctx.createGain(),
    ctx.destination,
  ];
  for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]);

  const volume = (chain[chain.length - 2] as GainNode).gain;
  if (fadeInMs > 0) {
    volume.setValueAtTime(0, ctx.currentTime);
    volume.linearRampToValueAtTime(1, ctx.currentTime + fadeInMs / 1000);
  }

  // Measures the clean voice (before the effect) for the mouth movement.
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);
  const samples = new Float32Array(analyser.fftSize);

  // Line hiss: looping filtered noise, only while the clip plays.
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * HISS;
  noise.buffer = buffer;
  noise.loop = true;
  noise.connect(chain[1]);

  audio.addEventListener("ended", () => {
    noise.stop();
    ctx.close().catch(() => {});
    onEnded?.();
  });

  ctx.resume().catch(() => {});
  audio
    .play()
    .then(() => noise.start())
    .catch(() => {});

  return {
    stop: () => {
      audio.pause();
      ctx.close().catch(() => {});
    },
    level: () => {
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const v of samples) sum += v * v;
      // Speech RMS mostly sits between about 0.02 and 0.2.
      return Math.min(Math.sqrt(sum / samples.length) * 5, 1);
    },
  };
};
