export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PlatformType = 'solid' | 'moving' | 'crumble' | 'spike';

export interface Platform extends Rect {
  type?: PlatformType;
  // Moving platforms
  dx?: number;
  dy?: number;
  speed?: number;
  originX?: number;
  originY?: number;
  rangeX?: number;
  rangeY?: number;
  // Crumbling platforms
  crumbleTimer?: number; // ms left before crumbling
  isCrumbling?: boolean;
  isBroken?: boolean;
  respawnTimer?: number;
  maxCrumbleTime?: number;
  color?: string;
  name?: string;
}

export type EnemyType = 'static' | 'patrol_h' | 'patrol_v' | 'shark' | 'megalodon';

export interface Enemy {
  x: number;
  y: number;
  radius: number;
  w?: number;
  h?: number;
  type: EnemyType;
  originX: number;
  originY: number;
  range: number;
  speed: number;
  direction: number;
  rotation: number;
  jawAngle?: number;
  tailAngle?: number;
  name?: string;
}

export interface Pearl {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  floatOffset: number;
}

export interface SpringJellyfish {
  x: number;
  y: number;
  w: number;
  h: number;
  bounceForce: number;
  squish: number;
}

export interface WaterCurrent {
  x: number;
  y: number;
  w: number;
  h: number;
  forceX: number;
  forceY: number;
  label?: string;
}

export interface ChestGoal {
  x: number;
  y: number;
  w: number;
  h: number;
  isOpen: boolean;
  openProgress: number; // 0 to 1
}

export interface ShieldBubbleItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  floatOffset: number;
  durationSeconds: number; // default 10s
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  goal: ChestGoal;
  platforms: Platform[];
  enemies: Enemy[];
  pearls: Pearl[];
  shields?: ShieldBubbleItem[];
  trampolines: SpringJellyfish[];
  currents: WaterCurrent[];
  tutorialText?: string;
  hint?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'bubble' | 'sparkle' | 'dust' | 'confetti';
}

export interface Seaweed {
  x: number;
  y: number;
  height: number;
  segments: number;
  phase: number;
  color: string;
  width: number;
}

export type GameScreen = 'menu' | 'playing' | 'paused' | 'level_complete' | 'game_over' | 'victory';

export type OctoColorId = 'coral' | 'ocean' | 'kelp' | 'neon' | 'sun';

export interface OctoColorConfig {
  id: OctoColorId;
  name: string;
  badge: string;
  primary: string;
  mid: string;
  warmth: string;
  secondary: string;
  curls: string;
  cheeks: string;
  glow: string;
  textColor: string;
}

export const OCTO_COLORS: Record<OctoColorId, OctoColorConfig> = {
  coral: {
    id: 'coral',
    name: 'Rojo / Rosa',
    badge: 'Coral Clásico',
    primary: '#ff4b8b',
    mid: '#ff1168',
    warmth: '#ff5722',
    secondary: '#e11d48',
    curls: '#ff3366',
    cheeks: 'rgba(244, 63, 94, 0.45)',
    glow: '#f43f5e',
    textColor: 'text-rose-400'
  },
  ocean: {
    id: 'ocean',
    name: 'Azul Océano',
    badge: 'Profundidades',
    primary: '#38bdf8',
    mid: '#0284c7',
    warmth: '#0369a1',
    secondary: '#075985',
    curls: '#0ea5e9',
    cheeks: 'rgba(56, 189, 248, 0.45)',
    glow: '#38bdf8',
    textColor: 'text-sky-400'
  },
  kelp: {
    id: 'kelp',
    name: 'Verde Alga',
    badge: 'Arrecife Esmeralda',
    primary: '#4ade80',
    mid: '#16a34a',
    warmth: '#15803d',
    secondary: '#166534',
    curls: '#22c55e',
    cheeks: 'rgba(74, 222, 128, 0.45)',
    glow: '#4ade80',
    textColor: 'text-emerald-400'
  },
  neon: {
    id: 'neon',
    name: 'Púrpura Neón',
    badge: 'Abisal Místico',
    primary: '#c084fc',
    mid: '#9333ea',
    warmth: '#7e22ce',
    secondary: '#581c87',
    curls: '#a855f7',
    cheeks: 'rgba(192, 132, 252, 0.45)',
    glow: '#c084fc',
    textColor: 'text-purple-400'
  },
  sun: {
    id: 'sun',
    name: 'Dorado Sol',
    badge: 'Ámbar Brillante',
    primary: '#fde047',
    mid: '#eab308',
    warmth: '#ea580c',
    secondary: '#b45309',
    curls: '#f59e0b',
    cheeks: 'rgba(251, 146, 60, 0.45)',
    glow: '#facc15',
    textColor: 'text-amber-400'
  }
};

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  badge: string;
  lives: number;
  gravity: number;
  frictionGround: number;
  enemySpeedMultiplier: number;
  crumbleDurationSeconds: number;
  description: string;
  color: string;
}

export const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Fácil',
    badge: 'Flotabilidad Ligera',
    lives: 5,
    gravity: 0.32,
    frictionGround: 0.82,
    enemySpeedMultiplier: 0.75,
    crumbleDurationSeconds: 1.5,
    description: '5 corazones, física muy flotante y enemigos lentos. Ideal para explorar.',
    color: 'emerald'
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    badge: 'Aventura Equilibrada',
    lives: 3,
    gravity: 0.38,
    frictionGround: 0.86,
    enemySpeedMultiplier: 1.0,
    crumbleDurationSeconds: 1.0,
    description: '3 corazones, físicas originales estilo Red Ball y desafío equilibrado.',
    color: 'sky'
  },
  hard: {
    id: 'hard',
    name: 'Difícil / Hardcore',
    badge: 'Abismo Letal',
    lives: 1,
    gravity: 0.44,
    frictionGround: 0.90,
    enemySpeedMultiplier: 1.35,
    crumbleDurationSeconds: 0.6,
    description: '1 solo corazón, física más pesada, corales ultra rápidos y depredadores feroces.',
    color: 'rose'
  }
};
