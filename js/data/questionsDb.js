/* =========================================================
   QUESTIONS DATABASE
   ========================================================= */
const PASAPALABRA_QUESTION_BANK = {
  'A': [
    { q: 'Pokémon psíquico que se teletransporta para huir de los combates', a: 'Abra', prefix: 'Empieza por A' },
    { q: 'Región de Pokémon Sol y Luna formada por islas tropicales', a: 'Alola', prefix: 'Empieza por A' },
    { q: 'Pokémon siniestro cuya aparición se dice que anuncia desastres', a: 'Absol', prefix: 'Empieza por A' },
    { q: 'Estadística que determina la fuerza de los movimientos físicos', a: 'Ataque', prefix: 'Empieza por A' },
    { q: 'Nombre y apellido del protagonista humano del anime Pokémon', a: 'Ash Ketchum', prefix: 'Empieza por A' },
    { q: 'Pokémon fósil roca/volador que se revive a partir de un fósil de ala', a: 'Aerodactyl', prefix: 'Empieza por A' },
    { q: 'Ciudad de Kanto con gimnasio psíquico liderado por Sabrina', a: 'Ciudad Azafrán', prefix: 'Empieza por A' },
    { q: 'Habilidad que potencia los movimientos del mismo tipo que el Pokémon', a: 'Adaptable', prefix: 'Empieza por A' },
  ],
  'B': [
    { q: 'Pokémon inicial de tipo planta de la región de Kanto', a: 'Bulbasaur', prefix: 'Empieza por B' },
    { q: 'Primer líder de gimnasio de Kanto, especialista en tipo roca', a: 'Brock', prefix: 'Empieza por B' },
    { q: 'Movimiento que provoca somnolencia al rival y le hace dormir el turno siguiente', a: 'Bostezo', prefix: 'Empieza por B' },
    { q: 'Objeto vegetal que los Pokémon pueden comer para curarse o recuperar energía', a: 'Baya', prefix: 'Empieza por B' },
    { q: 'Experto en Pokémon de Ciudad Carmín que ayuda con el sistema de almacenamiento del PC', a: 'Bill', prefix: 'Empieza por B' },
    { q: 'Pokémon bicho/veneno con aguijones en los brazos, evolución de Weedle', a: 'Beedrill', prefix: 'Empieza por B' },
    { q: 'Líder de gimnasio de tipo lucha de la región de Galar', a: 'Bea', prefix: 'Empieza por B' },
    { q: 'Movimiento fantasma que lanza una esfera de energía oscura', a: 'Bola Sombra', prefix: 'Empieza por B' },
  ],
  'C': [
    { q: 'Pokémon inicial de tipo fuego de la región de Kanto', a: 'Charmander', prefix: 'Empieza por C' },
    { q: 'Ciudad de Kanto con gimnasio de tipo agua, liderado por Misty', a: 'Ciudad Celeste', prefix: 'Empieza por C' },
    { q: 'Movimiento psíquico básico que ataca con el poder de la mente', a: 'Confusión', prefix: 'Empieza por C' },
    { q: 'Pokémon legendario psíquico/planta capaz de viajar en el tiempo', a: 'Celebi', prefix: 'Empieza por C' },
    { q: 'Campeona de la Liga Pokémon de la región de Sinnoh', a: 'Cynthia', prefix: 'Empieza por C' },
    { q: 'Pokémon bicho inicial de Kanto que evoluciona en Metapod', a: 'Caterpie', prefix: 'Empieza por C' },
    { q: 'Habilidad que aumenta la Velocidad con sol intenso', a: 'Clorofila', prefix: 'Empieza por C' },
    { q: 'Compañero de Ash en la región de Kalos, líder del gimnasio de Ciudad Luminalia', a: 'Clemont', prefix: 'Empieza por C' },
  ],
  'D': [
    { q: 'Pokémon dragón/volador, evolución final de Dratini', a: 'Dragonite', prefix: 'Empieza por D' },
    { q: 'Pokémon topo que vive bajo tierra, del que solo se ve la parte superior', a: 'Diglett', prefix: 'Empieza por D' },
    { q: 'Pokémon legendario que cambia entre formas Normal, Ataque, Defensa y Velocidad', a: 'Deoxys', prefix: 'Empieza por D' },
    { q: 'Estadística que reduce el daño recibido por ataques físicos', a: 'Defensa', prefix: 'Empieza por D' },
    { q: 'Dimensión alternativa donde habita Giratina', a: 'Mundo Distorsión', prefix: 'Empieza por D' },
    { q: 'Pokémon capaz de transformarse en cualquier otro Pokémon', a: 'Ditto', prefix: 'Empieza por D' },
    { q: 'Movimiento que intensifica el sol durante varios turnos, potenciando los ataques de fuego', a: 'Día Soleado', prefix: 'Empieza por D' },
    { q: 'Madre de Ash Ketchum en el anime', a: 'Delia Ketchum', prefix: 'Empieza por D' },
  ],
  'E': [
    { q: 'Pokémon normal famoso por sus múltiples evoluciones posibles', a: 'Eevee', prefix: 'Empieza por E' },
    { q: 'Evolución psíquica de Eevee que se obtiene subiendo el nivel de amistad de día', a: 'Espeon', prefix: 'Empieza por E' },
    { q: 'Uno de los tres perros legendarios de Johto, de tipo fuego', a: 'Entei', prefix: 'Empieza por E' },
    { q: 'Tipo de Pokémon débil frente al tipo tierra', a: 'Eléctrico', prefix: 'Empieza por E' },
    { q: 'Organización villana recurrente en los juegos y el anime', a: 'Equipo Rocket', prefix: 'Empieza por E' },
    { q: 'Pokémon eléctrico con forma de esfera, evolución de Voltorb', a: 'Electrode', prefix: 'Empieza por E' },
    { q: 'Versión de la tercera generación junto a Rubí y Zafiro', a: 'Pokémon Esmeralda', prefix: 'Empieza por E' },
    { q: 'Habilidad de los iniciales de tipo planta que potencia sus movimientos con pocos PS', a: 'Espesura', prefix: 'Empieza por E' },
  ],
  'F': [
    { q: 'Pokémon pato que siempre lleva un puerro consigo', a: 'Farfetch\'d', prefix: 'Empieza por F' },
    { q: 'Tipo de Pokémon fuerte contra planta, hielo y bicho', a: 'Fuego', prefix: 'Empieza por F' },
    { q: 'Movimiento capaz de derrotar al objetivo de un solo golpe si acierta', a: 'Fisura', prefix: 'Empieza por F' },
    { q: 'Pokémon acero/planta con forma de semilla erizada de espinas', a: 'Ferrothorn', prefix: 'Empieza por F' },
    { q: 'Evolución de tipo fuego de Eevee', a: 'Flareon', prefix: 'Empieza por F' },
    { q: 'Pokémon ave normal/volador, evolución de Spearow', a: 'Fearow', prefix: 'Empieza por F' },
    { q: 'Líder del gimnasio de Ciudad Trigal, especialista en tipo volador, en Johto', a: 'Falkner', prefix: 'Empieza por F' },
    { q: 'Movimiento de tipo fuego que quema al rival sin causar daño directo inicial', a: 'Fuego Fatuo', prefix: 'Empieza por F' },
  ],
  'G': [
    { q: 'Pokémon fantasma/veneno, evolución final de Gastly', a: 'Gengar', prefix: 'Empieza por G' },
    { q: 'Pokémon legendario que habita en el Mundo Distorsión', a: 'Giratina', prefix: 'Empieza por G' },
    { q: 'Habilidad que potencia los movimientos de tipo acero', a: 'Garra Metal', prefix: 'Empieza por G' },
    { q: 'Instalación donde se combate contra un líder para conseguir una medalla', a: 'Gimnasio', prefix: 'Empieza por G' },
    { q: 'Rival del protagonista y nieto del Profesor Oak en los primeros juegos', a: 'Gary Oak', prefix: 'Empieza por G' },
    { q: 'Pokémon agua/volador conocido por su temperamento agresivo, evolución de Magikarp', a: 'Gyarados', prefix: 'Empieza por G' },
    { q: 'Región de Pokémon Espada y Escudo, inspirada en Reino Unido', a: 'Galar', prefix: 'Empieza por G' },
    { q: 'Movimiento que golpea y hace recuperar la posición para atacar de nuevo con más velocidad', a: 'Giro Rápido', prefix: 'Empieza por G' },
  ],
  'H': [
    { q: 'Pokémon fantasma, evolución intermedia entre Gastly y Gengar', a: 'Haunter', prefix: 'Empieza por H' },
    { q: 'Movimiento de tipo agua muy potente pero de precisión reducida', a: 'Hidrobomba', prefix: 'Empieza por H' },
    { q: 'Región donde se desarrollan Pokémon Rubí y Zafiro', a: 'Hoenn', prefix: 'Empieza por H' },
    { q: 'Tipo de Pokémon eficaz contra dragón, volador y planta', a: 'Hielo', prefix: 'Empieza por H' },
    { q: 'Pokémon lucha conocido por sus poderosas patadas', a: 'Hitmonlee', prefix: 'Empieza por H' },
    { q: 'Pokémon bicho/lucha con forma de escarabajo y grandes cuernos', a: 'Heracross', prefix: 'Empieza por H' },
    { q: 'Rival del protagonista en la región de Galar', a: 'Hop', prefix: 'Empieza por H' },
    { q: 'Movimiento normal que causa un daño enorme pero obliga a recargar el turno siguiente', a: 'Hiperrayo', prefix: 'Empieza por H' },
  ],
  'I': [
    { q: 'Evolución intermedia de Bulbasaur', a: 'Ivysaur', prefix: 'Empieza por I' },
    { q: 'Localización de Kanto construida sobre un volcán, con gimnasio de tipo fuego', a: 'Isla Canela', prefix: 'Empieza por I' },
    { q: 'Pokémon inicial de fuego/lucha de Sinnoh, evolución final de Chimchar', a: 'Infernape', prefix: 'Empieza por I' },
    { q: 'Habilidad que reduce el ataque de los rivales al entrar en combate', a: 'Intimidación', prefix: 'Empieza por I' },
    { q: 'Campeona de la Liga Pokémon de Teselia en el anime', a: 'Iris', prefix: 'Empieza por I' },
    { q: 'Pokémon normal rosa, preevolución de Jigglypuff', a: 'Igglybuff', prefix: 'Empieza por I' },
    { q: 'Objeto que se da a llevar a un Pokémon para facilitar la eclosión de huevos', a: 'Incienso', prefix: 'Empieza por I' },
    { q: 'Movimiento eléctrico básico, uno de los primeros que aprende Pikachu', a: 'Impactrueno', prefix: 'Empieza por I' },
  ],
  'J': [
    { q: 'Pokémon globo rosa que canta para dormir a sus oponentes', a: 'Jigglypuff', prefix: 'Empieza por J' },
    { q: 'Región donde se desarrollan Pokémon Oro y Plata', a: 'Johto', prefix: 'Empieza por J' },
    { q: 'Pokémon humanoide psíquico/hielo con aspecto de payaso', a: 'Jynx', prefix: 'Empieza por J' },
    { q: 'Miembro del Equipo Rocket que acompaña a Jessie y Meowth en el anime', a: 'James', prefix: 'Empieza por J' },
    { q: 'Evolución eléctrica de Eevee', a: 'Jolteon', prefix: 'Empieza por J' },
    { q: 'Pokémon mítico acero/psíquico con forma de estrella que concede deseos', a: 'Jirachi', prefix: 'Empieza por J' },
    { q: 'Miembro femenino del Equipo Rocket que acompaña a James y Meowth', a: 'Jessie', prefix: 'Empieza por J' },
    { q: 'Nombre con el que se conoce al juego de mesa coleccionable basado en cartas Pokémon', a: 'Juego de Cartas Coleccionables Pokémon', prefix: 'Empieza por J' },
  ],
  'K': [
    { q: 'Primera región de la saga principal de Pokémon', a: 'Kanto', prefix: 'Empieza por K' },
    { q: 'Pokémon legendario de tipo agua asociado a los mares, de Pokémon Zafiro', a: 'Kyogre', prefix: 'Empieza por K' },
    { q: 'Pokémon veneno con forma de bola gaseosa flotante', a: 'Koffing', prefix: 'Empieza por K' },
    { q: 'Siglas que indican que un Pokémon se ha quedado fuera de combate', a: 'K.O.', prefix: 'Empieza por K' },
    { q: 'Pokémon legendario dragón/hielo de la región de Teselia', a: 'Kyurem', prefix: 'Empieza por K' },
    { q: 'Evolución de Abra que se obtiene subiendo de nivel', a: 'Kadabra', prefix: 'Empieza por K' },
    { q: 'Pokémon fósil roca/agua con forma de cangrejo antiguo', a: 'Kabuto', prefix: 'Empieza por K' },
    { q: 'Pokémon acero/hada con forma de manojo de llaves, originario de Kalos', a: 'Klefki', prefix: 'Empieza por K' },
  ],
  'L': [
    { q: 'Pokémon lucha/acero capaz de percibir el aura de los seres vivos', a: 'Lucario', prefix: 'Empieza por L' },
    { q: 'Torneo final que deben superar los entrenadores tras conseguir todas las medallas', a: 'Liga Pokémon', prefix: 'Empieza por L' },
    { q: 'Pokémon legendario dragón/psíquico de Hoenn, hermano de Latias', a: 'Latios', prefix: 'Empieza por L' },
    { q: 'Movimiento de tipo fuego que puede provocar quemadura al rival', a: 'Lanzallamas', prefix: 'Empieza por L' },
    { q: 'Pueblo de Kanto famoso por su torre dedicada a los Pokémon fallecidos', a: 'Pueblo Lavanda', prefix: 'Empieza por L' },
    { q: 'Pokémon legendario dragón/psíquico de Hoenn, hermana de Latios', a: 'Latias', prefix: 'Empieza por L' },
    { q: 'Ciudad de Kalos con gimnasio de tipo eléctrico, liderado por Clemont', a: 'Ciudad Luminalia', prefix: 'Empieza por L' },
    { q: 'Habilidad que hace inmune a un Pokémon a los movimientos de tipo tierra', a: 'Levitación', prefix: 'Empieza por L' },
  ],
  'M': [
    { q: 'Pokémon legendario creado artificialmente a partir del ADN de Mew', a: 'Mewtwo', prefix: 'Empieza por M' },
    { q: 'Pokémon normal capaz de hablar en el anime, miembro del Equipo Rocket', a: 'Meowth', prefix: 'Empieza por M' },
    { q: 'Objeto que enseña un movimiento a un Pokémon de forma permanente', a: 'Máquina Técnica', prefix: 'Empieza por M' },
    { q: 'Líder del gimnasio de Ciudad Celeste, especialista en tipo agua', a: 'Misty', prefix: 'Empieza por M' },
    { q: 'Saga de spin-offs donde los Pokémon exploran mazmorras', a: 'Mundo Misterioso', prefix: 'Empieza por M' },
    { q: 'Pokémon mítico psíquico del que se dice que contiene el ADN de todos los Pokémon', a: 'Mew', prefix: 'Empieza por M' },
    { q: 'Ciudad de Kalos con gimnasio de tipo hada, liderado por Valerie', a: 'Ciudad Malva', prefix: 'Empieza por M' },
    { q: 'Movimiento normal básico que puede hacer retroceder al rival del miedo', a: 'Mordisco', prefix: 'Empieza por M' },
  ],
  'N': [
    { q: 'Pokémon zorro de nueve colas, evolución de Vulpix', a: 'Ninetales', prefix: 'Empieza por N' },
    { q: 'Característica que influye en el crecimiento de las estadísticas de un Pokémon', a: 'Naturaleza', prefix: 'Empieza por N' },
    { q: 'Pokémon veneno/tierra, evolución final de Nidoran macho', a: 'Nidoking', prefix: 'Empieza por N' },
    { q: 'Lugar donde nace Mewtwo en la primera película del anime', a: 'Nueva Isla', prefix: 'Empieza por N' },
    { q: 'Compañía que, junto a Game Freak, creó la franquicia Pokémon', a: 'Nintendo', prefix: 'Empieza por N' },
    { q: 'Pokémon normal/volador, evolución de Hoothoot', a: 'Noctowl', prefix: 'Empieza por N' },
    { q: 'Tipo de Pokémon sin debilidades destacadas, débil solo frente a lucha', a: 'Normal', prefix: 'Empieza por N' },
    { q: 'Movimiento de tipo hielo que reduce la precisión de los ataques del rival', a: 'Niebla', prefix: 'Empieza por N' },
  ],
  'Ñ': [
    { q: 'Movimiento de tipo fuego que golpea con un puño ardiente', a: 'Puño Fuego', prefix: 'Contiene la Ñ' },
    { q: 'Movimiento de tipo hielo que golpea con un puño congelado', a: 'Puño Hielo', prefix: 'Contiene la Ñ' },
    { q: 'Movimiento de tipo eléctrico que golpea con un puño cargado de electricidad', a: 'Puño Trueno', prefix: 'Contiene la Ñ' },
    { q: 'Movimiento de tipo siniestro que golpea con un puño envuelto en energía oscura', a: 'Puño Sombra', prefix: 'Contiene la Ñ' },
    { q: 'Función de los juegos Let\'s Go en la que un Pokémon te sigue fuera de su Poké Ball', a: 'Pokémon Compañero', prefix: 'Contiene la Ñ' },
    { q: 'Meseta de Kanto donde se celebra la Liga Pokémon', a: 'Meseta Añil', prefix: 'Contiene la Ñ' },
    { q: 'Movimiento planta que sume al rival en un sueño profundo', a: 'Polvo Sueño', prefix: 'Contiene la Ñ' },
    { q: 'Categoría de Pokédex de Shuppet, relacionada con un juguete abandonado', a: 'Pokémon Muñeco', prefix: 'Contiene la Ñ' },
  ],
  'O': [
    { q: 'Pokémon planta/veneno con forma de raíz que camina de noche', a: 'Oddish', prefix: 'Empieza por O' },
    { q: 'Pokémon roca/tierra con forma de serpiente de piedra', a: 'Onix', prefix: 'Empieza por O' },
    { q: 'Científico que entrega el primer Pokémon a los protagonistas en Kanto', a: 'Profesor Oak', prefix: 'Empieza por O' },
    { q: 'Pokémon agua con forma de pulpo que dispara tinta', a: 'Octillery', prefix: 'Empieza por O' },
    { q: 'Pokémon fósil de tipo agua/roca, uno de los más antiguos de Kanto', a: 'Omanyte', prefix: 'Empieza por O' },
    { q: 'Evolución del Pokémon fósil Omanyte', a: 'Omastar', prefix: 'Empieza por O' },
    { q: 'Ciudad de Johto con gimnasio de tipo acero, liderado por Jasmine', a: 'Ciudad Olivo', prefix: 'Empieza por O' },
    { q: 'Habilidad que aumenta la probabilidad de golpe crítico', a: 'Ojo Compuesto', prefix: 'Empieza por O' },
  ],
  'P': [
    { q: 'Pokémon eléctrico, mascota oficial de la franquicia y compañero de Ash', a: 'Pikachu', prefix: 'Empieza por P' },
    { q: 'Tipo de Pokémon eficaz contra lucha y veneno', a: 'Psíquico', prefix: 'Empieza por P' },
    { q: 'Dispositivo electrónico que registra información sobre los Pokémon', a: 'Pokédex', prefix: 'Empieza por P' },
    { q: 'Objeto usado para evolucionar a Pikachu en Raichu', a: 'Piedra Trueno', prefix: 'Empieza por P' },
    { q: 'Pueblo de origen de Ash Ketchum en la región de Kanto', a: 'Pueblo Paleta', prefix: 'Empieza por P' },
    { q: 'Pokémon normal/volador inicial de aves de Kanto, muy común', a: 'Pidgey', prefix: 'Empieza por P' },
    { q: 'Habilidad que puede transmitir un estado alterado al rival que golpea con contacto', a: 'Presión', prefix: 'Empieza por P' },
    { q: 'Profesor encargado de la Pokédex regional en Sinnoh', a: 'Profesor Rowan', prefix: 'Empieza por P' },
  ],
  'Q': [
    { q: 'Evolución intermedia de Cyndaquil, Pokémon inicial de fuego de Johto', a: 'Quilava', prefix: 'Empieza por Q' },
    { q: 'Pokémon agua/tierra de expresión relajada, evolución de Wooper', a: 'Quagsire', prefix: 'Empieza por Q' },
    { q: 'Pokémon inicial de agua/lucha de Paldea, evolución final de Quaxly', a: 'Quaquaval', prefix: 'Empieza por Q' },
    { q: 'Estado alterado provocado por movimientos como Lanzallamas', a: 'Quemadura', prefix: 'Empieza por Q' },
    { q: 'Frase con la que el anime invita a adivinar la silueta de un Pokémon', a: '"¿Quién es ese Pokémon?"', prefix: 'Empieza por Q' },
    { q: 'Pokémon veneno/agua con forma de pez globo cubierto de púas', a: 'Qwilfish', prefix: 'Empieza por Q' },
    { q: 'Pokémon inicial de agua de Paldea, preevolución de Quaquaval', a: 'Quaxly', prefix: 'Empieza por Q' },
    { q: 'Movimiento de tipo lucha que permite romper rocas para abrir caminos', a: 'Quiebrarrocas', prefix: 'Empieza por Q' },
  ],
  'R': [
    { q: 'Evolución de Pikachu mediante la Piedra Trueno', a: 'Raichu', prefix: 'Empieza por R' },
    { q: 'Término que designa cada una de las zonas geográficas de los juegos', a: 'Región', prefix: 'Empieza por R' },
    { q: 'Pokémon legendario dragón/volador de Hoenn, mediador de Kyogre y Groudon', a: 'Rayquaza', prefix: 'Empieza por R' },
    { q: 'Pokémon lucha, preevolución de Lucario', a: 'Riolu', prefix: 'Empieza por R' },
    { q: 'Tipo de Pokémon débil frente a agua, planta, lucha, tierra y acero', a: 'Roca', prefix: 'Empieza por R' },
    { q: 'Pokémon normal, uno de los más comunes y débiles de Kanto', a: 'Rattata', prefix: 'Empieza por R' },
    { q: 'Yacimiento arqueológico de Johto donde habitan los Pokémon Unown', a: 'Ruinas Alfa', prefix: 'Empieza por R' },
    { q: 'Líder de gimnasio de tipo roca de Ciudad Petalburgo, en Hoenn', a: 'Roxanne', prefix: 'Empieza por R' },
  ],
  'S': [
    { q: 'Pokémon inicial de tipo agua de la región de Kanto', a: 'Squirtle', prefix: 'Empieza por S' },
    { q: 'Región donde se desarrollan Pokémon Diamante y Perla', a: 'Sinnoh', prefix: 'Empieza por S' },
    { q: 'Pokémon normal de gran tamaño, conocido por dormir y bloquear caminos', a: 'Snorlax', prefix: 'Empieza por S' },
    { q: 'Habilidad que iguala el estado alterado sufrido por el rival', a: 'Sincronía', prefix: 'Empieza por S' },
    { q: 'Pokémon dragón/volador, evolución final de Bagon', a: 'Salamence', prefix: 'Empieza por S' },
    { q: 'Pokémon agua/psíquico despistado y lento, muy conocido en Kanto', a: 'Slowpoke', prefix: 'Empieza por S' },
    { q: 'Habilidad que intensifica el sol nada más entrar en combate', a: 'Sequía', prefix: 'Empieza por S' },
    { q: 'Movimiento de tipo lucha muy potente que reduce el ataque y la defensa de quien lo usa', a: 'Superpoder', prefix: 'Empieza por S' },
  ],
  'T': [
    { q: 'Pokémon inicial de planta/tierra de Sinnoh, evolución final de Turtwig', a: 'Torterra', prefix: 'Empieza por T' },
    { q: 'Región de Pokémon Negro y Blanco', a: 'Teselia', prefix: 'Empieza por T' },
    { q: 'Clasificación elemental de los Pokémon y sus movimientos', a: 'Tipo', prefix: 'Empieza por T' },
    { q: 'Movimiento eléctrico potente que puede paralizar al rival', a: 'Trueno', prefix: 'Empieza por T' },
    { q: 'Pokémon fuego con forma de tortuga que expulsa humo por el caparazón', a: 'Torkoal', prefix: 'Empieza por T' },
    { q: 'Pokémon siniestro/roca temido por su enorme poder de ataque', a: 'Tyranitar', prefix: 'Empieza por T' },
    { q: 'Compañero de Ash en las Islas Naranja, aficionado a dibujar Pokémon', a: 'Tracey', prefix: 'Empieza por T' },
    { q: 'Movimiento tierra devastador que afecta a todos los Pokémon en combate', a: 'Terremoto', prefix: 'Empieza por T' },
  ],
  'U': [
    { q: 'Evolución siniestra de Eevee, obtenida de noche con alta amistad', a: 'Umbreon', prefix: 'Empieza por U' },
    { q: 'Nombre en inglés de la región de Pokémon Negro y Blanco', a: 'Unova', prefix: 'Empieza por U' },
    { q: 'Poké Ball de gama alta con mayor probabilidad de captura', a: 'Ultra Ball', prefix: 'Empieza por U' },
    { q: 'Pokémon psíquico cuya forma recuerda a las letras del alfabeto', a: 'Unown', prefix: 'Empieza por U' },
    { q: 'Forma definitiva de Necrozma tras fusionarse con Solgaleo o Lunala', a: 'Ultra Necrozma', prefix: 'Empieza por U' },
    { q: 'Pokémon normal, evolución de Teddiursa con forma de oso', a: 'Ursaring', prefix: 'Empieza por U' },
    { q: 'Videojuegos de séptima generación centrados en Alola con historia ampliada', a: 'Pokémon Ultrasol y Ultraluna', prefix: 'Empieza por U' },
    { q: 'Clase de criaturas de otra dimensión introducidas en Pokémon Sol y Luna', a: 'Ultraente', prefix: 'Empieza por U' },
  ],
  'V': [
    { q: 'Pokémon fuego con forma de zorro de seis colas', a: 'Vulpix', prefix: 'Empieza por V' },
    { q: 'Tipo de Pokémon eficaz contra planta y hada', a: 'Veneno', prefix: 'Empieza por V' },
    { q: 'Evolución final de Bulbasaur', a: 'Venusaur', prefix: 'Empieza por V' },
    { q: 'Pokémon mítico de tipo fuego/psíquico asociado a la victoria', a: 'Victini', prefix: 'Empieza por V' },
    { q: 'Pokémon eléctrico con forma de Poké Ball', a: 'Voltorb', prefix: 'Empieza por V' },
    { q: 'Evolución acuática de Eevee', a: 'Vaporeon', prefix: 'Empieza por V' },
    { q: 'Líder de gimnasio de tipo hada de Ciudad Malva, en Kalos', a: 'Valerie', prefix: 'Empieza por V' },
    { q: 'Estadística que determina el orden de actuación de los Pokémon en combate', a: 'Velocidad', prefix: 'Empieza por V' },
  ],
  'W': [
    { q: 'Pokémon agua/tierra, preevolución de Quagsire', a: 'Wooper', prefix: 'Empieza por W' },
    { q: 'Pokémon psíquico con forma de saco de boxeo, compañero de Jessie en el anime', a: 'Wobbuffet', prefix: 'Empieza por W' },
    { q: 'Pokémon hada/planta con aspecto de algodón, evolución de Cottonee', a: 'Whimsicott', prefix: 'Empieza por W' },
    { q: 'Pokémon agua con forma de ballena, uno de los más grandes de todos', a: 'Wailord', prefix: 'Empieza por W' },
    { q: 'Pokémon bicho/veneno con forma de oruga de Kanto', a: 'Weedle', prefix: 'Empieza por W' },
    { q: 'Evolución intermedia de Squirtle', a: 'Wartortle', prefix: 'Empieza por W' },
    { q: 'Pokémon siniestro/hielo, evolución de Sneasel con garras afiladas', a: 'Weavile', prefix: 'Empieza por W' },
    { q: 'Pokémon agua/volador con forma de gaviota, común en Hoenn', a: 'Wingull', prefix: 'Empieza por W' },
  ],
  'X': [
    { q: 'Una de las dos versiones de la sexta generación, junto a Pokémon Y', a: 'Pokémon X', prefix: 'Empieza por X' },
    { q: 'Pokémon psíquico/volador que se dice que puede ver el pasado y el futuro', a: 'Xatu', prefix: 'Empieza por X' },
    { q: 'Pokémon legendario de tipo hada asociado a la vida eterna', a: 'Xerneas', prefix: 'Empieza por X' },
    { q: 'Pokémon eléctrico con forma de árbol, un Ultraente', a: 'Xurkitree', prefix: 'Empieza por X' },
    { q: 'Movimiento que causa gran daño pero deja fuera de combate a quien lo usa', a: 'Explosión', prefix: 'Contiene la X' },
    { q: 'Objeto que permite a Charizard megaevolucionar en su forma de tipo fuego/dragón', a: 'Charizardita X', prefix: 'Contiene la X' },
    { q: 'Movimiento de tipo tierra en el que el Pokémon se esconde bajo tierra un turno para atacar al siguiente', a: 'Excavar', prefix: 'Contiene la X' },
    { q: 'Pequeño Pokémon dragón de Teselia con colmillos afilados, preevolución de Fraxure', a: 'Axew', prefix: 'Contiene la X' },
  ],
  'Y': [
    { q: 'Pokémon legendario siniestro/volador asociado a la destrucción, de Pokémon Y', a: 'Yveltal', prefix: 'Empieza por Y' },
    { q: 'Pokémon fantasma/tierra que lleva puesta una máscara con su antiguo rostro', a: 'Yamask', prefix: 'Empieza por Y' },
    { q: 'Versión de la sexta generación complementaria a Pokémon X', a: 'Pokémon Y', prefix: 'Empieza por Y' },
    { q: 'Pokémon bicho/volador con forma de libélula', a: 'Yanma', prefix: 'Empieza por Y' },
    { q: 'Pokémon eléctrico con forma de perrito corgi, de la región de Galar', a: 'Yamper', prefix: 'Empieza por Y' },
    { q: 'Pokémon normal, mangosta de Alola que combate contra Pokémon veneno', a: 'Yungoos', prefix: 'Empieza por Y' },
    { q: 'Evolución de Yanma, Pokémon bicho/volador', a: 'Yanmega', prefix: 'Empieza por Y' },
    { q: 'Sistema de comunicación de Pokémon Sol y Luna usado para el Intercambio Misterioso y combates online', a: 'Y-Com', prefix: 'Empieza por Y' },
  ],
  'Z': [
    { q: 'Pokémon veneno/volador que habita en cuevas', a: 'Zubat', prefix: 'Empieza por Z' },
    { q: 'Pokémon siniestro capaz de crear ilusiones', a: 'Zoroark', prefix: 'Empieza por Z' },
    { q: 'Uno de los tres pájaros legendarios de Kanto, de tipo eléctrico/volador', a: 'Zapdos', prefix: 'Empieza por Z' },
    { q: 'Pokémon legendario dragón/tierra que puede cambiar de forma, de Pokémon X/Y', a: 'Zygarde', prefix: 'Empieza por Z' },
    { q: 'Una de las versiones de la tercera generación, junto a Pokémon Rubí', a: 'Pokémon Zafiro', prefix: 'Empieza por Z' },
    { q: 'Pokémon legendario dragón/eléctrico de Teselia, protagonista de Pokémon Negro', a: 'Zekrom', prefix: 'Empieza por Z' },
    { q: 'Pokémon normal con garras afiladas, rival natural de Seviper', a: 'Zangoose', prefix: 'Empieza por Z' },
    { q: 'Movimiento devastador de un solo uso por combate, introducido en Pokémon Sol y Luna', a: 'Movimiento Z', prefix: 'Empieza por Z' },
  ],
};

