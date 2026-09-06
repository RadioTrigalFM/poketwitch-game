import { addChatMessage, connectTwitch, hideStreamerChatBox, sendStreamerDemoMessage, startDemoMode } from './chat.js';
import { currentFullscreenElement, exitFallbackFullscreen, getSceneFallbackElement, isAutoFullscreenEnabled, loadAutoFullscreenPref, setAutoFullscreen, stopFullscreenSpriteScale, toggleSceneFullscreen } from './fullscreen.js';
import { backToMenu, launchMode } from './modeLauncher.js';
import { closeLobbyExpelPopover } from './lobbyExpel.js';
import { closeExpelPopover } from './modes/arena.js';
import { getMusicVolume, getSfxVolume, loadVolumePrefs, playSfxPreview, setMusicVolume, setSfxVolume } from './audio.js';
import { state } from './state.js';
import { loadAfkModePref, setAfkMode } from './afkMode.js';
import { loadSubsModePref, setSubsMode } from './subsMode.js';
import { loadBossSpriteUnlocksPref } from './bossSpriteLocks.js';
import { initPokemonCommandsScreen } from './pokemonCommands.js';
import { initHowToPlayScreen } from './howToPlay.js';
import { $, relocateModal, showModal, showScreen } from './utils.js';

/* =========================================================
   EVENT LISTENERS
   ========================================================= */
