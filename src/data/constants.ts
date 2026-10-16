import { 
  Cpu, 
  Globe, 
  Database, 
  Lock, 
  BookOpen, 
  Layers 
} from 'lucide-react';

export const languageColors: Record<string, string> = {
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

export const categoryIcons: Record<string, any> = {
  "Todos": Layers,
  "IA, Integração & Automação": Cpu,
  "Web & Front-end": Globe,
  "APIs & Back-end": Database,
  "Blockchain & Cripto": Lock,
  "Estudos & Utilitários": BookOpen
};

export const categoriesList = [
  "Todos",
  "IA, Integração & Automação",
  "Web & Front-end",
  "APIs & Back-end",
  "Blockchain & Cripto",
  "Estudos & Utilitários"
];

export interface SkillItem {
  name: string;
  level: number;
  desc: string;
}

export const skillsDataByLanguage: Record<'pt' | 'en', SkillItem[]> = {
  pt: [
    { name: ".NET 10 & C# 13", level: 95, desc: "Clean Architecture, DDD, CQRS, SignalR" },
    { name: "Rust High-Performance", level: 85, desc: "Streaming I/O, LanceDB, Tract-ONNX, Multithreading" },
    { name: "PHP & APIs RESTful", level: 90, desc: "Arquitetura Desacoplada, JWT, Webhooks (Stripe/Asaas), MySQL" },
    { name: "Angular & React / TS", level: 90, desc: "Control Flow, RxJS, NgZorro, Tailwind, Vitest" },
    { name: "IA Generativa & ONNX", level: 88, desc: "YOLOv11/v26, Gemini API, OpenAI, Calibração Persona" },
    { name: "PostgreSQL & pgvector", level: 90, desc: "Busca Vetorial, SQLite, EF Core, Índices" },
    { name: "Kubernetes (K3s) & DevOps", level: 85, desc: "Dev/Prod Overlays, Shell Script, Docker, CI/CD" },
  ],
  en: [
    { name: ".NET 10 & C# 13", level: 95, desc: "Clean Architecture, DDD, CQRS, SignalR" },
    { name: "Rust High-Performance", level: 85, desc: "Streaming I/O, LanceDB, Tract-ONNX, Multithreading" },
    { name: "PHP & RESTful APIs", level: 90, desc: "Decoupled Architecture, JWT, Webhooks (Stripe/Asaas), MySQL" },
    { name: "Angular & React / TS", level: 90, desc: "Control Flow, RxJS, NgZorro, Tailwind, Vitest" },
    { name: "Generative AI & ONNX", level: 88, desc: "YOLOv11/v26, Gemini API, OpenAI, Persona Calibration" },
    { name: "PostgreSQL & pgvector", level: 90, desc: "Vector Search, SQLite, EF Core, Indexes" },
    { name: "Kubernetes (K3s) & DevOps", level: 85, desc: "Dev/Prod Overlays, Shell Script, Docker, CI/CD" },
  ]
};

export const skillsData = skillsDataByLanguage.pt;

