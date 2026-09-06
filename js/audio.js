/* =========================================================
   AUDIO
   Efectos de sonido cortos, sintetizados en el momento con la Web Audio
   API (osciladores), para no depender de ningún archivo de audio externo.
   ========================================================= */
/* =========================================================
   VOLUMEN GLOBAL (música / efectos)
   -----------------------------------------------------------
   Dos multiplicadores (0..1) que se aplican, respectivamente, a todos los
   efectos de sonido sintetizados (beep/noiseBurst) y a la música de fondo
   en bucle. Se persisten en localStorage para recordarlos entre sesiones.
   ========================================================= */
const MUSIC_VOLUME_STORAGE_KEY = 'pokekukoro_music_volume';
const SFX_VOLUME_STORAGE_KEY = 'pokekukoro_sfx_volume';
const DEFAULT_VOLUME_SCALE = 0.7;

let musicVolumeScale = DEFAULT_VOLUME_SCALE;
let sfxVolumeScale = DEFAULT_VOLUME_SCALE;

function clamp01(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return DEFAULT_VOLUME_SCALE;
  return Math.min(1, Math.max(0, n));
}

// Lee las preferencias de volumen guardadas (si existen) y las aplica.
// Se debe llamar una vez al arrancar la app, antes de sincronizar la UI.
export function loadVolumePrefs() {
  try {
    const m = localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY);
    const s = localStorage.getItem(SFX_VOLUME_STORAGE_KEY);
    musicVolumeScale = m !== null ? clamp01(parseFloat(m)) : DEFAULT_VOLUME_SCALE;
    sfxVolumeScale = s !== null ? clamp01(parseFloat(s)) : DEFAULT_VOLUME_SCALE;
  } catch (e) {
    // localStorage puede no estar disponible
    musicVolumeScale = DEFAULT_VOLUME_SCALE;
    sfxVolumeScale = DEFAULT_VOLUME_SCALE;
  }
  return { musicVolumeScale, sfxVolumeScale };
}

export function getMusicVolume() { return musicVolumeScale; }
export function getSfxVolume() { return sfxVolumeScale; }

export function setMusicVolume(v) {
  musicVolumeScale = clamp01(v);
  try { localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(musicVolumeScale)); } catch (e) { /* ignore */ }
  // Si hay música sonando ahora mismo, se ajusta al momento.
  if (currentMusicAudio) currentMusicAudio.volume = MODE_MUSIC_VOLUME * musicVolumeScale;
}

export function setSfxVolume(v) {
  sfxVolumeScale = clamp01(v);
  try { localStorage.setItem(SFX_VOLUME_STORAGE_KEY, String(sfxVolumeScale)); } catch (e) { /* ignore */ }
}

// Pitido corto para previsualizar el volumen de efectos al mover el slider.
export function playSfxPreview() {
  beep({ freq: 660, duration: 0.08, volume: 0.22, type: 'triangle' });
}

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  // Los navegadores suspenden el AudioContext hasta que hay una interacción
  // del usuario; como esta app siempre se usa tras pulsar botones (conectar,
  // lanzar un modo...), en la práctica ya hay gesto de sobra, pero por si
  // acaso se intenta reanudar cada vez que se pide sonido.
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

// Pitido corto y agudo tipo "beep" de cuenta atrás. `urgent` lo hace más
// agudo e insistente, pensado para el último segundo.
function beep({ freq = 880, duration = 0.12, volume = 0.18, type = 'square', delay = 0, freqEnd = null } = {}) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const vol = volume * sfxVolumeScale;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + duration);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
  return osc;
}

// Reproduce una secuencia de notas encadenadas en el tiempo, útil para
// pequeños "jingles" (acordes ascendentes/descendentes de pocas notas).
function playSequence(notes) {
  let t = 0;
  notes.forEach(n => {
    beep({ ...n, delay: (n.delay ?? 0) + t });
    t += n.gap ?? 0;
  });
}

// Buffer de ruido blanco reutilizable (se genera una sola vez) para
// construir sonidos de impacto/explosión sin depender de ficheros externos.
let noiseBuffer = null;
function getNoiseBuffer(ctx) {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  const length = ctx.sampleRate * 1; // 1s de ruido, se recorta con la duración deseada
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

// Ráfaga de ruido filtrado (paso bajo), para golpes secos, "whoosh" y la
// parte "sucia" de una explosión.
function noiseBurst({ duration = 0.3, volume = 0.3, filterFreq = 800, filterType = 'lowpass', delay = 0 } = {}) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const vol = volume * sfxVolumeScale;
  const t0 = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFreq, t0);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

