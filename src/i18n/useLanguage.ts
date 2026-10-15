import { useState, useEffect, useCallback } from 'react';
import { translations, type Language } from './translations';

const STORAGE_KEY = 'user_language';
const PT_COUNTRIES = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL']);

/**
 * Fallback inteligente e multi-fator para identificar a linguagem do usuário
 * através das preferências do navegador (navigator.languages) e fuso horário do sistema (Intl API).
 */
export function getBrowserLanguageFallback(): Language {
  if (typeof navigator === 'undefined') return 'pt';

  // 1. Array de preferências de idiomas do navegador (navigator.languages)
  const navLanguages: string[] = [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    navLanguages.push(...navigator.languages);
  }
  if (navigator.language) {
    navLanguages.push(navigator.language);
  }
  if ((navigator as any).userLanguage) {
    navLanguages.push((navigator as any).userLanguage);
  }
  if ((navigator as any).browserLanguage) {
    navLanguages.push((navigator as any).browserLanguage);
  }

  // Verifica se o usuário tem preferência por português em qualquer uma das línguas configuradas
  for (const l of navLanguages) {
    if (typeof l === 'string' && l.toLowerCase().startsWith('pt')) {
      return 'pt';
    }
  }

  // 2. Fuso horário / Região do sistema (Intl API)
  // Detecta se a máquina física do usuário está configurada em fusos horários do Brasil, Portugal ou países lusófonos
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/^(America\/(Sao_Paulo|Fortaleza|Recife|Bahia|Belem|Manaus|Cuiaba|Porto_Velho|Boa_Vista|Campo_Grande|Maceio|Araguaina|Santarem|Noronha|Rio_Branco|Eirunepe)|Europe\/Lisbon|Atlantic\/(Madeira|Azores)|Africa\/(Luanda|Maputo|Bissau|Praia|Sao_Tome))/i.test(tz)) {
      return 'pt';
    }
  } catch {
    // Ignora erro de Intl
  }

  return 'en';
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    // 1. Prioridade máxima: Escolha explícita salva pelo usuário no localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'pt' || saved === 'en') {
        return saved;
      }
    } catch {
      // Ignora erro de localStorage
    }

    // Fallback inicial rápido síncrono
    return getBrowserLanguageFallback();
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignora erro de localStorage
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    }
  }, []);

  useEffect(() => {
    // Se o usuário já tiver uma escolha manual salva no localStorage, não precisa consultar IP
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'pt' || saved === 'en') {
        document.documentElement.lang = saved === 'pt' ? 'pt-BR' : 'en';
        return;
      }
    } catch {
      // Continua para detecção por IP
    }

    // Consulta de Geolocalização por IP com Timeout e Fallback resiliente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const detectByIp = async () => {
      // 1. Tentativa primária: get.geojs.io (CORS público irrestrito, sem headers customizados, rápido via Cloudflare)
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/country.json', {
          signal: controller.signal,
          mode: 'cors'
        });
        if (res.ok) {
          const data = await res.json();
          const country = (data.country || '').toUpperCase();
          if (country) {
            const detectedLang: Language = PT_COUNTRIES.has(country) ? 'pt' : 'en';
            setLanguageState(detectedLang);
            document.documentElement.lang = detectedLang === 'pt' ? 'pt-BR' : 'en';
            return;
          }
        }
      } catch {
        // Falha no GeoJS -> Tenta serviço secundário
      }

      // 2. Tentativa secundária: api.country.is (sem headers customizados para evitar preflight OPTIONS)
      try {
        const res = await fetch('https://api.country.is/', {
          signal: controller.signal,
          mode: 'cors'
        });
        if (res.ok) {
          const data = await res.json();
          const country = (data.country || '').toUpperCase();
          if (country) {
            const detectedLang: Language = PT_COUNTRIES.has(country) ? 'pt' : 'en';
            setLanguageState(detectedLang);
            document.documentElement.lang = detectedLang === 'pt' ? 'pt-BR' : 'en';
            return;
          }
        }
      } catch {
        // Falha ou Timeout
      } finally {
        clearTimeout(timeoutId);
      }

      // 3. Fallback garantido por navegador + fuso horário
      const fallbackLang = getBrowserLanguageFallback();
      setLanguageState(fallbackLang);
      document.documentElement.lang = fallbackLang === 'pt' ? 'pt-BR' : 'en';
    };

    detectByIp();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    language,
    setLanguage,
    t: translations[language],
  };
}
