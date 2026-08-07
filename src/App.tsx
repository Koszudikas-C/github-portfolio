import { useState, useMemo } from 'react';
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
  BookOpen
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { repositories } from './data/repositories';
import type { Repository } from './data/repositories';

// Mapeamento de cores para linguagens
const languageColors: Record<string, string> = {
  "PHP": "#4F5D95",
  "TypeScript": "#3178C6",
  "C#": "#178600",
  "Rust": "#DEA584",
  "CSS": "#563D7C",
  "HTML": "#e34c26",
  "JavaScript": "#f1e05a",
  "Liquid": "#95bf47",
  "Default": "#6b7280"
};

// Mapeamento de ícones para categorias
const categoryIcons: Record<string, any> = {
  "Web & Front-end": Globe,
  "APIs & Back-end": Database,
  "Blockchain & Cripto": Lock,
  "IA, Integração & Automação": Cpu,
  "Estudos & Utilitários": BookOpen
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Todas");
  const [visibilityFilter, setVisibilityFilter] = useState<"Todos" | "Publicos" | "Privados">("Todos");
  const [sortOrder, setSortOrder] = useState<"default" | "recent" | "oldest">("default");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  // 1. Estatísticas gerais
  const stats = useMemo(() => {
    const total = repositories.length;
    const publicCount = repositories.filter(r => !r.private).length;
    const privateCount = repositories.filter(r => r.private).length;
    
    // Contagem de linguagens
    const langCounts: Record<string, number> = {};
    repositories.forEach(r => {
      const lang = r.language || "Outras";
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });

    const langData = Object.keys(langCounts).map(lang => ({
      name: lang,
      Quantidade: langCounts[lang],
      color: languageColors[lang] || languageColors.Default
    })).sort((a, b) => b.Quantidade - a.Quantidade);

    return { total, publicCount, privateCount, langData };
  }, []);

  // 2. Opções exclusivas de linguagens para o filtro
  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    repositories.forEach(r => {
      if (r.language) langs.add(r.language);
    });
    return ["Todas", ...Array.from(langs)];
  }, []);

  // 3. Filtragem de repositórios
  const filteredRepos = useMemo(() => {
    let filtered = repositories.filter(repo => {
      const matchesSearch = 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "Todos" || repo.category === selectedCategory;
      const matchesLanguage = selectedLanguage === "Todas" || repo.language === selectedLanguage;
      
      const matchesVisibility = 
        visibilityFilter === "Todos" ? true :
        visibilityFilter === "Publicos" ? !repo.private :
        repo.private;

      return matchesSearch && matchesCategory && matchesLanguage && matchesVisibility;
    });

    if (sortOrder === "recent") {
      filtered = filtered.sort((a, b) => b.id - a.id);
    } else if (sortOrder === "oldest") {
      filtered = filtered.sort((a, b) => a.id - b.id);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedLanguage, visibilityFilter, sortOrder]);

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] font-sans selection:bg-[#2563eb]/30 selection:text-white pb-20">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#180f33]/30 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[#2563eb]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-6 border-b border-[#ffffff]/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-semibold bg-[#2563eb]/20 text-[#3b82f6] rounded-full border border-[#2563eb]/30 animate-pulse">
                Projetos & Portfólio
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-3">
              <span className="text-gradient">Koszudikas-C</span>.dev
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-[#3b82f6] mt-1">
              Matheus Gomes
            </h2>
            <p className="text-[#9ca3af] mt-3 text-lg max-w-2xl font-light">
              Exploração técnica de sistemas embarcados de IA, criptografia blockchain, raspagem de dados escalável e arquiteturas limpas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/Koszudikas-C" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium text-sm text-[#f3f4f6]"
            >
              <svg className="w-5 h-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
              Ver perfil no GitHub
              <ExternalLink className="w-4 h-4 text-[#9ca3af]" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Lado Esquerdo - Estatísticas & Painel (Sticky) */}
        <section className="lg:col-span-1 lg:sticky lg:top-6 h-fit flex flex-col gap-6">
          
          {/* Card Geral */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[#3b82f6]">
              <Layers className="w-5 h-5" />
              Estatísticas Gerais
            </h2>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-[#9ca3af] block">Total</span>
                <span className="text-2xl font-bold text-gradient">{stats.total}</span>
              </div>
              <div className="text-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-[#9ca3af] block">Públicos</span>
                <span className="text-2xl font-bold text-blue-400">{stats.publicCount}</span>
              </div>
              <div className="text-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-[#9ca3af] block">Privados</span>
                <span className="text-2xl font-bold text-slate-400">{stats.privateCount}</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Linguagens */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[#3b82f6] mb-4">
              <Code className="w-5 h-5" />
              Linguagens Utilizadas
            </h2>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.langData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#d1d5db', fontSize: 12 }} 
                    width={80}
                    interval={0}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="Quantidade" radius={[0, 4, 4, 0]} barSize={12}>
                    {stats.langData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Lista Legendada */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {stats.langData.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#d1d5db] truncate">{item.name} ({item.Quantidade})</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lado Direito - Portfólio, Filtros & Grade */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Barra de Filtros e Busca */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            
            {/* Linha 1: Pesquisa e Visibilidade */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#9ca3af]" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome do repositório, descrição ou tecnologia..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-[#f3f4f6] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-4 top-3.5 text-[#9ca3af] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filtro Visibilidade */}
              <div className="flex p-1 bg-white/5 border border-white/5 rounded-xl self-stretch md:self-auto">
                <button 
                  onClick={() => setVisibilityFilter("Todos")}
                  className={`flex-1 md:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-all ${visibilityFilter === "Todos" ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30" : "text-[#9ca3af] hover:text-white"}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setVisibilityFilter("Publicos")}
                  className={`flex-1 md:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-all ${visibilityFilter === "Publicos" ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30" : "text-[#9ca3af] hover:text-white"}`}
                >
                  Públicos
                </button>
                <button 
                  onClick={() => setVisibilityFilter("Privados")}
                  className={`flex-1 md:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-all ${visibilityFilter === "Privados" ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30" : "text-[#9ca3af] hover:text-white"}`}
                >
                  Privados
                </button>
              </div>
            </div>

            {/* Linha 1.5: Ordenação */}
            <div className="flex flex-wrap items-center gap-2 text-xs border-t border-white/5 pt-4">
              <span className="text-[#9ca3af] font-medium mr-2">Ordenar por:</span>
              <div className="flex p-1 bg-white/5 border border-white/5 rounded-xl">
                <button 
                  onClick={() => setSortOrder("default")}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${sortOrder === "default" ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30" : "text-[#9ca3af] hover:text-white"}`}
                >
                  Padrão
                </button>
                <button 
                  onClick={() => setSortOrder("recent")}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${sortOrder === "recent" ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30" : "text-[#9ca3af] hover:text-white"}`}
                >
                  Mais Recentes
                </button>
                <button 
                  onClick={() => setSortOrder("oldest")}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${sortOrder === "oldest" ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30" : "text-[#9ca3af] hover:text-white"}`}
                >
                  Mais Antigos
                </button>
              </div>
            </div>

            {/* Linha 2: Categorias */}
            <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
              {["Todos", "Web & Front-end", "APIs & Back-end", "Blockchain & Cripto", "IA, Integração & Automação", "Estudos & Utilitários"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${selectedCategory === cat ? "bg-[#2563eb]/20 text-[#3b82f6] border-[#2563eb]/50" : "bg-white/5 text-[#9ca3af] border-transparent hover:bg-white/10 hover:text-white"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Linha 3: Filtro por Linguagem */}
            <div className="flex flex-wrap items-center gap-2 text-xs border-t border-white/5 pt-4">
              <span className="text-[#9ca3af] font-medium mr-2">Linguagem:</span>
              {allLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedLanguage === lang ? "bg-white/10 text-white font-semibold" : "text-[#9ca3af] hover:text-white hover:bg-white/5"}`}
                >
                  {lang === "Todas" ? "Todas" : lang}
                </button>
              ))}
            </div>
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
                    className="group relative cursor-pointer glass-panel p-6 rounded-2xl hover:border-[#2563eb]/50 hover:shadow-xl hover:shadow-[#2563eb]/5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-5 h-5 text-[#3b82f6] group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] text-[#9ca3af] tracking-wider uppercase font-semibold">
                            {repo.category}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${repo.private ? "bg-slate-950/40 text-slate-300 border-slate-800/40" : "bg-blue-950/40 text-blue-300 border-blue-800/40"}`}>
                          {repo.private ? "Privado" : "Público"}
                        </span>
                      </div>

                      {/* Nome do Projeto */}
                      <h3 className="text-lg font-bold text-[#f3f4f6] group-hover:text-[#3b82f6] transition-colors leading-snug">
                        {repo.name}
                      </h3>

                      {/* Descrição Curta */}
                      <p className="text-[#9ca3af] text-sm mt-2 line-clamp-2 leading-relaxed">
                        {repo.description || "Nenhuma descrição fornecida."}
                      </p>
                    </div>

                    {/* Footer do Card */}
                    <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-xs">
                      {/* Linguagem Badge */}
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: languageColors[repo.language] || languageColors.Default }}
                        />
                        <span className="text-[#d1d5db] font-medium">{repo.language || "Outra"}</span>
                      </div>
                      
                      {/* Botão Ação */}
                      <span className="text-[#3b82f6] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Ver detalhes &rarr;
                      </span>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center">
                <Terminal className="w-12 h-12 text-[#2563eb] mb-4 opacity-50" />
                <p className="text-[#f3f4f6] text-lg font-medium">Nenhum repositório encontrado</p>
                <p className="text-[#9ca3af] text-sm mt-1 max-w-sm">Tente redefinir os filtros de pesquisa para visualizar mais resultados.</p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Todos");
                    setSelectedLanguage("Todas");
                    setVisibilityFilter("Todos");
                  }} 
                  className="mt-6 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl text-xs font-semibold transition-all shadow-lg shadow-[#2563eb]/30"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modal de Detalhes do Projeto */}
      {selectedRepo && (
        <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="relative bg-[#0d1425] border border-[#ffffff]/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Background Decorativo Modal */}
            <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[#2563eb]/10 via-transparent to-transparent pointer-events-none" />

            {/* Header Modal */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between gap-6 relative z-10">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white/5 text-[#9ca3af] border border-white/10 uppercase">
                    {selectedRepo.category}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${selectedRepo.private ? "bg-slate-950/40 text-slate-300 border-slate-800/40" : "bg-blue-950/40 text-blue-300 border-blue-800/40"}`}>
                    {selectedRepo.private ? "Privado" : "Público"}
                  </span>
                  {selectedRepo.stars > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-yellow-950/40 text-yellow-300 border border-yellow-800/40 rounded-md">
                      ⭐ {selectedRepo.stars} Star{selectedRepo.stars > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold mt-3 text-white flex items-center gap-2 leading-none">
                  {selectedRepo.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRepo(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#9ca3af] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Modal */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 relative z-10">
              {/* Descrição Detalhada */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-[#9ca3af] uppercase mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#3b82f6]" />
                  Sobre o Projeto
                </h4>
                <p className="text-[#d1d5db] text-sm leading-relaxed whitespace-pre-line font-light">
                  {selectedRepo.details}
                </p>
              </div>

              {/* Stack de Tecnologias */}
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-[#9ca3af] uppercase mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#3b82f6]" />
                  Tecnologias Utilizadas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRepo.techStack.map((tech) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1 bg-white/5 border border-white/5 hover:border-[#2563eb]/30 text-[#f3f4f6] text-xs font-medium rounded-lg transition-all"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Linguagem Base */}
              <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                <span>Linguagem principal:</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: languageColors[selectedRepo.language] || languageColors.Default }} />
                <span className="text-[#f3f4f6] font-semibold">{selectedRepo.language}</span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-white/5 bg-[#0b0f1a] flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
              <span className="text-xs text-[#9ca3af]">
                Repositório: <code className="text-slate-300 text-[11px] font-mono">{selectedRepo.fullName}</code>
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
                <span className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 text-[#9ca3af] border border-white/10 rounded-xl font-medium text-xs">
                  <Lock className="w-4 h-4" />
                  Repositório Privado
                </span>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Footer Geral */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 text-center text-xs text-[#9ca3af] border-t border-white/5 pt-8">
        <p>&copy; {new Date().getFullYear()} Koszudikas-C. Construído com React, Tailwind CSS e Lucide Icons.</p>
      </footer>

    </div>
  );
}
