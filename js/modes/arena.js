import { addChatMessage } from '../chat.js';
import { bossSpriteLockBlockMessage } from '../bossSpriteLocks.js';
import { ARENA_POKEMON_DB } from '../data/arenaPokemonDb.js';
import { getPokemonSprite } from '../data/pokemonDb.js';
import { currentFullscreenElement } from '../fullscreen.js';
import { PMDSprite, PMD_DIR, arenaDirectionFor, pmdHasLocalSprite, pmdPreload } from '../pmdSprite.js';
import { rollShinyPokemon } from '../pokemonShiny.js';
import { state } from '../state.js';
import { $, addScore, renderRanking } from '../utils.js';
// playVeJoin: mismo sonido de "apuntarse" que usa el lobby de Voltorb
// Explosivo (ver audio.js), reutilizado aquí para cuando un jugador entra
// en la cola del Coliseo.
import { playVeJoin } from '../audio.js';

/* =========================================================
   ARENA MODE — COLISEO POKÉMON
   Los jugadores hacen cola fuera del coliseo (!pokemon <nombre>).
   El primero en llegar sube como campeón y espera retador; cada
   nuevo jugador en cola reta al campeón. El ganador se queda en
   el coliseo como campeón para el siguiente combate.
   Todos los Pokémon comparten las mismas estadísticas de combate
   (vida, daño, velocidad de ataque); lo único que cambia es el
   tipo de su ataque principal (el tipo primario del Pokémon),
   sujeto a la tabla de tipos oficial.
   ========================================================= */

// Estadísticas de combate idénticas para todos los Pokémon del Coliseo
const ARENA_BASE_STATS = {
  hp: 120,
  atk: 22,          // daño base del ataque normal
  abilityAtkMult: 1.8, // multiplicador de daño de la habilidad especial
  critChance: 0.10,
  dodgeChance: 0.10,
  abilityCooldown: 3,
};

// Los combates del Coliseo son automáticos: cada este intervalo (ms) el
// Pokémon al que le toca turno ataca por sí solo, sin que el chat tenga
// que escribir ningún comando de ataque.
const ARENA_TURN_MS = 1600;

// Número máximo de jugadores que pueden esperar en la cola del Coliseo a la vez.
const ARENA_MAX_QUEUE = 16;

// Retraso (ms) entre el inicio de la animación de ataque y el momento en que
// el golpe "conecta" de verdad: hasta que pasa este tiempo no se aplican el
// daño ni la bajada de vida, ni se reproduce la animación de Hurt del rival,
// para que no se vea el efecto del golpe antes de que el Pokémon esté
// realmente atacando.
const ARENA_HIT_DELAY_MS = 500;

// Multiplicador de velocidad de las animaciones PMD (Walk/Attack/Hurt) de
// los Pokémon que están en el coliseo del modo Arena: al valer 2, cada
// frame dura el doble, así que la animación se reproduce al doble de lenta.
const ARENA_ANIM_SPEED = 2;

// Duración (ms) del desvanecimiento del Pokémon derrotado en el coliseo:
// debe desaparecer poco a poco mientras se reproduce su animación de Hurt.
const ARENA_FAINT_FADE_MS = 1300;

// Modo AFK global (ver afkMode.js): el Coliseo normalmente es interminable
// (el campeón se queda esperando a quien quiera retarlo, sin límite de
// tiempo), pero en Modo AFK sí necesita un final propio para poder pasar
// solo al siguiente modo votado. Si pasan ARENA_AFK_IDLE_MS seguidos sin
// ningún combate activo (ms.currentBattle a null, tanto nada más empezar
// como entre un combate y el siguiente si nadie hace cola o el streamer no
// avanza la cola), la partida se da por terminada (ver
// scheduleArenaAfkIdleCheck/clearArenaAfkIdleCheck más abajo). Fuera del
// Modo AFK global esto nunca se activa: el Coliseo sigue siendo
// interminable como siempre.
const ARENA_AFK_IDLE_MS = 15000;

// Tabla de tipos (multiplicador de daño), igual que en los juegos principales.
// TYPE_CHART[tipoAtacante][tipoDefensor] = multiplicador. Si no aparece, es x1.
// Tabla completa (incluye Bicho, Acero, Siniestro y Hada), necesaria ahora que
// el Coliseo incluye Pokémon de todas las generaciones.
const TYPE_CHART = {
  'Normal':    { 'Roca': 0.5, 'Fantasma': 0, 'Acero': 0.5 },
  'Fuego':     { 'Planta': 2, 'Hielo': 2, 'Bicho': 2, 'Acero': 2, 'Fuego': 0.5, 'Agua': 0.5, 'Roca': 0.5, 'Dragón': 0.5 },
  'Agua':      { 'Fuego': 2, 'Tierra': 2, 'Roca': 2, 'Agua': 0.5, 'Planta': 0.5, 'Dragón': 0.5 },
  'Eléctrico': { 'Agua': 2, 'Volador': 2, 'Eléctrico': 0.5, 'Planta': 0.5, 'Dragón': 0.5, 'Tierra': 0 },
  'Planta':    { 'Agua': 2, 'Tierra': 2, 'Roca': 2, 'Fuego': 0.5, 'Planta': 0.5, 'Veneno': 0.5, 'Volador': 0.5, 'Bicho': 0.5, 'Dragón': 0.5, 'Acero': 0.5 },
  'Hielo':     { 'Planta': 2, 'Tierra': 2, 'Volador': 2, 'Dragón': 2, 'Fuego': 0.5, 'Agua': 0.5, 'Hielo': 0.5, 'Acero': 0.5 },
  'Lucha':     { 'Normal': 2, 'Hielo': 2, 'Roca': 2, 'Siniestro': 2, 'Acero': 2, 'Veneno': 0.5, 'Volador': 0.5, 'Psíquico': 0.5, 'Bicho': 0.5, 'Hada': 0.5, 'Fantasma': 0 },
  'Veneno':    { 'Planta': 2, 'Hada': 2, 'Veneno': 0.5, 'Tierra': 0.5, 'Roca': 0.5, 'Fantasma': 0.5, 'Acero': 0 },
  'Tierra':    { 'Fuego': 2, 'Eléctrico': 2, 'Veneno': 2, 'Roca': 2, 'Acero': 2, 'Planta': 0.5, 'Bicho': 0.5, 'Volador': 0 },
  'Volador':   { 'Planta': 2, 'Lucha': 2, 'Bicho': 2, 'Eléctrico': 0.5, 'Roca': 0.5, 'Acero': 0.5 },
  'Psíquico':  { 'Lucha': 2, 'Veneno': 2, 'Psíquico': 0.5, 'Acero': 0.5, 'Siniestro': 0 },
  'Bicho':     { 'Planta': 2, 'Psíquico': 2, 'Siniestro': 2, 'Fuego': 0.5, 'Lucha': 0.5, 'Veneno': 0.5, 'Volador': 0.5, 'Fantasma': 0.5, 'Acero': 0.5, 'Hada': 0.5 },
  'Roca':      { 'Fuego': 2, 'Hielo': 2, 'Volador': 2, 'Bicho': 2, 'Lucha': 0.5, 'Tierra': 0.5, 'Acero': 0.5 },
  'Fantasma':  { 'Psíquico': 2, 'Fantasma': 2, 'Siniestro': 0.5, 'Normal': 0 },
  'Dragón':    { 'Dragón': 2, 'Acero': 0.5, 'Hada': 0 },
  'Siniestro': { 'Psíquico': 2, 'Fantasma': 2, 'Lucha': 0.5, 'Siniestro': 0.5, 'Hada': 0.5 },
  'Acero':     { 'Hielo': 2, 'Roca': 2, 'Hada': 2, 'Fuego': 0.5, 'Agua': 0.5, 'Eléctrico': 0.5, 'Acero': 0.5 },
  'Hada':      { 'Lucha': 2, 'Dragón': 2, 'Siniestro': 2, 'Fuego': 0.5, 'Veneno': 0.5, 'Acero': 0.5 },
};

