import { soundManager } from '../audio/soundManager';
import { LEVELS } from '../levels/levelData';
import {
  DIFFICULTIES,
  DifficultyConfig,
  DifficultyLevel,
  Enemy,
  GameScreen,
  LevelData,
  OCTO_COLORS,
  OctoColorConfig,
  OctoColorId,
  Particle,
  Platform,
  Seaweed
} from '../types/game';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isGrounded: boolean;
  facing: 1 | -1;
  rotation: number;
  scaleX: number;
  scaleY: number;
  invulnerableTimer: number;
  blinkTimer: number;
  bubbleTimer: number;
  hasShield: boolean;
  shieldTimer: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  down: boolean;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public screen: GameScreen = 'menu';

  // Customization & Difficulty
  public colorId: OctoColorId = 'coral';
  public difficultyId: DifficultyLevel = 'normal';
  public colorConfig: OctoColorConfig = OCTO_COLORS.coral;
  public difficultyConfig: DifficultyConfig = DIFFICULTIES.normal;

  // Game Progress
  public currentLevelIndex: number = 0;
  public lives: number = 3;
  public maxLives: number = 3;
  public pearlsCollected: number = 0;
  public totalPearlsInLevel: number = 0;
  public totalPearlsAllLevels: number = 0;
  public unlockedLevel: number = 1;
  public levelTimeSeconds: number = 0;

  // Active Level Data
  public currentLevel!: LevelData;

  // Player
  public player!: PlayerState;

  // Camera
  public camera = { x: 0, y: 0 };

  // Inputs
  public inputs: InputState = { left: false, right: false, jump: false, down: false };
  private jumpKeyHeld: boolean = false;

  // Visual effects
  public particles: Particle[] = [];
  public bubbleLayers = {
    deep: [] as Array<{ x: number; y: number; speed: number; radius: number; wobble: number; alpha: number }>,
    mid: [] as Array<{ x: number; y: number; speed: number; radius: number; wobble: number; alpha: number }>,
    foreground: [] as Array<{ x: number; y: number; speed: number; radius: number; wobble: number; alpha: number }>
  };
  public ambientBubbles: Array<{ x: number; y: number; speed: number; radius: number; wobble: number; alpha: number }> = [];
  public seaweeds: Seaweed[] = [];
  public globalTime: number = 0;
  public screenShake: number = 0;
  private megalodonSoundCooldown: number = 0;

  // Animation frame
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private onStateChangeCallback?: (engine: GameEngine) => void;

  constructor(canvas: HTMLCanvasElement, onStateChange?: (engine: GameEngine) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChangeCallback = onStateChange;

    this.initAmbientBubbles();
    this.setColor('coral');
    this.setDifficulty('normal');
    this.loadLevel(0);
    this.setupEventListeners();
  }

  public setColor(id: OctoColorId) {
    this.colorId = id;
    this.colorConfig = OCTO_COLORS[id] || OCTO_COLORS.coral;
    this.notify();
  }

  public setDifficulty(id: DifficultyLevel) {
    this.difficultyId = id;
    this.difficultyConfig = DIFFICULTIES[id] || DIFFICULTIES.normal;
    this.maxLives = this.difficultyConfig.lives;
    this.lives = this.maxLives;
    this.notify();
  }

  public setOnStateChange(cb: (engine: GameEngine) => void) {
    this.onStateChangeCallback = cb;
  }

  private notify() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this);
    }
  }

  private initAmbientBubbles() {
    this.bubbleLayers = { deep: [], mid: [], foreground: [] };

    // Layer 1: Deep bubbles (small, slow, dreamy blur)
    for (let i = 0; i < 30; i++) {
      this.bubbleLayers.deep.push({
        x: Math.random() * 3000,
        y: Math.random() * 1000,
        speed: 0.3 + Math.random() * 0.45,
        radius: 1.5 + Math.random() * 2.0,
        wobble: Math.random() * Math.PI * 2,
        alpha: 0.18 + Math.random() * 0.2
      });
    }

    // Layer 2: Midground bubbles (standard size, crystal highlights)
    for (let i = 0; i < 28; i++) {
      this.bubbleLayers.mid.push({
        x: Math.random() * 3000,
        y: Math.random() * 1000,
        speed: 0.75 + Math.random() * 0.8,
        radius: 3.5 + Math.random() * 3.5,
        wobble: Math.random() * Math.PI * 2,
        alpha: 0.4 + Math.random() * 0.35
      });
    }

    // Layer 3: Foreground bubbles (large, rapid, glossy refraction ring)
    for (let i = 0; i < 14; i++) {
      this.bubbleLayers.foreground.push({
        x: Math.random() * 3000,
        y: Math.random() * 1000,
        speed: 1.6 + Math.random() * 1.5,
        radius: 8 + Math.random() * 8,
        wobble: Math.random() * Math.PI * 2,
        alpha: 0.55 + Math.random() * 0.35
      });
    }
  }

  public loadLevel(levelIndex: number) {
    this.currentLevelIndex = Math.max(0, Math.min(levelIndex, LEVELS.length - 1));
    const rawLevel = LEVELS[this.currentLevelIndex];

    // Deep clone level data to allow per-play manipulation
    this.currentLevel = JSON.parse(JSON.stringify(rawLevel));
    this.pearlsCollected = 0;
    this.totalPearlsInLevel = this.currentLevel.pearls.length;
    this.levelTimeSeconds = 0;
    this.megalodonSoundCooldown = 0;

    // Apply difficulty to crumbling platforms
    const crumbleFrames = Math.round(this.difficultyConfig.crumbleDurationSeconds * 60);
    for (const p of this.currentLevel.platforms) {
      if (p.type === 'crumble') {
        p.maxCrumbleTime = crumbleFrames;
        p.crumbleTimer = crumbleFrames;
      }
    }

    // Reset player
    this.player = {
      x: this.currentLevel.playerStart.x,
      y: this.currentLevel.playerStart.y,
      vx: 0,
      vy: 0,
      radius: 22,
      isGrounded: false,
      facing: 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      invulnerableTimer: 0,
      blinkTimer: 0,
      bubbleTimer: 0,
      hasShield: false,
      shieldTimer: 0
    };

    // Camera immediately centers on player
    this.camera.x = this.player.x - this.canvas.width / 2;
    this.camera.y = this.player.y - this.canvas.height / 2;
    this.clampCamera();

    // Generate seaweeds
    this.generateSeaweeds();
    this.particles = [];
  }

  private generateSeaweeds() {
    this.seaweeds = [];
    for (const p of this.currentLevel.platforms) {
      if (p.type === 'solid' && p.w >= 60 && p.h >= 40) {
        const count = Math.floor(p.w / 80);
        for (let i = 0; i < count; i++) {
          this.seaweeds.push({
            x: p.x + 20 + i * 70 + (Math.random() * 20 - 10),
            y: p.y,
            height: 35 + Math.random() * 45,
            segments: 5,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.4 ? '#10b981' : '#059669',
            width: 4 + Math.random() * 3
          });
        }
      }
    }
  }

  public startGame() {
    this.lives = this.difficultyConfig.lives;
    this.maxLives = this.difficultyConfig.lives;
    this.screen = 'playing';
    soundManager.startUnderwaterAtmosphere();
    this.notify();
  }

  public restartLevel() {
    this.lives = this.difficultyConfig.lives;
    this.loadLevel(this.currentLevelIndex);
    this.screen = 'playing';
    this.notify();
  }

  public nextLevel() {
    if (this.currentLevelIndex + 1 < LEVELS.length) {
      this.currentLevelIndex++;
      this.unlockedLevel = Math.max(this.unlockedLevel, this.currentLevelIndex + 1);
      this.loadLevel(this.currentLevelIndex);
      this.screen = 'playing';
    } else {
      this.screen = 'victory';
      soundManager.playLevelWin();
    }
    this.notify();
  }

  public selectLevel(idx: number) {
    if (idx < this.unlockedLevel) {
      this.loadLevel(idx);
      this.screen = 'playing';
      soundManager.startUnderwaterAtmosphere();
      this.notify();
    }
  }

  public pauseGame() {
    if (this.screen === 'playing') {
      this.screen = 'paused';
      this.notify();
    } else if (this.screen === 'paused') {
      this.screen = 'playing';
      this.notify();
    }
  }

  private setupEventListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.inputs.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.inputs.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        this.inputs.jump = true;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.inputs.down = true;

      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.pauseGame();
      }
      if (e.code === 'KeyR' && (this.screen === 'playing' || this.screen === 'game_over')) {
        this.restartLevel();
      }
      if (e.code === 'KeyM') {
        soundManager.toggleMute();
        this.notify();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.inputs.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.inputs.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        this.inputs.jump = false;
        this.jumpKeyHeld = false;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.inputs.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  public setTouchInput(key: 'left' | 'right' | 'jump', active: boolean) {
    if (key === 'jump') {
      this.inputs.jump = active;
      if (!active) this.jumpKeyHeld = false;
    } else {
      this.inputs[key] = active;
    }
  }

  public startLoop() {
    if (this.animationFrameId !== null) return;
    this.lastTimestamp = performance.now();
    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
      this.lastTimestamp = timestamp;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    soundManager.stopUnderwaterAtmosphere();
  }

  // =============================================================
  // PHYSICS & UPDATE
  // =============================================================
  private update(dt: number) {
    this.globalTime += dt;
    if (this.megalodonSoundCooldown > 0) {
      this.megalodonSoundCooldown -= dt;
    }

    if (this.screen !== 'playing') {
      this.updateAmbientBubbles(dt);
      return;
    }

    this.levelTimeSeconds += dt;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    this.updatePlatforms(dt);
    this.updateCrumblingPlatforms(dt);
    this.updateEnemies(dt);
    this.updateTrampolines(dt);
    this.updateCurrents();
    this.updatePlayerPhysics(dt);

    this.resolvePlatformCollisions();
    this.checkHazardCollisions();
    this.checkShieldCollisions();
    this.checkPearlCollisions();
    this.checkGoalCollision(dt);

    this.updateParticles(dt);
    this.updateAmbientBubbles(dt);
    this.updateCamera();
  }

  private updatePlatforms(dt: number) {
    for (const p of this.currentLevel.platforms) {
      if (p.type === 'moving') {
        const speed = p.speed || 1.5;
        if (p.rangeX && p.rangeX > 0 && p.originX !== undefined) {
          p.x = p.originX + Math.sin(this.globalTime * speed) * p.rangeX;
        }
        if (p.rangeY && p.rangeY > 0 && p.originY !== undefined) {
          p.y = p.originY + Math.cos(this.globalTime * speed) * p.rangeY;
        }
      }
    }
  }

  private updateCrumblingPlatforms(dt: number) {
    for (const p of this.currentLevel.platforms) {
      if (p.type === 'crumble') {
        if (p.isCrumbling && !p.isBroken) {
          p.crumbleTimer = (p.crumbleTimer || 60) - dt * 60;
          if (p.crumbleTimer <= 0) {
            p.isBroken = true;
            p.isCrumbling = false;
            p.respawnTimer = 180;
            soundManager.playCrumble();
            this.emitDust(p.x + p.w / 2, p.y + p.h / 2, 16, p.color || '#f472b6');
          }
        } else if (p.isBroken) {
          p.respawnTimer = (p.respawnTimer || 180) - dt * 60;
          if (p.respawnTimer <= 0) {
            p.isBroken = false;
            p.crumbleTimer = p.maxCrumbleTime || 60;
            this.emitSparkles(p.x + p.w / 2, p.y + p.h / 2, 8, '#67e8f9');
          }
        }
      }
    }
  }

  private updateEnemies(dt: number) {
    const spdMultiplier = this.difficultyConfig.enemySpeedMultiplier;

    for (const e of this.currentLevel.enemies) {
      e.rotation += dt * 1.8;

      // Shark & Megalodon specific animated jaws and tail
      if (e.type === 'shark' || e.type === 'megalodon') {
        const swimSpeed = (e.speed * spdMultiplier);
        e.x += swimSpeed * e.direction;
        e.jawAngle = Math.abs(Math.sin(this.globalTime * (e.type === 'megalodon' ? 5 : 7))) * 0.35;
        e.tailAngle = Math.sin(this.globalTime * (e.type === 'megalodon' ? 6 : 9)) * 0.45;

        // Turn around bounds
        if (e.x > e.originX + e.range) {
          e.x = e.originX + e.range;
          e.direction = -1;
        } else if (e.x < e.originX - e.range) {
          e.x = e.originX - e.range;
          e.direction = 1;
        }

        // Megalodon acoustic rumble when close to player
        if (e.type === 'megalodon') {
          const distToPlayer = Math.hypot(this.player.x - e.x, this.player.y - e.y);
          if (distToPlayer < 320 && this.megalodonSoundCooldown <= 0) {
            this.megalodonSoundCooldown = 4.5;
            soundManager.playMegalodonRoar();
            this.screenShake = 6;
          }
        }
      } else if (e.type === 'patrol_h') {
        e.x += e.speed * spdMultiplier * e.direction;
        if (e.x > e.originX + e.range) {
          e.x = e.originX + e.range;
          e.direction = -1;
        } else if (e.x < e.originX - e.range) {
          e.x = e.originX - e.range;
          e.direction = 1;
        }
      } else if (e.type === 'patrol_v') {
        e.y += e.speed * spdMultiplier * e.direction;
        if (e.y > e.originY + e.range) {
          e.y = e.originY + e.range;
          e.direction = -1;
        } else if (e.y < e.originY - e.range) {
          e.y = e.originY - e.range;
          e.direction = 1;
        }
      }
    }
  }

  private updateTrampolines(dt: number) {
    for (const j of this.currentLevel.trampolines) {
      if (j.squish < 1) {
        j.squish = Math.min(1, j.squish + dt * 4);
      }
    }
  }

  private updateCurrents() {
    for (const c of this.currentLevel.currents) {
      if (
        this.player.x + this.player.radius > c.x &&
        this.player.x - this.player.radius < c.x + c.w &&
        this.player.y + this.player.radius > c.y &&
        this.player.y - this.player.radius < c.y + c.h
      ) {
        this.player.vx += c.forceX;
        this.player.vy += c.forceY;
        if (Math.random() < 0.35) {
          this.emitBubble(
            this.player.x + (Math.random() * 20 - 10),
            this.player.y + (Math.random() * 20 - 10),
            c.forceX * 2,
            c.forceY * 2
          );
        }
      }
    }
  }

  private updatePlayerPhysics(dt: number) {
    const p = this.player;

    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer -= dt;
      p.blinkTimer += dt * 15;
    }

    if (p.hasShield) {
      p.shieldTimer -= dt;
      if (p.shieldTimer <= 0) {
        p.hasShield = false;
        p.shieldTimer = 0;
        soundManager.playShieldExpire();
        this.emitShieldPop(p.x, p.y, '#38bdf8');
        this.notify();
      } else if (Math.random() < 0.22) {
        const orbAngle = Math.random() * Math.PI * 2;
        const orbDist = p.radius + 8 + Math.random() * 5;
        this.emitBubble(
          p.x + Math.cos(orbAngle) * orbDist,
          p.y + Math.sin(orbAngle) * orbDist,
          (Math.random() - 0.5) * 0.4,
          -0.4 - Math.random() * 0.4
        );
      }
    }

    const accel = p.isGrounded ? 0.58 : 0.42;
    const maxSpeed = 5.4;

    if (this.inputs.left) {
      p.vx -= accel;
      p.facing = -1;
    } else if (this.inputs.right) {
      p.vx += accel;
      p.facing = 1;
    } else {
      p.vx *= p.isGrounded ? this.difficultyConfig.frictionGround : 0.94;
    }

    p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));

    if (this.inputs.jump) {
      if (p.isGrounded && !this.jumpKeyHeld) {
        p.vy = -10.2;
        p.isGrounded = false;
        p.scaleY = 1.25;
        p.scaleX = 0.8;
        this.jumpKeyHeld = true;
        soundManager.playJump();
        this.emitBubbleBurst(p.x, p.y + p.radius, 6);
      }
    }

    if (!this.inputs.jump && p.vy < -3.5) {
      p.vy *= 0.65;
    }

    // Apply difficulty gravity
    p.vy += this.difficultyConfig.gravity;
    p.vy = Math.min(10.5, p.vy);

    p.rotation += (p.vx / p.radius) * 0.75;
    p.scaleX += (1 - p.scaleX) * 0.15;
    p.scaleY += (1 - p.scaleY) * 0.15;

    p.bubbleTimer += dt;
    if (p.bubbleTimer > 0.08 && (Math.abs(p.vx) > 1.8 || Math.abs(p.vy) > 2.0)) {
      p.bubbleTimer = 0;
      this.emitBubble(
        p.x - p.vx * 1.5 + (Math.random() * 8 - 4),
        p.y + p.radius * 0.5 + (Math.random() * 8 - 4),
        -p.vx * 0.2 + (Math.random() - 0.5),
        -0.6 - Math.random() * 0.8
      );
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.x - p.radius < 0) {
      p.x = p.radius;
      p.vx = 0;
    }
    if (p.x + p.radius > this.currentLevel.width) {
      p.x = this.currentLevel.width - p.radius;
      p.vx = 0;
    }

    if (p.y - p.radius > this.currentLevel.height + 60) {
      this.takeDamage(this.difficultyConfig.lives, 'hazard');
    }
  }

  private resolvePlatformCollisions() {
    const p = this.player;
    p.isGrounded = false;

    // Trampolines
    for (const j of this.currentLevel.trampolines) {
      if (
        p.x + p.radius * 0.7 > j.x &&
        p.x - p.radius * 0.7 < j.x + j.w &&
        p.y + p.radius >= j.y &&
        p.y - p.radius <= j.y + j.h &&
        p.vy > 0
      ) {
        p.y = j.y - p.radius;
        p.vy = j.bounceForce;
        j.squish = 0.45;
        p.scaleY = 1.35;
        p.scaleX = 0.75;
        soundManager.playBounce();
        this.emitBubbleBurst(p.x, p.y + p.radius, 10);
        this.screenShake = 6;
        return;
      }
    }

    // Solid & Crumble Platforms
    for (const plat of this.currentLevel.platforms) {
      if (plat.type === 'spike') continue;
      if (plat.type === 'crumble' && plat.isBroken) continue;

      const closestX = Math.max(plat.x, Math.min(p.x, plat.x + plat.w));
      const closestY = Math.max(plat.y, Math.min(p.y, plat.y + plat.h));

      const distX = p.x - closestX;
      const distY = p.y - closestY;
      const distanceSq = distX * distX + distY * distY;

      if (distanceSq < p.radius * p.radius) {
        const dist = Math.sqrt(distanceSq);
        const overlap = p.radius - dist;

        let nx = dist > 0.0001 ? distX / dist : 0;
        let ny = dist > 0.0001 ? distY / dist : -1;

        if (dist === 0) {
          nx = 0;
          ny = -1;
        }

        p.x += nx * overlap;
        p.y += ny * overlap;

        if (ny < -0.6) {
          p.isGrounded = true;
          if (p.vy > 4) {
            p.scaleY = 0.75;
            p.scaleX = 1.25;
          }
          p.vy = 0;

          if (plat.type === 'moving' && plat.rangeX && plat.originX !== undefined) {
            const speed = plat.speed || 1.5;
            const platVx = Math.cos(this.globalTime * speed) * plat.rangeX * speed * 0.016;
            p.x += platVx;
          }

          if (plat.type === 'crumble' && !plat.isCrumbling && !plat.isBroken) {
            plat.isCrumbling = true;
            plat.crumbleTimer = plat.maxCrumbleTime || 60;
          }
        } else if (ny > 0.6) {
          if (p.vy < 0) p.vy = 0;
        } else {
          p.vx = 0;
        }
      }
    }
  }

  private checkHazardCollisions() {
    const p = this.player;
    if (p.invulnerableTimer > 0) return;

    // Spikes
    for (const plat of this.currentLevel.platforms) {
      if (plat.type === 'spike') {
        if (
          p.x + p.radius * 0.7 > plat.x &&
          p.x - p.radius * 0.7 < plat.x + plat.w &&
          p.y + p.radius * 0.7 > plat.y &&
          p.y - p.radius * 0.7 < plat.y + plat.h
        ) {
          if (p.hasShield) {
            p.hasShield = false;
            p.shieldTimer = 0;
            p.invulnerableTimer = 1.8;
            this.screenShake = 10;
            soundManager.playShieldBreak();
            this.emitShieldPop(p.x, p.y, '#38bdf8');
            p.vy = -8.5;
            this.notify();
            return;
          }
          this.takeDamage(1, 'spike');
          return;
        }
      }
    }

    // Enemies (Urchins, Sharks, Megalodon)
    for (const enemy of this.currentLevel.enemies) {
      if (enemy.type === 'shark' || enemy.type === 'megalodon') {
        // Oriented capsule / ellipse bounding check for sharks and Megalodon
        const halfW = (enemy.w || 76) * 0.45;
        const halfH = (enemy.h || 32) * 0.45;
        const dx = Math.abs(p.x - enemy.x);
        const dy = Math.abs(p.y - enemy.y);

        if (dx < halfW + p.radius && dy < halfH + p.radius) {
          if (p.hasShield) {
            p.hasShield = false;
            p.shieldTimer = 0;
            p.invulnerableTimer = 1.8;
            this.screenShake = enemy.type === 'megalodon' ? 14 : 10;
            soundManager.playShieldBreak();
            this.emitShieldPop(p.x, p.y, '#38bdf8');
            p.vx = enemy.direction * 8.5;
            p.vy = -7.0;
            this.notify();
            return;
          }
          const dmg = enemy.type === 'megalodon' ? 2 : 1;
          this.takeDamage(dmg, enemy.type);
          p.vx = enemy.direction * 7.5;
          p.vy = -6.5;
          return;
        }
      } else {
        // Urchins circular collision
        const dx = p.x - enemy.x;
        const dy = p.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.radius + enemy.radius - 3) {
          if (p.hasShield) {
            p.hasShield = false;
            p.shieldTimer = 0;
            p.invulnerableTimer = 1.8;
            this.screenShake = 10;
            soundManager.playShieldBreak();
            this.emitShieldPop(p.x, p.y, '#38bdf8');
            p.vx = (dx / (dist || 1)) * 7.5;
            p.vy = -6.5;
            this.notify();
            return;
          }
          this.takeDamage(1, 'urchin');
          p.vx = (dx / (dist || 1)) * 6.5;
          p.vy = -6.0;
          return;
        }
      }
    }
  }

  private takeDamage(amount: number, source: string) {
    this.lives -= amount;
    this.screenShake = source === 'megalodon' ? 18 : 12;

    if (source === 'shark') {
      soundManager.playSharkChomp();
    } else if (source === 'megalodon') {
      soundManager.playMegalodonRoar();
    } else {
      soundManager.playHurt();
    }

    this.emitBloodInk(this.player.x, this.player.y);

    if (this.lives <= 0) {
      this.screen = 'game_over';
      soundManager.playGameOver();
    } else {
      this.player.invulnerableTimer = 1.6;
    }
    this.notify();
  }

  private checkShieldCollisions() {
    const p = this.player;
    if (!this.currentLevel.shields) return;
    for (const sh of this.currentLevel.shields) {
      if (!sh.collected) {
        const dx = p.x - sh.x;
        const dy = p.y - sh.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.radius + sh.radius + 8) {
          sh.collected = true;
          p.hasShield = true;
          p.shieldTimer = sh.durationSeconds || 10;
          soundManager.playShieldPickup();
          this.emitShieldCollectBurst(sh.x, sh.y);
          this.notify();
        }
      }
    }
  }

  private checkPearlCollisions() {
    const p = this.player;
    for (const pearl of this.currentLevel.pearls) {
      if (!pearl.collected) {
        const dx = p.x - pearl.x;
        const dy = p.y - pearl.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.radius + pearl.radius + 6) {
          pearl.collected = true;
          this.pearlsCollected++;
          this.totalPearlsAllLevels++;
          soundManager.playPearl();
          this.emitSparkles(pearl.x, pearl.y, 14, '#fde047');
          this.notify();
        }
      }
    }
  }

  private checkGoalCollision(dt: number) {
    const p = this.player;
    const goal = this.currentLevel.goal;

    if (
      p.x + p.radius > goal.x &&
      p.x - p.radius < goal.x + goal.w &&
      p.y + p.radius > goal.y &&
      p.y - p.radius < goal.y + goal.h
    ) {
      if (!goal.isOpen) {
        goal.isOpen = true;
        soundManager.playLevelWin();
        this.emitVictoryConfetti(goal.x + goal.w / 2, goal.y + goal.h / 2);
      }
    }

    if (goal.isOpen) {
      goal.openProgress = Math.min(1, goal.openProgress + dt * 2.5);
      if (goal.openProgress >= 1 && this.screen === 'playing') {
        this.screen = 'level_complete';
        this.notify();
      }
    }
  }

  private updateCamera() {
    const targetX = this.player.x - this.canvas.width / 2 + this.player.vx * 15;
    const targetY = this.player.y - this.canvas.height / 2;

    this.camera.x += (targetX - this.camera.x) * 0.08;
    this.camera.y += (targetY - this.camera.y) * 0.08;

    this.clampCamera();
  }

  private clampCamera() {
    const maxCamX = Math.max(0, this.currentLevel.width - this.canvas.width);
    const maxCamY = Math.max(0, this.currentLevel.height - this.canvas.height);

    this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
    this.camera.y = Math.max(0, Math.min(maxCamY, this.camera.y));
  }

  // =============================================================
  // PARTICLE EMITTERS
  // =============================================================
  private emitBubble(x: number, y: number, vx: number, vy: number) {
    this.particles.push({
      x,
      y,
      vx,
      vy,
      size: 2.5 + Math.random() * 3.5,
      color: 'rgba(255, 255, 255, 0.75)',
      alpha: 0.8,
      life: 0,
      maxLife: 0.6 + Math.random() * 0.4,
      type: 'bubble'
    });
  }

  private emitShieldCollectBurst(x: number, y: number) {
    for (let i = 0; i < 22; i++) {
      const angle = (Math.PI * 2 * i) / 22 + (Math.random() * 0.2 - 0.1);
      const speed = 2.0 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 3.5 + Math.random() * 4,
        color: i % 2 === 0 ? '#38bdf8' : '#a7f3d0',
        alpha: 1,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.4,
        type: 'bubble'
      });
    }
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 3.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 3,
        color: '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 0.6,
        type: 'sparkle'
      });
    }
  }

  private emitShieldPop(x: number, y: number, color: string = '#38bdf8') {
    for (let i = 0; i < 26; i++) {
      const angle = (Math.PI * 2 * i) / 26 + (Math.random() * 0.2 - 0.1);
      const speed = 2.8 + Math.random() * 4.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#67e8f9' : color,
        alpha: 1,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.35,
        type: 'bubble'
      });
    }
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: '#c084fc',
        alpha: 1,
        life: 0,
        maxLife: 0.5,
        type: 'sparkle'
      });
    }
  }

  private emitBubbleBurst(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const spd = 1.2 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1,
        size: 3 + Math.random() * 4,
        color: 'rgba(224, 242, 254, 0.85)',
        alpha: 0.9,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.5,
        type: 'bubble'
      });
    }
  }

  private emitSparkles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        type: 'sparkle'
      });
    }
  }

  private emitDust(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 40 - 20),
        y: y + (Math.random() * 10 - 5),
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 + 1,
        size: 3 + Math.random() * 4,
        color,
        alpha: 0.9,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.5,
        type: 'dust'
      });
    }
  }

  private emitBloodInk(x: number, y: number) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4.5,
        vy: (Math.random() - 0.5) * 4.5,
        size: 4 + Math.random() * 6,
        color: this.colorConfig.glow,
        alpha: 0.9,
        life: 0,
        maxLife: 0.7,
        type: 'dust'
      });
    }
  }

  private emitVictoryConfetti(x: number, y: number) {
    const colors = ['#fde047', '#38bdf8', '#f472b6', '#4ade80', '#fb923c', '#ffffff'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 1.5 + Math.random() * 1.0,
        type: 'confetti'
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += dt;
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha = 1 - pt.life / pt.maxLife;

      if (pt.type === 'bubble') {
        pt.vy -= 0.04;
        pt.vx *= 0.96;
      } else if (pt.type === 'confetti' || pt.type === 'dust') {
        pt.vy += 0.06;
        pt.vx *= 0.96;
      }
    }
  }

  private updateAmbientBubbles(dt: number) {
    const levelW = this.currentLevel ? this.currentLevel.width : 2800;
    const levelH = this.currentLevel ? this.currentLevel.height : 800;

    // Layer 1: Deep bubbles
    for (const b of this.bubbleLayers.deep) {
      b.y -= b.speed;
      b.wobble += dt * 1.8;
      b.x += Math.sin(b.wobble) * 0.35;
      if (b.y < -30) {
        b.y = levelH + 30;
        b.x = Math.random() * levelW;
      }
    }

    // Layer 2: Mid bubbles
    for (const b of this.bubbleLayers.mid) {
      b.y -= b.speed;
      b.wobble += dt * 2.4;
      b.x += Math.sin(b.wobble) * 0.6;
      if (b.y < -30) {
        b.y = levelH + 30;
        b.x = Math.random() * levelW;
      }
    }

    // Layer 3: Foreground bubbles
    for (const b of this.bubbleLayers.foreground) {
      b.y -= b.speed;
      b.wobble += dt * 3.2;
      b.x += Math.sin(b.wobble) * 0.9;
      if (b.y < -40) {
        b.y = levelH + 40;
        b.x = Math.random() * levelW;
      }
    }
  }

  // =============================================================
  // RENDERING ENGINE
  // =============================================================
  public render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Dynamic Underwater Depth Gradient
    this.renderOceanGradient(w, h);

    // 2. Parallax God Rays
    this.renderGodRays(w, h);

    // 3. Water Caustics Shimmer
    this.renderCaustics(w, h);

    // 4. Parallax Background Coral Reef Silhouettes
    this.renderCoralReefSilhouettes(w, h);

    // 5. Deep Parallax Bubbles (Layer 1)
    this.renderDeepBubbles();

    // Camera offset for in-world objects
    ctx.save();
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // 6. Midground Bubbles (Layer 2)
    this.renderMidBubbles();

    // 7. Water Currents
    this.renderCurrents();

    // 8. Seaweed
    this.renderSeaweeds();

    // 9. Platforms
    this.renderPlatforms();

    // 10. Trampolines (Jellyfish)
    this.renderTrampolines();

    // 11. Collectibles (Pearls & Shield Bubbles)
    this.renderPearls();
    this.renderShields();

    // 12. Goal (Chest)
    this.renderGoal();

    // 13. Enemies (Urchins, Sharks, Megalodon)
    this.renderEnemies();

    // 14. Player (Customizable Octopus Ball)
    this.renderPlayer();
    this.renderPlayerShield();

    // 15. In-world Particles
    this.renderParticles();

    ctx.restore();

    // 16. Foreground Large Parallax Bubbles (Layer 3)
    this.renderForegroundBubbles(w, h);

    // 17. Foreground Vignette & Depth Mist
    this.renderWaterVignette(w, h);

    ctx.restore();
  }

  private renderOceanGradient(w: number, h: number) {
    const { ctx } = this;
    const wave = Math.sin(this.globalTime * 0.8) * 0.04;
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0d325c'); // Sunlit upper ocean
    bgGrad.addColorStop(0.35 + wave, '#071d3a'); // Mid twilight
    bgGrad.addColorStop(0.75, '#041024'); // Abyssal boundary
    bgGrad.addColorStop(1, '#020614'); // Deep seabed trench
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  private renderGodRays(w: number, h: number) {
    const { ctx } = this;
    ctx.save();
    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      const sway = Math.sin(this.globalTime * 0.4 + i * 1.2) * 45;
      const xOffset = ((i * 240 + this.globalTime * 18 + sway) % (w + 400)) - 200;
      const rayWidth = 110 + Math.sin(this.globalTime * 0.6 + i) * 30;

      const grad = ctx.createLinearGradient(xOffset, 0, xOffset + 180, h);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
      grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(0.7, 'rgba(30, 58, 138, 0.03)');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(xOffset, 0);
      ctx.lineTo(xOffset + rayWidth, 0);
      ctx.lineTo(xOffset + rayWidth * 2.2 + sway, h);
      ctx.lineTo(xOffset + sway, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private renderCaustics(w: number, h: number) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.045)';
    ctx.lineWidth = 1.8;

    // Moving fluid light web
    const t = this.globalTime * 1.5;
    const step = 80;
    for (let y = 60; y < h; y += step) {
      ctx.beginPath();
      for (let x = 0; x <= w + step; x += step) {
        const cx = x + Math.sin(x * 0.015 + t) * 16;
        const cy = y + Math.cos(y * 0.015 + t + x * 0.01) * 14;
        if (x === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderCoralReefSilhouettes(w: number, h: number) {
    const { ctx } = this;
    ctx.save();

    // Layer 1: Distant dark navy mountain ridges
    ctx.fillStyle = '#05182e';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 50) {
      const worldX = x + this.camera.x * 0.15;
      const y = h - 190 + Math.sin(worldX * 0.003) * 60 + Math.cos(worldX * 0.007) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Layer 2: Midground coral formations, fan corals, and sea arches
    ctx.fillStyle = '#041122';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 35) {
      const worldX = x + this.camera.x * 0.35;
      const y = h - 120 + Math.sin(worldX * 0.005 + 1) * 45 + Math.sin(worldX * 0.012) * 25;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Colorful sea fans on midground reef
    const fanCount = 7;
    for (let i = 0; i < fanCount; i++) {
      const fx = ((i * 220 - this.camera.x * 0.3) % (w + 100)) + 50;
      const fy = h - 90 + Math.sin(i * 1.5) * 20;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(236, 72, 153, 0.15)' : 'rgba(56, 189, 248, 0.14)';
      ctx.beginPath();
      ctx.arc(fx, fy, 28, Math.PI, 0, false);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderDeepBubbles() {
    const { ctx } = this;
    ctx.save();
    for (const b of this.bubbleLayers.deep) {
      const screenX = (b.x - this.camera.x * 0.15) % (this.canvas.width + 100);
      const drawX = screenX < -50 ? screenX + this.canvas.width + 100 : screenX;
      ctx.fillStyle = `rgba(186, 230, 253, ${b.alpha})`;
      ctx.beginPath();
      ctx.arc(drawX, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderMidBubbles() {
    const { ctx } = this;
    ctx.save();
    for (const b of this.bubbleLayers.mid) {
      ctx.fillStyle = `rgba(224, 242, 254, ${b.alpha})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Shiny highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 1.3})`;
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderForegroundBubbles(w: number, h: number) {
    const { ctx } = this;
    ctx.save();
    for (const b of this.bubbleLayers.foreground) {
      const screenX = (b.x - this.camera.x * 1.1) % (w + 100);
      const drawX = screenX < -60 ? screenX + w + 100 : screenX;

      // Outer glassy refraction ring
      ctx.strokeStyle = `rgba(224, 242, 254, ${b.alpha * 0.9})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(drawX, b.y, b.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Translucent bubble gradient
      const bGrad = ctx.createRadialGradient(drawX - b.radius * 0.3, b.y - b.radius * 0.3, 1, drawX, b.y, b.radius);
      bGrad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.8})`);
      bGrad.addColorStop(0.6, `rgba(56, 189, 248, ${b.alpha * 0.35})`);
      bGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bGrad;
      ctx.fill();

      // Shiny white glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(drawX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderCurrents() {
    const { ctx } = this;
    for (const c of this.currentLevel.currents) {
      ctx.save();
      const grad = ctx.createLinearGradient(c.x, c.y, c.x + c.w, c.y + c.h);
      grad.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.22)');
      grad.addColorStop(1, 'rgba(14, 165, 233, 0.12)');
      ctx.fillStyle = grad;
      ctx.fillRect(c.x, c.y, c.w, c.h);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -this.globalTime * 30;
      ctx.strokeRect(c.x, c.y, c.w, c.h);

      ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
      ctx.lineWidth = 1.5;
      const lines = Math.floor(c.h / 32);
      for (let i = 0; i < lines; i++) {
        const py = c.y + 16 + i * 32;
        const lineOffset = (this.globalTime * 120 + i * 50) % c.w;
        ctx.beginPath();
        ctx.moveTo(c.x + lineOffset, py);
        ctx.lineTo(c.x + Math.min(c.w, lineOffset + 40), py + (c.forceY / (c.forceX || 1)) * 30);
        ctx.stroke();
      }

      if (c.label) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(c.label, c.x + 12, c.y + 20);
      }
      ctx.restore();
    }
  }

  private renderSeaweeds() {
    const { ctx } = this;
    ctx.save();
    for (const sw of this.seaweeds) {
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.width;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(sw.x, sw.y);

      const segLen = sw.height / sw.segments;
      let currX = sw.x;
      let currY = sw.y;

      for (let s = 1; s <= sw.segments; s++) {
        const sway = Math.sin(this.globalTime * 2.2 + sw.phase + s * 0.4) * (s * 3.5);
        const nextX = sw.x + sway;
        const nextY = sw.y - s * segLen;
        ctx.quadraticCurveTo(currX, currY, nextX, nextY);
        currX = nextX;
        currY = nextY;
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderPlatforms() {
    const { ctx } = this;

    for (const p of this.currentLevel.platforms) {
      if (p.type === 'spike') {
        this.renderSpikes(p);
        continue;
      }

      if (p.type === 'crumble' && p.isBroken) {
        continue;
      }

      ctx.save();

      if (p.type === 'crumble' && p.isCrumbling) {
        const shakeX = (Math.random() - 0.5) * 4;
        const shakeY = (Math.random() - 0.5) * 4;
        ctx.translate(shakeX, shakeY);
      }

      const bodyGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      if (p.type === 'crumble') {
        bodyGrad.addColorStop(0, '#f472b6');
        bodyGrad.addColorStop(1, '#9d174d');
      } else if (p.type === 'moving') {
        bodyGrad.addColorStop(0, '#0284c7');
        bodyGrad.addColorStop(1, '#075985');
      } else {
        bodyGrad.addColorStop(0, '#155e75');
        bodyGrad.addColorStop(1, '#083344');
      }

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      const radius = 8;
      ctx.roundRect(p.x, p.y, p.w, p.h, [radius, radius, 4, 4]);
      ctx.fill();

      const rimGrad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
      rimGrad.addColorStop(0, '#38bdf8');
      rimGrad.addColorStop(0.5, '#67e8f9');
      rimGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(p.x, p.y, p.w, 4);

      if (p.type === 'moving') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(p.x + 8, p.y + p.h - 4, p.w - 16, 4);
      }

      if (p.type === 'crumble' && p.isCrumbling) {
        ctx.strokeStyle = '#4c0519';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + p.w * 0.3, p.y);
        ctx.lineTo(p.x + p.w * 0.45, p.y + p.h * 0.7);
        ctx.lineTo(p.x + p.w * 0.7, p.y + p.h);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderSpikes(p: Platform) {
    const { ctx } = this;
    ctx.save();
    const spikeWidth = 18;
    const spikeCount = Math.floor(p.w / spikeWidth);

    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < spikeCount; i++) {
      const sx = p.x + i * spikeWidth;
      ctx.beginPath();
      ctx.moveTo(sx, p.y + p.h);
      ctx.lineTo(sx + spikeWidth / 2, p.y);
      ctx.lineTo(sx + spikeWidth, p.y + p.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderTrampolines() {
    const { ctx } = this;
    for (const j of this.currentLevel.trampolines) {
      ctx.save();
      const cx = j.x + j.w / 2;
      const cy = j.y + j.h / 2;

      ctx.translate(cx, cy);
      ctx.scale(1 / j.squish, j.squish);

      const domeGrad = ctx.createRadialGradient(0, -6, 2, 0, 0, j.w / 2);
      domeGrad.addColorStop(0, '#f472b6');
      domeGrad.addColorStop(0.7, '#ec4899');
      domeGrad.addColorStop(1, 'rgba(219, 39, 119, 0.85)');

      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, j.w / 2, j.h / 2, 0, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.lineWidth = 2;
      for (let t = -2; t <= 2; t++) {
        const tx = t * 10;
        const sway = Math.sin(this.globalTime * 4 + t) * 6;
        ctx.beginPath();
        ctx.moveTo(tx, 0);
        ctx.quadraticCurveTo(tx + sway, 12, tx, 22);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderPearls() {
    const { ctx } = this;
    for (const pr of this.currentLevel.pearls) {
      if (pr.collected) continue;

      const floatY = pr.y + Math.sin(this.globalTime * 3 + pr.floatOffset) * 6;

      ctx.save();
      const haloGrad = ctx.createRadialGradient(pr.x, floatY, 2, pr.x, floatY, pr.radius * 2.2);
      haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
      haloGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.25)');
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(pr.x, floatY, pr.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      const pearlGrad = ctx.createRadialGradient(
        pr.x - pr.radius * 0.35,
        floatY - pr.radius * 0.35,
        1,
        pr.x,
        floatY,
        pr.radius
      );
      pearlGrad.addColorStop(0, '#ffffff');
      pearlGrad.addColorStop(0.4, '#fef08a');
      pearlGrad.addColorStop(1, '#eab308');

      ctx.fillStyle = pearlGrad;
      ctx.beginPath();
      ctx.arc(pr.x, floatY, pr.radius, 0, Math.PI * 2);
      ctx.fill();

      const starAngle = this.globalTime * 2 + pr.floatOffset;
      ctx.save();
      ctx.translate(pr.x, floatY);
      ctx.rotate(starAngle);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const s = 4.5;
      ctx.moveTo(0, -s);
      ctx.lineTo(1.5, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-1.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }
  }

  private renderShields() {
    const { ctx } = this;
    if (!this.currentLevel.shields) return;
    for (const sh of this.currentLevel.shields) {
      if (sh.collected) continue;

      const floatY = sh.y + Math.sin(this.globalTime * 3.2 + sh.floatOffset) * 7;

      ctx.save();
      // 1. Shimmering outer aura
      const auraGrad = ctx.createRadialGradient(sh.x, floatY, 2, sh.x, floatY, sh.radius * 2.5);
      auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
      auraGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.2)');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(sh.x, floatY, sh.radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Translucent iridescent bubble orb
      const bubbleGrad = ctx.createRadialGradient(
        sh.x - sh.radius * 0.35,
        floatY - sh.radius * 0.35,
        1,
        sh.x,
        floatY,
        sh.radius
      );
      bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      bubbleGrad.addColorStop(0.25, 'rgba(186, 230, 253, 0.7)');
      bubbleGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.45)');
      bubbleGrad.addColorStop(0.95, 'rgba(14, 165, 233, 0.85)');
      bubbleGrad.addColorStop(1, 'rgba(192, 132, 252, 0.9)');

      ctx.fillStyle = bubbleGrad;
      ctx.beginPath();
      ctx.arc(sh.x, floatY, sh.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. Inside glowing protective shield crest
      ctx.save();
      ctx.translate(sh.x, floatY);
      const pulseScale = 1 + Math.sin(this.globalTime * 4 + sh.floatOffset) * 0.08;
      ctx.scale(pulseScale, pulseScale);

      // Shield crest path
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(7, -6);
      ctx.lineTo(5.5, 3);
      ctx.lineTo(0, 9);
      ctx.lineTo(-5.5, 3);
      ctx.lineTo(-7, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center bright emblem star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 4. Specular gloss crescent reflection on bubble
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(
        sh.x - sh.radius * 0.38,
        floatY - sh.radius * 0.38,
        sh.radius * 0.35,
        sh.radius * 0.15,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // 5. Floating text tag "ESCUDO" above
      ctx.fillStyle = 'rgba(56, 189, 248, 0.95)';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 6;
      ctx.fillText('ESCUDO', sh.x, floatY - sh.radius - 8);
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  private renderGoal() {
    const { ctx } = this;
    const g = this.currentLevel.goal;
    const cx = g.x + g.w / 2;
    const cy = g.y + g.h / 2;

    ctx.save();
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 65);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
    glow.addColorStop(0.7, 'rgba(245, 158, 11, 0.15)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(g.x + 4, g.y + 24, g.w - 8, g.h - 24, 4);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(g.x + 4, g.y + 24, 8, g.h - 24);
    ctx.fillRect(g.x + g.w - 12, g.y + 24, 8, g.h - 24);
    ctx.fillRect(g.x + 4, g.y + g.h - 8, g.w - 8, 8);

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(cx, g.y + 38, 4, 0, Math.PI * 2);
    ctx.fillRect(cx - 2, g.y + 38, 4, 7);
    ctx.fill();

    ctx.save();
    ctx.translate(g.x + 4, g.y + 24);
    const lidAngle = -g.openProgress * (Math.PI * 0.45);
    ctx.rotate(lidAngle);

    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.roundRect(0, -18, g.w - 8, 20, [8, 8, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, -18, 8, 20);
    ctx.fillRect(g.w - 16, -18, 8, 20);
    ctx.fillRect(g.w / 2 - 4, -18, 8, 20);
    ctx.restore();

    if (g.openProgress > 0) {
      const burstGrad = ctx.createRadialGradient(cx, g.y + 20, 2, cx, g.y + 20, 50 * g.openProgress);
      burstGrad.addColorStop(0, '#ffffff');
      burstGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.8)');
      burstGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = burstGrad;
      ctx.beginPath();
      ctx.arc(cx, g.y + 20, 50 * g.openProgress, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderEnemies() {
    const { ctx } = this;
    for (const e of this.currentLevel.enemies) {
      if (e.type === 'shark') {
        this.renderShark(e);
      } else if (e.type === 'megalodon') {
        this.renderMegalodon(e);
      } else {
        this.renderUrchin(e);
      }
    }
  }

  private renderUrchin(e: Enemy) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rotation);

    const spikeCount = 10;
    const innerR = e.radius * 0.75;
    const outerR = e.radius * 1.35;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    for (let i = 0; i < spikeCount * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI * i) / spikeCount;
      const sx = Math.cos(angle) * r;
      const sy = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, e.radius);
    coreGrad.addColorStop(0, '#831843');
    coreGrad.addColorStop(0.6, '#310b1a');
    coreGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-1.5, -1.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =============================================================
  // TIBURÓN (SHARK) RENDERING
  // =============================================================
  private renderShark(e: Enemy) {
    const { ctx } = this;
    const width = e.w || 76;
    const height = e.h || 32;
    const dir = e.direction;
    const jawOpen = e.jawAngle || 0.15;
    const tailOsc = e.tailAngle || 0;

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(dir, 1);

    // Subtle swimming wave tilt
    ctx.rotate(Math.sin(this.globalTime * 6) * 0.05);

    // Shark Body Silhouette Gradient
    const sharkGrad = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
    sharkGrad.addColorStop(0, '#334155'); // Dorsal steel slate
    sharkGrad.addColorStop(0.55, '#1e293b'); // Mid body
    sharkGrad.addColorStop(1, '#94a3b8'); // Pale white/grey underbelly

    // Main Torpedo Body
    ctx.fillStyle = sharkGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(width * 0.45, 0); // Snout tip
    // Upper back towards dorsal fin
    ctx.bezierCurveTo(width * 0.25, -height * 0.45, 0, -height * 0.5, -width * 0.35, -height * 0.15);
    // Lower body towards jaw
    ctx.lineTo(-width * 0.35, height * 0.15);
    ctx.bezierCurveTo(0, height * 0.5, width * 0.25, height * 0.4, width * 0.45, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dorsal Fin on top (Sharp triangular predator fin)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-width * 0.05, -height * 0.45);
    ctx.lineTo(-width * 0.18, -height * 0.95);
    ctx.lineTo(-width * 0.28, -height * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pectoral Fin on side
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.1);
    ctx.lineTo(-width * 0.12, height * 0.65);
    ctx.lineTo(-width * 0.18, height * 0.2);
    ctx.closePath();
    ctx.fill();

    // Oscillating Tail Fin
    ctx.save();
    ctx.translate(-width * 0.35, 0);
    ctx.rotate(tailOsc);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Upper tail lobe
    ctx.lineTo(-width * 0.22, -height * 0.65);
    ctx.lineTo(-width * 0.14, 0);
    // Lower tail lobe
    ctx.lineTo(-width * 0.2, height * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Gaping Animated Jaws with Sharp White Teeth
    ctx.save();
    ctx.translate(width * 0.28, height * 0.1);
    ctx.fillStyle = '#dc2626'; // Red inside mouth
    ctx.beginPath();
    ctx.arc(0, 0, 9 * (1 + jawOpen), -0.4, 0.8);
    ctx.fill();

    // White Teeth
    ctx.fillStyle = '#ffffff';
    for (let t = 0; t < 4; t++) {
      ctx.beginPath();
      ctx.moveTo(t * 3.5 - 4, -4);
      ctx.lineTo(t * 3.5 - 2, 2 * (1 + jawOpen));
      ctx.lineTo(t * 3.5, -4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Menacing Yellow Eye with slit pupil
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(width * 0.28, -height * 0.15, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(width * 0.28, -height * 0.15, 1.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gill Slits
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    for (let g = 0; g < 3; g++) {
      ctx.beginPath();
      ctx.moveTo(width * 0.12 - g * 4, -height * 0.15);
      ctx.lineTo(width * 0.1 - g * 4, height * 0.15);
      ctx.stroke();
    }

    ctx.restore();
  }

  // =============================================================
  // MEGALODÓN (APEX PREHISTORIC PREDATOR) RENDERING
  // =============================================================
  private renderMegalodon(e: Enemy) {
    const { ctx } = this;
    const width = e.w || 165;
    const height = e.h || 68;
    const dir = e.direction;
    const jawOpen = e.jawAngle || 0.25;
    const tailOsc = e.tailAngle || 0;

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(dir, 1);

    // Sinister abyssal predator aura / water wake
    const auraGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, width * 0.85);
    auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
    auraGrad.addColorStop(0.6, 'rgba(30, 27, 75, 0.15)');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Heavy scarred body gradient
    const megaGrad = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
    megaGrad.addColorStop(0, '#1e1b4b'); // Deep abyssal indigo
    megaGrad.addColorStop(0.4, '#0f172a'); // Black basalt hide
    megaGrad.addColorStop(0.8, '#334155');
    megaGrad.addColorStop(1, '#64748b'); // Textured underbelly

    // Colossal Body
    ctx.fillStyle = megaGrad;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(width * 0.46, 0); // Massive blunt snout
    ctx.bezierCurveTo(width * 0.25, -height * 0.55, 0, -height * 0.58, -width * 0.36, -height * 0.2);
    ctx.lineTo(-width * 0.36, height * 0.2);
    ctx.bezierCurveTo(0, height * 0.6, width * 0.25, height * 0.5, width * 0.46, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Battle Scars across body
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, -height * 0.25);
    ctx.lineTo(width * 0.02, -height * 0.05);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-width * 0.05, -height * 0.28);
    ctx.lineTo(-width * 0.18, -height * 0.1);
    ctx.stroke();

    // Colossal Serrated Dorsal Fin
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-width * 0.02, -height * 0.52);
    ctx.lineTo(-width * 0.16, -height * 1.15); // Towering fin
    ctx.lineTo(-width * 0.22, -height * 0.95); // Serrated notch
    ctx.lineTo(-width * 0.28, -height * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Massive Pectoral Fin
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(width * 0.06, height * 0.15);
    ctx.lineTo(-width * 0.16, height * 0.85);
    ctx.lineTo(-width * 0.24, height * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Powerful Tail Fin
    ctx.save();
    ctx.translate(-width * 0.36, 0);
    ctx.rotate(tailOsc);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-width * 0.28, -height * 0.85);
    ctx.lineTo(-width * 0.18, 0);
    ctx.lineTo(-width * 0.25, height * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Gaping Prehistoric Jaws with Double Rows of Giant Teeth
    ctx.save();
    ctx.translate(width * 0.24, height * 0.1);
    ctx.fillStyle = '#7f1d1d'; // Crimson dark cavern mouth
    ctx.beginPath();
    ctx.arc(0, 0, 18 * (1 + jawOpen), -0.5, 0.9);
    ctx.fill();

    // Giant Serrated White Teeth
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 1;
    for (let t = 0; t < 6; t++) {
      ctx.beginPath();
      ctx.moveTo(t * 6.5 - 14, -8);
      ctx.lineTo(t * 6.5 - 10, 8 * (1 + jawOpen));
      ctx.lineTo(t * 6.5 - 6, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Glowing Blood-Red Eye
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(width * 0.3, -height * 0.16, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(width * 0.3, -height * 0.16, 1.8, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5 Giant Gill Slits
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    for (let g = 0; g < 5; g++) {
      ctx.beginPath();
      ctx.moveTo(width * 0.14 - g * 6, -height * 0.22);
      ctx.lineTo(width * 0.11 - g * 6, height * 0.22);
      ctx.stroke();
    }

    // Boss Name Tag
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('MEGALODÓN', -35, -height * 0.65);

    ctx.restore();
  }

  // =============================================================
  // OCTOBALL CHARACTER RENDERING WITH SELECTED PALETTE
  // =============================================================
  private renderPlayer() {
    const { ctx } = this;
    const p = this.player;
    const color = this.colorConfig;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.invulnerableTimer > 0 && Math.sin(p.blinkTimer) > 0) {
      ctx.globalAlpha = 0.35;
    }

    ctx.scale(p.scaleX, p.scaleY);
    ctx.scale(p.facing, 1);

    const rollAngle = p.rotation * 0.35;

    // 1. Drop Shadow in water
    ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, p.radius + 6, p.radius * 0.85, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Animated Tentacles at Bottom (Using selected palette)
    const tentacleCount = 4;
    for (let i = 0; i < tentacleCount; i++) {
      const offsetX = -14 + i * 9.5;
      const sway = Math.sin(this.globalTime * 6 + i * 1.5 - p.vx * 0.5) * 6;
      const tentacleLength = 12 + (i === 1 || i === 2 ? 3 : 0);

      const tentacleGrad = ctx.createLinearGradient(offsetX, p.radius * 0.6, offsetX + sway, p.radius + tentacleLength);
      tentacleGrad.addColorStop(0, color.mid);
      tentacleGrad.addColorStop(0.6, color.warmth);
      tentacleGrad.addColorStop(1, color.secondary);

      ctx.fillStyle = tentacleGrad;
      ctx.beginPath();
      ctx.moveTo(offsetX - 4, p.radius * 0.7);
      ctx.quadraticCurveTo(offsetX + sway * 0.8, p.radius + tentacleLength * 0.5, offsetX + sway, p.radius + tentacleLength);
      ctx.quadraticCurveTo(offsetX + sway + 5, p.radius + tentacleLength * 0.6, offsetX + 4, p.radius * 0.7);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Spherical Head / Body with Custom Palette
    ctx.save();
    ctx.rotate(rollAngle);

    const bodyGrad = ctx.createRadialGradient(-p.radius * 0.3, -p.radius * 0.3, 3, 0, 0, p.radius);
    bodyGrad.addColorStop(0, color.primary);
    bodyGrad.addColorStop(0.5, color.mid);
    bodyGrad.addColorStop(0.85, color.warmth);
    bodyGrad.addColorStop(1, color.secondary);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Top Curly Swirl / Spiral Antenna
    ctx.strokeStyle = color.curls;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -p.radius + 1);
    ctx.bezierCurveTo(4, -p.radius - 8, 12, -p.radius - 12, 6, -p.radius - 17);
    ctx.bezierCurveTo(2, -p.radius - 19, -4, -p.radius - 16, -2, -p.radius - 12);
    ctx.stroke();

    // Top gloss highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-p.radius * 0.35, -p.radius * 0.45, 6, 3, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 4. Blushing Rosy Cheeks
    ctx.fillStyle = color.cheeks;
    ctx.beginPath();
    ctx.arc(-11, 4, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(11, 4, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Big Expressive Round Eyes
    const eyeRadius = 6.8;
    const pupilRadius = 4.6;
    const eyeSpacing = 8.5;

    [-eyeSpacing, eyeSpacing].forEach((ex) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, -1, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      const lookX = Math.max(-1.5, Math.min(1.5, p.vx * 0.35));
      const lookY = Math.max(-1.5, Math.min(1.5, p.vy * 0.25));

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ex + lookX, -1 + lookY, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex + lookX - 1.5, -1 + lookY - 1.5, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ex + lookX + 1.4, -1 + lookY + 1.4, 0.9, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Cute Curved Smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 3.5, 4.2, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();
  }

  // =============================================================
  // PROTECTIVE SHIELD BUBBLE RENDERING
  // =============================================================
  private renderPlayerShield() {
    const { ctx } = this;
    const p = this.player;
    if (!p.hasShield) return;

    ctx.save();
    ctx.translate(p.x, p.y);

    const isExpiring = p.shieldTimer < 3.0;
    const expireFlash = isExpiring ? Math.sin(this.globalTime * 14) : 0;
    if (isExpiring && expireFlash < -0.3) {
      ctx.globalAlpha = 0.45;
    }

    const wobble = Math.sin(this.globalTime * 5) * 1.8;
    const bubbleRadius = p.radius + 13 + wobble;

    // 1. Soft expanding atmospheric water glow
    const glowGrad = ctx.createRadialGradient(0, 0, p.radius, 0, 0, bubbleRadius * 1.4);
    glowGrad.addColorStop(0, isExpiring ? 'rgba(251, 146, 60, 0.25)' : 'rgba(56, 189, 248, 0.32)');
    glowGrad.addColorStop(0.7, isExpiring ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.12)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, bubbleRadius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Translucent Iridescent Protective Dome
    const shieldGrad = ctx.createRadialGradient(
      -bubbleRadius * 0.3,
      -bubbleRadius * 0.3,
      2,
      0,
      0,
      bubbleRadius
    );
    shieldGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    shieldGrad.addColorStop(0.3, isExpiring ? 'rgba(254, 215, 170, 0.18)' : 'rgba(186, 230, 253, 0.22)');
    shieldGrad.addColorStop(0.75, isExpiring ? 'rgba(249, 115, 22, 0.35)' : 'rgba(56, 189, 248, 0.38)');
    shieldGrad.addColorStop(0.92, isExpiring ? 'rgba(239, 68, 68, 0.65)' : 'rgba(14, 165, 233, 0.65)');
    shieldGrad.addColorStop(1, isExpiring ? 'rgba(190, 18, 60, 0.85)' : 'rgba(192, 132, 252, 0.85)');

    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(0, 0, bubbleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bubble rim outline
    ctx.strokeStyle = isExpiring ? 'rgba(254, 205, 211, 0.95)' : 'rgba(224, 242, 254, 0.95)';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // 3. Specular Glass Highlights (Crescents)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(
      -bubbleRadius * 0.42,
      -bubbleRadius * 0.42,
      bubbleRadius * 0.34,
      bubbleRadius * 0.12,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(
      bubbleRadius * 0.46,
      bubbleRadius * 0.46,
      bubbleRadius * 0.2,
      bubbleRadius * 0.08,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 4. Orbiting Mini Satellite Micro-Bubbles
    const orbiterCount = 3;
    for (let i = 0; i < orbiterCount; i++) {
      const orbAngle = this.globalTime * 3 + (i * Math.PI * 2) / orbiterCount;
      const ox = Math.cos(orbAngle) * (bubbleRadius + 4);
      const oy = Math.sin(orbAngle) * (bubbleRadius + 4);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isExpiring ? 'rgba(249, 115, 22, 0.6)' : 'rgba(56, 189, 248, 0.6)';
      ctx.beginPath();
      ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Circular Timer Arc around shield showing remaining duration of 10 seconds
    const maxTime = 10;
    const progress = Math.max(0, Math.min(1, p.shieldTimer / maxTime));
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * progress;

    ctx.strokeStyle = isExpiring ? '#ef4444' : '#34d399';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.shadowColor = isExpiring ? '#ef4444' : '#34d399';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, bubbleRadius + 7, startAngle, endAngle, false);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Small countdown text floating above
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(`🛡️ ${p.shieldTimer.toFixed(1)}s`, 0, -bubbleRadius - 13);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  private renderParticles() {
    const { ctx } = this;
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, pt.alpha));

      if (pt.type === 'bubble') {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (pt.type === 'sparkle') {
        ctx.fillStyle = pt.color;
        ctx.translate(pt.x, pt.y);
        ctx.beginPath();
        const s = pt.size;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.35, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.35, 0);
        ctx.closePath();
        ctx.fill();
      } else if (pt.type === 'confetti') {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size * 0.7);
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderWaterVignette(w: number, h: number) {
    const { ctx } = this;
    ctx.save();
    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.38, w / 2, h / 2, w * 0.72);
    vigGrad.addColorStop(0, 'transparent');
    vigGrad.addColorStop(1, 'rgba(1, 4, 15, 0.55)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
