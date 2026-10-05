// js/systems/audio.js
// Música e efeitos sonoros gerados por código (Web Audio API).
//
// Por que não usar um .mp3? O projeto não tem arquivo de áudio de verdade —
// o `musica.mp3` antigo tinha 0 bytes e nunca era tocado. Gerar o som por
// código deixa o jogo sem nenhum asset de áudio para baixar e funciona offline.
//
// Para usar uma música sua no lugar: coloque o arquivo em assets/audio/,
// carregue com `this.load.audio()` no BootScene e troque `Game.Audio.playMusic`
// por `scene.sound.play(...)`.

window.Game = window.Game || {};

(function () {
  'use strict';

  const MELODY_VOLUME = 0.055;
  const PAD_VOLUME = 0.028;
  const SFX_VOLUME = 0.18;

  /** Semitom -> frequência, usando A4 = 440 Hz. */
  const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function noteToFrequency(note) {
    const match = /^([A-G])(#|b)?(\d)$/.exec(note);
    if (!match) return 0;
    let semitone = SEMITONES[match[1]];
    if (match[2] === '#') semitone += 1;
    if (match[2] === 'b') semitone -= 1;
    const midi = semitone + (parseInt(match[3], 10) + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Melodia em loop: cada entrada é [nota ou null (pausa), duração em tempos].
  // Escrita em Lá menor pentatônico para soar calma, tipo canção de ninar.
  const MELODY = [
    ['E5', 1], ['G5', 0.5], ['A5', 1.5], ['G5', 1],
    ['E5', 1], ['D5', 0.5], ['C5', 1.5], [null, 1],
    ['A4', 1], ['C5', 0.5], ['D5', 1.5], ['E5', 1],
    ['G5', 1], ['E5', 0.5], ['D5', 1.5], [null, 1],
    ['C5', 1], ['D5', 0.5], ['E5', 1.5], ['G5', 1],
    ['A5', 1.5], ['G5', 0.5], ['E5', 2], [null, 1],
    ['D5', 1], ['E5', 0.5], ['G5', 1.5], ['E5', 1],
    ['D5', 1], ['C5', 0.5], ['A4', 2.5], [null, 1]
  ];

  /** Acordes de acompanhamento, alinhados com a melodia (2 acordes por frase). */
  const PADS = [
    [['A3', 'C4', 'E4'], 8], [['F3', 'A3', 'C4'], 8],
    [['C4', 'E4', 'G4'], 8], [['G3', 'B3', 'D4'], 8],
    [['A3', 'C4', 'E4'], 8], [['F3', 'A3', 'C4'], 8],
    [['D4', 'F4', 'A4'], 8], [['E3', 'G#3', 'B3'], 8]
  ];

  const TEMPO_BEAT = 0.42; // segundos por tempo

  const SFX = {
    click:   [{ freq: 660, type: 'triangle', dur: 0.07, gain: 1.0 }],
    step:    [{ freq: 220, type: 'sine',     dur: 0.05, gain: 0.5 }],
    correct: [{ freq: 659, type: 'triangle', dur: 0.10, gain: 1.0 },
              { freq: 880, type: 'triangle', dur: 0.16, gain: 1.0, delay: 0.09 }],
    wrong:   [{ freq: 220, type: 'sawtooth', dur: 0.22, gain: 0.7 }],
    pickup:  [{ freq: 880, type: 'sine',     dur: 0.10, gain: 1.0 },
              { freq: 1320, type: 'sine',    dur: 0.14, gain: 0.8, delay: 0.08 }],
    chest:   [{ freq: 392, type: 'triangle', dur: 0.14, gain: 1.0 },
              { freq: 523, type: 'triangle', dur: 0.14, gain: 1.0, delay: 0.13 },
              { freq: 659, type: 'triangle', dur: 0.14, gain: 1.0, delay: 0.26 },
              { freq: 784, type: 'triangle', dur: 0.30, gain: 1.0, delay: 0.39 }]
  };

  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let schedulerId = null;
  let melodyCursor = 0;
  let melodyIndex = 0;
  let padCursor = 0;
  let padIndex = 0;
  let playing = false;
  let muted = false;

  function ensureContext() {
    if (ctx) return ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : 1;
      masterGain.connect(ctx.destination);

      musicGain = ctx.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(masterGain);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = SFX_VOLUME;
      sfxGain.connect(masterGain);
    } catch (err) {
      ctx = null;
    }
    return ctx;
  }

  /** Toca uma nota avulsa com envelope simples. */
  function tone(freq, startTime, duration, volume, type, destination) {
    if (!ctx || freq <= 0) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), startTime + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(env);
    env.connect(destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /** Agenda os próximos ~300 ms de música (padrão lookahead). */
  function schedule() {
    if (!ctx || !playing) return;
    const horizon = ctx.currentTime + 0.3;

    while (melodyCursor < horizon) {
      const [note, beats] = MELODY[melodyIndex];
      if (note) {
        tone(noteToFrequency(note), melodyCursor, beats * TEMPO_BEAT * 0.92, MELODY_VOLUME, 'triangle', musicGain);
      }
      melodyCursor += beats * TEMPO_BEAT;
      melodyIndex = (melodyIndex + 1) % MELODY.length;
    }

    while (padCursor < horizon) {
      const [chord, beats] = PADS[padIndex];
      chord.forEach(n => tone(noteToFrequency(n), padCursor, beats * TEMPO_BEAT * 0.98, PAD_VOLUME, 'sine', musicGain));
      padCursor += beats * TEMPO_BEAT;
      padIndex = (padIndex + 1) % PADS.length;
    }
  }

  Game.Audio = {
    /**
     * Cria o AudioContext. Precisa ser chamado a partir de um gesto do usuário
     * (toque/clique), senão o navegador bloqueia o áudio.
     */
    unlock() {
      if (!ensureContext()) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    },

    get supported() {
      return Boolean(window.AudioContext || window.webkitAudioContext);
    },

    get muted() {
      return muted;
    },

    playMusic() {
      if (!ensureContext() || playing) return;
      playing = true;
      melodyIndex = 0;
      padIndex = 0;
      melodyCursor = ctx.currentTime + 0.1;
      padCursor = ctx.currentTime + 0.1;
      musicGain.gain.cancelScheduledValues(ctx.currentTime);
      musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
      musicGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
      schedulerId = window.setInterval(schedule, 100);
      schedule();
    },

    stopMusic() {
      playing = false;
      if (schedulerId !== null) {
        window.clearInterval(schedulerId);
        schedulerId = null;
      }
      if (ctx && musicGain) {
        musicGain.gain.cancelScheduledValues(ctx.currentTime);
        musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
        musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
    },

    get isPlaying() {
      return playing;
    },

    toggleMute() {
      muted = !muted;
      if (ctx && masterGain) masterGain.gain.value = muted ? 0 : 1;
      return muted;
    },

    /** Toca um efeito da tabela SFX. Nomes: click, step, correct, wrong, pickup, chest. */
    sfx(name) {
      if (!ctx || muted) return;
      const notes = SFX[name];
      if (!notes) return;
      const now = ctx.currentTime;
      notes.forEach(n => {
        tone(n.freq, now + (n.delay || 0), n.dur, SFX_VOLUME * n.gain, n.type, sfxGain);
      });
    }
  };
})();
