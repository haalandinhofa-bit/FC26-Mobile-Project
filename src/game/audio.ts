export type Mixer = {
  unlock: () => void;
  setVolumes: (sfx: number, crowd: number) => void;
  play: (kind: string) => void;
  resume: () => void;
};

export function createMixer(): Mixer {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let sfx: GainNode | null = null;
  let crowd: GainNode | null = null;
  let crowdFilter: BiquadFilterNode | null = null;

  const unlock = () => {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC({ latencyHint: "interactive" });
      master = ctx.createGain();
      sfx = ctx.createGain();
      crowd = ctx.createGain();
      sfx.gain.value = 0.6;
      crowd.gain.value = 0.08;
      sfx.connect(master);
      crowd.connect(master);
      master.connect(ctx.destination);
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        brown = brown * 0.985 + white * 0.015;
        data[i] = brown * 2.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      crowdFilter = ctx.createBiquadFilter();
      crowdFilter.type = "bandpass";
      crowdFilter.frequency.value = 420;
      crowdFilter.Q.value = 0.55;
      src.connect(crowdFilter);
      crowdFilter.connect(crowd);
      src.start();
    }
    if (ctx.state === "suspended") void ctx.resume();
  };

  const setVolumes = (sfxV: number, crowdV: number) => {
    if (!ctx || !sfx || !crowd) return;
    sfx.gain.setTargetAtTime(Math.max(0, sfxV) ** 2, ctx.currentTime, 0.03);
    crowd.gain.setTargetAtTime(Math.max(0, crowdV) ** 2 * 0.22, ctx.currentTime, 0.05);
  };

  const burst = (freq: number, dur: number, type: OscillatorType, gain: number, slide = 0) => {
    if (!ctx || !sfx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(sfx);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  };

  const noise = (dur: number, gain: number, freq: number) => {
    if (!ctx || !sfx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(sfx);
    src.start();
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      g.disconnect();
    };
  };

  const play = (kind: string) => {
    if (!ctx) return;
    if (kind === "kick") {
      noise(0.09, 0.35, 420);
      burst(140, 0.08, "sine", 0.2, -80);
    } else if (kind === "shot") {
      noise(0.12, 0.45, 680);
      burst(180, 0.1, "triangle", 0.18, -90);
    } else if (kind === "whistle") {
      burst(1760, 0.28, "sine", 0.12, 80);
    } else if (kind === "goal") {
      burst(523, 0.18, "triangle", 0.16);
      burst(784, 0.28, "triangle", 0.14);
      noise(0.4, 0.3, 900);
      if (crowd) crowd.gain.setTargetAtTime(Math.min(0.45, crowd.gain.value + 0.25), ctx.currentTime, 0.05);
      window.setTimeout(() => {
        if (ctx && crowd) crowd.gain.setTargetAtTime(0.08, ctx.currentTime, 0.4);
      }, 700);
    } else if (kind === "save") {
      noise(0.14, 0.4, 500);
      burst(90, 0.12, "sine", 0.22, -40);
    } else if (kind === "foul") {
      burst(1480, 0.16, "square", 0.05);
    } else if (kind === "ui") {
      burst(660, 0.05, "sine", 0.05);
    }
  };

  return {
    unlock,
    setVolumes,
    play,
    resume: () => {
      if (ctx && ctx.state === "suspended") void ctx.resume();
    },
  };
}