// Nº de partidas que se recuerdan para no repetir preguntas: una vez que
// una pregunta sale en una partida, no puede volver a salir hasta que
// hayan pasado (como mínimo) estas partidas (ver pickPasapalabraQuestions).
const PASAPALABRA_HISTORY_MAX_GAMES = 10;
const PASAPALABRA_HISTORY_STORAGE_KEY = 'pk_pasapalabra_question_history_v1';

// Identificador estable de una pregunta del banco: pregunta+respuesta (no
// solo la respuesta, por si algún día dos preguntas de la misma letra
// compartieran la misma respuesta).
function pasapalabraQuestionKey(entry) {
  return entry.q + '|' + entry.a;
}

// Historial persistido en localStorage (mismo patrón que
// BOSS_PROGRESS_STORAGE_KEY en boss.js, para que sobreviva a recargas de
// página o reinicios del navegador de OBS, no solo dentro de una sesión):
// un array de hasta PASAPALABRA_HISTORY_MAX_GAMES partidas, cada una un
// objeto letra -> identificador (ver pasapalabraQuestionKey) de la
// pregunta que salió esa partida para esa letra. Se usa en
// pickPasapalabraQuestions para no repetir preguntas demasiado pronto.
function loadPasapalabraHistory() {
  try {
    const raw = localStorage.getItem(PASAPALABRA_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return []; // localStorage puede no estar disponible (p.ej. en algunos navegadores embebidos)
  }
}

function savePasapalabraHistory(history) {
  try {
    localStorage.setItem(PASAPALABRA_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    // localStorage puede no estar disponible: sin persistencia entre sesiones, pero el modo sigue funcionando
  }
}

// Elige aleatoriamente una pregunta de la batería para cada letra (nueva
// combinación cada partida), descartando las que ya hayan salido en las
// últimas PASAPALABRA_HISTORY_MAX_GAMES partidas (ver
// loadPasapalabraHistory/savePasapalabraHistory más arriba) para esa misma
// letra. Si la exclusión dejara la pool de alguna letra sin ninguna
// pregunta disponible (pools pequeñas tras muchas partidas seguidas), se
// ignora el historial solo para esa letra y se elige de la pool completa,
// para no dejar nunca el modo sin pregunta.
export function pickPasapalabraQuestions() {
  const recentGames = loadPasapalabraHistory().slice(-PASAPALABRA_HISTORY_MAX_GAMES);
  const result = {};
  const thisGamePicks = {};
  Object.keys(PASAPALABRA_QUESTIONS_DEFAULT).forEach(letter => {
    const pool = PASAPALABRA_QUESTION_BANK[letter];
    if (pool && pool.length) {
      const usedKeys = new Set(recentGames.map(g => g[letter]).filter(Boolean));
      let available = pool.filter(entry => !usedKeys.has(pasapalabraQuestionKey(entry)));
      if (!available.length) available = pool;
      const pick = available[Math.floor(Math.random() * available.length)];
      result[letter] = { q: pick.q, a: pick.a, prefix: pick.prefix };
      thisGamePicks[letter] = pasapalabraQuestionKey(pick);
    } else {
      result[letter] = PASAPALABRA_QUESTIONS_DEFAULT[letter];
    }
  });
  savePasapalabraHistory([...recentGames, thisGamePicks].slice(-PASAPALABRA_HISTORY_MAX_GAMES));
  return result;
}

const PASAPALABRA_QUESTIONS_DEFAULT = {
  'A': { q: 'Pokémon inicial de tipo Planta en la región de Kanto', a: 'bulbasaur' },
  'B': { q: 'Evolución final de Charmander', a: 'charizard' },
  'C': { q: 'Pokémon ratón eléctrico, mascota de Ash', a: 'pikachu' },
  'D': { q: 'Pokémon legendario dragón de Kanto (rojo)', a: 'charizard' },
  'E': { q: 'Pokémon que puede evolucionar en múltiples formas', a: 'eevee' },
  'F': { q: 'Tipo de Pokémon como Charmander o Flareon', a: 'fuego' },
  'G': { q: 'Pokémon fantasma/veneno, evolución de Haunter', a: 'gengar' },
  'H': { q: 'Pokémon agua con concha, evolución de Wartortle', a: 'blastoise' },
  'I': { q: 'Región donde ocurre Pokémon Oro y Plata', a: 'johto' },
  'J': { q: 'Nombre del rival de Ash en Kanto (iniciales)', a: 'gary' },
  'K': { q: 'Nombre del protagonista de Pokémon en japonés', a: 'satoshi' },
  'L': { q: 'Pokémon legendario eléctrico de la 1ra generación', a: 'zapdos' },
  'M': { q: 'Pokémon psíquico legendario creado genéticamente', a: 'mewtwo' },
  'N': { q: 'Nombre del mundo de los Pokémon (continente)', a: 'kanto' },
  'Ñ': { q: 'Objeto que evoluciona a Pokémon (ej: Magmar)', a: 'niño' },
  'O': { q: 'Objeto que cura todos los PS de un Pokémon', a: 'orbearroz' },
  'P': { q: 'Criaturas del juego, abreviatura del nombre', a: 'pokemon' },
  'Q': { q: 'Equipo rival liderado por Giovanni', a: 'quimera' },
  'R': { q: 'Habilidad especial de los Pokémon en combate', a: 'rapidez' },
  'S': { q: 'Pokémon durmiente gigante que come mucho', a: 'snorlax' },
  'T': { q: 'Dispositivo para identificar Pokémon', a: 'pokedex' },
  'U': { q: 'Ataque legendario que usa Mewtwo', a: 'ultrabajón' },
  'V': { q: 'Pokémon tortuga inicial de Kanto', a: 'squirtle' },
  'W': { q: 'Jefe del Team Rocket (nombre en inglés)', a: 'giovanni' },
  'X': { q: 'Pokémon artificial tipo normal de la 1ra gen', a: 'porygon' },
  'Y': { q: 'Pokémon legendario pájaro de fuego', a: 'moltres' },
  'Z': { q: 'Pokémon serpiente venenosa, evoluciona de Ekans', a: 'arbok' },
};

// El modo Boss cooperativo ya no usa una lista propia de jefes especiales:
// el jefe se elige al azar de la misma Pokédex Nacional que el Coliseo del
// modo Arena (ver ARENA_POKEMON_DB en data/arenaPokemonDb.js), como un
// Pokémon normal más.
