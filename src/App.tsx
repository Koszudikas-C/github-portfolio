import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Search, 
  Folder, 
  Lock, 
  ExternalLink, 
  Code, 
  Database, 
  X, 
  Layers, 
  Cpu, 
  Globe, 
  FileText,
  Terminal,
  BookOpen,
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
  Loader2,
  Hand,
  Menu
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { repositories } from './data/repositories';
import type { Repository } from './data/repositories';
import avatarTransparentImg from './assets/avatar-transparent.webp';
import avatarProfileImg from './assets/avatar-profile.webp';
import bgMusicAudio from './assets/Ink_and_Keys.mp3';
import { useLanguage } from './i18n/useLanguage';

// Mapeamento de cores para linguagens
const languageColors: Record<string, string> = {
  "PHP": "#777BB4",
  "TypeScript": "#38bdf8",
  "C#": "#22c55e",
  "Rust": "#fb923c",
  "CSS": "#a855f7",
  "HTML": "#f97316",
  "JavaScript": "#facc15",
  "Liquid": "#84cc16",
  "Shell": "#10b981",
  "Default": "#94a3b8"
};

const categoryIcons: Record<string, any> = {
  "Todos": Layers,
  "IA, Integração & Automação": Cpu,
  "Web & Front-end": Globe,
  "APIs & Back-end": Database,
  "Blockchain & Cripto": Lock,
  "Estudos & Utilitários": BookOpen
};

const categoriesList = [
  "Todos",
  "IA, Integração & Automação",
  "Web & Front-end",
  "APIs & Back-end",
  "Blockchain & Cripto",
  "Estudos & Utilitários"
];

// Matriz de Skills para a seção Sci-Fi Lab
const skillsData = [
  { name: ".NET 10 & C# 13", level: 95, desc: "Clean Architecture, DDD, CQRS, SignalR" },
  { name: "Rust High-Performance", level: 85, desc: "Streaming I/O, LanceDB, Tract-ONNX, Multithreading" },
  { name: "PHP & APIs RESTful", level: 90, desc: "Arquitetura Desacoplada, JWT, Webhooks (Stripe/Asaas), MySQL" },
  { name: "Angular & React / TS", level: 90, desc: "Control Flow, RxJS, NgZorro, Tailwind, Vitest" },
  { name: "IA Generativa & ONNX", level: 88, desc: "YOLOv11/v26, Gemini API, OpenAI, Calibração Persona" },
  { name: "PostgreSQL & pgvector", level: 90, desc: "Busca Vetorial, SQLite, EF Core, Índices" },
  { name: "Kubernetes (K3s) & DevOps", level: 85, desc: "Dev/Prod Overlays, Shell Script, Docker, CI/CD" },
];

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