// Aviso de "queda poco tiempo": un pitido de cuenta atrás que se usa una vez
// por segundo mientras quedan pocos segundos de ronda. `secondsLeft` ajusta
// el tono (más agudo y con doble pitido cuanto más cerca de 0) para que la
// tensión suba a medida que se acaba el tiempo.
export function playCountdownBeep(secondsLeft) {
  if (secondsLeft <= 1) {
    // Último segundo: doble pitido, más agudo y urgente.
    beep({ freq: 1046, duration: 0.11, volume: 0.22 });
    setTimeout(() => beep({ freq: 1318, duration: 0.14, volume: 0.24 }), 130);
  } else {
    // Resto de la cuenta atrás (5..2): un único pitido de aviso.
    beep({ freq: 784, duration: 0.1, volume: 0.16 });
  }
}

/* =========================================================
   EFECTOS ESPECÍFICOS DE VOLTORB EXPLOSIVO
   ========================================================= */

// Un viewer se apunta al lobby: "pop" corto y agudo.
export function playVeJoin() {
  beep({ freq: 660, duration: 0.07, volume: 0.14, type: 'triangle' });
  beep({ freq: 990, duration: 0.06, volume: 0.12, type: 'triangle', delay: 0.05 });
}

// Empieza la partida: pequeña fanfarria ascendente de 3 notas.
export function playVeMatchStart() {
  playSequence([
    { freq: 523, duration: 0.12, volume: 0.18, type: 'square', gap: 0.1 },
    { freq: 659, duration: 0.12, volume: 0.18, type: 'square', gap: 0.1 },
    { freq: 784, duration: 0.22, volume: 0.2, type: 'square' },
  ]);
}

// Aparece el cartel de una nueva categoría: campanilla de dos notas.
export function playVeCategory() {
  playSequence([
    { freq: 880, duration: 0.14, volume: 0.16, type: 'sine', gap: 0.09 },
    { freq: 1174, duration: 0.22, volume: 0.16, type: 'sine' },
  ]);
}

// Le toca el turno a alguien (el Voltorb se mueve hasta esa persona):
// un "tic" suave y breve, discreto para no cansar al sonar cada turno.
export function playVeTurn() {
  beep({ freq: 520, duration: 0.05, volume: 0.08, type: 'triangle' });
}

// Respuesta correcta: arpegio ascendente alegre.
export function playVeCorrect() {
  playSequence([
    { freq: 587, duration: 0.09, volume: 0.17, type: 'square', gap: 0.07 },
    { freq: 740, duration: 0.09, volume: 0.17, type: 'square', gap: 0.07 },
    { freq: 988, duration: 0.16, volume: 0.19, type: 'square' },
  ]);
}

// Respuesta incorrecta: zumbido descendente corto tipo "error".
export function playVeWrong() {
  beep({ freq: 300, duration: 0.16, volume: 0.16, type: 'sawtooth', freqEnd: 150 });
}

// Se agota el tiempo del turno: doble aviso de alarma, distinto del fallo
// normal para que se note que fue por tiempo y no por respuesta errónea.
export function playVeTimeout() {
  beep({ freq: 440, duration: 0.1, volume: 0.16, type: 'square' });
  beep({ freq: 349, duration: 0.16, volume: 0.16, type: 'square', delay: 0.13 });
}

// El Voltorb de alguien se hincha antes de explotar: sirena ascendente que
// dura aproximadamente lo mismo que la animación de hinchado (VE_GROW_MS).
export function playVeGrow(durationMs = 1500) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const dur = durationMs / 1000;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, t0);
  osc.frequency.exponentialRampToValueAtTime(520, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.14, t0 + dur * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.22, t0 + dur);
  // Un ligero tremolo (LFO sobre el volumen) para que suene a "pulso" de
  // tensión creciente en vez de un tono liso.
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(4, t0);
  lfo.frequency.linearRampToValueAtTime(11, t0 + dur);
  lfoGain.gain.setValueAtTime(0.06, t0);
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  lfo.start(t0);
  osc.stop(t0 + dur + 0.05);
  lfo.stop(t0 + dur + 0.05);
}

