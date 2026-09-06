import { addChatMessage } from './chat.js';
import { handleChatCommand, setHandleChatCommand } from './commandRouter.js';
import { currentFullscreenElement } from './fullscreen.js';
import { MODE_TITLES, backToMenu, launchMode } from './modeLauncher.js';
import { state } from './state.js';
import { $ } from './utils.js';

/* =========================================================
   MODO AFK
   -----------------------------------------------------------
   Cuando está activo (ver Ajustes):
     1) En el menú de modos solo se muestran los juegos de
        AFK_MODE_KEYS (el resto quedan ocultos).
     2) Al terminar cualquier partida de esos modos (avisada por
        el evento 'pk-afk-match-ended', ver el final de cada
        modo en js/modes/*.js) se abre una votación de 40s en el
        chat con 4 opciones (!1 !2 !3 !4): volver a jugar el
        mismo modo, dos modos al azar disponibles en AFK, o un
        cuarto modo cualquiera elegido al resolver la votación.
     3) Se lanza el modo ganador automáticamente. Si ese modo
        tiene pantalla previa de inscripción ("Comenzar
        Partida"), se esperan 60s a que el chat se apunte y
        luego se fuerza el comienzo de la partida.
   Nada de esto ocurre si el Modo AFK está desactivado: en ese
   caso el juego funciona exactamente igual que antes.
   ========================================================= */

const AFK_MODE_STORAGE_KEY = 'pokekukoro_afk_mode';

// Modos disponibles en el Modo AFK, en el mismo orden en que aparecen en
// el menú (ver index.html). Todos disparan 'pk-afk-match-ended' al
// terminar su partida: boss cuando todos los combatientes caen a la vez o
// al completar la fase final del último nivel (ver triggerBossGameOver /
// triggerBossAfkFinalVictory en boss.js), arena cuando pasan 15s sin
// ningún combate activo (ver ARENA_AFK_IDLE_MS en arena.js) y el resto con
// su propio final de partida habitual.
const AFK_MODE_KEYS = ['pasapalabra', 'rayosolar', 'arena', 'zoroarks', 'boss', 'pokerus', 'volcan', 'vistalince', 'voltorb', 'avalugg'];

// Id del botón "▶ Comenzar Partida" de cada modo con pantalla previa de
// inscripción (lobby). Los modos que no aparecen aquí (pasapalabra, arena)
// empiezan a jugarse directamente, sin fase de inscripción, así que no
// necesitan la espera de 60s.
const AFK_LOBBY_START_BTN = {
  rayosolar: 'rayo-start-btn',
  zoroarks: 'zor-start-btn',
  boss: 'boss-start-btn',
  pokerus: 'pokerus-start-btn',
  volcan: 'volcan-start-btn',
  vistalince: 'vlince-start-btn',
  voltorb: 've-start-btn',
  avalugg: 'avl-start-btn',
};

const AFK_VOTE_SECONDS = 40;
const AFK_SIGNUP_SECONDS = 60;

/* ---------------------------------------------------------
   PREFERENCIA (persistida, igual que el Modo Subs)
   --------------------------------------------------------- */
export function loadAfkModePref() {
  try {
    state.afkMode = localStorage.getItem(AFK_MODE_STORAGE_KEY) === '1';
  } catch (e) {
    state.afkMode = false;
  }
  return state.afkMode;
}

export function setAfkMode(enabled) {
  state.afkMode = !!enabled;
  try {
    localStorage.setItem(AFK_MODE_STORAGE_KEY, state.afkMode ? '1' : '0');
  } catch (e) {
    // ignoramos si no se puede persistir
  }
  applyAfkMenuFilter();
  // Si se desactiva a mitad de una votación o de una espera de
  // inscripción, se cancela todo y el juego vuelve a comportarse con
  // normalidad (los temporizadores en curso comprueban state.afkMode
  // antes de actuar, pero además se limpia aquí explícitamente).
  if (!state.afkMode) cancelAfkVote();
}

/* ---------------------------------------------------------
   FILTRO DEL MENÚ DE MODOS
   --------------------------------------------------------- */
export function applyAfkMenuFilter() {
  document.querySelectorAll('.mode-card').forEach(card => {
    const allowed = !state.afkMode || AFK_MODE_KEYS.includes(card.dataset.mode);
    card.classList.toggle('afk-hidden', !allowed);
  });
}

/* ---------------------------------------------------------
   VOTACIÓN DEL SIGUIENTE MODO
   --------------------------------------------------------- */
let voteState = null; // { justPlayedMode, options, votes: Map(user->optionId), secondsLeft, tickInterval }
let signupInterval = null;

