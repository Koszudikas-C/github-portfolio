import React, { memo, useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  DollarSign,
  ChevronRight,
  ExternalLink,
  ZoomIn,
  X
} from 'lucide-react';
import type { Language } from '../i18n/translations';
import cs2Mockup from '../assets/business-cs2-mockup.webp';
import instaflowMockup from '../assets/business-instaflow-mockup.webp';
import purpledecoPreview from '../assets/business-purpledeco-preview.webp';

interface BusinessViewProps {
  language: Language;
  onContactClick: () => void;
  onPlaySound: (freq?: number, duration?: number) => void;
}

interface ModalImageState {
  src: string;
  title: string;
  badge: string;
  badgeColor: string;
  subtitle: string;
  url?: string;
}

export const BusinessView: React.FC<BusinessViewProps> = memo(({
  language,
  onContactClick,
  onPlaySound,
}) => {
  const isPt = language === 'pt';
  const [activeModal, setActiveModal] = useState<ModalImageState | null>(null);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeModal, closeModal]);

  const cases = [
    {
      id: 'purpledeco',
      url: 'https://purpledeco.com.br/',
      image: purpledecoPreview,
      imageType: 'browser' as const,
      imageAlt: isPt ? 'Loja virtual Purple Deco desenvolvida com tema Liquid exclusivo' : 'Purple Deco e-commerce with custom Liquid theme',
      badge: isPt ? 'E-commerce Shopify • Liquid do Zero' : 'Shopify E-commerce • Custom Liquid',
      badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
      title: isPt ? 'Purple Deco: Loja Virtual de Alta Conversão Criada 100% do Zero' : 'Purple Deco: High-Conversion E-commerce Built 100% from Scratch',
      challenge: isPt 
        ? 'Temas prontos e aplicativos pesados da Shopify tornavam o site lento no mobile, derrubando a conversão e gerando altos custos mensais de plugins.'
        : 'Off-the-shelf themes and heavy Shopify plugins caused slow mobile load speeds, hurting conversion rates and adding recurring app costs.',
      solution: isPt
        ? 'Desenvolvimento de tema exclusivo em Liquid nativo, HTML5 e CSS modular (pd-base e purple-fonts), com navegação offcanvas e checkout otimizado.'
        : 'Engineered a bespoke Liquid theme from scratch, with modular CSS, native offcanvas navigation, and zero heavy plugin dependencies.',
      roi: isPt
        ? 'Carregamento instantâneo no celular, economia de centenas de reais em assinaturas de apps e aumento direto na retenção e vendas.'
        : 'Near-instant mobile load times, eliminated monthly app subscription fees, and boosted customer retention.',
      tags: ['Shopify Liquid', 'HTML5 & Vanilla JS', 'Mobile-First', 'https://purpledeco.com.br/']
    },
    {
      id: 'ativobyte',
      image: cs2Mockup,
      imageType: 'mockup3d' as const,
      imageAlt: isPt ? 'Mockup 3D em vidro do terminal de arbitragem financeira Ativo Byte' : '3D glassmorphic mockup of Ativo Byte financial arbitrage suite',
      badge: isPt ? 'Arbitragem & Finanças' : 'Financial Arbitrage & High I/O',
      badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
      title: isPt ? 'Ativo Byte: Plataforma em Tempo Real com Gestão de Margem Líquida' : 'Ativo Byte: Real-Time Platform with Net Margin Intelligence',
      challenge: isPt
        ? 'Monitorar manualmente 7 corretoras de ativos digitais gerava atrasos, perda de margem com taxas ocultas e alto risco cambial.'
        : 'Manually tracking 7 global exchanges caused delays, margin loss to hidden fees, and high currency risk.',
      solution: isPt
        ? 'Motor de alta performance com scraping assíncrono de orderbooks em massa, cálculo de liquidez em milissegundos e alertas instantâneos via SignalR.'
        : 'High-throughput engine scraping massive orderbooks concurrently, computing real net fees in milliseconds with instant SignalR streams.',
      roi: isPt
        ? 'Mitigação de risco em operações financeiras e identificação automática de centenas de oportunidades diárias com até +55% de spread.'
        : 'Zero human error in fee calculations and automatic detection of hundreds of high-margin daily opportunities with up to +55% spread.',
      tags: ['.NET MAUI', 'SignalR', 'Clean Architecture', 'CS2 Ecosystem']
    },
    {
      id: 'instaflow',
      image: instaflowMockup,
      imageType: 'mockup3d' as const,
      imageAlt: isPt ? 'Mockup 3D em vidro do pipeline autônomo InstaFlow com IA de visão' : '3D glassmorphic mockup of InstaFlow autonomous RPA & AI pipeline',
      badge: isPt ? 'Automação RPA & Anti-Detect' : 'RPA & Anti-Detect Automation',
      badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
      title: isPt ? 'InstaFlow: Esteira Autônoma de Contas & Resolução de Captchas' : 'InstaFlow: Autonomous Account Pipeline & Captcha Intelligence',
      challenge: isPt
        ? 'Processos manuais de atendimento e criação de contas eram lentos, bloqueados por captchas e consumiam orçamentos caros de proxies.'
        : 'Manual account setup and customer workflows were slow, constantly flagged by security captchas and wasted expensive proxy bandwidth.',
      solution: isPt
        ? 'Navegador anti-detect (Camoufox) com física de mouse em curvas de Bézier cúbicas, resolução via DeepSeek Vision/Gemini e OTP via Pub/Sub.'
        : 'Anti-detect browser (Camoufox) with cubic Bézier human mouse curves, AI captcha solving via DeepSeek Vision/Gemini, and instant Cloud OTP.',
      roi: isPt
        ? 'Redução de 80% nos custos de proxies residenciais com bloqueador nativo e operação contínua 24/7 sem intervenção manual.'
        : '80% reduction in residential proxy bandwidth costs with built-in adblocking and fully continuous 24/7 autonomous operations.',
      tags: ['Camoufox Anti-Detect', 'DeepSeek Vision', 'Google Cloud Pub/Sub']
    }
  ];

  const steps = [
    {
      number: '01',
      title: isPt ? 'Diagnóstico & Alinhamento' : 'Discovery & Alignment',
      desc: isPt 
        ? 'Entendo a fundo o gargalo ou oportunidade da sua empresa para desenhar a solução ideal sem custos desnecessários.'
        : 'I dive deep into your company bottleneck or opportunity to architect the ideal solution without unnecessary overhead.'
    },
    {
      number: '02',
      title: isPt ? 'Escopo & Cronograma Fechado' : 'Clear Scope & Timeline',
      desc: isPt 
        ? 'Você recebe uma proposta transparente com entregáveis claros, prazos realistas e valores sem surpresas.'
        : 'You receive a transparent proposal with concrete deliverables, realistic deadlines, and no hidden surprises.'
    },
    {
      number: '03',
      title: isPt ? 'Entregas Semanais com Demonstração' : 'Weekly Demos & Transparency',
      desc: isPt 
        ? 'Você acompanha o progresso real toda semana, testa o produto em ambiente de homologação e valida cada etapa.'
        : 'You track real progress every week, test the product in a staging environment, and validate each release.'
    },
    {
      number: '04',
      title: isPt ? 'Lançamento, Suporte & Garantia' : 'Launch, Support & Warranty',
      desc: isPt 
        ? 'Deploy em produção assistido, documentação completa e período de garantia e suporte para sua total tranquilidade.'
        : 'Assisted production deployment, clear documentation, and a warranty/support period for total peace of mind.'
    }
  ];

  return (
    <div className="w-full relative z-10">

      {/* HERO SECTION DE NEGÓCIOS */}
      <section id="business-hero" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          
          {/* Badge de Posicionamento Executivo */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 animate-fade-in shadow-sm shadow-amber-950/40">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>{isPt ? 'Engenharia de Software Focada em Resultados & ROI' : 'Software Engineering Focused on Results & ROI'}</span>
          </div>

          {/* Headline de Negócios */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
            {isPt ? (
              <>
                Transformo desafios de negócio em <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-[#38bdf8]">
                  software de alto impacto
                </span> e automações lucrativas.
              </>
            ) : (
              <>
                Transforming business bottlenecks into <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-[#38bdf8]">
                  high-impact software
                </span> and profitable automations.
              </>
            )}
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {isPt 
              ? 'Desenvolvo plataformas completas, automações com inteligência artificial e integrações de alto rendimento que reduzem custos operacionais e aceleram seu faturamento.'
              : 'I engineer robust web/desktop platforms, AI-driven workflow automations, and high-performance integrations that slash operational costs and accelerate your revenue.'}
          </p>

          {/* Chamadas de Ação (CTAs) Executivas */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                onPlaySound(640, 0.08);
                onContactClick();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isPt ? 'Solicitar Diagnóstico ou Orçamento' : 'Request Discovery / Project Quote'}</span>
            </button>

            <a
              href="#cases"
              onClick={() => onPlaySound(520, 0.04)}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm sm:text-base border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>{isPt ? 'Ver Casos de Sucesso' : 'Explore Case Studies'}</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Métricas de Confiança */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400">33+</span>
              <span className="text-xs text-slate-400 mt-1 block">{isPt ? 'Sistemas & Módulos Criados' : 'Systems & Modules Built'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-cyan-400">100%</span>
              <span className="text-xs text-slate-400 mt-1 block">{isPt ? 'Testado & Auditado' : 'Tested & Audited'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400">24/7</span>
              <span className="text-xs text-slate-400 mt-1 block">{isPt ? 'Automação com IA' : 'AI Automation Uptime'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-rose-400">&lt;100ms</span>
              <span className="text-xs text-slate-400 mt-1 block">{isPt ? 'Tempo de Resposta em I/O' : 'High I/O Response'}</span>
            </div>
          </div>

        </div>
      </section>

      {/* CASOS DE SUCESSO (ESTUDOS DE CASO COM DOR -> SOLUÇÃO -> RETORNO) */}
      <section id="cases" className="py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] text-xs font-semibold tracking-wide uppercase mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isPt ? 'Casos Reais de Engenharia Aplicada' : 'Real-World Applied Engineering'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isPt ? 'Como minhas soluções geram valor para negócios' : 'How my solutions generate tangible business value'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              {isPt 
                ? 'Conheça três ecossistemas desenvolvidos sob medida para resolver problemas concretos de conversão, margem e segurança.'
                : 'Discover three custom ecosystems engineered to solve concrete challenges in conversion, margin, and data security.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {cases.map((c) => (
              <div 
                key={c.id}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-2xl hover:shadow-black/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold border ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all"
                      >
                        <span>{isPt ? 'Ver Loja Online' : 'Visit Live Store'}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
                      </a>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 leading-snug">
                    {c.title}
                  </h3>

                  {/* Visual Mockup Showcase */}
                  {c.imageType === 'browser' ? (
                    <div 
                      onClick={() => {
                        onPlaySound(600, 0.05);
                        setActiveModal({
                          src: c.image,
                          title: c.title,
                          badge: c.badge,
                          badgeColor: c.badgeColor,
                          subtitle: isPt 
                            ? 'Tema Shopify em Liquid nativo projetado do zero para máxima velocidade no mobile e altíssima conversão de vendas.' 
                            : 'Custom Liquid Shopify storefront engineered from scratch for instant mobile load speed and peak sales conversion.',
                          url: c.url
                        });
                      }}
                      className="mb-5 overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/80 group/img relative shadow-lg cursor-pointer transition-all hover:border-purple-500/50 hover:shadow-purple-950/30"
                    >
                      {/* Browser Frame Top Bar */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/90 border-b border-slate-700/70">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="text-[10px] text-slate-300 font-mono ml-2 font-medium">purpledeco.com.br</span>
                        </div>
                        <span className="text-[10px] text-purple-300/80 font-mono flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" />
                          {isPt ? 'Ampliar' : 'Zoom'}
                        </span>
                      </div>
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                        <img 
                          src={c.image} 
                          alt={c.imageAlt}
                          loading="lazy"
                          decoding="async"
                          width="1000"
                          height="562"
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3">
                          <span className="text-xs font-semibold text-white inline-flex items-center gap-1 bg-purple-600/90 px-2.5 py-1 rounded backdrop-blur-sm">
                            <ZoomIn className="w-3.5 h-3.5" />
                            {isPt ? 'Clique para ver detalhes' : 'Click to inspect preview'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        onPlaySound(600, 0.05);
                        setActiveModal({
                          src: c.image,
                          title: c.title,
                          badge: c.badge,
                          badgeColor: c.badgeColor,
                          subtitle: c.id === 'ativobyte'
                            ? (isPt 
                                ? 'Terminal 3D em camadas de vidro: monitoramento em tempo real de 7 exchanges, cálculo de spread líquido (+55.2% ROI) e rotas automáticas de arbitragem.' 
                                : '3D layered glass terminal: real-time multi-exchange orderbook scanner, net fee calculator (+55.2% ROI), and automated arbitrage routing.')
                            : (isPt 
                                ? 'Esteira autônoma de esteiras e inteligência: anti-detect Camoufox com curvas de Bézier, visão IA (DeepSeek/Gemini) para captchas e stream OTP.' 
                                : 'Autonomous pipeline engine: anti-detect Camoufox with human Bézier physics, vision AI captcha resolution, and real-time cloud OTP stream.')
                        });
                      }}
                      className="mb-5 overflow-hidden rounded-xl border border-slate-800/90 bg-gradient-to-b from-slate-900/50 via-slate-950/70 to-slate-900/40 group/img relative shadow-lg p-2 sm:p-3 cursor-pointer transition-all hover:border-slate-700 hover:shadow-cyan-950/20"
                    >
                      <div className="relative aspect-[16/9] w-full flex items-center justify-center overflow-hidden">
                        <img 
                          src={c.image} 
                          alt={c.imageAlt}
                          loading="lazy"
                          decoding="async"
                          width="1000"
                          height="558"
                          className="w-full h-auto max-h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-lg backdrop-blur-[2px]">
                          <span className="text-xs font-semibold text-white inline-flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-full shadow-lg">
                            <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                            {isPt ? 'Clique para ampliar mockup 3D' : 'Click to inspect 3D mockup'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 text-xs sm:text-sm">
                    {/* Desafio */}
                    <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30">
                      <span className="block font-bold text-rose-300 uppercase text-[10px] tracking-wider mb-1">
                        {isPt ? 'O Desafio / Dor:' : 'The Bottleneck:'}
                      </span>
                      <p className="text-slate-300 leading-relaxed">{c.challenge}</p>
                    </div>

                    {/* Solução */}
                    <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/30">
                      <span className="block font-bold text-[#38bdf8] uppercase text-[10px] tracking-wider mb-1">
                        {isPt ? 'A Solução Desenvolvida:' : 'The Solution Built:'}
                      </span>
                      <p className="text-slate-300 leading-relaxed">{c.solution}</p>
                    </div>

                    {/* ROI / Ganho */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-800/40">
                      <span className="block font-bold text-emerald-300 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {isPt ? 'Impacto & Retorno (ROI):' : 'Impact & ROI:'}
                      </span>
                      <p className="text-emerald-100 font-medium leading-relaxed">{c.roi}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {c.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/90 text-slate-300 border border-slate-700/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* METODOLOGIA / COMO TRABALHAMOS */}
      <section id="process" className="py-16 sm:py-24 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isPt ? 'Transparência & Previsibilidade' : 'Transparency & Predictability'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isPt ? 'Processo de desenvolvimento sem surpresas' : 'Development process without guesswork'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              {isPt 
                ? 'Você mantém o controle total de cada etapa com comunicação clara e entregas contínuas.'
                : 'You maintain full control at every phase with clear communication and continuous deliverables.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => (
              <div 
                key={st.number}
                className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-extrabold font-mono text-amber-400/40 block mb-3">
                    {st.number}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Banner de Chamada para Ação Final de Negócios */}
          <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-amber-950/40 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {isPt ? 'Tem um projeto ou gargalo operacional para resolver?' : 'Have a project or operational bottleneck to solve?'}
              </h3>
              <p className="text-sm text-slate-300 mt-2">
                {isPt 
                  ? 'Podemos conversar diretamente sobre a viabilidade, estimativa de investimento e arquitetura ideal sem nenhum compromisso.'
                  : 'We can discuss feasibility, investment estimates, and technical strategy with zero obligation.'}
              </p>
            </div>

            <button
              onClick={() => {
                onPlaySound(640, 0.08);
                onContactClick();
              }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.03] cursor-pointer shrink-0 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isPt ? 'Falar Diretamente com Matheus' : 'Talk Directly with Matheus'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* Lightbox Modal de Visualização Ampliada do Mockup */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/80 flex flex-col items-center max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex flex-col gap-1">
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border w-fit ${activeModal.badgeColor}`}>
                  {activeModal.badge}
                </span>
                <h3 className="text-base sm:text-xl font-bold text-white">
                  {activeModal.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  onPlaySound(440, 0.05);
                  closeModal();
                }}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                aria-label={isPt ? 'Fechar visualização' : 'Close preview'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Image */}
            <div className="w-full my-4 flex items-center justify-center bg-slate-950/60 rounded-xl p-2 sm:p-4 border border-slate-800/80 min-h-[240px]">
              <img 
                src={activeModal.src} 
                alt={activeModal.title}
                className="max-h-[58vh] w-auto max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Modal Footer / Subtitle & Action */}
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {activeModal.subtitle}
              </p>
              {activeModal.url && (
                <a
                  href={activeModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shrink-0 shadow-lg shadow-purple-600/30"
                >
                  <span>{isPt ? 'Acessar Loja Oficial' : 'Visit Live Store'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
});
