import { useState, useEffect, useCallback } from 'react';
import { translations, type Language } from './translations';

const STORAGE_KEY = 'user_language';
const PT_COUNTRIES = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL']);

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

    // Fallback inicial rápido pelo idioma do navegador enquanto faz a detecção de IP
    const browserLang = typeof navigator !== 'undefined' 
      ? (navigator.language || (navigator as any).userLanguage || 'pt')
      : 'pt';
    return browserLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
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
    // Se o usuário já tiver uma escolha salva, não precisa consultar IP
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'pt' || saved === 'en') {
        document.documentElement.lang = saved === 'pt' ? 'pt-BR' : 'en';
        return;
      }
    } catch {
      // Continua para IP detection
    }

    // Consulta de Geolocalização por IP com Timeout (AbortController)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const detectByIp = async () => {
      try {
        // Tenta api.country.is (ultra rápida e sem rate limit)
        const res = await fetch('https://api.country.is/', {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        if (res.ok) {
          const data = await res.json();
          const country = (data.country || '').toUpperCase();
          const detectedLang: Language = PT_COUNTRIES.has(country) ? 'pt' : 'en';
          setLanguageState(detectedLang);
          document.documentElement.lang = detectedLang === 'pt' ? 'pt-BR' : 'en';
          return;
        }
      } catch {
        // Timeout ou erro de rede -> Fallback para idioma do navegador
      } finally {
        clearTimeout(timeoutId);
      }

      // Fallback garantido: linguagem do navegador
      try {
        const browserLang = (navigator.language || (navigator as any).userLanguage || 'pt').toLowerCase();
        const fallbackLang: Language = browserLang.startsWith('pt') ? 'pt' : 'en';
        setLanguageState(fallbackLang);
        document.documentElement.lang = fallbackLang === 'pt' ? 'pt-BR' : 'en';
      } catch {
        // Default final
        setLanguageState('pt');
      }
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