// ¡Explosión! Combina un golpe grave (sub-bass) con una ráfaga de ruido
// filtrado, para dar sensación de estallido sin usar ficheros de audio.
export function playVeExplosion() {
  const ctx = getAudioCtx();
  if (ctx) {
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t0);
    osc.frequency.exponentialRampToValueAtTime(30, t0 + 0.45);
    gain.gain.setValueAtTime(0.3, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.55);
  }
  noiseBurst({ duration: 0.45, volume: 0.28, filterFreq: 1800, filterType: 'lowpass' });
  noiseBurst({ duration: 0.12, volume: 0.18, filterFreq: 3200, filterType: 'highpass', delay: 0.01 });
}

// Se completa una categoría entre todos: jingle de éxito de 4 notas.
export function playVeRoundComplete() {
  playSequence([
    { freq: 659, duration: 0.1, volume: 0.16, type: 'triangle', gap: 0.08 },
    { freq: 784, duration: 0.1, volume: 0.16, type: 'triangle', gap: 0.08 },
    { freq: 988, duration: 0.1, volume: 0.16, type: 'triangle', gap: 0.08 },
    { freq: 1318, duration: 0.24, volume: 0.19, type: 'triangle' },
  ]);
}

// Fin de la partida con ganador: fanfarria final, más larga y vistosa.
export function playVeVictory() {
  playSequence([
    { freq: 523, duration: 0.13, volume: 0.19, type: 'square', gap: 0.11 },
    { freq: 659, duration: 0.13, volume: 0.19, type: 'square', gap: 0.11 },
    { freq: 784, duration: 0.13, volume: 0.19, type: 'square', gap: 0.11 },
    { freq: 1047, duration: 0.32, volume: 0.22, type: 'square' },
  ]);
}

// Fin de la partida sin supervivientes: tono neutro/apagado.
export function playVeDraw() {
  beep({ freq: 392, duration: 0.22, volume: 0.14, type: 'triangle' });
  beep({ freq: 330, duration: 0.3, volume: 0.14, type: 'triangle', delay: 0.2 });
}

/* =========================================================
   EFECTOS ESPECÍFICOS DE ZONA SAFARI
   ========================================================= */

// Un Pokémon toca la línea de meta y ya ha ganado: jingle de campanilla
// ascendente corto, alegre pero breve para no tapar el resto de la acción
// (puede sonar varias veces seguidas si llegan varios Pokémon).
export function playSafariGoal() {
  playSequence([
    { freq: 784, duration: 0.1, volume: 0.18, type: 'triangle', gap: 0.07 },
    { freq: 988, duration: 0.1, volume: 0.18, type: 'triangle', gap: 0.07 },
    { freq: 1318, duration: 0.2, volume: 0.2, type: 'triangle' },
  ]);
}

/* =========================================================
   EFECTOS ESPECÍFICOS DE ZOROARKS
   -----------------------------------------------------------
   Todos con un timbre más grave, rústico y "de aldea de noche" que los
   de Voltorb Explosivo (más triangle/sawtooth que square, barridos de
   frecuencia largos), a tono con el ambiente de pueblo y misterio del
   modo, reservados para los hitos más importantes de la partida
   (inscripción, inicio, y el desenlace de cada jugador que sube al
   escenario): un "rugido" sintetizado para la revelación del lobo.
   ========================================================= */

// Un viewer se apunta a la partida en el lobby (!participo): "pop" corto
// de dos notas, con un timbre más grave y de madera que el de Voltorb
// Explosivo.
export function playZorJoin() {
  beep({ freq: 493, duration: 0.07, volume: 0.14, type: 'triangle' });
  beep({ freq: 740, duration: 0.07, volume: 0.12, type: 'triangle', delay: 0.05 });
}

// Empieza la partida: un golpe grave y sordo (como una puerta de madera
// cerrándose) seguido de un breve acorde ascendente, como llamada a
// reunirse en la plaza.
export function playZorMatchStart() {
  noiseBurst({ duration: 0.3, volume: 0.14, filterFreq: 450, filterType: 'lowpass' });
  playSequence([
    { freq: 220, duration: 0.18, volume: 0.16, type: 'triangle', gap: 0.14, delay: 0.12 },
    { freq: 294, duration: 0.18, volume: 0.16, type: 'triangle', gap: 0.14 },
    { freq: 370, duration: 0.28, volume: 0.18, type: 'triangle' },
  ]);
}

