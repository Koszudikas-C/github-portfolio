import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

// Tooltip customizado de alto contraste para o gráfico de linguagens
const CustomLanguageTooltip = ({ active, payload, totalRepos }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = totalRepos > 0 ? Math.round((data.Quantidade / totalRepos) * 100) : 0;
    return (
      <div className="bg-[#0f172a]/95 border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/60 min-w-[155px]">
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

// Componente Memoizado: Gráfico de Distribuição de Linguagens (Recharts isolado)
export const LanguageDistributionChart = memo(({
  langData,
  selectedLanguage,
  totalRepos,
  onSelectLanguage,
}: {
  langData: Array<{ name: string; Quantidade: number; color: string }>;
  selectedLanguage: string;
  totalRepos: number;
  onSelectLanguage: (lang: string) => void;
}) => {
  return (
    <div className="w-full h-14">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={langData} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip cursor={{ fill: 'rgba(56, 189, 248, 0.12)', radius: 4 }} content={<CustomLanguageTooltip totalRepos={totalRepos} />} />
          <Bar
            dataKey="Quantidade"
            radius={[4, 4, 0, 0]}
            className="cursor-pointer"
            onClick={(data: any) => {
              if (data && data.name) {
                onSelectLanguage(data.name);
              }
            }}
          >
            {langData.map((entry, index) => (
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
  );
});

export default LanguageDistributionChart;