// Devuelve el multiplicador total de daño de un tipo de ataque contra los
// (uno o dos) tipos de un Pokémon defensor.
function arenaTypeMultiplier(moveType, defenderTypes) {
  let mult = 1;
  const table = TYPE_CHART[moveType];
  if (table) {
    defenderTypes.forEach(defType => {
      if (table[defType] !== undefined) mult *= table[defType];
    });
  }
  return mult;
}

function makeArenaFighter(user, pokemon, attackTypeIndex = 0) {
  return {
    user,
    pokemon,
    hp: ARENA_BASE_STATS.hp,
    maxHp: ARENA_BASE_STATS.hp,
    abilityCd: 0,
    // Tipo de ataque elegido con !habilidad1/!habilidad2 (ver
    // handleArenaAbility) mientras esperaba en la cola o como campeón:
    // 0 = tipo primario, 1 = tipo secundario. Se hereda aquí para que la
    // elección hecha antes de entrar al coliseo no se pierda.
    attackTypeIndex,
  };
}

export function startArena() {
  state.modeState = {
    queue: [],       // [{user, pokemon, qid, attackTypeIndex}] esperando fuera del coliseo (caminando hacia su puesto)
    queueDom: {},    // qid -> { el, sprite: PMDSprite } — caminantes PMD de la cola en pantalla
    queueIdSeq: 0,   // contador para asignar un qid único a cada entrada de la cola
    champion: null,  // {user, pokemon, hp, maxHp, abilityCd, attackTypeIndex} — quien reina en el coliseo
    currentBattle: null, // {left, right, turn} cuando hay combate activo (left = campeón, right = retador)
    arenaSprites: null, // { left: PMDSprite, right: PMDSprite|null }
    tickInterval: null, // intervalo que hace que los combates avancen solos
    autoAdvance: false,      // si el streamer activa el avance automático de la cola
    autoAdvanceTimeout: null, // temporizador pendiente del próximo avance automático
    queueAdvancing: false,   // true mientras el puesto #1 está "en tránsito" hacia el coliseo
                             // (evita que se dispare un segundo avance antes de que el primero
                             // haya terminado de entrar; ver advanceQueueManually).
    champWaitTimeout: null, // temporizador pendiente que muestra al campeón esperando tras ganar
    defeatedUsers: new Set(), // usuarios que ya han perdido un combate en este Coliseo
    allowRejoin: false,       // si el streamer permite que los derrotados vuelvan a hacer cola
    expelPopoverQid: null,    // qid del puesto de cola cuyo popover "Expulsar" está abierto
    expelPopoverEl: null,     // elemento del popover "Expulsar" actualmente abierto
    queueHeightOverrideFrac: loadQueueHeightOverride(), // 0..1 (fracción de la altura de la escena, ya fijada de una calibración anterior) o null si se usa DEFAULT_QUEUE_HEIGHT_FRAC
    afkIdleTimeout: null, // temporizador del Modo AFK global (ver ARENA_AFK_IDLE_MS más arriba)
  };
  renderArena();
  state.modeState.tickInterval = setInterval(arenaAutoTick, ARENA_TURN_MS);
  addChatMessage(null, `🏛️ ¡Coliseo abierto! Escribe !pokemon [nombre] para hacer cola. ¡Disponible toda la Pokédex Nacional (${ARENA_POKEMON_DB.length} Pokémon)!`, 'system');
  scheduleArenaAfkIdleCheck();
}

// Arranca (si no hay ya uno en marcha) el temporizador de ARENA_AFK_IDLE_MS
// que da por terminada la partida de Arena en Modo AFK global si no hay
// ningún combate activo al cabo de ese tiempo. No hace nada si el Modo AFK
// no está activo o si ya hay un combate en marcha.
function scheduleArenaAfkIdleCheck() {
  const ms = state.modeState;
  if (!ms || !state.afkMode || ms.currentBattle || ms.afkIdleTimeout) return;
  ms.afkIdleTimeout = setTimeout(() => {
    const cur = state.modeState;
    if (!cur) return; // el modo pudo cerrarse mientras tanto
    cur.afkIdleTimeout = null;
    // Se comprueba de nuevo justo antes de actuar: el Modo AFK pudo
    // desactivarse, o un combate pudo empezar, durante la espera.
    if (!state.afkMode || cur.currentBattle) return;
    addChatMessage(null, '🤖 Modo AFK: 15s sin combates en el Coliseo, ¡se da por terminada la partida de Arena Pokémon!', 'system');
    document.dispatchEvent(new CustomEvent('pk-afk-match-ended', { detail: { mode: 'arena' } }));
  }, ARENA_AFK_IDLE_MS);
}

// Cancela el temporizador de scheduleArenaAfkIdleCheck: se llama en cuanto
// arranca un combate nuevo (ms.currentBattle deja de ser null).
function clearArenaAfkIdleCheck() {
  const ms = state.modeState;
  if (ms && ms.afkIdleTimeout) { clearTimeout(ms.afkIdleTimeout); ms.afkIdleTimeout = null; }
}

function renderArena() {
  const content = $('game-content');
  content.innerHTML = `
    <div class="arena-wrap">
      <div class="arena-banner">
        <span class="arena-banner-title pixel">🏛️ Coliseo Pokémon</span>
        <span class="arena-banner-live"><span class="live-dot"></span>En vivo</span>
      </div>
      <div class="coliseum-scene game-scene" id="battle-scene">
        <button class="scene-fullscreen-btn" title="Pantalla completa" aria-label="Pantalla completa">⛶</button>
        <div class="arena-queue-track" id="arena-queue-track"></div>
        <div class="arena-toggles-wrap">
          <button class="auto-advance-toggle" id="auto-advance-toggle" title="Alternar avance automático de la cola">🤖 Auto: OFF</button>
          <button class="auto-advance-toggle" id="allow-rejoin-toggle" title="Permitir que los derrotados vuelvan a hacer cola">🔁 Reingreso: OFF</button>
        </div>
        <div class="queue-advance-wrap" id="queue-advance-wrap"></div>
        <div class="fighter left" id="fighter-left" style="display:none;">
          <div class="fighter-info">
            <div class="fighter-user" id="fl-user">@user</div>
            <div class="hp-bar"><div class="hp-bar-fill" id="fl-hp-bar" style="width:100%"></div></div>
            <div class="fighter-hp" id="fl-hp">HP</div>
          </div>
          <div class="pmd-slot" id="fl-sprite"></div>
        </div>
        <div class="fighter right" id="fighter-right" style="display:none;">
          <div class="fighter-info">
            <div class="fighter-user" id="fr-user">@user</div>
            <div class="hp-bar"><div class="hp-bar-fill" id="fr-hp-bar" style="width:100%"></div></div>
            <div class="fighter-hp" id="fr-hp">HP</div>
          </div>
          <div class="pmd-slot" id="fr-sprite"></div>
        </div>
        <div class="arena-status-sign" id="battle-status">
          <div class="zor-sign-board">
            <div class="zor-sign-title pixel">Participa escribiendo en el chat el comando:</div>
            <div class="zor-sign-cmds">
              <span>!pokemon pikachu</span><span>!pokemon greninja</span>
            </div>
            <div class="arena-status-note">puedes elegir cualquier pokemon</div>
          </div>
        </div>
        <div class="arena-ability-sign" id="arena-ability-sign">
          <div class="zor-sign-board">
            <div class="zor-sign-title pixel">Cambia el tipo de tu ataque con:</div>
            <div class="zor-sign-cmds">
              <span>!habilidad1</span><span>!habilidad2</span>
            </div>
            <div class="arena-status-note">solo si tu pokemon tiene dos tipos</div>
          </div>
        </div>
      </div>
      <div class="arena-stats-row">
        <div class="battle-log" id="battle-log">
          <div class="battle-log-title">📜 Registro de Combate</div>
          <p style="color:var(--muted);font-style:italic;">Esperando el primer combate...</p>
        </div>
        <div class="ranking-panel" id="arena-ranking"></div>
      </div>
    </div>
  `;
  renderRanking($('arena-ranking'));
  renderAutoAdvanceToggle();
  $('auto-advance-toggle').onclick = toggleAutoAdvance;
  renderAllowRejoinToggle();
  $('allow-rejoin-toggle').onclick = toggleAllowRejoin;
  renderArenaQueue();
}

