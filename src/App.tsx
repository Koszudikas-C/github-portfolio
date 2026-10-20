import { useState, useMemo, useEffect, useRef, useCallback, memo, lazy, Suspense } from 'react';
import { 
  Folder, 
  Lock, 
  ExternalLink, 
  Code, 
  Code2,
  Briefcase,
  X, 
  Cpu, 
  FileText,
  Terminal,
  Sparkles,
  CheckCircle2,
  Network,
  ChevronRight,
  ChevronLeft,
  User,
  Send,
  Volume2,
  VolumeX,
  ShieldCheck,
  Heart,
  Rocket,
  ArrowRight,
  Check,
  Hand,
  Menu,
  Copy,
  Mail
} from 'lucide-react';
import { repositories } from './data/repositories';
import type { Repository } from './data/repositories';
import avatarProfileImg from './assets/avatar-profile.webp';
import bgMusicAudio from './assets/Ink_and_Keys.mp3';
import { useLanguage } from './i18n/useLanguage';
import { languageColors, categoryIcons, skillsData, skillsDataByLanguage } from './data/constants';
import { VersionGatewayModal, type ViewMode } from './components/VersionGatewayModal';
import { BusinessView } from './components/BusinessView';

// Tradução de métricas de destaque dos projetos
const translateHighlightMetric = (metric?: string, lang: 'pt' | 'en' = 'pt'): string => {
  if (!metric) return '';
  if (lang === 'pt') return metric;
  const map: Record<string, string> = {
    ".NET 10 • pgvector & IA Multimodelo": ".NET 10 • pgvector & Multi-Model AI",
    "7 Marketplaces • Arbitragem Real-Time": "7 Marketplaces • Real-Time Arbitrage",
    "Anti-Detect • ONNX & Vision": "Anti-Detect • ONNX & Vision",
    "Streaming 7GB+ • Rust & Graph": "7GB+ Streaming • Rust & Graph",
    "IA Agronômica • YOLOv11/v26": "Agronomic AI • YOLOv11/v26",
    "Angular 21 • Signals & Cockpit": "Angular 21 • Signals & Cockpit",
    "Identity API • Multi-Device RBAC": "Identity API • Multi-Device RBAC",
  };
  return map[metric] || metric.replace(/Arbitragem/g, 'Arbitrage');
};

// Imagens LCP pré-carregadas do diretório public
const avatarTransparentImg = `${import.meta.env.BASE_URL}avatar-transparent.webp`;
const avatarTransparentMobileImg = `${import.meta.env.BASE_URL}avatar-transparent-mobile.webp`;

// Catálogo completo carregado sob demanda (code-splitting da listagem e filtros)
const CatalogSection = lazy(() => import('./components/CatalogSection').then(m => ({ default: m.CatalogSection })));

// Ícone 3D Isometric Cube com < /> (inspirado na abertura e marca da referência)
const IsometricCubeLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="drop-shadow(0px 4px 10px rgba(56, 189, 248, 0.4))">
      {/* Top face */}
      <polygon points="50,15 85,32 50,50 15,32" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
      {/* Left face */}
      <polygon points="15,32 50,50 50,85 15,68" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
      {/* Right face */}
      <polygon points="50,50 85,32 85,68 50,85" fill="#0b1120" stroke="#38bdf8" strokeWidth="3" />
      
      {/* Inner Code Brackets < / > */}
      <path d="M43,44 L37,50 L43,56" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M57,44 L63,50 L57,56" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M53,42 L47,58" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

