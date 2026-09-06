import { addChatMessage } from './chat.js';
import { playModeMusic, stopModeMusic } from './audio.js';
import { startArena } from './modes/arena.js';
import { startAvalugg } from './modes/avalugg.js';
import { startExtranjeria } from './modes/extranjeria.js';
import { startBoss } from './modes/boss.js';
import { startPasapalabra } from './modes/pasapalabra.js';
import { startPokerus } from './modes/pokerus.js';
import { startRayoSolar } from './modes/rayosolar.js';
import { startSafari } from './modes/safari.js';
import { startVistaLince } from './modes/vistalince.js';
import { startVoltorbExplosivo } from './modes/voltorbexplosivo.js';
import { startVolcan } from './modes/volcan.js';
import { startZoroarks } from './modes/zoroarks.js';
import { state } from './state.js';
import { $, showScreen } from './utils.js';

/* =========================================================
   MODE LAUNCHER
   ========================================================= */
// Pista de música de fondo (ver MODE_MUSIC_SRC en audio.js) asociada a cada
// modo. Los modos que no aparecen aquí (pasapalabra, rayosolar, arena, boss)
// se juegan sin música de fondo. Pokerus empieza sonando con la pista del
// primer día (pokerus1); el propio modo se encarga de pasar a pokerus2 en
// cuanto arranca el segundo día (ver startPokerusRound en pokerus.js).
const MODE_MUSIC_KEY = {
  zoroarks: 'zoroarks',
  safari: 'zona-safari',
  volcan: 'volcan',
  vistalince: 'vista-lince',
  extranjeria: 'extranjeria',
  voltorb: 'voltorb-explosivo',
  avalugg: 'glaciar',
  pokerus: 'pokerus1',
};

// Título (con icono) de cada modo de juego. Se exporta porque afkMode.js
// también lo necesita para anunciar por chat y mostrar en la pantalla de
// votación qué modos se están proponiendo, sin duplicar esta lista.
export const MODE_TITLES = {
  pasapalabra: '🎯 Pasapalabra',
  rayosolar: '☀️ Rayo Solar',
  arena: '⚔️ Arena Pokémon',
  zoroarks: '🦊 Zoroarks',
  safari: '🌿 Zona Safari',
  boss: '👹 Boss Cooperativo',
  pokerus: '🧬 Pokerus',
  volcan: '🌋 El Volcán',
  vistalince: '🦅 Vista Lince',
  extranjeria: '🛂 Control de Extranjería',
  voltorb: '💣 Voltorb Explosivo',
  avalugg: '❄️ Glaciar de Avalugg',
};

export function launchMode(mode) {
  state.currentMode = mode;
  state.scores = {};
  $('game-title').textContent = MODE_TITLES[mode];
  showScreen('game-screen');
  $('chat-messages').innerHTML = '';
  addChatMessage(null, `🎮 Iniciando ${MODE_TITLES[mode]}...`, 'system');
  switch (mode) {
    case 'pasapalabra': startPasapalabra(); break;
    case 'rayosolar': startRayoSolar(); break;
    case 'arena': startArena(); break;
    case 'zoroarks': startZoroarks(); break;
    case 'safari': startSafari(); break;
    case 'boss': startBoss(); break;
    case 'pokerus': startPokerus(); break;
    case 'volcan': startVolcan(); break;
    case 'vistalince': startVistaLince(); break;
    case 'extranjeria': startExtranjeria(); break;
    case 'voltorb': startVoltorbExplosivo(); break;
    case 'avalugg': startAvalugg(); break;
  }
  const musicKey = MODE_MUSIC_KEY[mode];
  if (musicKey) playModeMusic(musicKey); else stopModeMusic();
  // Se avisa con un evento (en vez de importar directamente la lógica de
  // pantalla completa desde eventListeners.js) para no crear una
  // dependencia circular entre módulos: eventListeners.js ya importa
  // launchMode desde aquí. El listener decide si corresponde pedir
  // pantalla completa automática según la preferencia guardada.
  document.dispatchEvent(new CustomEvent('pk-mode-launched'));
}