// El jugador del escenario se salva (gana el "!no", o hay empate): acorde
// mayor, cálido, de alivio.
export function playZorSaved() {
  playSequence([
    { freq: 523, duration: 0.12, volume: 0.16, type: 'sine', gap: 0.09 },
    { freq: 659, duration: 0.12, volume: 0.16, type: 'sine', gap: 0.09 },
    { freq: 784, duration: 0.24, volume: 0.18, type: 'sine' },
  ]);
}

// El jugador del escenario queda eliminado y resulta ser un aldeano
// normal (no un lobo): golpe seco y grave, sin la fanfarria de la
// revelación del lobo.
export function playZorEliminated() {
  beep({ freq: 200, duration: 0.22, volume: 0.16, type: 'sawtooth', freqEnd: 60 });
  noiseBurst({ duration: 0.15, volume: 0.1, filterFreq: 600, filterType: 'lowpass', delay: 0.02 });
}

// ¡Era un lobo! Se revela el Zoroark (ver zorRevealWolfAndDie): impacto
// de ruido filtrado más un "rugido" grave sintetizado (barrido descendente
// ancho, con un segundo armónico más agudo encima), coincidiendo con el
// zoom de cámara sobre su posición.
export function playZorWolfReveal() {
  noiseBurst({ duration: 0.25, volume: 0.22, filterFreq: 2200, filterType: 'lowpass' });
  beep({ freq: 90, duration: 0.9, volume: 0.22, type: 'sawtooth', freqEnd: 45, delay: 0.05 });
  beep({ freq: 180, duration: 0.5, volume: 0.14, type: 'square', freqEnd: 90, delay: 0.1 });
}

/* =========================================================
   MÚSICA DE FONDO POR MODO
   -----------------------------------------------------------
   A diferencia de los efectos de arriba (sintetizados), la música de
   fondo son pistas .mp3 reales (assets/music/), una por modo, que se
   reproducen en bucle mientras dura la partida. Solo puede sonar una
   pista de música de fondo a la vez: al pedir una nueva se detiene y
   se libera la anterior.
   ========================================================= */
const MODE_MUSIC_SRC = {
  'zoroarks': 'assets/music/zoroarks.mp3',
  'zona-safari': 'assets/music/zona-safari.mp3',
  'volcan': 'assets/music/volcan.mp3',
  'vista-lince': 'assets/music/vista-lince.mp3',
  'extranjeria': 'assets/music/extranjeria.mp3',
  'voltorb-explosivo': 'assets/music/voltorb-explosivo.mp3',
  'glaciar': 'assets/music/glaciar.mp3',
  'pokerus1': 'assets/music/pokerus1.mp3',
  'pokerus2': 'assets/music/pokerus2.mp3',
};
const MODE_MUSIC_VOLUME = 0.35;

let currentMusicAudio = null;
let currentMusicKey = null;

// Empieza a reproducir en bucle la pista de música asociada a `key` (ver
// MODE_MUSIC_SRC). Si esa misma pista ya está sonando no hace nada (evita
// reiniciarla sin motivo, p.ej. al pulsar "Nueva Partida" dentro del mismo
// modo). Si `key` no tiene pista asociada, no reproduce nada.
export function playModeMusic(key) {
  const src = MODE_MUSIC_SRC[key];
  if (!src) return;
  if (currentMusicKey === key && currentMusicAudio) return;
  stopModeMusic();
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = MODE_MUSIC_VOLUME * musicVolumeScale;
  // El autoplay de audio puede requerir un gesto previo del usuario; como
  // esto siempre se dispara tras pulsar un botón (elegir modo, empezar
  // partida...) ya hay gesto de sobra, pero por si el navegador lo bloquea
  // igualmente, se ignora el error en vez de romper el flujo del juego.
  audio.play().catch(() => {});
  currentMusicAudio = audio;
  currentMusicKey = key;
}

// Detiene y libera la música de fondo actual, si había alguna sonando.
export function stopModeMusic() {
  if (currentMusicAudio) {
    try { currentMusicAudio.pause(); } catch (e) { /* noop */ }
    currentMusicAudio.src = '';
    currentMusicAudio = null;
  }
  currentMusicKey = null;
}