$('connect-btn').onclick = async () => {
  const channel = $('channel-input').value.trim().replace(/^#/, '');
  const token = $('token-input').value.trim();
  if (!channel) {
    $('connect-status').className = 'status show err';
    $('connect-status').textContent = 'Introduce un nombre de canal';
    return;
  }
  $('connect-status').className = 'status show';
  $('connect-status').style.background = 'rgba(59,76,202,.15)';
  $('connect-status').style.color = '#8ab4ff';
  $('connect-status').textContent = 'Conectando...';
  try {
    state.client = await connectTwitch(channel, token);
    state.channel = channel;
    state.token = token;
    $('channel-name').textContent = '#' + channel;
    showScreen('menu-screen');
  } catch (e) {
    $('connect-status').className = 'status show err';
    $('connect-status').textContent = 'Error: ' + e.message;
  }
};

$('demo-btn').onclick = () => {
  state.channel = 'demo';
  $('channel-name').textContent = '#demo (simulado)';
  showScreen('menu-screen');
  startDemoMode();
};

$('disconnect-btn').onclick = () => {
  if (state.client) state.client.disconnect();
  if (state.demoInterval) clearInterval(state.demoInterval);
  state.client = null;
  state.demoMode = false;
  state.viewers.clear();
  hideStreamerChatBox();
  showScreen('connect-screen');
};

$('back-btn').onclick = () => {
  showModal('¿Volver al menú?', 'Se perderá el progreso del modo actual.', [
    { label: 'Cancelar', class: 'btn-secondary' },
    { label: 'Sí, volver', onClick: backToMenu },
  ]);
};

document.querySelectorAll('.mode-card').forEach(card => {
  card.onclick = () => launchMode(card.dataset.mode);
});

// Modo Subs: disponible desde la pantalla de selección de modo (nunca
// dentro de la pantalla de juego), así que aplica a cualquier modo que se
// lance a partir de aquí.
function syncSubsModeUi() {
  const checkbox = $('subs-mode-checkbox');
  const toggle = $('subs-mode-toggle');
  const note = $('subs-mode-note');
  if (checkbox) checkbox.checked = state.subsMode;
  if (toggle) toggle.classList.toggle('is-active', state.subsMode);
  if (note) note.classList.toggle('is-visible', state.subsMode);
}
loadSubsModePref();
syncSubsModeUi();

// Sprites especiales del Boss (Wishiwashi Banco, Aegislash Espada...)
// desbloqueados en partidas anteriores (ver bossSpriteLocks.js): se
// cargan una sola vez al arrancar, sin ningún control propio en Ajustes
// (el desbloqueo es automático al superar la fase correspondiente, ver
// spawnNewBoss en modes/boss.js).
loadBossSpriteUnlocksPref();
const subsModeCheckbox = $('subs-mode-checkbox');
if (subsModeCheckbox) {
  subsModeCheckbox.onchange = () => {
    setSubsMode(subsModeCheckbox.checked);
    syncSubsModeUi();
  };
}

// Modo AFK: disponible desde Ajustes. Al activarse, filtra el menú de
// modos y hace que el streamer y el chat encadenen partidas solos (ver
// afkMode.js para toda la lógica de votación y arranque automático).
function syncAfkModeUi() {
  const checkbox = $('afk-mode-checkbox');
  const toggle = $('afk-mode-toggle');
  const note = $('afk-mode-note');
  if (checkbox) checkbox.checked = state.afkMode;
  if (toggle) toggle.classList.toggle('is-active', state.afkMode);
  if (note) note.classList.toggle('is-visible', state.afkMode);
}
loadAfkModePref();
syncAfkModeUi();
const afkModeCheckbox = $('afk-mode-checkbox');
if (afkModeCheckbox) {
  afkModeCheckbox.onchange = () => {
    setAfkMode(afkModeCheckbox.checked);
    syncAfkModeUi();
  };
}

// Ajustes: pantalla accesible desde el menú principal, con el Modo Subs
// (movido aquí) y los controles de volumen de música/efectos.
if ($('settings-btn')) {
  $('settings-btn').onclick = () => showScreen('settings-screen');
}
if ($('settings-back-btn')) {
  $('settings-back-btn').onclick = () => showScreen('menu-screen');
}

// Pantalla "Comandos de Pokémon" (ver pokemonCommands.js): botón propio
// dentro de Ajustes que abre una lista de solo consulta con el comando
// !pokemon [nombre] de cada Pokémon disponible, en orden de Pokédex.
initPokemonCommandsScreen();
initHowToPlayScreen();

function syncVolumeUi() {
  const musicSlider = $('music-volume-slider');
  const sfxSlider = $('sfx-volume-slider');
  const musicValue = $('music-volume-value');
  const sfxValue = $('sfx-volume-value');
  const musicPct = Math.round(getMusicVolume() * 100);
  const sfxPct = Math.round(getSfxVolume() * 100);
  if (musicSlider) musicSlider.value = String(musicPct);
  if (sfxSlider) sfxSlider.value = String(sfxPct);
  if (musicValue) musicValue.textContent = musicPct + '%';
  if (sfxValue) sfxValue.textContent = sfxPct + '%';
}
loadVolumePrefs();
syncVolumeUi();
const musicVolumeSlider = $('music-volume-slider');
if (musicVolumeSlider) {
  musicVolumeSlider.oninput = () => {
    setMusicVolume(Number(musicVolumeSlider.value) / 100);
    syncVolumeUi();
  };
}
const sfxVolumeSlider = $('sfx-volume-slider');
if (sfxVolumeSlider) {
  sfxVolumeSlider.oninput = () => {
    setSfxVolume(Number(sfxVolumeSlider.value) / 100);
    syncVolumeUi();
    playSfxPreview();
  };
}

// Pantalla completa automática al entrar a un modo de juego.
function syncAutoFullscreenUi() {
  const checkbox = $('auto-fullscreen-checkbox');
  const toggle = $('auto-fullscreen-toggle');
  if (checkbox) checkbox.checked = isAutoFullscreenEnabled();
  if (toggle) toggle.classList.toggle('is-active', isAutoFullscreenEnabled());
}
loadAutoFullscreenPref();
syncAutoFullscreenUi();
const autoFullscreenCheckbox = $('auto-fullscreen-checkbox');
if (autoFullscreenCheckbox) {
  autoFullscreenCheckbox.onchange = () => {
    setAutoFullscreen(autoFullscreenCheckbox.checked);
    syncAutoFullscreenUi();
  };
}

// Cierra el popover "Expulsar" de la cola del Coliseo si el streamer hace
// clic fuera de cualquier Pokémon de la cola (el propio clic sobre un
// caminante, o sobre el botón Expulsar, ya detiene la propagación).
document.addEventListener('click', () => {
  if (state.modeState && state.modeState.expelPopoverQid != null) closeExpelPopover();
  if (state.modeState && state.modeState.lobbyExpelPopoverUser != null) closeLobbyExpelPopover(state.modeState);
});

$('streamer-chat-send').onclick = sendStreamerDemoMessage;
$('streamer-chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendStreamerDemoMessage();
});