// Alterna el modo de avance de la cola entre manual (por defecto, el
// streamer pulsa el botón) y automático (la cola avanza sola en cuanto
// el coliseo queda libre, sin intervención).
function toggleAutoAdvance() {
  const ms = state.modeState;
  if (!ms) return;
  ms.autoAdvance = !ms.autoAdvance;
  renderAutoAdvanceToggle();
  addChatMessage(null, ms.autoAdvance
    ? '🤖 Avance automático de la cola ACTIVADO'
    : '✋ Avance automático de la cola DESACTIVADO (manual)', 'system');
  updateAdvanceQueueUI();
}

function renderAutoAdvanceToggle() {
  const ms = state.modeState;
  const btn = $('auto-advance-toggle');
  if (!btn || !ms) return;
  btn.textContent = ms.autoAdvance ? '🤖 Auto: ON' : '🤖 Auto: OFF';
  btn.classList.toggle('is-on', !!ms.autoAdvance);
}

// Alterna si un usuario que ya perdió un combate en este Coliseo puede
// volver a hacer cola escribiendo !pokemon de nuevo. Por defecto está
// desactivado: los derrotados quedan fuera hasta que el streamer lo permita.
function toggleAllowRejoin() {
  const ms = state.modeState;
  if (!ms) return;
  ms.allowRejoin = !ms.allowRejoin;
  renderAllowRejoinToggle();
  addChatMessage(null, ms.allowRejoin
    ? '🔁 Reingreso de derrotados PERMITIDO: quien pierda podrá volver a hacer cola'
    : '🚫 Reingreso de derrotados BLOQUEADO: quien pierda ya no podrá volver a hacer cola', 'system');
}

function renderAllowRejoinToggle() {
  const ms = state.modeState;
  const btn = $('allow-rejoin-toggle');
  if (!btn || !ms) return;
  btn.textContent = ms.allowRejoin ? '🔁 Reingreso: ON' : '🔁 Reingreso: OFF';
  btn.classList.toggle('is-on', !!ms.allowRejoin);
}

// ---- Geometría de la cola de espera ----
// El puesto #1 (índice 0) es el más cercano al borde derecho de la escena:
// es el siguiente en avanzar hacia el coliseo. Los demás puestos se colocan
// a su izquierda, uno tras otro, según su posición en la cola.
// Los sprites de la cola ocupan 168px (el doble de los 84px de antes, a
// petición del streamer para que se vean más grandes; ver
// .queue-walker .pmd-slot.pmd-mini en styles.css).
// QUEUE_SLOT_GAP: separación horizontal entre puestos consecutivos. A
// petición del streamer se ha reducido a la mitad (de 168 a 84) para que la
// cola se vea más compacta; como el sprite mide 168px, los contenedores
// contiguos se solapan ligeramente, pero al ir centrado el dibujo del
// Pokémon dentro de un contenedor mucho más ancho que su silueta real, no
// se nota un solape del propio sprite.
const QUEUE_SLOT_GAP = 84;     // separación horizontal entre puestos de la cola
// QUEUE_RIGHT_MARGIN: distancia desde el borde derecho de la escena hasta
// el borde derecho (no el izquierdo) del puesto #1. Como el posicionamiento
// usa `left` (borde IZQUIERDO del contenedor de 168px), hay que restar el
// ancho completo del sprite para que el puesto #1 quede entero dentro de la
// pantalla en vez de cortado por el borde: left = anchoEscena - margen.
// Con margen = 174 el borde derecho del sprite queda a 6px del borde de la
// escena (174 - 168 = 6), igual que quedaba con el tamaño de sprite
// anterior (84px) y el margen de entonces (90px: 90 - 84 = 6).
const QUEUE_RIGHT_MARGIN = 174; // distancia del borde derecho del puesto #1 al borde derecho de la escena
const QUEUE_ENTRY_LEFT = -84;  // punto de partida: fuera de pantalla, esquina superior izquierda
const QUEUE_ENTRY_TOP = -84;
const QUEUE_EXIT_MARGIN = 160; // cuánto se aleja el puesto #1 al salir por la derecha

// ---- Altura a la que camina la cola ----
// La cola camina centrada en la franja horizontal marrón que hay en la
// parte superior de assets/arena/coliseum_bg.jpg. Esa franja ocupa los
// primeros 73px de los 768px de alto de la imagen original (comprobado
// muestreando la imagen: es un color plano hasta y=73, donde empieza la
// textura del graderío), así que su centro vertical está en 36.5/768 ≈
// 4.75% de la altura de la imagen. Como el fondo se pinta con
// background-size:cover y esta imagen es más ancha que cualquier tamaño de
// escena razonable (1376x768, ratio ~1.79:1), el recorte de "cover" siempre
// ocurre en horizontal (centrado) y la imagen ocupa el alto completo de la
// escena sin recortar verticalmente: por eso ese 4.75% de la imagen
// corresponde exactamente al 4.75% de la altura de la escena, sea cual sea
// su tamaño. El valor anterior (2.6%) estaba mal calibrado: colocaba el
// centro de la cola demasiado cerca del borde superior, así que gran parte
// del sprite (sobre todo con el tamaño anterior de 140px) quedaba recortada
// por encima de la propia escena en vez de dentro de la franja.
//
// QUEUE_SPRITE_TOP_OFFSET: distancia (en px) desde ese centro de la franja
// hasta el "top" del contenedor .queue-walker. Con el tamaño de sprite
// anterior (84px) esto era simplemente la mitad de su altura (42px), es
// decir, el sprite quedaba centrado en la franja. Ahora que el sprite mide
// 168px pero el espacio extra debe crecer hacia ARRIBA -sin que la parte
// inferior del sprite (ni la etiqueta de nombre, que va debajo) baje de la
// posición que ya tenían-, el offset ya no es la mitad de la altura nueva:
// se mantiene el mismo punto inferior de antes (centro + 42) y se resta la
// altura nueva completa (168) para obtener el nuevo "top": centro + 42 -
// 168 = centro - 126.
const QUEUE_SPRITE_TOP_OFFSET = 126;
const DEFAULT_QUEUE_HEIGHT_FRAC = 0.0475; // 4.75%, centro real de la franja marrón (36.5/768)

// ---- Altura de la cola ya fijada manualmente (si la hay) ----
// En su día el streamer pudo fijar a mano la altura exacta de la cola en
// pantalla completa (que es como lo ve la audiencia en el stream); ese
// valor se guardó como fracción (0..1) de la altura de la escena en ese
// momento, no en píxeles absolutos, para que siguiera siendo válido aunque
// cambiara el tamaño de la ventana entre sesiones. Esa altura fijada se
// mantiene y se sigue usando aquí; ya no hay forma de volver a ajustarla
// desde la interfaz.
const ARENA_QUEUE_HEIGHT_STORAGE_KEY = 'pokekukoro_arena_queue_height_frac';

