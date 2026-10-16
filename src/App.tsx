import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  Compass,
  Download,
  Code2,
  ChevronRight,
  Maximize2,
  HelpCircle,
  X,
  Palette,
  Shield,
  ShieldAlert,
  Flame,
  Fish,
  Skull
} from 'lucide-react';
import { GameEngine } from './engine/gameEngine';
import { soundManager } from './audio/soundManager';
import { LEVELS } from './levels/levelData';
import {
  DIFFICULTIES,
  DifficultyLevel,
  GameScreen,
  OCTO_COLORS,
  OctoColorId
} from './types/game';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [screen, setScreen] = useState<GameScreen>('menu');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [maxLives, setMaxLives] = useState<number>(3);
  const [pearls, setPearls] = useState<number>(0);
  const [totalPearlsInLevel, setTotalPearlsInLevel] = useState<number>(0);
  const [totalPearlsAll, setTotalPearlsAll] = useState<number>(0);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Customization States
  const [selectedColor, setSelectedColor] = useState<OctoColorId>('coral');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('normal');

  // Shield Bubble State
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [shieldTimer, setShieldTimer] = useState<number>(0);

  // Interactive Mascot & Mouse Tracking
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMascotBlinking, setIsMascotBlinking] = useState<boolean>(false);
  const [mascotHop, setMascotHop] = useState<boolean>(false);

  // Modals
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [standaloneHtmlContent, setStandaloneHtmlContent] = useState<string>('');

  // Mascot blinking interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsMascotBlinking(true);
      setTimeout(() => setIsMascotBlinking(false), 160);
    }, 3200);
    return () => clearInterval(blinkInterval);
  }, []);

  // Track global cursor for mascot eye following
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2 - 120;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      setMousePos({
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy))
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleMascotClick = () => {
    setMascotHop(true);
    soundManager.playJump();
    setTimeout(() => setMascotHop(false), 500);
  };

  // Sync state from engine
  const handleEngineStateChange = useCallback((eng: GameEngine) => {
    setScreen(eng.screen);
    setCurrentLevel(eng.currentLevelIndex + 1);
    setLives(eng.lives);
    setMaxLives(eng.maxLives);
    setPearls(eng.pearlsCollected);
    setTotalPearlsInLevel(eng.totalPearlsInLevel);
    setTotalPearlsAll(eng.totalPearlsAllLevels);
    setUnlockedLevel(eng.unlockedLevel);
    setSelectedColor(eng.colorId);
    setSelectedDifficulty(eng.difficultyId);
    setShieldActive(Boolean(eng.player?.hasShield));
    setShieldTimer(eng.player?.shieldTimer || 0);
  }, []);

  // Fetch standalone HTML content
  useEffect(() => {
    fetch('/octoball.html')
      .then((res) => res.text())
      .then((txt) => setStandaloneHtmlContent(txt))
      .catch(() => {});
  }, []);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 1280;
    canvas.height = 720;

    const engine = new GameEngine(canvas, handleEngineStateChange);
    engineRef.current = engine;
    engine.startLoop();

    return () => {
      engine.stopLoop();
    };
  }, [handleEngineStateChange]);

  const handleSelectColor = (id: OctoColorId) => {
    setSelectedColor(id);
    if (engineRef.current) {
      engineRef.current.setColor(id);
    }
  };

  const handleSelectDifficulty = (diff: DifficultyLevel) => {
    setSelectedDifficulty(diff);
    if (engineRef.current) {
      engineRef.current.setDifficulty(diff);
      setMaxLives(engineRef.current.maxLives);
      setLives(engineRef.current.lives);
    }
  };

  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.loadLevel(0);
    engineRef.current.startGame();
  };

  const handleRestartLevel = () => {
    if (!engineRef.current) return;
    engineRef.current.restartLevel();
  };

  const handleNextLevel = () => {
    if (!engineRef.current) return;
    engineRef.current.nextLevel();
  };

  const handleSelectLevel = (idx: number) => {
    if (!engineRef.current) return;
    engineRef.current.selectLevel(idx);
    setShowLevelModal(false);
  };

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    engineRef.current.pauseGame();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleDownloadStandaloneHtml = () => {
    if (!standaloneHtmlContent) return;
    const blob = new Blob([standaloneHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'octoball-juego.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (!standaloneHtmlContent) return;
    navigator.clipboard.writeText(standaloneHtmlContent).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    });
  };

  const activeLevelData = engineRef.current?.currentLevel || LEVELS[currentLevel - 1];
  const hasShark = activeLevelData?.enemies?.some((e) => e.type === 'shark');
  const hasMegalodon = activeLevelData?.enemies?.some((e) => e.type === 'megalodon');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center font-sans select-none text-white">
      {/* Game Viewport Container */}
      <div className="relative w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#0b294f_0%,_#020617_100%)]">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain max-w-[1920px] max-h-[1080px] shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        />

        {/* TOP HUD (Always visible during gameplay) */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
          {/* Level & Lives Badge */}
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-sky-500/30 shadow-lg">
            <span className="font-extrabold text-sky-400 text-xs sm:text-sm tracking-wider">
              NIVEL {currentLevel}/10
            </span>
            <div className="flex gap-1">
              {Array.from({ length: maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                    i < lives
                      ? 'fill-rose-500 text-rose-500 scale-100 animate-pulse'
                      : 'text-slate-600 fill-slate-800 scale-90'
                  }`}
                />
              ))}
            </div>

            {/* Difficulty Badge indicator */}
            <span
              className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full border ${
                selectedDifficulty === 'easy'
                  ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300'
                  : selectedDifficulty === 'hard'
                  ? 'bg-rose-950/80 border-rose-400/50 text-rose-300'
                  : 'bg-sky-950/80 border-sky-400/50 text-sky-300'
              }`}
            >
              {DIFFICULTIES[selectedDifficulty].name}
            </span>
          </div>

          {/* Pearl Counter, Shield Indicator & Marine Hazard Warning */}
          <div className="flex items-center gap-2">
            {shieldActive && (
              <div className="pointer-events-auto flex items-center gap-2 bg-sky-950/90 border border-sky-400 text-sky-200 px-3 py-1.5 rounded-2xl text-xs font-black shadow-[0_0_15px_rgba(56,189,248,0.6)] animate-pulse">
                <Shield className="w-4 h-4 text-sky-400 fill-sky-400/40" />
                <span>ESCUDO: {shieldTimer.toFixed(1)}s</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-sky-500/40">
                  <div
                    className={`h-full transition-all duration-100 ${shieldTimer < 3 ? 'bg-rose-500' : 'bg-sky-400'}`}
                    style={{ width: `${Math.min(100, (shieldTimer / 10) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {hasMegalodon && (
              <div className="hidden sm:flex pointer-events-auto items-center gap-1.5 bg-rose-950/90 border border-rose-500 text-rose-300 px-3 py-1.5 rounded-2xl text-xs font-black animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <Skull className="w-4 h-4 text-rose-400" />
                ¡MEGALODÓN EN ZONA!
              </div>
            )}
            {!hasMegalodon && hasShark && (
              <div className="hidden sm:flex pointer-events-auto items-center gap-1.5 bg-indigo-950/90 border border-sky-400 text-sky-300 px-3 py-1.5 rounded-2xl text-xs font-black shadow-md">
                <Fish className="w-4 h-4 text-sky-400" />
                ZONA DE TIBURONES
              </div>
            )}

            <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-400/30 shadow-lg">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-100 to-white shadow-[0_0_10px_#facc15]" />
              <span className="font-black text-amber-300 text-xs sm:text-sm">
                {pearls} / {totalPearlsInLevel}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Activar Sonido' : 'Silenciar'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/85 hover:bg-sky-600 border border-sky-400/40 flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />}
            </button>
            <button
              onClick={handleRestartLevel}
              title="Reiniciar Nivel (R)"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/85 hover:bg-sky-600 border border-sky-400/40 flex items-center justify-center transition-all shadow-md active:scale-95 text-sky-300"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleTogglePause}
              title="Pausar / Menú"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/85 hover:bg-sky-600 border border-sky-400/40 flex items-center justify-center transition-all shadow-md active:scale-95 text-sky-300"
            >
              {screen === 'playing' ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button
              onClick={handleToggleFullscreen}
              title="Pantalla Completa"
              className="hidden sm:flex w-10 h-10 rounded-full bg-slate-900/85 hover:bg-sky-600 border border-sky-400/40 items-center justify-center transition-all shadow-md active:scale-95 text-sky-300"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM VIRTUAL MOBILE CONTROLS */}
        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end pointer-events-none z-20">
          <div className="pointer-events-auto flex gap-3">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                engineRef.current?.setTouchInput('left', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                engineRef.current?.setTouchInput('left', false);
              }}
              onMouseDown={() => engineRef.current?.setTouchInput('left', true)}
              onMouseUp={() => engineRef.current?.setTouchInput('left', false)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/75 active:bg-sky-600/80 border-2 border-sky-400/40 backdrop-blur-md flex items-center justify-center text-sky-200 font-black text-2xl shadow-xl transition-transform active:scale-90"
            >
              ◀
            </button>
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                engineRef.current?.setTouchInput('right', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                engineRef.current?.setTouchInput('right', false);
              }}
              onMouseDown={() => engineRef.current?.setTouchInput('right', true)}
              onMouseUp={() => engineRef.current?.setTouchInput('right', false)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/75 active:bg-sky-600/80 border-2 border-sky-400/40 backdrop-blur-md flex items-center justify-center text-sky-200 font-black text-2xl shadow-xl transition-transform active:scale-90"
            >
              ▶
            </button>
          </div>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              engineRef.current?.setTouchInput('jump', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              engineRef.current?.setTouchInput('jump', false);
            }}
            onMouseDown={() => engineRef.current?.setTouchInput('jump', true)}
            onMouseUp={() => engineRef.current?.setTouchInput('jump', false)}
            style={{
              background: `linear-gradient(135deg, ${OCTO_COLORS[selectedColor].primary}, ${OCTO_COLORS[selectedColor].warmth})`,
              boxShadow: `0 0 25px ${OCTO_COLORS[selectedColor].glow}80`
            }}
            className="pointer-events-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/60 active:scale-90 flex flex-col items-center justify-center text-white font-black text-xs sm:text-sm tracking-widest transition-transform"
          >
            <span className="text-xl">▲</span>
            <span>SALTAR</span>
          </button>
        </div>

        {/* SCREEN OVERLAY: START MENU */}
        {screen === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center z-40 p-4 sm:p-6 text-center animate-fade-in overflow-y-auto">
            {/* Interactive Mascot in selected color */}
            <div className="relative mb-2 flex items-center justify-center">
              {/* Background ambient bubble motes around mascot */}
              <div className="absolute -top-4 -left-6 text-xs animate-bounce opacity-80">🫧</div>
              <div className="absolute -bottom-2 -right-5 text-sm animate-pulse opacity-75">🫧</div>
              <div className="absolute top-2 -right-7 text-xs animate-bounce delay-300 opacity-80">✨</div>

              {/* Interactive Mascot Ball */}
              <div
                onClick={handleMascotClick}
                title="¡Haz clic para interactuar con tu pulpo!"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${OCTO_COLORS[selectedColor].primary}, ${OCTO_COLORS[selectedColor].mid} 55%, ${OCTO_COLORS[selectedColor].warmth} 85%, ${OCTO_COLORS[selectedColor].secondary} 100%)`,
                  boxShadow: `0 0 45px ${OCTO_COLORS[selectedColor].glow}99, 0 10px 25px rgba(0,0,0,0.6)`
                }}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-white/50 cursor-pointer flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 ${
                  mascotHop ? 'scale-125 -translate-y-4' : 'animate-float'
                }`}
              >
                {/* Top Curly Spiral Antenna */}
                <svg
                  className="absolute -top-6 w-8 h-8 text-white filter drop-shadow-sm"
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke={OCTO_COLORS[selectedColor].curls}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                >
                  <path d="M16 28 C 17 20, 26 14, 20 8 C 16 3, 10 7, 12 12 C 13 15, 17 15, 17 13" />
                </svg>

                {/* Specular Head Gloss */}
                <div className="absolute top-3 left-4 w-6 h-3 bg-white/45 rounded-full -rotate-45 blur-[0.5px]" />

                {/* Eyes Container */}
                <div className="flex gap-4 items-center justify-center mt-1">
                  {/* Left Eye */}
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shadow-inner overflow-hidden">
                    {isMascotBlinking ? (
                      <div className="w-full h-1 bg-slate-900 rounded-full" />
                    ) : (
                      <div
                        style={{
                          transform: `translate(${mousePos.x * 3.5}px, ${mousePos.y * 3}px)`
                        }}
                        className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-slate-950 flex items-center justify-center transition-transform duration-75"
                      >
                        {/* Primary reflection highlight */}
                        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white" />
                        {/* Secondary tiny highlight */}
                        <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-white/80" />
                      </div>
                    )}
                  </div>

                  {/* Right Eye */}
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shadow-inner overflow-hidden">
                    {isMascotBlinking ? (
                      <div className="w-full h-1 bg-slate-900 rounded-full" />
                    ) : (
                      <div
                        style={{
                          transform: `translate(${mousePos.x * 3.5}px, ${mousePos.y * 3}px)`
                        }}
                        className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-slate-950 flex items-center justify-center transition-transform duration-75"
                      >
                        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white" />
                        <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-white/80" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Cheeks and Smile */}
                <div className="relative w-full flex items-center justify-center mt-1">
                  {/* Left Rosy Cheek */}
                  <div
                    style={{ backgroundColor: OCTO_COLORS[selectedColor].cheeks }}
                    className="absolute left-3 w-4 h-3 rounded-full blur-[0.5px]"
                  />
                  {/* Smile */}
                  <div className="w-5 h-2.5 border-b-[2.5px] border-slate-950 rounded-b-full" />
                  {/* Right Rosy Cheek */}
                  <div
                    style={{ backgroundColor: OCTO_COLORS[selectedColor].cheeks }}
                    className="absolute right-3 w-4 h-3 rounded-full blur-[0.5px]"
                  />
                </div>

                {/* Bottom Swaying Tentacles */}
                <div className="absolute -bottom-4 flex gap-1.5">
                  {[0, 1, 2, 3].map((t) => (
                    <div
                      key={t}
                      style={{
                        background: `linear-gradient(to bottom, ${OCTO_COLORS[selectedColor].mid}, ${OCTO_COLORS[selectedColor].warmth})`,
                        animationDelay: `${t * 150}ms`
                      }}
                      className="w-3.5 h-4.5 rounded-b-full shadow-sm animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Glowing Neon Ocean Title */}
            <div className="relative">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]">
                <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 bg-clip-text text-transparent">
                  OCTO
                </span>
                <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-300 bg-clip-text text-transparent ml-1">
                  BALL
                </span>
              </h1>
              <p className="text-sky-300 font-extrabold text-sm sm:text-base tracking-widest uppercase mt-1 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]">
                🫧 AVENTURA SUBMARINA 🫧
              </p>
            </div>

            {/* Color & Difficulty Selectors Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-lg">
              {/* Octo Color Selector Pills */}
              <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg">
                <Palette className="w-4 h-4 text-slate-400 ml-1.5" />
                {(['coral', 'ocean', 'kelp', 'neon', 'sun'] as OctoColorId[]).map((cid) => {
                  const cfg = OCTO_COLORS[cid];
                  const isSelected = selectedColor === cid;
                  return (
                    <button
                      key={cid}
                      onClick={() => handleSelectColor(cid)}
                      title={cfg.name}
                      style={{ backgroundColor: cfg.primary }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        isSelected ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.7)]' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Difficulty Mode Selector Pills */}
              <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-1 rounded-2xl flex items-center shadow-lg">
                {(['easy', 'normal', 'hard'] as DifficultyLevel[]).map((d) => {
                  const isSelected = selectedDifficulty === d;
                  const cfg = DIFFICULTIES[d];
                  return (
                    <button
                      key={d}
                      onClick={() => handleSelectDifficulty(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? d === 'easy'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : d === 'hard'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-sky-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cfg.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-slate-400 max-w-md text-xs sm:text-sm mt-3 leading-relaxed">
              {DIFFICULTIES[selectedDifficulty].description}
            </p>

            {/* Menu Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
              <button
                onClick={handleStartGame}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-sky-600 text-white font-extrabold text-base sm:text-lg shadow-[0_8px_25px_rgba(244,63,94,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                JUGAR AVENTURA
              </button>
              <button
                onClick={() => setShowLevelModal(true)}
                className="px-6 py-3.5 rounded-full bg-slate-900/90 border border-sky-400/40 hover:bg-slate-800 text-sky-300 font-bold text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5 text-sky-400" />
                Niveles (10)
              </button>
            </div>

            {/* Extra Tools: Download HTML & Help */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                onClick={handleDownloadStandaloneHtml}
                className="px-3.5 py-1.5 rounded-xl bg-sky-950/70 border border-sky-500/40 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 transition-all flex items-center gap-1.5"
                title="Descargar versión de 1 solo archivo HTML autónomo"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Descargar .HTML único
              </button>
              <button
                onClick={() => setShowCodeModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/70 border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                Código Fuente
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/70 border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Guía & Enemigos
              </button>
            </div>
          </div>
        )}

        {/* SCREEN OVERLAY: PAUSED */}
        {screen === 'paused' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-40 p-6 text-center">
            <h2 className="text-4xl font-black text-sky-400 mb-2">JUEGO EN PAUSA</h2>
            <p className="text-slate-400 text-sm max-w-sm mb-4">Ajusta tu pulpo o descansa unos segundos.</p>

            {/* Quick Color Switcher in Pause */}
            <div className="bg-slate-900/90 border border-slate-700 p-2 rounded-2xl flex items-center gap-2 mb-6">
              <span className="text-xs text-slate-400 font-bold">Color:</span>
              {(['coral', 'ocean', 'kelp', 'neon', 'sun'] as OctoColorId[]).map((cid) => {
                const cfg = OCTO_COLORS[cid];
                return (
                  <button
                    key={cid}
                    onClick={() => handleSelectColor(cid)}
                    style={{ backgroundColor: cfg.primary }}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedColor === cid ? 'border-white scale-110' : 'border-transparent opacity-60'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex flex-col gap-3 w-56">
              <button
                onClick={handleTogglePause}
                className="w-full py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black transition-all"
              >
                CONTINUAR
              </button>
              <button
                onClick={handleRestartLevel}
                className="w-full py-3 rounded-full bg-slate-900 border border-sky-400/40 text-sky-300 font-bold transition-all hover:bg-slate-800"
              >
                REINICIAR NIVEL
              </button>
              <button
                onClick={() => {
                  engineRef.current?.stopLoop();
                  setScreen('menu');
                  engineRef.current!.screen = 'menu';
                }}
                className="w-full py-2 rounded-full text-slate-400 hover:text-white text-xs"
              >
                Salir al Menú Principal
              </button>
            </div>
          </div>
        )}

        {/* SCREEN OVERLAY: LEVEL COMPLETE */}
        {screen === 'level_complete' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-center z-40 p-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl mb-3 shadow-[0_0_30px_#10b981]">
              ✨
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-emerald-400 mb-1">¡NIVEL SUPERADO!</h2>
            <p className="text-slate-300 font-semibold mb-5 text-sm sm:text-base">
              Has abierto el cofre del tesoro y escapado de los peligros marinos.
            </p>

            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-center gap-6">
              <div className="text-center">
                <span className="block text-xs text-slate-400 uppercase font-bold">Perlas de nivel</span>
                <span className="text-2xl font-black text-amber-300">
                  {pearls} / {totalPearlsInLevel}
                </span>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-center">
                <span className="block text-xs text-slate-400 uppercase font-bold">Total acumulado</span>
                <span className="text-2xl font-black text-sky-400">{totalPearlsAll} ⚪</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleNextLevel}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-base sm:text-lg shadow-[0_8px_25px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                SIGUIENTE NIVEL
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleRestartLevel}
                className="px-5 py-3 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold transition-all text-sm"
              >
                Rejugar
              </button>
            </div>
          </div>
        )}

        {/* SCREEN OVERLAY: GAME OVER */}
        {screen === 'game_over' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-40 p-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_#f43f5e]">
              💥
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-rose-500 mb-2">¡GAME OVER!</h2>
            <p className="text-slate-400 max-w-sm text-sm sm:text-base mb-6">
              Las mandíbulas, espinas o el abismo te han atrapado. ¡Prueba otra estrategia!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRestartLevel}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-base shadow-[0_8px_25px_rgba(244,63,94,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                REINTENTAR NIVEL
              </button>
              <button
                onClick={() => {
                  setScreen('menu');
                  engineRef.current!.screen = 'menu';
                }}
                className="px-6 py-3.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all text-sm"
              >
                Menú Principal
              </button>
            </div>
          </div>
        )}

        {/* SCREEN OVERLAY: FINAL VICTORY */}
        {screen === 'victory' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-40 p-6 text-center animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-5xl mb-3 shadow-[0_0_50px_#facc15] animate-pulse">
              👑
            </div>
            <h1 className="text-3xl sm:text-6xl font-black bg-gradient-to-r from-amber-300 via-yellow-100 to-sky-300 bg-clip-text text-transparent mb-2">
              ¡DOMINADOR DEL ABISMO!
            </h1>
            <p className="text-sky-300 font-bold text-base sm:text-lg mb-4">
              ¡Has derrotado al colosal Megalodón y conquistado los 10 Niveles de OctoBall!
            </p>
            <div className="bg-slate-900/90 border border-amber-400/40 rounded-2xl p-4 mb-6 max-w-sm w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs sm:text-sm">Dificultad superada</span>
                <span className="font-extrabold text-emerald-400 uppercase text-xs sm:text-sm">
                  {DIFFICULTIES[selectedDifficulty].name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs sm:text-sm">Perlas totales</span>
                <span className="font-extrabold text-amber-300 text-base sm:text-lg">{totalPearlsAll} ⚪</span>
              </div>
            </div>
            <button
              onClick={handleStartGame}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-base sm:text-lg shadow-[0_8px_25px_rgba(251,191,36,0.6)] hover:brightness-110 active:scale-95 transition-all"
            >
              JUGAR DE NUEVO
            </button>
          </div>
        )}

        {/* MODAL: LEVEL SELECTOR */}
        {showLevelModal && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-sky-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
              <button
                onClick={() => setShowLevelModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-black text-sky-400 mb-1 flex items-center gap-2">
                <Compass className="w-6 h-6 text-sky-400" />
                SELECCIONAR NIVEL (10)
              </h3>
              <p className="text-slate-400 text-xs mb-5">
                Desbloquea los niveles completando el anterior en cualquier dificultad.
              </p>

              <div className="grid grid-cols-5 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {LEVELS.map((lvl, idx) => {
                  const isUnlocked = idx < unlockedLevel;
                  const hasMega = lvl.enemies?.some((e) => e.type === 'megalodon');
                  const hasShk = lvl.enemies?.some((e) => e.type === 'shark');
                  return (
                    <button
                      key={lvl.id}
                      disabled={!isUnlocked}
                      onClick={() => handleSelectLevel(idx)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isUnlocked
                          ? 'bg-slate-800/80 border-sky-400/40 hover:bg-sky-600 hover:border-sky-300 text-white cursor-pointer hover:scale-105 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <span className="text-lg font-black">{lvl.id}</span>
                      <span className="text-[10px] mt-0.5 truncate font-semibold">
                        {isUnlocked ? (hasMega ? '🦈👑' : hasShk ? '🦈' : '⚪' + lvl.pearls.length) : '🔒'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW STANDALONE HTML CODE */}
        {showCodeModal && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-base sm:text-lg">Código Fuente HTML Único (Single-File)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    {codeCopied ? '¡Copiado!' : 'Copiar Todo'}
                  </button>
                  <button
                    onClick={handleDownloadStandaloneHtml}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </button>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="text-slate-400 hover:text-white ml-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 mt-3 overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-auto h-full select-text">
                  {standaloneHtmlContent || 'Cargando código autónomo...'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: HELP / GUIDE (WITH SHARK & MEGALODON DETAILS) */}
        {showHelpModal && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-sky-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative my-auto">
              <button
                onClick={() => setShowHelpModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-black text-sky-400 mb-4 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-sky-400" />
                GUÍA DE PELIGROS & ENEMIGOS
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-sky-500/40">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
                      Burbuja de Escudo (10 Segundos)
                      <span className="text-[10px] bg-sky-900/80 text-sky-300 px-1.5 py-0.5 rounded-full border border-sky-400/40">Power-up</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Envuelve al pulpo en una esfera acuática iridiscente que absorbe 1 impacto completo de cualquier enemigo o púa sin restar corazones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-2xl">🦈</span>
                  <div>
                    <h4 className="font-bold text-sky-400">Tiburones (Desde el Nivel 5)</h4>
                    <p className="text-xs text-slate-400">
                      Patrullan a gran velocidad cortando el agua con su aleta dorsal y abriendo sus mandíbulas. Cruza en el momento exacto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-rose-500/40">
                  <span className="text-2xl">👑</span>
                  <div>
                    <h4 className="font-bold text-rose-400">Megalodón (Niveles 9 y 10)</h4>
                    <p className="text-xs text-slate-400">
                      El depredador supremo gigante. Quita 2 vidas por mordida y hace temblar la pantalla al acecharte. ¡No te acerques de frente!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-2xl">🪼</span>
                  <div>
                    <h4 className="font-bold text-pink-400">Medusas Trampolín</h4>
                    <p className="text-xs text-slate-400">
                      Rebota sobre su cúpula bioluminiscente para alcanzar plataformas y sobrevolar a los tiburones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-2xl">🧱</span>
                  <div>
                    <h4 className="font-bold text-pink-300">Corales Quebradizos</h4>
                    <p className="text-xs text-slate-400">
                      Bloques que tiemblan y se derrumban poco después de pisarlos (más rápido en modo Difícil).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-6 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                >
                  ¡Listo para Nadar!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
