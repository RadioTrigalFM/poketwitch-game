/* =========================================================
   ESTADO COMPARTIDO DE PANTALLA COMPLETA POR ESCENA
   -----------------------------------------------------------
   Vive en su propio módulo (en vez de dentro de eventListeners.js)
   para que utils.js pueda consultar qué escena está en pantalla
   completa ahora mismo -por ejemplo, para reubicar el modal global
   dentro de ella y que siga siendo visible- sin crear una
   dependencia circular entre eventListeners.js y utils.js.
   ========================================================= */

// Preferencia "Pantalla completa automática": si está activa, al entrar a
// cualquier modo de juego se solicita pantalla completa automáticamente
// (ver el listener de 'pk-mode-launched' en eventListeners.js). El
// streamer puede seguir saliendo de la pantalla completa en cualquier
// momento con el botón de la escena, Esc, o los controles del navegador,
// exactamente igual que si la hubiera activado a mano.
const AUTO_FULLSCREEN_STORAGE_KEY = 'pokekukoro_auto_fullscreen';
let autoFullscreenEnabled = false;

export function loadAutoFullscreenPref() {
  try {
    autoFullscreenEnabled = localStorage.getItem(AUTO_FULLSCREEN_STORAGE_KEY) === '1';
  } catch (e) {
    autoFullscreenEnabled = false;
  }
  return autoFullscreenEnabled;
}

export function isAutoFullscreenEnabled() {
  return autoFullscreenEnabled;
}

export function setAutoFullscreen(enabled) {
  autoFullscreenEnabled = !!enabled;
  try {
    localStorage.setItem(AUTO_FULLSCREEN_STORAGE_KEY, autoFullscreenEnabled ? '1' : '0');
  } catch (e) {
    // ignoramos si no se puede persistir
  }
}

// Escena que está en modo "pantalla completa simulada" (position:fixed),
// usado cuando la API nativa de Fullscreen no existe o el navegador la
// bloquea en silencio (Safari iOS, algunos navegadores embebidos como OBS
// Browser Source). null si no hay ninguna en ese modo.
let sceneFallbackEl = null;

export function getSceneFallbackElement() {
  return sceneFallbackEl;
}

export function setSceneFallbackElement(el) {
  sceneFallbackEl = el;
}

// Los modos con lobby + "Nueva Partida" (Rayo Solar, Zona Safari, Avalugg,
// Vista Lince, El Volcán, Voltorb Explosivo, Zoroarks) reconstruyen
// #game-content de golpe con innerHTML al reiniciar, lo que destruye la
// escena que estuviera en pantalla completa en ese momento SIN pasar por
// exitFallbackFullscreen(). Si esa escena estaba en el modo simulado
// (".fs-fallback"), sceneFallbackEl se queda apuntando a un nodo ya fuera
// del documento -y ahí se queda, porque nada más la limpia-. Si justo
// después la escena nueva (p.ej. el lobby recién creado) sí consigue
// pantalla completa NATIVA de verdad, currentFullscreenElement() seguiría
// devolviendo ese rastro obsoleto porque document.fullscreenElement no es
// la única condición que mira: por eso se comprueba y se descarta aquí,
// antes de devolver nada, en vez de fiarse ciegamente de la variable.
function pruneStaleFallback() {
  if (sceneFallbackEl && !sceneFallbackEl.isConnected) {
    sceneFallbackEl = null;
    document.body.classList.remove('fs-fallback-lock');
  }
}

// Devuelve el elemento .game-scene actualmente en pantalla completa (ya sea
// por la API nativa o por el modo simulado), o null si no hay ninguna.
export function currentFullscreenElement() {
  const native = document.fullscreenElement
    || document.webkitFullscreenElement
    || document.msFullscreenElement;
  if (native) return native;
  pruneStaleFallback();
  return sceneFallbackEl || null;
}

export function isFullscreenActive() {
  return !!currentFullscreenElement();
}

/* ---------- Mecánica de entrada/salida de pantalla completa ----------
   Vive aquí (y no en eventListeners.js, donde se define el botón "⛶" de
   cada escena) para que otros módulos -como rayosolar.js, al reconstruir
   su lobby tras "Nueva Partida"- puedan pedir o quitar la pantalla
   completa de una escena por su cuenta, sin depender de eventListeners.js
   (que a su vez depende de modeLauncher.js, que importa a los propios
   modos: importar eventListeners.js desde un modo crearía un ciclo).
   Mismo repertorio de API nativa + fallback ".fs-fallback" que el resto
   del archivo: ver la explicación larga en eventListeners.js. */

// Escalado de sprites en pantalla completa (modo Zoroarks): no-op para
// cualquier escena que no contenga .zor-field-outer (ver el "if (!field)
// return;" de abajo), así que es seguro invocarlo desde cualquier escena.
const FS_SPRITE_SCALE_SELECTOR = '.zor-field-outer';
const ZOR_MAP_BG_NATURAL_W = 1376;
const ZOR_MAP_BG_NATURAL_H = 768;
let spriteScaleObserver = null;
let spriteScaleEl = null;
let spriteScaleBaseline = null;

function zorMapCoverScale(w, h) {
  return Math.max(w / ZOR_MAP_BG_NATURAL_W, h / ZOR_MAP_BG_NATURAL_H);
}

