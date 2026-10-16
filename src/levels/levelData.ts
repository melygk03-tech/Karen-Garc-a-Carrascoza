import { LevelData } from '../types/game';

export const LEVELS: LevelData[] = [
  // -------------------------------------------------------------
  // NIVEL 1: TUTORIAL
  // -------------------------------------------------------------
  {
    id: 1,
    title: 'Nivel 1: Primeros Aleteos',
    subtitle: 'Aprende los movimientos básicos',
    description: 'Rueda y salta en los corales iniciales sin peligro.',
    width: 1400,
    height: 700,
    playerStart: { x: 100, y: 500 },
    tutorialText: 'Usa A / D o Flechas para rodar. Espacio o W para saltar.',
    hint: 'Recolecta todas las perlas brillantes para conseguir la puntuación perfecta.',
    platforms: [
      { x: 0, y: 580, w: 450, h: 120, type: 'solid' },
      { x: 520, y: 540, w: 320, h: 160, type: 'solid' },
      { x: 920, y: 480, w: 480, h: 220, type: 'solid' },
      { x: 380, y: 440, w: 100, h: 25, type: 'solid' },
      { x: 780, y: 380, w: 110, h: 25, type: 'solid' },
      { x: -50, y: 0, w: 50, h: 700, type: 'solid' },
      { x: 1400, y: 0, w: 50, h: 700, type: 'solid' }
    ],
    enemies: [],
    pearls: [
      { id: '1-1', x: 260, y: 530, radius: 12, collected: false, floatOffset: 0 },
      { id: '1-2', x: 430, y: 390, radius: 12, collected: false, floatOffset: 1 },
      { id: '1-3', x: 640, y: 490, radius: 12, collected: false, floatOffset: 2 },
      { id: '1-4', x: 835, y: 330, radius: 12, collected: false, floatOffset: 3 },
      { id: '1-5', x: 1080, y: 430, radius: 12, collected: false, floatOffset: 4 }
    ],
    trampolines: [],
    currents: [],
    shields: [],
    goal: { x: 1260, y: 416, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 2: INTRODUCCIÓN A PELIGROS
  // -------------------------------------------------------------
  {
    id: 2,
    title: 'Nivel 2: El Arrecife Espinoso',
    subtitle: 'Cuidado con los erizos negros',
    description: 'Aprende a esquivar espinas estáticas y saltar abismos.',
    width: 1700,
    height: 700,
    playerStart: { x: 100, y: 500 },
    tutorialText: '¡Cuidado con los erizos! Sus púas afiladas te quitarán un corazón.',
    hint: '¡Recoge la Burbuja de Escudo para absorber un impacto enemigo durante 10 segundos!',
    platforms: [
      { x: 0, y: 580, w: 320, h: 120, type: 'solid' },
      { x: 400, y: 560, w: 260, h: 140, type: 'solid' },
      { x: 740, y: 520, w: 280, h: 180, type: 'solid' },
      { x: 1100, y: 480, w: 200, h: 30, type: 'solid' },
      { x: 1380, y: 540, w: 320, h: 160, type: 'solid' },
      { x: 320, y: 670, w: 80, h: 30, type: 'spike' },
      { x: 660, y: 670, w: 80, h: 30, type: 'spike' },
      { x: 1020, y: 670, w: 360, h: 30, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 700, type: 'solid' },
      { x: 1700, y: 0, w: 50, h: 700, type: 'solid' }
    ],
    enemies: [
      { x: 530, y: 538, radius: 18, type: 'static', originX: 530, originY: 538, range: 0, speed: 0, direction: 1, rotation: 0 },
      { x: 880, y: 498, radius: 18, type: 'static', originX: 880, originY: 498, range: 0, speed: 0, direction: 1, rotation: 0 }
    ],
    pearls: [
      { id: '2-1', x: 220, y: 530, radius: 12, collected: false, floatOffset: 0 },
      { id: '2-2', x: 530, y: 450, radius: 12, collected: false, floatOffset: 1 },
      { id: '2-3', x: 800, y: 470, radius: 12, collected: false, floatOffset: 2 },
      { id: '2-4', x: 880, y: 410, radius: 12, collected: false, floatOffset: 3 },
      { id: '2-5', x: 1200, y: 420, radius: 12, collected: false, floatOffset: 4 },
      { id: '2-6', x: 1450, y: 490, radius: 12, collected: false, floatOffset: 5 }
    ],
    shields: [
      { id: 'sh-2-1', x: 360, y: 510, radius: 18, collected: false, floatOffset: 0, durationSeconds: 10 }
    ],
    trampolines: [],
    currents: [],
    goal: { x: 1560, y: 476, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 3: ERIZOS PATRULLEROS
  // -------------------------------------------------------------
  {
    id: 3,
    title: 'Nivel 3: Patrulla de Espinas',
    subtitle: 'Enemigos en movimiento horizontal',
    description: 'Sincroniza tus pasos para evitar las minas patrulleras.',
    width: 1900,
    height: 700,
    playerStart: { x: 80, y: 500 },
    tutorialText: 'Los erizos flotantes patrullan de un lado a otro. Espera el momento justo.',
    hint: 'Aprovecha cuando el erizo se aleja para saltar a su plataforma.',
    platforms: [
      { x: 0, y: 580, w: 260, h: 120, type: 'solid' },
      { x: 340, y: 540, w: 380, h: 160, type: 'solid' },
      { x: 800, y: 490, w: 420, h: 210, type: 'solid' },
      { x: 1300, y: 440, w: 280, h: 30, type: 'solid' },
      { x: 1640, y: 520, w: 260, h: 180, type: 'solid' },
      { x: 260, y: 670, w: 80, h: 30, type: 'spike' },
      { x: 720, y: 670, w: 80, h: 30, type: 'spike' },
      { x: 1220, y: 670, w: 420, h: 30, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 700, type: 'solid' },
      { x: 1900, y: 0, w: 50, h: 700, type: 'solid' }
    ],
    enemies: [
      { x: 530, y: 518, radius: 18, type: 'patrol_h', originX: 530, originY: 518, range: 120, speed: 1.6, direction: 1, rotation: 0 },
      { x: 1010, y: 468, radius: 18, type: 'patrol_h', originX: 1010, originY: 468, range: 140, speed: 2.0, direction: -1, rotation: 0 },
      { x: 1260, y: 350, radius: 18, type: 'patrol_v', originX: 1260, originY: 350, range: 70, speed: 1.4, direction: 1, rotation: 0 }
    ],
    pearls: [
      { id: '3-1', x: 180, y: 530, radius: 12, collected: false, floatOffset: 0 },
      { id: '3-2', x: 410, y: 480, radius: 12, collected: false, floatOffset: 1 },
      { id: '3-3', x: 650, y: 480, radius: 12, collected: false, floatOffset: 2 },
      { id: '3-4', x: 880, y: 430, radius: 12, collected: false, floatOffset: 3 },
      { id: '3-5', x: 1140, y: 430, radius: 12, collected: false, floatOffset: 4 },
      { id: '3-6', x: 1440, y: 380, radius: 12, collected: false, floatOffset: 5 },
      { id: '3-7', x: 1740, y: 460, radius: 12, collected: false, floatOffset: 6 }
    ],
    trampolines: [],
    currents: [],
    shields: [
      { id: 'sh-3-1', x: 740, y: 470, radius: 18, collected: false, floatOffset: 1, durationSeconds: 10 }
    ],
    goal: { x: 1800, y: 456, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 4: PLATAFORMAS MÓVILES
  // -------------------------------------------------------------
  {
    id: 4,
    title: 'Nivel 4: Rocas Flotantes',
    subtitle: 'Navegación sobre plataformas oscilantes',
    description: 'Calcula el balanceo y movimiento de las rocas marinas.',
    width: 2000,
    height: 700,
    playerStart: { x: 80, y: 500 },
    tutorialText: 'Las rocas bioluminiscentes se mueven suavemente. Salta sobre ellas.',
    hint: 'La inercia de la plataforma se transfiere a tu pulpo al saltar.',
    platforms: [
      { x: 0, y: 580, w: 260, h: 120, type: 'solid' },
      { x: 380, y: 520, w: 140, h: 26, type: 'moving', originX: 420, originY: 520, rangeX: 130, rangeY: 0, speed: 1.5, dx: 1, dy: 0 },
      { x: 680, y: 480, w: 160, h: 100, type: 'solid' },
      { x: 960, y: 450, w: 140, h: 26, type: 'moving', originX: 960, originY: 420, rangeX: 0, rangeY: 100, speed: 1.8, dx: 0, dy: 1 },
      { x: 1220, y: 340, w: 200, h: 30, type: 'solid' },
      { x: 1530, y: 420, w: 130, h: 26, type: 'moving', originX: 1530, originY: 420, rangeX: 80, rangeY: 60, speed: 1.6, dx: 1, dy: 1 },
      { x: 1740, y: 500, w: 260, h: 200, type: 'solid' },
      { x: 260, y: 680, w: 1480, h: 20, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 700, type: 'solid' },
      { x: 2000, y: 0, w: 50, h: 700, type: 'solid' }
    ],
    enemies: [
      { x: 760, y: 458, radius: 18, type: 'static', originX: 760, originY: 458, range: 0, speed: 0, direction: 1, rotation: 0 },
      { x: 1320, y: 318, radius: 18, type: 'patrol_h', originX: 1320, originY: 318, range: 45, speed: 1.4, direction: 1, rotation: 0 }
    ],
    pearls: [
      { id: '4-1', x: 180, y: 530, radius: 12, collected: false, floatOffset: 0 },
      { id: '4-2', x: 420, y: 440, radius: 12, collected: false, floatOffset: 1 },
      { id: '4-3', x: 720, y: 420, radius: 12, collected: false, floatOffset: 2 },
      { id: '4-4', x: 960, y: 320, radius: 12, collected: false, floatOffset: 3 },
      { id: '4-5', x: 1250, y: 280, radius: 12, collected: false, floatOffset: 4 },
      { id: '4-6', x: 1530, y: 340, radius: 12, collected: false, floatOffset: 5 },
      { id: '4-7', x: 1840, y: 440, radius: 12, collected: false, floatOffset: 6 }
    ],
    trampolines: [],
    currents: [],
    shields: [
      { id: 'sh-4-1', x: 880, y: 390, radius: 18, collected: false, floatOffset: 2, durationSeconds: 10 }
    ],
    goal: { x: 1880, y: 436, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 5: CORRIENTES Y EL PRIMER TIBURÓN (NEW HAZARD: SHARK)
  // -------------------------------------------------------------
  {
    id: 5,
    title: 'Nivel 5: Acecho del Tiburón',
    subtitle: '¡Cuidado con las mandíbulas y aletas en las corrientes!',
    description: 'Los veloces tiburones patrullan los canales de corriente marina.',
    width: 2300,
    height: 700,
    playerStart: { x: 90, y: 500 },
    tutorialText: '¡ALERTA DE TIBURÓN! Nada con cuidado y cruza cuando miren hacia el otro lado.',
    hint: 'Usa las corrientes marinas para acelerar y escapar de sus filosos dientes.',
    platforms: [
      { x: 0, y: 580, w: 240, h: 120, type: 'solid' },
      { x: 560, y: 540, w: 200, h: 160, type: 'solid' },
      { x: 1040, y: 560, w: 180, h: 140, type: 'solid' },
      { x: 1200, y: 260, w: 260, h: 30, type: 'solid' },
      { x: 1650, y: 420, w: 220, h: 30, type: 'solid' },
      { x: 2000, y: 520, w: 280, h: 180, type: 'solid' },
      { x: 240, y: 680, w: 1760, h: 20, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 700, type: 'solid' },
      { x: 2300, y: 0, w: 50, h: 700, type: 'solid' }
    ],
    enemies: [
      // First aggressive Shark patrolling the horizontal ocean channel!
      {
        x: 400, y: 420, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 400, originY: 420, range: 140, speed: 2.2, direction: 1, rotation: 0,
        name: 'Tiburón de Arrecife'
      },
      // Second Shark patrolling upper current corridor
      {
        x: 1460, y: 230, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 1460, originY: 230, range: 120, speed: 2.5, direction: -1, rotation: 0,
        name: 'Tiburón Veloz'
      },
      { x: 660, y: 518, radius: 18, type: 'static', originX: 660, originY: 518, range: 0, speed: 0, direction: 1, rotation: 0 },
      { x: 1760, y: 398, radius: 18, type: 'static', originX: 1760, originY: 398, range: 0, speed: 0, direction: 1, rotation: 0 }
    ],
    pearls: [
      { id: '5-1', x: 160, y: 530, radius: 12, collected: false, floatOffset: 0 },
      { id: '5-2', x: 400, y: 490, radius: 12, collected: false, floatOffset: 1 },
      { id: '5-3', x: 600, y: 480, radius: 12, collected: false, floatOffset: 2 },
      { id: '5-4', x: 900, y: 500, radius: 12, collected: false, floatOffset: 3 },
      { id: '5-5', x: 1120, y: 360, radius: 12, collected: false, floatOffset: 4 },
      { id: '5-6', x: 1260, y: 200, radius: 12, collected: false, floatOffset: 5 },
      { id: '5-7', x: 1540, y: 280, radius: 12, collected: false, floatOffset: 6 },
      { id: '5-8', x: 1820, y: 360, radius: 12, collected: false, floatOffset: 7 },
      { id: '5-9', x: 2100, y: 460, radius: 12, collected: false, floatOffset: 8 }
    ],
    trampolines: [],
    currents: [
      { x: 240, y: 440, w: 320, h: 180, forceX: 0.65, forceY: -0.05, label: 'Corriente Rápida' },
      { x: 1040, y: 200, w: 160, h: 360, forceX: 0.05, forceY: -0.62, label: 'Géiser Ascendente' },
      { x: 1460, y: 220, w: 220, h: 140, forceX: 0.5, forceY: 0.1, label: 'Corriente' }
    ],
    shields: [
      { id: 'sh-5-1', x: 320, y: 430, radius: 18, collected: false, floatOffset: 1, durationSeconds: 10 },
      { id: 'sh-5-2', x: 1360, y: 220, radius: 18, collected: false, floatOffset: 3, durationSeconds: 10 }
    ],
    goal: { x: 2150, y: 456, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 6: TRAMPOLINES MEDUSA Y CAZADORES
  // -------------------------------------------------------------
  {
    id: 6,
    title: 'Nivel 6: El Jardín de Medusas',
    subtitle: 'Rebotes bioluminiscentes sobre el territorio del tiburón',
    description: 'Salta alto sobre medusas para eludir a los tiburones patrulleros.',
    width: 2300,
    height: 750,
    playerStart: { x: 80, y: 540 },
    tutorialText: 'Usa el impulso de las medusas para saltar muy por encima de los tiburones.',
    hint: 'Un rebote bien sincronizado te llevará volando hasta la cornisa superior.',
    platforms: [
      { x: 0, y: 620, w: 260, h: 130, type: 'solid' },
      { x: 360, y: 620, w: 220, h: 130, type: 'solid' },
      { x: 680, y: 380, w: 240, h: 30, type: 'solid' },
      { x: 1060, y: 520, w: 180, h: 230, type: 'solid' },
      { x: 1360, y: 240, w: 240, h: 30, type: 'solid' },
      { x: 1720, y: 360, w: 140, h: 26, type: 'moving', originX: 1720, originY: 360, rangeX: 90, rangeY: 0, speed: 2.0, dx: 1, dy: 0 },
      { x: 2000, y: 500, w: 280, h: 250, type: 'solid' },
      { x: 260, y: 720, w: 1740, h: 30, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 750, type: 'solid' },
      { x: 2300, y: 0, w: 50, h: 750, type: 'solid' }
    ],
    enemies: [
      // Shark patrolling middle airspace between ledges
      {
        x: 880, y: 460, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 880, originY: 460, range: 120, speed: 2.4, direction: 1, rotation: 0,
        name: 'Tiburón Acechante'
      },
      // Shark patrolling upper platform
      {
        x: 1500, y: 220, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 1500, originY: 220, range: 80, speed: 2.6, direction: -1, rotation: 0,
        name: 'Tiburón Hambriento'
      },
      { x: 800, y: 358, radius: 18, type: 'patrol_h', originX: 800, originY: 358, range: 60, speed: 1.5, direction: 1, rotation: 0 },
      { x: 1280, y: 400, radius: 18, type: 'patrol_v', originX: 1280, originY: 400, range: 90, speed: 1.6, direction: 1, rotation: 0 }
    ],
    trampolines: [
      { x: 440, y: 588, w: 60, h: 32, bounceForce: -14.8, squish: 1 },
      { x: 970, y: 620, w: 60, h: 32, bounceForce: -15.5, squish: 1 },
      { x: 1130, y: 488, w: 60, h: 32, bounceForce: -16.2, squish: 1 }
    ],
    currents: [],
    pearls: [
      { id: '6-1', x: 180, y: 560, radius: 12, collected: false, floatOffset: 0 },
      { id: '6-2', x: 470, y: 420, radius: 12, collected: false, floatOffset: 1 },
      { id: '6-3', x: 500, y: 280, radius: 12, collected: false, floatOffset: 2 },
      { id: '6-4', x: 740, y: 320, radius: 12, collected: false, floatOffset: 3 },
      { id: '6-5', x: 1000, y: 450, radius: 12, collected: false, floatOffset: 4 },
      { id: '6-6', x: 1160, y: 340, radius: 12, collected: false, floatOffset: 5 },
      { id: '6-7', x: 1240, y: 160, radius: 12, collected: false, floatOffset: 6 },
      { id: '6-8', x: 1420, y: 180, radius: 12, collected: false, floatOffset: 7 },
      { id: '6-9', x: 1760, y: 300, radius: 12, collected: false, floatOffset: 8 },
      { id: '6-10', x: 2120, y: 440, radius: 12, collected: false, floatOffset: 9 }
    ],
    shields: [
      { id: 'sh-6-1', x: 700, y: 320, radius: 18, collected: false, floatOffset: 2, durationSeconds: 10 }
    ],
    goal: { x: 2150, y: 436, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 7: AGUJAS DEL ABISMO CON TIBURONES
  // -------------------------------------------------------------
  {
    id: 7,
    title: 'Nivel 7: Agujas del Abismo',
    subtitle: 'Plataformas estrechas y tiburones cruzados',
    description: 'Pisa con precisión milimétrica mientras los tiburones merodean.',
    width: 2400,
    height: 700,
    playerStart: { x: 80, y: 500 },
    tutorialText: 'Las rocas son muy finas. Frena a tiempo para no caer a la boca del tiburón.',
    hint: 'Calcula los giros del tiburón para avanzar de aguja en aguja.',
    platforms: [
      { x: 0, y: 580, w: 200, h: 120, type: 'solid' },
      { x: 290, y: 530, w: 60, h: 170, type: 'solid' },
      { x: 450, y: 470, w: 60, h: 230, type: 'solid' },
      { x: 610, y: 420, w: 65, h: 280, type: 'solid' },
      { x: 780, y: 470, w: 70, h: 230, type: 'solid' },
      { x: 960, y: 520, w: 60, h: 180, type: 'solid' },
      { x: 1140, y: 460, w: 160, h: 240, type: 'solid' },
      { x: 1400, y: 400, w: 65, h: 300, type: 'solid' },
      { x: 1570, y: 360, w: 65, h: 340, type: 'solid' },
      { x: 1740, y: 420, w: 65, h: 280, type: 'solid' },
      { x: 1910, y: 480, w: 65, h: 220, type: 'solid' },
      { x: 2120, y: 520, w: 260, h: 180, type: 'solid' },
      { x: 200, y: 670, w: 1920, h: 30, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 700, type: 'solid' },
      { x: 2400, y: 0, w: 50, h: 700, type: 'solid' }
    ],
    enemies: [
      // Shark patrolling between needle pillars 1-3
      {
        x: 450, y: 350, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 450, originY: 350, range: 130, speed: 2.3, direction: 1, rotation: 0,
        name: 'Tiburón Cazador'
      },
      // Shark patrolling high gap 7-9
      {
        x: 1650, y: 270, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 1650, originY: 270, range: 140, speed: 2.6, direction: -1, rotation: 0,
        name: 'Tiburón Abisal'
      },
      { x: 530, y: 360, radius: 18, type: 'patrol_v', originX: 530, originY: 360, range: 60, speed: 1.8, direction: 1, rotation: 0 },
      { x: 870, y: 380, radius: 18, type: 'patrol_v', originX: 870, originY: 380, range: 70, speed: 2.0, direction: -1, rotation: 0 },
      { x: 1220, y: 438, radius: 18, type: 'patrol_h', originX: 1220, originY: 438, range: 45, speed: 1.5, direction: 1, rotation: 0 }
    ],
    pearls: [
      { id: '7-1', x: 140, y: 530, radius: 12, collected: false, floatOffset: 0 },
      { id: '7-2', x: 320, y: 470, radius: 12, collected: false, floatOffset: 1 },
      { id: '7-3', x: 480, y: 410, radius: 12, collected: false, floatOffset: 2 },
      { id: '7-4', x: 642, y: 360, radius: 12, collected: false, floatOffset: 3 },
      { id: '7-5', x: 815, y: 410, radius: 12, collected: false, floatOffset: 4 },
      { id: '7-6', x: 1432, y: 340, radius: 12, collected: false, floatOffset: 5 },
      { id: '7-7', x: 1602, y: 300, radius: 12, collected: false, floatOffset: 6 },
      { id: '7-8', x: 1942, y: 420, radius: 12, collected: false, floatOffset: 7 }
    ],
    trampolines: [],
    currents: [],
    shields: [
      { id: 'sh-7-1', x: 1180, y: 390, radius: 18, collected: false, floatOffset: 1, durationSeconds: 10 }
    ],
    goal: { x: 2240, y: 456, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 8: CORALES QUEBRADIZOS Y MANDÍBULAS
  // -------------------------------------------------------------
  {
    id: 8,
    title: 'Nivel 8: Corales Quebradizos',
    subtitle: 'El suelo se rompe bajo tus aletas',
    description: 'Los corales caen al pisarlos mientras tiburones patrullan debajo.',
    width: 2400,
    height: 700,
    playerStart: { x: 80, y: 500 },
    tutorialText: '¡Los corales rosados caen rápido! Corre y salta sin dudar.',
    hint: 'Si te detienes en un coral quebradizo, caerás directo al peligro.',
    platforms: [
      { x: 0, y: 580, w: 220, h: 120, type: 'solid' },
      { x: 300, y: 530, w: 90, h: 24, type: 'crumble', maxCrumbleTime: 60, color: '#e879f9' },
      { x: 460, y: 490, w: 90, h: 24, type: 'crumble', maxCrumbleTime: 60, color: '#e879f9' },
      { x: 620, y: 450, w: 90, h: 24, type: 'crumble', maxCrumbleTime: 60, color: '#e879f9' },
      { x: 790, y: 450, w: 140, h: 250, type: 'solid' },
      { x: 1000, y: 420, w: 85, h: 24, type: 'crumble', maxCrumbleTime: 50, color: '#f472b6' },
      { x: 1150, y: 390, w: 85, h: 24, type: 'crumble', maxCrumbleTime: 50, color: '#f472b6' },
      { x: 1300, y: 360, w: 85, h: 24, type: 'crumble', maxCrumbleTime: 50, color: '#f472b6' },
      { x: 1450, y: 340, w: 85, h: 24, type: 'crumble', maxCrumbleTime: 50, color: '#f472b6' },
      { x: 1610, y: 380, w: 130, h: 320, type: 'solid' },
      { x: 1810, y: 420, w: 85, h: 24, type: 'crumble', maxCrumbleTime: 55, color: '#f472b6' },
      { x: 1960, y: 470, w: 85, h: 24, type: 'crumble', maxCrumbleTime: 55, color: '#f472b6' },
      { x: 2150, y: 520, w: 220, h: 180, type: 'solid' },
      { x: 220, y: 670, w: 1930, h: 30, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 700, type: 'solid' },
      { x: 2400, y: 0, w: 50, h: 700, type: 'solid' }
    ],
    enemies: [
      // Shark cruising under the crumbling bridge
      {
        x: 500, y: 580, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 500, originY: 580, range: 160, speed: 2.5, direction: -1, rotation: 0,
        name: 'Tiburón de Fondo'
      },
      // Second shark patrol
      {
        x: 1250, y: 490, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 1250, originY: 490, range: 150, speed: 2.7, direction: 1, rotation: 0,
        name: 'Tiburón Cazador'
      },
      { x: 860, y: 428, radius: 18, type: 'static', originX: 860, originY: 428, range: 0, speed: 0, direction: 1, rotation: 0 },
      { x: 1225, y: 260, radius: 18, type: 'patrol_v', originX: 1225, originY: 260, range: 60, speed: 2.4, direction: 1, rotation: 0 }
    ],
    pearls: [
      { id: '8-1', x: 160, y: 530, radius: 12, collected: false, floatOffset: 0 },
      { id: '8-2', x: 345, y: 470, radius: 12, collected: false, floatOffset: 1 },
      { id: '8-3', x: 505, y: 430, radius: 12, collected: false, floatOffset: 2 },
      { id: '8-4', x: 665, y: 390, radius: 12, collected: false, floatOffset: 3 },
      { id: '8-5', x: 1042, y: 360, radius: 12, collected: false, floatOffset: 4 },
      { id: '8-6', x: 1192, y: 330, radius: 12, collected: false, floatOffset: 5 },
      { id: '8-7', x: 1342, y: 300, radius: 12, collected: false, floatOffset: 6 },
      { id: '8-8', x: 1492, y: 280, radius: 12, collected: false, floatOffset: 7 },
      { id: '8-9', x: 1852, y: 360, radius: 12, collected: false, floatOffset: 8 },
      { id: '8-10', x: 2240, y: 460, radius: 12, collected: false, floatOffset: 9 }
    ],
    trampolines: [],
    currents: [],
    shields: [
      { id: 'sh-8-1', x: 830, y: 380, radius: 18, collected: false, floatOffset: 2, durationSeconds: 10 }
    ],
    goal: { x: 2260, y: 456, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 9: LA FOSA DEL MEGALODÓN (NEW APEX PREDATOR: MEGALODON!)
  // -------------------------------------------------------------
  {
    id: 9,
    title: 'Nivel 9: La Fosa del Megalodón',
    subtitle: '¡El titán prehistórico despierta en las profundidades!',
    description: 'Enfrenta al gigantesco Megalodón que domina la gran caverna abisal.',
    width: 2600,
    height: 800,
    playerStart: { x: 80, y: 640 },
    tutorialText: '¡CUIDADO! El colosal MEGALODÓN patrulla la fosa central. Espera a que pase para cruzar.',
    hint: 'Sube al piso superior mediante la medusa y usa la corriente para rebasarlo.',
    platforms: [
      { x: 0, y: 720, w: 260, h: 80, type: 'solid' },
      { x: 380, y: 700, w: 120, h: 100, type: 'solid' },
      { x: 620, y: 680, w: 140, h: 120, type: 'solid' },
      { x: 220, y: 480, w: 460, h: 30, type: 'solid' },
      { x: 780, y: 440, w: 320, h: 30, type: 'solid' },
      { x: 440, y: 260, w: 240, h: 30, type: 'solid' },
      { x: 820, y: 220, w: 260, h: 30, type: 'moving', originX: 880, originY: 220, rangeX: 120, rangeY: 0, speed: 2.2, dx: 1, dy: 0 },
      { x: 1200, y: 200, w: 35, h: 420, type: 'solid' },
      { x: 1320, y: 320, w: 85, h: 24, type: 'crumble', maxCrumbleTime: 55, color: '#f472b6' },
      { x: 1480, y: 380, w: 85, h: 24, type: 'crumble', maxCrumbleTime: 55, color: '#f472b6' },
      { x: 1640, y: 440, w: 85, h: 24, type: 'moving', originX: 1640, originY: 440, rangeX: 0, rangeY: 110, speed: 2.0, dx: 0, dy: 1 },
      { x: 1900, y: 520, w: 220, h: 30, type: 'solid' },
      { x: 2260, y: 580, w: 300, h: 220, type: 'solid' },
      { x: 260, y: 780, w: 2000, h: 20, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 800, type: 'solid' },
      { x: 2600, y: 0, w: 50, h: 800, type: 'solid' }
    ],
    enemies: [
      // THE MEGALODON (Massive size, gaping jaws, scarred ancient hide)
      {
        x: 1050, y: 640, radius: 46, w: 150, h: 60, type: 'megalodon',
        originX: 1050, originY: 640, range: 220, speed: 3.2, direction: 1, rotation: 0,
        name: 'Megalodón Abisal'
      },
      // Fast hunting Shark in the middle passage
      {
        x: 1540, y: 320, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 1540, originY: 320, range: 120, speed: 2.6, direction: -1, rotation: 0,
        name: 'Tiburón Escolta'
      },
      { x: 460, y: 458, radius: 18, type: 'patrol_h', originX: 460, originY: 458, range: 100, speed: 2.2, direction: 1, rotation: 0 },
      { x: 1970, y: 498, radius: 18, type: 'patrol_h', originX: 1970, originY: 498, range: 60, speed: 2.0, direction: 1, rotation: 0 }
    ],
    trampolines: [
      { x: 150, y: 688, w: 60, h: 32, bounceForce: -16.5, squish: 1 },
      { x: 300, y: 448, w: 60, h: 32, bounceForce: -15.8, squish: 1 }
    ],
    currents: [
      { x: 1080, y: 140, w: 260, h: 140, forceX: 0.65, forceY: -0.05, label: 'Chorro Superior' },
      { x: 1760, y: 550, w: 120, h: 220, forceX: 0.2, forceY: -0.55, label: 'Ascensor Marino' }
    ],
    pearls: [
      { id: '9-1', x: 200, y: 580, radius: 12, collected: false, floatOffset: 0 },
      { id: '9-2', x: 340, y: 350, radius: 12, collected: false, floatOffset: 1 },
      { id: '9-3', x: 540, y: 200, radius: 12, collected: false, floatOffset: 2 },
      { id: '9-4', x: 740, y: 190, radius: 12, collected: false, floatOffset: 3 },
      { id: '9-5', x: 980, y: 160, radius: 12, collected: false, floatOffset: 4 },
      { id: '9-6', x: 1180, y: 120, radius: 12, collected: false, floatOffset: 5 },
      { id: '9-7', x: 1360, y: 260, radius: 12, collected: false, floatOffset: 6 },
      { id: '9-8', x: 1520, y: 320, radius: 12, collected: false, floatOffset: 7 },
      { id: '9-9', x: 1640, y: 380, radius: 12, collected: false, floatOffset: 8 },
      { id: '9-10', x: 1800, y: 500, radius: 12, collected: false, floatOffset: 9 },
      { id: '9-11', x: 2040, y: 460, radius: 12, collected: false, floatOffset: 10 },
      { id: '9-12', x: 2380, y: 520, radius: 12, collected: false, floatOffset: 11 }
    ],
    shields: [
      { id: 'sh-9-1', x: 480, y: 210, radius: 18, collected: false, floatOffset: 1, durationSeconds: 10 },
      { id: 'sh-9-2', x: 1880, y: 460, radius: 18, collected: false, floatOffset: 3, durationSeconds: 10 }
    ],
    goal: { x: 2460, y: 516, w: 64, h: 64, isOpen: false, openProgress: 0 }
  },

  // -------------------------------------------------------------
  // NIVEL 10: EL DESAFÍO MAESTRO: LA CRIPTA DEL MEGALODÓN
  // -------------------------------------------------------------
  {
    id: 10,
    title: 'Nivel 10: El Desafío Maestro',
    subtitle: 'La Cripta del Megalodón y el Gran Tesoro Legendario',
    description: 'La máxima combinación: corrientes, medusas, corales, tiburones y el colosal Megalodón.',
    width: 2800,
    height: 800,
    playerStart: { x: 80, y: 640 },
    tutorialText: '¡LA BATALLA FINAL! Domina todas tus habilidades acrobáticas para conquistar el tesoro sagrado.',
    hint: 'Sincroniza el rebote en la medusa suprema con la corriente para sobrevolar las mandíbulas del Megalodón.',
    platforms: [
      { x: 0, y: 720, w: 240, h: 80, type: 'solid' },
      { x: 300, y: 670, w: 80, h: 24, type: 'crumble', maxCrumbleTime: 48, color: '#f472b6' },
      { x: 440, y: 630, w: 80, h: 24, type: 'crumble', maxCrumbleTime: 48, color: '#f472b6' },
      { x: 600, y: 590, w: 120, h: 26, type: 'moving', originX: 660, originY: 590, rangeX: 110, rangeY: 0, speed: 2.4, dx: 1, dy: 0 },
      { x: 880, y: 530, w: 160, h: 270, type: 'solid' },
      { x: 1100, y: 470, w: 80, h: 24, type: 'crumble', maxCrumbleTime: 50, color: '#f472b6' },
      { x: 1240, y: 420, w: 80, h: 24, type: 'crumble', maxCrumbleTime: 50, color: '#f472b6' },
      { x: 1380, y: 370, w: 80, h: 24, type: 'crumble', maxCrumbleTime: 50, color: '#f472b6' },
      { x: 1540, y: 330, w: 160, h: 470, type: 'solid' },
      { x: 1800, y: 440, w: 110, h: 26, type: 'moving', originX: 1800, originY: 400, rangeX: 0, rangeY: 130, speed: 2.8, dx: 0, dy: 1 },
      { x: 2010, y: 420, w: 70, h: 380, type: 'solid' },
      { x: 2480, y: 480, w: 320, h: 320, type: 'solid' },
      { x: 240, y: 780, w: 2240, h: 20, type: 'spike' },
      { x: -50, y: 0, w: 50, h: 800, type: 'solid' },
      { x: 2800, y: 0, w: 50, h: 800, type: 'solid' }
    ],
    enemies: [
      // Hunting Shark 1 guarding the first crumble chain
      {
        x: 520, y: 530, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 520, originY: 530, range: 130, speed: 2.4, direction: 1, rotation: 0,
        name: 'Tiburón Centinela'
      },
      // Hunting Shark 2 guarding middle altitude
      {
        x: 1260, y: 310, radius: 24, w: 76, h: 32, type: 'shark',
        originX: 1260, originY: 310, range: 120, speed: 2.8, direction: -1, rotation: 0,
        name: 'Tiburón de Presa'
      },
      // THE APEX MEGALODON (Guarding the final abyss gap before the legendary chest)
      {
        x: 2220, y: 420, radius: 50, w: 165, h: 68, type: 'megalodon',
        originX: 2220, originY: 420, range: 180, speed: 3.5, direction: -1, rotation: 0,
        name: 'Megalodón Rey del Abismo'
      },
      { x: 960, y: 508, radius: 18, type: 'static', originX: 960, originY: 508, range: 0, speed: 0, direction: 1, rotation: 0 },
      { x: 1620, y: 308, radius: 18, type: 'patrol_h', originX: 1620, originY: 308, range: 45, speed: 2.2, direction: 1, rotation: 0 }
    ],
    trampolines: [
      { x: 1640, y: 298, w: 60, h: 32, bounceForce: -17.2, squish: 1 },
      { x: 2015, y: 388, w: 60, h: 32, bounceForce: -16.5, squish: 1 }
    ],
    currents: [
      { x: 1660, y: 120, w: 380, h: 240, forceX: 0.72, forceY: -0.15, label: 'Super Corriente Abisal' },
      { x: 2200, y: 260, w: 200, h: 320, forceX: 0.45, forceY: -0.45, label: 'Remolino Ascendente' }
    ],
    pearls: [
      { id: '10-1', x: 150, y: 660, radius: 12, collected: false, floatOffset: 0 },
      { id: '10-2', x: 340, y: 600, radius: 12, collected: false, floatOffset: 1 },
      { id: '10-3', x: 480, y: 560, radius: 12, collected: false, floatOffset: 2 },
      { id: '10-4', x: 670, y: 520, radius: 12, collected: false, floatOffset: 3 },
      { id: '10-5', x: 920, y: 460, radius: 12, collected: false, floatOffset: 4 },
      { id: '10-6', x: 1140, y: 400, radius: 12, collected: false, floatOffset: 5 },
      { id: '10-7', x: 1280, y: 350, radius: 12, collected: false, floatOffset: 6 },
      { id: '10-8', x: 1420, y: 300, radius: 12, collected: false, floatOffset: 7 },
      { id: '10-9', x: 1580, y: 260, radius: 12, collected: false, floatOffset: 8 },
      { id: '10-10', x: 1780, y: 150, radius: 12, collected: false, floatOffset: 9 },
      { id: '10-11', x: 1940, y: 180, radius: 12, collected: false, floatOffset: 10 },
      { id: '10-12', x: 2045, y: 320, radius: 12, collected: false, floatOffset: 11 },
      { id: '10-13', x: 2200, y: 220, radius: 12, collected: false, floatOffset: 12 },
      { id: '10-14', x: 2360, y: 320, radius: 12, collected: false, floatOffset: 13 },
      { id: '10-15', x: 2600, y: 420, radius: 12, collected: false, floatOffset: 14 }
    ],
    shields: [
      { id: 'sh-10-1', x: 920, y: 460, radius: 18, collected: false, floatOffset: 1, durationSeconds: 10 },
      { id: 'sh-10-2', x: 1980, y: 340, radius: 18, collected: false, floatOffset: 2, durationSeconds: 10 }
    ],
    goal: { x: 2670, y: 416, w: 64, h: 64, isOpen: false, openProgress: 0 }
  }
];
