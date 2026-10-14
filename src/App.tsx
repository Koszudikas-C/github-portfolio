import { useState, useMemo, useEffect } from 'react';
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
  ArrowUpDown,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { repositories } from './data/repositories';
import type { Repository } from './data/repositories';

// Mapeamento de cores para linguagens (ajustadas para alto contraste em tema escuro)
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

// Mapeamento de ícones para categorias
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

const heroSpecialties = [
  ".NET 10 & C# 13",
  "Rust High-Performance",
  "Angular & React",
  "IA Generativa & ONNX Vision",
  "Clean Architecture & DDD",
  "Kubernetes (K3s) & DevOps"
];

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

  // Fechar modal com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedRepo(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Estatísticas gerais, contagens por categoria e ecossistemas
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

    const featuredRepos = repositories.filter(r => r.featured);

    return { total, publicCount, privateCount, langData, categoryCounts, ecosystemCounts, featuredRepos };
  }, []);

  // 2. Filtragem de repositórios
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

  // Verifica se algum filtro está ativo
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "Todos" ||
    selectedLanguage !== "Todas" ||
    selectedEcosystem !== "Todos" ||
    visibilityFilter !== "Todos";

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
    setSelectedLanguage("Todas");
    setSelectedEcosystem("Todos");
    setVisibilityFilter("Todos");
    setSortOrder("default");
  };

  // Repositórios irmãos do mesmo ecossistema para o modal
  const relatedEcosystemRepos = useMemo(() => {
    if (!selectedRepo?.ecosystem) return [];
    return repositories.filter(
      r => r.ecosystem === selectedRepo.ecosystem && r.id !== selectedRepo.id
    );
  }, [selectedRepo]);

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] font-sans selection:bg-[#2563eb]/30 selection:text-white pb-20">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-[650px] bg-gradient-to-b from-[#180f33]/35 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] left-[15%] w-[450px] h-[450px] bg-[#6366f1]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[15%] right-[8%] w-[520px] h-[520px] bg-[#2563eb]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header / Hero com Identidade Visual */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-8 border-b border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar com anel luminoso */}
            <div className="relative shrink-0 group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#2563eb] via-[#38bdf8] to-[#6366f1] opacity-70 blur-sm group-hover:opacity-100 transition duration-500" />
              <img
                src="https://github.com/Koszudikas-C.png"
                alt="Matheus Gomes (Koszudikas-C)"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-800 shadow-2xl bg-slate-900"
              />
              <span
                title="Disponível para projetos & arquiteturas"
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#070b13]"
              />
            </div>

            {/* Bio e Especialidades */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 text-xs font-semibold bg-[#2563eb]/20 text-[#60a5fa] rounded-full border border-[#3b82f6]/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Engenharia de Software & IA
                </span>
                <span className="px-2.5 py-1 text-xs font-medium bg-slate-800/80 text-slate-300 rounded-full border border-slate-700/70">
                  {stats.total} Repositórios no GitHub
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2.5">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-cyan-500/20 border border-blue-400/40 text-[#38bdf8] shadow-lg shadow-blue-500/15 shrink-0 flex items-center justify-center">
                  <Terminal className="w-6 h-6 sm:w-7 sm:h-7 text-[#38bdf8]" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="text-gradient">Koszudikas-C</span>.dev
                </h1>
              </div>
              <p className="text-lg sm:text-xl font-medium text-[#60a5fa] mt-0.5">
                Matheus Gomes <span className="text-slate-500 font-normal text-sm sm:text-base">• Full-Stack & Systems Architect</span>
              </p>
              <p className="text-slate-300 mt-2.5 text-sm sm:text-base max-w-2xl font-light leading-relaxed">
                Arquitetura de sistemas distribuídos, agentes autônomos de IA e visão computacional (ONNX), automação anti-detecção, motores de alta performance em Rust e criptografia Blockchain.
              </p>

              {/* Badges de Especialidades Principais */}
              <div className="flex flex-wrap gap-2 mt-4">
                {heroSpecialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700/80"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ações Rápidas Header */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <a 
              href="https://github.com/Koszudikas-C" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm transition-all shadow-lg shadow-[#2563eb]/25"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
              Ver perfil no GitHub
              <ExternalLink className="w-4 h-4 opacity-80" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 mt-10 flex flex-col gap-10">

        {/* Vitrine de Projetos em Destaque (Bento Grid) - exibida quando não há filtros restritivos ativos */}
        {!hasActiveFilters && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#60a5fa] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Projetos Principais
                </span>
                <h2 className="text-2xl font-bold text-white mt-0.5">
                  Sistemas & Arquiteturas em Destaque
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Clique em qualquer projeto para inspecionar a arquitetura e módulos relacionados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
              {stats.featuredRepos.map((repo, idx) => {
                // Os 2 primeiros ocupam 3 colunas cada (metade da linha no desktop), os 3 seguintes ocupam 2 colunas cada
                const spanClass = idx < 2 ? "lg:col-span-3" : "lg:col-span-2";
                const CategoryIcon = categoryIcons[repo.category] || Folder;

                return (
                  <article
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={`${spanClass} group cursor-pointer featured-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden`}
                  >
                    <div className="min-w-0">
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                        <span
                          title={repo.highlightMetric || repo.category}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 min-w-0 max-w-full overflow-hidden"
                        >
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

                      {/* Título & Ecossistema */}
                      <div className="flex items-center gap-2 mt-2 min-w-0">
                        <CategoryIcon className="w-5 h-5 text-[#60a5fa] shrink-0" />
                        <h3
                          title={repo.name}
                          className="text-xl font-bold text-white group-hover:text-[#60a5fa] transition-colors truncate"
                        >
                          {repo.name}
                        </h3>
                      </div>

                      {/* Descrição */}
                      <p className="text-slate-200 text-sm mt-2.5 leading-relaxed">
                        {repo.description}
                      </p>

                      {/* Bullet points para os 2 primeiros cards maiores */}
                      {idx < 2 && repo.highlights && (
                        <ul className="mt-3.5 space-y-1.5 border-t border-slate-800/80 pt-3">
                          {repo.highlights.slice(0, 2).map((item, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {repo.techStack.slice(0, idx < 2 ? 6 : 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-0.5 text-[11px] font-medium rounded-md bg-slate-900/90 text-slate-200 border border-slate-700/80 group-hover:border-blue-400/40 transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-800/80 group-hover:border-blue-500/30 pt-3.5 mt-5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full ring-2 ring-white/15"
                          style={{ backgroundColor: languageColors[repo.language] || languageColors.Default }}
                        />
                        <span className="text-slate-200 font-semibold">{repo.language}</span>
                        {repo.ecosystem && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium">
                            <Network className="w-3 h-3" />
                            {repo.ecosystem}
                          </span>
                        )}
                      </div>
                      <span className="text-[#60a5fa] group-hover:text-white font-semibold group-hover:translate-x-1 transition-all flex items-center gap-1">
                        Explorar arquitetura <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Área Principal: Painel Lateral (Gráfico/Ecossistemas) + Catálogo Completo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Lado Esquerdo - Estatísticas, Linguagens & Ecossistemas (Sticky) */}
          <aside className="lg:col-span-1 lg:sticky lg:top-6 h-fit flex flex-col gap-6">
            
            {/* Card Geral */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-base font-semibold flex items-center gap-2 text-[#60a5fa]">
                <Layers className="w-5 h-5" />
                Visibilidade do Portfólio
              </h2>
              <div className="grid grid-cols-3 gap-2.5 mt-4">
                <button
                  onClick={() => setVisibilityFilter("Todos")}
                  className={`text-center p-3 rounded-xl border transition-all cursor-pointer ${
                    visibilityFilter === "Todos"
                      ? "bg-blue-500/20 border-blue-400/50 shadow-inner"
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600"
                  }`}
                >
                  <span className="text-xs text-slate-300 block font-medium">Total</span>
                  <span className="text-2xl font-bold text-white mt-0.5 block">{stats.total}</span>
                </button>
                <button
                  onClick={() => setVisibilityFilter("Publicos")}
                  className={`text-center p-3 rounded-xl border transition-all cursor-pointer ${
                    visibilityFilter === "Publicos"
                      ? "bg-emerald-500/20 border-emerald-400/50 shadow-inner"
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600"
                  }`}
                >
                  <span className="text-xs text-slate-300 block font-medium">Públicos</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-0.5 block">{stats.publicCount}</span>
                </button>
                <button
                  onClick={() => setVisibilityFilter("Privados")}
                  className={`text-center p-3 rounded-xl border transition-all cursor-pointer ${
                    visibilityFilter === "Privados"
                      ? "bg-amber-500/20 border-amber-400/50 shadow-inner"
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600"
                  }`}
                >
                  <span className="text-xs text-slate-300 block font-medium">Privados</span>
                  <span className="text-2xl font-bold text-amber-300 mt-0.5 block">{stats.privateCount}</span>
                </button>
              </div>
            </div>

            {/* Filtro por Ecossistema / Suíte */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold flex items-center gap-2 text-[#60a5fa]">
                  <Network className="w-5 h-5" />
                  Ecossistemas & Suítes
                </h2>
                {selectedEcosystem !== "Todos" && (
                  <button
                    onClick={() => setSelectedEcosystem("Todos")}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Todos
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3.5">
                Filtre repositórios que operam de forma integrada no mesmo ecossistema:
              </p>
              <div className="flex flex-col gap-2">
                {Object.entries(stats.ecosystemCounts).map(([eco, count]) => {
                  const active = selectedEcosystem === eco;
                  return (
                    <button
                      key={eco}
                      onClick={() => setSelectedEcosystem(prev => prev === eco ? "Todos" : eco)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        active
                          ? "bg-indigo-500/25 border-indigo-400/60 text-white font-semibold shadow-sm"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-200 hover:bg-slate-800/80 hover:border-slate-600"
                      }`}
                    >
                      <span className="truncate">{eco}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        active ? "bg-indigo-500 text-white" : "bg-slate-900/80 text-slate-300"
                      }`}>
                        {count} repos
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gráfico de Linguagens */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold flex items-center gap-2 text-[#60a5fa]">
                  <Code className="w-5 h-5" />
                  Linguagens Utilizadas
                </h2>
                {selectedLanguage !== "Todas" && (
                  <button
                    onClick={() => setSelectedLanguage("Todas")}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.langData}
                    layout="vertical"
                    margin={{ left: -5, right: 12, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 500 }} 
                      width={82}
                      interval={0}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.12)', radius: 6 }}
                      content={<CustomLanguageTooltip totalRepos={stats.total} />}
                    />
                    <Bar
                      dataKey="Quantidade"
                      radius={[0, 6, 6, 0]}
                      barSize={14}
                      className="cursor-pointer"
                      onClick={(data: any) => {
                        if (data && data.name) {
                          setSelectedLanguage(prev => prev === data.name ? "Todas" : data.name);
                        }
                      }}
                    >
                      {stats.langData.map((entry, index) => {
                        const isSelected = selectedLanguage === "Todas" || selectedLanguage === entry.name;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            fillOpacity={isSelected ? 1 : 0.3}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Lista Legendada Interativa */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                {stats.langData.map((item) => {
                  const active = selectedLanguage === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setSelectedLanguage(prev => prev === item.name ? "Todas" : item.name)}
                      className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                        active
                          ? "bg-blue-500/20 border-blue-400/50 text-white font-semibold"
                          : "bg-slate-800/30 border-transparent hover:bg-slate-800/80 hover:border-slate-700 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 bg-slate-900/70 px-1.5 py-0.5 rounded">
                        {item.Quantidade}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Lado Direito - Barra de Filtros Compacta & Grade de Repositórios */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Barra de Filtros Enxuta (2 linhas) */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
              
              {/* Linha 1: Busca + Ordenação + Contador */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome, tecnologia (.NET 10, Rust, Angular, ONNX) ou descrição..." 
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

                {/* Ordenação Compacta */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                    <span className="pl-2.5 pr-1 flex items-center gap-1 text-slate-400 font-medium">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      Ordem:
                    </span>
                    <button 
                      onClick={() => setSortOrder("default")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${sortOrder === "default" ? "bg-[#2563eb] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/60"}`}
                    >
                      Destaques
                    </button>
                    <button 
                      onClick={() => setSortOrder("recent")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${sortOrder === "recent" ? "bg-[#2563eb] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/60"}`}
                    >
                      Recentes
                    </button>
                    <button 
                      onClick={() => setSortOrder("oldest")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${sortOrder === "oldest" ? "bg-[#2563eb] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/60"}`}
                    >
                      Antigos
                    </button>
                  </div>
                </div>
              </div>

              {/* Linha 2: Categorias com Ícone e Contador */}
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
                            : "bg-slate-800/50 text-slate-200 border-slate-700/60 hover:bg-slate-800 hover:text-white hover:border-slate-600"
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

                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpar filtros ({filteredRepos.length}/{stats.total})
                  </button>
                )}
              </div>
            </div>

            {/* Cabeçalho da Grade */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-200">
                  {hasActiveFilters ? "Resultados Filtrados" : "Todos os Repositórios"}
                </h3>
                {selectedEcosystem !== "Todos" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    <Network className="w-3 h-3" />
                    {selectedEcosystem}
                    <button onClick={() => setSelectedEcosystem("Todos")} className="hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedLanguage !== "Todas" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    {selectedLanguage}
                    <button onClick={() => setSelectedLanguage("Todas")} className="hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                Exibindo <strong className="text-white">{filteredRepos.length}</strong> de {stats.total} projetos
              </span>
            </div>

            {/* Grade de Repositórios */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRepos.length > 0 ? (
                filteredRepos.map((repo) => {
                  const CategoryIcon = categoryIcons[repo.category] || Folder;
                  return (
                    <article 
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className="group relative cursor-pointer glass-card p-6 rounded-2xl flex flex-col justify-between overflow-hidden"
                    >
                      <div className="min-w-0">
                        {/* Top Header Card */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#60a5fa] group-hover:bg-blue-500/20 group-hover:text-white transition-colors shrink-0">
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] text-slate-300 group-hover:text-slate-200 tracking-wide uppercase font-semibold truncate">
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

                        {/* Badge de Ecossistema (se pertencer a uma suíte) */}
                        {repo.ecosystem && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                              <Network className="w-3 h-3" />
                              {repo.ecosystem}
                            </span>
                          </div>
                        )}

                        {/* Nome do Projeto */}
                        <h3
                          title={repo.name}
                          className="text-lg font-bold text-white group-hover:text-[#60a5fa] transition-colors leading-snug truncate"
                        >
                          {repo.name}
                        </h3>

                        {/* Descrição Curta */}
                        <p className="text-slate-300 group-hover:text-slate-100 text-sm mt-2 line-clamp-2 leading-relaxed transition-colors">
                          {repo.description || "Nenhuma descrição fornecida."}
                        </p>

                        {/* Mini Tech Stack Badges */}
                        {repo.techStack && repo.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3.5">
                            {repo.techStack.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-800/80 text-slate-200 border border-slate-700/70 group-hover:border-blue-400/30 group-hover:bg-slate-800 transition-colors"
                              >
                                {tech}
                              </span>
                            ))}
                            {repo.techStack.length > 3 && (
                              <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-800/50 text-slate-400">
                                +{repo.techStack.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer do Card */}
                      <div className="border-t border-slate-800/80 group-hover:border-blue-500/30 pt-4 mt-5 flex items-center justify-between text-xs transition-colors">
                        {/* Linguagem Badge */}
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10" 
                            style={{ backgroundColor: languageColors[repo.language] || languageColors.Default }}
                          />
                          <span className="text-slate-200 font-medium">{repo.language || "Outra"}</span>
                        </div>
                        
                        {/* Botão Ação */}
                        <span className="text-[#60a5fa] group-hover:text-white font-semibold group-hover:translate-x-1 transition-all flex items-center gap-1">
                          Ver detalhes &rarr;
                        </span>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="col-span-full glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center">
                  <Terminal className="w-12 h-12 text-[#60a5fa] mb-4 opacity-70" />
                  <p className="text-white text-lg font-medium">Nenhum repositório encontrado</p>
                  <p className="text-slate-300 text-sm mt-1 max-w-sm">Tente redefinir os filtros de pesquisa para visualizar mais resultados.</p>
                  <button 
                    onClick={resetAllFilters} 
                    className="mt-6 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-[#2563eb]/30 cursor-pointer"
                  >
                    Limpar todos os filtros
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Detalhes do Projeto (Enriquecido com Destaques e Ecossistema) */}
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
                  <p className="text-xs font-semibold text-[#60a5fa] mt-1">
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
                  <FileText className="w-4 h-4 text-[#60a5fa]" />
                  Visão Geral & Arquitetura
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                  {selectedRepo.details}
                </p>
              </div>

              {/* Destaques de Engenharia (se houver) */}
              {selectedRepo.highlights && selectedRepo.highlights.length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold tracking-wider text-[#60a5fa] uppercase mb-3 flex items-center gap-2">
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
                  <Code className="w-4 h-4 text-[#60a5fa]" />
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

      {/* Footer Geral */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-8 pb-10 flex flex-col items-center justify-center gap-2.5">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[#38bdf8] flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
          </div>
          <span className="font-bold text-white tracking-wide">Koszudikas-C.dev</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Koszudikas-C (Matheus Gomes). Construído com React, TypeScript, Tailwind CSS e Recharts.</p>
      </footer>

    </div>
  );
}