function loadQueueHeightOverride() {
  try {
    const raw = localStorage.getItem(ARENA_QUEUE_HEIGHT_STORAGE_KEY);
    const frac = raw === null ? NaN : parseFloat(raw);
    return Number.isFinite(frac) ? Math.min(1, Math.max(0, frac)) : null;
  } catch (err) {
    return null; // localStorage puede no estar disponible (p.ej. en algunos navegadores embebidos)
  }
}

function queueSceneWidth() {
  const scene = $('battle-scene');
  return scene ? scene.clientWidth : 900;
}

function queueSceneHeight() {
  const scene = $('battle-scene');
  return scene ? scene.clientHeight : 380;
}

// Devuelve el "top" (en px, relativo a la escena) al que hay que colocar el
// sprite de la cola para que quede centrado verticalmente en la franja
// marrón, sea cual sea el tamaño actual de la escena. La fracción usada es
// la calibrada a mano por el streamer (queueHeightOverrideFrac) o, si no
// hay ninguna guardada, el valor de fábrica DEFAULT_QUEUE_HEIGHT_FRAC.
function queueBandTop() {
  const ms = state.modeState;
  const frac = (ms && ms.queueHeightOverrideFrac != null) ? ms.queueHeightOverrideFrac : DEFAULT_QUEUE_HEIGHT_FRAC;
  return queueSceneHeight() * frac - QUEUE_SPRITE_TOP_OFFSET;
}

function queueSlotPosition(index) {
  return { left: queueSceneWidth() - QUEUE_RIGHT_MARGIN - index * QUEUE_SLOT_GAP, top: queueBandTop() };
}

// La cola de espera solo tiene sentido mostrarla en pantalla completa (que
// es como la ve la audiencia en el stream, ya con la altura fijada). Fuera
// de pantalla completa la franja marrón del
// coliseo no está en la misma posición relativa, así que los Pokémon de la
// cola se ven "flotando" fuera de sitio; se oculta la cola entera en ese
// caso en vez de mostrarla mal colocada.
function isArenaSceneFullscreen() {
  const scene = $('battle-scene');
  return !!scene && (currentFullscreenElement() === scene || scene.classList.contains('fs-fallback'));
}

// Sincroniza la cola de datos (ms.queue) con sus elementos PMD animados en
// pantalla: crea los que faltan (entrando caminando desde la esquina superior
// izquierda de la escena) y reposiciona los existentes hacia su nuevo puesto
// (esto es lo que produce el efecto de "avance de la cola"). También
// muestra u oculta la cola entera según si la escena está en pantalla
// completa (ver isArenaSceneFullscreen).
function renderArenaQueue() {
  const track = $('arena-queue-track');
  const ms = state.modeState;
  if (!track || !ms) return;
  track.style.display = isArenaSceneFullscreen() ? '' : 'none';
  if (!ms.queueDom) ms.queueDom = {};
  if (ms.queueIdSeq == null) ms.queueIdSeq = 0;

  const seenIds = new Set();
  ms.queue.forEach((entry, index) => {
    if (entry.qid == null) entry.qid = ++ms.queueIdSeq;
    seenIds.add(entry.qid);
    const { left, top } = queueSlotPosition(index);
    let dom = ms.queueDom[entry.qid];
    if (!dom) {
      // Pokémon nuevo en la cola: aparece en la esquina superior izquierda
      // de la escena y camina (animación PMD "Walk") hasta su puesto.
      const el = document.createElement('div');
      el.className = 'queue-walker';
      el.style.left = QUEUE_ENTRY_LEFT + 'px';
      el.style.top = QUEUE_ENTRY_TOP + 'px';
      el.title = 'Clic para expulsar de la cola';
      const spriteId = 'qw-sprite-' + entry.qid;
      el.innerHTML = `
        <div class="pmd-slot pmd-mini" id="${spriteId}"></div>
        <div class="queue-walker-tag">
          <span class="queue-pos">#${index + 1}</span>
          <span class="queue-user">@${entry.user}</span>
        </div>
      `;
      // El streamer puede hacer clic en cualquier Pokémon de la cola para
      // que aparezca un pequeño botón "Expulsar" encima de su cabeza.
      const qid = entry.qid;
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        toggleExpelPopover(qid, el);
      });
      track.appendChild(el);
      const sprite = new PMDSprite($(spriteId), getPokemonSprite(entry.pokemon.sprite));
      sprite.setDex(entry.pokemon.sprite, entry.pokemon.isShiny);
      // Velocidad reducida (x2.4): en la cola caminan tranquilos, no al
      // ritmo con el que se mueven dentro del combate.
      sprite.play('Walk', PMD_DIR.downRight, true, null, 2.4);
      dom = { el, sprite };
      ms.queueDom[entry.qid] = dom;
      // Fuerza el estilo inicial antes de animar la transición a su puesto
      void el.offsetWidth;
      requestAnimationFrame(() => {
        el.style.left = left + 'px';
        el.style.top = top + 'px';
      });
    } else {
      // Ya estaba en la cola: avanza (con transición) hasta su nuevo puesto
      dom.el.style.left = left + 'px';
      dom.el.style.top = top + 'px';
    }
    const posEl = dom.el.querySelector('.queue-pos');
    if (posEl) posEl.textContent = '#' + (index + 1);
  });

  // Limpia caminantes que ya no están en la cola de datos (por seguridad;
  // la salida del puesto #1 al avanzar se gestiona aparte, en advanceQueueManually).
  Object.keys(ms.queueDom).forEach(qidStr => {
    const qid = Number(qidStr);
    if (!seenIds.has(qid)) {
      ms.queueDom[qid].sprite.destroy();
      ms.queueDom[qid].el.remove();
      delete ms.queueDom[qid];
    }
  });

  updateAdvanceQueueUI();
}

// Abre (o cierra, si ya estaba abierto para el mismo puesto) el popover con
// el botón "Expulsar" sobre la cabeza del Pokémon de la cola en el que el
// streamer ha hecho clic. Solo puede haber un popover abierto a la vez.
function toggleExpelPopover(qid, el) {
  const ms = state.modeState;
  if (!ms) return;
  if (ms.expelPopoverQid === qid) {
    closeExpelPopover();
    return;
  }
  closeExpelPopover();
  const pop = document.createElement('div');
  pop.className = 'queue-expel-popover';
  pop.innerHTML = `<button type="button" class="queue-expel-btn">Expulsar</button>`;
  pop.querySelector('.queue-expel-btn').onclick = (ev) => {
    ev.stopPropagation();
    expelFromQueue(qid);
  };
  el.appendChild(pop);
  ms.expelPopoverQid = qid;
  ms.expelPopoverEl = pop;
}

export function closeExpelPopover() {
  const ms = state.modeState;
  if (!ms) return;
  if (ms.expelPopoverEl) ms.expelPopoverEl.remove();
  ms.expelPopoverEl = null;
  ms.expelPopoverQid = null;
}

// Saca a un usuario de la cola de espera (acción del streamer, no del
// propio usuario): se retira de los datos de la cola, se destruye su
// caminante PMD y el resto de la cola se recoloca un puesto hacia delante.
function expelFromQueue(qid) {
  const ms = state.modeState;
  if (!ms) return;
  closeExpelPopover();
  const idx = ms.queue.findIndex(q => q.qid === qid);
  if (idx === -1) return;
  const [removed] = ms.queue.splice(idx, 1);
  const dom = ms.queueDom[qid];
  if (dom) {
    dom.sprite.destroy();
    dom.el.remove();
    delete ms.queueDom[qid];
  }
  addChatMessage(null, `🚫 @${removed.user} ha sido expulsado de la cola por el streamer`, 'system');
  renderArenaQueue();
}

