import { useState, useMemo, useEffect, useRef } from 'react';
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
  Mail,
  User,
  Send,
  Volume2,
  VolumeX,
  ShieldCheck,
  Heart,
  Rocket,
  ArrowRight,
  Check
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { repositories } from './data/repositories';
import type { Repository } from './data/repositories';

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
      <div className="bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/60 min-w-[155px]">
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

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Todas");
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>("Todos");
  const [visibilityFilter, setVisibilityFilter] = useState<"Todos" | "Publicos" | "Privados">("Todos");
  const [sortOrder, setSortOrder] = useState<"default" | "recent" | "oldest">("default");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  // Estado do Som / Áudio Sintético (inspirado no botão de som da referência)
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Estado do Carrossel de Projetos em Destaque
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Estado do Formulário de Contato
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Reprodução de bip sutil de sci-fi
  const playSound = (freq = 440, duration = 0.08) => {
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
  };

  // Fechar modal com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedRepo(null);
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
    // Abre cliente de e-mail como fallback
    const subject = encodeURIComponent(`Contato pelo Portfólio de ${contactName || 'Visitante'}`);
    const body = encodeURIComponent(`Olá Matheus,\n\nNome: ${contactName}\nEmail: ${contactEmail}\n\nMensagem:\n${contactMessage}`);
    window.open(`mailto:koszudikasc@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] font-sans selection:bg-[#2563eb]/30 selection:text-white pb-16">
      
      {/* Background Decorativo Global */}
      <div className="fixed top-0 left-0 w-full h-[700px] bg-gradient-to-b from-[#1e1b4b]/20 via-transparent to-transparent pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#38bdf8]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[5%] w-[600px] h-[600px] bg-[#6366f1]/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* 1. NAVBAR / HEADER SUPERIOR (inspirado no topo da referência com Cubo e Som) */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#070b13]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Logo Isometric Cube */}
          <a
            href="#hero"
            onClick={() => playSound(520, 0.05)}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <IsometricCubeLogo className="w-9 h-9 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-[#38bdf8] transition-colors leading-none">
                Koszudikas-C<span className="text-[#38bdf8]">.dev</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">
                MATHEUS GOMES
              </span>
            </div>
          </a>

          {/* Links de Navegação */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#hero" className="hover:text-white hover:text-[#38bdf8] transition-colors">Início</a>
            <a href="#about" className="hover:text-white hover:text-[#38bdf8] transition-colors">Sobre & Skills</a>
            <a href="#portfolio" className="hover:text-white hover:text-[#38bdf8] transition-colors">Projetos</a>
            <a href="#contact" className="hover:text-white hover:text-[#38bdf8] transition-colors">Contato</a>
          </div>

          {/* Controles da Direita (Botão de Som + GitHub) */}
          <div className="flex items-center gap-3">
            {/* Botão de Som (como na referência no canto superior direito) */}
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playSound(580, 0.1);
              }}
              title={soundEnabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros interativos"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20" 
                  : "bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Link GitHub */}
            <a
              href="https://github.com/Koszudikas-C"
              target="_blank"
              rel="noreferrer"
              onClick={() => playSound(620, 0.05)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/40 text-xs font-semibold text-white transition-all shadow-sm"
            >
              <svg className="w-4 h-4 text-[#38bdf8]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
              GitHub
            </a>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION ("Hi, my name is David" -> Matheus Gomes) */}
      <section id="hero" className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Lado Esquerdo - Apresentação Limpa & Direta */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-[#38bdf8] text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Disponível para Projetos & Arquiteturas
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Olá, meu <br />
              nome é <span className="text-gradient">Matheus.</span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl mt-6 max-w-xl font-light leading-relaxed">
              Arquiteto de software & desenvolvedor full-stack. Crio sistemas distribuídos de alta performance, agentes autônomos de IA e soluções de engenharia robustas.
            </p>

            {/* Botões de Ação estilo "Get in touch" */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a
                href="#contact"
                onClick={() => playSound(520, 0.08)}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-2 group"
              >
                Entre em contato
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#portfolio"
                onClick={() => playSound(440, 0.08)}
                className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
              >
                Ver Projetos
                <Code className="w-4 h-4 text-[#38bdf8]" />
              </a>
            </div>

            {/* Quick Badges no Rodapé do Hero */}
            <div className="flex flex-wrap items-center gap-3 mt-10 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="text-slate-300 font-semibold">Especialidades:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">.NET 10 / C#</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Rust High-Throughput</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Angular & React</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">IA & ONNX Vision</span>
            </div>

          </div>

          {/* Lado Direito - Ilustração / Estação de Trabalho do Desenvolvedor (inspirada no 3D Desk da referência) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            <div className="relative w-full max-w-md aspect-square rounded-3xl p-6 glass-panel border border-slate-700/80 shadow-2xl flex flex-col justify-between overflow-hidden group">
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">koszudikas-c@devstation:~</span>
                </div>
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              </div>

              {/* Centro: Avatar com Moldura Isométrica e Status */}
              <div className="my-auto flex flex-col items-center text-center py-4">
                <div className="relative group/avatar cursor-pointer">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[#38bdf8] via-[#6366f1] to-[#a855f7] opacity-60 blur-md group-hover/avatar:opacity-100 transition duration-500 animate-pulse-glow" />
                  <img
                    src="https://github.com/Koszudikas-C.png"
                    alt="Matheus Gomes"
                    className="relative w-28 h-28 rounded-full object-cover border-2 border-slate-700 shadow-2xl bg-slate-900"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-slate-700">
                    <span className="block w-4 h-4 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-4 flex items-center gap-1.5">
                  Matheus Gomes
                </h3>
                <p className="text-xs text-[#38bdf8] font-mono">
                  @Koszudikas-C • Systems Architect
                </p>

                {/* Linha de Código Interativa */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left font-mono text-[11px] text-slate-300 w-full">
                  <div className="text-emerald-400 flex items-center gap-1">
                    <Terminal className="w-3 h-3" />
                    <span>$ cargo run --release --target=clean-arch</span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    ✓ 33 repositórios compilados com sucesso.
                  </div>
                  <div className="text-blue-400 mt-0.5">
                    ● 470+ testes unitários & integração ativos.
                  </div>
                </div>
              </div>

              {/* Rodapé do Card Terminal */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3 font-mono">
                <span>ESTADO: ONLINE</span>
                <span className="text-emerald-400">LATÊNCIA: 12ms</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. SCI-FI LAB: ABOUT & SKILLS HUD (Inspirado no Holographic Pod das telas 00:06 a 00:08) */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/80">
        
        {/* Header da Seção */}
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            — Sobre mim & Habilidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Estação de Habilidades & Trajetória
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Inspirada na estação de bio-escaneamento e laboratório HUD da referência, consolidando a stack técnica e visão arquitetural.
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
                    src="https://github.com/Koszudikas-C.png"
                    alt="Matheus"
                    className="w-16 h-16 rounded-xl object-cover border border-[#38bdf8]/40"
                  />
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#38bdf8] tracking-widest uppercase">ID_DEVs: #0023</span>
                  <h3 className="text-xl font-bold text-white leading-tight">Matheus Gomes</h3>
                  <span className="text-xs text-slate-400 font-medium">Full-Stack & Systems Architect</span>
                </div>
              </div>

              {/* Informações Rápidas Estilo Ficha */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">PAÍS / BASE</span>
                  <span className="text-white font-semibold">Brasil 🇧🇷</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">REPOSITÓRIOS</span>
                  <span className="text-[#38bdf8] font-bold">{stats.total} Ativos</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO SKILLS (Barras de Habilidades como no vídeo) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#38bdf8] flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Matriz de Habilidades Principais
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">NÍVEL DE DOMÍNIO</span>
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
                Trajetória & Foco Arquitetural
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 w-fit">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">Engenharia Limpa</h5>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    Clean Architecture, DDD e CQRS desacoplado com foco em alta manutenibilidade, isolamento de domínio e suítes completas de testes automatizados.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] w-fit">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">IA Generativa & Visão</h5>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    Sistemas com calibração estatística de personas, agentes autônomos multimodelo (OpenAI/Gemini/Ollama) e inferência em CPU com ONNX Runtime.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">Segurança & Concorrência</h5>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    Navegadores anti-detecção stealth, sanitização profunda contra prompt injection, streaming I/O massivo e criptografia AES-256-GCM.
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
                TELEMETRIA DE ARQUITETURA
              </span>

              {/* Wireframe Hologram Box */}
              <div className="relative w-40 h-40 flex items-center justify-center my-2">
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-spin" style={{ animationDuration: '15s' }} />
                <div className="absolute inset-3 rounded-full border border-dashed border-[#38bdf8]/40 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
                <IsometricCubeLogo className="w-20 h-20 animate-float" />
              </div>

              <div className="w-full mt-4 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Total de Projetos</span>
                  <span className="text-white font-bold">{stats.total} Repositórios</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Testes Automatizados</span>
                  <span className="text-emerald-400 font-bold">+700 Casos</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Públicos / Privados</span>
                  <span className="text-[#38bdf8] font-bold">{stats.publicCount} / {stats.privateCount}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 w-full flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                STATUS: DISPONÍVEL PARA PROJETOS
              </div>
            </div>

            {/* Quick Links de Ecossistemas */}
            <div className="glass-panel p-6 rounded-2xl">
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                Principais Ecossistemas
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
      <section id="portfolio" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/80">
        
        {/* Header da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2">
              <Folder className="w-4 h-4" />
              — Portfólio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Alguns projetos que construí
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Navegue pelos projetos em destaque usando as setas do carrossel ou explore o catálogo completo abaixo.
            </p>
          </div>

          {/* Controles de Próximo / Anterior do Carrossel (como na referência) */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={prevSlide}
              title="Projeto Anterior"
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              {carouselIndex + 1} / {stats.featuredRepos.length}
            </span>
            <button
              onClick={nextSlide}
              title="Próximo Projeto"
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
                      {repo.private ? "Privado" : "Público"}
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
                Catálogo Geral de Repositórios
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Filtre por tecnologias, visibilidade e categorias em tempo real.
              </p>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Exibindo <strong className="text-white">{filteredRepos.length}</strong> de {stats.total} projetos
            </span>
          </div>

          {/* Barra de Filtros Compacta */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome, tecnologia (.NET 10, Rust, Angular, ONNX) ou descrição..." 
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
                  Todos ({stats.total})
                </button>
                <button 
                  onClick={() => setVisibilityFilter("Publicos")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${visibilityFilter === "Publicos" ? "bg-[#2563eb] text-white" : "text-slate-300 hover:text-white"}`}
                >
                  Públicos ({stats.publicCount})
                </button>
                <button 
                  onClick={() => setVisibilityFilter("Privados")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${visibilityFilter === "Privados" ? "bg-[#2563eb] text-white" : "text-slate-300 hover:text-white"}`}
                >
                  Privados ({stats.privateCount})
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
                      <span>{cat}</span>
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
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Linha de Linguagens com Gráfico Interativo */}
            <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Distribuição de Linguagens:
                </span>
                {selectedLanguage !== "Todas" && (
                  <button
                    onClick={() => setSelectedLanguage("Todas")}
                    className="text-[11px] text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    Mostrar todas
                  </button>
                )}
              </div>

              {/* Mini Gráfico Recharts */}
              <div className="w-full h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.langData} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'rgba(56, 189, 248, 0.12)', radius: 4 }} content={<CustomLanguageTooltip totalRepos={stats.total} />} />
                    <Bar
                      dataKey="Quantidade"
                      radius={[4, 4, 0, 0]}
                      className="cursor-pointer"
                      onClick={(data: any) => {
                        if (data && data.name) {
                          setSelectedLanguage((prev) => prev === data.name ? "Todas" : data.name);
                        }
                      }}
                    >
                      {stats.langData.map((entry, index) => (
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
            {filteredRepos.map((repo) => {
              const CategoryIcon = categoryIcons[repo.category] || Folder;
              return (
                <article
                  key={`catalog-${repo.id}`}
                  onClick={() => {
                    playSound(460, 0.06);
                    setSelectedRepo(repo);
                  }}
                  className="group relative cursor-pointer glass-card p-6 rounded-2xl flex flex-col justify-between overflow-hidden"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] shrink-0">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] text-slate-300 tracking-wide uppercase font-semibold truncate">
                          {repo.category}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border shrink-0 ${
                        repo.private
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}>
                        {repo.private ? "Privado" : "Público"}
                      </span>
                    </div>

                    {repo.ecosystem && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                          <Network className="w-3 h-3" />
                          {repo.ecosystem}
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
                      {repo.description || "Nenhuma descrição fornecida."}
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
                      <span className="text-slate-200 font-medium">{repo.language || "Outra"}</span>
                    </div>

                    <span className="text-[#38bdf8] group-hover:text-white font-semibold flex items-center gap-1">
                      Ver detalhes &rarr;
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

        </div>

      </section>

      {/* 5. CONTACT SECTION: "Say hello 👋 / Contact me" (Inspirado nas telas 00:14 a 00:17) */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/80">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Lado Esquerdo - Formulário de Contato Estilizado (como na referência) */}
          <div className="lg:col-span-7 flex flex-col">
            
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              — Diga um olá 👋
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              Entre em contato
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg font-light leading-relaxed">
              Tem um projeto em mente, busca consultoria em arquitetura de software ou quer trocar uma ideia sobre IA e sistemas distribuídos? Envie uma mensagem abaixo.
            </p>

            {contactSubmitted ? (
              <div className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-4">
                <Check className="w-8 h-8 shrink-0 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-white text-base">Mensagem Iniciada!</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Seu cliente de e-mail foi aberto com os dados preenchidos para envio direto a Matheus Gomes.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-8 flex flex-col gap-5">
                
                {/* Campo Nome */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Nome:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome ou empresa..."
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                  />
                </div>

                {/* Campo Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Email:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                  />
                </div>

                {/* Campo Mensagem */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Mensagem:
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Conte sobre seu projeto, desafio técnico ou oportunidade..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all resize-none"
                  />
                </div>

                {/* Linha Inferior com Ícones Sociais + Botão Submit */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  
                  {/* Ícones de Redes (GitHub, Mail, etc.) */}
                  <div className="flex items-center gap-3 text-slate-400">
                    <a
                      href="https://github.com/Koszudikas-C"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
                      title="GitHub"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                      </svg>
                    </a>

                    <a
                      href="mailto:koszudikasc@gmail.com"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
                      title="Enviar E-mail"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>

                  {/* Botão Submit Laranja/Azul como na referência */}
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    Submit
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
                    src="https://github.com/Koszudikas-C.png"
                    alt="Matheus Gomes"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-950 border border-slate-700 text-[#38bdf8]">
                  <Terminal className="w-4 h-4" />
                </div>
              </div>

              <h4 className="text-xl font-bold text-white">Matheus Gomes</h4>
              <p className="text-xs text-[#38bdf8] font-mono mt-0.5">Software Engineer & Architect</p>

              <p className="text-slate-300 text-xs mt-4 leading-relaxed max-w-sm">
                Focado na entrega de soluções de alto impacto que combinam código limpo, pipelines de IA e alta taxa de transferência com arquiteturas modernas.
              </p>

              <div className="w-full mt-6 pt-6 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>RESPOSTA:</span>
                  <span className="text-emerald-400 font-semibold">&lt; 24 HORAS</span>
                </div>
                <div className="flex justify-between">
                  <span>MODELO:</span>
                  <span className="text-white">REMOTO / CONSULTORIA</span>
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
                    {selectedRepo.category}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                    selectedRepo.private
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  }`}>
                    {selectedRepo.private ? "Privado" : "Público"}
                  </span>
                  {selectedRepo.ecosystem && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full">
                      <Network className="w-3 h-3" />
                      {selectedRepo.ecosystem}
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
                  Visão Geral & Arquitetura
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
                    Destaques Técnicos
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
                  Stack Tecnológica
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
                    Outros Módulos em {selectedRepo.ecosystem} ({relatedEcosystemRepos.length})
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
                <span>Linguagem principal:</span>
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
                Repositório: <code className="text-slate-200 text-[11px] font-mono">{selectedRepo.fullName}</code>
              </span>
              
              {!selectedRepo.private ? (
                <a 
                  href={selectedRepo.htmlUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl font-semibold text-xs text-white transition-all shadow-lg shadow-[#2563eb]/30"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Código no GitHub
                </a>
              ) : (
                <span className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl font-medium text-xs">
                  <Lock className="w-4 h-4" />
                  Repositório Privado (Proprietário)
                </span>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 7. FOOTER GERAL */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-8 pb-10 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <IsometricCubeLogo className="w-5 h-5" />
          <span className="font-bold text-white tracking-wide">Koszudikas-C.dev</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Matheus Gomes (Koszudikas-C). Construído com React, TypeScript, Tailwind CSS e Recharts.</p>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <a href="#hero" className="hover:text-slate-300">Início</a>
          <span>•</span>
          <a href="#about" className="hover:text-slate-300">Sobre & Skills</a>
          <span>•</span>
          <a href="#portfolio" className="hover:text-slate-300">Projetos</a>
          <span>•</span>
          <a href="#contact" className="hover:text-slate-300">Contato</a>
        </div>
      </footer>

    </div>
  );
}