function pickRandomFrom(pool, n) {
  const arr = pool.slice();
  const picked = [];
  while (picked.length < n && arr.length) {
    const i = Math.floor(Math.random() * arr.length);
    picked.push(arr.splice(i, 1)[0]);
  }
  return picked;
}

function buildVoteOptions(justPlayedMode) {
  const pool = AFK_MODE_KEYS.filter(m => m !== justPlayedMode);
  const [pickA, pickB] = pickRandomFrom(pool, 2);
  return [
    { id: 1, targetMode: justPlayedMode, label: '🔁 Volver a jugar', sub: MODE_TITLES[justPlayedMode] },
    { id: 2, targetMode: pickA, label: MODE_TITLES[pickA], sub: 'Jugar este modo' },
    { id: 3, targetMode: pickB, label: MODE_TITLES[pickB], sub: 'Jugar este modo' },
    { id: 4, targetMode: null, label: '🎲 Modo aleatorio', sub: 'Cualquier otro modo disponible', randomExclude: [justPlayedMode, pickA, pickB] },
  ];
}

function tallyVotes() {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  if (voteState) voteState.votes.forEach(optionId => { counts[optionId] = (counts[optionId] || 0) + 1; });
  return counts;
}

function closeAnyModal() {
  const modal = $('modal');
  if (modal) modal.classList.remove('show');
}

function removeAfkVoteOverlay() {
  const el = document.getElementById('afk-vote-overlay');
  if (el) el.remove();
}

function afkOverlayParent() {
  return currentFullscreenElement() || document.body;
}

function renderAfkVoteOverlay() {
  removeAfkVoteOverlay();
  if (!voteState) return;
  const overlay = document.createElement('div');
  overlay.className = 'afk-vote-overlay';
  overlay.id = 'afk-vote-overlay';
  overlay.innerHTML = `
    <div class="afk-vote-box">
      <div class="afk-vote-title pixel">🤖 Modo AFK</div>
      <div class="afk-vote-sub">¡Vota el próximo modo! Escribe <b>!1</b>, <b>!2</b>, <b>!3</b> o <b>!4</b> en el chat</div>
      <div class="afk-vote-timer pixel" id="afk-vote-timer">${voteState.secondsLeft}</div>
      <div class="afk-vote-options" id="afk-vote-options"></div>
    </div>
  `;
  afkOverlayParent().appendChild(overlay);
  renderAfkVoteOptions();
}

function renderAfkVoteOptions(winnerId) {
  const box = document.getElementById('afk-vote-options');
  if (!box || !voteState) return;
  const counts = tallyVotes();
  box.innerHTML = voteState.options.map(opt => `
    <div class="afk-vote-option${winnerId === opt.id ? ' is-winner' : ''}">
      <div class="afk-vote-num pixel">${opt.id}</div>
      <div class="afk-vote-texts">
        <div class="afk-vote-label">${opt.label}</div>
        <div class="afk-vote-modename">${opt.sub}</div>
      </div>
      <div class="afk-vote-count">${counts[opt.id] || 0} ${counts[opt.id] === 1 ? 'voto' : 'votos'}</div>
    </div>
  `).join('');
}

function startAfkVoteTimer() {
  voteState.tickInterval = setInterval(() => {
    if (!voteState) return;
    voteState.secondsLeft--;
    const timerEl = document.getElementById('afk-vote-timer');
    if (timerEl) timerEl.textContent = String(Math.max(voteState.secondsLeft, 0));
    if (voteState.secondsLeft <= 0) {
      clearInterval(voteState.tickInterval);
      resolveAfkVote();
    }
  }, 1000);
}

function beginAfkVote(justPlayedMode) {
  // El streamer pudo salir del modo o desactivar el Modo AFK mientras se
  // esperaba (ver el pequeño retraso en el listener del evento), así que
  // se comprueba de nuevo justo antes de abrir la votación.
  if (!state.afkMode || state.currentMode !== justPlayedMode) return;
  closeAnyModal();
  voteState = {
    justPlayedMode,
    options: buildVoteOptions(justPlayedMode),
    votes: new Map(),
    secondsLeft: AFK_VOTE_SECONDS,
    tickInterval: null,
  };
  addChatMessage(null, '🤖 Modo AFK: ¡vota el próximo modo con !1, !2, !3 o !4! (40s)', 'system');
  renderAfkVoteOverlay();
  startAfkVoteTimer();
}

function cancelAfkVote() {
  if (signupInterval) { clearInterval(signupInterval); signupInterval = null; }
  const badge = document.getElementById('afk-lobby-badge');
  if (badge) badge.remove();
  if (!voteState) return;
  if (voteState.tickInterval) clearInterval(voteState.tickInterval);
  voteState = null;
  removeAfkVoteOverlay();
}

