import { $, showScreen } from './utils.js';

/* =========================================================
   PANTALLA "CÓMO JUGAR" — accesible desde el botón "❓ Cómo Jugar"
   de cada tarjeta del menú de selección de modo.
   -----------------------------------------------------------
   Es una pantalla de solo lectura (no cambia ningún estado del
   juego): explica en detalle los comandos y la mecánica de un
   modo, con capturas de pantalla reales tomadas en Modo Demo. El
   contenido de cada modo vive en HOWTO_CONTENT y se renderiza bajo
   demanda (ver renderHowTo) la primera vez que se abre su ficha;
   una vez montado el HTML de un modo se guarda en caché
   (renderedModes) para no reconstruirlo cada vez.
   ========================================================= */

const HOWTO_CONTENT = {
  pasapalabra: {
    title: '🎯 Pasapalabra',
    images: ['pasapalabra-1.png'],
    intro: 'El Streamer compite contra todo el Chat a la vez. Se juega con el rosco de siempre, de la A a la Z: en cada letra aparece una pregunta cuya respuesta empieza (o contiene) esa letra, y gana la letra quien la acierte primero, sea el Streamer o cualquier espectador.',
    commands: [
      { cmd: '!&lt;respuesta&gt;', desc: 'La propia respuesta ES el comando, pegada al "!" (p.ej. "!carmin", "!pikachu"). No hace falta escribir nada delante.' },
      { cmd: '!puntos', desc: 'Consulta cuántos puntos llevas acumulados en la partida.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'Cada letra tiene un límite de tiempo (30s). El Streamer escribe su respuesta en su propio cuadro de texto de la pantalla; el Chat compite escribiendo directamente "!" seguido de la respuesta. La letra se la lleva quien acierte primero: +100 puntos para quien la gane desde el chat, o un punto de marcador para el Streamer si la acierta él. Tras resolverse, la ronda pasa automáticamente a la siguiente letra pendiente.' },
      { heading: 'Fin de la partida', text: 'El rosco da como máximo dos vueltas completas: las letras que sigan sin resolverse después de la segunda vuelta se dan por perdidas y termina la partida. Gana quien tenga más letras a su favor, Streamer o Chat; al final se muestra además qué usuarios del chat acertaron más preguntas.' },
      { heading: 'Bloqueo del chat', text: 'El Streamer puede activar un bloqueo desde su pantalla para que, temporalmente, el chat no pueda participar (ni siquiera con !puntos) y sea él quien responda todas las letras.' },
    ],
  },

  rayosolar: {
    title: '☀️ Rayo Solar',
    images: ['rayosolar-1.png'],
    intro: 'Todo el mapa es un prado partido en dos franjas: arriba pasea un Venusaur gigante y solitario; abajo están todos los Pokémon de los jugadores. Sobrevive a sus descargas de Rayo Solar hasta ser el último en pie.',
    commands: [
      { cmd: '!pokemon [nombre]', desc: 'Apuntarse en el lobby eligiendo cualquier Pokémon de toda la Pokédex Nacional.' },
      { cmd: '!izquierda / !i', desc: 'Tu Pokémon camina sin parar hacia la izquierda hasta el borde del campo o hasta que le mandes otra orden.' },
      { cmd: '!derecha / !d', desc: 'Igual que el anterior, pero hacia la derecha.' },
      { cmd: '!stop', desc: 'Tu Pokémon se detiene donde esté.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'Hacen falta al menos 2 jugadores apuntados para que el Streamer pueda pulsar "Comenzar Partida". El movimiento es siempre horizontal: no se puede subir a la franja donde está Venusaur.' },
      { heading: 'El peligro', text: 'Venusaur deambula solo, muy despacio, por la franja superior, parándose de vez en cuando. Cada vez que se detiene tiene una probabilidad de disparar Rayo Solar contra todo el campo inferior: quien esté en la zona de impacto en ese momento queda eliminado.' },
      { heading: 'Fin de la partida', text: 'Gana el último Pokémon que quede con vida. Si Rayo Solar acaba con todos a la vez, la partida también termina sin ganador.' },
    ],
  },

  arena: {
    title: '⚔️ Arena Pokémon',
    images: ['arena-1.png'],
    intro: 'El Coliseo Pokémon: los espectadores hacen cola para retar al campeón actual en duelos automáticos 1 contra 1. Quien gana se queda de campeón esperando al siguiente retador.',
    commands: [
      { cmd: '!pokemon [nombre]', desc: 'Ponerte en la cola del coliseo con el Pokémon que elijas (hasta 16 en cola a la vez).' },
      { cmd: '!habilidad1 / !habilidad2', desc: 'Cambiar el tipo de tu ataque especial, si tu Pokémon tiene dos tipos.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'El primero en llegar a la cola sube directamente como campeón; cada nuevo inscrito reta al campeón actual. Los combates son totalmente automáticos (turnos, esquivas, golpes críticos y tabla de tipos oficial) — el chat no tiene que escribir comandos de ataque, solo elegir Pokémon.' },
      { heading: 'La cola', text: 'Cuando el campeón cae, el siguiente duelo no arranca solo: el Streamer tiene que pulsar "Avanzar Cola" para que suba el siguiente retador (salvo que active el modo automático con el botón correspondiente).' },
      { heading: 'Estadísticas', text: 'Todos los Pokémon del coliseo comparten la misma vida, daño y velocidad; lo único que cambia entre ellos es el tipo de su ataque, sujeto a la tabla de tipos oficial de los juegos.' },
    ],
  },

  zoroarks: {
    title: '🦊 Zoroarks',
    images: ['zoroarks-1.png'],
    intro: 'Un pueblo de Zoroark de noche: los jugadores exploran sus caminos y, cada día, el pueblo vota a quien cree sospechoso. Sobrevive a las votaciones hasta el final.',
    commands: [
      { cmd: '!participo', desc: 'Apuntarte en el lobby (se te asigna un sprite de NPC al azar). Hacen falta al menos 3 inscritos para empezar.' },
      { cmd: '!bosque / !charca / !pueblo', desc: 'Enviar a tu personaje a explorar ese camino durante la noche.' },
      { cmd: '!plaza', desc: 'Quedarte en la plaza del pueblo (es lo que pasa por defecto si no escribes nada).' },
      { cmd: '!vote &lt;usuario&gt;', desc: 'Durante la fase de votación de cada día, votar a quien crees que deben expulsar (p.ej. !vote Samubf93). Puede votar cualquiera del chat, esté o no en la partida, y el voto no se puede cambiar.' },
      { cmd: '!si / !no', desc: 'Cuando el más votado del día sube al escenario, confirmar o no su expulsión.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'Al empezar, todos aparecen en la plaza central del pueblo. Cada noche, cada jugador elige camino (una sola vez por noche); su personaje camina hasta allí y, si cambia de opinión antes de elegir de nuevo, vuelve sobre sus pasos hasta la plaza antes de ir a otro sitio.' },
      { heading: 'Los Zoroark ocultos', text: 'Al empezar la partida se eligen en secreto uno o dos jugadores Zoroark (uno si hay 8 inscritos o menos, dos a partir de 9), que nunca se distinguen en la interfaz del resto de aldeanos.' },
      { heading: 'Las muertes de la noche', text: 'Al cerrar la noche, cada ubicación funciona de forma distinta: en el Pueblo y en la Charca muere un aldeano (no-Zoroark) al azar por cada Zoroark que haya pasado la noche en esa misma ubicación. En el Bosque y en la Plaza no importa si hay Zoroark presentes: cada aldeano que pasó la noche ahí tiene, individualmente, un 33% de probabilidades de morir. Un Zoroark nunca muere por esta vía: solo puede morir si el pueblo lo vota y confirma su expulsión al día siguiente.' },
      { heading: 'Los días y las votaciones', text: 'El primer día no tiene votación. A partir del segundo, se abre una fase en la que todo el chat puede votar a un jugador con !vote. Si hay un único más votado sin empate, sube al escenario de la plaza y se abre una fase de !si/!no para confirmar o no su expulsión.' },
    ],
  },

  safari: {
    title: '🌿 Zona Safari',
    images: ['safari-1.png'],
    intro: 'Una galería de tiro: el Streamer apunta con el ratón y dispara a los Pokémon de los jugadores mientras ellos intentan cruzar todo el terreno hasta la meta.',
    commands: [
      { cmd: '!pokemon [nombre]', desc: 'Apuntarte en el lobby con el Pokémon que quieras.' },
      { cmd: '!go', desc: 'Tu Pokémon empieza a caminar hacia la meta (empiezan todos quietos).' },
      { cmd: '!stop', desc: 'Tu Pokémon se detiene. Un Pokémon parado es intocable: solo se puede disparar a uno que esté caminando.' },
    ],
    sections: [
      { heading: 'El disparo del Streamer', text: 'Al mantener pulsado el clic izquierdo se abre una mirilla con zoom que sigue al cursor; al soltar, dispara justo en el punto donde soltó el botón.' },
      { heading: '"Cerrar los ojos"', text: 'El Streamer puede pulsar ESPACIO para "cerrar los ojos" durante unos segundos: mientras dura, no puede disparar, así que es el mejor momento para que los Pokémon caminen sin riesgo.' },
      { heading: 'El reloj de la partida', text: 'Arriba a la derecha hay una cuenta atrás de 50 segundos que solo baja mientras el Streamer tiene los ojos cerrados (con los ojos abiertos se detiene por completo). En cuanto ese contador llega a 0, todos los Pokémon que no hayan cruzado todavía la meta mueren de golpe.' },
      { heading: 'Fin de la partida', text: 'Termina cuando el Streamer ha eliminado a todos los Pokémon, cuando todos los que siguen con vida han cruzado la meta, o cuando se agota el reloj de 50 segundos de ojos cerrados.' },
    ],
  },

  boss: {
    title: '👹 Boss Cooperativo',
    images: ['boss-1.png'],
    intro: 'Un jefe interminable: en cuanto cae uno, aparece otro distinto. Los espectadores se apuntan una única vez y el Streamer decide, combate tras combate, quién sube a luchar 1 contra 1 contra el jefe actual.',
    commands: [
      { cmd: '!pokemon [nombre]', desc: 'Apuntarte en el lobby (o, mientras dure la fase 1 de cada nivel, cambiar el Pokémon con el que ya estabas apuntado).' },
      { cmd: '!habilidad1 / !habilidad2', desc: 'Cambiar el tipo de tu ataque, si tu Pokémon tiene dos tipos.' },
      { cmd: '!levelup ataque / vida / velocidad', desc: 'Gastar tu mejora disponible del nivel actual en esa estadística.' },
      { cmd: '!puntos', desc: 'Consultar tus puntos.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'El combate es automático (igual que en el Coliseo del modo Arena): el chat no ataca por comando, solo elige Pokémon y mejoras. Es el Streamer quien hace clic sobre un combatiente ya apuntado para que suba a luchar; cuando cae, puede elegir a otro para seguir desgastando al mismo jefe.' },
      { heading: 'Objetos y cofres', text: 'Al abrir un cofre, el Streamer reparte uno de los objetos disponibles a un combatiente; una vez equipado, ese objeto ya no se puede quitar a mano hasta que se desequipa solo al terminar la fase final del nivel.' },
      { heading: 'Modo AFK', text: 'Activable desde el propio lobby: en vez de que el Streamer elija con el ratón, cada decisión (quién sube a luchar, qué objeto sale del cofre y a quién se le da) se somete a votación del chat con comandos !1, !2...' },
      { heading: 'Fin de la partida', text: 'Solo termina si todos los combatientes apuntados se quedan a la vez sin vida. Mientras quede uno en pie, siempre aparecerá un jefe nuevo tras el anterior.' },
    ],
  },

  pokerus: {
    title: '🧬 Pokerus',
    images: ['pokerus-1.png'],
    intro: 'Al empezar, un porcentaje de los jugadores queda infectado en secreto por el Pokerus. Cada noche hay que elegir en qué sala dormir sin saber quién está contagiado... ¡y el virus se contagia durmiendo cerca de un infectado!',
    commands: [
      { cmd: '!pokemon [nombre]', desc: 'Apuntarte en el lobby con cualquier Pokémon de la Pokédex Nacional (hasta 40 jugadores).' },
      { cmd: '!&lt;número&gt; o !puerta &lt;número&gt;', desc: 'Ir a dormir a esa sala esa noche (p.ej. !3).' },
      { cmd: '!plaza o !0', desc: 'Quedarte a dormir en la plaza, a la intemperie (más riesgo de contagio).' },
    ],
    sections: [
      { heading: 'Las salas', text: 'El mapa tiene siempre 10 salas en posiciones fijas, pero cada ronda solo se abren las necesarias (con aforo limitado) para que quepan justos todos los jugadores vivos.' },
      { heading: 'Etapas del virus', text: 'Cada infectado pasa por incubación sin síntomas, luego se vuelve visible como "Infectado" para todos, y muere automáticamente al quinto día desde el contagio si nadie lo evita.' },
      { heading: 'Contagio', text: 'Dormir en la plaza es lo más arriesgado; compartir sala con un infectado también contagia, con más probabilidad cuantos menos compañeros de sala sanos haya.' },
      { heading: 'Fin de la partida', text: 'Sobrevive quien nunca se contagie o consiga esquivar el virus hasta el final.' },
    ],
  },

  volcan: {
    title: '🌋 El Volcán',
    images: ['volcan-1.png'],
    intro: 'Dos plataformas de roca volcánica. Cada cierto tiempo, la plataforma con más Pokémon encima entra en erupción y todos los que sigan ahí mueren. Sobrevive siendo el último en pie.',
    commands: [
      { cmd: '!pokemon [nombre]', desc: 'Apuntarte en el lobby (hacen falta al menos 3 jugadores para empezar).' },
      { cmd: '!izquierda / !i', desc: 'Mandar a tu Pokémon a la plataforma izquierda.' },
      { cmd: '!derecha / !d', desc: 'Mandar a tu Pokémon a la plataforma derecha.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'Cada Pokémon empieza repartido al azar en una de las dos plataformas. Cada 40 segundos entra en erupción la que tenga más Pokémon encima en ese momento: quienes estén sobre ella mueren. La otra plataforma queda a salvo esa vez.' },
      { heading: 'Estrategia', text: 'Como la erupción castiga siempre a la plataforma más poblada, conviene vigilar en todo momento cuál tiene menos gente y cruzar a tiempo antes de que suba el conteo atrás.' },
      { heading: 'Fin de la partida', text: 'Termina cuando solo queda un jugador con vida (gana) o cuando mueren todos.' },
    ],
  },

  vistalince: {
    title: '🦅 Vista Lince',
    images: ['vistalince-1.png'],
    intro: 'Un rancho donde, ronda tras ronda, cruzan Pokémon de izquierda a derecha por un recinto. Cuenta bien cuántos pasan: quien falle el número exacto (o no responda) queda eliminado.',
    commands: [
      { cmd: '!participo', desc: 'Apuntarte en el lobby (hacen falta al menos 2 jugadores).' },
      { cmd: '!&lt;número&gt; (p.ej. !7)', desc: 'Cuando empieza la cuenta atrás de 30s tras el cruce, decir cuántos Pokémon has contado.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'En cada ronda, los Pokémon cruzan el recinto a intervalos aleatorios; en cuanto el recinto se queda vacío, arranca la cuenta atrás para responder con el número exacto.' },
      { heading: '"Preguntar Antes" (opcional)', text: 'Si el Streamer activa esta opción en el lobby, justo antes de que empiecen a cruzar se muestra un aviso con la pregunta en futuro, para que sepas qué contar desde el principio.' },
      { heading: '"Eliminar Más Lento" (opcional, activada por defecto)', text: 'Si todos los jugadores vivos responden exactamente el mismo número (acierten o no), solo queda eliminado quien respondió el último; el resto sobrevive esa ronda igualmente.' },
      { heading: 'Fin de la partida', text: 'Termina cuando queda un único jugador con vida.' },
    ],
  },

  extranjeria: {
    title: '🛂 Control de Extranjería',
    images: ['extranjeria-1.png'],
    intro: 'Al más puro estilo "Papers, Please": los NPCs hacen cola para pasar el control y el Streamer decide, mirando su pasaporte, si les deja pasar o no.',
    commands: [
      { cmd: '!participo', desc: 'Ponerte en la cola (se te asigna un NPC al azar). No hay límite de partida: la gente se va apuntando y procesando de forma continua.' },
      { cmd: '!si / !no', desc: 'Mientras un NPC está siendo atendido, todo el chat vota si debe dejarle pasar o no (el Streamer no está obligado a seguir la votación).' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'El Streamer pulsa "Llamar Siguiente" para que el primero de la cola pase al mostrador y deje su pasaporte; al pulsar sobre el pasaporte se ve su nombre, edad, región de origen, profesión y equipaje.' },
      { heading: 'La decisión', text: 'El Streamer decide con los botones ✔ (dejar pasar) o ✗ (denegar). Cada caso puede esconder, en secreto, algún dato sospechoso: acertar la decisión da más puntos.' },
      { heading: 'Mientras esperan', text: 'Todo lo que el NPC "dice" en el chat aparece en un bocadillo sobre su cabeza mientras está siendo atendido.' },
    ],
  },

  voltorb: {
    title: '💣 Voltorb Explosivo',
    images: ['voltorb-1.png'],
    intro: 'Todos en corro, por turnos: hay que nombrar un elemento de la categoría anunciada sin repetir ninguno ya dicho, antes de que tu Voltorb se quede sin vidas... ¡y explote!',
    commands: [
      { cmd: '!participo', desc: 'Apuntarte en el lobby (hasta 24 jugadores; hacen falta al menos 2 para empezar).' },
      { cmd: '!&lt;elemento&gt; (p.ej. !perro)', desc: 'En tu turno, responder pegando la respuesta justo detrás del "!", sin ningún comando previo.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'Cada ronda anuncia una categoría (p.ej. "Pokémon de tipo siniestro"). Por turnos, cada jugador vivo debe decir un elemento válido de esa categoría que nadie haya dicho todavía en la ronda.' },
      { heading: 'Las vidas', text: 'Fallar, repetir una respuesta ya dicha, o dejar pasar tu turno sin responder te resta una vida. Te quedas eliminado cuando pierdes todas.' },
      { heading: 'Fin de la partida', text: 'Sobrevive el último jugador con vidas restantes.' },
    ],
  },

  avalugg: {
    title: '❄️ Glaciar de Avalugg',
    images: ['avalugg-1.png'],
    intro: 'Una cuadrícula de hielo quebradizo: solo un único camino de casillas es seguro y nadie lo conoce de antemano. Sé el primero en cruzar hasta el trofeo sin caer al hielo roto.',
    commands: [
      { cmd: '!participo', desc: 'Apuntarte en el lobby (hacen falta al menos 1 jugador para empezar).' },
      { cmd: '!&lt;letras wasd&gt; (p.ej. !aasaa)', desc: 'Moverte casilla a casilla: cada letra es un paso (w=arriba, a=izquierda, s=abajo, d=derecha), y se procesan en orden.' },
    ],
    sections: [
      { heading: 'Cómo se juega', text: 'Todos entran caminando desde la izquierda y se reparten en la segunda columna, la única que nunca se rompe junto con la primera. A partir de ahí, cada casilla puede ser segura o quebradiza sin que se note ninguna diferencia visual.' },
      { heading: 'Si pisas mal', text: 'Si tu comando te lleva a una casilla incorrecta, esa casilla se rompe para siempre (cualquiera que la pise después también cae) y reapareces en una fila aleatoria de la segunda columna. Si tu comando tenía más letras, el resto se cancela en cuanto ocurre esto.' },
      { heading: 'Fin de la partida', text: 'Gana el primer jugador que toque el trofeo, en el centro de la última columna.' },
    ],
  },
};

let renderedModes = new Set();

function renderHowTo(mode) {
  const data = HOWTO_CONTENT[mode];
  const content = $('howto-content');
  if (!data || !content) return;
  const titleEl = $('howto-title');
  if (titleEl) titleEl.textContent = data.title;

  const imagesHtml = (data.images || [])
    .map(src => `<img class="howto-shot" src="assets/howto/${src}" alt="Captura de pantalla de ${data.title}" loading="lazy">`)
    .join('');

  const commandsHtml = (data.commands || [])
    .map(c => `
      <div class="howto-cmd-row">
        <code class="howto-cmd-code">${c.cmd}</code>
        <span class="howto-cmd-desc">${c.desc}</span>
      </div>
    `).join('');

  const sectionsHtml = (data.sections || [])
    .map(s => `
      <div class="howto-section">
        <h4>${s.heading}</h4>
        <p>${s.text}</p>
      </div>
    `).join('');

  content.innerHTML = `
    <p class="howto-intro">${data.intro}</p>
    ${imagesHtml ? `<div class="howto-gallery">${imagesHtml}</div>` : ''}
    <div class="howto-commands">
      <h3>Comandos</h3>
      ${commandsHtml}
    </div>
    <div class="howto-sections">${sectionsHtml}</div>
  `;
}

// Cablea los botones "❓ Cómo Jugar" de cada tarjeta del menú y el botón de
// volver de la propia pantalla. Se llama una sola vez, al cargar el módulo
// (ver el import en eventListeners.js), igual que el resto de listeners de
// navegación entre pantallas.
export function initHowToPlayScreen() {
  document.querySelectorAll('.howto-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const mode = btn.dataset.mode;
      renderHowTo(mode);
      showScreen('howto-screen');
    };
  });
  const backBtn = $('howto-back-btn');
  if (backBtn) backBtn.onclick = () => showScreen('menu-screen');
}