// Componente Memoizado: Hero 3D Interactive Avatar (Direct DOM / rAF - Eye Tracking & Blinking)
const HeroInteractiveAvatar = memo(({
  avatarImg,
  avatarMobileImg,
  chip1Text,
  chip2Text,
  chip3Text,
  onAvatarClick,
}: {
  avatarImg: string;
  avatarMobileImg?: string;
  chip1Text: string;
  chip2Text: string;
  chip3Text: string;
  onAvatarClick?: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef<SVGGElement>(null);
  const rightPupilRef = useRef<SVGGElement>(null);
  const leftEyelidRef = useRef<SVGGElement>(null);
  const rightEyelidRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number | null>(null);
  const blinkTimeoutRef = useRef<number | null>(null);

  // Blinking orgânico e natural (a cada 3.2s a 5.8s, com chance de piscada dupla)
  const executeBlink = useCallback((isDouble = false) => {
    if (!leftEyelidRef.current || !rightEyelidRef.current) return;
    
    // Fecha pálpebras
    leftEyelidRef.current.style.transform = 'scaleY(1)';
    rightEyelidRef.current.style.transform = 'scaleY(1)';

    setTimeout(() => {
      if (!leftEyelidRef.current || !rightEyelidRef.current) return;
      leftEyelidRef.current.style.transform = 'scaleY(0)';
      rightEyelidRef.current.style.transform = 'scaleY(0)';

      if (isDouble) {
        // Segunda piscada rápida
        setTimeout(() => {
          if (!leftEyelidRef.current || !rightEyelidRef.current) return;
          leftEyelidRef.current.style.transform = 'scaleY(1)';
          rightEyelidRef.current.style.transform = 'scaleY(1)';
          setTimeout(() => {
            if (!leftEyelidRef.current || !rightEyelidRef.current) return;
            leftEyelidRef.current.style.transform = 'scaleY(0)';
            rightEyelidRef.current.style.transform = 'scaleY(0)';
          }, 120);
        }, 110);
      }
    }, 130);
  }, []);

  useEffect(() => {
    let active = true;
    const scheduleNextBlink = () => {
      if (!active) return;
      const delay = 3200 + Math.random() * 2600; // entre 3.2s e 5.8s
      blinkTimeoutRef.current = window.setTimeout(() => {
        if (!active) return;
        const isDouble = Math.random() < 0.18; // 18% de chance de piscada dupla
        executeBlink(isDouble);
        scheduleNextBlink();
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      active = false;
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [executeBlink]);

  // Rastreamento suave do ponteiro do mouse em toda a janela (Aceleração GPU / Zero re-render no desktop, inerte no mobile)
  useEffect(() => {
    // Em dispositivos móveis touch, não registra ouvintes de mouse desnecessários
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !avatarRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      // Posição da cabeça do personagem (aproximadamente a 25% do topo do container)
      const headCenterX = rect.left + rect.width * 0.5;
      const headCenterY = rect.top + rect.height * 0.28;

      const dx = e.clientX - headCenterX;
      const dy = e.clientY - headCenterY;
      const dist = Math.hypot(dx, dy);

      // Tilt sutil 3D da cabeça/corpo (max 12deg no X, 9deg no Y)
      const maxTilt = 12;
      const tiltY = Math.max(-maxTilt, Math.min(maxTilt, (dx / (window.innerWidth * 0.5)) * maxTilt));
      const tiltX = Math.max(-8, Math.min(8, (-dy / (window.innerHeight * 0.5)) * 8));

      // Movimento das pupilas acompanhando o ponteiro (raio max de ~6.5px para anatomia orgânica)
      const maxEyeShiftX = 6.2;
      const maxEyeShiftY = 4.8;
      const eyeDamping = Math.min(1, dist / 400);
      const angle = Math.atan2(dy, dx);
      const pupilX = Number((Math.cos(angle) * maxEyeShiftX * eyeDamping).toFixed(2));
      const pupilY = Number((Math.sin(angle) * maxEyeShiftY * eyeDamping).toFixed(2));

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (avatarRef.current) {
          avatarRef.current.style.transform = `perspective(1000px) rotateY(${tiltY.toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg)`;
        }
        if (leftPupilRef.current) {
          leftPupilRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        }
        if (rightPupilRef.current) {
          rightPupilRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        }
      });
    };

    const handleMouseLeaveWindow = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (avatarRef.current) {
          avatarRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        }
        if (leftPupilRef.current) {
          leftPupilRef.current.style.transform = 'translate(0px, 0px)';
        }
        if (rightPupilRef.current) {
          rightPupilRef.current.style.transform = 'translate(0px, 0px)';
        }
      });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="lg:col-span-5 relative flex flex-col items-center justify-center w-full py-4 select-none"
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg">
        {/* Luz de Fundo e Brilho Suave */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[420px] h-80 sm:h-[420px] bg-gradient-to-tr from-blue-600/20 via-[#38bdf8]/15 to-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Badges Flutuantes 100% Nítidos em Camada Vetorial (100% Aceleração GPU / 60-120 FPS) */}
        <div className="hidden sm:flex absolute top-4 -left-6 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#090d1c] border border-rose-500/50 text-rose-300 text-xs font-mono font-medium shadow-xl shadow-rose-950/30 animate-badge-1 pointer-events-none">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-beacon absolute inline-flex h-full w-full rounded-full bg-rose-400" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          </span>
          <span className="font-semibold tracking-wide">{chip1Text}</span>
        </div>

        <div className="hidden sm:flex absolute top-14 -right-6 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#090d1c] border border-amber-500/50 text-amber-300 text-xs font-mono font-medium shadow-xl shadow-amber-950/30 animate-badge-2 pointer-events-none">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-beacon absolute inline-flex h-full w-full rounded-full bg-amber-400" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </span>
          <span className="font-semibold tracking-wide">{chip2Text}</span>
        </div>

        <div className="hidden sm:flex absolute bottom-28 -left-8 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#090d1c] border border-sky-500/50 text-[#38bdf8] text-xs font-mono font-medium shadow-xl shadow-sky-950/30 animate-badge-3 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 animate-pulse" />
          <span className="font-semibold tracking-wide">{chip3Text}</span>
        </div>

        {/* O Personagem 3D com Tilt Interativo, Eye Tracking & Blinking */}
        <div
          ref={avatarRef}
          onClick={() => {
            executeBlink(true);
            if (onAvatarClick) onAvatarClick();
          }}
          style={{
            transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="relative flex flex-col items-center justify-center transition-transform duration-150 ease-out cursor-pointer group"
          title="Clique para interagir!"
        >
          <div className="relative inline-block">
            <img
              src={avatarImg}
              srcSet={avatarMobileImg ? `${avatarMobileImg} 440w, ${avatarImg} 662w` : undefined}
              sizes="(max-width: 640px) 240px, 420px"
              alt="Matheus Gomes"
              loading="eager"
              fetchPriority="high"
              width="662"
              height="1811"
              className="relative z-10 h-[390px] sm:h-[490px] lg:h-[550px] w-auto max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] pointer-events-none group-hover:scale-[1.01] transition-transform duration-300"
            />

            {/* Camada Interativa SVG: Scleras, Pupilas Vivas e Pálpebras Orgânicas */}
            <svg
              viewBox="0 0 662 1811"
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              aria-hidden="true"
            >
              <defs>
                {/* Filtro de Suavização para Sombras e Bordas Orgânicas */}
                <filter id="eyeShadowBlur" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="1.5" />
                </filter>

                {/* Recorte das órbitas oculares (dentro da armação dos óculos) */}
                <clipPath id="leftEyeClip">
                  <ellipse cx="215" cy="450" rx="60" ry="50" />
                </clipPath>
                <clipPath id="rightEyeClip">
                  <ellipse cx="434" cy="447" rx="64" ry="53" />
                </clipPath>

                {/* Gradiente 3D da Esclera (Globo Ocular com Iluminação Volumétrica) */}
                <radialGradient id="sclera3DLeft" cx="46%" cy="40%" r="62%">
                  <stop offset="0%" stop-color="#ffffff" />
                  <stop offset="65%" stop-color="#ece8e2" />
                  <stop offset="90%" stop-color="#d4cfc6" />
                  <stop offset="100%" stop-color="#b8b2a7" />
                </radialGradient>
                <radialGradient id="sclera3DRight" cx="48%" cy="42%" r="62%">
                  <stop offset="0%" stop-color="#ffffff" />
                  <stop offset="65%" stop-color="#ece8e2" />
                  <stop offset="90%" stop-color="#d4cfc6" />
                  <stop offset="100%" stop-color="#b8b2a7" />
                </radialGradient>

                {/* Gradiente da Íris (Castanho Profundo Raytraced) */}
                <radialGradient id="irisGrad" cx="42%" cy="38%" r="60%">
                  <stop offset="0%" stop-color="#4d2b1f" />
                  <stop offset="70%" stop-color="#361c14" />
                  <stop offset="100%" stop-color="#1f100a" />
                </radialGradient>

                {/* Gradiente das Pálpebras (Tom de Pele Exato com Sombra de Dobra) */}
                <linearGradient id="eyelidSkinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#df9f87" />
                  <stop offset="70%" stop-color="#cb8870" />
                  <stop offset="95%" stop-color="#a45e49" />
                  <stop offset="100%" stop-color="#48241b" />
                </linearGradient>
              </defs>

              {/* Olho Esquerdo (do observador) */}
              <g clip-path="url(#leftEyeClip)">
                {/* Esclera 3D */}
                <ellipse cx="215" cy="450" rx="60" ry="50" fill="url(#sclera3DLeft)" />
                {/* Sombra de oclusão ambiente superior gerada pelos óculos */}
                <ellipse cx="215" cy="415" rx="62" ry="24" fill="rgba(38, 22, 18, 0.55)" filter="url(#eyeShadowBlur)" />

                {/* Pupila Móvel (Segue o mouse em tempo real) */}
                <g ref={leftPupilRef} style={{ transition: 'transform 0.06s cubic-bezier(0.2, 0, 0, 1)' }}>
                  {/* Borda externa sutil */}
                  <circle cx="227" cy="450" r="37" fill="#b09985" opacity="0.85" />
                  {/* Íris castanha principal */}
                  <circle cx="227" cy="450" r="35" fill="url(#irisGrad)" />
                  {/* Brilho especular nítido */}
                  <circle cx="236" cy="442" r="8.5" fill="#ffffff" opacity="0.95" />
                </g>

                {/* Pálpebra Orgânica para Piscada */}
                <g
                  ref={leftEyelidRef}
                  style={{
                    transformOrigin: '215px 400px',
                    transform: 'scaleY(0)',
                    transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <rect x="145" y="395" width="140" height="115" fill="url(#eyelidSkinGrad)" rx="16" />
                  {/* Linha dos cílios */}
                  <line x1="152" y1="508" x2="278" y2="508" stroke="#3b1b13" stroke-width="3.5" stroke-linecap="round" />
                </g>
              </g>

              {/* Olho Direito (do observador) */}
              <g clip-path="url(#rightEyeClip)">
                {/* Esclera 3D */}
                <ellipse cx="434" cy="447" rx="64" ry="53" fill="url(#sclera3DRight)" />
                {/* Sombra de oclusão ambiente superior gerada pelos óculos */}
                <ellipse cx="434" cy="410" rx="66" ry="26" fill="rgba(38, 22, 18, 0.55)" filter="url(#eyeShadowBlur)" />

                {/* Pupila Móvel (Segue o mouse em tempo real) */}
                <g ref={rightPupilRef} style={{ transition: 'transform 0.06s cubic-bezier(0.2, 0, 0, 1)' }}>
                  {/* Borda externa sutil */}
                  <circle cx="424" cy="447" r="41.5" fill="#b09985" opacity="0.85" />
                  {/* Íris castanha principal */}
                  <circle cx="424" cy="447" r="39.5" fill="url(#irisGrad)" />
                  {/* Brilho especular nítido */}
                  <circle cx="433" cy="438" r="9.5" fill="#ffffff" opacity="0.95" />
                </g>

                {/* Pálpebra Orgânica para Piscada */}
                <g
                  ref={rightEyelidRef}
                  style={{
                    transformOrigin: '434px 394px',
                    transform: 'scaleY(0)',
                    transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <rect x="360" y="388" width="148" height="120" fill="url(#eyelidSkinGrad)" rx="16" />
                  {/* Linha dos cílios */}
                  <line x1="368" y1="506" x2="500" y2="506" stroke="#3b1b13" stroke-width="3.5" stroke-linecap="round" />
                </g>
              </g>
            </svg>
          </div>

          {/* Sombra de Contato Natural no Chão */}
          <div className="w-40 sm:w-52 h-4 rounded-full bg-black/70 blur-md -mt-2 pointer-events-none z-0" />
        </div>

        {/* Identificação e Telemetria Abaixo do Avatar */}
        <div className="mt-4 flex flex-col items-center gap-2 text-center z-10 w-full max-w-sm">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#090d1c] border border-slate-700 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white tracking-wide">
              Matheus Gomes
            </span>
            <span className="text-xs font-mono text-[#38bdf8]">
              @Koszudikas-C
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ONLINE • 12ms
            </span>
            <span>•</span>
            <span className="text-slate-300">
              33 repos • Engenharia de Software
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const navRef = useRef<HTMLElement | null>(null);

  // Modo de visualização: 'tech' (CTOs, Devs, Arquitetura) vs 'business' (Clientes, Empreendedores, ROI)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlMode = urlParams.get('view');
      if (urlMode === 'tech' || urlMode === 'business') {
        return urlMode;
      }
      const savedMode = localStorage.getItem('portfolio_view_mode');
      if (savedMode === 'tech' || savedMode === 'business') {
        return savedMode;
      }
    }
    return 'tech';
  });

  // Modal Gateway de Boas-Vindas & Escolha de Versão (Abre no primeiro acesso se não houver escolha prévia)
  const [isGatewayOpen, setIsGatewayOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('view')) return false;
      const savedMode = localStorage.getItem('portfolio_view_mode');
      return !savedMode;
    }
    return false;
  });

  const handleSelectMode = (mode: ViewMode, remember: boolean) => {
    setViewMode(mode);
    setIsGatewayOpen(false);
    if (remember && typeof window !== 'undefined') {
      localStorage.setItem('portfolio_view_mode', mode);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchMode = (mode: ViewMode) => {
    playSound(mode === 'business' ? 640 : 540, 0.08);
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_view_mode', mode);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fecha o menu mobile ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>("Todos");

  // Estado do Som / Áudio Sintético & Música de Fundo (Ink and Keys)
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Reprodução de bip sutil de sci-fi
  const playSound = useCallback((freq = 440, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio não suportado ou bloqueado
    }
  }, [soundEnabled]);

  // Callback estável para o clique no avatar 3D (evita re-renderizações desnecessárias)
  const handleAvatarClick = useCallback(() => {
    playSound(720, 0.08);
  }, [playSound]);

  // Controle da Música de Fundo quando o usuário ativa o som (carregamento sob demanda)
  useEffect(() => {
    if (!soundEnabled) {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
      return;
    }

    if (!bgMusicRef.current) {
      const audio = new Audio(bgMusicAudio);
      audio.loop = true;
      audio.volume = 0.35; // Volume equilibrado de ambiência
      bgMusicRef.current = audio;
    }

    const audio = bgMusicRef.current;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Reprodução de áudio prevenida pelo navegador:', err);
      });
    }

    return () => {
      audio.pause();
    };
  }, [soundEnabled]);

  // Estado do Carrossel de Projetos em Destaque
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Monitorar seções ativas via IntersectionObserver nativo (Zero layout thrashing / Zero forced reflows)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = ['hero', 'about', 'portfolio', 'contact', 'business-hero', 'cases', 'process'] as const;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -65% 0px',
      }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [viewMode]);

  // Seleção de repositório memoizada
  const handleSelectRepo = useCallback((repo: Repository) => {
    setSelectedRepo(repo);
  }, []);

  // Estado do Formulário de Contato e Conversão
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Cópia rápida de e-mail com feedback
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('matheusprgc@gmail.com');
    setCopiedEmail(true);
    playSound(680, 0.08);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Carregamento progressivo do catálogo para otimização extrema de performance inicial (Lighthouse >= 95)
  const [shouldLoadCatalog, setShouldLoadCatalog] = useState(false);
  const catalogContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldLoadCatalog) return;
    const el = catalogContainerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldLoadCatalog(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadCatalog(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoadCatalog]);

  // Navegação suave confiável para qualquer seção sem truncamento
  const scrollToSection = useCallback((sectionId: string) => {
    if (sectionId === 'portfolio' || sectionId === 'contact') {
      setShouldLoadCatalog(true);
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Conversão rápida a partir do Modal de Projeto
  const handleDiscussProject = (repo: Repository) => {
    setSelectedRepo(null);
    playSound(720, 0.08);
    const categoryName = t.categories[repo.category as keyof typeof t.categories] || repo.category;
    const intro = language === 'pt' 
      ? `Olá Matheus! Analisei o projeto "${repo.name}" (${categoryName}) e tenho interesse em implementar uma arquitetura ou solução semelhante para o meu negócio.\n\nDetalhes da demanda:`
      : `Hi Matheus! I reviewed the "${repo.name}" project (${categoryName}) and I'm interested in implementing a similar architecture or solution for my business.\n\nProject details:`;
    setContactMessage(intro);
    setTimeout(() => {
      scrollToSection('contact');
    }, 120);
  };

  // Seleção rápida de pílulas de serviço
  const handleSelectServiceChip = (chipText: string) => {
    playSound(640, 0.05);
    setContactMessage(prev => {
      if (!prev.trim()) {
        return language === 'pt'
          ? `Olá Matheus! Gostaria de conversar sobre uma demanda com foco em: ${chipText}.\n\nEscopo inicial:`
          : `Hi Matheus! I'd like to discuss a project focused on: ${chipText}.\n\nInitial scope:`;
      }
      if (prev.includes(chipText)) return prev;
      return `${prev}\n• Foco: ${chipText}`;
    });
  };



  // Fechar modal ou menu mobile com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRepo(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const total = repositories.length;
    const publicCount = repositories.filter(r => !r.private).length;
    const privateCount = repositories.filter(r => r.private).length;
    
    const langCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = { Todos: total };
    const ecosystemCounts: Record<string, number> = {};

    repositories.forEach(r => {
      const lang = r.language || "Outras";
      langCounts[lang] = (langCounts[lang] || 0) + 1;
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      if (r.ecosystem) {
        ecosystemCounts[r.ecosystem] = (ecosystemCounts[r.ecosystem] || 0) + 1;
      }
    });

    const langData = Object.keys(langCounts).map(lang => ({
      name: lang,
      Quantidade: langCounts[lang],
      color: languageColors[lang] || languageColors.Default
    })).sort((a, b) => b.Quantidade - a.Quantidade);

    // Projetos em destaque para o Carrossel
    const featuredRepos = repositories.filter(r => r.featured || r.stars > 0);

    return { total, publicCount, privateCount, langData, categoryCounts, ecosystemCounts, featuredRepos };
  }, []);



  // Controles do Carrossel de Projetos
  const nextSlide = () => {
    playSound(580, 0.06);
    setCarouselIndex((prev) => (prev + 1) % stats.featuredRepos.length);
  };

  const prevSlide = () => {
    playSound(420, 0.06);
    setCarouselIndex((prev) => (prev - 1 + stats.featuredRepos.length) % stats.featuredRepos.length);
  };

  // Módulos relacionados do mesmo ecossistema para o modal
  const relatedEcosystemRepos = useMemo(() => {
    if (!selectedRepo?.ecosystem) return [];
    return repositories.filter(
      r => r.ecosystem === selectedRepo.ecosystem && r.id !== selectedRepo.id
    );
  }, [selectedRepo]);

  // Envio do formulário de contato
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound(660, 0.12);
    setContactSubmitted(true);
    // Abre cliente de e-mail com destino matheusprgc@gmail.com
    const subject = encodeURIComponent(`Contato pelo Portfólio de ${contactName || 'Visitante'}`);
    const body = encodeURIComponent(`Olá Matheus,\n\nNome: ${contactName}\nEmail: ${contactEmail}\n\nMensagem:\n${contactMessage}`);
    window.open(`mailto:matheusprgc@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] font-sans selection:bg-[#2563eb]/30 selection:text-white pb-16 overflow-x-clip max-w-full">
      
      {/* Background Decorativo Global (Acelerado por Hardware) */}
      <div className="bg-ambient-layer" aria-hidden="true" />
      <div className="fixed top-0 left-0 w-full h-[700px] bg-gradient-to-b from-[#1e1b4b]/20 via-transparent to-transparent pointer-events-none -z-40 transform-gpu" />
      <div className="hidden sm:block fixed top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#38bdf8]/5 rounded-full blur-[90px] pointer-events-none -z-40 transform-gpu" />
      <div className="hidden sm:block fixed top-[30%] right-[5%] w-[600px] h-[600px] bg-[#6366f1]/5 rounded-full blur-[110px] pointer-events-none -z-40 transform-gpu" />

      {/* 1. NAVBAR / HEADER SUPERIOR (Fixed com Scroll Tracking, Menu Mobile & Seletor de Idioma) */}
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#070b13]/90 border-b border-slate-800/80 shadow-lg shadow-black/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo Isometric Cube */}
          <a
            href="#hero"
            onClick={() => {
              playSound(520, 0.05);
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0 min-w-0"
          >
            <IsometricCubeLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-[#38bdf8] transition-colors leading-none whitespace-nowrap">
                Koszudikas-C<span className="text-[#38bdf8]">.dev</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-wider mt-0.5 whitespace-nowrap">
                MATHEUS GOMES
              </span>
            </div>
          </a>

          {/* Links de Navegação Desktop com Indicador Ativo de Scroll */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium">
            {viewMode === 'tech' ? (
              <>
                <a 
                  href="#hero" 
                  onClick={(e) => {
                    e.preventDefault();
                    playSound(480, 0.04);
                    scrollToSection('hero');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeSection === 'hero' 
                      ? 'text-[#38bdf8] font-bold bg-[#38bdf8]/10 border border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {t.nav.home}
                </a>
                <a 
                  href="#about" 
                  onClick={(e) => {
                    e.preventDefault();
                    playSound(520, 0.04);
                    scrollToSection('about');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeSection === 'about' 
                      ? 'text-[#38bdf8] font-bold bg-[#38bdf8]/10 border border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {t.nav.about}
                </a>
                <a 
                  href="#portfolio" 
                  onClick={(e) => {
                    e.preventDefault();
                    playSound(560, 0.04);
                    scrollToSection('portfolio');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeSection === 'portfolio' 
                      ? 'text-[#38bdf8] font-bold bg-[#38bdf8]/10 border border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {t.nav.projects}
                </a>
              </>
            ) : (
              <>
                <a 
                  href="#business-hero" 
                  onClick={(e) => {
                    e.preventDefault();
                    playSound(480, 0.04);
                    scrollToSection('business-hero');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeSection === 'business-hero' 
                      ? 'text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {t.nav.businessHome}
                </a>
                <a 
                  href="#cases" 
                  onClick={(e) => {
                    e.preventDefault();
                    playSound(520, 0.04);
                    scrollToSection('cases');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeSection === 'cases' 
                      ? 'text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {t.nav.businessCases}
                </a>
                <a 
                  href="#process" 
                  onClick={(e) => {
                    e.preventDefault();
                    playSound(560, 0.04);
                    scrollToSection('process');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeSection === 'process' 
                      ? 'text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {t.nav.businessProcess}
                </a>
              </>
            )}
            <a 
              href="#contact" 
              onClick={(e) => {
                e.preventDefault();
                playSound(600, 0.04);
                scrollToSection('contact');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all font-semibold text-xs cursor-pointer ${
                activeSection === 'contact' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400' 
                  : 'bg-gradient-to-r from-orange-500/90 to-amber-600/90 hover:from-orange-500 hover:to-amber-500 text-white shadow-sm shadow-orange-950/40 hover:scale-[1.03] border border-orange-400/30'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{viewMode === 'business' ? t.nav.businessContact : t.nav.contact}</span>
            </a>
          </div>

          {/* Controles da Direita (Seletor de Modo + Seletor de Idioma + Som + GitHub + Hamburger Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Seletor de Modo Desktop: Técnico vs Negócios */}
            <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleSwitchMode('tech')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'tech'
                    ? 'bg-blue-600/30 text-[#38bdf8] font-bold border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={language === 'pt' ? 'Mudar para Visão Técnica' : 'Switch to Technical View'}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{t.nav.techMode}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('business')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'business'
                    ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={language === 'pt' ? 'Mudar para Visão de Negócios' : 'Switch to Business View'}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{t.nav.businessMode}</span>
              </button>
            </div>
            {/* Seletor de Idioma PT / EN Desktop */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono">
              <button
                onClick={() => {
                  playSound(620, 0.04);
                  setLanguage('pt');
                }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'pt'
                    ? 'bg-blue-600/30 text-[#38bdf8] font-bold border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Português (Brasil)"
              >
                PT
              </button>
              <button
                onClick={() => {
                  playSound(620, 0.04);
                  setLanguage('en');
                }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-blue-600/30 text-[#38bdf8] font-bold border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English (US)"
              >
                EN
              </button>
            </div>

            {/* Botão de Som */}
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playSound(580, 0.1);
              }}
              title={soundEnabled ? t.nav.soundActive : t.nav.soundInactive}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20" 
                  : "bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Link GitHub (visível em telas sm+) */}
            <a
              href="https://github.com/Koszudikas-C"
              target="_blank"
              rel="noreferrer"
              onClick={() => playSound(620, 0.05)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/40 text-xs font-semibold text-white transition-all shadow-sm"
            >
              <svg className="w-4 h-4 text-[#38bdf8] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            {/* Botão Hamburger Mobile */}
            <button
              onClick={() => {
                playSound(540, 0.05);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#38bdf8]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Menu Dropdown Mobile com Animação e Blur */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/90 bg-[#070b13]/98 backdrop-blur-2xl px-4 py-5 shadow-2xl transition-all animate-fade-slide-down">
            <div className="flex flex-col gap-2">
              
              {/* Seletor de Modo Mobile (Técnico vs Negócios) */}
              <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  {t.nav.modeLabel}:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchMode('tech');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'tech'
                        ? 'bg-blue-600/30 text-[#38bdf8] border border-blue-500/40 shadow-sm'
                        : 'text-slate-400 bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{t.nav.techMode}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchMode('business');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'business'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-slate-400 bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{t.nav.businessMode}</span>
                  </button>
                </div>
              </div>

              {/* Links de Navegação Mobile Adaptativos */}
              {viewMode === 'tech' ? (
                <>
                  <a
                    href="#hero"
                    onClick={(e) => {
                      e.preventDefault();
                      playSound(480, 0.04);
                      setMobileMenuOpen(false);
                      scrollToSection('hero');
                    }}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeSection === 'hero'
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {t.nav.home}
                  </a>
                  <a
                    href="#about"
                    onClick={(e) => {
                      e.preventDefault();
                      playSound(520, 0.04);
                      setMobileMenuOpen(false);
                      scrollToSection('about');
                    }}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeSection === 'about'
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {t.nav.about}
                  </a>
                  <a
                    href="#portfolio"
                    onClick={(e) => {
                      e.preventDefault();
                      playSound(560, 0.04);
                      setMobileMenuOpen(false);
                      scrollToSection('portfolio');
                    }}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeSection === 'portfolio'
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {t.nav.projects}
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="#business-hero"
                    onClick={(e) => {
                      e.preventDefault();
                      playSound(480, 0.04);
                      setMobileMenuOpen(false);
                      scrollToSection('business-hero');
                    }}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeSection === 'business-hero'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {t.nav.businessHome}
                  </a>
                  <a
                    href="#cases"
                    onClick={(e) => {
                      e.preventDefault();
                      playSound(520, 0.04);
                      setMobileMenuOpen(false);
                      scrollToSection('cases');
                    }}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeSection === 'cases'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {t.nav.businessCases}
                  </a>
                  <a
                    href="#process"
                    onClick={(e) => {
                      e.preventDefault();
                      playSound(560, 0.04);
                      setMobileMenuOpen(false);
                      scrollToSection('process');
                    }}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeSection === 'process'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    {t.nav.businessProcess}
                  </a>
                </>
              )}
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  playSound(600, 0.04);
                  setMobileMenuOpen(false);
                  scrollToSection('contact');
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeSection === 'contact'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-950/50'
                    : 'bg-gradient-to-r from-orange-500/20 to-amber-600/20 border border-orange-500/40 text-orange-200 hover:bg-orange-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <span>{viewMode === 'business' ? t.nav.businessContact : t.nav.contact}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/30 text-orange-200 uppercase font-mono">
                  {language === 'pt' ? 'Conversar' : 'Chat'}
                </span>
              </a>

              {/* Divisor */}
              <div className="h-px bg-slate-800/80 my-2" />

              {/* Controles no Menu Mobile: Idioma & GitHub */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">{t.nav.langSwitch}:</span>
                  <div className="flex p-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono">
                    <button
                      onClick={() => {
                        playSound(620, 0.04);
                        setLanguage('pt');
                      }}
                      className={`px-3 py-1 rounded-md transition-all ${
                        language === 'pt' ? 'bg-blue-600/40 text-[#38bdf8] font-bold' : 'text-slate-400'
                      }`}
                    >
                      PT
                    </button>
                    <button
                      onClick={() => {
                        playSound(620, 0.04);
                        setLanguage('en');
                      }}
                      className={`px-3 py-1 rounded-md transition-all ${
                        language === 'en' ? 'bg-blue-600/40 text-[#38bdf8] font-bold' : 'text-slate-400'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <a
                  href="https://github.com/Koszudikas-C"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playSound(620, 0.05)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white"
                >
                  <svg className="w-3.5 h-3.5 text-[#38bdf8]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop para fechar o menu mobile ao tocar/clicar fora */}
      {mobileMenuOpen && (
        <div
          onClick={() => {
            playSound(480, 0.04);
            setMobileMenuOpen(false);
          }}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Espaçador para compensar a navbar fixed no fluxo do documento */}
      <div className="h-16 sm:h-18" aria-hidden="true" />

      {/* LANDMARK PRINCIPAL PARA ACESSIBILIDADE 100% */}
      <main id="main-content">

        {viewMode === 'business' ? (
          <BusinessView 
            language={language}
            onContactClick={() => scrollToSection('contact')}
            onPlaySound={playSound}
          />
        ) : (
          <>
            {/* 2. HERO SECTION ("Hi, my name is David" -> Matheus Gomes) */}
            <section id="hero" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Lado Esquerdo - Apresentação Limpa & Direta */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-[#38bdf8] text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t.hero.statusBadge}
            </div>

            <h1 className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              {t.hero.greetingPre} <br />
              {t.hero.greetingName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-[#38bdf8] to-amber-400">{t.hero.name}</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl mt-5 sm:mt-6 max-w-xl font-light leading-relaxed">
              {t.hero.roleSubtitle}
            </p>

            {/* Botões de Ação estilo David Heckhoff com Amarelo/Laranja Vibrante */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-7 sm:mt-8 w-full sm:w-auto">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  playSound(520, 0.08);
                  scrollToSection('contact');
                }}
                className="flex-1 sm:flex-initial justify-center px-7 py-3.5 rounded-2xl btn-cta-orange text-slate-950 font-extrabold text-sm transition-all shadow-lg cursor-pointer flex items-center gap-2 group active:scale-95"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#portfolio"
                onClick={(e) => {
                  e.preventDefault();
                  playSound(440, 0.08);
                  scrollToSection('portfolio');
                }}
                className="flex-1 sm:flex-initial justify-center px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 hover:border-[#38bdf8]/50"
              >
                {t.hero.ctaSecondary}
                <Code className="w-4 h-4 text-[#38bdf8]" />
              </a>
            </div>

            {/* Quick Badges no Rodapé do Hero com as cores favoritas */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-800/80 text-xs text-slate-400 w-full">
              <span className="text-slate-300 font-semibold">{language === 'pt' ? 'Especialidades:' : 'Core Stack:'}</span>
              {t.hero.miniTechs.map((tech, idx) => {
                const borderColors = [
                  "border-rose-500/30 text-rose-300",
                  "border-amber-500/30 text-amber-300",
                  "border-blue-500/30 text-blue-300",
                  "border-cyan-500/30 text-cyan-300"
                ];
                return (
                  <span key={tech} className={`px-2.5 py-1 rounded-lg bg-slate-900/90 border ${borderColors[idx % borderColors.length]} font-mono`}>
                    {tech}
                  </span>
                );
              })}
            </div>

          </div>

          {/* Lado Direito - Personagem 3D Direto na Cena (Memoizado / Acelerado por Hardware) */}
          <HeroInteractiveAvatar
            avatarImg={avatarTransparentImg}
            avatarMobileImg={avatarTransparentMobileImg}
            chip1Text={t.hero.chips.chip1}
            chip2Text={t.hero.chips.chip2}
            chip3Text={t.hero.chips.chip3}
            onAvatarClick={handleAvatarClick}
          />

        </div>
      </section>

      {/* 3. SCI-FI LAB: ABOUT & SKILLS HUD (Inspirado no Holographic Pod das telas 00:06 a 00:08) */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-800/80 scroll-mt-20 sm:scroll-mt-24">
        
        {/* Header da Seção */}
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            — {t.about.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            {t.about.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            {t.about.description}
          </p>
        </div>

        {/* Grade Sci-Fi HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna 1 (HUD Card com Foto, Dados Pessoais, Skills & Trajetória) */}
          <div className="lg:col-span-8 hud-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-8">
            
            {/* Header do Perfil HUD */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={avatarProfileImg}
                    alt="Matheus"
                    className="w-16 h-16 rounded-xl object-cover object-top border border-[#38bdf8]/40"
                  />
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#38bdf8] tracking-widest uppercase">{t.about.idDev}</span>
                  <h3 className="text-xl font-bold text-white leading-tight">{t.about.devName}</h3>
                  <span className="text-xs text-slate-400 font-medium">{t.about.devRole}</span>
                </div>
              </div>

              {/* Informações Rápidas Estilo Ficha */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">{language === 'pt' ? 'PAÍS / BASE' : 'COUNTRY / BASE'}</span>
                  <div className="flex items-center gap-1.5 font-semibold text-white mt-0.5">
                    <svg className="w-4 h-3 rounded-[2px] shrink-0 overflow-hidden" viewBox="0 0 720 504">
                      <rect width="720" height="504" fill="#009b3a"/>
                      <polygon points="360,40 680,252 360,464 40,252" fill="#fedf00"/>
                      <circle cx="360" cy="252" r="126" fill="#002776"/>
                      <path d="M234,252 A126,126 0 0,0 486,252 A126,110 0 0,1 234,252" fill="#ffffff" />
                    </svg>
                    <span>{language === 'pt' ? 'Brasil' : 'Brazil'}</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">{language === 'pt' ? 'REPOSITÓRIOS' : 'REPOSITORIES'}</span>
                  <span className="text-[#38bdf8] font-bold">{stats.total} {language === 'pt' ? 'Ativos' : 'Active'}</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO SKILLS (Barras de Habilidades como no vídeo) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#38bdf8] flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {language === 'pt' ? 'Matriz de Habilidades Principais' : 'Core Skills Matrix'}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">{language === 'pt' ? 'NÍVEL DE DOMÍNIO' : 'PROFICIENCY LEVEL'}</span>
              </div>

              <div className="space-y-4">
                {(skillsDataByLanguage[language] || skillsData).map((skill) => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{skill.name}</span>
                        <span className="text-slate-400 text-[11px] ml-2 hidden sm:inline">• {skill.desc}</span>
                      </div>
                      <span className="font-mono font-bold text-[#38bdf8]">{skill.level}%</span>
                    </div>
                    {/* Barra de progresso */}
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-[1px]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-[#38bdf8] to-cyan-400 transition-all duration-1000"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO ABOUT / TRAJETÓRIA (com ícones de coração, foguete, escudo) */}
            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#38bdf8] flex items-center gap-2 mb-4">
                <User className="w-4 h-4" />
                {language === 'pt' ? 'Trajetória & Foco Arquitetural' : 'Trajectory & Architectural Focus'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 w-fit">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">{t.about.pillars.p1Title}</h5>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    {t.about.pillars.p1Desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] w-fit">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">{t.about.pillars.p2Title}</h5>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    {t.about.pillars.p2Desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">{t.about.pillars.p3Title}</h5>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    {t.about.pillars.p3Desc}
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Coluna 2 (Hologram Pod / Telemetria do Sistema) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Câmara Holográfica / Card de Status */}
            <div className="hud-panel p-6 rounded-2xl flex flex-col items-center text-center">
              <span className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase mb-4">
                {language === 'pt' ? 'TELEMETRIA DE ARQUITETURA' : 'ARCHITECTURE TELEMETRY'}
              </span>

              {/* Wireframe Hologram Box */}
              <div className="relative w-40 h-40 flex items-center justify-center my-2">
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-spin" style={{ animationDuration: '15s' }} />
                <div className="absolute inset-3 rounded-full border border-dashed border-[#38bdf8]/40 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
                <IsometricCubeLogo className="w-20 h-20 animate-float" />
              </div>

              <div className="w-full mt-4 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">{language === 'pt' ? 'Total de Projetos' : 'Total Projects'}</span>
                  <span className="text-white font-bold">{stats.total} {language === 'pt' ? 'Repositórios' : 'Repositories'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex flex-col text-left">
                    <span className="text-slate-400">{language === 'pt' ? 'Arquitetura & Design' : 'Architecture & Design'}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{language === 'pt' ? 'Microsserviços • Event-Driven • APIs' : 'Microservices • Event-Driven • APIs'}</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs">{language === 'pt' ? 'Modular' : 'Modular'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">{language === 'pt' ? 'Públicos / Privados' : 'Public / Private'}</span>
                  <span className="text-[#38bdf8] font-bold">{stats.publicCount} / {stats.privateCount}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 w-full flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {language === 'pt' ? 'STATUS: DISPONÍVEL PARA PROJETOS' : 'STATUS: AVAILABLE FOR PROJECTS'}
              </div>
            </div>

            {/* Quick Links de Ecossistemas */}
            <div className="glass-panel p-6 rounded-2xl">
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                {language === 'pt' ? 'Principais Ecossistemas' : 'Core Ecosystems'}
              </h4>
              <div className="space-y-2 text-xs">
                {Object.entries(stats.ecosystemCounts).slice(0, 3).map(([eco, count]) => (
                  <button
                    key={eco}
                    onClick={() => {
                      setSelectedEcosystem(eco);
                      scrollToSection('portfolio');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group"
                  >
                    <span className="text-slate-200 group-hover:text-white truncate">
                      {t.ecosystems[eco as keyof typeof t.ecosystems] || eco}
                    </span>
                    <span className="text-[11px] text-indigo-300 font-semibold bg-indigo-500/20 px-2 py-0.5 rounded-md">
                      {count} {language === 'pt' ? 'repos' : 'repos'} &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 4. PORTFOLIO SHOWCASE: "Some things I've worked on" (Carrossel Horizontal como na referência 00:09-00:13) */}
      <section id="portfolio" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-800/80 scroll-mt-20 sm:scroll-mt-24">
        
        {/* Header da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2">
              <Folder className="w-4 h-4" />
              — {t.featured.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              {language === 'pt' ? 'Alguns projetos que construí' : "Some projects I've built"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {language === 'pt' 
                ? 'Navegue pelos projetos em destaque usando as setas do carrossel ou explore o catálogo completo abaixo.'
                : 'Browse featured projects using the carousel arrows or explore the full catalog below.'}
            </p>
          </div>

          {/* Controles de Próximo / Anterior do Carrossel (como na referência) */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={prevSlide}
              title={t.featured.prevSlide}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              {carouselIndex + 1} / {stats.featuredRepos.length}
            </span>
            <button
              onClick={nextSlide}
              title={t.featured.nextSlide}
              className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CARROSSEL PRINCIPAL (Cards Grandes em Destaque) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.featuredRepos.slice(carouselIndex, carouselIndex + 3).concat(
            // Se passar do fim, faz wrap around para preencher 3 cards
            carouselIndex + 3 > stats.featuredRepos.length 
              ? stats.featuredRepos.slice(0, (carouselIndex + 3) % stats.featuredRepos.length)
              : []
          ).slice(0, 3).map((repo) => {
            const CategoryIcon = categoryIcons[repo.category] || Folder;
            return (
              <article
                key={`featured-${repo.id}`}
                onClick={() => {
                  playSound(500, 0.08);
                  setSelectedRepo(repo);
                }}
                className="group cursor-pointer featured-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[380px]"
              >
                <div>
                  {/* Top Header Card */}
                  <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">
                        {translateHighlightMetric(repo.highlightMetric, language) || (t.categories[repo.category as keyof typeof t.categories] || repo.category)}
                      </span>
                    </span>

                    <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border shrink-0 ${
                      repo.private
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    }`}>
                      {repo.private ? t.catalog.card.privateBadge : t.catalog.card.publicBadge}
                    </span>
                  </div>

                  {/* Título & Categoria */}
                  <div className="flex items-center gap-2 mt-2 min-w-0">
                    <CategoryIcon className="w-5 h-5 text-[#38bdf8] shrink-0" />
                    <h3
                      title={repo.name}
                      className="text-xl font-bold text-white group-hover:text-[#38bdf8] transition-colors truncate"
                    >
                      {repo.name}
                    </h3>
                  </div>

                  {/* Descrição */}
                  <p className="text-slate-300 text-sm mt-3 line-clamp-3 leading-relaxed">
                    {(language === 'en' && repo.descriptionEn) ? repo.descriptionEn : repo.description}
                  </p>

                  {/* Tech Stack Pills (como no Join/Sharkie/Portfolio da referência) */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {repo.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 text-[11px] font-medium rounded-md bg-slate-900/90 text-slate-200 border border-slate-700/80 group-hover:border-blue-400/40 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                    {repo.techStack.length > 4 && (
                      <span className="px-2 py-0.5 text-[11px] text-slate-400">
                        +{repo.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer com Ações Duplas */}
                <div className="border-t border-slate-800/80 group-hover:border-blue-500/30 pt-4 mt-6 flex items-center justify-between text-xs transition-colors">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-white/15"
                      style={{ backgroundColor: languageColors[repo.language] || languageColors.Default }}
                    />
                    <span className="text-slate-200 font-semibold">{repo.language}</span>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 group-hover:bg-blue-600 text-[#38bdf8] group-hover:text-white font-semibold transition-all flex items-center gap-1.5">
                    {language === 'pt' ? 'Explorar' : 'Explore'} &rarr;
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Indicadores / Bolinhas do Carrossel */}
        <div className="flex items-center justify-center gap-1 mt-8">
          {stats.featuredRepos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => {
                playSound(480, 0.05);
                setCarouselIndex(idx);
              }}
              className="p-2 flex items-center justify-center cursor-pointer min-w-[28px] min-h-[28px]"
            >
              <span
                className={`h-2 rounded-full transition-all block ${
                  carouselIndex === idx ? "w-8 bg-[#38bdf8]" : "w-2 bg-slate-700 hover:bg-slate-600"
                }`}
              />
            </button>
          ))}
        </div>

        {/* ÁREA EXPANSÍVEL: CATÁLOGO COMPLETO COM BUSCA & FILTROS (33 Repositórios) */}
        <div ref={catalogContainerRef}>
          {shouldLoadCatalog ? (
            <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-900/30 border border-slate-800/50 animate-pulse my-8 flex items-center justify-center text-slate-400 font-mono text-xs">{language === 'pt' ? 'Carregando catálogo...' : 'Loading catalog...'}</div>}>
              <CatalogSection
                language={language}
                t={t}
                stats={stats}
                selectedEcosystem={selectedEcosystem}
                setSelectedEcosystem={setSelectedEcosystem}
                onSelectRepo={handleSelectRepo}
                onPlaySound={playSound}
              />
            </Suspense>
          ) : (
            <div className="h-40 rounded-2xl bg-slate-900/20 border border-slate-800/40 my-8 flex items-center justify-center text-slate-300 font-medium font-mono text-xs">
              {language === 'pt' ? 'Role para ver os 33 projetos no catálogo...' : 'Scroll to explore all 33 projects in the catalog...'}
            </div>
          )}
        </div>

      </section>
          </>
        )}

      {/* 5. CONTACT SECTION: "Say hello 👋 / Contact me" (Inspirado nas telas 00:14 a 00:17) */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-800/80 scroll-mt-20 sm:scroll-mt-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Lado Esquerdo - Formulário de Contato Estilizado (como na referência) */}
          <div className="lg:col-span-7 flex flex-col">
            
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              — {t.contact.badge}
              <Hand className="w-3.5 h-3.5 text-amber-400 inline-block -rotate-12" />
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              {t.contact.title}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg font-light leading-relaxed">
              {t.contact.description}
            </p>

            {/* Badge de SLA & Resposta Rápida */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.contact.slaBadge}</span>
              </div>
            </div>

            {contactSubmitted ? (
              <div className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-4">
                <Check className="w-8 h-8 shrink-0 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">{t.contact.form.successTitle}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {t.contact.form.successDesc}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-8 flex flex-col gap-5">
                
                {/* Campo Nome */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    {t.contact.form.nameLabel}:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.contact.form.namePlaceholder}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                  />
                </div>

                {/* Campo Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    {t.contact.form.emailLabel}:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={t.contact.form.emailPlaceholder}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                  />
                </div>

                {/* Pílulas de Seleção Rápida de Escopo */}
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {t.contact.quickFocusLabel}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {t.contact.serviceChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSelectServiceChip(chip)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 hover:bg-amber-500/10 text-xs font-mono text-slate-300 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <span className="text-amber-400 font-bold">+</span> {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campo Mensagem */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    {t.contact.form.messageLabel}:
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={t.contact.form.messagePlaceholder}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all resize-none"
                  />
                </div>

                {/* Linha Inferior com Ícone do GitHub + Botão Submit */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  
                  {/* Link GitHub */}
                  <div className="flex items-center gap-3 text-slate-400">
                    <a
                      href="https://github.com/Koszudikas-C"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
                      title="GitHub: Koszudikas-C"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                      </svg>
                    </a>
                  </div>

                  {/* Botão Submit Laranja/Azul como na referência */}
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    {t.contact.form.submitBtn}
                  </button>

                </div>

              </form>
            )}

          </div>

          {/* Lado Direito - Card do Desenvolvedor (inspirado no avatar com caixas da referência 00:15-00:17) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full glass-panel p-8 rounded-3xl border border-slate-700/80 flex flex-col items-center text-center">
              
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900">
                  <img
                    src={avatarProfileImg}
                    alt="Matheus Gomes"
                    loading="lazy"
                    decoding="async"
                    width="128"
                    height="128"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-950 border border-slate-700 text-[#38bdf8]">
                  <Terminal className="w-4 h-4" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white">{t.contact.card.developerTitle}</h3>
              <p className="text-xs text-[#38bdf8] font-mono mt-0.5">{t.contact.card.developerRole}</p>

              <p className="text-slate-300 text-xs mt-4 leading-relaxed max-w-sm">
                {t.contact.card.bio}
              </p>

              <div className="w-full mt-6 pt-6 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>{t.contact.card.responseLabel}</span>
                  <span className="text-emerald-400 font-semibold">{t.contact.card.responseVal}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.contact.card.locationLabel}</span>
                  <span className="text-white">{t.contact.card.locationVal}</span>
                </div>
              </div>

              {/* Ações Diretas: Copiar E-mail & Contato Imediato */}
              <div className="w-full mt-6 pt-5 border-t border-slate-800 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-[#38bdf8]/50 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-98"
                  title="Copiar matheusprgc@gmail.com"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#38bdf8]" />}
                  <span>{copiedEmail ? t.contact.emailCopied : `${t.contact.copyEmail}: matheusprgc@gmail.com`}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </section>
      </main>

      {/* 6. MODAL DE ARQUITETURA / DETALHES DO PROJETO */}
      {selectedRepo && (
        <div
          onClick={() => setSelectedRepo(null)}
          className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#0d1425] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl shadow-black/90 overflow-hidden"
          >
            
            {/* Background Decorativo Modal */}
            <div className="absolute top-0 left-0 w-full h-[160px] bg-gradient-to-b from-[#2563eb]/15 via-transparent to-transparent pointer-events-none" />

            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 relative z-10">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                    {t.categories[selectedRepo.category as keyof typeof t.categories] || selectedRepo.category}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                    selectedRepo.private
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  }`}>
                    {selectedRepo.private ? t.catalog.card.privateBadge : t.catalog.card.publicBadge}
                  </span>
                  {selectedRepo.ecosystem && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full">
                      <Network className="w-3 h-3" />
                      {t.ecosystems[selectedRepo.ecosystem as keyof typeof t.ecosystems] || selectedRepo.ecosystem}
                    </span>
                  )}
                  {selectedRepo.stars > 0 && (
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded-full">
                      ⭐ {selectedRepo.stars} Star{selectedRepo.stars > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold mt-3 text-white break-words leading-snug">
                  {selectedRepo.name}
                </h3>
                {selectedRepo.highlightMetric && (
                  <p className="text-xs font-semibold text-[#38bdf8] mt-1">
                    {translateHighlightMetric(selectedRepo.highlightMetric, language)}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setSelectedRepo(null)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Modal */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 relative z-10">
              {/* Descrição Detalhada */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#38bdf8]" />
                  {t.modal.overview}
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                  {(language === 'en' && selectedRepo.detailsEn) ? selectedRepo.detailsEn : selectedRepo.details}
                </p>
              </div>

              {/* Destaques de Engenharia */}
              {(((language === 'en' && selectedRepo.highlightsEn) ? selectedRepo.highlightsEn : selectedRepo.highlights) || []).length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t.modal.highlights}
                  </h4>
                  <ul className="space-y-2">
                    {(((language === 'en' && selectedRepo.highlightsEn) ? selectedRepo.highlightsEn : selectedRepo.highlights) || []).map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stack de Tecnologias */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#38bdf8]" />
                  {language === 'pt' ? 'Stack Tecnológica' : 'Tech Stack'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRepo.techStack.map((tech) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 text-white text-xs font-medium rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Módulos Relacionados do Mesmo Ecossistema */}
              {relatedEcosystemRepos.length > 0 && (
                <div className="border-t border-slate-800 pt-5">
                  <h4 className="text-xs font-semibold tracking-wider text-indigo-300 uppercase mb-3 flex items-center gap-2">
                    <Network className="w-4 h-4 text-indigo-400" />
                    {language === 'pt' 
                      ? `Outros Módulos em ${selectedRepo.ecosystem} (${relatedEcosystemRepos.length})` 
                      : `Other Modules in ${t.ecosystems[selectedRepo.ecosystem as keyof typeof t.ecosystems] || selectedRepo.ecosystem} (${relatedEcosystemRepos.length})`}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {relatedEcosystemRepos.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => setSelectedRepo(rel)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                            {rel.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {(language === 'en' && rel.descriptionEn) ? rel.descriptionEn : rel.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Linguagem Base */}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>{language === 'pt' ? 'Linguagem principal:' : 'Primary language:'}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: languageColors[selectedRepo.language] || languageColors.Default }}
                />
                <span className="text-white font-semibold">{selectedRepo.language}</span>
              </div>

              {/* Banner de Conversão / Fechamento de Projeto Semelhante */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-blue-500/10 border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1">
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Rocket className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{t.modal.discussPrompt}</span>
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {language === 'pt' 
                      ? 'Inicie uma conversa técnica sobre arquitetura, requisitos e desenvolvimento para seu negócio.' 
                      : 'Start a technical conversation on architecture, requirements, and development for your business.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDiscussProject(selectedRepo)}
                  className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.modal.discussSimilar}</span>
                </button>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-5 border-t border-slate-800 bg-[#090d18] flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
              <span className="text-xs text-slate-400">
                {language === 'pt' ? 'Repositório:' : 'Repository:'} <code className="text-slate-200 text-[11px] font-mono">{selectedRepo.fullName}</code>
              </span>
              
              {!selectedRepo.private ? (
                <a 
                  href={selectedRepo.htmlUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl font-semibold text-xs text-white transition-all shadow-lg shadow-[#2563eb]/30"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.modal.viewGithub}
                </a>
              ) : (
                <span className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl font-medium text-xs">
                  <Lock className="w-4 h-4" />
                  {t.modal.statusPrivate}
                </span>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 7. FOOTER GERAL */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-8 pb-10 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <IsometricCubeLogo className="w-5 h-5" />
          <span className="font-bold text-white tracking-wide">Koszudikas-C.dev</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Matheus Gomes (Koszudikas-C). {t.footer.techStack}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          {viewMode === 'tech' ? (
            <>
              <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="text-slate-400 hover:text-white transition-colors">{t.nav.home}</a>
              <span className="text-slate-600">•</span>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="text-slate-400 hover:text-white transition-colors">{t.nav.about}</a>
              <span className="text-slate-600">•</span>
              <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }} className="text-slate-400 hover:text-white transition-colors">{t.nav.projects}</a>
            </>
          ) : (
            <>
              <a href="#business-hero" onClick={(e) => { e.preventDefault(); scrollToSection('business-hero'); }} className="text-slate-400 hover:text-white transition-colors">{t.nav.businessHome}</a>
              <span className="text-slate-600">•</span>
              <a href="#cases" onClick={(e) => { e.preventDefault(); scrollToSection('cases'); }} className="text-slate-400 hover:text-white transition-colors">{t.nav.businessCases}</a>
              <span className="text-slate-600">•</span>
              <a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('process'); }} className="text-slate-400 hover:text-white transition-colors">{t.nav.businessProcess}</a>
            </>
          )}
          <span className="text-slate-600">•</span>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="text-slate-400 hover:text-white transition-colors">{viewMode === 'business' ? t.nav.businessContact : t.nav.contact}</a>
        </div>
      </footer>

      {/* MODAL GATEWAY DE ESCOLHA DE VERSÃO (TÉCNICA VS NEGÓCIOS) */}
      <VersionGatewayModal
        isOpen={isGatewayOpen}
        onSelectMode={handleSelectMode}
        onClose={() => setIsGatewayOpen(false)}
        language={language}
        onToggleLanguage={(lang) => setLanguage(lang)}
        onPlaySound={playSound}
      />

    </div>
  );
}
