let context: AudioContext | undefined;

export function playClick() {
  context ??= new AudioContext();
  if (context.state === 'suspended') context.resume().catch(() => {});

  const now = context.currentTime;
  const tone = new OscillatorNode(context, {
    type: 'triangle',
    frequency: 2200,
  });
  const gain = new GainNode(context, { gain: 0 });

  tone.frequency.exponentialRampToValueAtTime(700, now + 0.03);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

  tone.connect(gain).connect(context.destination);
  tone.start(now);
  tone.stop(now + 0.035);
}
