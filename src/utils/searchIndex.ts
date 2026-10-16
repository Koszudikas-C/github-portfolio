import type { Repository } from '../data/repositories';

export interface IndexedRepository {
  repo: Repository;
  searchableString: string;
}

/**
 * Remove acentos e converte para minúsculas para busca determinística e rápida.
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Constrói o índice pré-processado para evitar normalizações repetidas a cada tecla digitada.
 */
export function buildSearchIndex(repos: Repository[]): IndexedRepository[] {
  return repos.map((repo) => {
    const rawTokens = [
      repo.name,
      repo.fullName,
      repo.description,
      repo.descriptionEn || '',
      repo.category,
      repo.language,
      repo.ecosystem || '',
      ...(repo.techStack || []),
      ...(repo.highlights || []),
      ...(repo.highlightsEn || []),
      repo.details || '',
      repo.detailsEn || ''
    ].join(' ');

    return {
      repo,
      searchableString: normalizeSearchText(rawTokens)
    };
  });
}

export interface FilterOptions {
  query: string;
  category: string;
  language: string;
  ecosystem: string;
  visibility: 'Todos' | 'Publicos' | 'Privados';
  sortOrder?: 'default' | 'recent' | 'oldest';
}

/**
 * Filtro de alta performance com fail-fast e verificação multi-termo por tokens.
 */
export function filterIndexedRepositories(
  indexed: IndexedRepository[],
  options: FilterOptions
): Repository[] {
  const { query, category, language, ecosystem, visibility, sortOrder = 'default' } = options;

  const normalizedQuery = normalizeSearchText(query.trim());
  const queryTokens = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

  const results: Repository[] = [];
  const len = indexed.length;

  for (let i = 0; i < len; i++) {
    const item = indexed[i];
    const r = item.repo;

    // 1. Categoria (Fail-fast imediato)
    if (category !== 'Todos' && r.category !== category) {
      continue;
    }

    // 2. Visibilidade (Fail-fast booleano)
    if (visibility === 'Publicos' && r.private) {
      continue;
    }
    if (visibility === 'Privados' && !r.private) {
      continue;
    }

    // 3. Linguagem
    if (language !== 'Todas' && r.language !== language) {
      continue;
    }

    // 4. Ecossistema
    if (ecosystem !== 'Todos' && r.ecosystem !== ecosystem) {
      continue;
    }

    // 5. Busca textual por tokens (todos os termos digitados devem bater)
    if (queryTokens.length > 0) {
      let matches = true;
      for (let t = 0; t < queryTokens.length; t++) {
        if (!item.searchableString.includes(queryTokens[t])) {
          matches = false;
          break;
        }
      }
      if (!matches) continue;
    }

    results.push(r);
  }

  // Ordenação se solicitado
  if (sortOrder === 'recent') {
    results.sort((a, b) => b.id - a.id);
  } else if (sortOrder === 'oldest') {
    results.sort((a, b) => a.id - b.id);
  }

  return results;
}