// Enter key on channel input
$('channel-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('connect-btn').click();
});

/* ---------- Fullscreen por pantalla de juego ----------
   Cada modo añade su propio botón (.scene-fullscreen-btn) dentro del
   contenedor que representa su escena de juego (.game-scene). Al pulsarlo,
   solo esa escena entra en pantalla completa (el chat y los cuadros de
   información de debajo quedan fuera, ya que no forman parte del elemento
   que se pone en pantalla completa).

   La mecánica de entrada/salida (API nativa + fallback ".fs-fallback"
   simulado con position:fixed para entornos como Safari iOS u OBS Browser
   Source, que no soportan requestFullscreen() sobre un <div>) vive en
   fullscreen.js: se importa aquí (toggleSceneFullscreen) para el botón
   "⛶" de cada escena, pero también la usan otros módulos directamente
   -por ejemplo rayosolar.js, para restaurar la pantalla completa sobre el
   lobby nuevo tras pulsar "Nueva Partida" sin pasar por este archivo. */

function updateSceneFullscreenBtns() {
  const active = currentFullscreenElement();
  // Red de seguridad para salidas de pantalla completa que no pasan por el
  // "else" de toggleSceneFullscreen (p.ej. el usuario pulsa Esc sobre la
  // pantalla completa nativa, o la cierra con los controles del propio
  // navegador): sin esto, --zor-sprite-scale se quedaría fijada al último
  // valor y los sprites no volverían a su tamaño normal.
  if (!active) stopFullscreenSpriteScale();
  document.querySelectorAll('.scene-fullscreen-btn').forEach(btn => {
    const scene = btn.closest('.game-scene');
    const isThis = !!(active && scene === active);
    btn.classList.toggle('is-active', isThis);
    const label = isThis ? 'Salir de pantalla completa' : 'Pantalla completa';
    btn.title = label;
    btn.setAttribute('aria-label', label);
  });
  // El modal global (p.ej. el pasaporte ampliado) vive fuera de .game-scene
  // en el HTML; si no se reubica dentro de la escena en pantalla completa,
  // el navegador no lo pinta (queda "por detrás" de la escena) y parece
  // que no se puede abrir mientras se juega en pantalla completa.
  relocateModal();
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.scene-fullscreen-btn');
  if (!btn) return;
  toggleSceneFullscreen(btn.closest('.game-scene'));
});
['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange', 'scenefsfallbackchange'].forEach(evt => {
  document.addEventListener(evt, updateSceneFullscreenBtns);
});
// La pantalla completa simulada no tiene tecla Escape nativa (no es
// fullscreen "de verdad" a ojos del navegador), así que se gestiona a mano.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && getSceneFallbackElement()) exitFallbackFullscreen();
});

// Pantalla completa automática al entrar a un modo (preferencia de
// Ajustes): se reutiliza exactamente el mismo camino que el botón "⛶" de
// la escena (toggleSceneFullscreen), así que el streamer puede salir de
// la pantalla completa después con el propio botón, Esc, o los controles
// del navegador, igual que si la hubiera activado a mano.
document.addEventListener('pk-mode-launched', () => {
  if (!isAutoFullscreenEnabled()) return;
  const sceneEl = document.querySelector('#game-content .game-scene');
  if (sceneEl && !currentFullscreenElement()) toggleSceneFullscreen(sceneEl);
});

// Welcome
addChatMessage(null, '👋 ¡Bienvenido a PokéTwitch Arena!', 'system');