// Muestra u oculta el botón que permite avanzar la cola manualmente. Solo
// tiene sentido cuando no hay combate en curso y hay algún Pokémon esperando.
function updateAdvanceQueueUI() {
  const ms = state.modeState;
  const wrap = $('queue-advance-wrap');
  if (!wrap || !ms) return;
  // Mientras el puesto #1 está en tránsito (queueAdvancing) no se puede
  // avanzar de nuevo, aunque currentBattle ya esté a null en ese instante:
  // si no, el modo automático dispararía un segundo avance antes de que el
  // primer Pokémon llegara siquiera al coliseo.
  const canAdvance = !ms.currentBattle && !ms.queueAdvancing && ms.queue.length > 0;
  if (!canAdvance) {
    if (ms.autoAdvanceTimeout) { clearTimeout(ms.autoAdvanceTimeout); ms.autoAdvanceTimeout = null; }
    wrap.innerHTML = '';
    return;
  }
  if (ms.autoAdvance) {
    // Modo automático: no se muestra botón, la cola avanza sola.
    wrap.innerHTML = `<div class="queue-auto-note">🤖 Avance automático en curso...</div>`;
    if (!ms.autoAdvanceTimeout) {
      ms.autoAdvanceTimeout = setTimeout(() => {
        const cur = state.modeState;
        if (cur) cur.autoAdvanceTimeout = null;
        if (cur && cur.autoAdvance && !cur.currentBattle && cur.queue.length) advanceQueueManually();
      }, 900);
    }
    return;
  }
  const label = ms.champion ? '▶ Avanzar cola (entra retador)' : '▶ Avanzar cola (entra campeón)';
  wrap.innerHTML = `<button class="advance-queue-btn" id="advance-queue-btn">${label}</button>`;
  $('advance-queue-btn').onclick = advanceQueueManually;
}

// Avanza la cola una posición de forma MANUAL (no ocurre automáticamente).
// El Pokémon del puesto #1 sale caminando por el borde derecho de la
// pantalla y, un segundo después, reaparece a la altura del coliseo
// (como campeón, si estaba vacío, o como retador) con su sprite a tamaño
// original. El resto de la cola avanza una posición con su animación.
function advanceQueueManually() {
  const ms = state.modeState;
  if (!ms || ms.currentBattle || ms.queueAdvancing || !ms.queue.length) return;

  if (ms.autoAdvanceTimeout) { clearTimeout(ms.autoAdvanceTimeout); ms.autoAdvanceTimeout = null; }

  // Se marca la cola como "en tránsito" hasta que el Pokémon que sale
  // termine de llegar al coliseo (enterColiseumFromQueue). Así, aunque
  // currentBattle sea null durante ese tránsito, no se dispara un segundo
  // avance automático por encima del primero.
  ms.queueAdvancing = true;

  const btn = $('advance-queue-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Avanzando...'; }

  const leaving = ms.queue.shift();
  const leavingDom = ms.queueDom[leaving.qid];
  delete ms.queueDom[leaving.qid]; // gestionamos su salida aparte

  renderArenaQueue(); // el resto de la cola avanza una posición hacia la derecha
  const wrap = $('queue-advance-wrap');
  if (wrap) wrap.innerHTML = '';

  if (leavingDom) {
    leavingDom.el.style.left = (queueSceneWidth() + QUEUE_EXIT_MARGIN) + 'px';
    setTimeout(() => {
      leavingDom.sprite.destroy();
      leavingDom.el.remove();
    }, 650);
  }

  setTimeout(() => {
    if (!state.modeState) return; // el modo pudo cerrarse mientras tanto
    enterColiseumFromQueue(leaving);
  }, 1000);
}

// El Pokémon que salió de la cola reaparece a la altura correcta del
// coliseo, con el sprite a tamaño original (los sprites de la cola están
// al 50%). Si el coliseo estaba vacío, sube como campeón; si no, reta al
// campeón actual y comienza el combate.
function enterColiseumFromQueue(leaving) {
  const ms = state.modeState;
  if (!ms) return;
  // El tránsito termina aquí: el Pokémon ya ha llegado al coliseo (como
  // campeón o como retador), así que ya se puede evaluar un nuevo avance.
  ms.queueAdvancing = false;
  if (!ms.champion) {
    ms.champion = makeArenaFighter(leaving.user, leaving.pokemon, leaving.attackTypeIndex || 0);
    addChatMessage(null, `👑 ${leaving.user} (${leaving.pokemon.name}) sube al coliseo como campeón. ¡Avanza la cola para retarlo!`, 'system');
    showChampionWaiting();
    scheduleArenaAfkIdleCheck();
  } else {
    const challenger = makeArenaFighter(leaving.user, leaving.pokemon, leaving.attackTypeIndex || 0);
    setupBattle(ms.champion, challenger);
  }
  updateAdvanceQueueUI();
}

export function handleArenaCmd(user, cmd, parts, text) {
  const ms = state.modeState;
  if (cmd === '!pokemon') {
    const name = parts.slice(1).join(' ').toLowerCase().trim();
    if (!name) return;
    const foundPokemon = ARENA_POKEMON_DB.find(p => p.name.toLowerCase() === name);
    if (!foundPokemon) {
      addChatMessage(null, `${user}: "${parts.slice(1).join(' ')}" no es un Pokémon válido. Escribe el nombre exacto de cualquier Pokémon de la Pokédex Nacional (ej: !pokemon Pikachu, !pokemon Greninja, !pokemon Charizard...)`, 'system');
      return;
    }
    // Formas especiales todavía no desbloqueadas (Wishiwashi Banco,
    // Aegislash Espada...; ver bossSpriteLocks.js): no se dejan elegir
    // hasta superar la fase del Boss que las desbloquea.
    const lockMsg = bossSpriteLockBlockMessage(foundPokemon.name, user);
    if (lockMsg) {
      addChatMessage(null, lockMsg, 'system');
      return;
    }
    // Un puñado de Pokémon (ver README_PMD_LOCAL.md) todavía no tienen su
    // sprite PMD completo en el repositorio comunitario de PMDCollab: no se
    // dejan elegir, para no depender de la red ni verse a medias en pantalla.
    if (!pmdHasLocalSprite(foundPokemon.sprite)) {
      addChatMessage(null, `Lo sentimos, el Pokémon ${foundPokemon.name} aún no tiene sprite en el juego, por favor elige otro.`, 'system');
      return;
    }
    const alreadyQueued = ms.queue.some(q => q.user === user);
    const isChampion = ms.champion && ms.champion.user === user;
    const isFighting = ms.currentBattle && (ms.currentBattle.left.user === user || ms.currentBattle.right.user === user);
    if (alreadyQueued || isChampion || isFighting) {
      addChatMessage(null, `${user}: ya estás en el coliseo o en la cola`, 'system');
      return;
    }
    // Un usuario que ya perdió un combate en este Coliseo no puede volver a
    // hacer cola, salvo que el streamer haya activado el reingreso.
    if (!ms.allowRejoin && ms.defeatedUsers && ms.defeatedUsers.has(user)) {
      addChatMessage(null, `${user}: ya has sido derrotado en este Coliseo, no puedes volver a entrar (el streamer puede permitirlo)`, 'system');
      return;
    }
    // La cola tiene un máximo de jugadores esperando a la vez.
    if (ms.queue.length >= ARENA_MAX_QUEUE) {
      addChatMessage(null, `${user}: la cola del Coliseo está llena (máximo ${ARENA_MAX_QUEUE})`, 'system');
      return;
    }
    // El nuevo Pokémon se coloca al final de la cola de espera y camina
    // desde la esquina superior izquierda de la pantalla hasta su puesto.
    // rollShinyPokemon() ya devuelve una copia nueva (0.5% de probabilidad
    // de isShiny:true, ver js/pokemonShiny.js), nunca la entrada original
    // compartida de ARENA_POKEMON_DB.
    const pokemon = rollShinyPokemon(foundPokemon);
    ms.queue.push({ user, pokemon });
    pmdPreload(pokemon.sprite);
    addChatMessage(null, `🚪 ${user} hace cola con ${pokemon.name}! (posición ${ms.queue.length}/${ARENA_MAX_QUEUE})`, 'correct');
    playVeJoin();
    // El avance de la cola (quién entra al coliseo) NO es automático:
    // renderArenaQueue ya se encarga de mostrar el botón para avanzarla.
    renderArenaQueue();
  } else if (cmd === '!atacar' || cmd === '!habilidad') {
    addChatMessage(null, `${user}: ¡los combates del Coliseo son automáticos, no hace falta escribir comandos de ataque!`, 'system');
  } else if (cmd === '!habilidad1' || cmd === '!habilidad2') {
    handleArenaAbility(user, cmd);
  } else if (cmd === '!puntos') {
    addChatMessage(null, `${user} tienes ${state.scores[user] || 0} puntos`, 'system');
  }
}