function startFullscreenSpriteScale(sceneEl) {
  const field = sceneEl.matches(FS_SPRITE_SCALE_SELECTOR)
    ? sceneEl
    : sceneEl.querySelector(FS_SPRITE_SCALE_SELECTOR);
  if (!field) return;
  const rect = field.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  stopFullscreenSpriteScale();
  spriteScaleEl = field;
  spriteScaleBaseline = { coverScale: zorMapCoverScale(rect.width, rect.height) };
  spriteScaleObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry || !spriteScaleBaseline) return;
    const { width, height } = entry.contentRect;
    if (!width || !height) return;
    const scale = zorMapCoverScale(width, height) / spriteScaleBaseline.coverScale;
    field.style.setProperty('--zor-sprite-scale', Math.max(1, scale).toFixed(4));
  });
  spriteScaleObserver.observe(field);
}

export function stopFullscreenSpriteScale() {
  if (spriteScaleObserver) { spriteScaleObserver.disconnect(); spriteScaleObserver = null; }
  if (spriteScaleEl) { spriteScaleEl.style.removeProperty('--zor-sprite-scale'); spriteScaleEl = null; }
  spriteScaleBaseline = null;
}

// Entra en pantalla completa "simulada" (position:fixed) sobre sceneEl: se
// usa cuando la API nativa no existe o la rechaza en silencio. No llama a
// updateSceneFullscreenBtns() directamente (eso vive en eventListeners.js,
// evitando el ciclo de imports de arriba): el evento 'scenefsfallbackchange'
// que dispara aquí ya lo tiene escuchado eventListeners.js para refrescar
// los botones y reubicar el modal.
export function enterFallbackFullscreen(sceneEl) {
  setSceneFallbackElement(sceneEl);
  sceneEl.classList.add('fs-fallback');
  document.body.classList.add('fs-fallback-lock');
  document.dispatchEvent(new CustomEvent('scenefsfallbackchange'));
}

export function exitFallbackFullscreen() {
  if (!sceneFallbackEl) return;
  sceneFallbackEl.classList.remove('fs-fallback');
  setSceneFallbackElement(null);
  document.body.classList.remove('fs-fallback-lock');
  document.dispatchEvent(new CustomEvent('scenefsfallbackchange'));
}

// Pide pantalla completa sobre sceneEl (API nativa, con fallback simulado
// si no existe o la rechaza), sin comprobar antes si ya había otra escena
// en pantalla completa: úsalo cuando ya sabes que quieres ENTRAR (p.ej.
// rayosolar.js restaurándola tras reconstruir su lobby). Para alternar
// según el estado actual de una escena con su propio botón "⛶", usa
// toggleSceneFullscreen.
export function requestSceneFullscreen(sceneEl) {
  if (!sceneEl) return;
  // Descarta cualquier rastro obsoleto de una escena anterior antes de
  // pedir pantalla completa para la nueva (ver el comentario largo de
  // pruneStaleFallback más arriba): si no se hace aquí, sceneFallbackEl
  // podría quedar apuntando a un nodo ya destruido mientras esta escena
  // nueva entra en pantalla completa nativa de verdad.
  pruneStaleFallback();
  // Se mide el tamaño "normal" del mapa ANTES de pedir pantalla completa
  // (por cualquiera de las dos vías), que es el único momento en que
  // todavía no ha crecido (ver zoroarks.js/styles.css para el porqué).
  startFullscreenSpriteScale(sceneEl);
  const req = sceneEl.requestFullscreen || sceneEl.webkitRequestFullscreen || sceneEl.msRequestFullscreen;
  if (!req) { enterFallbackFullscreen(sceneEl); return; }
  // requestFullscreen puede no devolver promesa (Safari con prefijo) o
  // puede rechazarla (p.ej. si el navegador la deniega por política); en
  // ambos casos de fallo se recurre al modo simulado.
  let result;
  try { result = req.call(sceneEl); } catch (err) { enterFallbackFullscreen(sceneEl); return; }
  if (result && typeof result.catch === 'function') {
    result.catch(() => enterFallbackFullscreen(sceneEl));
  }
}

// Sale de la pantalla completa actual (nativa o simulada), sea cual sea la
// escena que la tenga.
export function exitSceneFullscreen() {
  stopFullscreenSpriteScale();
  // Ver el comentario largo de pruneStaleFallback: sin esto, un rastro
  // obsoleto de sceneFallbackEl hace que esta función crea que solo hay
  // que salir del modo simulado y nunca llegue a llamar a
  // document.exitFullscreen() -dejando el navegador realmente atrapado en
  // pantalla completa nativa, con cualquier botón fuera de la escena
  // (como "Volver al menú") inaccesible aunque la interfaz ya "crea" que
  // se ha salido-.
  pruneStaleFallback();
  if (sceneFallbackEl) {
    exitFallbackFullscreen();
    return;
  }
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (exit) exit.call(document);
}

// Alterna la pantalla completa de sceneEl según haya o no una escena en
// pantalla completa ahora mismo: usado por el botón "⛶" de cada escena
// (ver eventListeners.js).
export function toggleSceneFullscreen(sceneEl) {
  if (!sceneEl) return;
  if (!currentFullscreenElement()) {
    requestSceneFullscreen(sceneEl);
  } else {
    exitSceneFullscreen();
  }
}
