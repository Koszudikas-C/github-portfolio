import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  X
} from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

export type ViewMode = 'tech' | 'business';

interface VersionGatewayModalProps {
  isOpen: boolean;
  onSelectMode: (mode: ViewMode, remember: boolean) => void;
  onClose: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onPlaySound: (freq?: number, duration?: number) => void;
}

export const VersionGatewayModal: React.FC<VersionGatewayModalProps> = ({
  isOpen,
  onSelectMode,
  onClose,
  language,
  onToggleLanguage,
  onPlaySound,
}) => {
  const [remember, setRemember] = useState(true);
  const t = translations[language].gateway;

  // Fecha no ESC caso já tenha uma visualização ativa
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="gateway-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#040711]/92 backdrop-blur-2xl animate-fade-in"
    >
      {/* Luzes de Fundo Ambientais Dinâmicas (Azul Tecnológico na Esquerda, Dourado Executivo na Direita) */}
      <div className="fixed top-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="relative w-full max-w-4xl my-auto bg-gradient-to-b from-[#0c1322] to-[#070b14] border border-slate-700/70 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80 flex flex-col justify-between overflow-hidden">
        
        {/* Barra Superior do Gateway: Badge, Seletor de Idioma e Botão Fechar */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Seletor de Idioma rápido no modal */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  onPlaySound(620, 0.04);
                  onToggleLanguage('pt');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'pt'
                    ? 'bg-blue-600/30 text-[#38bdf8] font-bold border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => {
                  onPlaySound(620, 0.04);
                  onToggleLanguage('en');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-blue-600/30 text-[#38bdf8] font-bold border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            {/* Fechar / Pular */}
            <button
              type="button"
              onClick={() => {
                onPlaySound(440, 0.05);
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={t.skip}
              aria-label={t.skip}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Título e Subtítulo de Orientação */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 id="gateway-title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {t.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Grid com os 2 Cards de Escolha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          
          {/* CARD 1: VISÃO TÉCNICA (Engenharia, Código, Arquitetura) */}
          <div 
            onClick={() => {
              onPlaySound(580, 0.08);
              onSelectMode('tech', remember);
            }}
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-cyan-950/30 hover:-translate-y-1"
          >
            {/* Glow sutil */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[#38bdf8] font-semibold tracking-wider">
                  {t.tech.badge}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                {t.tech.title}
              </h3>
              
              <p className="text-slate-300 text-xs sm:text-sm mt-2.5 leading-relaxed">
                {t.tech.description}
              </p>

              {/* Destaques Técnicos */}
              <div className="mt-5 space-y-2">
                {t.tech.pills.map((pill, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-mono text-slate-200">{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-[#38bdf8] group-hover:underline flex items-center gap-1.5">
                {t.tech.cta}
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-black flex items-center justify-center transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* CARD 2: VISÃO DE NEGÓCIOS (Soluções, Casos de Sucesso, Ganhos & ROI) */}
          <div 
            onClick={() => {
              onPlaySound(640, 0.08);
              onSelectMode('business', remember);
            }}
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-amber-950/30 hover:-translate-y-1"
          >
            {/* Glow sutil */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold tracking-wider">
                  {t.business.badge}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                {t.business.title}
              </h3>
              
              <p className="text-slate-300 text-xs sm:text-sm mt-2.5 leading-relaxed">
                {t.business.description}
              </p>

              {/* Destaques de Negócio */}
              <div className="mt-5 space-y-2">
                {t.business.pills.map((pill, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium text-slate-200">{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 group-hover:underline flex items-center gap-1.5">
                {t.business.cta}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-black flex items-center justify-center transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé do Modal: Checkbox de Lembrar Escolha */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>{t.rememberChoice}</span>
          </label>

          <button
            type="button"
            onClick={() => {
              onPlaySound(440, 0.05);
              onClose();
            }}
            className="text-slate-400 hover:text-slate-200 hover:underline transition-colors cursor-pointer"
          >
            {t.skip} &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