// Gestiona !habilidad1 / !habilidad2: cambia el tipo del ataque del
// Pokémon de "user" (ver attackTypeIndex, leído en performArenaAttack) al
// tipo primario (!habilidad1, índice 0 de pokemon.types) o secundario
// (!habilidad2, índice 1). Solo tiene efecto si su Pokémon tiene dos tipos.
// A diferencia del modo Jefe Cooperativo (ver handleBossAbility), aquí no
// hay una fase de "espera en el puesto" separada de la lucha en sí -en
// cuanto el jugador entra al Coliseo ya está combatiendo de forma
// continua-, así que el comando funciona en cualquier momento: haciendo
// cola, como campeón a la espera de retador, o ya en pleno combate (como
// campeón o como retador).
function handleArenaAbility(user, cmd) {
  const ms = state.modeState;
  if (!ms) return;
  const index = cmd === '!habilidad1' ? 0 : 1;
  const label = index === 0 ? 'primario' : 'secundario';

  // Localiza el objeto donde vive el estado actual del Pokémon del
  // usuario, sea cual sea la fase en la que se encuentre: si ya está
  // combatiendo, currentBattle.left/right es la copia "viva" que lee
  // performArenaAttack (independiente de ms.champion, ver setupBattle);
  // si no, puede estar esperando como campeón sin retador o todavía
  // haciendo cola.
  let target = null;
  if (ms.currentBattle && ms.currentBattle.left.user === user) {
    target = ms.currentBattle.left;
  } else if (ms.currentBattle && ms.currentBattle.right.user === user) {
    target = ms.currentBattle.right;
  } else if (ms.champion && ms.champion.user === user) {
    target = ms.champion;
  } else {
    target = ms.queue.find(q => q.user === user) || null;
  }

  if (!target) {
    addChatMessage(null, `${user}: usa !pokemon [nombre] primero`, 'system');
    return;
  }

  const types = (target.pokemon.types || []).filter(Boolean);
  if (types.length < 2) {
    addChatMessage(null, `${user}: ${target.pokemon.name} solo tiene un tipo, no puede cambiar el tipo de su ataque con ${cmd}.`, 'system');
    return;
  }
  if ((target.attackTypeIndex || 0) === index) {
    addChatMessage(null, `${user}: ${target.pokemon.name} ya está usando su tipo ${label} (${types[index]}).`, 'system');
    return;
  }
  target.attackTypeIndex = index;
  addChatMessage(null, `🔄 ${user}: ${target.pokemon.name} cambia el tipo de su próximo ataque a ${types[index]} (tipo ${label}).`, 'correct');
}

// Late que hace avanzar los combates del Coliseo en solitario: cada
// ARENA_TURN_MS le toca atacar a uno de los dos combatientes, sin que el
// chat tenga que escribir ningún comando.
function arenaAutoTick() {
  const ms = state.modeState;
  if (!ms || !ms.currentBattle) return;
  const b = ms.currentBattle;
  const side = b.turn === 'right' ? 'right' : 'left';
  b.turn = side === 'left' ? 'right' : 'left';
  performArenaAttack(side);
}