function resolveAfkVote() {
  if (!voteState) return;
  const counts = tallyVotes();
  const maxVotes = Math.max(...voteState.options.map(o => counts[o.id] || 0));
  // Si nadie ha votado (maxVotes sería 0), se elige igualmente al azar
  // entre las 4 opciones, igual que en un empate.
  const winners = voteState.options.filter(o => (counts[o.id] || 0) === maxVotes);
  const winner = winners[Math.floor(Math.random() * winners.length)];

  let targetMode = winner.targetMode;
  if (targetMode == null) {
    const pool = AFK_MODE_KEYS.filter(m => !winner.randomExclude.includes(m));
    targetMode = pool[Math.floor(Math.random() * pool.length)] || voteState.justPlayedMode;
  }

  addChatMessage(null, `🏆 Gana la opción ${winner.id}: ¡a jugar ${MODE_TITLES[targetMode]}!`, 'correct');
  renderAfkVoteOptions(winner.id);

  voteState = null;
  setTimeout(() => {
    removeAfkVoteOverlay();
    proceedToAfkMode(targetMode);
  }, 3000);
}

function proceedToAfkMode(targetMode) {
  // El streamer pudo desactivar el Modo AFK durante los 3s de resultado;
  // en ese caso no se fuerza ningún cambio de modo.
  if (!state.afkMode) return;
  backToMenu();
  launchMode(targetMode);
  startAfkSignupCountdown(targetMode);
}

/* ---------------------------------------------------------
   ESPERA DE INSCRIPCIÓN (60s) Y COMIENZO AUTOMÁTICO
   --------------------------------------------------------- */
function startAfkSignupCountdown(mode) {
  const btnId = AFK_LOBBY_START_BTN[mode];
  if (!btnId) return; // este modo no tiene pantalla previa de inscripción
  if (signupInterval) clearInterval(signupInterval);
  let remaining = AFK_SIGNUP_SECONDS;
  const badge = document.createElement('div');
  badge.className = 'afk-lobby-badge';
  badge.id = 'afk-lobby-badge';
  badge.textContent = `🤖 Modo AFK: la partida empieza automáticamente en ${remaining}s`;
  document.body.appendChild(badge);
  signupInterval = setInterval(() => {
    remaining--;
    if (!state.afkMode || state.currentMode !== mode) {
      clearInterval(signupInterval);
      signupInterval = null;
      badge.remove();
      return;
    }
    const btn = $(btnId);
    if (!btn) {
      // La partida ya ha empezado por otra vía (p.ej. el streamer pulsó el
      // botón a mano), así que la pantalla de lobby ya no existe.
      clearInterval(signupInterval);
      signupInterval = null;
      badge.remove();
      return;
    }
    if (remaining <= 0) {
      clearInterval(signupInterval);
      signupInterval = null;
      badge.remove();
      btn.disabled = false;
      btn.click();
      return;
    }
    badge.textContent = `🤖 Modo AFK: la partida empieza automáticamente en ${remaining}s`;
  }, 1000);
}

/* ---------------------------------------------------------
   INTERCEPTOR DE COMANDOS DEL CHAT (!1 !2 !3 !4)
   -----------------------------------------------------------
   Se apoya en setHandleChatCommand (ver commandRouter.js), pensado
   precisamente para poder envolver el enrutador de comandos sin tocar su
   código. Cuando no hay ninguna votación en curso, el comportamiento del
   chat es exactamente el mismo que sin el Modo AFK.
   --------------------------------------------------------- */
const originalHandleChatCommand = handleChatCommand;

setHandleChatCommand((user, msg) => {
  if (voteState) {
    const text = msg.trim().toLowerCase();
    const match = /^!([1-4])$/.exec(text);
    if (match) {
      voteState.votes.set(String(user).toLowerCase(), Number(match[1]));
      renderAfkVoteOptions();
    }
    // Mientras dura la votación la partida anterior ya ha terminado y la
    // siguiente aún no ha empezado, así que se ignora cualquier otro
    // comando de juego.
    return;
  }
  originalHandleChatCommand(user, msg);
});

/* ---------------------------------------------------------
   ESCUCHA DEL FINAL DE PARTIDA
   --------------------------------------------------------- */
document.addEventListener('pk-afk-match-ended', (e) => {
  if (!state.afkMode) return;
  const mode = e.detail && e.detail.mode;
  if (!mode || !AFK_MODE_KEYS.includes(mode)) return;
  // Pequeño respiro para que se alcance a ver el cartel de victoria propio
  // del modo antes de que aparezca la votación encima.
  setTimeout(() => beginAfkVote(mode), 1800);
});

// Estado inicial al cargar la página.
loadAfkModePref();
applyAfkMenuFilter();
