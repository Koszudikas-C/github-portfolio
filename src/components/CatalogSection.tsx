import { useState, useMemo, useEffect, useCallback, memo, useTransition, lazy, Suspense } from 'react';
import { 
  Search, 
  Folder, 
  Code, 
  Database, 
  X, 
  Network
} from 'lucide-react';
import type { Repository } from '../data/repositories';
import { repositories } from '../data/repositories';
import { languageColors, categoryIcons, categoriesList } from '../data/constants';
import { buildSearchIndex, filterIndexedRepositories } from '../utils/searchIndex';

// Pré-computa o índice de busca uma única vez em memória
const indexedRepositories = buildSearchIndex(repositories);

// Carregamento dinâmico do gráfico de distribuição para reduzir o bundle inicial
const LanguageDistributionChart = lazy(() => import('./LanguageDistributionChart'));

// Componente Memoizado: Card individual de Repositório (Zero re-renders ao filtrar ou rolar)
const RepositoryCard = memo(({
  repo,
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
          {((language === 'en' && repo.descriptionEn) ? repo.descriptionEn : repo.description) || (language === 'pt' ? "Nenhuma descrição fornecida." : "No description provided.")}
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

interface CatalogSectionProps {
  language: 'pt' | 'en';
  t: any;
  stats: {
    total: number;
    publicCount: number;
    privateCount: number;
    langData: Array<{ name: string; Quantidade: number; color: string }>;
    categoryCounts: Record<string, number>;
    ecosystemCounts: Record<string, number>;
  };
  selectedEcosystem: string;
  setSelectedEcosystem: (eco: string) => void;
  onSelectRepo: (repo: Repository) => void;
  onPlaySound: (freq?: number, duration?: number) => void;
}

export const CatalogSection = memo(({
  language,
  t,
  stats,
  selectedEcosystem,
  setSelectedEcosystem,
  onSelectRepo,
  onPlaySound,
}: CatalogSectionProps) => {
  // Estado imediato de digitação para 0ms de lag de digitação no input
  const [searchInput, setSearchInput] = useState("");
  // Estado diferido da busca para computação da listagem
  const [activeQuery, setActiveQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Todas");
  const [visibilityFilter, setVisibilityFilter] = useState<"Todos" | "Publicos" | "Privados">("Todos");
  const [sortOrder, setSortOrder] = useState<"default" | "recent" | "oldest">("default");
  
  // Debounce ultra-rápido de 120ms para atualização suave da lista filtrada
  useEffect(() => {
    if (searchInput === activeQuery) return;

    const timer = setTimeout(() => {
      startTransition(() => {
        setActiveQuery(searchInput);
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [searchInput, activeQuery]);

  // Limpeza imediata da busca
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setActiveQuery("");
    onPlaySound(480, 0.05);
  }, [onPlaySound]);

  // Reset de todos os filtros
  const resetAllFilters = useCallback(() => {
    setSearchInput("");
    setActiveQuery("");
    setSelectedCategory("Todos");
    setSelectedLanguage("Todas");
    setSelectedEcosystem("Todos");
    setVisibilityFilter("Todos");
    setSortOrder("default");
    onPlaySound(520, 0.06);
  }, [setSelectedEcosystem, onPlaySound]);

  // Repositórios filtrados com o algoritmo pré-indexado
  const filteredRepos = useMemo(() => {
    return filterIndexedRepositories(indexedRepositories, {
      query: activeQuery,
      category: selectedCategory,
      language: selectedLanguage,
      ecosystem: selectedEcosystem,
      visibility: visibilityFilter,
      sortOrder,
    });
  }, [activeQuery, selectedCategory, selectedLanguage, selectedEcosystem, visibilityFilter, sortOrder]);

  // Callback estável para o gráfico Recharts (evita recálculos de SVG a cada tecla)
  const handleSelectLanguage = useCallback((lang: string) => {
    onPlaySound(500, 0.05);
    setSelectedLanguage((prev) => (prev === lang ? "Todas" : lang));
  }, [onPlaySound]);
  const hasActiveFilters = Boolean(
    searchInput || 
    selectedCategory !== "Todos" || 
    visibilityFilter !== "Todos" || 
    selectedLanguage !== "Todas" || 
    selectedEcosystem !== "Todos"
  );

  return (
    <div className="mt-16 pt-12 border-t border-slate-800/80">
      
      {/* Cabeçalho da Seção */}
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
          
          {/* Campo de Busca Rápido com Feedback Imediato */}
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-3 w-4 h-4 transition-colors ${isPending ? 'text-[#38bdf8] animate-pulse' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder={t.catalog.searchPlaceholder} 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleClearSearch();
              }}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl py-2.5 pl-11 pr-9 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
            />
            {searchInput && (
              <button 
                type="button"
                onClick={handleClearSearch} 
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer transition-colors p-0.5 rounded-md hover:bg-slate-800"
                title={language === 'pt' ? 'Limpar busca' : 'Clear search'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro de Visibilidade */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            <button 
              type="button"
              onClick={() => {
                onPlaySound(440, 0.04);
                setVisibilityFilter("Todos");
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${visibilityFilter === "Todos" ? "bg-[#2563eb] text-white shadow-sm" : "text-slate-300 hover:text-white"}`}
            >
              {t.catalog.filterAll} ({stats.total})
            </button>
            <button 
              type="button"
              onClick={() => {
                onPlaySound(440, 0.04);
                setVisibilityFilter("Publicos");
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${visibilityFilter === "Publicos" ? "bg-[#2563eb] text-white shadow-sm" : "text-slate-300 hover:text-white"}`}
            >
              {t.catalog.filterPublic} ({stats.publicCount})
            </button>
            <button 
              type="button"
              onClick={() => {
                onPlaySound(440, 0.04);
                setVisibilityFilter("Privados");
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${visibilityFilter === "Privados" ? "bg-[#2563eb] text-white shadow-sm" : "text-slate-300 hover:text-white"}`}
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
                  type="button"
                  onClick={() => {
                    onPlaySound(470, 0.04);
                    setSelectedCategory(cat);
                  }}
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

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-[#38bdf8] hover:underline font-medium cursor-pointer ml-auto transition-all"
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
                type="button"
                onClick={() => {
                  onPlaySound(440, 0.04);
                  setSelectedLanguage("Todas");
                }}
                className="text-[11px] text-[#38bdf8] hover:underline cursor-pointer"
              >
                {language === 'pt' ? 'Mostrar todas' : 'Show all'}
              </button>
            )}
          </div>

          {/* Mini Gráfico Recharts Memoizado (Carregado dinamicamente) */}
          <Suspense fallback={<div className="w-full h-14 bg-slate-900/40 rounded-lg animate-pulse" />}>
            <LanguageDistributionChart
              langData={stats.langData}
              selectedLanguage={selectedLanguage}
              totalRepos={stats.total}
              onSelectLanguage={handleSelectLanguage}
              language={language}
            />
          </Suspense>

          {/* Pills de Linguagem */}
          <div className="flex flex-wrap gap-1.5">
            {stats.langData.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  onPlaySound(460, 0.04);
                  setSelectedLanguage((prev) => prev === item.name ? "Todas" : item.name);
                }}
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

      {/* Grade de Repositórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepos.length === 0 ? (
          <div className="col-span-full py-16 text-center glass-card rounded-2xl border border-slate-800">
            <Folder className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-lg">{t.catalog.emptyTitle}</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              {t.catalog.emptyDesc}
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold cursor-pointer transition-all"
            >
              {t.catalog.clearFilters}
            </button>
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <RepositoryCard
              key={`catalog-${repo.id}`}
              repo={repo}
              language={language}
              categoryLabel={t.categories[repo.category as keyof typeof t.categories] || repo.category}
              ecosystemLabel={repo.ecosystem ? (t.ecosystems[repo.ecosystem as keyof typeof t.ecosystems] || repo.ecosystem) : undefined}
              privateBadgeText={t.catalog.card.privateBadge}
              publicBadgeText={t.catalog.card.publicBadge}
              viewDetailsText={language === 'pt' ? 'Ver detalhes' : 'View details'}
              onSelect={onSelectRepo}
              onPlaySound={onPlaySound}
            />
          ))
        )}
      </div>

    </div>
  );
});