// Resuelve un ataque automático de `side` contra su rival: puede fallar por
// esquiva, ser un golpe crítico, o un golpe normal — igual que en el modo
// Battle Royale.
//
// La animación de "Attack" se lanza de inmediato, pero tarda un poco en
// volverse realmente ofensiva. Por eso el impacto (daño aplicado, bajada de
// vida, textos flotantes y animación de "Hurt" del rival) se retrasa
// ARENA_HIT_DELAY_MS: así el golpe se ve y se siente en el mismo instante en
// que el Pokémon atacante conecta, en vez de antes.
function performArenaAttack(side) {
  const ms = state.modeState;
  const b = ms.currentBattle;
  if (!b) return;
  const enemySide = side === 'left' ? 'right' : 'left';
  const fighter = b[side];
  const enemy = b[enemySide];
  if (!fighter || !enemy || fighter.hp <= 0 || enemy.hp <= 0) return;

  // Tras 10 ataques seguidos (de cualquiera de los dos combatientes) sin que
  // ninguno cause ni reciba daño (esquivas o golpes sin efecto), ambos entran
  // en "Forcejeo": un ataque básico que ignora habilidades y efectividad de
  // tipo, pero que sigue pudiendo fallar (esquiva) o ser crítico.
  const struggling = !!b.struggling;
  const isAbility = !struggling && fighter.abilityCd === 0;
  const moveType = (fighter.attackTypeIndex === 1 && fighter.pokemon.types[1]) ? fighter.pokemon.types[1] : fighter.pokemon.types[0]; // tipo elegido con !habilidad1/!habilidad2 (por defecto, el primario)
  const dodge = Math.random() < ARENA_BASE_STATS.dodgeChance;

  const attackerSpriteId = side === 'left' ? 'fl-sprite' : 'fr-sprite';
  const enemySpriteId = enemySide === 'left' ? 'fl-sprite' : 'fr-sprite';
  const sprites = ms.arenaSprites;
  const attackerSprite = sprites ? sprites[side] : null;
  const enemySprite = sprites ? sprites[enemySide] : null;
  const backToWalk = (spr, spriteSide) => {
    if (!state.modeState || !state.modeState.currentBattle) return; // combate ya terminó
    spr.play('Walk', arenaDirectionFor(spriteSide), true, null, ARENA_ANIM_SPEED);
  };

  // Quien ataca reproduce su animación "Attack" de inmediato, sin esperar
  // al resultado del golpe.
  if (attackerSprite) {
    attackerSprite.play('Attack', arenaDirectionFor(side), false, () => backToWalk(attackerSprite, side), ARENA_ANIM_SPEED);
  }

  if (isAbility) fighter.abilityCd = ARENA_BASE_STATS.abilityCooldown;

  if (dodge) {
    if (!isAbility && fighter.abilityCd > 0) fighter.abilityCd--;
    // Una esquiva no causa daño: cuenta para el estancamiento del combate.
    b.noDamageStreak = (b.noDamageStreak || 0) + 1;
    const enteringStruggle = b.noDamageStreak >= 10 && !b.struggling;
    if (enteringStruggle) b.struggling = true;
    setTimeout(() => {
      if (!state.modeState || state.modeState.currentBattle !== b) return; // el combate pudo terminar mientras tanto
      logBattle(`💨 ¡${enemy.pokemon.name} de @${enemy.user} esquiva ${struggling ? 'el Forcejeo' : 'el ataque'} de ${fighter.pokemon.name}!`, 'dodge');
      showArenaFloatText(enemySpriteId, '¡Esquiva!', 'dodge-number');
      if (enteringStruggle) logBattle('⚔️ ¡El combate se estanca! Ambos Pokémon pasan a usar Forcejeo.', 'system');
    }, ARENA_HIT_DELAY_MS);
    return;
  }

  const baseAtk = ARENA_BASE_STATS.atk * (isAbility ? ARENA_BASE_STATS.abilityAtkMult : 1);
  let dmg = Math.floor(baseAtk * (0.85 + Math.random() * 0.3));
  // El Forcejeo no tiene tipo, así que ignora por completo la tabla de tipos.
  const mult = struggling ? 1 : arenaTypeMultiplier(moveType, enemy.pokemon.types);
  dmg = Math.floor(dmg * mult);
  const crit = Math.random() < ARENA_BASE_STATS.critChance;
  let finalDmg = crit ? Math.floor(dmg * 1.5) : dmg;
  if (mult > 0) finalDmg = Math.max(finalDmg, 1);

  if (!isAbility && fighter.abilityCd > 0) fighter.abilityCd--;

  // Cuenta los ataques consecutivos sin daño (ni provocado ni recibido) para
  // activar el Forcejeo cuando el combate se estanca.
  let enteringStruggle = false;
  if (finalDmg > 0) {
    b.noDamageStreak = 0;
  } else {
    b.noDamageStreak = (b.noDamageStreak || 0) + 1;
    if (b.noDamageStreak >= 10 && !b.struggling) {
      b.struggling = true;
      enteringStruggle = true;
    }
  }

  let effMsg = '';
  if (!struggling) {
    if (mult === 0) effMsg = ' ¡No afecta al rival! (Inmune)';
    else if (mult >= 4) effMsg = ' ¡Es hipereficaz!';
    else if (mult >= 2) effMsg = ' ¡Es súper efectivo!';
    else if (mult <= 0.5) effMsg = ' No es muy eficaz...';
  }
  const moveName = struggling ? 'Forcejeo' : (isAbility ? (fighter.pokemon.moves[3] || 'Habilidad') : fighter.pokemon.moves[Math.floor(Math.random() * 3)]);
  const moveLabel = struggling ? moveName : `${moveName} (${moveType})`;

  // Mensaje de efectividad/inmunidad sobre la cabeza del rival: se muestra
  // primero y, con un pequeño desfase, el número de daño (o "¡CRÍTICO!"),
  // para que ambos textos se puedan leer sin solaparse por completo. El
  // texto flotante es más corto que el del registro de combate (effMsg).
  let effFloatText = '';
  let effClass = '';
  if (mult === 0) { effFloatText = 'Inmune'; effClass = 'immune-number'; }
  else if (mult >= 4) { effFloatText = 'Hipereficaz'; effClass = 'hyper-number'; }
  else if (mult >= 2) { effFloatText = 'Superefectivo'; effClass = 'super-number'; }
  else if (mult <= 0.5) { effFloatText = 'No muy eficaz'; effClass = 'weak-number'; }
  const dmgText = (crit ? '¡CRÍTICO! ' : '') + '-' + finalDmg;

  setTimeout(() => {
    if (!state.modeState || state.modeState.currentBattle !== b) return; // el combate pudo terminar mientras tanto

    // Es aquí, en el momento del impacto, cuando se aplican el daño y la
    // bajada de vida — no en cuanto se decide el ataque.
    enemy.hp = Math.max(0, enemy.hp - finalDmg);
    logBattle(`${fighter.pokemon.name} usa ${moveLabel}!${crit ? ' ¡GOLPE CRÍTICO!' : ''} -${finalDmg} PS${effMsg}`, crit ? 'crit' : 'dmg');

    // Si el combate está en Forcejeo, se avisa sobre la cabeza de quien ataca,
    // igual que ocurre con el resto de mensajes de combate.
    if (struggling) {
      showArenaFloatText(attackerSpriteId, '¡Forcejeo!', 'struggle-number');
    }
    if (effFloatText) {
      showArenaFloatText(enemySpriteId, effFloatText, effClass);
      setTimeout(() => showArenaFloatText(enemySpriteId, dmgText, crit ? 'crit-number' : ''), 450);
    } else {
      showArenaFloatText(enemySpriteId, dmgText, crit ? 'crit-number' : '');
    }
    if (enteringStruggle) logBattle('⚔️ ¡El combate se estanca! Ambos Pokémon pasan a usar Forcejeo.', 'system');

    updateArenaHP();

    // Animación PMD del rival: si el golpe hizo daño de verdad, reproduce Hurt
    // justo ahora, sincronizada con el resto de efectos del impacto.
    const fainted = enemy.hp <= 0;
    if (finalDmg > 0 && enemySprite) {
      if (fainted) {
        // El Pokémon derrotado reproduce su animación de Hurt y, a la vez,
        // se va desvaneciendo poco a poco hasta desaparecer del coliseo.
        enemySprite.play('Hurt', arenaDirectionFor(enemySide), false, null, ARENA_ANIM_SPEED);
        const enemyContainer = $(enemySpriteId);
        if (enemyContainer) enemyContainer.classList.add('pmd-fainting');
      } else {
        enemySprite.play('Hurt', arenaDirectionFor(enemySide), false, () => backToWalk(enemySprite, enemySide), ARENA_ANIM_SPEED);
      }
    }

    if (fainted) {
      // Se espera a que termine el desvanecimiento antes de resolver el
      // fin del combate (cambio de campeón, etc.).
      setTimeout(() => endBattle(fighter, enemy), ARENA_FAINT_FADE_MS);
    }
  }, ARENA_HIT_DELAY_MS);
}

// Muestra un texto flotante (daño, crítico o esquiva) sobre el sprite indicado.
function showArenaFloatText(spriteElId, text, extraClass) {
  const el = $(spriteElId);
  if (!el) return;
  const num = document.createElement('div');
  num.className = 'damage-number' + (extraClass ? ' ' + extraClass : '');
  num.style.left = '50%';
  num.style.top = '0px';
  num.textContent = text;
  el.appendChild(num);
  setTimeout(() => num.remove(), 1500);
}