// Tooltip customizado de alto contraste para o gráfico de linguagens
const CustomLanguageTooltip = ({ active, payload, totalRepos }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = totalRepos > 0 ? Math.round((data.Quantidade / totalRepos) * 100) : 0;
    return (
      <div className="bg-[#0f172a]/95 border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/60 min-w-[155px]">
        <div className="flex items-center gap-2 mb-1.5 border-b border-slate-800 pb-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/20"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-bold text-sm text-white">{data.name}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-slate-300">Repositórios:</span>
          <span className="font-semibold text-white">
            {data.Quantidade} <span className="text-slate-400 font-normal">({percentage}%)</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Componente Memoizado: Gráfico de Distribuição de Linguagens (Recharts isolado)
const LanguageDistributionChart = memo(({
  langData,
  selectedLanguage,
  totalRepos,
  onSelectLanguage,
}: {
  langData: Array<{ name: string; Quantidade: number; color: string }>;
  selectedLanguage: string;
  totalRepos: number;
  onSelectLanguage: (lang: string) => void;
}) => {
  return (
    <div className="w-full h-14">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={langData} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip cursor={{ fill: 'rgba(56, 189, 248, 0.12)', radius: 4 }} content={<CustomLanguageTooltip totalRepos={totalRepos} />} />
          <Bar
            dataKey="Quantidade"
            radius={[4, 4, 0, 0]}
            className="cursor-pointer"
            onClick={(data: any) => {
              if (data && data.name) {
                onSelectLanguage(data.name);
              }
            }}
          >
            {langData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={selectedLanguage === "Todas" || selectedLanguage === entry.name ? 1 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// Componente Memoizado: Card individual de Repositório (Zero re-renders ao filtrar ou rolar)
const RepositoryCard = memo(({
  repo,
  idx,
  language,
  categoryLabel,
  ecosystemLabel,
  privateBadgeText,
  publicBadgeText,
  viewDetailsText,
  onSelect,
  onPlaySound,
}: {
  repo: Repository;
  idx: number;
  language: 'pt' | 'en';
  categoryLabel: string;
  ecosystemLabel?: string;
  privateBadgeText: string;
  publicBadgeText: string;
  viewDetailsText: string;
  onSelect: (repo: Repository) => void;
  onPlaySound: (freq?: number, duration?: number) => void;
}) => {
  const CategoryIcon = categoryIcons[repo.category] || Folder;

  return (
    <article
      onClick={() => {
        onPlaySound(460, 0.06);
        onSelect(repo);
      }}
      style={{ animationDelay: `${(idx % 6) * 45}ms` }}
      className="lazy-card group relative cursor-pointer glass-card p-6 rounded-2xl flex flex-col justify-between overflow-hidden"
    >
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] shrink-0">
              <CategoryIcon className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-300 tracking-wide uppercase font-semibold truncate">
              {categoryLabel}
            </span>
          </div>
          <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border shrink-0 ${
            repo.private
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          }`}>
            {repo.private ? privateBadgeText : publicBadgeText}
          </span>
        </div>

        {repo.ecosystem && ecosystemLabel && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
              <Network className="w-3 h-3" />
              {ecosystemLabel}
            </span>
          </div>
        )}

        <h4
          title={repo.name}
          className="text-lg font-bold text-white group-hover:text-[#38bdf8] transition-colors leading-snug truncate"
        >
          {repo.name}
        </h4>

        <p className="text-slate-300 text-sm mt-2 line-clamp-2 leading-relaxed">
          {repo.description || (language === 'pt' ? "Nenhuma descrição fornecida." : "No description provided.")}
        </p>

        {repo.techStack && repo.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {repo.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-800/80 text-slate-200 border border-slate-700/70"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-800/80 group-hover:border-blue-500/30 pt-4 mt-5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10" 
            style={{ backgroundColor: languageColors[repo.language] || languageColors.Default }}
          />
          <span className="text-slate-200 font-medium">{repo.language || (language === 'pt' ? "Outra" : "Other")}</span>
        </div>

        <span className="text-[#38bdf8] group-hover:text-white font-semibold flex items-center gap-1">
          {viewDetailsText} &rarr;
        </span>
      </div>
    </article>
  );
});

// Componente Memoizado: Hero 3D Interactive Avatar (Direct DOM / rAF - Zero React state updates no cursor)
const HeroInteractiveAvatar = memo(({
  avatarImg,
  chip1Text,
  chip2Text,
  chip3Text,
}: {
  avatarImg: string;
  chip1Text: string;
  chip2Text: string;
  chip3Text: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !avatarRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const tiltX = Number((x * 16).toFixed(2));
    const tiltY = Number((-y * 16).toFixed(2));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (avatarRef.current) {
        avatarRef.current.style.transform = `perspective(1000px) rotateY(${tiltX}deg) rotateX(${tiltY}deg)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (avatarRef.current) {
        avatarRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="lg:col-span-5 relative flex flex-col items-center justify-center w-full py-4 select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg">
        {/* Luz de Fundo e Brilho Suave */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[420px] h-80 sm:h-[420px] bg-gradient-to-tr from-blue-600/20 via-[#38bdf8]/15 to-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Badges Flutuantes 100% Nítidos em Camada Vetorial */}
        <div className="hidden sm:flex absolute top-4 -left-6 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#090d1c] border border-rose-500/50 text-rose-300 text-xs font-mono font-medium shadow-xl shadow-rose-950/30 animate-float pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="font-semibold tracking-wide">{chip1Text}</span>
        </div>

        <div
          style={{ animationDelay: '1.2s' }}
          className="hidden sm:flex absolute top-14 -right-6 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#090d1c] border border-amber-500/50 text-amber-300 text-xs font-mono font-medium shadow-xl shadow-amber-950/30 animate-float pointer-events-none"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-semibold tracking-wide">{chip2Text}</span>
        </div>

        <div
          style={{ animationDelay: '2.4s' }}
          className="hidden sm:flex absolute bottom-28 -left-8 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#090d1c] border border-sky-500/50 text-[#38bdf8] text-xs font-mono font-medium shadow-xl shadow-sky-950/30 animate-float pointer-events-none"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="font-semibold tracking-wide">{chip3Text}</span>
        </div>

        {/* O Personagem 3D com Tilt Interativo e Altíssima Resolução */}
        <div
          ref={avatarRef}
          style={{
            transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="relative flex flex-col items-center justify-center transition-transform duration-150 ease-out cursor-pointer group"
        >
          <img
            src={avatarImg}
            alt="Matheus Gomes"
            loading="eager"
            fetchPriority="high"
            className="relative z-10 h-[390px] sm:h-[490px] lg:h-[550px] w-auto max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] pointer-events-none group-hover:scale-[1.02] transition-transform duration-300"
          />

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
              33 repos • 1.120 testes
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
  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'portfolio' | 'contact'>('hero');

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Todas");
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>("Todos");
  const [visibilityFilter, setVisibilityFilter] = useState<"Todos" | "Publicos" | "Privados">("Todos");
  const [sortOrder, setSortOrder] = useState<"default" | "recent" | "oldest">("default");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  // Lazy loading progressivo para o catálogo
  const [visibleCount, setVisibleCount] = useState(9);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Estado do Som / Áudio Sintético & Música de Fundo (Ink and Keys)
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Controle da Música de Fundo quando o usuário ativa o som
  useEffect(() => {
    if (!bgMusicRef.current) {
      const audio = new Audio(bgMusicAudio);
      audio.loop = true;
      audio.volume = 0.35; // Volume equilibrado de ambiência
      bgMusicRef.current = audio;
    }

    const audio = bgMusicRef.current;
    if (soundEnabled) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Reprodução de áudio prevenida pelo navegador:', err);
        });
      }
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [soundEnabled]);

  // Estado do Carrossel de Projetos em Destaque
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Monitorar a rolagem da página para destacar a seção ativa no header sem layout thrashing
  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const sections = ['contact', 'portfolio', 'about', 'hero'] as const;
        const scrollThreshold = window.scrollY + 220;
        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el && el.offsetTop <= scrollThreshold) {
            setActiveSection((prev) => (prev === sectionId ? prev : sectionId));
            break;
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Seleção de repositório memoizada
  const handleSelectRepo = useCallback((repo: Repository) => {
    setSelectedRepo(repo);
  }, []);

  // Estado do Formulário de Contato
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

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

  // Repositórios filtrados para o catálogo
  const filteredRepos = useMemo(() => {
    let filtered = repositories.filter(repo => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        repo.name.toLowerCase().includes(q) ||
        repo.description.toLowerCase().includes(q) ||
        repo.techStack.some(t => t.toLowerCase().includes(q)) ||
        (repo.ecosystem && repo.ecosystem.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === "Todos" || repo.category === selectedCategory;
      const matchesLanguage = selectedLanguage === "Todas" || repo.language === selectedLanguage;
      const matchesEcosystem = selectedEcosystem === "Todos" || repo.ecosystem === selectedEcosystem;
      
      const matchesVisibility = 
        visibilityFilter === "Todos" ? true :
        visibilityFilter === "Publicos" ? !repo.private :
        repo.private;

      return matchesSearch && matchesCategory && matchesLanguage && matchesEcosystem && matchesVisibility;
    });

    if (sortOrder === "recent") {
      filtered = [...filtered].sort((a, b) => b.id - a.id);
    } else if (sortOrder === "oldest") {
      filtered = [...filtered].sort((a, b) => a.id - b.id);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedLanguage, selectedEcosystem, visibilityFilter, sortOrder]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
    setSelectedLanguage("Todas");
    setSelectedEcosystem("Todos");
    setVisibilityFilter("Todos");
    setSortOrder("default");
  };

  // Reset do contador visível ao alterar qualquer filtro de busca ou categoria
  useEffect(() => {
    setVisibleCount(9);
  }, [searchQuery, selectedCategory, selectedLanguage, selectedEcosystem, visibilityFilter, sortOrder]);

  // Observer para scroll infinito / carregamento progressivo sob demanda
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 6, filteredRepos.length));
        }
      },
      { rootMargin: '250px' }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [filteredRepos.length]);

  // Itens visíveis fatiados para não travar a renderização inicial do DOM
  const visibleRepos = useMemo(() => {
    return filteredRepos.slice(0, visibleCount);
  }, [filteredRepos, visibleCount]);

  const hasMore = visibleCount < filteredRepos.length;

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
      <div className="fixed top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#38bdf8]/5 rounded-full blur-[90px] pointer-events-none -z-40 transform-gpu" />
      <div className="fixed top-[30%] right-[5%] w-[600px] h-[600px] bg-[#6366f1]/5 rounded-full blur-[110px] pointer-events-none -z-40 transform-gpu" />

      {/* 1. NAVBAR / HEADER SUPERIOR (Fixed com Scroll Tracking, Menu Mobile & Seletor de Idioma) */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#070b13]/90 border-b border-slate-800/80 shadow-lg shadow-black/40 transition-all duration-300">
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
            <a 
              href="#hero" 
              onClick={() => playSound(480, 0.04)}
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
              onClick={() => playSound(520, 0.04)}
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
              onClick={() => playSound(560, 0.04)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeSection === 'portfolio' 
                  ? 'text-[#38bdf8] font-bold bg-[#38bdf8]/10 border border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.nav.projects}
            </a>
            <a 
              href="#contact" 
              onClick={() => playSound(600, 0.04)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeSection === 'contact' 
                  ? 'text-[#38bdf8] font-bold bg-[#38bdf8]/10 border border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.nav.contact}
            </a>
          </div>

          {/* Controles da Direita (Seletor de Idioma + Som + GitHub + Hamburger Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
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
              <a
                href="#hero"
                onClick={() => {
                  playSound(480, 0.04);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === 'hero'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>{t.nav.home}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#about"
                onClick={() => {
                  playSound(520, 0.04);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === 'about'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>{t.nav.about}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#portfolio"
                onClick={() => {
                  playSound(560, 0.04);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === 'portfolio'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>{t.nav.projects}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#contact"
                onClick={() => {
                  playSound(600, 0.04);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === 'contact'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>{t.nav.contact}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (next) playSound(580, 0.1);
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      soundEnabled
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                    title={soundEnabled ? t.nav.soundActive : t.nav.soundInactive}
                    aria-label={t.nav.soundLabel}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
                  </button>

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
          </div>
        )}
      </nav>

      {/* Espaçador para compensar a navbar fixed no fluxo do documento */}
      <div className="h-16 sm:h-18" aria-hidden="true" />

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
                onClick={() => playSound(520, 0.08)}
                className="flex-1 sm:flex-initial justify-center px-7 py-3.5 rounded-2xl btn-cta-orange text-slate-950 font-extrabold text-sm transition-all shadow-lg cursor-pointer flex items-center gap-2 group active:scale-95"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#portfolio"
                onClick={() => playSound(440, 0.08)}
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
            chip1Text={t.hero.chips.chip1}
            chip2Text={t.hero.chips.chip2}
            chip3Text={t.hero.chips.chip3}
          />

        </div>
      </section>

      {/* 3. SCI-FI LAB: ABOUT & SKILLS HUD (Inspirado no Holographic Pod das telas 00:06 a 00:08) */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-800/80">
        
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
                {skillsData.map((skill) => (
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
                    <span className="text-slate-400">{language === 'pt' ? 'Testes Auditados' : 'Audited Tests'}</span>
                    <span className="text-[10px] text-slate-500 font-normal">API: 470 • Front: 416 • Auth: 234</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">{language === 'pt' ? '1.120 Casos' : '1,120 Cases'}</span>
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
                      const el = document.getElementById("portfolio");
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group"
                  >
                    <span className="text-slate-200 group-hover:text-white truncate">{eco}</span>
                    <span className="text-[11px] text-indigo-300 font-semibold bg-indigo-500/20 px-2 py-0.5 rounded-md">
                      {count} repos &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 4. PORTFOLIO SHOWCASE: "Some things I've worked on" (Carrossel Horizontal como na referência 00:09-00:13) */}
      <section id="portfolio" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-800/80">
        
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
                      <span className="truncate">{repo.highlightMetric || repo.category}</span>
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
                    {repo.description}
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
                    Explorar &rarr;
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Indicadores / Bolinhas do Carrossel */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {stats.featuredRepos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                playSound(480, 0.05);
                setCarouselIndex(idx);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                carouselIndex === idx ? "w-8 bg-[#38bdf8]" : "w-2 bg-slate-700 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>

        {/* ÁREA EXPANSÍVEL: CATÁLOGO COMPLETO COM BUSCA & FILTROS (33 Repositórios) */}
        <div className="mt-16 pt-12 border-t border-slate-800/80">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-[#38bdf8]" />
                {t.catalog.title}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {language === 'pt' ? 'Filtre por tecnologias, visibilidade e categorias em tempo real.' : 'Filter by technologies, visibility, and categories in real-time.'}
              </p>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {language === 'pt' 
                ? <>Exibindo <strong className="text-white">{filteredRepos.length}</strong> de {stats.total} projetos</>
                : <>Showing <strong className="text-white">{filteredRepos.length}</strong> of {stats.total} projects</>}
            </span>
          </div>

          {/* Barra de Filtros Compacta */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.catalog.searchPlaceholder} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl py-2.5 pl-11 pr-9 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filtro de Visibilidade */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setVisibilityFilter("Todos")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${visibilityFilter === "Todos" ? "bg-[#2563eb] text-white" : "text-slate-300 hover:text-white"}`}
                >
                  {t.catalog.filterAll} ({stats.total})
                </button>
                <button 
                  onClick={() => setVisibilityFilter("Publicos")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${visibilityFilter === "Publicos" ? "bg-[#2563eb] text-white" : "text-slate-300 hover:text-white"}`}
                >
                  {t.catalog.filterPublic} ({stats.publicCount})
                </button>
                <button 
                  onClick={() => setVisibilityFilter("Privados")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${visibilityFilter === "Privados" ? "bg-[#2563eb] text-white" : "text-slate-300 hover:text-white"}`}
                >
                  {t.catalog.filterPrivate} ({stats.privateCount})
                </button>
              </div>
            </div>

            {/* Linha de Categorias */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3.5">
              <div className="flex flex-wrap gap-2">
                {categoriesList.map((cat) => {
                  const Icon = categoryIcons[cat] || Folder;
                  const active = selectedCategory === cat;
                  const count = stats.categoryCounts[cat] || 0;
                  const label = t.categories[cat as keyof typeof t.categories] || cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? "bg-[#2563eb] text-white border-[#3b82f6] shadow-md shadow-[#2563eb]/25"
                          : "bg-slate-800/50 text-slate-200 border-slate-700/60 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{label}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                        active ? "bg-blue-800/80 text-blue-100" : "bg-slate-900/80 text-slate-400"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {(searchQuery || selectedCategory !== "Todos" || visibilityFilter !== "Todos" || selectedLanguage !== "Todas" || selectedEcosystem !== "Todos") && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-[#38bdf8] hover:underline font-medium cursor-pointer ml-auto"
                >
                  {t.catalog.clearFilters}
                </button>
              )}
            </div>

            {/* Linha de Linguagens com Gráfico Interativo */}
            <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#38bdf8]" />
                  {language === 'pt' ? 'Distribuição de Linguagens:' : 'Language Distribution:'}
                </span>
                {selectedLanguage !== "Todas" && (
                  <button
                    onClick={() => setSelectedLanguage("Todas")}
                    className="text-[11px] text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    {language === 'pt' ? 'Mostrar todas' : 'Show all'}
                  </button>
                )}
              </div>

              {/* Mini Gráfico Recharts Memoizado */}
              <LanguageDistributionChart
                langData={stats.langData}
                selectedLanguage={selectedLanguage}
                totalRepos={stats.total}
                onSelectLanguage={(lang) => setSelectedLanguage((prev) => (prev === lang ? "Todas" : lang))}
              />

              {/* Pills de Linguagem */}
              <div className="flex flex-wrap gap-1.5">
                {stats.langData.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedLanguage((prev) => prev === item.name ? "Todas" : item.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 border ${
                      selectedLanguage === item.name
                        ? "bg-blue-500/25 border-blue-400 text-white font-semibold shadow-sm"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.Quantidade})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grade de Todos os Projetos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.length === 0 ? (
              <div className="col-span-full py-16 text-center glass-card rounded-2xl border border-slate-800">
                <Folder className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg">{t.catalog.emptyTitle}</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                  {t.catalog.emptyDesc}
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold cursor-pointer transition-all"
                >
                  {t.catalog.clearFilters}
                </button>
              </div>
            ) : (
              visibleRepos.map((repo, idx) => (
                <RepositoryCard
                  key={`catalog-${repo.id}`}
                  repo={repo}
                  idx={idx}
                  language={language}
                  categoryLabel={t.categories[repo.category as keyof typeof t.categories] || repo.category}
                  ecosystemLabel={repo.ecosystem ? (t.ecosystems[repo.ecosystem as keyof typeof t.ecosystems] || repo.ecosystem) : undefined}
                  privateBadgeText={t.catalog.card.privateBadge}
                  publicBadgeText={t.catalog.card.publicBadge}
                  viewDetailsText={language === 'pt' ? 'Ver detalhes' : 'View details'}
                  onSelect={handleSelectRepo}
                  onPlaySound={playSound}
                />
              ))
            )}

            {hasMore && (
              <div ref={loadMoreRef} className="col-span-full py-8 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2 text-xs text-[#38bdf8] font-mono">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'pt' ? 'Carregando mais projetos...' : 'Loading more projects...'}</span>
                </div>
                <button
                  onClick={() => setVisibleCount(filteredRepos.length)}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer mt-1"
                >
                  {language === 'pt' 
                    ? `Carregar todos de uma vez (${filteredRepos.length - visibleCount} restantes)` 
                    : `Load all at once (${filteredRepos.length - visibleCount} remaining)`}
                </button>
              </div>
            )}
          </div>

        </div>

      </section>

      {/* 5. CONTACT SECTION: "Say hello 👋 / Contact me" (Inspirado nas telas 00:14 a 00:17) */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-800/80">
        
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

            {contactSubmitted ? (
              <div className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-4">
                <Check className="w-8 h-8 shrink-0 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-white text-base">{t.contact.form.successTitle}</h4>
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
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-950 border border-slate-700 text-[#38bdf8]">
                  <Terminal className="w-4 h-4" />
                </div>
              </div>

              <h4 className="text-xl font-bold text-white">{t.contact.card.developerTitle}</h4>
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

            </div>
          </div>

        </div>

      </section>

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
                    {selectedRepo.highlightMetric}
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
                  {selectedRepo.details}
                </p>
              </div>

              {/* Destaques de Engenharia */}
              {selectedRepo.highlights && selectedRepo.highlights.length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t.modal.highlights}
                  </h4>
                  <ul className="space-y-2">
                    {selectedRepo.highlights.map((item, idx) => (
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
                      : `Other Modules in ${selectedRepo.ecosystem} (${relatedEcosystemRepos.length})`}
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
                            {rel.description}
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
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <a href="#hero" className="hover:text-slate-300">{t.nav.home}</a>
          <span>•</span>
          <a href="#about" className="hover:text-slate-300">{t.nav.about}</a>
          <span>•</span>
          <a href="#portfolio" className="hover:text-slate-300">{t.nav.projects}</a>
          <span>•</span>
          <a href="#contact" className="hover:text-slate-300">{t.nav.contact}</a>
        </div>
      </footer>

    </div>
  );
}