export function backToMenu() {
  state.currentMode = null;
  stopModeMusic();
  if (state.modeState && state.modeState.timer) clearInterval(state.modeState.timer);
  if (state.modeState && state.modeState.bossAttackTimer) clearInterval(state.modeState.bossAttackTimer);
  if (state.modeState && state.modeState.tickInterval) clearInterval(state.modeState.tickInterval);
  if (state.modeState && state.modeState.zoneTimeoutId) clearTimeout(state.modeState.zoneTimeoutId);
  if (state.modeState && state.modeState.autoAdvanceTimeout) clearTimeout(state.modeState.autoAdvanceTimeout);
  if (state.modeState && state.modeState.champWaitTimeout) clearTimeout(state.modeState.champWaitTimeout);
  // Modo AFK global del Coliseo (ver ARENA_AFK_IDLE_MS/scheduleArenaAfkIdleCheck en arena.js).
  if (state.modeState && state.modeState.afkIdleTimeout) clearTimeout(state.modeState.afkIdleTimeout);
  if (state.modeState && state.modeState.spawnTimeout) clearTimeout(state.modeState.spawnTimeout);
  if (state.modeState && state.modeState.guessCountdownInterval) clearInterval(state.modeState.guessCountdownInterval);
  if (state.modeState && state.modeState.nextRoundTimeout) clearTimeout(state.modeState.nextRoundTimeout);
  if (state.modeState && state.modeState.categoryBannerTimeout) clearTimeout(state.modeState.categoryBannerTimeout);
  if (state.modeState && state.modeState.moveTimeout) clearTimeout(state.modeState.moveTimeout);
  if (state.modeState && state.modeState.growTimeout) clearTimeout(state.modeState.growTimeout);
  if (state.modeState && state.modeState.blastTimeout) clearTimeout(state.modeState.blastTimeout);
  if (state.modeState && state.modeState.voltorbSprite) state.modeState.voltorbSprite.destroy();
  if (state.modeState && state.modeState.crossers) {
    Object.values(state.modeState.crossers).forEach(c => c.sprite && c.sprite.destroy());
  }
  if (state.modeState && state.modeState.arenaSprites) {
    if (state.modeState.arenaSprites.left) state.modeState.arenaSprites.left.destroy();
    if (state.modeState.arenaSprites.right) state.modeState.arenaSprites.right.destroy();
  }
  if (state.modeState && state.modeState.queueDom) {
    Object.values(state.modeState.queueDom).forEach(d => d.sprite && d.sprite.destroy());
  }
  if (state.modeState && state.modeState.lobbySprites) {
    Object.values(state.modeState.lobbySprites).forEach(d => d.sprite && d.sprite.destroy());
  }
  // Modo Boss: sprite PMD del jefe y el de cada combatiente apuntado (con
  // su posible trayecto pendiente de ida o vuelta).
  if (state.modeState && state.modeState.bossSprite) state.modeState.bossSprite.destroy();
  // Segundo jefe simultáneo (ver ms.boss2/BOSS_FINAL_BOSS_NAMES en
  // boss.js): solo existe en la fase final de los niveles con dos jefes a
  // la vez, pero se limpia siempre por si acaso.
  if (state.modeState && state.modeState.bossSprite2) state.modeState.bossSprite2.destroy();
  if (state.modeState && state.modeState.fighterSprites) {
    Object.values(state.modeState.fighterSprites).forEach(entry => {
      if (entry.walkTimer) clearTimeout(entry.walkTimer);
      if (entry.sprite) entry.sprite.destroy();
    });
  }
  // Ficha de combatiente del modo Boss (ver showBossFiche en boss.js): se
  // añade directamente a <body>, fuera de #game-content, así que hay que
  // quitarla a mano al salir del modo o quedaría huérfana en el DOM.
  if (state.modeState && state.modeState.bossFicheEl) state.modeState.bossFicheEl.remove();
  // Votación del Modo AFK del modo Boss (ver ms.afkVote/queueBossAfkVote en
  // boss.js), si quedó alguna a medias al salir del modo: se para su
  // cuenta atrás y se quita su overlay, añadido directamente a <body> o al
  // elemento a pantalla completa (fuera de #game-content también).
  if (state.modeState && state.modeState.afkVote && state.modeState.afkVote.tickInterval) {
    clearInterval(state.modeState.afkVote.tickInterval);
  }
  const staleBossAfkVoteOverlay = document.getElementById('boss-afk-vote-overlay');
  if (staleBossAfkVoteOverlay) staleBossAfkVoteOverlay.remove();
  if (state.modeState && state.modeState.fallTimeouts) {
    state.modeState.fallTimeouts.forEach(id => clearTimeout(id));
  }
  if (state.modeState && state.modeState.entranceTimeouts) {
    state.modeState.entranceTimeouts.forEach(id => clearTimeout(id));
  }
  if (state.modeState && state.modeState.fieldSprites) {
    Object.values(state.modeState.fieldSprites).forEach(d => {
      if (d.arriveTimeout) clearTimeout(d.arriveTimeout);
      if (d.sprite) d.sprite.destroy();
    });
  }
  // Modo El Volcán: sprite PMD de Heatran, si sigue en pantalla (cayendo,
  // disparando o subiendo) al salir del modo.
  if (state.modeState && state.modeState.heatran) {
    if (state.modeState.heatran.sprite) state.modeState.heatran.sprite.destroy();
    if (state.modeState.heatran.el) state.modeState.heatran.el.remove();
  }
  state.modeState = null;
  showScreen('menu-screen');
}