// Monta el combate entre el campeón actual y un retador (ambos ya han
// salido de la cola). Se llama únicamente desde enterColiseumFromQueue,
// es decir, tras el avance MANUAL de la cola — nunca automáticamente.
// El campeón (ganador del combate anterior) se coloca siempre a la
// izquierda del coliseo.
function setupBattle(championFighter, challenger) {
  const ms = state.modeState;
  // Hay un combate a punto de empezar: se cancela cualquier cuenta atrás
  // pendiente del Modo AFK por inactividad (ver scheduleArenaAfkIdleCheck).
  clearArenaAfkIdleCheck();
  // Cancela el temporizador pendiente que, tras la victoria anterior,
  // iba a volver a mostrar "campeón esperando retador": si no se cancela,
  // ese aviso llega tarde (3s después) y oculta al retador que ya ha
  // entrado, borrando su sprite, su barra de vida y su nombre.
  if (ms.champWaitTimeout) { clearTimeout(ms.champWaitTimeout); ms.champWaitTimeout = null; }
  // Combate igualado: el campeón empieza cada combate con la vida al máximo
  championFighter.hp = championFighter.maxHp;
  championFighter.abilityCd = 0;
  ms.champion = championFighter;
  ms.currentBattle = {
    left: { ...championFighter },
    right: { ...challenger },
    turn: 'left', // el campeón golpea primero; luego se van alternando solos
    noDamageStreak: 0, // ataques consecutivos (de cualquiera de los dos) sin causar ni recibir daño
    struggling: false, // true cuando, tras 10 ataques sin daño, ambos pasan a usar Forcejeo
  };
  const b = ms.currentBattle;
  addChatMessage(null, `⚔️ ¡${b.left.user} (${b.left.pokemon.name}, campeón) vs ${b.right.user} (${b.right.pokemon.name}, retador)!`, 'system');
  logBattle(`¡COMBATE EN EL COLISEO! 👑 @${b.left.user} vs 🆚 @${b.right.user}`, '');
  $('fighter-left').style.display = 'flex';
  $('fighter-right').style.display = 'flex';
  // La corona del rey de la pista (el campeón) va justo antes de su nombre de usuario.
  $('fl-user').textContent = '👑 @' + b.left.user;
  $('fr-user').textContent = '@' + b.right.user;
  // Si el campeón conservaba su sprite del combate anterior, se destruye
  // antes de crear el nuevo (evita animaciones huérfanas corriendo en segundo plano).
  if (ms.arenaSprites) {
    if (ms.arenaSprites.left) ms.arenaSprites.left.destroy();
    if (ms.arenaSprites.right) ms.arenaSprites.right.destroy();
  }
  // Los sprites reaparecen aquí a tamaño original (.pmd-slot sin la clase
  // "pmd-mini" que usan los caminantes de la cola, que están al 50%).
  // uncapped: true — los combatientes se muestran a tamaño real, sin el
  // techo de 26px que sí se sigue aplicando a la cola (ver PMDSprite).
  const leftSprite = new PMDSprite($('fl-sprite'), getPokemonSprite(b.left.pokemon.sprite), { uncapped: true });
  const rightSprite = new PMDSprite($('fr-sprite'), getPokemonSprite(b.right.pokemon.sprite), { uncapped: true });
  leftSprite.setDex(b.left.pokemon.sprite, b.left.pokemon.isShiny);
  rightSprite.setDex(b.right.pokemon.sprite, b.right.pokemon.isShiny);
  ms.arenaSprites = { left: leftSprite, right: rightSprite };
  leftSprite.play('Walk', arenaDirectionFor('left'), true, null, ARENA_ANIM_SPEED);
  rightSprite.play('Walk', arenaDirectionFor('right'), true, null, ARENA_ANIM_SPEED);
  updateArenaHP();
  updateAdvanceQueueUI();
}

// El campeón está solo en el coliseo, esperando a que alguien haga cola
function showChampionWaiting() {
  const ms = state.modeState;
  const champ = ms.champion;
  $('fighter-left').style.display = 'flex';
  $('fighter-right').style.display = 'none';
  // La corona del rey de la pista (el campeón) va justo antes de su nombre de usuario.
  $('fl-user').textContent = '👑 @' + champ.user;
  $('fl-hp').textContent = `${champ.hp}/${champ.maxHp}`;
  const flBar = $('fl-hp-bar');
  flBar.style.width = '100%';
  flBar.className = 'hp-bar-fill';
  if (!ms.arenaSprites || !ms.arenaSprites.left) {
    const leftSprite = new PMDSprite($('fl-sprite'), getPokemonSprite(champ.pokemon.sprite), { uncapped: true });
    leftSprite.setDex(champ.pokemon.sprite, champ.pokemon.isShiny);
    ms.arenaSprites = { left: leftSprite, right: null };
    leftSprite.play('Walk', arenaDirectionFor('left'), true, null, ARENA_ANIM_SPEED);
  }
}

function showColiseumEmpty() {
  $('fighter-left').style.display = 'none';
  $('fighter-right').style.display = 'none';
}

function updateArenaHP() {
  const b = state.modeState.currentBattle;
  if (!b) return;
  const lPct = (b.left.hp / b.left.maxHp) * 100;
  const rPct = (b.right.hp / b.right.maxHp) * 100;
  $('fl-hp').textContent = `${b.left.hp}/${b.left.maxHp}`;
  $('fr-hp').textContent = `${b.right.hp}/${b.right.maxHp}`;
  const flBar = $('fl-hp-bar');
  const frBar = $('fr-hp-bar');
  flBar.style.width = lPct + '%';
  frBar.style.width = rPct + '%';
  flBar.className = 'hp-bar-fill' + (lPct < 25 ? ' low' : lPct < 50 ? ' mid' : '');
  frBar.className = 'hp-bar-fill' + (rPct < 25 ? ' low' : rPct < 50 ? ' mid' : '');
}

function logBattle(text, cls) {
  const log = $('battle-log');
  if (!log) return;
  const p = document.createElement('p');
  p.className = cls;
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

// El ganador se queda como campeón del coliseo (siempre a la izquierda);
// el perdedor deja el coliseo (puede volver a hacer cola escribiendo
// !pokemon de nuevo). El siguiente combate NO empieza automáticamente:
// hay que pulsar el botón de avanzar la cola.
function endBattle(winner, loser) {
  const ms = state.modeState;
  logBattle(`¡${winner.pokemon.name} de @${winner.user} gana el combate!`, 'crit');
  addChatMessage(null, `🏆 ¡@${winner.user} gana y reina en el Coliseo! +200 pts`, 'correct');
  addScore(winner.user, 200);
  // Se registra al derrotado: por defecto no podrá volver a hacer cola en
  // este Coliseo, salvo que el streamer active el reingreso de derrotados.
  if (ms.defeatedUsers) ms.defeatedUsers.add(loser.user);
  ms.champion = { user: winner.user, pokemon: winner.pokemon, hp: winner.hp, maxHp: winner.maxHp, abilityCd: winner.abilityCd, attackTypeIndex: winner.attackTypeIndex || 0 };
  ms.currentBattle = null;
  // El combate acaba de terminar y aún no hay ninguno nuevo en marcha: se
  // arranca (o reinicia) la cuenta atrás del Modo AFK por inactividad (ver
  // scheduleArenaAfkIdleCheck).
  scheduleArenaAfkIdleCheck();
  if (ms.arenaSprites) {
    if (ms.arenaSprites.left) ms.arenaSprites.left.destroy();
    if (ms.arenaSprites.right) ms.arenaSprites.right.destroy();
    ms.arenaSprites = null;
  }
  renderRanking($('arena-ranking'));
  renderArenaQueue();
  ms.champWaitTimeout = setTimeout(() => {
    const cur = state.modeState;
    if (!cur) return; // el modo pudo cerrarse mientras tanto
    cur.champWaitTimeout = null;
    if (cur.currentBattle) return; // ya ha entrado un retador nuevo: no lo pisamos
    showChampionWaiting();
    updateAdvanceQueueUI();
  }, 3000);
}

// ---- Mostrar/ocultar y reposicionar la cola al entrar o salir de pantalla
// completa ----
// Tras un cambio de tamaño (fullscreen o resize de ventana) el layout tarda
// uno o dos frames en asentarse; se espera con doble rAF antes de medir la
// escena, para no recalcular con medidas todavía antiguas. renderArenaQueue
// se encarga a la vez de mostrar/ocultar la cola (ver isArenaSceneFullscreen)
// y de recolocar sus puestos según el nuevo tamaño de la escena.
function scheduleArenaQueueVisibilityUpdate() {
  requestAnimationFrame(() => requestAnimationFrame(renderArenaQueue));
}
['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange', 'scenefsfallbackchange'].forEach(evt => {
  document.addEventListener(evt, scheduleArenaQueueVisibilityUpdate);
});
window.addEventListener('resize', scheduleArenaQueueVisibilityUpdate);
